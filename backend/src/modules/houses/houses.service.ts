import bcrypt from 'bcryptjs';
import { prisma } from '../../database/prisma.js';
import { HouseRepository } from './houses.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { House } from '@prisma/client';

export class HouseService {
  constructor(private houseRepo = new HouseRepository()) {}

  /**
   * 1. createHouse:
   * Cria a casa, gera invite_code único e vincula o usuário como ADMIN (Arquiteto Principal).
   * Opção A: Remoção da necessidade de senha da residência.
   */
  async createHouse(userId: string, houseName: string, housePassword?: string) {
    if (!houseName || houseName.trim() === '') {
      throw new AppError('O nome da residência/sala é obrigatório.', 400, 'HOUSE_NAME_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    if (user.house_id) {
      throw new AppError('Usuário já pertence a uma residência ativa.', 400, 'USER_ALREADY_IN_HOUSE');
    }

    let password_hash = '';
    if (housePassword && housePassword.trim().length >= 4) {
      const saltRounds = 10;
      password_hash = await bcrypt.hash(housePassword.trim(), saltRounds);
    }

    // Gerar código de convite único (ex: CASA-4892)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const invite_code = `CASA-${randomCode}`;

    return prisma.$transaction(async (tx) => {
      // 1. Se o usuário já possuía residência ativa anterior, coloca a residência anterior em modo férias
      if (userId) {
        const currentUser = await tx.user.findUnique({ where: { id: userId } });
        if (currentUser?.house_id) {
          await tx.houseMember.upsert({
            where: { user_id_house_id: { user_id: userId, house_id: currentUser.house_id } },
            update: { vacation_mode: true },
            create: {
              user_id: userId,
              house_id: currentUser.house_id,
              role: currentUser.role,
              vacation_mode: true,
            },
          });
        }
      }

      const house = await tx.house.create({
        data: {
          name: houseName.trim(),
          invite_code,
          password_hash,
        },
      });

      // 2. Cria o vínculo da nova residência em HouseMember com papel de ADMIN ativo
      await tx.houseMember.upsert({
        where: { user_id_house_id: { user_id: userId, house_id: house.id } },
        update: { role: 'ADMIN', vacation_mode: false },
        create: {
          user_id: userId,
          house_id: house.id,
          role: 'ADMIN',
          vacation_mode: false,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          house_id: house.id,
          role: 'ADMIN',
          vacation_mode: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      return {
        house,
        user: updatedUser,
      };
    });
  }

  /**
   * 2. joinHouse:
   * Busca a casa prioritariamente pelo Código de Convite (@unique) ou nome e vincula o usuário como MEMBER (Morador).
   * Suporte a Multi-Residência: Permite ingressar sem sair da residência anterior; a anterior entra em modo férias.
   */
  async joinHouse(userId: string, houseIdentifier: string, _housePassword?: string) {
    if (!houseIdentifier || !houseIdentifier.trim()) {
      throw new AppError('O código de convite da residência é obrigatório.', 400, 'INVITE_CODE_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const trimmedIdentifier = houseIdentifier.trim();
    const formattedCode = trimmedIdentifier.toUpperCase();

    // Prioriza busca pelo Código Único de Entrada (invite_code), aceitando case-insensitive
    let house = await prisma.house.findUnique({
      where: { invite_code: formattedCode },
    });

    if (!house) {
      house = await prisma.house.findUnique({
        where: { invite_code: trimmedIdentifier },
      });
    }

    if (!house) {
      house = await prisma.house.findFirst({
        where: {
          name: {
            equals: trimmedIdentifier,
            mode: 'insensitive',
          },
        },
      });
    }

    if (!house) {
      throw new AppError('Residência não encontrada com o código fornecido.', 404, 'HOUSE_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Se o usuário já possuía residência ativa diferente, coloca o vínculo anterior em modo férias
      if (user.house_id && user.house_id !== house.id) {
        await tx.houseMember.upsert({
          where: { user_id_house_id: { user_id: userId, house_id: user.house_id } },
          update: { vacation_mode: true },
          create: {
            user_id: userId,
            house_id: user.house_id,
            role: user.role,
            vacation_mode: true,
          },
        });
      }

      // 2. Cria ou reativa o vínculo em HouseMember na nova residência como MEMBER e fora de férias
      await tx.houseMember.upsert({
        where: { user_id_house_id: { user_id: userId, house_id: house.id } },
        update: { role: 'MEMBER', vacation_mode: false },
        create: {
          user_id: userId,
          house_id: house.id,
          role: 'MEMBER',
          vacation_mode: false,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          house_id: house.id,
          role: 'MEMBER',
          vacation_mode: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      try {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        emitToHouse(house.id, 'house:members_updated', { houseId: house.id });
      } catch {}

      return {
        house,
        user: updatedUser,
      };
    });
  }

  async getHouseById(id: string): Promise<House> {
    const house = await this.houseRepo.findById(id);
    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }
    return house;
  }

  async lookupHouseByCode(inviteCode: string) {
    const house = await this.houseRepo.findByInviteCode(inviteCode);
    if (!house) {
      throw new AppError('Código de residência inválido.', 404, 'HOUSE_CODE_INVALID');
    }
    return house;
  }

  /**
   * 3. listMyHouses:
   * Lista as residências associadas ao usuário autenticado.
   */
  async listMyHouses(userId: string) {
    if (!userId) {
      return [];
    }
    return this.houseRepo.listMyHouses(userId);
  }

  /**
   * 4. switchHouse:
   * Alterna a residência ativa do usuário sem necessitar de novo login.
   * Regra Obrigatória: O Admin Geral pode alternar livremente para outra residência sem sair da primeira.
   * Ao alternar, o morador entra automaticamente em modo de férias (vacation_mode: true) na residência anterior.
   */
  async switchHouse(userId: string, targetHouseId: string) {
    if (!userId) {
      throw new AppError('Usuário não identificado.', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    const house = await this.houseRepo.findById(targetHouseId);
    if (!house) {
      throw new AppError('Residência não encontrada.', 404, 'HOUSE_NOT_FOUND');
    }

    const originHouseId = user.house_id;

    return prisma.$transaction(async (tx) => {
      // 1. Colocar o vínculo da casa de origem em modo de férias (se diferente da destino)
      if (originHouseId && originHouseId !== targetHouseId) {
        await tx.houseMember.upsert({
          where: { user_id_house_id: { user_id: userId, house_id: originHouseId } },
          update: { vacation_mode: true },
          create: {
            user_id: userId,
            house_id: originHouseId,
            role: user.role,
            vacation_mode: true,
          },
        });
      }

      // 2. Buscar ou inicializar o vínculo da residência de destino
      let targetMembership = await tx.houseMember.findUnique({
        where: { user_id_house_id: { user_id: userId, house_id: targetHouseId } },
      });

      if (!targetMembership) {
        // Se ainda não existir registro em HouseMember (ex: legado), cria com o papel atual
        targetMembership = await tx.houseMember.create({
          data: {
            user_id: userId,
            house_id: targetHouseId,
            role: 'MEMBER',
            vacation_mode: false,
          },
        });
      } else {
        // Ativa o morador na residência de destino (fora de férias)
        targetMembership = await tx.houseMember.update({
          where: { id: targetMembership.id },
          data: { vacation_mode: false },
        });
      }

      // 3. Atualizar a residência ativa no usuário com o cargo correspondente na residência de destino
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          house_id: targetHouseId,
          role: targetMembership.role,
          vacation_mode: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      // 4. Notificar ambas as residências via WebSocket
      try {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        if (originHouseId && originHouseId !== targetHouseId) {
          emitToHouse(originHouseId, 'house:members_updated', { houseId: originHouseId });
        }
        emitToHouse(targetHouseId, 'house:members_updated', { houseId: targetHouseId });
      } catch {}

      return {
        house,
        user: updatedUser,
      };
    });
  }

  /**
   * 5. leaveHouse:
   * Remove o vínculo da residência atual mantendo o morador autenticado.
   * Regra Obrigatória: Se o usuário for ADMIN (Admin Geral) e houver outros moradores na residência,
   * ele deve obrigatoriamente nomear outro morador ou subadmin (newAdminId) como novo Admin Geral antes de sair.
   */
  async leaveHouse(userId: string, newAdminId?: string) {
    if (!userId) {
      throw new AppError('Usuário não identificado.', 401, 'UNAUTHORIZED');
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }

    if (!currentUser.house_id) {
      throw new AppError('Usuário não pertence a nenhuma residência.', 400, 'NOT_IN_HOUSE');
    }

    const houseId = currentUser.house_id;

    // Se for o ADMIN (Admin Geral)
    if (currentUser.role === 'ADMIN') {
      // Contar outros moradores na residência
      const otherMembersCount = await prisma.user.count({
        where: {
          house_id: houseId,
          id: { not: userId },
        },
      });

      if (otherMembersCount > 0) {
        if (!newAdminId || newAdminId === userId) {
          throw new AppError(
            'Como Administrador Geral, você deve nomear outro morador ou subadministrador como Administrador Geral antes de sair da residência.',
            400,
            'ADMIN_TRANSFER_REQUIRED'
          );
        }

        // Validar que o sucessor pertence à mesma residência
        const successor = await prisma.user.findFirst({
          where: {
            id: newAdminId,
            house_id: houseId,
          },
        });

        if (!successor) {
          throw new AppError(
            'O morador indicado para sucessão não pertence a esta residência.',
            404,
            'SUCCESSOR_NOT_FOUND'
          );
        }

        // Execução atômica da sucessão e saída
        return prisma.$transaction(async (tx) => {
          // 1. Promover o novo Admin Geral em User e em HouseMember
          const promotedAdmin = await tx.user.update({
            where: { id: newAdminId },
            data: { role: 'ADMIN' },
            select: { id: true, name: true, email: true, role: true, house_id: true },
          });

          await tx.houseMember.updateMany({
            where: { user_id: newAdminId, house_id: houseId },
            data: { role: 'ADMIN' },
          });

          // 2. Remover o vínculo da casa atual em HouseMember
          await tx.houseMember.deleteMany({
            where: { user_id: userId, house_id: houseId },
          });

          // 3. Buscar se o morador pertence a outra residência ativa
          const nextHouse = await tx.houseMember.findFirst({
            where: { user_id: userId },
            orderBy: { updated_at: 'desc' },
          });

          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              house_id: nextHouse ? nextHouse.house_id : null,
              role: nextHouse ? nextHouse.role : 'MEMBER',
              vacation_mode: nextHouse ? nextHouse.vacation_mode : false,
            },
            select: { id: true, name: true, email: true, role: true, house_id: true },
          });

          // 4. Registrar log de atividade da residência
          await tx.activityLog.create({
            data: {
              user_id: userId,
              house_id: houseId,
              action_type: 'ROTATED',
              comment: `${currentUser.name} transferiu a liderança geral para ${successor.name} e saiu da residência.`,
            },
          });

          // 5. Notificar via WebSocket
          try {
            const { emitToHouse } = await import('../../shared/socket/socketServer.js');
            emitToHouse(houseId, 'house:admin_transferred', {
              previousAdminId: userId,
              newAdmin: promotedAdmin,
            });
            emitToHouse(houseId, 'house:member_left', {
              userId,
              name: currentUser.name,
            });
          } catch {}

          return {
            user: updatedUser,
            newAdmin: promotedAdmin,
          };
        });
      }
    }

    // Contar outros moradores na residência para checar se a casa ficou 100% vazia
    const remainingCount = await prisma.user.count({
      where: {
        house_id: houseId,
        id: { not: userId },
      },
    });

    if (remainingCount === 0) {
      return prisma.$transaction(async (tx) => {
        // 1. Remover o vínculo em HouseMember
        await tx.houseMember.deleteMany({
          where: { user_id: userId, house_id: houseId },
        });

        const nextHouse = await tx.houseMember.findFirst({
          where: { user_id: userId },
          orderBy: { updated_at: 'desc' },
        });

        // 2. Desvincular o usuário e apontar para outra residência se existir
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            house_id: nextHouse ? nextHouse.house_id : null,
            role: nextHouse ? nextHouse.role : 'MEMBER',
            vacation_mode: nextHouse ? nextHouse.vacation_mode : false,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            house_id: true,
          },
        });

        // 3. Casa 100% vazia (0 moradores): Excluir automaticamente do banco para evitar registros órfãos
        await tx.house.delete({
          where: { id: houseId },
        });

        return {
          user: updatedUser,
          houseDeleted: true,
        };
      });
    }

    // Caso não seja ADMIN, mas ainda restem outros moradores na casa
    return prisma.$transaction(async (tx) => {
      await tx.houseMember.deleteMany({
        where: { user_id: userId, house_id: houseId },
      });

      const nextHouse = await tx.houseMember.findFirst({
        where: { user_id: userId },
        orderBy: { updated_at: 'desc' },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          house_id: nextHouse ? nextHouse.house_id : null,
          role: nextHouse ? nextHouse.role : 'MEMBER',
          vacation_mode: nextHouse ? nextHouse.vacation_mode : false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      try {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        emitToHouse(houseId, 'house:member_left', {
          userId,
          name: currentUser.name,
        });
      } catch {}

      return {
        user: updatedUser,
      };
    });
  }

  /**
   * 6. regenerateInviteCode:
   * Gera um novo código determinístico para a residência, garantindo unicidade (@unique).
   * Ação exclusiva para o ADMIN (Admin Geral) da residência.
   */
  async regenerateInviteCode(houseId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.house_id !== houseId) {
      throw new AppError('Usuário não pertence a esta residência.', 403, 'FORBIDDEN');
    }

    if (user.role !== 'ADMIN') {
      throw new AppError('Apenas o Administrador Geral pode regenerar o código da residência.', 403, 'ADMIN_REQUIRED');
    }

    let newInviteCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      newInviteCode = `CASA-${randomCode}`;

      const existing = await prisma.house.findUnique({
        where: { invite_code: newInviteCode },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      newInviteCode = `CASA-${Date.now().toString().slice(-4)}`;
    }

    const updatedHouse = await this.houseRepo.updateInviteCode(houseId, newInviteCode);

    try {
      const { emitToHouse } = await import('../../shared/socket/socketServer.js');
      emitToHouse(houseId, 'house:code_regenerated', {
        houseId,
        invite_code: newInviteCode,
      });
    } catch {}

    return {
      id: updatedHouse.id,
      name: updatedHouse.name,
      invite_code: updatedHouse.invite_code,
    };
  }

  /**
   * 7. removeMember:
   * Remove um morador da residência, desvinculando-o no banco (house_id: null, role: MEMBER).
   * Regras de RBAC:
   * - Apenas Admin Geral (ADMIN) ou Sub-Administrador (Admin) podem remover moradores.
   * - Ninguém pode remover o Admin Geral da residência (target.role !== 'ADMIN').
   * - O usuário não pode auto-remover-se por este método (deve usar leaveHouse).
   * - O morador deve pertencer à residência do solicitante.
   */
  async removeMember(requesterId: string, targetMemberId: string, requesterRole?: string, houseId?: string) {
    if (!requesterId || !targetMemberId) {
      throw new AppError('Parâmetros obrigatórios ausentes (requesterId e targetMemberId).', 400, 'MISSING_PARAMS');
    }

    if (requesterId === targetMemberId) {
      throw new AppError('Você não pode se auto-remover pelas configurações. Use a opção de sair da residência.', 400, 'CANNOT_REMOVE_SELF');
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester || !requester.house_id) {
      throw new AppError('Usuário solicitante não encontrado ou não pertence a uma residência ativa.', 404, 'REQUESTER_NOT_FOUND');
    }

    const effectiveHouseId = houseId || requester.house_id;
    if (requester.house_id !== effectiveHouseId) {
      throw new AppError('Você não pertence a esta residência.', 403, 'FORBIDDEN');
    }

    const isGeneralAdmin = requester.role === 'ADMIN';
    const isSubAdmin = requesterRole === 'Admin' || requesterRole === 'ADMIN';

    if (!isGeneralAdmin && !isSubAdmin) {
      throw new AppError('Apenas administradores podem remover membros da residência.', 403, 'FORBIDDEN');
    }

    const target = await prisma.user.findUnique({
      where: { id: targetMemberId },
    });

    if (!target || target.house_id !== effectiveHouseId) {
      return {
        success: true,
        message: 'Morador já desvinculado da residência.',
      };
    }

    if (target.role === 'ADMIN') {
      throw new AppError('O Administrador Geral não pode ser removido da residência.', 403, 'CANNOT_REMOVE_GENERAL_ADMIN');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Desvincular usuário da casa e resetar cargo para MEMBER
      const updatedTarget = await tx.user.update({
        where: { id: targetMemberId },
        data: {
          house_id: null,
          role: 'MEMBER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          house_id: true,
        },
      });

      // 2. Remover participações de tarefas na residência
      await tx.taskParticipant.deleteMany({
        where: {
          user_id: targetMemberId,
          task: { house_id: effectiveHouseId },
        },
      });

      // 3. Registrar log de atividade da residência
      await tx.activityLog.create({
        data: {
          user_id: requesterId,
          house_id: effectiveHouseId,
          action_type: 'ROTATED',
          comment: `${target.name} foi removido da residência por ${requester.name}.`,
        },
      });

      // 4. Notificar via WebSocket
      try {
        const { emitToHouse } = await import('../../shared/socket/socketServer.js');
        emitToHouse(effectiveHouseId, 'house:member_removed', {
          userId: targetMemberId,
          name: target.name,
          removedBy: requester.name,
        });
        emitToHouse(effectiveHouseId, 'house:members_updated', {
          houseId: effectiveHouseId,
        });
      } catch {}

      return {
        success: true,
        removedUser: updatedTarget,
      };
    });
  }
}
