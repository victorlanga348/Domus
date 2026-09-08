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
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const { pin } = req.body;
      const result = await this.taskService.completeTask(id, userId, pin, userRole);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  rotateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const result = await this.taskService.rotateTask(id, userId);
      const houseId = req.houseId || (req.headers['x-house-id'] as string) || result.task.house_id;

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:rotation_advanced', { rotationId: id, taskId: id, nextAssignee: result.nextAssignee });
          emitToHouse(houseId, 'task:updated', result);
        } catch {}
      }

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  revertTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;
      const result = await this.taskService.revertTask(id, userId, userRole);
      res.status(200).json({ status: 'success', data: result });
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

  failTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { user_id, comment } = req.body;
      const task = await this.taskService.failTask(id, user_id, comment);
      res.status(200).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string);

      await this.taskService.deleteTask(id, userId, userRole);
      res.status(200).json({ status: 'success', message: 'Tarefa excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  requestSwap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const { reason } = req.body;

      const swapData = await this.taskService.requestSwap(id, userId, reason);
      const houseId = req.houseId || (req.headers['x-house-id'] as string);

      // Emite evento via WebSocket para a residência
      if (houseId) {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        emitToHouse(houseId, 'task:swap_requested', swapData);
      }

      res.status(200).json({ status: 'success', data: swapData });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;

      const result = await this.taskService.updateTask(id, userId, userRole, req.body);
      const houseId = req.houseId || (req.headers['x-house-id'] as string) || result.task.house_id;

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'task:updated', result);
        } catch {}
      }

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  forgiveFailure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const userRole = req.user?.role || (req.headers['x-user-role'] as string) || req.body.user_role;

      const result = await this.taskService.forgiveFailure(id, userId, userRole);
      const houseId = req.houseId || (req.headers['x-house-id'] as string);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'task:updated', { taskId: id });
        } catch {}
      }

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  processExpirations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string) || req.body.house_id;
      const result = await this.taskService.processDailyExpirations(houseId);

      if (houseId && result.advancedRotations.length > 0) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          for (const rotId of result.advancedRotations) {
            emitToHouse(houseId, 'house:rotation_advanced', { rotationId: rotId, taskId: rotId });
          }
        } catch {}
      }

      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
