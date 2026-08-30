import { APP_CONFIG } from '../../../config/constants.js';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  pin: string;
}

export interface HousePayload {
  name: string;
  password: string;
  user_id: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  vacation_mode: boolean;
  house_id?: string | null;
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
        housePassword: data.password,
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
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/house/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': data.user_id,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        houseName: data.name,
        housePassword: data.password,
        user_id: data.user_id,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Credenciais da residência inválidas');
    }

    return json.data;
  },
};
