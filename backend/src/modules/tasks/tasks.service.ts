import bcrypt from 'bcryptjs';
import { prisma } from '../../database/prisma.js';
import { TaskRepository, type CreateTaskInput, type TaskWithDetails } from './tasks.repository.js';
import { RotationService } from './tasks.rotation.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Task, User } from '@prisma/client';

export class TaskService {
  constructor(
    private taskRepo = new TaskRepository(),
    private rotationService = new RotationService()
  ) {}

  async createTask(data: CreateTaskInput): Promise<TaskWithDetails> {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('O título da tarefa é obrigatório.', 400, 'TASK_TITLE_REQUIRED');
    }
    return this.taskRepo.create(data);
  }

  async getTaskById(id: string): Promise<TaskWithDetails> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      throw new AppError('Tarefa não encontrada.', 404, 'TASK_NOT_FOUND');
    }
    return task;
  }

  async getNextAssignee(taskId: string): Promise<User> {
    const result = await this.rotationService.getNextParticipant(taskId);
    return result.assignee;
  }

  async getHouseTasks(houseId: string): Promise<TaskWithDetails[]> {
    return this.taskRepo.findByHouseId(houseId);
  }

  async lockTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);

    if (task.status === 'COMPLETED') {
      throw new AppError('Tarefa já foi concluída.', 400, 'TASK_ALREADY_COMPLETED');
    }

    if (task.status === 'LOCKED') {
      const lockDurationMs = 45 * 60 * 1000;
      const isExpired = task.locked_at && Date.now() - new Date(task.locked_at).getTime() > lockDurationMs;

      if (!isExpired && task.locked_by_id !== userId) {
        throw new AppError('Tarefa está em execução por outro morador.', 409, 'TASK_ALREADY_LOCKED');
      }
    }

    // Registra log de lock
    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'LOCKED',
        comment: 'Iniciou execução da tarefa',
      },
    });

    return this.taskRepo.updateStatus(taskId, 'LOCKED', {
      locked_by_id: userId,
      locked_at: new Date(),
    });
  }

  /**
   * 1. completeTask (Sistema de 3 Vias):
   * Valida autorização (apenas morador designado ou da vez no rodízio),
   * valida PIN caso fornecido, registra ActivityLog COMPLETED e atualiza o status.
   */
  async completeTask(
    taskId: string,
    userId: string,
    pin?: string
  ): Promise<{ task: Task; nextAssignee?: User | null }> {
    const task = await this.getTaskById(taskId);

    if (task.status === 'COMPLETED') {
      throw new AppError('Tarefa já foi concluída.', 400, 'TASK_ALREADY_COMPLETED');
    }

    // Trava de segurança: apenas a pessoa designada para esta tarefa pode marcá-la como concluída
    let idResponsavelValido: string;
    if (task.participants && task.participants.length > 1) {
      const responsible = await this.rotationService.getCurrentResponsible(taskId);
      idResponsavelValido = responsible.id;
    } else if (task.participants && task.participants.length === 1) {
      idResponsavelValido = task.participants[0].user_id;
    } else {
      idResponsavelValido = task.creator_id;
    }

    if (idResponsavelValido !== userId) {
      throw new AppError(
        'Apenas a pessoa designada para esta tarefa pode marcá-la como concluída.',
        403,
        'FORBIDDEN_TASK_COMPLETION'
      );
    }

    // Validação de PIN caso fornecido
    if (pin) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
      }
      const isPinValid = await bcrypt.compare(pin.trim(), user.pin_hash);
      if (!isPinValid) {
        throw new AppError('PIN incorreto.', 401, 'INVALID_PIN');
      }
    }

    // Registra o ActivityLog como COMPLETED
    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'COMPLETED',
        comment: 'Tarefa concluída com sucesso',
      },
    });

    // Se for tarefa de rodízio, avança o índice para a próxima rodada
    let nextAssignee: User | null = null;
    let nextRotationIndex = task.rotation_index;

    if (task.participants && task.participants.length > 1) {
      const nextResult = await this.rotationService.getNextParticipant(taskId);
      const poolSize = nextResult.poolSize;
      nextRotationIndex = (nextResult.effectiveIndex + 1) % poolSize;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        rotation_index: nextRotationIndex,
        locked_by_id: userId,
        locked_at: new Date(),
      },
    });

    if (task.participants && task.participants.length > 1) {
      try {
        const subsequent = await this.rotationService.getNextParticipant(taskId);
        nextAssignee = subsequent.assignee;
      } catch {}
    }

    return {
      task: updatedTask,
      nextAssignee,
    };
  }

  /**
   * revertTask:
   * Reverte uma tarefa concluída para status OPEN.
   * Trava de segurança: apenas o Admin Geral e Sub-Admins têm permissão para reverter.
   */
  async revertTask(taskId: string, userId: string, userRole?: string): Promise<Task> {
    const task = await this.getTaskById(taskId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const role = userRole || user.role;
    const isGeneralAdmin = user.role === 'ADMIN' || role === 'ADMIN_GERAL' || role === 'Admin Geral';
    const isSubAdmin = role === 'SUB_ADMIN' || role === 'Admin';

    if (!isGeneralAdmin && !isSubAdmin) {
      throw new AppError(
        'Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída.',
        403,
        'FORBIDDEN_TASK_REVERT'
      );
    }

    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'ROTATED',
        comment: `Tarefa "${task.title}" foi revertida para pendente por ${user.name}`,
      },
    });

    return this.taskRepo.revertStatus(taskId);
  }

  /**
   * 2. blockTask (Sistema de 3 Vias):
   * Muda o status da tarefa para BLOCKED, salva o last_block_reason e registra ActivityLog BLOCKED.
   */
  async blockTask(taskId: string, userId: string, reason: string): Promise<Task> {
    if (!reason || reason.trim() === '') {
      throw new AppError('O motivo do bloqueio é obrigatório.', 400, 'BLOCK_REASON_REQUIRED');
    }

    const task = await this.getTaskById(taskId);

    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'BLOCKED',
        comment: reason.trim(),
      },
    });

    return this.taskRepo.updateStatus(taskId, 'BLOCKED', {
      locked_by_id: null,
      locked_at: null,
      last_block_reason: reason.trim(),
    });
  }

  /**
   * 3. failTask (Sistema de 3 Vias):
   * Registra como FAILED, mas NÃO roda o índice (o morador mantém a responsabilidade até concluir ou ser bloqueada).
   */
  async failTask(taskId: string, userId: string, comment = 'Tarefa não foi realizada'): Promise<Task> {
    const task = await this.getTaskById(taskId);

    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'FAILED',
        comment: comment.trim(),
      },
    });

    return this.taskRepo.updateStatus(taskId, 'OPEN', {
      locked_by_id: null,
      locked_at: null,
    });
  }

  /**
   * 4. deleteTask:
   * Apenas o ADMIN (Arquiteto) ou o criador da tarefa pode excluí-la.
   */
  async deleteTask(taskId: string, userId: string, userRole?: string): Promise<void> {
    const task = await this.getTaskById(taskId);

    const isAdmin = userRole === 'ADMIN';
    const isCreator = task.creator_id === userId;

    if (!isAdmin && !isCreator) {
      throw new AppError(
        'Permissão negada: apenas o Arquiteto (ADMIN) ou o criador da tarefa pode excluí-la.',
        403,
        'UNAUTHORIZED_TASK_DELETION'
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  }

  /**
   * 5. requestSwap:
   * Solicita troca de turno para outros participantes do pool.
   */
  async requestSwap(taskId: string, userId: string, reason?: string) {
    const task = await this.getTaskById(taskId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    return {
      taskId: task.id,
      taskTitle: task.title,
      requesterId: user.id,
      requesterName: user.name,
      reason: reason || 'Solicitação de troca de escala',
      participants: task.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
      })),
    };
  }
}
