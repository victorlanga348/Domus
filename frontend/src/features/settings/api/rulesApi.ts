import { APP_CONFIG } from '../../../config/constants.js';
import { HouseRule } from '../../../types.js';

export const rulesApi = {
  async getRules(houseId: string): Promise<HouseRule[]> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/rules?houseId=${encodeURIComponent(houseId)}`, {
        headers: {
          'x-house-id': houseId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar regras da residência');
      }

      const json = await response.json();
      const rawRules = json.data || [];
      return rawRules.map((r: any, idx: number) => ({
        id: r.id,
        number: r.number ?? idx + 1,
        title: r.title,
        description: r.description || '',
      }));
    } catch (error) {
      console.warn('[RulesApi] Erro ao buscar regras:', error);
      return [];
    }
  },

  async createRule(
    houseId: string,
    rule: { title: string; description?: string; number?: number }
  ): Promise<HouseRule | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
        },
        body: JSON.stringify({
          house_id: houseId,
          title: rule.title,
          description: rule.description,
          number: rule.number,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar regra da residência');
      }

      const json = await response.json();
      const r = json.data;
      if (!r) return null;
      return {
        id: r.id,
        number: r.number,
        title: r.title,
        description: r.description || '',
      };
    } catch (error) {
      console.warn('[RulesApi] Erro ao criar regra:', error);
      return null;
    }
  },

  async deleteRule(ruleId: string, houseId?: string): Promise<boolean> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/rules/${encodeURIComponent(ruleId)}`, {
        method: 'DELETE',
        headers: {
          ...(houseId ? { 'x-house-id': houseId } : {}),
        },
      });

      return response.ok;
    } catch (error) {
      console.warn('[RulesApi] Erro ao remover regra:', error);
      return false;
    }
  },
};
