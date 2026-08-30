import { useEffect } from 'react';
import { getSocket, joinHouseRoom, leaveHouseRoom } from './socketClient.js';

interface SocketCallbacks {
  onTaskLocked?: (data: { taskId: string; userId: string; lockedAt: string }) => void;
  onTaskUnlocked?: (data: { taskId: string; reason?: string }) => void;
  onVacationChanged?: (data: { userId: string; name: string; vacation_mode: boolean }) => void;
  onSwapRequested?: (data: { taskId: string; taskTitle: string; requesterName: string; reason: string }) => void;
}

export function useHouseSocket(houseId: string, callbacks?: SocketCallbacks) {
  useEffect(() => {
    if (!houseId) return;

    const socket = getSocket();
    joinHouseRoom(houseId);

    const handleTaskLocked = (data: any) => {
      callbacks?.onTaskLocked?.(data);
    };

    const handleTaskUnlocked = (data: any) => {
      callbacks?.onTaskUnlocked?.(data);
    };

    const handleVacationChanged = (data: any) => {
      callbacks?.onVacationChanged?.(data);
    };

    const handleSwapRequested = (data: any) => {
      callbacks?.onSwapRequested?.(data);
    };

    socket.on('task:locked', handleTaskLocked);
    socket.on('task:unlocked', handleTaskUnlocked);
    socket.on('member:vacation_changed', handleVacationChanged);
    socket.on('task:swap_requested', handleSwapRequested);

    return () => {
      socket.off('task:locked', handleTaskLocked);
      socket.off('task:unlocked', handleTaskUnlocked);
      socket.off('member:vacation_changed', handleVacationChanged);
      socket.off('task:swap_requested', handleSwapRequested);
      leaveHouseRoom(houseId);
    };
  }, [houseId, callbacks]);
}
