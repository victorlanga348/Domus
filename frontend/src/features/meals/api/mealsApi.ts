import { APP_CONFIG } from '../../../config/constants.js';
import { HouseMealPlan, MealItem, MealType, MealPeriodSchedule } from '../../../types.js';

export const mealsApi = {
  async getMealPlan(houseId: string): Promise<HouseMealPlan | null> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals?houseId=${encodeURIComponent(houseId)}`, {
      headers: {
        'x-house-id': houseId,
      },
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const err: any = new Error(json.message || (response.status === 404 ? 'HOUSE_NOT_FOUND' : 'Falha ao buscar plano de refeições'));
      err.status = response.status;
      err.code = json.code;
      throw err;
    }

    const json = await response.json();
    return json.data || null;
  },

  async saveMeal(
    houseId: string,
    meal: MealItem,
    userRole?: string
  ): Promise<HouseMealPlan | null> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-house-id': houseId,
        ...(userRole ? { 'x-user-role': userRole } : {}),
      },
      body: JSON.stringify({
        house_id: houseId,
        user_role: userRole,
        ...meal,
      }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err: any = new Error(json.message || 'Falha ao salvar prato no cardápio');
      err.status = response.status;
      err.code = json.code;
      throw err;
    }

    return json.data || null;
  },

  async deleteMeal(houseId: string, mealId: string, userRole?: string): Promise<HouseMealPlan | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals/${encodeURIComponent(mealId)}?houseId=${encodeURIComponent(houseId)}`, {
        method: 'DELETE',
        headers: {
          'x-house-id': houseId,
          ...(userRole ? { 'x-user-role': userRole } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir prato do cardápio');
      }

      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.warn('[MealsApi] Erro ao excluir refeição:', error);
      return null;
    }
  },

  async clearMeals(houseId: string, userRole?: string): Promise<HouseMealPlan | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
          ...(userRole ? { 'x-user-role': userRole } : {}),
        },
        body: JSON.stringify({
          house_id: houseId,
          user_role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao esvaziar cardápio');
      }

      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.warn('[MealsApi] Erro ao limpar cardápio:', error);
      return null;
    }
  },

  async toggleLock(
    houseId: string,
    userId?: string,
    userRole?: string
  ): Promise<HouseMealPlan | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
          ...(userId ? { 'x-user-id': userId } : {}),
          ...(userRole ? { 'x-user-role': userRole } : {}),
        },
        body: JSON.stringify({
          house_id: houseId,
          user_id: userId,
          user_role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao alterar bloqueio do cardápio');
      }

      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.warn('[MealsApi] Erro ao alternar bloqueio:', error);
      return null;
    }
  },

  async updateSchedules(
    houseId: string,
    schedules: Record<MealType, MealPeriodSchedule>,
    userRole?: string
  ): Promise<HouseMealPlan | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/meals/schedules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
          ...(userRole ? { 'x-user-role': userRole } : {}),
        },
        body: JSON.stringify({
          house_id: houseId,
          schedules,
          user_role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar horários das refeições');
      }

      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.warn('[MealsApi] Erro ao atualizar horários:', error);
      return null;
    }
  },
};
