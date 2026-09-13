import { prisma } from '../../database/prisma.js';
import { RotationService } from '../tasks/tasks.rotation.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Shift } from '@prisma/client';

export interface BulletinContentPayload {
  title?: string;
  content: string;
  color?: string;
  type?: 'text' | 'checklist';
  items?: Array<{ id: string; text: string; done: boolean }>;
}

export function parseBulletinContent(rawContent: string): BulletinContentPayload {
  if (typeof rawContent === 'string' && rawContent.startsWith('{') && rawContent.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawContent);
      if (typeof parsed.text === 'string' || Array.isArray(parsed.items)) {
        return {
          title: parsed.title || undefined,
          content: typeof parsed.text === 'string' ? parsed.text : '',
          color: parsed.color || undefined,
          type: parsed.type || (Array.isArray(parsed.items) && parsed.items.length > 0 ? 'checklist' : 'text'),
          items: Array.isArray(parsed.items)
            ? parsed.items.map((it: any) => ({
                id: String(it.id || `it_${Math.random().toString(36).substring(2, 8)}`),
                text: String(it.text || ''),
                done: Boolean(it.done),
              }))
            : undefined,
        };
      }
    } catch {}
  }
  return {
    title: undefined,
    content: rawContent,
    color: undefined,
    type: 'text',
    items: undefined,
  };
}

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
      bulletin_posts: bulletinPosts.map((post) => {
        const parsed = parseBulletinContent(post.content);
        return {
          id: post.id,
          title: parsed.title,
          content: parsed.content,
          color: parsed.color,
          type: parsed.type,
          items: parsed.items,
          created_at: post.created_at,
          author: post.author,
        };
      }),
    };
  }

  /**
   * Cria uma nova publicação no mural de recados da residência.
   */
  async createBulletinPost(
    houseId: string,
    authorId: string,
    content: string,
    meta?: {
      title?: string;
      color?: string;
      type?: 'text' | 'checklist';
      items?: Array<{ id: string; text: string; done: boolean }>;
    }
  ) {
    if (!houseId) {
      throw new AppError('Identificação da residência (houseId) é obrigatória.', 400, 'HOUSE_ID_REQUIRED');
    }
    if (!authorId) {
      throw new AppError('Identificação do autor (authorId) é obrigatória.', 400, 'AUTHOR_ID_REQUIRED');
    }

    const trimmedContent = (content || '').trim();
    const hasItems = Array.isArray(meta?.items) && meta.items.length > 0;
    if (!trimmedContent && !hasItems && !meta?.title) {
      throw new AppError('Conteúdo ou itens do recado não podem estar vazios.', 400, 'CONTENT_REQUIRED');
    }

    const isChecklist = meta?.type === 'checklist' || hasItems;
    const storedContent =
      meta?.title || meta?.color || isChecklist
        ? JSON.stringify({
            title: meta.title?.trim() || undefined,
            text: trimmedContent,
            color: meta.color || undefined,
            type: isChecklist ? 'checklist' : 'text',
            items: hasItems ? meta.items : undefined,
          })
        : trimmedContent;

    const post = await prisma.bulletinBoard.create({
      data: {
        house_id: houseId,
        author_id: authorId,
        content: storedContent,
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

    const parsed = parseBulletinContent(post.content);

    return {
      id: post.id,
      title: parsed.title,
      content: parsed.content,
      color: parsed.color,
      type: parsed.type,
      items: parsed.items,
      created_at: post.created_at,
      author: post.author,
    };
  }

  /**
   * Atualiza uma publicação no mural de recados (ex: marcar/desmarcar itens do checklist).
   */
  async updateBulletinPost(
    postId: string,
    _userId: string,
    data: {
      content?: string;
      title?: string;
      color?: string;
      type?: 'text' | 'checklist';
      items?: Array<{ id: string; text: string; done: boolean }>;
    }
  ) {
    if (!postId) {
      throw new AppError('Identificação do recado (postId) é obrigatória.', 400, 'POST_ID_REQUIRED');
    }

    const post = await prisma.bulletinBoard.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Recado não encontrado.', 404, 'POST_NOT_FOUND');
    }

    const existing = parseBulletinContent(post.content);
    const newTitle = data.title !== undefined ? data.title?.trim() : existing.title;
    const newText = data.content !== undefined ? data.content?.trim() : existing.content;
    const newColor = data.color !== undefined ? data.color : existing.color;
    const newItems = data.items !== undefined ? data.items : existing.items;
    const hasItems = Array.isArray(newItems) && newItems.length > 0;
    const newType = data.type !== undefined ? data.type : (hasItems ? 'checklist' : existing.type);

    const storedContent =
      newTitle || newColor || hasItems || newType === 'checklist'
        ? JSON.stringify({
            title: newTitle || undefined,
            text: newText || '',
            color: newColor || undefined,
            type: newType,
            items: newItems,
          })
        : (newText || '');

    const updated = await prisma.bulletinBoard.update({
      where: { id: postId },
      data: {
        content: storedContent,
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

    const parsed = parseBulletinContent(updated.content);

    return {
      id: updated.id,
      title: parsed.title,
      content: parsed.content,
      color: parsed.color,
      type: parsed.type,
      items: parsed.items,
      created_at: updated.created_at,
      author: updated.author,
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
      // Idempotência (RFC 7231): se o recado já não existe no banco, considera como removido com sucesso
      return { success: true, message: 'Recado já removido do mural.' };
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
