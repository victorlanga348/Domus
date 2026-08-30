import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';
import { prisma } from '../../database/prisma.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  houseId?: string | null;
}

/**
 * Valida o Token JWT no cabeçalho Authorization ou x-auth-token.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);

    if (!authHeader) {
      // Se enviado via x-user-id direto em ambiente de dev/teste
      const fallbackUserId = req.headers['x-user-id'] as string;
      const fallbackHouseId = req.headers['x-house-id'] as string;

      if (fallbackUserId) {
        req.userId = fallbackUserId;
        req.houseId = fallbackHouseId;
        req.user = {
          userId: fallbackUserId,
          email: 'dev@domus.local',
          role: 'MEMBER',
          houseId: fallbackHouseId,
        };
        return next();
      }

      throw new AppError('Token de autenticação não fornecido.', 401, 'AUTH_TOKEN_MISSING');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      req.userId = decoded.userId;
      req.houseId = decoded.houseId || (req.headers['x-house-id'] as string);
      req.user = decoded;

      // Se houseId não estava no token, tenta buscar no banco
      if (!req.houseId && req.userId) {
        const user = await prisma.user.findUnique({
          where: { id: req.userId },
          select: { house_id: true },
        });
        if (user?.house_id) {
          req.houseId = user.house_id;
        }
      }

      next();
    } catch {
      throw new AppError('Token de autenticação inválido ou expirado.', 401, 'AUTH_TOKEN_INVALID');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Garante que o usuário autenticado pertença a uma residência ativa.
 */
export function requireHouse(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.houseId) {
    throw new AppError(
      'Usuário não está vinculado a nenhuma residência. Crie ou entre em uma residência.',
      403,
      'HOUSE_REQUIRED'
    );
  }
  next();
}
