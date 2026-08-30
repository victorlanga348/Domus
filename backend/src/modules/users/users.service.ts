import { UserRepository, type CreateUserInput } from './users.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { User } from '@prisma/client';

export class UserService {
  constructor(private userRepo = new UserRepository()) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email já cadastrado.', 409, 'EMAIL_ALREADY_EXISTS');
    }
    return this.userRepo.create(data);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  async getHouseUsers(houseId: string): Promise<User[]> {
    return this.userRepo.findByHouseId(houseId);
  }

  async toggleVacationMode(id: string, vacationMode: boolean): Promise<User> {
    await this.getUserById(id);
    return this.userRepo.updateVacationMode(id, vacationMode);
  }
}
