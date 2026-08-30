import type { Request, Response, NextFunction } from 'express';
import { HouseService } from './houses.service.js';

export class HouseController {
  constructor(private houseService = new HouseService()) {}

  getHouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const house = await this.houseService.getHouseById(id);
      res.status(200).json({ status: 'success', data: house });
    } catch (error) {
      next(error);
    }
  };

  createHouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.user_id || req.body.userId;
      const houseName = req.body.houseName || req.body.name || req.body.house_name;
      const housePassword = req.body.housePassword || req.body.password || req.body.house_password;

      const result = await this.houseService.createHouse(userId, houseName, housePassword);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  joinHouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.user_id || req.body.userId;
      const houseName = req.body.houseName || req.body.name || req.body.house_name;
      const housePassword = req.body.housePassword || req.body.password || req.body.house_password;

      const result = await this.houseService.joinHouse(userId, houseName, housePassword);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  lookupByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = String(req.params.code);
      const house = await this.houseService.lookupHouseByCode(code);
      res.status(200).json({ status: 'success', data: house });
    } catch (error) {
      next(error);
    }
  };
}
