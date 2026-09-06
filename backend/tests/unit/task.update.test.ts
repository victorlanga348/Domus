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
  rotation_index: number;
  participants: MockParticipant[];
}

/**
 * Motor determinístico de preservação de escala de rodízio
 */
function calculatePreservedRotationIndex(
  currentTask: MockTask,
  newParticipants: { id: string; name: string; vacation_mode: boolean }[]
): { newRotationIndex: number; newAssigneeId: string } {
  if (newParticipants.length === 0) {
    throw new Error('PARTICIPANTS_REQUIRED');
  }

  // 1. Identifica o responsável atual antes da alteração
  let currentAssigneeId: string | null = null;
  if (currentTask.participants && currentTask.participants.length > 0) {
    const prevSorted = [...currentTask.participants].map((p) => p.user).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    );
    const prevPoolSize = prevSorted.length;
    const prevBaseIndex = ((currentTask.rotation_index % prevPoolSize) + prevPoolSize) % prevPoolSize;
    for (let i = 0; i < prevPoolSize; i++) {
      const cand = prevSorted[(prevBaseIndex + i) % prevPoolSize];
      if (!cand.vacation_mode) {
        currentAssigneeId = cand.id;
        break;
      }
    }
  }

  // 2. Ordena os novos participantes A-Z
  const newSorted = [...newParticipants].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );
  const newPoolSize = newSorted.length;

  let newRotationIndex = 0;
  if (currentAssigneeId) {
    const existingIndexInNew = newSorted.findIndex((u) => u.id === currentAssigneeId);
    if (existingIndexInNew !== -1) {
      newRotationIndex = existingIndexInNew;
    } else {
      // Sucessor imediato
      const prevSorted = [...currentTask.participants].map((p) => p.user).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      );
      const prevIndex = prevSorted.findIndex((u) => u.id === currentAssigneeId);
      if (prevIndex !== -1) {
        for (let i = 1; i < prevSorted.length; i++) {
          const succ = prevSorted[(prevIndex + i) % prevSorted.length];
          const succInNew = newSorted.findIndex((u) => u.id === succ.id);
          if (succInNew !== -1) {
            newRotationIndex = succInNew;
            break;
          }
        }
      }
    }
  }

  // Identifica quem recebe a vez ativa (saltando férias)
  let activeAssigneeId = newSorted[newRotationIndex].id;
  for (let i = 0; i < newPoolSize; i++) {
    const cand = newSorted[(newRotationIndex + i) % newPoolSize];
    if (!cand.vacation_mode) {
      activeAssigneeId = cand.id;
      break;
    }
  }

  return { newRotationIndex, newAssigneeId: activeAssigneeId };
}

function validateTaskUpdatePermission(userRole: string): void {
  if (userRole !== 'ADMIN' && userRole !== 'SUB_ADMIN') {
    const err: any = new Error('FORBIDDEN_TASK_UPDATE');
    err.status = 403;
    throw err;
  }
}

describe('Motor de Atualização de Rodízio & Permissões', () => {
  const alice = { id: 'u1', name: 'Alice', vacation_mode: false };
  const carlos = { id: 'u2', name: 'Carlos', vacation_mode: false };
  const daniel = { id: 'u3', name: 'Daniel', vacation_mode: false };
  const bruno = { id: 'u4', name: 'Bruno', vacation_mode: false };

  it('deve permitir que ADMIN e SUB_ADMIN editem o rodízio', () => {
    assert.doesNotThrow(() => validateTaskUpdatePermission('ADMIN'));
    assert.doesNotThrow(() => validateTaskUpdatePermission('SUB_ADMIN'));
  });

  it('deve rejeitar com 403 morador comum (MEMBER) ao tentar editar rodízio', () => {
    assert.throws(
      () => validateTaskUpdatePermission('MEMBER'),
      (err: any) => err.status === 403 && err.message === 'FORBIDDEN_TASK_UPDATE'
    );
  });

  it('deve preservar a vez do morador atual ao adicionar novo participante antes dele na ordem alfabética', () => {
    // Lista inicial: Alice, Carlos. Vez de Carlos (índice 1).
    const task: MockTask = {
      id: 't1',
      title: 'Lavar Louça',
      rotation_index: 1,
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: carlos.id, user: carlos },
      ],
    };

    // Adiciona Bruno (A-Z ficará: Alice [0], Bruno [1], Carlos [2])
    const newParticipants = [alice, carlos, bruno];
    const { newRotationIndex, newAssigneeId } = calculatePreservedRotationIndex(task, newParticipants);

    // O índice deve ser ajustado para 2 para manter a vez com Carlos!
    assert.equal(newRotationIndex, 2);
    assert.equal(newAssigneeId, carlos.id);
  });

  it('deve avançar suavemente para o próximo sucessor quando o responsável atual for removido', () => {
    // Lista inicial: Alice (0), Bruno (1), Carlos (2). Vez de Bruno (1).
    const task: MockTask = {
      id: 't2',
      title: 'Limpar Sala',
      rotation_index: 1,
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: bruno.id, user: bruno },
        { user_id: carlos.id, user: carlos },
      ],
    };

    // Remove Bruno. Nova lista: Alice (0), Carlos (1).
    // O sucessor de Bruno era Carlos.
    const newParticipants = [alice, carlos];
    const { newRotationIndex, newAssigneeId } = calculatePreservedRotationIndex(task, newParticipants);

    assert.equal(newRotationIndex, 1);
    assert.equal(newAssigneeId, carlos.id);
  });

  it('deve pular participante em modo férias ao definir quem detém a vez ativa', () => {
    const carlosEmFerias = { ...carlos, vacation_mode: true };
    const task: MockTask = {
      id: 't3',
      title: 'Tirar o Lixo',
      rotation_index: 0,
      participants: [
        { user_id: alice.id, user: alice },
        { user_id: carlosEmFerias.id, user: carlosEmFerias },
        { user_id: daniel.id, user: daniel },
      ],
    };

    // Vez inicial é Alice (0). Alice é removida.
    // Sucessores: Carlos (em férias) -> Daniel (ativo).
    const newParticipants = [carlosEmFerias, daniel];
    const { newAssigneeId } = calculatePreservedRotationIndex(task, newParticipants);

    assert.equal(newAssigneeId, daniel.id);
  });
});
