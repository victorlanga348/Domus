import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { taskRoutes } from './modules/tasks/tasks.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { houseRoutes } from './modules/houses/houses.routes.js';
import { activityLogRoutes } from './modules/activity-logs/activity-logs.routes.js';

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

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Error Handler Central
app.use(errorHandler);

export { app };
