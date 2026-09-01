import bcrypt from 'bcryptjs';
import { prisma } from '../../database/prisma.js';
import { HouseRepository } from './houses.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { House } from '@prisma/client';

export class HouseService {
  constructor(private houseRepo = new HouseRepository()) {}

  /**
   * 1. createHouse:
   * Cria a casa, gera invite_code único, criptografa a senha com Bcrypt e vincula o usuário como ADMIN (Arquiteto Principal).
   */
  async createHouse(userId: string, houseName: string, housePassword: string) {
    if (!houseName || houseName.trim() === '') {
      throw new AppError('O nome da residência/sala é obrigatório.', 400, 'HOUSE_NAME_REQUIRED');
    }

    if (!housePassword || housePassword.length < 4) {
      throw new AppError('A senha da residência deve ter no mínimo 4 caracteres.', 400, 'PASSWORD_TOO_SHORT');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    if (user.house_id) {
      throw new AppError('Usuário já pertence a uma residência ativa.', 400, 'USER_ALREADY_IN_HOUSE');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(housePassword.trim(), saltRounds);

    // Gerar código de convite único (ex: CASA-4892)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const invite_code = `CASA-${randomCode}`;

    return prisma.$transaction(async (tx) => {
      const house = await tx.house.create({
        data: {
          name: houseName.trim(),
          invite_code,
          password_hash,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          house_id: house.id,
          role: 'ADMIN',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      return {
        house,
        user: updatedUser,
      };
    });
  }

  /**
   * 2. joinHouse:
   * Busca a casa pelo nome, compara a senha via Bcrypt e vincula o usuário como MEMBER.
   */
  async joinHouse(userId: string, houseName: string, housePassword: string) {
    if (!houseName || !housePassword) {
      throw new AppError('Nome e senha da residência são obrigatórios.', 400, 'CREDENTIALS_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    if (user.house_id) {
      throw new AppError('Usuário já pertence a uma residência ativa.', 400, 'USER_ALREADY_IN_HOUSE');
    }

    const house = await prisma.house.findFirst({
      where: {
        name: {
          equals: houseName.trim(),
        },
      },
    });

    if (!house) {
      throw new AppError('Residência não encontrada ou senha incorreta.', 401, 'INVALID_HOUSE_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(housePassword.trim(), house.password_hash);
    if (!isMatch) {
      throw new AppError('Residência não encontrada ou senha incorreta.', 401, 'INVALID_HOUSE_CREDENTIALS');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        house_id: house.id,
        role: 'MEMBER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        house_id: true,
      },
    });

    return {
      house,
      user: updatedUser,
    };
  }

  async getHouseById(id: string): Promise<House> {
    const house = await this.houseRepo.findById(id);
    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }
    return house;
  }

  async lookupHouseByCode(inviteCode: string) {
    const house = await this.houseRepo.findByInviteCode(inviteCode);
    if (!house) {
      throw new AppError('Código de residência inválido.', 404, 'HOUSE_CODE_INVALID');
    }
    return house;
  }

  /**
   * 3. listMyHouses:
   * Lista as residências associadas ao usuário autenticado.
   */
  async listMyHouses(userId: string) {
    if (!userId) {
      return [];
    }
    return this.houseRepo.listMyHouses(userId);
  }

  /**
   * 4. switchHouse:
   * Alterna a residência ativa do usuário sem necessitar de novo login.
   */
  async switchHouse(userId: string, targetHouseId: string) {
    const house = await this.houseRepo.findById(targetHouseId);
    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        house_id: targetHouseId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        house_id: true,
      },
    });

    return {
      house,
      user: updatedUser,
    };
  }

  /**
   * 5. leaveHouse:
   * Remove o vínculo da residência atual mantendo o morador autenticado.
   */
  async leaveHouse(userId: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        house_id: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        house_id: true,
      },
    });

    return {
      user: updatedUser,
    };
  }
}
