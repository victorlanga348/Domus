import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Erros operacionais conhecidos da aplicação
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      error: err.message,
    });
    return;
  }

  // 2. Erros de integridade e constraints do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'campo único';
      res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_ENTRY',
        message: `Já existe um registro com este ${target}.`,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        code: 'RECORD_NOT_FOUND',
        message: 'O registro solicitado não foi encontrado no banco de dados.',
      });
      return;
    }

    res.status(400).json({
      status: 'error',
      code: `PRISMA_${err.code}`,
      message: 'Erro de validação ou integridade no banco de dados.',
    });
    return;
  }

  // 3. Erro de autenticação JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      code: 'AUTH_TOKEN_INVALID',
      message: 'Token de autenticação inválido ou expirado.',
    });
    return;
  }

  // 4. Erros não capturados do servidor (500)
  console.error('[Unhandled Internal Error]:', err);

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno no servidor.',
  });
};
