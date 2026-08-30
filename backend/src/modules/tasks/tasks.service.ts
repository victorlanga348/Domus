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
   * Valida o PIN do usuário, registra ActivityLog COMPLETED e chama advanceRotation.
   */
  async completeTask(
    taskId: string,
    userId: string,
    pin?: string
  ): Promise<{ task: Task; nextAssignee: User }> {
    const task = await this.getTaskById(taskId);

    if (task.status === 'COMPLETED') {
      throw new AppError('Tarefa já foi concluída.', 400, 'TASK_ALREADY_COMPLETED');
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

    // Chama o RotationService para avançar o índice e resetar o status da tarefa
    return this.rotationService.rotateTask(taskId);
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
}
