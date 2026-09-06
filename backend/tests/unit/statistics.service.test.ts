import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface MockActivityLog {
  id: string;
  user_id: string;
  house_id: string;
  action_type: 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'LOCKED' | 'ROTATED';
  task_id: string | null;
  comment?: string | null;
}

interface MockUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  house_id: string | null;
}

/**
 * Função canônica de cálculo de estatísticas (idêntica à regra de statistics.service.ts)
 */
function calculateStatistics(
  logs: MockActivityLog[],
  users: MockUser[]
) {
  // Apenas logs com task_id preenchido contam como tarefas
  const validTaskLogs = logs.filter((log) => Boolean(log.task_id));
  const completedLogs = validTaskLogs.filter((log) => log.action_type === 'COMPLETED');
  const totalCompleted = completedLogs.length;

  const userCompletedMap = new Map<string, number>();
  for (const log of completedLogs) {
    userCompletedMap.set(log.user_id, (userCompletedMap.get(log.user_id) || 0) + 1);
  }

  const contributions = users.map((user) => {
    const userCompleted = userCompletedMap.get(user.id) || 0;
    const percentage = totalCompleted > 0 ? Math.round((userCompleted / totalCompleted) * 100) : 0;
    return {
      user_id: user.id,
      name: user.name,
      completed_count: userCompleted,
      percentage,
    };
  }).sort((a, b) => b.completed_count - a.completed_count);

  const failedCount = validTaskLogs.filter((log) => log.action_type === 'FAILED').length;
  const blockedCount = validTaskLogs.filter((log) => log.action_type === 'BLOCKED').length;

  return {
    totalCompleted,
    contributions,
    failedCount,
    blockedCount,
  };
}

/**
 * Validação de permissão de alternância de residência (idêntica à regra de houses.service.ts)
 */
function validateSwitchHouse(
  currentUser: MockUser,
  otherMembersCount: number,
  targetHouseId: string
): { allowed: boolean; errorCode?: string } {
  if (currentUser.house_id && currentUser.house_id !== targetHouseId && currentUser.role === 'ADMIN') {
    if (otherMembersCount > 0) {
      return { allowed: false, errorCode: 'CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN' };
    }
  }
  return { allowed: true };
}

describe('StatisticsService (Isolamento de Modo Férias e Logs de Tarefas)', () => {
  const users: MockUser[] = [
    { id: 'user-1', name: 'Alice', role: 'ADMIN', house_id: 'house-1' },
    { id: 'user-2', name: 'Bruno', role: 'MEMBER', house_id: 'house-1' },
  ];

  it('não deve computar ativação/desativação de modo férias como tarefas concluídas', () => {
    const logs: MockActivityLog[] = [
      // Logs de férias (sem task_id)
      {
        id: 'log-1',
        user_id: 'user-1',
        house_id: 'house-1',
        action_type: 'COMPLETED',
        task_id: null,
        comment: 'Alice ativou o modo férias.',
      },
      {
        id: 'log-2',
        user_id: 'user-1',
        house_id: 'house-1',
        action_type: 'COMPLETED',
        task_id: null,
        comment: 'Alice desativou o modo férias.',
      },
      // Log real de tarefa
      {
        id: 'log-3',
        user_id: 'user-2',
        house_id: 'house-1',
        action_type: 'COMPLETED',
        task_id: 'task-lavar-louca',
        comment: 'Tarefa concluída com sucesso',
      },
    ];

    const stats = calculateStatistics(logs, users);

    assert.equal(stats.totalCompleted, 1, 'Apenas a tarefa real com task_id deve ser contabilizada');
    
    const aliceStats = stats.contributions.find((c) => c.user_id === 'user-1');
    assert.equal(aliceStats?.completed_count, 0, 'Alice não deve ter tarefas concluídas pelo modo férias');

    const brunoStats = stats.contributions.find((c) => c.user_id === 'user-2');
    assert.equal(brunoStats?.completed_count, 1, 'Bruno deve ter 1 tarefa concluída');
  });

  it('deve desconsiderar falhas e bloqueios de sistema sem task_id', () => {
    const logs: MockActivityLog[] = [
      {
        id: 'log-1',
        user_id: 'user-1',
        house_id: 'house-1',
        action_type: 'BLOCKED',
        task_id: null,
        comment: 'Bloqueio de sistema',
      },
      {
        id: 'log-2',
        user_id: 'user-2',
        house_id: 'house-1',
        action_type: 'BLOCKED',
        task_id: 'task-aspirar-sala',
        comment: 'Falta de saco coletor',
      },
    ];

    const stats = calculateStatistics(logs, users);
    assert.equal(stats.blockedCount, 1, 'Apenas bloqueios com task_id devem ser contabilizados');
  });
});

