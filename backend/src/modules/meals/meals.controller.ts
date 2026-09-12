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
