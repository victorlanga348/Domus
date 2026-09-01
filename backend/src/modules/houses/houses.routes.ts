import { Router } from 'express';
import { HouseController } from './houses.controller.js';

export const houseRoutes = Router();
const controller = new HouseController();

houseRoutes.get('/my-houses', controller.listMyHouses);
houseRoutes.get('/lookup/:code', controller.lookupByCode);
houseRoutes.get('/:id', controller.getHouse);
houseRoutes.post('/', controller.createHouse);
houseRoutes.post('/create', controller.createHouse);
houseRoutes.post('/join', controller.joinHouse);
houseRoutes.post('/switch', controller.switchHouse);
houseRoutes.post('/leave', controller.leaveHouse);
