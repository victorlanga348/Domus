import { prisma } from '../../database/prisma.js';
import { logger } from '../logger/logger.js';
import { emitToHouse } from '../socket/socketServer.js';

const LOCK_EXPIRATION_MINUTES = 45;
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export async function unlockExpiredTasks(): Promise<number> {
  try {
    const expirationThreshold = new Date(Date.now() - LOCK_EXPIRATION_MINUTES * 60 * 1000);

    // Buscar tarefas expiradas
    const expiredTasks = await prisma.task.findMany({
      where: {
        status: 'LOCKED',
        locked_at: {
          lt: expirationThreshold,
        },
      },
      select: {
        id: true,
        house_id: true,
        title: true,
      },
    });

    if (expiredTasks.length === 0) {
      return 0;
    }

    logger.info(`[LockTimeoutJob] Destrancando ${expiredTasks.length} tarefa(s) expirada(s)...`);

    for (const task of expiredTasks) {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'OPEN',
          locked_by_id: null,
          locked_at: null,
        },
      });

      // Emite aviso via WebSocket para os membros da residência
      emitToHouse(task.house_id, 'task:unlocked', {
        taskId: task.id,
        reason: 'Tempo limite de execução atingido (45 min)',
      });
    }

    return expiredTasks.length;
  } catch (error) {
    logger.error('[LockTimeoutJob] Erro ao verificar locks expirados', error);
    return 0;
  }
}

export function startLockTimeoutJob(): NodeJS.Timeout {
  logger.info('[LockTimeoutJob] Job de expiração de locks iniciado (intervalo de 5 min).');
  // Executa imediatamente na subida
  unlockExpiredTasks();
  // Agenda recorrência
  return setInterval(unlockExpiredTasks, CHECK_INTERVAL_MS);
}
