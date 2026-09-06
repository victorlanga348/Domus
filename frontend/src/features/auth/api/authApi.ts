import { APP_CONFIG } from '../../../config/constants.js';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  pin?: string;
}

export interface HousePayload {
  name?: string;
  inviteCode?: string;
  password?: string;
  user_id: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  vacation_mode: boolean;
  house_id?: string | null;
  avatar?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface HouseResponse {
  house: {
    id: string;
    name: string;
    invite_code: string;
  };
  user: AuthUser;
}

export const authApi = {
  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao realizar login com o Google');
    }

    return json.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao realizar login');
    }

    return json.data;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao criar conta');
    }

    return json.data;
  },

  async createHouse(data: HousePayload, token?: string): Promise<HouseResponse> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': data.user_id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        houseName: data.name,
        housePassword: data.password || '',
        user_id: data.user_id,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao fundar residência');
    }

    return json.data;
  },

  async joinHouse(data: HousePayload, token?: string): Promise<HouseResponse> {
    const code = data.inviteCode || data.name || '';
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': data.user_id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        inviteCode: code,
        houseName: code,
        housePassword: data.password || '',
        user_id: data.user_id,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Código de convite da residência inválido');
    }

    return json.data;
  },

  async listMyHouses(userId: string, token?: string): Promise<any[]> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/my-houses?userId=${userId}`, {
        headers: {
          'x-user-id': userId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) return [];
      const json = await response.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async switchHouse(userId: string, targetHouseId: string, token?: string): Promise<HouseResponse> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId,
        targetHouseId,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao trocar de residência');
    }

    return json.data;
  },

  async leaveHouse(userId: string, token?: string, newAdminId?: string): Promise<void> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId, newAdminId }),
    });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || 'Erro ao sair da residência');
    }
  },

  async regenerateHouseCode(houseId: string, userId: string, token?: string): Promise<{ invite_code: string }> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/${houseId}/regenerate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao regenerar código da residência');
    }

    return json.data;
  },
};
