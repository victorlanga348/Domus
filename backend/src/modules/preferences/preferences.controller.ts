import type { Request, Response, NextFunction } from 'express';
import { PreferencesService } from './preferences.service.js';

export class PreferencesController {
  constructor(private service = new PreferencesService()) {}

  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const pref = await this.service.getPreferences(houseId);
      res.status(200).json({ status: 'success', data: pref });
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = req.body.house_id || (req.headers['x-house-id'] as string);
      const { night_mode, start_time, end_time } = req.body;
      const pref = await this.service.updatePreferences(houseId, { night_mode, start_time, end_time });
      res.status(200).json({ status: 'success', data: pref });
    } catch (err) {
      next(err);
    }
  };
}
