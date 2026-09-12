import { prisma } from '../../database/prisma.js';
import type { HousePreference } from '@prisma/client';

export class PreferencesRepository {
  async findByHouseId(houseId: string): Promise<HousePreference | null> {
    return prisma.housePreference.findUnique({
      where: { house_id: houseId },
    });
  }

  async upsert(houseId: string, data: {
    night_mode?: boolean;
    start_time?: string;
    end_time?: string;
  }): Promise<HousePreference> {
    return prisma.housePreference.upsert({
      where: { house_id: houseId },
      create: {
        house_id: houseId,
        night_mode: data.night_mode ?? true,
        start_time: data.start_time ?? '23:00',
        end_time: data.end_time ?? '07:00',
      },
      update: {
        ...(data.night_mode !== undefined ? { night_mode: data.night_mode } : {}),
        ...(data.start_time !== undefined ? { start_time: data.start_time } : {}),
        ...(data.end_time !== undefined ? { end_time: data.end_time } : {}),
      },
    });
  }
}
