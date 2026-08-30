import { prisma } from '../../database/prisma.js';
import type { House } from '@prisma/client';

export interface CreateHouseInput {
  name: string;
  invite_code: string;
}

export class HouseRepository {
  async create(data: CreateHouseInput): Promise<House> {
    return prisma.house.create({
      data: {
        name: data.name,
        invite_code: data.invite_code,
      },
    });
  }

  async findById(id: string): Promise<House | null> {
    return prisma.house.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  async findByInviteCode(inviteCode: string): Promise<House | null> {
    return prisma.house.findUnique({
      where: { invite_code: inviteCode },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            vacation_mode: true,
          },
        },
      },
    });
  }
}
