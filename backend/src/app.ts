import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { taskRoutes } from './modules/tasks/tasks.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { houseRoutes } from './modules/houses/houses.routes.js';
import { activityLogRoutes } from './modules/activity-logs/activity-logs.routes.js';
import { roomRoutes } from './modules/rooms/rooms.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { statisticsRoutes } from './modules/statistics/statistics.routes.js';
import { rulesRoutes } from './modules/rules/rules.routes.js';
import { preferencesRoutes } from './modules/preferences/preferences.routes.js';
import { mealsRoutes } from './modules/meals/meals.routes.js';
import { memberStatusesRoutes } from './modules/member-statuses/member-statuses.routes.js';

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (env.NODE_ENV === 'development') return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
    return true;
  }
  return origin === env.CORS_ORIGIN;
};

const app: Express = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json());

// Rotas da API
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'domus-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/statistics', statisticsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/house', houseRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tarefas', taskRoutes);
app.use('/tarefas', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/statuses', memberStatusesRoutes);

// Error Handler Central
app.use(errorHandler);

export { app };
