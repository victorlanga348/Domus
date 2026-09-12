import type { Request, Response, NextFunction } from 'express';
import { MemberStatusesService } from './member-statuses.service.js';

export class MemberStatusesController {
  constructor(private service = new MemberStatusesService()) {}

  getStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const statuses = await this.service.getStatuses(houseId);
      res.status(200).json({ status: 'success', data: statuses });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const { location, icon } = req.body;
      const status = await this.service.updateStatus(houseId, userId, location, icon);

      if (houseId) {
        try {
          const { emitToHouse } = await import('../../shared/socket/socketServer.js');
          emitToHouse(houseId, 'house:status_changed', status);
        } catch {}
      }

      res.status(200).json({ status: 'success', data: status });
    } catch (err) {
      next(err);
    }
  };
}
