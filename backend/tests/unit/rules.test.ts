import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RulesService } from '../../src/modules/rules/rules.service.js';
import type { HouseRule } from '@prisma/client';

class MockRulesRepository {
  private rules: HouseRule[] = [
    {
      id: 'rule-1',
      house_id: 'house-123',
      number: 1,
      title: 'Silêncio após às 22h',
      description: 'Manter silêncio em áreas comuns',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'rule-2',
      house_id: 'house-123',
      number: 2,
      title: 'Louça lavada após uso',
      description: 'Não deixar louça na pia',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  async findByHouseId(houseId: string): Promise<HouseRule[]> {
    return this.rules.filter((r) => r.house_id === houseId);
  }

  async create(data: { house_id: string; number: number; title: string; description: string }): Promise<HouseRule> {
    const newRule: HouseRule = {
      id: `rule-${Date.now()}`,
      house_id: data.house_id,
      number: data.number,
      title: data.title,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.rules.push(newRule);
    return newRule;
  }

  async delete(id: string): Promise<HouseRule> {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Not found');
    const [deleted] = this.rules.splice(idx, 1);
    return deleted;
  }
}

describe('Regras de Convivência: Permissões de Exclusão e Criação (Unitário)', () => {
  it('deve permitir que ADMIN crie uma nova regra da residência', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    const rule = await service.createRule(
      'house-123',
      'Sapatos na sapateira',
      'Não entrar com calçados de rua',
      undefined,
      'ADMIN'
    );

    assert.equal(rule.title, 'Sapatos na sapateira');
    assert.equal(rule.number, 3);
  });

  it('deve permitir que SUB_ADMIN crie uma nova regra da residência', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    const rule = await service.createRule(
      'house-123',
      'Reciclagem correta',
      'Separar lixo seco e orgânico',
      undefined,
      'SUB_ADMIN'
    );

    assert.equal(rule.title, 'Reciclagem correta');
  });

  it('deve bloquear com 403 quando um morador regular (MEMBER) tentar criar uma regra', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    await assert.rejects(
      async () => {
        await service.createRule(
          'house-123',
          'Regra não autorizada',
          'Descrição',
          undefined,
          'MEMBER'
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, 'FORBIDDEN_RULE_CREATE');
        return true;
      }
    );
  });

  it('deve permitir que ADMIN remova uma regra da residência', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    const deleted = await service.deleteRule('rule-1', 'ADMIN');
    assert.equal(deleted.id, 'rule-1');

    const remaining = await service.getHouseRules('house-123');
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, 'rule-2');
  });

  it('deve permitir que SUB_ADMIN remova uma regra da residência', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    const deleted = await service.deleteRule('rule-2', 'SUB_ADMIN');
    assert.equal(deleted.id, 'rule-2');
  });

  it('deve bloquear com 403 quando um morador regular (MEMBER) tentar remover uma regra', async () => {
    const repo = new MockRulesRepository();
    const service = new RulesService(repo as any);

    await assert.rejects(
      async () => {
        await service.deleteRule('rule-1', 'MEMBER');
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, 'FORBIDDEN_RULE_DELETE');
        return true;
      }
    );
  });
});
