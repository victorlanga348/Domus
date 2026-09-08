import { Router } from 'express';
import { MealsController } from './meals.controller.js';

const mealsRoutes = Router();
const controller = new MealsController();

mealsRoutes.get('/', controller.getMealPlan);
mealsRoutes.put('/', controller.saveMeal);
mealsRoutes.post('/', controller.saveMeal);
mealsRoutes.delete('/clear', controller.clearMeals);
mealsRoutes.delete('/:id', controller.deleteMeal);
mealsRoutes.post('/lock', controller.toggleLock);
mealsRoutes.put('/schedules', controller.updateSchedules);

export { mealsRoutes };
