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
      const house = await this.houseService.createHouse(req.body);
      res.status(201).json({ status: 'success', data: house });
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
