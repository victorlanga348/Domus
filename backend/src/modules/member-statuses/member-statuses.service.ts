import { MemberStatusesRepository } from './member-statuses.repository.js';
import { AppError } from '../../shared/errors/AppError.js';

export class MemberStatusesService {
  constructor(private repo = new MemberStatusesRepository()) {}

  async getStatuses(houseId: string) {
    if (!houseId) {
      throw new AppError('ID da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }
    const statuses = await this.repo.findByHouseId(houseId);
    return statuses.map((s) => ({
      id: s.user_id,
      name: s.user.name,
      avatar: s.user.avatar_url,
      location: s.location,
      icon: s.icon,
      updatedAt: s.updated_at.toISOString(),
    }));
  }

  async updateStatus(houseId: string, userId: string, location: string, icon: string) {
    if (!houseId || !userId) {
      throw new AppError('Dados incompletos para atualizar status.', 400, 'INCOMPLETE_DATA');
    }
    const updated = await this.repo.upsertStatus(houseId, userId, location || 'Em Casa', icon || 'home');
    return {
      id: updated.user_id,
      name: updated.user.name,
      avatar: updated.user.avatar_url,
      location: updated.location,
      icon: updated.icon,
      updatedAt: updated.updated_at.toISOString(),
    };
  }
}
