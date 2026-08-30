import { prisma } from '../../database/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { User, Task } from '@prisma/client';

export interface NextParticipantResult {
  assignee: User;
  effectiveIndex: number;
  poolSize: number;
  allParticipants: User[];
  skippedOnVacation: User[];
}

export class RotationService {
  /**
   * 1. getCurrentResponsible:
   * Busca a tarefa e seus participantes, ordena por nome (A-Z) e retorna o participante no rotation_index atual.
   * Regra Crítica: Se o participante estiver em vacation_mode: true, busca o próximo da lista até encontrar alguém ativo.
   */
  async getCurrentResponsible(taskId: string): Promise<User> {
    const result = await this.getNextParticipant(taskId);
    return result.assignee;
  }

  /**
   * Identifica o participante da vez com ordenação A-Z e salto de férias.
   */
  async getNextParticipant(taskId: string): Promise<NextParticipantResult> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada.', 404, 'TASK_NOT_FOUND');
    }

    if (task.participants.length === 0) {
      throw new AppError('Nenhum participante vinculado a esta tarefa.', 400, 'NO_PARTICIPANTS');
    }

    // 1 & 2. Ordenar participantes por nome (A-Z)
    const sortedUsers: User[] = task.participants
      .map((p) => p.user)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

    const poolSize = sortedUsers.length;
    const baseIndex = ((task.rotation_index % poolSize) + poolSize) % poolSize;

    const skippedOnVacation: User[] = [];
    let chosenUser: User | null = null;
    let effectiveIndex = baseIndex;

    // 3 & 4. Busca pelo participante ativo (salto circular de férias)
    for (let step = 0; step < poolSize; step++) {
      const checkIndex = (baseIndex + step) % poolSize;
      const candidate = sortedUsers[checkIndex];

      if (!candidate.vacation_mode) {
        chosenUser = candidate;
        effectiveIndex = checkIndex;
        break;
      } else {
        skippedOnVacation.push(candidate);
      }
    }

    if (!chosenUser) {
      throw new AppError(
        'Todos os participantes vinculados a esta tarefa estão em modo férias.',
        400,
        'ALL_PARTICIPANTS_ON_VACATION'
      );
    }

    return {
      assignee: chosenUser,
      effectiveIndex,
      poolSize,
      allParticipants: sortedUsers,
      skippedOnVacation,
    };
  }

  /**
   * 2. advanceRotation:
   * Calcula o próximo índice na fila circular (se for o último, volta para 0) e atualiza o rotation_index no banco.
   */
  async advanceRotation(taskId: string): Promise<Task> {
    const nextResult = await this.getNextParticipant(taskId);
    const poolSize = nextResult.poolSize;

    const nextRotationIndex = (nextResult.effectiveIndex + 1) % poolSize;

    return prisma.task.update({
      where: { id: taskId },
      data: {
        rotation_index: nextRotationIndex,
        status: 'OPEN',
        locked_at: null,
        locked_by_id: null,
        last_block_reason: null,
      },
    });
  }

  /**
   * Rotação completa da tarefa retornando o próximo responsável.
   */
  async rotateTask(taskId: string): Promise<{ task: Task; nextAssignee: User }> {
    const updatedTask = await this.advanceRotation(taskId);
    const subsequentResult = await this.getNextParticipant(taskId);

    return {
      task: updatedTask,
      nextAssignee: subsequentResult.assignee,
    };
  }
}
