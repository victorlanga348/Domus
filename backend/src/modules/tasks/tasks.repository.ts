import { prisma } from '../../database/prisma.js';
import type { Task, Shift, Frequency, TaskStatus, Prisma } from '@prisma/client';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  shift: Shift;
  frequency?: Frequency;
  creator_id: string;
  house_id: string;
  participant_ids: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  shift?: Shift;
  frequency?: Frequency;
  participant_ids?: string[];
  rotation_index?: number;
}

export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    participants: {
      include: {
        user: true;
      };
    };
    locked_by: true;
    creator: true;
  };
}>;

export class TaskRepository {
  async create(data: CreateTaskInput): Promise<TaskWithDetails> {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: data.title,
          description: data.description,
          shift: data.shift,
          frequency: data.frequency ?? 'DAILY',
          creator_id: data.creator_id,
          house_id: data.house_id,
          status: 'OPEN',
          rotation_index: 0,
        },
      });

      if (data.participant_ids.length > 0) {
        await tx.taskParticipant.createMany({
          data: data.participant_ids.map((userId) => ({
            task_id: task.id,
            user_id: userId,
          })),
        });
      }

      return tx.task.findUniqueOrThrow({
        where: { id: task.id },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          locked_by: true,
          creator: true,
        },
      });
    });
  }

  async findById(id: string): Promise<TaskWithDetails | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        locked_by: true,
        creator: true,
      },
    });
  }

  async findByHouseId(houseId: string): Promise<TaskWithDetails[]> {
    return prisma.task.findMany({
      where: { house_id: houseId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        locked_by: true,
        creator: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByHouse(houseId: string): Promise<TaskWithDetails[]> {
    return this.findByHouseId(houseId);
  }

  async findActiveTasksByShift(houseId: string, shift: Shift): Promise<TaskWithDetails[]> {
    return prisma.task.findMany({
      where: {
        house_id: houseId,
        shift: shift,
        status: {
          not: 'COMPLETED',
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        locked_by: true,
        creator: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    details?: {
      locked_by_id?: string | null;
      locked_at?: Date | null;
      last_block_reason?: string | null;
    }
  ): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        status,
        ...(details?.locked_by_id !== undefined && { locked_by_id: details.locked_by_id }),
        ...(details?.locked_at !== undefined && { locked_at: details.locked_at }),
        ...(details?.last_block_reason !== undefined && { last_block_reason: details.last_block_reason }),
      },
    });
  }

  async updateRotationIndex(id: string, rotation_index: number): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: { rotation_index },
    });
  }

  async revertStatus(id: string): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        status: 'OPEN',
        locked_by_id: null,
        locked_at: null,
        last_block_reason: null,
      },
    });
  }

  async update(id: string, data: UpdateTaskInput): Promise<TaskWithDetails> {
    return prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.shift !== undefined && { shift: data.shift }),
          ...(data.frequency !== undefined && { frequency: data.frequency }),
          ...(data.rotation_index !== undefined && { rotation_index: data.rotation_index }),
        },
      });

      if (data.participant_ids !== undefined) {
        await tx.taskParticipant.deleteMany({
          where: { task_id: id },
        });

        if (data.participant_ids.length > 0) {
          await tx.taskParticipant.createMany({
            data: data.participant_ids.map((userId) => ({
              task_id: id,
              user_id: userId,
            })),
          });
        }
      }

      return tx.task.findUniqueOrThrow({
        where: { id },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          locked_by: true,
          creator: true,
        },
      });
    });
  }
}
