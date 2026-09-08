import { MealsRepository } from './meals.repository.js';
import { AppError } from '../../shared/errors/AppError.js';

export class MealsService {
  constructor(private repo = new MealsRepository()) {}

  async getMealPlan(houseId: string) {
    if (!houseId) {
      throw new AppError('ID da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }

    let plan = await this.repo.findByHouseId(houseId);
    if (!plan) {
      plan = await this.repo.ensureMealPlan(houseId);
    }

    let schedules = null;
    if (plan.schedules_json) {
      try {
        schedules = JSON.parse(plan.schedules_json);
      } catch {}
    }

    const formattedMeals = (plan.meals || []).map((m) => {
      let tags: string[] = [];
      if (m.tags_json) {
        try {
          tags = JSON.parse(m.tags_json);
        } catch {}
      }
      return {
        id: m.id,
        dayOfWeek: m.day_of_week,
        mealType: m.meal_type,
        title: m.title,
        description: m.description || '',
        tags,
        updatedAt: m.updated_at.toISOString(),
        updatedBy: m.updated_by || undefined,
      };
    });

    return {
      id: plan.id,
      houseId: plan.house_id,
      isLocked: plan.is_locked,
      lockedBy: plan.locked_by_id || undefined,
      lockedByName: plan.locked_by?.name || undefined,
      lockedAt: plan.locked_at ? plan.locked_at.toISOString() : undefined,
      schedules: schedules || undefined,
      meals: formattedMeals,
    };
  }

  async saveMeal(
    houseId: string,
    data: {
      id?: string;
      dayOfWeek: string;
      mealType: string;
      title: string;
      description?: string;
      tags?: string[];
      updatedBy?: string;
    },
    userRole?: string
  ) {
    const plan = await this.repo.ensureMealPlan(houseId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'Admin Geral' || userRole === 'Admin';

    if (plan.is_locked && !isAdmin) {
      throw new AppError('O cardápio semanal está trancado. Apenas administradores podem fazer alterações.', 403, 'MEAL_PLAN_LOCKED');
    }

    await this.repo.saveMealItem(plan.id, data);
    return this.getMealPlan(houseId);
  }

  async deleteMeal(houseId: string, mealId: string, userRole?: string) {
    const plan = await this.repo.ensureMealPlan(houseId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'Admin Geral' || userRole === 'Admin';

    if (plan.is_locked && !isAdmin) {
      throw new AppError('O cardápio semanal está trancado. Apenas administradores podem fazer alterações.', 403, 'MEAL_PLAN_LOCKED');
    }

    await this.repo.deleteMealItem(mealId);
    return this.getMealPlan(houseId);
  }

  async clearMeals(houseId: string, userRole?: string) {
    const plan = await this.repo.ensureMealPlan(houseId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'Admin Geral' || userRole === 'Admin';

    if (plan.is_locked && !isAdmin) {
      throw new AppError('O cardápio semanal está trancado. Apenas administradores podem fazer alterações.', 403, 'MEAL_PLAN_LOCKED');
    }

    await this.repo.clearAllMeals(plan.id);
    return this.getMealPlan(houseId);
  }

  async toggleLock(houseId: string, userId: string, userRole?: string) {
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'Admin Geral' || userRole === 'Admin';
    if (!isAdmin) {
      throw new AppError('Apenas administradores podem trancar ou destrancar o cardápio semanal.', 403, 'FORBIDDEN_LOCK_MEALS');
    }

    const plan = await this.repo.ensureMealPlan(houseId);
    const nextLocked = !plan.is_locked;
    await this.repo.setLock(plan.id, nextLocked, userId);
    return this.getMealPlan(houseId);
  }

  async updateSchedules(houseId: string, schedules: any, userRole?: string) {
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'Admin Geral' || userRole === 'Admin';
    if (!isAdmin) {
      throw new AppError('Apenas administradores podem alterar os horários das refeições.', 403, 'FORBIDDEN_SCHEDULES_MEALS');
    }

    const plan = await this.repo.ensureMealPlan(houseId);
    const jsonStr = JSON.stringify(schedules);
    await this.repo.updateSchedules(plan.id, jsonStr);
    return this.getMealPlan(houseId);
  }
}
