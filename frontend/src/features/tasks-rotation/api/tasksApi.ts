import { APP_CONFIG } from '../../../config/constants.js';
import { emitTaskLocking } from '../../../shared/socket/socketClient.js';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE';
  creator_id: string;
  house_id: string;
  participant_ids: string[];
}

export const tasksApi = {
  async getTasks(houseId: string, userId?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks?houseId=${encodeURIComponent(houseId)}`, {
      headers: {
        'x-house-id': houseId,
        ...(userId ? { 'x-user-id': userId } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao listar tarefas');
    }

    const json = await response.json();
    return json.data || [];
  },

  async createTask(data: CreateTaskPayload) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-house-id': data.house_id,
        'x-user-id': data.creator_id,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao criar tarefa');
    }

    return json.data;
  },

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      shift?: 'MORNING' | 'AFTERNOON' | 'NIGHT';
      frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE';
      participant_ids?: string[];
    },
    userId?: string,
    userRole?: string
  ) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(userRole ? { 'x-user-role': userRole } : {}),
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || json.error || 'Erro ao atualizar tarefa de rodízio');
    }

    return json.data;
  },

  async lockTask(taskId: string, userId: string, houseId: string) {
    // Emite evento instantâneo via Socket
    emitTaskLocking(taskId, userId, houseId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-house-id': houseId,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao trancar tarefa');
    }

    return json.data;
  },

  async completeTask(taskId: string, userId: string, pin?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ user_id: userId, pin }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || json.error || 'Erro ao concluir tarefa');
    }

    return json.data;
  },

  async revertTask(taskId: string, userId: string, userRole?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/revert`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        ...(userRole ? { 'x-user-role': userRole } : {}),
      },
      body: JSON.stringify({ user_id: userId, user_role: userRole }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || json.error || 'Erro ao reverter tarefa');
    }

    return json.data;
  },

  async blockTask(taskId: string, userId: string, reason: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ user_id: userId, reason }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao registrar bloqueio');
    }

    return json.data;
  },

  async failTask(taskId: string, userId: string, comment?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/fail`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ user_id: userId, comment }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao registrar falha');
    }

    return json.data;
  },

  async requestSwap(taskId: string, userId: string, reason?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}/request-swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ reason }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao solicitar troca');
    }

    return json.data;
  },

  async deleteTask(taskId: string, userId: string, userRole?: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId,
        ...(userRole ? { 'x-user-role': userRole } : {}),
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao excluir tarefa');
    }

    return json;
  },

  async toggleVacation(userId: string) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/vacation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erro ao alternar modo férias');
    }

    return json.data;
  },
};
