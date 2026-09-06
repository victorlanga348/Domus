import { io, Socket } from 'socket.io-client';
import { APP_CONFIG } from '../../config/constants.js';

let socket: Socket | null = null;
let lastJoinedHouse: { houseId: string; user?: { id: string; name?: string; avatar?: string } } | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(APP_CONFIG.SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado ao servidor DOMUS em tempo real:', socket?.id);
      if (lastJoinedHouse?.houseId) {
        socket?.emit('house:join', lastJoinedHouse);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado do servidor:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Erro de conexão com WebSocket:', error.message);
    });
  }

  return socket;
}

export function joinHouseRoom(houseId: string, user?: { id: string; name?: string; avatar?: string }): void {
  const s = getSocket();
  if (houseId) {
    lastJoinedHouse = { houseId, user };
    s.emit('house:join', { houseId, user });
  }
}

export function leaveHouseRoom(houseId: string): void {
  const s = getSocket();
  if (houseId) {
    if (lastJoinedHouse?.houseId === houseId) {
      lastJoinedHouse = null;
    }
    s.emit('house:leave', { houseId });
  }
}

export function joinPrivateRoom(roomId: string, user?: { id: string; name?: string }): void {
  const s = getSocket();
  if (roomId) {
    s.emit('room:join', { roomId, user });
  }
}

export function leavePrivateRoom(roomId: string): void {
  const s = getSocket();
  if (roomId) {
    s.emit('room:leave', { roomId });
  }
}

export function emitTaskLocking(taskId: string, userId: string, houseId: string): void {
  const s = getSocket();
  s.emit('task:locking', { taskId, userId, houseId });
}

export function emitTaskUnlocking(taskId: string, userId: string, houseId: string): void {
  const s = getSocket();
  s.emit('task:unlocking', { taskId, userId, houseId });
}

export function emitHouseLog(houseId: string, log: any): void {
  const s = getSocket();
  if (houseId && log) {
    s.emit('house:log', { houseId, log });
  }
}

export function emitTaskCreated(houseId: string, task: any): void {
  const s = getSocket();
  if (houseId && task) s.emit('house:task_created', { houseId, task });
}

export function emitTaskDeleted(houseId: string, taskId: string): void {
  const s = getSocket();
  if (houseId && taskId) s.emit('house:task_deleted', { houseId, taskId });
}

export function emitTaskUpdated(houseId: string, task: any): void {
  const s = getSocket();
  if (houseId && task) s.emit('house:task_updated', { houseId, task });
}

export function emitTaskStatusChanged(houseId: string, taskId: string, status: string): void {
  const s = getSocket();
  if (houseId && taskId) s.emit('house:task_status_changed', { houseId, taskId, status });
}

export function emitNoteCreated(houseId: string, note: any): void {
  const s = getSocket();
  if (houseId && note) s.emit('house:note_created', { houseId, note });
}

export function emitNoteDeleted(houseId: string, noteId: string): void {
  const s = getSocket();
  if (houseId && noteId) s.emit('house:note_deleted', { houseId, noteId });
}

export function emitStatusChanged(houseId: string, status: any): void {
  const s = getSocket();
  if (houseId && status) s.emit('house:status_changed', { houseId, status });
}

export function emitRuleCreated(houseId: string, rule: any): void {
  const s = getSocket();
  if (houseId && rule) s.emit('house:rule_created', { houseId, rule });
}

export function emitRuleDeleted(houseId: string, ruleId: string): void {
  const s = getSocket();
  if (houseId && ruleId) s.emit('house:rule_deleted', { houseId, ruleId });
}

export function emitRotationAdvanced(houseId: string, rotationId: string): void {
  const s = getSocket();
  if (houseId && rotationId) s.emit('house:rotation_advanced', { houseId, rotationId });
}

export function emitMembersUpdated(houseId: string, payload?: any): void {
  const s = getSocket();
  if (houseId) s.emit('house:members_updated', { houseId, ...payload });
}
