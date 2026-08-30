import { APP_CONFIG } from '../../../config/constants.js';

export interface DashboardTaskItem {
  id: string;
  title: string;
  description?: string | null;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE';
  status: 'OPEN' | 'LOCKED' | 'BLOCKED' | 'COMPLETED';
  last_block_reason?: string | null;
  locked_at?: string | null;
  locked_by?: {
    id: string;
    name: string;
  } | null;
  rotation_index: number;
  current_assignee?: {
    id: string;
    name: string;
    email: string;
    vacation_mode: boolean;
  } | null;
  participants_count: number;
}

export interface DashboardData {
  house: {
    id: string;
    name: string;
    invite_code: string;
  };
  shift_info: {
    current_shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
    server_time: string;
  };
  summary: {
    pending_tasks_count: number;
    completed_today_count: number;
    members_count: number;
    members_on_vacation_count: number;
  };
  current_shift_tasks: DashboardTaskItem[];
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    vacation_mode: boolean;
  }>;
  bulletin_posts: Array<{
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      name: string;
    };
  }>;
}

export const dashboardApi = {
  async getDashboardData(houseId: string, userId?: string): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/v1/dashboard`, {
        headers: {
          'x-house-id': houseId,
          ...(userId ? { 'x-user-id': userId } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar dashboard agregador');
      }

      const json = await response.json();
      return json.data;
    } catch (error) {
      console.warn('[DashboardApi] Erro na requisição BFF, usando fallback:', error);
      return null;
    }
  },
};
