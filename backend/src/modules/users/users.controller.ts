import type { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service.js';

export class UserController {
  constructor(private userService = new UserService()) {}

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const houseId = (req.query.houseId as string) || (req.headers['x-house-id'] as string);
      const users = await this.userService.getHouseUsers(houseId);
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const user = await this.userService.getUserById(id);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  toggleVacation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { vacation_mode } = req.body;
      const user = await this.userService.toggleVacationMode(id, Boolean(vacation_mode));
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };
}
