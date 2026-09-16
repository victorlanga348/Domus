import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface MockParticipant {
  user_id: string;
  user: {
    id: string;
    name: string;
    vacation_mode: boolean;
  };
}

interface MockTask {
  id: string;
  title: string;
  status: 'OPEN' | 'LOCKED' | 'BLOCKED' | 'COMPLETED';
  rotation_index: number;
  creator_id: string;
  house_id: string;
  participants: MockParticipant[];
  locked_by_id?: string | null;
  locked_at?: Date | null;
  last_block_reason?: string | null;
}

/**
 * Função canônica de reversão que reproduz fielmente a lógica do TaskService.revertTask
 */
function revertTaskLogic(
  task: MockTask,
  revertingUserId: string,
  revertingUserRole: string
): { updatedTask: MockTask; activeAssigneeId: string } {
  const isGeneralAdmin = revertingUserRole === 'ADMIN' || revertingUserRole === 'ADMIN_GERAL' || revertingUserRole === 'Admin Geral';
  const isSubAdmin = revertingUserRole === 'SUB_ADMIN' || revertingUserRole === 'Admin';

  if (!isGeneralAdmin && !isSubAdmin) {
    const err: any = new Error('Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída.');
    err.code = 'FORBIDDEN_TASK_REVERT';
    throw err;
  }

  let targetRotationIndex = task.rotation_index;

  if (task.participants && task.participants.length > 1) {
    const sortedParticipants = [...task.participants].sort((a, b) =>
      a.user.name.localeCompare(b.user.name, 'pt-BR', { sensitivity: 'base' })
    );
    const poolSize = sortedParticipants.length;

    const completedUserIndex = task.locked_by_id
      ? sortedParticipants.findIndex((p) => p.user_id === task.locked_by_id)
      : -1;

    if (completedUserIndex !== -1) {
      targetRotationIndex = completedUserIndex;
    } else {
      // Caso o locked_by_id não esteja no pool (ex: Admin Geral concluiu por terceiro)
      targetRotationIndex = ((task.rotation_index - 1) % poolSize + poolSize) % poolSize;
    }
  }

  const updatedTask: MockTask = {
    ...task,
    status: 'OPEN',
    rotation_index: targetRotationIndex,
    locked_by_id: null,
    locked_at: null,
    last_block_reason: null,
  };

  // Identificar quem ficou com a vez ativa após a reversão
  let activeAssigneeId: string;
  if (updatedTask.participants.length > 1) {
    const sorted = [...updatedTask.participants].map((p) => p.user).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    );
    const poolSize = sorted.length;
    const baseIndex = ((updatedTask.rotation_index % poolSize) + poolSize) % poolSize;

    let chosen = sorted[baseIndex];
    for (let i = 0; i < poolSize; i++) {
      const cand = sorted[(baseIndex + i) % poolSize];
      if (!cand.vacation_mode) {
        chosen = cand;
        break;
      }
    }
    activeAssigneeId = chosen.id;
  } else if (updatedTask.participants.length === 1) {
    activeAssigneeId = updatedTask.participants[0].user_id;
  } else {
    activeAssigneeId = updatedTask.creator_id;
  }

  return { updatedTask, activeAssigneeId };
}

