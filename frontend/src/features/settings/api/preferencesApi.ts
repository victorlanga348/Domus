import { APP_CONFIG } from '../../../config/constants.js';
import { SystemPreferences } from '../../../types.js';

export const preferencesApi = {
  async getPreferences(houseId: string): Promise<SystemPreferences | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/preferences?houseId=${encodeURIComponent(houseId)}`, {
        headers: {
          'x-house-id': houseId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar preferências da residência');
      }

      const json = await response.json();
      const data = json.data;
      if (!data) return null;

      return {
        nightMode: {
          enabled: Boolean(data.night_mode),
          startTime: data.start_time || '23:00',
          endTime: data.end_time || '07:00',
        },
      };
    } catch (error) {
      console.warn('[PreferencesApi] Erro ao buscar preferências:', error);
      return null;
    }
  },

  async updatePreferences(houseId: string, preferences: SystemPreferences): Promise<SystemPreferences | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
        },
        body: JSON.stringify({
          house_id: houseId,
          night_mode: preferences.nightMode.enabled,
          start_time: preferences.nightMode.startTime,
          end_time: preferences.nightMode.endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar preferências da residência');
      }

      const json = await response.json();
      const data = json.data;
      if (!data) return null;

      return {
        nightMode: {
          enabled: Boolean(data.night_mode),
          startTime: data.start_time || '23:00',
          endTime: data.end_time || '07:00',
        },
      };
    } catch (error) {
      console.warn('[PreferencesApi] Erro ao atualizar preferências:', error);
      return null;
    }
  },
};
