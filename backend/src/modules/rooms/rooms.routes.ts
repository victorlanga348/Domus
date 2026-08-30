import { Router } from 'express';
import { RoomController } from './rooms.controller.js';
import { checkArchitectRole } from '../../shared/middlewares/checkRole.js';

export const roomRoutes = Router();
const controller = new RoomController();

// Listagem e criação de salas
roomRoutes.get('/', controller.listRooms);
roomRoutes.post('/', controller.createRoom);

// Entrada na sala com verificação de senha
roomRoutes.post('/:id/join', controller.joinRoom);

// Promoção de membros (Protegido por checkArchitectRole)
roomRoutes.patch('/:id/members/:userId/role', checkArchitectRole, controller.updateMemberRole);

// Mensagens na sala
roomRoutes.get('/:id/messages', controller.getMessages);
roomRoutes.post('/:id/messages', controller.sendMessage);
