import { Router } from 'express';
import { HouseController } from './houses.controller.js';

export const houseRoutes = Router();
const controller = new HouseController();

houseRoutes.get('/:id', controller.getHouse);
houseRoutes.get('/lookup/:code', controller.lookupByCode);
houseRoutes.post('/', controller.createHouse);
