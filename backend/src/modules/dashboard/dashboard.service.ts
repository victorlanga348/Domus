import { prisma } from '../../database/prisma.js';
import { RotationService } from '../tasks/tasks.rotation.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Shift } from '@prisma/client';

export class DashboardService {
  constructor(private rotationService = new RotationService()) {}

  /**
   * Determina o turno do dia baseado na hora local.
   */
  getCurrentShift(): Shift {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'MORNING';
    if (hour >= 12 && hour < 18) return 'AFTERNOON';
    return 'NIGHT';
  }

  /**
   * Endpoint Agregador (BFF) que consolida todo o estado do Dashboard em uma única viagem de rede.
   */
  async getDashboardData(houseId: string, _currentUserId?: string) {
    if (!houseId) {
      throw new AppError('Identificação da residência (houseId) é obrigatória.', 400, 'HOUSE_ID_REQUIRED');
    }

    const currentShift = this.getCurrentShift();

    // 1. Buscar a residência e validar existência
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            vacation_mode: true,
            avatar_url: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }

    // 2. Buscar tarefas ativas do turno corrente (OPEN ou LOCKED)
    const currentShiftTasks = await prisma.task.findMany({
      where: {
        house_id: houseId,
        shift: currentShift,
        status: { in: ['OPEN', 'LOCKED', 'BLOCKED'] },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                vacation_mode: true,
              },
            },
          },
        },
        locked_by: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // 3. Enriquecer cada tarefa com o responsável atual calculado pelo RotationService
    const tasksWithAssignee = await Promise.all(
      currentShiftTasks.map(async (task) => {
        let currentAssignee = null;
        try {
          if (task.participants.length > 0) {
            currentAssignee = await this.rotationService.getCurrentResponsible(task.id);
          }
        } catch {
          // Se todos estiverem de férias ou sem participantes
          currentAssignee = null;
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          shift: task.shift,
          frequency: task.frequency,
          status: task.status,
          last_block_reason: task.last_block_reason,
          locked_at: task.locked_at,
          locked_by: task.locked_by,
          rotation_index: task.rotation_index,
          current_assignee: currentAssignee ? {
            id: currentAssignee.id,
            name: currentAssignee.name,
            email: currentAssignee.email,
            vacation_mode: currentAssignee.vacation_mode,
          } : null,
          participants_count: task.participants.length,
        };
      })
    );

    // 4. Buscar os últimos 5 avisos do mural (BulletinBoard)
    const bulletinPosts = await prisma.bulletinBoard.findMany({
      where: { house_id: houseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    // 5. Contadores de resumo (Estatísticas rápidas)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const completedTodayCount = await prisma.activityLog.count({
      where: {
        house_id: houseId,
        action_type: 'COMPLETED',
        task_id: { not: null },
        created_at: { gte: startOfToday },
      },
    });

    const pendingTasksCount = await prisma.task.count({
      where: {
        house_id: houseId,
        status: { in: ['OPEN', 'LOCKED'] },
      },
    });

    return {
      house: {
        id: house.id,
        name: house.name,
        invite_code: house.invite_code,
      },
      shift_info: {
        current_shift: currentShift,
        server_time: new Date().toISOString(),
      },
      summary: {
        pending_tasks_count: pendingTasksCount,
        completed_today_count: completedTodayCount,
        members_count: house.users.length,
        members_on_vacation_count: house.users.filter((u) => u.vacation_mode).length,
      },
      current_shift_tasks: tasksWithAssignee,
      members: house.users,
      bulletin_posts: bulletinPosts.map((post) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        author: post.author,
      })),
    };
  }

  /**
   * Cria uma nova publicação no mural de recados da residência.
   */
  async createBulletinPost(houseId: string, authorId: string, content: string) {
    if (!houseId) {
      throw new AppError('Identificação da residência (houseId) é obrigatória.', 400, 'HOUSE_ID_REQUIRED');
    }
    if (!authorId) {
      throw new AppError('Identificação do autor (authorId) é obrigatória.', 400, 'AUTHOR_ID_REQUIRED');
    }
    if (!content || !content.trim()) {
      throw new AppError('Conteúdo do recado não pode estar vazio.', 400, 'CONTENT_REQUIRED');
    }

    const post = await prisma.bulletinBoard.create({
      data: {
        house_id: houseId,
        author_id: authorId,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      author: post.author,
    };
  }

  /**
   * Exclui uma publicação do mural de recados.
   */
  async deleteBulletinPost(postId: string, userId: string) {
    if (!postId) {
      throw new AppError('Identificação do recado (postId) é obrigatória.', 400, 'POST_ID_REQUIRED');
    }

    const post = await prisma.bulletinBoard.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Recado não encontrado no mural.', 404, 'POST_NOT_FOUND');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Permite exclusão pelo autor original ou por qualquer Admin Geral da casa
    if (post.author_id !== userId && user?.role !== 'ADMIN') {
      throw new AppError('Apenas o autor do recado ou um Admin Geral podem removê-lo.', 403, 'FORBIDDEN');
    }

    await prisma.bulletinBoard.delete({
      where: { id: postId },
    });

    return { success: true, message: 'Recado removido do mural com sucesso.' };
  }
}
