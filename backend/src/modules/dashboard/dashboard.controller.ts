import type { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private dashboardService = new DashboardService()) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.houseId || (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const currentUserId = req.userId || (req.query.userId as string) || (req.headers['x-user-id'] as string);

      const data = await this.dashboardService.getDashboardData(houseId, currentUserId);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}
