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

  async updateInviteCode(id: string, newInviteCode: string): Promise<House> {
    return prisma.house.update({
      where: { id },
      data: { invite_code: newInviteCode },
    });
  }

  async delete(id: string): Promise<House> {
    return prisma.house.delete({
      where: { id },
    });
  }

  async listMyHouses(userId: string): Promise<any[]> {
    if (!userId) return [];

    // 1. Buscar todas as residências associadas via HouseMember
    const memberships = await prisma.houseMember.findMany({
      where: { user_id: userId },
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
      orderBy: { created_at: 'desc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { house_id: true, role: true, vacation_mode: true },
    });

    if (memberships.length > 0) {
      return memberships.map((m) => ({
        id: m.house.id,
        name: m.house.name,
        invite_code: m.house.invite_code,
        created_at: m.house.created_at,
        my_role: m.role,
        vacation_mode: m.vacation_mode,
        is_active: user?.house_id === m.house.id,
        members_count: m.house._count.users || m.house.users.length,
        tasks_count: m.house._count.tasks,
        rooms_count: m.house._count.rooms,
        members: m.house.users,
      }));
    }

    // Fallback retrocompatível caso ainda não haja vínculos em house_members
    if (!user || !user.house_id) return [];

    const activeHouse = await prisma.house.findUnique({
      where: { id: user.house_id },
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
    });

    if (!activeHouse) return [];

    // Cria o registro retroativo
    await prisma.houseMember
      .upsert({
        where: { user_id_house_id: { user_id: userId, house_id: activeHouse.id } },
        update: {},
        create: {
          user_id: userId,
          house_id: activeHouse.id,
          role: user.role,
          vacation_mode: user.vacation_mode,
        },
      })
      .catch(() => {});

    return [
      {
        id: activeHouse.id,
        name: activeHouse.name,
        invite_code: activeHouse.invite_code,
        created_at: activeHouse.created_at,
        my_role: user.role,
        vacation_mode: user.vacation_mode,
        is_active: true,
        members_count: activeHouse._count.users,
        tasks_count: activeHouse._count.tasks,
        rooms_count: activeHouse._count.rooms,
        members: activeHouse.users,
      },
    ];
  }
}
