import { Router } from 'express';
import { RulesController } from './rules.controller.js';

const rulesRoutes = Router();
const controller = new RulesController();

rulesRoutes.get('/', controller.getRules);
rulesRoutes.post('/', controller.createRule);
rulesRoutes.delete('/:id', controller.deleteRule);

export { rulesRoutes };
