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
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/v1/dashboard`, {
      headers: {
        'x-house-id': houseId,
        ...(userId ? { 'x-user-id': userId } : {}),
      },
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errorMsg = json.message || json.code || (response.status === 404 ? 'HOUSE_NOT_FOUND' : response.status === 401 ? 'AUTH_TOKEN_INVALID' : 'DASHBOARD_ERROR');
      throw new Error(errorMsg);
    }

    const json = await response.json();
    return json.data || null;
  },

  async createBulletinPost(houseId: string, authorId: string, content: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/v1/dashboard/bulletin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-house-id': houseId,
        'x-user-id': authorId,
      },
      body: JSON.stringify({ houseId, author_id: authorId, content }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao publicar recado no mural');
    }

    return json.data;
  },

  async deleteBulletinPost(postId: string, userId: string, houseId?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/v1/dashboard/bulletin/${postId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId,
        ...(houseId ? { 'x-house-id': houseId } : {}),
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao remover recado do mural');
    }

    return json.data;
  },
};
