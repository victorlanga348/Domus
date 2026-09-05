import { Router } from 'express';
import { ActivityLogController } from './activity-logs.controller.js';

export const activityLogRoutes = Router();
const controller = new ActivityLogController();

activityLogRoutes.get('/', controller.getLogs);
activityLogRoutes.post('/', controller.createLog);
