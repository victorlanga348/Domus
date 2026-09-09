import bcrypt from 'bcryptjs';
import { prisma } from '../../database/prisma.js';
import { TaskRepository, type CreateTaskInput, type UpdateTaskInput, type TaskWithDetails } from './tasks.repository.js';
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
    if (houseId) {
      try {
        await this.processDailyExpirations(houseId);
      } catch {}
    }
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
    pin?: string,
    userRole?: string
  ): Promise<{ task: Task; nextAssignee?: User | null }> {
    const task = await this.getTaskById(taskId);

    if (task.status === 'COMPLETED') {
      throw new AppError('Tarefa já foi concluída.', 400, 'TASK_ALREADY_COMPLETED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const role = userRole || user.role;
    const isGeneralAdmin = user.role === 'ADMIN' || role === 'ADMIN_GERAL' || role === 'Admin Geral';

    // Trava de segurança: apenas a pessoa designada para esta tarefa ou o Admin Geral pode marcá-la como concluída
    let idResponsavelValido: string;
    if (task.participants && task.participants.length > 1) {
      const responsible = await this.rotationService.getCurrentResponsible(taskId);
      idResponsavelValido = responsible.id;
    } else if (task.participants && task.participants.length === 1) {
      idResponsavelValido = task.participants[0].user_id;
    } else {
      idResponsavelValido = task.creator_id;
    }

    if (idResponsavelValido !== userId && !isGeneralAdmin) {
      throw new AppError(
        'Apenas a pessoa designada para esta tarefa ou o Admin Geral pode marcá-la como concluída.',
        403,
        'FORBIDDEN_TASK_COMPLETION'
      );
    }

    // Validação de PIN caso fornecido
    if (pin) {
      const isPinValid = await bcrypt.compare(pin.trim(), user.pin_hash);
      if (!isPinValid) {
        throw new AppError('PIN incorreto.', 401, 'INVALID_PIN');
      }
    }

    const logComment = isGeneralAdmin && idResponsavelValido !== userId
      ? `${user.name} (Admin Geral) concluiu a tarefa "${task.title}"`
      : `${user.name} concluiu a tarefa "${task.title}"`;

    // Registra o ActivityLog como COMPLETED
    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'COMPLETED',
        comment: logComment,
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
   * rotateTask:
   * Avança a escala de rodízio da tarefa.
   * Trava de segurança: apenas o morador que atualmente detém a vez ativa pode girar a escala.
   */
  async rotateTask(
    taskId: string,
    userId: string
  ): Promise<{ task: Task; nextAssignee: User }> {
    const task = await this.getTaskById(taskId);

    if (!userId) {
      throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED');
    }

    // Trava de segurança: apenas a pessoa designada / da vez pode girar o rodízio
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
        'Apenas a pessoa da vez no rodízio pode girar a escala.',
        403,
        'FORBIDDEN_TASK_ROTATION'
      );
    }

    const { task: updatedTask, nextAssignee } = await this.rotationService.rotateTask(taskId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'ROTATED',
        comment: `${user?.name || 'Morador'} girou a escala de rodízio da tarefa "${task.title}"`,
      },
    });

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

  /**
   * 6. updateTask:
   * Edita os parâmetros e/ou participantes da tarefa de rodízio.
   * Regras estritas:
   * 1. Apenas o Admin Geral e Sub-Admins têm permissão (403 para moradores comuns).
   * 2. Preserva a escala de rotação sem quebras:
   *    - Se o morador da vez atual permanecer no pool, o rotation_index é recalculado para sua nova posição A-Z.
   *    - Se o morador da vez atual for removido, o rotation_index aponta para o próximo sucessor na ordem da fila.
   * 3. Registra auditoria em ActivityLog e retorna a tarefa atualizada com o próximo responsável.
   */
  async updateTask(
    taskId: string,
    userId: string,
    userRole: string | undefined,
    data: UpdateTaskInput
  ): Promise<{ task: TaskWithDetails; nextAssignee: User | null }> {
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
        'Apenas o Admin Geral e Sub-Admins têm permissão para editar tarefas de rodízio.',
        403,
        'FORBIDDEN_TASK_UPDATE'
      );
    }

    // 1. Identificar quem detém a vez atualmente antes da alteração
    let currentAssigneeId: string | null = null;
    if (task.participants && task.participants.length > 0) {
      try {
        const currentResp = await this.rotationService.getCurrentResponsible(taskId);
        currentAssigneeId = currentResp.id;
      } catch {
        currentAssigneeId = null;
      }
    }

    let nextRotationIndex = task.rotation_index;

    // 2. Se participant_ids foi fornecido, calcula a preservação matemática do turno
    if (data.participant_ids && Array.isArray(data.participant_ids)) {
      if (data.participant_ids.length > 0) {
        const newUsers = await prisma.user.findMany({
          where: { id: { in: data.participant_ids } },
        });

        // Ordenação canônica A-Z
        const sortedNewUsers = [...newUsers].sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        );

        if (currentAssigneeId && sortedNewUsers.some((u) => u.id === currentAssigneeId)) {
          // O morador da vez continua no pool: manter a sua vez no novo índice ordenado
          const newIdx = sortedNewUsers.findIndex((u) => u.id === currentAssigneeId);
          nextRotationIndex = newIdx >= 0 ? newIdx : 0;
        } else if (currentAssigneeId) {
          // O morador da vez foi removido: encontrar quem era o sucessor imediato na lista antiga
          const prevSorted = task.participants
            .map((p) => p.user)
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
          const prevIdx = prevSorted.findIndex((u) => u.id === currentAssigneeId);

          let nextUserInLine: User | null = null;
          for (let step = 1; step < prevSorted.length; step++) {
            const candidate = prevSorted[(prevIdx + step) % prevSorted.length];
            if (sortedNewUsers.some((u) => u.id === candidate.id)) {
              nextUserInLine = candidate;
              break;
            }
          }

          if (nextUserInLine) {
            nextRotationIndex = sortedNewUsers.findIndex((u) => u.id === nextUserInLine.id);
          } else {
            nextRotationIndex = 0;
          }
        } else {
          nextRotationIndex = 0;
        }
      } else {
        nextRotationIndex = 0;
      }
    }

    // 3. Persiste a alteração atômica
    const updatedTask = await this.taskRepo.update(taskId, {
      ...data,
      rotation_index: nextRotationIndex,
    });

    // 4. Registra histórico de auditoria
    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'ROTATED',
        comment: `${user.name} atualizou a escala de rodízio da tarefa "${updatedTask.title}"`,
      },
    });

    // 5. Calcula o próximo responsável ativo considerando salto de férias
    let nextAssignee: User | null = null;
    if (updatedTask.participants && updatedTask.participants.length > 0) {
      try {
        const nextResult = await this.rotationService.getNextParticipant(taskId);
        nextAssignee = nextResult.assignee;
      } catch {
        nextAssignee = null;
      }
    }

    return {
      task: updatedTask,
      nextAssignee,
    };
  }

  /**
   * processDailyExpirations (Ciclo Diário de Tarefas & Rodízio Opção A):
   * Verifica tarefas diárias cujo ciclo anterior não foi concluído.
   * - Registra FALHA (FAILED) no histórico do morador inadimplente.
   * - Para tarefas de rodízio (Opção A): avança imediatamente para o próximo da fila.
   * - Para tarefas direcionadas: restaura como OPEN para o novo dia.
   */
  async processDailyExpirations(houseId: string): Promise<{ expiredCount: number; advancedRotations: string[] }> {
    if (!houseId) return { expiredCount: 0, advancedRotations: [] };

    const tasks = await this.taskRepo.findByHouseId(houseId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let expiredCount = 0;
    const advancedRotations: string[] = [];

    for (const task of tasks) {
      if (task.frequency !== 'DAILY') continue;

      const updatedAt = new Date(task.updated_at);
      const isFromPreviousDay = updatedAt < startOfToday;

      if (isFromPreviousDay && task.status !== 'COMPLETED') {
        let responsibleUser: User;
        if (task.participants && task.participants.length > 1) {
          responsibleUser = await this.rotationService.getCurrentResponsible(task.id);
        } else if (task.participants && task.participants.length === 1) {
          responsibleUser = task.participants[0].user;
        } else {
          responsibleUser = task.creator;
        }

        // 1. Registra falha no histórico do morador responsável
        await prisma.activityLog.create({
          data: {
            task_id: task.id,
            user_id: responsibleUser.id,
            house_id: houseId,
            action_type: 'FAILED',
            comment: `${responsibleUser.name} não concluiu a tarefa diária "${task.title}" no prazo.`,
          },
        });

        expiredCount++;

        // 2. Se for rodízio (Opção A): avança a fila circular para o próximo da lista
        if (task.participants && task.participants.length > 1) {
          await this.rotationService.rotateTask(task.id);
          advancedRotations.push(task.id);
        } else {
          await this.taskRepo.updateStatus(task.id, 'OPEN', {
            locked_by_id: null,
            locked_at: null,
          });
        }
      }
    }

    return { expiredCount, advancedRotations };
  }

  /**
   * forgiveFailure (Prerrogativa exclusiva do Admin Geral):
   * Remove a falha registrada para um morador e registra auditoria.
   */
  async forgiveFailure(
    taskId: string,
    userId: string,
    userRole?: string
  ): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const role = userRole || user.role;
    const isGeneralAdmin = user.role === 'ADMIN' || role === 'ADMIN_GERAL' || role === 'Admin Geral';
    if (!isGeneralAdmin) {
      throw new AppError(
        'Apenas o Admin Geral tem permissão para perdoar uma falha de tarefa.',
        403,
        'FORBIDDEN_FORGIVE_FAILURE'
      );
    }

    const task = await this.getTaskById(taskId);

    const latestFailedLog = await prisma.activityLog.findFirst({
      where: {
        task_id: taskId,
        action_type: 'FAILED',
      },
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });

    if (!latestFailedLog) {
      throw new AppError('Nenhuma falha recente encontrada para esta tarefa.', 404, 'NO_FAILURE_FOUND');
    }

    await prisma.activityLog.delete({
      where: { id: latestFailedLog.id },
    });

    await prisma.activityLog.create({
      data: {
        task_id: taskId,
        user_id: userId,
        house_id: task.house_id,
        action_type: 'ROTATED',
        comment: `${user.name} perdoou a falta de ${latestFailedLog.user.name} na tarefa "${task.title}".`,
      },
    });

    return { message: `Falha de ${latestFailedLog.user.name} na tarefa "${task.title}" perdoada com sucesso.` };
  }
}
