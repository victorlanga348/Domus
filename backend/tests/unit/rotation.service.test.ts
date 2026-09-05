import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface MockUser {
  id: string;
  name: string;
  vacation_mode: boolean;
}

/**
 * Função pura equivalente à lógica canônica do RotationService
 */
function calculateNextParticipant(
  participants: MockUser[],
  rotationIndex: number
) {
  if (!participants || participants.length === 0) {
    throw new Error('NO_PARTICIPANTS');
  }

  // 1 & 2. Ordenar participantes por nome (A-Z)
  const sorted = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  const poolSize = sorted.length;
  const baseIndex = ((rotationIndex % poolSize) + poolSize) % poolSize;

  const skippedOnVacation: MockUser[] = [];
  let chosenUser: MockUser | null = null;
  let effectiveIndex = baseIndex;

  for (let step = 0; step < poolSize; step++) {
    const checkIndex = (baseIndex + step) % poolSize;
    const candidate = sorted[checkIndex];

    if (!candidate.vacation_mode) {
      chosenUser = candidate;
      effectiveIndex = checkIndex;
      break;
    } else {
      skippedOnVacation.push(candidate);
    }
  }

  if (!chosenUser) {
    throw new Error('ALL_PARTICIPANTS_ON_VACATION');
  }

  const nextRotationIndex = (effectiveIndex + 1) % poolSize;

  return {
    assignee: chosenUser,
    effectiveIndex,
    nextRotationIndex,
    skippedOnVacation,
  };
}

describe('RotationService (Regras Unitárias de Rodízio & Férias)', () => {
  const users: MockUser[] = [
    { id: '1', name: 'Carlos', vacation_mode: false },
    { id: '2', name: 'Ana', vacation_mode: false },
    { id: '3', name: 'Bruno', vacation_mode: false },
  ];

  it('deve ordenar participantes em ordem alfabética (A-Z) independente da entrada', () => {
    // Ordem alfabética esperada: Ana (0), Bruno (1), Carlos (2)
    const result0 = calculateNextParticipant(users, 0);
    assert.equal(result0.assignee.name, 'Ana');
    assert.equal(result0.effectiveIndex, 0);

    const result1 = calculateNextParticipant(users, 1);
    assert.equal(result1.assignee.name, 'Bruno');
    assert.equal(result1.effectiveIndex, 1);

    const result2 = calculateNextParticipant(users, 2);
    assert.equal(result2.assignee.name, 'Carlos');
    assert.equal(result2.effectiveIndex, 2);
  });

  it('deve avançar de forma circular (modulo poolSize)', () => {
    // Índice 3 deve voltar para o primeiro participante (Ana)
    const result3 = calculateNextParticipant(users, 3);
    assert.equal(result3.assignee.name, 'Ana');

    // Índice 4 deve apontar para Bruno
    const result4 = calculateNextParticipant(users, 4);
    assert.equal(result4.assignee.name, 'Bruno');
  });

  it('deve pular participante em modo férias e avançar para o próximo ativo', () => {
    const usersWithVacation: MockUser[] = [
      { id: '1', name: 'Ana', vacation_mode: true }, // Férias!
      { id: '2', name: 'Bruno', vacation_mode: false },
      { id: '3', name: 'Carlos', vacation_mode: false },
    ];

    // Índice 0 seria Ana, mas ela está de férias -> Deve pular para Bruno
    const result = calculateNextParticipant(usersWithVacation, 0);
    assert.equal(result.assignee.name, 'Bruno');
    assert.equal(result.effectiveIndex, 1);
    assert.equal(result.skippedOnVacation.length, 1);
    assert.equal(result.skippedOnVacation[0].name, 'Ana');
    assert.equal(result.nextRotationIndex, 2); // Próximo da fila será Carlos
  });

  it('deve pular múltiplos participantes consecutivos em férias', () => {
    const usersWithMultipleVacation: MockUser[] = [
      { id: '1', name: 'Ana', vacation_mode: true },
      { id: '2', name: 'Bruno', vacation_mode: true },
      { id: '3', name: 'Carlos', vacation_mode: false },
    ];

    // Começa em Ana (0), pula Ana e Bruno -> Atribui a Carlos (2)
    const result = calculateNextParticipant(usersWithMultipleVacation, 0);
    assert.equal(result.assignee.name, 'Carlos');
    assert.equal(result.effectiveIndex, 2);
    assert.equal(result.skippedOnVacation.length, 2);
    assert.equal(result.nextRotationIndex, 0); // Ciclo reinicia em Ana
  });

  it('deve lançar erro se todos os participantes estiverem em férias', () => {
    const allOnVacation: MockUser[] = [
      { id: '1', name: 'Ana', vacation_mode: true },
      { id: '2', name: 'Bruno', vacation_mode: true },
    ];

    assert.throws(
      () => calculateNextParticipant(allOnVacation, 0),
      /ALL_PARTICIPANTS_ON_VACATION/
    );
  });

  it('deve lançar erro se a lista de participantes estiver vazia', () => {
    assert.throws(
      () => calculateNextParticipant([], 0),
      /NO_PARTICIPANTS/
    );
  });
});
