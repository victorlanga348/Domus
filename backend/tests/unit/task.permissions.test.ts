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
}

/**
 * Função canônica pura para resolver o morador responsável válido da tarefa
 */
function resolveValidAssigneeId(task: MockTask): string {
  if (task.participants && task.participants.length > 1) {
    const sorted = [...task.participants].map((p) => p.user).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    );
    const poolSize = sorted.length;
    const baseIndex = ((task.rotation_index % poolSize) + poolSize) % poolSize;

    for (let step = 0; step < poolSize; step++) {
      const checkIndex = (baseIndex + step) % poolSize;
      const candidate = sorted[checkIndex];
      if (!candidate.vacation_mode) {
        return candidate.id;
      }
    }
    throw new Error('ALL_PARTICIPANTS_ON_VACATION');
  } else if (task.participants && task.participants.length === 1) {
    return task.participants[0].user_id;
  }
  return task.creator_id;
}

/**
 * Validação canônica de permissão para concluir tarefa
 */
function validateCompleteTaskPermission(task: MockTask, userId: string): void {
  if (task.status === 'COMPLETED') {
    throw new Error('Tarefa já foi concluída.');
  }

  const idResponsavelValido = resolveValidAssigneeId(task);

  if (idResponsavelValido !== userId) {
    const err: any = new Error('Apenas a pessoa designada para esta tarefa pode marcá-la como concluída.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN_TASK_COMPLETION';
    throw err;
  }
}

/**
 * Validação canônica de permissão para reverter tarefa
 */
function validateRevertTaskPermission(userRole: string): void {
  const isGeneralAdmin = userRole === 'ADMIN' || userRole === 'ADMIN_GERAL' || userRole === 'Admin Geral';
  const isSubAdmin = userRole === 'SUB_ADMIN' || userRole === 'Admin';

  if (!isGeneralAdmin && !isSubAdmin) {
    const err: any = new Error('Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN_TASK_REVERT';
    throw err;
  }
}

/**
 * Validação canônica de permissão para girar tarefa de rodízio
 */
function validateRotateTaskPermission(task: MockTask, userId: string): void {
  const idResponsavelValido = resolveValidAssigneeId(task);

  if (idResponsavelValido !== userId) {
    const err: any = new Error('Apenas a pessoa da vez no rodízio pode girar a escala.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN_TASK_ROTATION';
    throw err;
  }
}

describe('Regras de Permissão: Conclusão de Tarefas (Backend)', () => {
  it('deve permitir que o responsável direto conclua uma tarefa direcionada (1 participante)', () => {
    const task: MockTask = {
      id: 'task-1',
      title: 'Lavar louça',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'user-maria', user: { id: 'user-maria', name: 'Maria', vacation_mode: false } },
      ],
    };

    assert.doesNotThrow(() => {
      validateCompleteTaskPermission(task, 'user-maria');
    });
  });

  it('deve bloquear com 403 quando outro usuário tentar concluir tarefa direcionada de terceiro', () => {
    const task: MockTask = {
      id: 'task-1',
      title: 'Lavar louça',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'user-maria', user: { id: 'user-maria', name: 'Maria', vacation_mode: false } },
      ],
    };

    assert.throws(
      () => {
        validateCompleteTaskPermission(task, 'user-joao');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(
          err.message,
          'Apenas a pessoa designada para esta tarefa pode marcá-la como concluída.'
        );
        return true;
      }
    );
  });

  it('deve permitir que apenas o membro da vez conclua uma tarefa de rodízio', () => {
    // Ordem A-Z: Alice, Bruno, Carlos. rotation_index 0 = Alice
    const task: MockTask = {
      id: 'task-rot',
      title: 'Limpar cozinha',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'u-carlos', user: { id: 'u-carlos', name: 'Carlos', vacation_mode: false } },
        { user_id: 'u-alice', user: { id: 'u-alice', name: 'Alice', vacation_mode: false } },
        { user_id: 'u-bruno', user: { id: 'u-bruno', name: 'Bruno', vacation_mode: false } },
      ],
    };

    // Alice é a vez no turno atual
    assert.doesNotThrow(() => {
      validateCompleteTaskPermission(task, 'u-alice');
    });

    // Bruno tenta concluir fora da sua vez -> 403
    assert.throws(
      () => {
        validateCompleteTaskPermission(task, 'u-bruno');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(
          err.message,
          'Apenas a pessoa designada para esta tarefa pode marcá-la como concluída.'
        );
        return true;
      }
    );
  });

  it('deve respeitar o salto de férias no rodízio ao definir o responsável apto a concluir', () => {
    // Alice está de férias -> a vez passa para Bruno
    const task: MockTask = {
      id: 'task-rot',
      title: 'Limpar cozinha',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'u-alice', user: { id: 'u-alice', name: 'Alice', vacation_mode: true } },
        { user_id: 'u-bruno', user: { id: 'u-bruno', name: 'Bruno', vacation_mode: false } },
      ],
    };

    // Bruno é o responsável ativo
    assert.doesNotThrow(() => {
      validateCompleteTaskPermission(task, 'u-bruno');
    });

    // Alice (de férias) é bloqueada
    assert.throws(() => {
      validateCompleteTaskPermission(task, 'u-alice');
    });
  });
});

