import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma.js';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware para validar se o usuário é ARCHITECT na sala alvo.
 */
export async function checkArchitectRole(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomId = String(req.params.id || req.params.roomId);
    const userId = (req.headers['x-user-id'] as string) || req.body.requester_user_id || req.body.user_id;

    if (!userId) {
      throw new AppError('Identificação do usuário requerida (Header x-user-id ou user_id).', 401, 'UNAUTHORIZED');
    }

    if (!roomId) {
      throw new AppError('ID da sala é obrigatório.', 400, 'ROOM_ID_REQUIRED');
    }

    const participant = await prisma.participant.findUnique({
      where: {
        user_id_room_id: {
          user_id: userId,
          room_id: roomId,
        },
      },
    });

    if (!participant || participant.role !== 'ARCHITECT') {
      throw new AppError('Acesso negado: Apenas Arquitetos podem gerenciar esta sala.', 403, 'FORBIDDEN_NOT_ARCHITECT');
    }

    next();
  } catch (error) {
    next(error);
  }
}
