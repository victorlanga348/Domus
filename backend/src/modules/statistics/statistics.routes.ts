import { Router } from 'express';
import { StatisticsController } from './statistics.controller.js';
import { authMiddleware, requireHouse } from '../../shared/middlewares/authMiddleware.js';

export const statisticsRoutes = Router();
const controller = new StatisticsController();

// GET /api/v1/statistics e GET /api/statistics
statisticsRoutes.get('/', authMiddleware, requireHouse, controller.getStatistics);