describe('Regras de Permissão: Reversão / Cancelamento de Tarefas Feitas (Backend)', () => {
  it('deve permitir que o Admin Geral reverta uma tarefa concluída', () => {
    assert.doesNotThrow(() => {
      validateRevertTaskPermission('ADMIN');
    });
    assert.doesNotThrow(() => {
      validateRevertTaskPermission('Admin Geral');
    });
  });

  it('deve permitir que o Sub-Admin reverta uma tarefa concluída', () => {
    assert.doesNotThrow(() => {
      validateRevertTaskPermission('SUB_ADMIN');
    });
    assert.doesNotThrow(() => {
      validateRevertTaskPermission('Admin');
    });
  });

  it('deve bloquear moradores comuns com 403 ao tentar reverter uma tarefa concluída', () => {
    const forbiddenRoles = ['MEMBER', 'Resident', 'Guest Access', 'Resident (Restricted)'];

    for (const role of forbiddenRoles) {
      assert.throws(
        () => {
          validateRevertTaskPermission(role);
        },
        (err: any) => {
          assert.strictEqual(err.statusCode, 403);
          assert.strictEqual(
            err.message,
            'Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída.'
          );
          return true;
        }
      );
    }
  });
});

describe('Regras de Permissão: Giro de Escala de Rodízio (Backend)', () => {
  it('deve permitir que o morador da vez gire o rodízio', () => {
    // Ordem A-Z: Alice, Bruno, Carlos. rotation_index: 0 -> Alice
    const task: MockTask = {
      id: 'task-rot',
      title: 'Limpar cozinha',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'u-carlos', user: { id: 'u-carlos', name: 'Carlos', vacation_mode: false } },
        { user_id: 'u-alice', user: { id: 'u-alice', name: 'Alice', vacation_mode: false } },
        { user_id: 'u-bruno', user: { id: 'u-bruno', name: 'Bruno', vacation_mode: false } },
      ],
    };

    // Alice tem a vez atual -> permissão concedida
    assert.doesNotThrow(() => {
      validateRotateTaskPermission(task, 'u-alice');
    });
  });

  it('deve bloquear com 403 quando outro morador tentar girar fora da sua vez', () => {
    const task: MockTask = {
      id: 'task-rot',
      title: 'Limpar cozinha',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'u-carlos', user: { id: 'u-carlos', name: 'Carlos', vacation_mode: false } },
        { user_id: 'u-alice', user: { id: 'u-alice', name: 'Alice', vacation_mode: false } },
        { user_id: 'u-bruno', user: { id: 'u-bruno', name: 'Bruno', vacation_mode: false } },
      ],
    };

    // Bruno tenta girar quando a vez é da Alice -> 403 FORBIDDEN_TASK_ROTATION
    assert.throws(
      () => {
        validateRotateTaskPermission(task, 'u-bruno');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN_TASK_ROTATION');
        assert.strictEqual(
          err.message,
          'Apenas a pessoa da vez no rodízio pode girar a escala.'
        );
        return true;
      }
    );

    // Carlos tenta girar quando a vez é da Alice -> 403 FORBIDDEN_TASK_ROTATION
    assert.throws(
      () => {
        validateRotateTaskPermission(task, 'u-carlos');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN_TASK_ROTATION');
        return true;
      }
    );
  });

  it('deve respeitar o salto de férias ao definir quem tem permissão para girar', () => {
    // Alice está de férias -> Bruno assume a vez ativa
    const task: MockTask = {
      id: 'task-rot',
      title: 'Limpar cozinha',
      status: 'OPEN',
      rotation_index: 0,
      creator_id: 'user-admin',
      house_id: 'house-1',
      participants: [
        { user_id: 'u-alice', user: { id: 'u-alice', name: 'Alice', vacation_mode: true } },
        { user_id: 'u-bruno', user: { id: 'u-bruno', name: 'Bruno', vacation_mode: false } },
      ],
    };

    // Bruno é o responsável ativo
    assert.doesNotThrow(() => {
      validateRotateTaskPermission(task, 'u-bruno');
    });

    // Alice (de férias) é bloqueada com 403
    assert.throws(
      () => {
        validateRotateTaskPermission(task, 'u-alice');
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN_TASK_ROTATION');
        return true;
      }
    );
  });
});
