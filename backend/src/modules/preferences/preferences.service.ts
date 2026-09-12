import { PreferencesRepository } from './preferences.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { HousePreference } from '@prisma/client';

export class PreferencesService {
  constructor(private repo = new PreferencesRepository()) {}

  async getPreferences(houseId: string): Promise<HousePreference> {
    if (!houseId) {
      throw new AppError('Identificador da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }
    const pref = await this.repo.findByHouseId(houseId);
    if (!pref) {
      // Cria padrão caso ainda não exista
      return this.repo.upsert(houseId, {
        night_mode: true,
        start_time: '23:00',
        end_time: '07:00',
      });
    }
    return pref;
  }

  async updatePreferences(houseId: string, data: {
    night_mode?: boolean;
    start_time?: string;
    end_time?: string;
  }): Promise<HousePreference> {
    if (!houseId) {
      throw new AppError('Identificador da residência não fornecido.', 400, 'HOUSE_ID_REQUIRED');
    }
    return this.repo.upsert(houseId, data);
  }
}
