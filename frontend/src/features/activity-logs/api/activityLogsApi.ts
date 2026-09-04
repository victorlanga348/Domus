import { APP_CONFIG } from '../../../config/constants.js';

export interface CreateActivityLogPayload {
  house_id: string;
  user_id: string;
  action_type: 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'LOCKED' | 'ROTATED';
  comment?: string;
  task_id?: string;
}

export interface ActivityLogResponse {
  id: string;
  task_id?: string | null;
  user_id: string;
  house_id: string;
  action_type: string;
  comment?: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  task?: {
    id: string;
    title: string;
  } | null;
}

export const activityLogsApi = {
  async getLogs(houseId: string, limit = 50): Promise<ActivityLogResponse[]> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/activity-logs?houseId=${encodeURIComponent(houseId)}&limit=${limit}`, {
        headers: {
          'x-house-id': houseId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao listar registros de atividade');
      }

      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.warn('[ActivityLogsApi] Erro ao buscar logs:', error);
      return [];
    }
  },

  async createLog(payload: CreateActivityLogPayload): Promise<ActivityLogResponse | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/activity-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-house-id': payload.house_id,
          'x-user-id': payload.user_id,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar log de atividade');
      }

      const json = await response.json();
      return json.data;
    } catch (error) {
      console.warn('[ActivityLogsApi] Erro ao criar log:', error);
      return null;
    }
  },
};
