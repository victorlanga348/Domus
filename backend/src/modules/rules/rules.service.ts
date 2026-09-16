import { RulesRepository } from './rules.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { HouseRule } from '@prisma/client';

export class RulesService {
  constructor(private repo = new RulesRepository()) {}

  async getHouseRules(houseId: string): Promise<HouseRule[]> {
    if (!houseId) {
      throw new AppError('Identificador da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }
    return this.repo.findByHouseId(houseId);
  }

  async createRule(
    houseId: string,
    title: string,
    description: string,
    customNumber?: number,
    userRole?: string
  ): Promise<HouseRule> {
    if (!houseId) {
      throw new AppError('Identificador da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }
    if (userRole && !['ADMIN', 'SUB_ADMIN', 'Admin Geral', 'Admin'].includes(userRole)) {
      throw new AppError('Apenas administradores podem criar regras da residência.', 403, 'FORBIDDEN_RULE_CREATE');
    }
    if (!title || !title.trim()) {
      throw new AppError('Título da regra é obrigatório.', 400, 'TITLE_REQUIRED');
    }

    const existing = await this.repo.findByHouseId(houseId);
    const ruleNumber = customNumber || existing.length + 1;

    return this.repo.create({
      house_id: houseId,
      number: ruleNumber,
      title: title.trim(),
      description: (description || '').trim(),
    });
  }

  async deleteRule(id: string, userRole?: string): Promise<HouseRule> {
    if (!id) {
      throw new AppError('ID da regra é obrigatório.', 400, 'ID_REQUIRED');
    }
    if (userRole && !['ADMIN', 'SUB_ADMIN', 'Admin Geral', 'Admin'].includes(userRole)) {
      throw new AppError('Apenas administradores podem remover regras da residência.', 403, 'FORBIDDEN_RULE_DELETE');
    }
    return this.repo.delete(id);
  }
}
