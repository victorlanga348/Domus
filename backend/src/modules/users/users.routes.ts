import { Router } from 'express';
import { UserController } from './users.controller.js';

export const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/', controller.getUsers);
userRoutes.get('/:id', controller.getUser);
userRoutes.post('/', controller.createUser);
userRoutes.patch('/:id/vacation', controller.toggleVacation);
