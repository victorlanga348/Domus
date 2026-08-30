import { Router } from 'express';
import { TaskController } from './tasks.controller.js';

export const taskRoutes = Router();
const controller = new TaskController();

taskRoutes.get('/', controller.getTasks);
taskRoutes.get('/:id/assignee', controller.getNextAssignee);
taskRoutes.post('/', controller.createTask);
taskRoutes.post('/:id/lock', controller.lockTask);
taskRoutes.post('/:id/complete', controller.completeTask);
taskRoutes.post('/:id/block', controller.blockTask);
