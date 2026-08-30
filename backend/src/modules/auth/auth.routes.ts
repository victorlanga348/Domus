import { Router } from 'express';
import { AuthController } from './auth.controller.js';

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post('/register', controller.register);
authRoutes.post('/login', controller.login);
authRoutes.post('/verify-pin', controller.verifyPin);
