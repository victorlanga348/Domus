import { prisma } from '../../database/prisma.js';

export class MemberStatusesRepository {
  async findByHouseId(houseId: string) {
    return prisma.memberStatus.findMany({
      where: { house_id: houseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async upsertStatus(houseId: string, userId: string, location: string, icon: string) {
    return prisma.memberStatus.upsert({
      where: {
        user_id_house_id: {
          user_id: userId,
          house_id: houseId,
        },
      },
      create: {
        house_id: houseId,
        user_id: userId,
        location,
        icon,
      },
      update: {
        location,
        icon,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }
}
