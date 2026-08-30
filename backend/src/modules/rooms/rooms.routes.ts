import { Router } from 'express';
import { RoomController } from './rooms.controller.js';
import { ensureArchitect } from '../../shared/middlewares/ensureArchitect.js';

export const roomRoutes = Router();
const controller = new RoomController();

// Listagem e criação de salas
roomRoutes.get('/', controller.listRooms);
roomRoutes.post('/', controller.createRoom);

// Entrada na sala com verificação de senha
roomRoutes.post('/:id/join', controller.joinRoom);

// Promoção de membros (Protegido por ensureArchitect)
roomRoutes.patch('/:id/promote', ensureArchitect, controller.promoteMember);
roomRoutes.patch('/:id/members/:userId/role', ensureArchitect, controller.updateMemberRole);

// Mensagens na sala
roomRoutes.get('/:id/messages', controller.getMessages);
roomRoutes.post('/:id/messages', controller.sendMessage);
