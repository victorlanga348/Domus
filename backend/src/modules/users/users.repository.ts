import { prisma } from '../../database/prisma.js';
import type { User } from '@prisma/client';

export interface CreateUserInput {
  name: string;
  email: string;
  password_hash: string;
  pin_hash: string;
  house_id: string;
  vacation_mode?: boolean;
}

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
        pin_hash: data.pin_hash,
        house_id: data.house_id,
        vacation_mode: data.vacation_mode ?? false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        house: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByHouseId(houseId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { house_id: houseId },
      orderBy: { name: 'asc' },
    });
  }

  async updateVacationMode(id: string, vacation_mode: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { vacation_mode },
    });
  }

  async findParticipantsByIds(ids: string[]): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      orderBy: { name: 'asc' },
    });
  }
}
