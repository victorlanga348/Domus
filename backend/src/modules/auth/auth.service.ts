import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  pin: string;
  house_id?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Nome é obrigatório.', 400, 'NAME_REQUIRED');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new AppError('Email válido é obrigatório.', 400, 'INVALID_EMAIL');
    }

    if (!data.password || data.password.length < 6) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres.', 400, 'PASSWORD_TOO_SHORT');
    }

    if (!data.pin || data.pin.length < 4 || data.pin.length > 6) {
      throw new AppError('PIN deve conter entre 4 e 6 dígitos.', 400, 'INVALID_PIN_LENGTH');
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new AppError('Email já cadastrado.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);
    const pin_hash = await bcrypt.hash(data.pin, saltRounds);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password_hash,
        pin_hash,
        house_id: data.house_id ?? null,
        role: 'MEMBER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vacation_mode: true,
        house_id: true,
        created_at: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  async login(data: LoginDTO) {
    if (!data.email || !data.password) {
      throw new AppError('Email e senha são obrigatórios.', 400, 'CREDENTIALS_REQUIRED');
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        house: true,
      },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Credenciais inválidas.', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, houseId: user.house_id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, pin_hash, ...userWithoutSecrets } = user;

    return {
      user: userWithoutSecrets,
      token,
    };
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(pin, user.pin_hash);
    if (!isMatch) {
      throw new AppError('PIN incorreto.', 401, 'INVALID_PIN');
    }

    return true;
  }

  async toggleVacation(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const newVacationState = !user.vacation_mode;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { vacation_mode: newVacationState },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vacation_mode: true,
        house_id: true,
      },
    });

    return updatedUser;
  }
}
