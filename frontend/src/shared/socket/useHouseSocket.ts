import { useEffect } from 'react';
import { getSocket, joinHouseRoom, leaveHouseRoom } from './socketClient.js';

interface SocketCallbacks {
  onTaskLocked?: (data: { taskId: string; userId: string; lockedAt: string }) => void;
  onTaskUnlocked?: (data: { taskId: string; reason?: string }) => void;
  onVacationChanged?: (data: { userId: string; name: string; vacation_mode: boolean }) => void;
  onSwapRequested?: (data: { taskId: string; taskTitle: string; requesterName: string; reason: string }) => void;
  onPresence?: (data: { houseId: string; onlineCount: number; onlineUserIds: string[]; users: any[] }) => void;
  onMembersUpdated?: () => void;
  onActivityLog?: (log: any) => void;
}

export function useHouseSocket(
  houseId: string,
  callbacks?: SocketCallbacks,
  user?: { id: string; name?: string; avatar?: string }
) {
  useEffect(() => {
    if (!houseId) return;

    const socket = getSocket();
    joinHouseRoom(houseId, user);

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

    const handlePresence = (data: any) => {
      callbacks?.onPresence?.(data);
    };

    const handleMembersUpdated = () => {
      callbacks?.onMembersUpdated?.();
    };

    const handleActivityLog = (log: any) => {
      callbacks?.onActivityLog?.(log);
    };

    socket.on('task:locked', handleTaskLocked);
    socket.on('task:unlocked', handleTaskUnlocked);
    socket.on('member:vacation_changed', handleVacationChanged);
    socket.on('task:swap_requested', handleSwapRequested);
    socket.on('house:presence', handlePresence);
    socket.on('house:members_updated', handleMembersUpdated);
    socket.on('house:activity_log', handleActivityLog);

    return () => {
      socket.off('task:locked', handleTaskLocked);
      socket.off('task:unlocked', handleTaskUnlocked);
      socket.off('member:vacation_changed', handleVacationChanged);
      socket.off('task:swap_requested', handleSwapRequested);
      socket.off('house:presence', handlePresence);
      socket.off('house:members_updated', handleMembersUpdated);
      socket.off('house:activity_log', handleActivityLog);
      leaveHouseRoom(houseId);
    };
  }, [houseId, callbacks, user?.id, user?.name, user?.avatar]);
}
