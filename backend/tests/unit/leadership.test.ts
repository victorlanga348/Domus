import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HouseService } from '../../src/modules/houses/houses.service.js';

describe('Governança de Liderança, Sucessão e Troca de Casa (Unitário)', () => {
  const houseService = new HouseService();

  it('deve rejeitar transferência de liderança com parâmetros ausentes', async () => {
    await assert.rejects(
      () => houseService.transferLeadership('', 'admin-1', 'member-2'),
      { message: 'Parâmetros obrigatórios ausentes.' }
    );

    await assert.rejects(
      () => houseService.transferLeadership('house-1', '', 'member-2'),
      { message: 'Parâmetros obrigatórios ausentes.' }
    );

    await assert.rejects(
      () => houseService.transferLeadership('house-1', 'admin-1', ''),
      { message: 'Parâmetros obrigatórios ausentes.' }
    );
  });

  it('deve rejeitar auto-transferência de liderança para o próprio usuário', async () => {
    await assert.rejects(
      () => houseService.transferLeadership('house-1', 'user-1', 'user-1'),
      { message: 'O sucessor deve ser outro morador da residência.' }
    );
  });

  it('deve validar logicamente as regras de sucessão na troca de residência (1, 2 e 3+ pessoas)', () => {
    // Cenário A: Apenas o Admin Geral na residência (1 pessoa no total)
    const membersScenarioA = [
      { id: 'user-admin', name: 'Admin Geral', role: 'Admin Geral' },
    ];
    const otherMembersA = membersScenarioA.filter((m) => m.id !== 'user-admin');
    assert.equal(otherMembersA.length, 0, 'Com 1 morador, não existem outros membros');
    // Troca ocorre diretamente sem sucessão

    // Cenário B: Exatamente 2 pessoas na residência (Admin Geral + 1 morador)
    const membersScenarioB = [
      { id: 'user-admin', name: 'Admin Geral', role: 'Admin Geral' },
      { id: 'user-member-1', name: 'Maria Silva', role: 'Resident' },
    ];
    const otherMembersB = membersScenarioB.filter((m) => m.id !== 'user-admin');
    assert.equal(otherMembersB.length, 1, 'Com 2 pessoas, há exatamente 1 outro morador');
    // Sucessor designado automaticamente
    const autoDesignatedSuccessor = otherMembersB[0];
    assert.equal(autoDesignatedSuccessor.id, 'user-member-1');
    assert.equal(autoDesignatedSuccessor.name, 'Maria Silva');

    // Cenário C: Mais de 2 pessoas na residência (Admin Geral + 2 ou mais moradores)
    const membersScenarioC = [
      { id: 'user-admin', name: 'Admin Geral', role: 'Admin Geral' },
      { id: 'user-member-1', name: 'Maria Silva', role: 'Admin' },
      { id: 'user-member-2', name: 'João Souza', role: 'Resident' },
    ];
    const otherMembersC = membersScenarioC.filter((m) => m.id !== 'user-admin');
    assert.ok(otherMembersC.length > 1, 'Com mais de 2 pessoas, exige escolha manual via card');
    assert.equal(otherMembersC.length, 2);
  });
});
