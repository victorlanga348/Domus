import { prisma } from '../../database/prisma.js';
import type { HouseRule } from '@prisma/client';

export class RulesRepository {
  async findByHouseId(houseId: string): Promise<HouseRule[]> {
    return prisma.houseRule.findMany({
      where: { house_id: houseId },
      orderBy: { number: 'asc' },
    });
  }

  async create(data: {
    house_id: string;
    number: number;
    title: string;
    description: string;
  }): Promise<HouseRule> {
    return prisma.houseRule.create({
      data,
    });
  }

  async delete(id: string): Promise<HouseRule> {
    return prisma.houseRule.delete({
      where: { id },
    });
  }
}
