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
   * Identifica o participante da vez (ordem alfabética A-Z), aplicando a regra de salto para moradores em férias.
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

    // 1 & 2. Ordenar participantes em ordem alfabética pelo nome (A-Z)
    const sortedUsers: User[] = task.participants
      .map((p) => p.user)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

    const poolSize = sortedUsers.length;
    const baseIndex = ((task.rotation_index % poolSize) + poolSize) % poolSize;

    const skippedOnVacation: User[] = [];
    let chosenUser: User | null = null;
    let effectiveIndex = baseIndex;

    // 3 & 4. Percorrer o pool circular a partir do rotation_index saltando férias
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

    // 5. Retornar o usuário responsável e os metadados do rodízio
    return {
      assignee: chosenUser,
      effectiveIndex,
      poolSize,
      allParticipants: sortedUsers,
      skippedOnVacation,
    };
  }

  /**
   * Conclui a tarefa e avança o rotation_index para o próximo membro elegível da lista alfabética.
   */
  async rotateTask(taskId: string): Promise<{ task: Task; nextAssignee: User }> {
    const nextResult = await this.getNextParticipant(taskId);
    const poolSize = nextResult.poolSize;

    // Próximo índice na fila circular
    const nextRotationIndex = (nextResult.effectiveIndex + 1) % poolSize;

    // Atualiza a tarefa no banco com o novo rotation_index e reseta o lock
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        rotation_index: nextRotationIndex,
        status: 'OPEN',
        locked_at: null,
        locked_by_id: null,
        last_block_reason: null,
      },
    });

    // Calcula quem será o próximo responsável após a rotação
    const subsequentResult = await this.getNextParticipant(taskId);

    return {
      task: updatedTask,
      nextAssignee: subsequentResult.assignee,
    };
  }
}