describe('HousesService (Governança de Alternância de Residência para Admin Geral)', () => {
  it('deve impedir que o Admin Geral alterne de residência se houver outros moradores na casa atual', () => {
    const adminUser: MockUser = {
      id: 'admin-1',
      name: 'Carlos',
      role: 'ADMIN',
      house_id: 'house-1',
    };

    const result = validateSwitchHouse(adminUser, 2, 'house-2');
    assert.equal(result.allowed, false);
    assert.equal(result.errorCode, 'CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN');
  });

  it('deve permitir que o Admin Geral alterne de residência se for o único morador', () => {
    const adminUser: MockUser = {
      id: 'admin-1',
      name: 'Carlos',
      role: 'ADMIN',
      house_id: 'house-1',
    };

    const result = validateSwitchHouse(adminUser, 0, 'house-2');
    assert.equal(result.allowed, true);
  });

  it('deve permitir que um membro regular (MEMBER) alterne de residência mesmo que haja outros moradores', () => {
    const regularUser: MockUser = {
      id: 'member-1',
      name: 'Daniela',
      role: 'MEMBER',
      house_id: 'house-1',
    };

    const result = validateSwitchHouse(regularUser, 3, 'house-2');
    assert.equal(result.allowed, true);
  });
});

/**
 * Validação de permissão de remoção de membro (idêntica à regra de houses.service.ts)
 */
function validateRemoveMember(
  requester: MockUser,
  target: MockUser,
  requesterRole?: string
): { allowed: boolean; errorCode?: string } {
  if (requester.id === target.id) {
    return { allowed: false, errorCode: 'CANNOT_REMOVE_SELF' };
  }
  if (requester.house_id !== target.house_id) {
    return { allowed: false, errorCode: 'FORBIDDEN' };
  }
  if (target.role === 'ADMIN') {
    return { allowed: false, errorCode: 'CANNOT_REMOVE_GENERAL_ADMIN' };
  }
  const isGeneralAdmin = requester.role === 'ADMIN';
  const isSubAdmin = requesterRole === 'Admin' || requesterRole === 'ADMIN';
  if (!isGeneralAdmin && !isSubAdmin) {
    return { allowed: false, errorCode: 'FORBIDDEN' };
  }
  return { allowed: true };
}

describe('HousesService (Governança de Remoção de Membros)', () => {
  const generalAdmin: MockUser = {
    id: 'admin-1',
    name: 'Carlos (Admin Geral)',
    role: 'ADMIN',
    house_id: 'house-1',
  };

  const subAdmin: MockUser = {
    id: 'subadmin-1',
    name: 'Beatriz (Sub-Admin)',
    role: 'MEMBER',
    house_id: 'house-1',
  };

  const resident: MockUser = {
    id: 'resident-1',
    name: 'Daniel (Morador)',
    role: 'MEMBER',
    house_id: 'house-1',
  };

  it('deve impedir que o usuário se auto-remova pela função de remoção', () => {
    const result = validateRemoveMember(generalAdmin, generalAdmin);
    assert.equal(result.allowed, false);
    assert.equal(result.errorCode, 'CANNOT_REMOVE_SELF');
  });

  it('deve impedir a remoção do Administrador Geral da residência', () => {
    const result = validateRemoveMember(subAdmin, generalAdmin, 'Admin');
    assert.equal(result.allowed, false);
    assert.equal(result.errorCode, 'CANNOT_REMOVE_GENERAL_ADMIN');
  });

  it('deve permitir que o Admin Geral remova um morador regular', () => {
    const result = validateRemoveMember(generalAdmin, resident);
    assert.equal(result.allowed, true);
  });

  it('deve permitir que um Sub-Admin remova um morador regular', () => {
    const result = validateRemoveMember(subAdmin, resident, 'Admin');
    assert.equal(result.allowed, true);
  });

  it('deve impedir que um morador regular (MEMBER sem cargo Admin) remova outros moradores', () => {
    const result = validateRemoveMember(resident, subAdmin, 'Resident');
    assert.equal(result.allowed, false);
    assert.equal(result.errorCode, 'FORBIDDEN');
  });
});

