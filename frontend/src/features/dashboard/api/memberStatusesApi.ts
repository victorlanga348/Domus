import { APP_CONFIG } from '../../../config/constants.js';
import { MemberStatus } from '../../../types.js';

export const memberStatusesApi = {
  async getStatuses(houseId: string): Promise<MemberStatus[]> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/statuses?houseId=${encodeURIComponent(houseId)}`, {
        headers: {
          'x-house-id': houseId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar status dos moradores');
      }

      const json = await response.json();
      const rawStatuses = json.data || [];
      return rawStatuses.map((s: any) => ({
        id: s.user_id || s.id,
        name: s.user?.name || 'Morador',
        avatar: s.user?.avatar_url,
        location: s.location,
        icon: s.icon || 'home',
      }));
    } catch (error) {
      console.warn('[MemberStatusesApi] Erro ao buscar status:', error);
      return [];
    }
  },

  async updateStatus(
    houseId: string,
    userId: string,
    location: string,
    icon?: string
  ): Promise<MemberStatus | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': houseId,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          house_id: houseId,
          user_id: userId,
          location,
          icon,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do morador');
      }

      const json = await response.json();
      const s = json.data;
      if (!s) return null;

      return {
        id: s.user_id || s.id,
        name: s.user?.name || 'Morador',
        avatar: s.user?.avatar_url,
        location: s.location,
        icon: s.icon || 'home',
      };
    } catch (error) {
      console.warn('[MemberStatusesApi] Erro ao salvar status:', error);
      return null;
    }
  },
};
