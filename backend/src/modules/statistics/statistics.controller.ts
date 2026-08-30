import type { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './statistics.service.js';

export class StatisticsController {
  constructor(private analyticsService = new AnalyticsService()) {}

  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.houseId || (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const data = await this.analyticsService.getHouseStatistics(houseId);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}
