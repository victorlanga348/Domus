import { APP_CONFIG } from '../../../config/constants.js';
import type { RoomItem, RoomMessage, RoomParticipant, CreateRoomInput } from '../types/index.js';

const BASE_URL = `${APP_CONFIG.API_BASE_URL}/rooms`;

export const roomsApi = {
  async listMyRooms(userId: string): Promise<RoomItem[]> {
    try {
      const response = await fetch(`${BASE_URL}/my-rooms?userId=${encodeURIComponent(userId)}`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar minhas salas');
      }

      const json = await response.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async joinByCredentials(data: { title: string; password: string }, userId: string): Promise<{ room: RoomItem; participant: RoomParticipant }> {
    const response = await fetch(`${BASE_URL}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        title: data.title,
        password: data.password,
        user_id: userId,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Credenciais da sala inválidas');
    }

    return json.data;
  },

  async listRooms(houseId: string, userId: string): Promise<RoomItem[]> {
    try {
      const response = await fetch(`${BASE_URL}?houseId=${encodeURIComponent(houseId)}&userId=${encodeURIComponent(userId)}`, {
        headers: {
          'x-house-id': houseId,
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar salas');
      }

      const json = await response.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createRoom(data: CreateRoomInput, houseId: string, userId: string): Promise<RoomItem> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-house-id': houseId,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        title: data.title,
        password: data.password,
        house_id: houseId,
        creator_user_id: userId,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao criar sala');
    }

    return json.data;
  },

  async joinRoom(roomId: string, password: string, userId: string): Promise<RoomParticipant> {
    const response = await fetch(`${BASE_URL}/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ password, user_id: userId }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Senha incorreta');
    }

    return json.data;
  },

  async promoteMember(roomId: string, targetUserId: string, requesterUserId: string): Promise<RoomParticipant> {
    const response = await fetch(`${BASE_URL}/${roomId}/promote`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': requesterUserId,
      },
      body: JSON.stringify({
        targetUserId,
        requester_user_id: requesterUserId,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Falha ao promover usuário a Arquiteto');
    }

    return json.data;
  },

  async getMessages(roomId: string, userId: string): Promise<RoomMessage[]> {
    const response = await fetch(`${BASE_URL}/${roomId}/messages?userId=${encodeURIComponent(userId)}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao obter mensagens');
    }

    return json.data || [];
  },

  async sendMessage(roomId: string, text: string, userId: string): Promise<RoomMessage> {
    const response = await fetch(`${BASE_URL}/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ text, user_id: userId }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao enviar mensagem');
    }

    return json.data;
  },
};
