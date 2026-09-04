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

  createBulletinPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawHeaderHouse = req.headers['x-house-id'];
      const rawHeaderUser = req.headers['x-user-id'];
      const houseId = String(req.houseId || req.body.houseId || (Array.isArray(rawHeaderHouse) ? rawHeaderHouse[0] : rawHeaderHouse) || '');
      const authorId = String(req.userId || req.body.author_id || (Array.isArray(rawHeaderUser) ? rawHeaderUser[0] : rawHeaderUser) || '');
      const content = String(req.body.content || '');

      const post = await this.dashboardService.createBulletinPost(houseId, authorId, content);
      res.status(201).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  deleteBulletinPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawParamId = req.params.id;
      const postId = String(Array.isArray(rawParamId) ? rawParamId[0] : rawParamId || '');
      const rawHeaderUser = req.headers['x-user-id'];
      const userId = String(req.userId || (Array.isArray(rawHeaderUser) ? rawHeaderUser[0] : rawHeaderUser) || req.query.userId || '');

      const result = await this.dashboardService.deleteBulletinPost(postId, userId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}
