import { Router } from 'express';
import { TaskController } from './tasks.controller.js';

export const taskRoutes = Router();
const controller = new TaskController();

taskRoutes.get('/', controller.getTasks);
taskRoutes.get('/:id/assignee', controller.getNextAssignee);
taskRoutes.post('/', controller.createTask);
taskRoutes.post('/:id/lock', controller.lockTask);
taskRoutes.post('/:id/complete', controller.completeTask);
taskRoutes.patch('/:id/complete', controller.completeTask);
taskRoutes.post('/:id/concluir', controller.completeTask);
taskRoutes.patch('/:id/concluir', controller.completeTask);
taskRoutes.post('/:id/revert', controller.revertTask);
taskRoutes.patch('/:id/revert', controller.revertTask);
taskRoutes.post('/:id/reverter', controller.revertTask);
taskRoutes.patch('/:id/reverter', controller.revertTask);
taskRoutes.post('/:id/block', controller.blockTask);
taskRoutes.patch('/:id/block', controller.blockTask);
taskRoutes.post('/:id/fail', controller.failTask);
taskRoutes.patch('/:id/fail', controller.failTask);
taskRoutes.post('/:id/request-swap', controller.requestSwap);
taskRoutes.delete('/:id', controller.deleteTask);
