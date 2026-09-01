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

  async listMyHouses(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        house: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                vacation_mode: true,
              },
            },
            _count: {
              select: {
                users: true,
                tasks: true,
                rooms: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.house) return [];

    return [
      {
        id: user.house.id,
        name: user.house.name,
        invite_code: user.house.invite_code,
        created_at: user.house.created_at,
        my_role: user.role,
        members_count: user.house._count.users,
        tasks_count: user.house._count.tasks,
        rooms_count: user.house._count.rooms,
        members: user.house.users,
      },
    ];
  }
}
