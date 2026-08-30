import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../shared/middlewares/authMiddleware.js';

export const authRoutes = Router();
const controller = new AuthController();

// Rate limiter para proteção contra força bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas tentativas a partir deste IP. Tente novamente em 15 minutos.',
  },
});

authRoutes.post('/register', authLimiter, controller.register);
authRoutes.post('/login', authLimiter, controller.login);
authRoutes.post('/verify-pin', authLimiter, controller.verifyPin);
authRoutes.patch('/vacation', authMiddleware, controller.toggleVacation);
