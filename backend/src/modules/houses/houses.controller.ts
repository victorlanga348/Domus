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
      const inviteCode =
        req.body.inviteCode ||
        req.body.invite_code ||
        req.body.code ||
        req.body.houseName ||
        req.body.name ||
        req.body.house_name;
      const housePassword = req.body.housePassword || req.body.password || req.body.house_password;

      const result = await this.houseService.joinHouse(userId, inviteCode, housePassword);
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

  listMyHouses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
      const houses = await this.houseService.listMyHouses(userId);
      res.status(200).json({ status: 'success', data: houses });
    } catch (error) {
      next(error);
    }
  };

  switchHouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || req.body.user_id;
      const targetHouseId = req.body.targetHouseId || req.body.houseId || req.body.house_id;
      const result = await this.houseService.switchHouse(userId, targetHouseId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  leaveHouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.body.userId || req.body.user_id;
      const newAdminId = req.body.newAdminId || req.body.new_admin_id || req.body.successorId;
      const result = await this.houseService.leaveHouse(userId, newAdminId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  regenerateCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = String(req.params.id);
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.userId || req.body.user_id;
      const result = await this.houseService.regenerateInviteCode(houseId, userId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
