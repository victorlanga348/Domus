import type { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './activity-logs.service.js';

export class ActivityLogController {
  constructor(private logService = new ActivityLogService()) {}

  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const logs = await this.logService.getHouseLogs(houseId, limit);
      res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      next(error);
    }
  };

  createLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const log = await this.logService.createLog(req.body);
      res.status(201).json({ status: 'success', data: log });
    } catch (error) {
      next(error);
    }
  };
}
