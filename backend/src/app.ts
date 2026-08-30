import express, { type Express } from 'express';
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

const app: Express = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Rotas da API
app.get('/api/health', (_req, res) => {
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
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/rooms', roomRoutes);

// Error Handler Central
app.use(errorHandler);

export { app };
