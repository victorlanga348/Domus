import { TaskRepository, type CreateTaskInput, type TaskWithDetails } from './tasks.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Task } from '@prisma/client';

export class TaskService {
  constructor(private taskRepo = new TaskRepository()) {}

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

    return this.taskRepo.updateStatus(taskId, 'LOCKED', {
      locked_by_id: userId,
      locked_at: new Date(),
    });
  }

  async completeTask(taskId: string, _userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);

    if (task.status === 'COMPLETED') {
      throw new AppError('Tarefa já foi concluída.', 400, 'TASK_ALREADY_COMPLETED');
    }

    // Avançar rodízio
    const nextIndex = task.participants.length > 0
      ? (task.rotation_index + 1) % task.participants.length
      : 0;

    await this.taskRepo.updateRotationIndex(taskId, nextIndex);

    return this.taskRepo.updateStatus(taskId, 'COMPLETED', {
      locked_by_id: null,
      locked_at: null,
      last_block_reason: null,
    });
  }

  async blockTask(taskId: string, _userId: string, reason: string): Promise<Task> {
    if (!reason || reason.trim() === '') {
      throw new AppError('O motivo do bloqueio é obrigatório.', 400, 'BLOCK_REASON_REQUIRED');
    }

    await this.getTaskById(taskId);

    return this.taskRepo.updateStatus(taskId, 'BLOCKED', {
      locked_by_id: null,
      locked_at: null,
      last_block_reason: reason,
    });
  }
}
