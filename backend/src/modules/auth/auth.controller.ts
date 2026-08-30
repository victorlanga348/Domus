import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  verifyPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id, pin } = req.body;
      const isValid = await this.authService.verifyPin(user_id, pin);
      res.status(200).json({ status: 'success', data: { valid: isValid } });
    } catch (error) {
      next(error);
    }
  };

  toggleVacation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId || (req.headers['x-user-id'] as string) || req.body.user_id;
      const updatedUser = await this.authService.toggleVacation(userId);

      // Emite evento via WebSocket para a residência avisando sobre alteração no rodízio
      if (updatedUser.house_id) {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        emitToHouse(updatedUser.house_id, 'member:vacation_changed', {
          userId: updatedUser.id,
          name: updatedUser.name,
          vacation_mode: updatedUser.vacation_mode,
        });
      }

      res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
      next(error);
    }
  };
}
