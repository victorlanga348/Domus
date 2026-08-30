import { io, Socket } from 'socket.io-client';
import { APP_CONFIG } from '../../config/constants.js';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(APP_CONFIG.SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado ao servidor DOMUS em tempo real:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Desconectado do servidor');
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Erro de conexão com WebSocket:', error.message);
    });
  }

  return socket;
}

export function joinHouseRoom(houseId: string): void {
  const s = getSocket();
  if (houseId) {
    s.emit('house:join', houseId);
  }
}

export function leaveHouseRoom(houseId: string): void {
  const s = getSocket();
  if (houseId) {
    s.emit('house:leave', houseId);
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
