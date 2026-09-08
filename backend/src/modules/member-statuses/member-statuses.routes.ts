import { Router } from 'express';
import { MemberStatusesController } from './member-statuses.controller.js';

const memberStatusesRoutes = Router();
const controller = new MemberStatusesController();

memberStatusesRoutes.get('/', controller.getStatuses);
memberStatusesRoutes.put('/', controller.updateStatus);
memberStatusesRoutes.post('/', controller.updateStatus);

export { memberStatusesRoutes };
