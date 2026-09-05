import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authMiddleware, requireHouse } from '../../shared/middlewares/authMiddleware.js';

export const dashboardRoutes = Router();
const controller = new DashboardController();

// GET /api/v1/dashboard e GET /api/dashboard
dashboardRoutes.get('/', authMiddleware, requireHouse, controller.getDashboard);

// Mural de Recados Centralizado
dashboardRoutes.post('/bulletin', authMiddleware, requireHouse, controller.createBulletinPost);
dashboardRoutes.delete('/bulletin/:id', authMiddleware, requireHouse, controller.deleteBulletinPost);
