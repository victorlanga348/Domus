import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../../config/env.js';
import { logger } from '../logger/logger.js';
import { prisma } from '../../database/prisma.js';

let io: SocketIOServer | null = null;

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

    // Morador entra na sala da sua residência
    socket.on('house:join', (houseId: string) => {
      if (houseId) {
        socket.join(`house:${houseId}`);
        logger.info(`[WebSocket] Socket ${socket.id} ingressou na sala house:${houseId}`);
      }
    });

    // Morador sai da sala
    socket.on('house:leave', (houseId: string) => {
      if (houseId) {
        socket.leave(`house:${houseId}`);
        logger.info(`[WebSocket] Socket ${socket.id} saiu da sala house:${houseId}`);
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
