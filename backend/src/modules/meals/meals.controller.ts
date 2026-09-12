import type { Request, Response, NextFunction } from 'express';
import { MealsService } from './meals.service.js';

export class MealsController {
  constructor(private service = new MealsService()) {}

  getMealPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const plan = await this.service.getMealPlan(houseId);
      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };

  saveMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const { id, dayOfWeek, mealType, title, description, tags, updatedBy } = req.body;
      const plan = await this.service.saveMeal(
        houseId,
        { id, dayOfWeek, mealType, title, description, tags, updatedBy },
        userRole
      );

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          const savedMeal = plan.meals.find(
            (m) => m.id === id || (m.dayOfWeek === dayOfWeek && m.mealType === mealType)
          );
          if (savedMeal) {
            emitToHouse(houseId, 'house:meal_updated', { meal: savedMeal });
          }
        } catch {}
      }

      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };

  deleteMeal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const userRole = req.user?.role || (req.headers['x-user-role'] as string);
      const mealId = String(req.params.id);
      const plan = await this.service.deleteMeal(houseId, mealId, userRole);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:meal_deleted', { mealId });
        } catch {}
      }

      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };

  clearMeals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const plan = await this.service.clearMeals(houseId, userRole);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:meals_cleared', { houseId });
        } catch {}
      }

      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };

  toggleLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const plan = await this.service.toggleLock(houseId, userId, userRole);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:meal_lock_toggled', {
            isLocked: plan.isLocked,
            lockedBy: plan.lockedBy,
            lockedByName: plan.lockedByName,
            lockedAt: plan.lockedAt,
          });
        } catch {}
      }

      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };

  updateSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const { schedules } = req.body;
      const plan = await this.service.updateSchedules(houseId, schedules, userRole);
      res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  };
}