describe('Motor de Reversão de Tarefas & Rodízio (Backend)', () => {
  const alice = { id: 'u_alice', name: 'Alice Silva', vacation_mode: false };
  const bruno = { id: 'u_bruno', name: 'Bruno Costa', vacation_mode: false };
  const carlos = { id: 'u_carlos', name: 'Carlos Dias', vacation_mode: false };

  it('deve restaurar a tarefa para Alice quando Alice concluiu a tarefa e o Admin reverteu', () => {
    // Escala A-Z: Alice (0), Bruno (1), Carlos (2)
    // Alice concluiu -> rotation_index avançou para 1 (Bruno), locked_by_id = Alice
    const completedTask: MockTask = {
      id: 'task-1',
      title: 'Lavar Louça',
      status: 'COMPLETED',
      rotation_index: 1, // Aponta para Bruno
      creator_id: 'u_admin',
      house_id: 'house-1',
      locked_by_id: alice.id, // Alice concluiu
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
        { user_id: carlos.id, user: carlos },
      ],
    };

    const { updatedTask, activeAssigneeId } = revertTaskLogic(completedTask, 'u_admin', 'ADMIN');

    assert.equal(updatedTask.status, 'OPEN', 'Status deve voltar para OPEN');
    assert.equal(updatedTask.rotation_index, 0, 'rotation_index deve voltar para 0 (Alice)');
    assert.equal(updatedTask.locked_by_id, null, 'Lock deve ser liberado');
    assert.equal(activeAssigneeId, alice.id, 'Responsável ativo deve ser Alice, como se nunca tivesse concluído');
  });

  it('deve restaurar a tarefa para Bruno quando Bruno concluiu a tarefa e o Admin reverteu', () => {
    // Bruno concluiu -> rotation_index avançou para 2 (Carlos), locked_by_id = Bruno
    const completedTask: MockTask = {
      id: 'task-1',
      title: 'Lavar Louça',
      status: 'COMPLETED',
      rotation_index: 2, // Aponta para Carlos
      creator_id: 'u_admin',
      house_id: 'house-1',
      locked_by_id: bruno.id, // Bruno concluiu
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
        { user_id: carlos.id, user: carlos },
      ],
    };

    const { updatedTask, activeAssigneeId } = revertTaskLogic(completedTask, 'u_admin', 'ADMIN');

    assert.equal(updatedTask.status, 'OPEN');
    assert.equal(updatedTask.rotation_index, 1, 'rotation_index deve voltar para 1 (Bruno)');
    assert.equal(activeAssigneeId, bruno.id, 'Responsável ativo deve ser Bruno');
  });

  it('deve restaurar a tarefa para Carlos na virada circular (Carlos concluiu -> index 0)', () => {
    // Carlos concluiu -> rotation_index avançou para 0 (Alice), locked_by_id = Carlos
    const completedTask: MockTask = {
      id: 'task-1',
      title: 'Lavar Louça',
      status: 'COMPLETED',
      rotation_index: 0, // Aponta para Alice
      creator_id: 'u_admin',
      house_id: 'house-1',
      locked_by_id: carlos.id, // Carlos concluiu
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
        { user_id: carlos.id, user: carlos },
      ],
    };

    const { updatedTask, activeAssigneeId } = revertTaskLogic(completedTask, 'u_subadmin', 'SUB_ADMIN');

    assert.equal(updatedTask.status, 'OPEN');
    assert.equal(updatedTask.rotation_index, 2, 'rotation_index deve voltar para 2 (Carlos)');
    assert.equal(activeAssigneeId, carlos.id, 'Responsável ativo deve ser Carlos');
  });

  it('deve calcular retrocesso circular quando Admin Geral concluiu por terceiro e locked_by_id não está no pool', () => {
    // Admin Geral concluiu no lugar de Alice (index era 0, virou 1)
    const completedTask: MockTask = {
      id: 'task-1',
      title: 'Lavar Louça',
      status: 'COMPLETED',
      rotation_index: 1,
      creator_id: 'u_admin_externo',
      house_id: 'house-1',
      locked_by_id: 'u_admin_externo', // Admin não é participante do rodízio
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
        { user_id: carlos.id, user: carlos },
      ],
    };

    const { updatedTask, activeAssigneeId } = revertTaskLogic(completedTask, 'u_admin_externo', 'ADMIN');

    assert.equal(updatedTask.status, 'OPEN');
    assert.equal(updatedTask.rotation_index, 0, 'rotation_index deve retroceder circularmente para 0 (Alice)');
    assert.equal(activeAssigneeId, alice.id, 'Responsável ativo deve voltar para Alice');
  });

  it('deve reverter perfeitamente tarefas individuais com 1 participante', () => {
    const singleTask: MockTask = {
      id: 'task-2',
      title: 'Regar Plantas',
      status: 'COMPLETED',
      rotation_index: 0,
      creator_id: alice.id,
      house_id: 'house-1',
      locked_by_id: alice.id,
      participants: [{ user_id: alice.id, user: alice }],
    };

    const { updatedTask, activeAssigneeId } = revertTaskLogic(singleTask, 'u_admin', 'ADMIN');

    assert.equal(updatedTask.status, 'OPEN');
    assert.equal(updatedTask.locked_by_id, null);
    assert.equal(activeAssigneeId, alice.id, 'Responsável deve permanecer Alice');
  });

  it('deve bloquear com 403 quando morador regular (MEMBER) tenta reverter', () => {
    const completedTask: MockTask = {
      id: 'task-1',
      title: 'Lavar Louça',
      status: 'COMPLETED',
      rotation_index: 1,
      creator_id: 'u_admin',
      house_id: 'house-1',
      locked_by_id: alice.id,
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
      ],
    };

    assert.throws(
      () => revertTaskLogic(completedTask, 'u_morador', 'MEMBER'),
      (err: any) => err.code === 'FORBIDDEN_TASK_REVERT'
    );
  });
});
