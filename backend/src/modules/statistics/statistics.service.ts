import { prisma } from '../../database/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';

export interface MemberContribution {
  user_id: string;
  name: string;
  avatar?: string;
  completed_count: number;
  percentage: number;
}

export interface HarmonyScoreDetails {
  score: number; // 0 a 100
  total_completed: number;
  total_failed: number;
  total_blocked: number;
  completion_rate: number; // 0 a 1
  level_label: string; // 'Excelente' | 'Boa' | 'Atenção' | 'Crítica'
}

export class AnalyticsService {
  async getHouseStatistics(houseId: string) {
    if (!houseId) {
      throw new AppError('Identificação da residência é obrigatória.', 400, 'HOUSE_ID_REQUIRED');
    }

    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            vacation_mode: true,
          },
        },
      },
    });

    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }

    // Intervalo do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Buscar logs de atividade associados a tarefas reais do mês atual
    const monthLogs = await prisma.activityLog.findMany({
      where: {
        house_id: houseId,
        task_id: { not: null },
        created_at: { gte: startOfMonth },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 1. Contribuição por Membro (apenas conclusões reais de tarefas)
    const completedLogs = monthLogs.filter((log) => log.action_type === 'COMPLETED' && Boolean(log.task_id));
    const totalCompleted = completedLogs.length;

    const userCompletedMap = new Map<string, number>();
    for (const log of completedLogs) {
      userCompletedMap.set(log.user_id, (userCompletedMap.get(log.user_id) || 0) + 1);
    }

    const contributions: MemberContribution[] = house.users.map((user) => {
      const userCompleted = userCompletedMap.get(user.id) || 0;
      const percentage = totalCompleted > 0 ? Math.round((userCompleted / totalCompleted) * 100) : 0;

      return {
        user_id: user.id,
        name: user.name,
        completed_count: userCompleted,
        percentage,
      };
    }).sort((a, b) => b.completed_count - a.completed_count);

    // 2. Maior Contribuidor
    const topContributor = contributions.length > 0 && contributions[0].completed_count > 0
      ? contributions[0]
      : null;

    // 3. Índice de Harmonia (0 a 100)
    const failedCount = monthLogs.filter((log) => log.action_type === 'FAILED' && Boolean(log.task_id)).length;
    const blockedCount = monthLogs.filter((log) => log.action_type === 'BLOCKED' && Boolean(log.task_id)).length;
    const totalInteractions = totalCompleted + failedCount + blockedCount;

    let harmonyScore = 100;
    let completionRate = 1.0;

    if (totalInteractions > 0) {
      completionRate = totalCompleted / totalInteractions;
      // Fórmula de pontuação de harmonia:
      // Base positiva pelas conclusões, penalidade por bloqueios (peso 0.5) e falhas (peso 1.0)
      const penalty = (failedCount * 10 + blockedCount * 5) / (totalInteractions || 1);
      harmonyScore = Math.max(0, Math.min(100, Math.round((completionRate * 100) - penalty)));
    }

    let levelLabel = 'Excelente';
    if (harmonyScore < 50) levelLabel = 'Crítica';
    else if (harmonyScore < 75) levelLabel = 'Atenção';
    else if (harmonyScore < 90) levelLabel = 'Boa';

    const harmonyDetails: HarmonyScoreDetails = {
      score: harmonyScore,
      total_completed: totalCompleted,
      total_failed: failedCount,
      total_blocked: blockedCount,
      completion_rate: Math.round(completionRate * 100) / 100,
      level_label: levelLabel,
    };

    // 4. Distribuição por Turno
    const tasksByShift = await prisma.task.groupBy({
      by: ['shift'],
      where: { house_id: houseId },
      _count: { id: true },
    });

    const shiftDistribution = {
      MORNING: tasksByShift.find((s) => s.shift === 'MORNING')?._count.id || 0,
      AFTERNOON: tasksByShift.find((s) => s.shift === 'AFTERNOON')?._count.id || 0,
      NIGHT: tasksByShift.find((s) => s.shift === 'NIGHT')?._count.id || 0,
    };

    return {
      house: {
        id: house.id,
        name: house.name,
      },
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      harmony: harmonyDetails,
      top_contributor: topContributor,
      contributions,
      shift_distribution: shiftDistribution,
    };
  }
}
