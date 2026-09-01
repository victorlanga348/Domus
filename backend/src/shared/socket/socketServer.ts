import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../../config/env.js';
import { logger } from '../logger/logger.js';
import { prisma } from '../../database/prisma.js';

let io: SocketIOServer | null = null;

interface ConnectedUser {
  socketId: string;
  userId: string;
  name?: string;
  avatar?: string;
}

// Map: houseId -> Map<socketId, ConnectedUser>
const housePresence = new Map<string, Map<string, ConnectedUser>>();
// Map: roomId -> Map<socketId, ConnectedUser>
const roomPresence = new Map<string, Map<string, ConnectedUser>>();

function broadcastHousePresence(houseId: string) {
  if (!io || !houseId) return;
  const houseMap = housePresence.get(houseId);
  const users = houseMap ? Array.from(houseMap.values()) : [];
  const uniqueUserIds = Array.from(new Set(users.map((u) => u.userId)));

  io.to(`house:${houseId}`).emit('house:presence', {
    houseId,
    onlineCount: uniqueUserIds.length,
    onlineUserIds: uniqueUserIds,
    users,
  });
}

function broadcastRoomPresence(roomId: string) {
  if (!io || !roomId) return;
  const roomMap = roomPresence.get(roomId);
  const users = roomMap ? Array.from(roomMap.values()) : [];
  const uniqueUserIds = Array.from(new Set(users.map((u) => u.userId)));

  io.to(`room:${roomId}`).emit('room:presence', {
    roomId,
    onlineCount: uniqueUserIds.length,
    onlineUserIds: uniqueUserIds,
    users,
  });
}

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Morador entra na residência com dados do usuário
    socket.on('house:join', (data: string | { houseId: string; user?: { id: string; name?: string; avatar?: string } }) => {
      const houseId = typeof data === 'string' ? data : data?.houseId;
      const user = typeof data === 'object' ? data?.user : undefined;

      if (houseId) {
        socket.join(`house:${houseId}`);
        logger.info(`[WebSocket] Socket ${socket.id} ingressou na sala house:${houseId}`);

        if (!housePresence.has(houseId)) {
          housePresence.set(houseId, new Map());
        }
        const houseMap = housePresence.get(houseId)!;
        if (user?.id) {
          houseMap.set(socket.id, {
            socketId: socket.id,
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
          });
        }

        broadcastHousePresence(houseId);
      }
    });

    // Morador sai da residência
    socket.on('house:leave', (data: string | { houseId: string }) => {
      const houseId = typeof data === 'string' ? data : data?.houseId;
      if (houseId) {
        socket.leave(`house:${houseId}`);
        const houseMap = housePresence.get(houseId);
        if (houseMap) {
          houseMap.delete(socket.id);
          if (houseMap.size === 0) housePresence.delete(houseId);
        }
        broadcastHousePresence(houseId);
        logger.info(`[WebSocket] Socket ${socket.id} saiu da sala house:${houseId}`);
      }
    });

    // Salas Privadas: Entrada na sala
    socket.on('room:join', (data: { roomId: string; user?: { id: string; name?: string } }) => {
      if (data?.roomId) {
        socket.join(`room:${data.roomId}`);
        logger.info(`[WebSocket] Socket ${socket.id} entrou na sala privada room:${data.roomId}`);

        if (!roomPresence.has(data.roomId)) {
          roomPresence.set(data.roomId, new Map());
        }
        if (data.user?.id) {
          roomPresence.get(data.roomId)!.set(socket.id, {
            socketId: socket.id,
            userId: data.user.id,
            name: data.user.name,
          });
        }
        broadcastRoomPresence(data.roomId);
      }
    });

    // Salas Privadas: Saída da sala
    socket.on('room:leave', (data: { roomId: string }) => {
      if (data?.roomId) {
        socket.leave(`room:${data.roomId}`);
        const roomMap = roomPresence.get(data.roomId);
        if (roomMap) {
          roomMap.delete(socket.id);
          if (roomMap.size === 0) roomPresence.delete(data.roomId);
        }
        broadcastRoomPresence(data.roomId);
      }
    });

    // Evento em tempo real: task:locking
    socket.on('task:locking', async (data: { taskId: string; userId: string; houseId: string }) => {
      try {
        const { taskId, userId, houseId } = data;
        if (!taskId || !userId) return;

        const task = await prisma.task.findUnique({
          where: { id: taskId },
        });

        if (!task || task.status === 'COMPLETED') return;

        // Se já estiver trancada por outro morador e não expirou
        if (task.status === 'LOCKED' && task.locked_by_id !== userId) {
          const lockDurationMs = 45 * 60 * 1000;
          const isExpired = task.locked_at && Date.now() - new Date(task.locked_at).getTime() > lockDurationMs;
          if (!isExpired) {
            socket.emit('task:lock_failed', { taskId, reason: 'Tarefa já trancada por outro morador' });
            return;
          }
        }

        // Atualiza no banco
        const now = new Date();
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'LOCKED',
            locked_by_id: userId,
            locked_at: now,
          },
        });

        // Registra log
        await prisma.activityLog.create({
          data: {
            task_id: taskId,
            user_id: userId,
            house_id: houseId || task.house_id,
            action_type: 'LOCKED',
            comment: 'Iniciou execução em tempo real',
          },
        });

        // Emite para todos na casa
        const targetHouse = houseId || task.house_id;
        io?.to(`house:${targetHouse}`).emit('task:locked', {
          taskId,
          userId,
          lockedAt: now.toISOString(),
        });
      } catch (error) {
        logger.error('[WebSocket] Erro ao processar task:locking', error);
      }
    });

    // Evento em tempo real: task:unlocking
    socket.on('task:unlocking', async (data: { taskId: string; userId: string; houseId: string }) => {
      try {
        const { taskId, userId, houseId } = data;
        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (task && task.locked_by_id === userId && task.status === 'LOCKED') {
          await prisma.task.update({
            where: { id: taskId },
            data: {
              status: 'OPEN',
              locked_by_id: null,
              locked_at: null,
            },
          });

          const targetHouse = houseId || task.house_id;
          io?.to(`house:${targetHouse}`).emit('task:unlocked', { taskId });
        }
      } catch (error) {
        logger.error('[WebSocket] Erro ao processar task:unlocking', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[WebSocket] Cliente desconectado: ${socket.id}`);

      // Remover de todas as residências
      for (const [hId, houseMap] of housePresence.entries()) {
        if (houseMap.has(socket.id)) {
          houseMap.delete(socket.id);
          broadcastHousePresence(hId);
          if (houseMap.size === 0) housePresence.delete(hId);
        }
      }

      // Remover de todas as salas privadas
      for (const [rId, roomMap] of roomPresence.entries()) {
        if (roomMap.has(socket.id)) {
          roomMap.delete(socket.id);
          broadcastRoomPresence(rId);
          if (roomMap.size === 0) roomPresence.delete(rId);
        }
      }
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function emitToHouse(houseId: string, event: string, payload: any): void {
  if (io && houseId) {
    io.to(`house:${houseId}`).emit(event, payload);
  }
}

export function emitToRoom(roomId: string, event: string, payload: any): void {
  if (io && roomId) {
    io.to(`room:${roomId}`).emit(event, payload);
  }
}
