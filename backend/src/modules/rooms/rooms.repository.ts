import { prisma } from '../../database/prisma.js';
import type { Room, Participant, Message, Role, Prisma } from '@prisma/client';

export type RoomWithParticipants = Prisma.RoomGetPayload<{
  include: {
    participants: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    _count: {
      select: {
        messages: true;
        participants: true;
      };
    };
  };
}>;

export class RoomRepository {
  /**
   * Cria uma sala e define o criador imediatamente como ARCHITECT via transação.
   */
  async createRoomWithArchitect(data: {
    title: string;
    passwordHash: string;
    creatorUserId: string;
    houseId?: string;
  }): Promise<RoomWithParticipants> {
    return prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          title: data.title,
          password: data.passwordHash,
          house_id: data.houseId ?? null,
        },
      });

      await tx.participant.create({
        data: {
          room_id: room.id,
          user_id: data.creatorUserId,
          role: 'ARCHITECT',
        },
      });

      return tx.room.findUniqueOrThrow({
        where: { id: room.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
              participants: true,
            },
          },
        },
      });
    });
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string): Promise<RoomWithParticipants | null> {
    return prisma.room.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
    });
  }

  async listRooms(houseId?: string): Promise<RoomWithParticipants[]> {
    return prisma.room.findMany({
      where: houseId ? { house_id: houseId } : undefined,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findParticipant(roomId: string, userId: string): Promise<Participant | null> {
    return prisma.participant.findUnique({
      where: {
        user_id_room_id: {
          user_id: userId,
          room_id: roomId,
        },
      },
    });
  }

  async addParticipant(roomId: string, userId: string, role: Role = 'MEMBER'): Promise<Participant> {
    return prisma.participant.create({
      data: {
        room_id: roomId,
        user_id: userId,
        role: role,
      },
    });
  }

  async updateParticipantRole(roomId: string, userId: string, role: Role): Promise<Participant> {
    return prisma.participant.update({
      where: {
        user_id_room_id: {
          user_id: userId,
          room_id: roomId,
        },
      },
      data: {
        role: role,
      },
    });
  }

  async createMessage(roomId: string, userId: string, text: string): Promise<Message> {
    return prisma.message.create({
      data: {
        room_id: roomId,
        user_id: userId,
        text: text,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getMessages(roomId: string, limit = 50) {
    return prisma.message.findMany({
      where: { room_id: roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
      take: limit,
    });
  }
}
