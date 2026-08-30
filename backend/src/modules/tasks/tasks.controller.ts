import type { Request, Response, NextFunction } from 'express';
import { TaskService } from './tasks.service.js';

export class TaskController {
  constructor(private taskService = new TaskService()) {}

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const tasks = await this.taskService.getHouseTasks(houseId);
      res.status(200).json({ status: 'success', data: tasks });
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.createTask(req.body);
      res.status(201).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  };

  lockTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { user_id } = req.body;
      const task = await this.taskService.lockTask(id, user_id);
      res.status(200).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { user_id } = req.body;
      const task = await this.taskService.completeTask(id, user_id);
      res.status(200).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  };

  getNextAssignee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const assignee = await this.taskService.getNextAssignee(id);
      res.status(200).json({ status: 'success', data: assignee });
    } catch (error) {
      next(error);
    }
  };

  blockTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { user_id, reason } = req.body;
      const task = await this.taskService.blockTask(id, user_id, reason);
      res.status(200).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  };
}
