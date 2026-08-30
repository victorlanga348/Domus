import { prisma } from '../../database/prisma.js';
import type { ActivityLog, ActionType } from '@prisma/client';

export interface CreateActivityLogInput {
  house_id: string;
  user_id: string;
  action_type: ActionType;
  task_id?: string | null;
  comment?: string | null;
}

export class ActivityLogRepository {
  async create(data: CreateActivityLogInput): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data: {
        house_id: data.house_id,
        user_id: data.user_id,
        action_type: data.action_type,
        task_id: data.task_id,
        comment: data.comment,
      },
    });
  }

  async findByHouseId(houseId: string, limit = 50): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: { house_id: houseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}
