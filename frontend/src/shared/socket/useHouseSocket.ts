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
  onTaskCreated?: (task: any) => void;
  onTaskDeleted?: (data: { taskId: string }) => void;
  onTaskStatusChanged?: (data: { taskId: string; status: string }) => void;
  onNoteCreated?: (note: any) => void;
  onNoteDeleted?: (data: { noteId: string }) => void;
  onStatusChanged?: (status: any) => void;
  onRuleCreated?: (rule: any) => void;
  onRuleDeleted?: (data: { ruleId: string }) => void;
  onRotationAdvanced?: (data: { rotationId: string }) => void;
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

    const handleTaskLocked = (data: any) => callbacks?.onTaskLocked?.(data);
    const handleTaskUnlocked = (data: any) => callbacks?.onTaskUnlocked?.(data);
    const handleVacationChanged = (data: any) => callbacks?.onVacationChanged?.(data);
    const handleSwapRequested = (data: any) => callbacks?.onSwapRequested?.(data);
    const handlePresence = (data: any) => callbacks?.onPresence?.(data);
    const handleMembersUpdated = () => callbacks?.onMembersUpdated?.();
    const handleActivityLog = (log: any) => callbacks?.onActivityLog?.(log);

    const handleTaskCreated = (task: any) => callbacks?.onTaskCreated?.(task);
    const handleTaskDeleted = (data: any) => callbacks?.onTaskDeleted?.(data);
    const handleTaskStatusChanged = (data: any) => callbacks?.onTaskStatusChanged?.(data);
    const handleNoteCreated = (note: any) => callbacks?.onNoteCreated?.(note);
    const handleNoteDeleted = (data: any) => callbacks?.onNoteDeleted?.(data);
    const handleStatusChanged = (status: any) => callbacks?.onStatusChanged?.(status);
    const handleRuleCreated = (rule: any) => callbacks?.onRuleCreated?.(rule);
    const handleRuleDeleted = (data: any) => callbacks?.onRuleDeleted?.(data);
    const handleRotationAdvanced = (data: any) => callbacks?.onRotationAdvanced?.(data);

    socket.on('task:locked', handleTaskLocked);
    socket.on('task:unlocked', handleTaskUnlocked);
    socket.on('member:vacation_changed', handleVacationChanged);
    socket.on('task:swap_requested', handleSwapRequested);
    socket.on('house:presence', handlePresence);
    socket.on('house:members_updated', handleMembersUpdated);
    socket.on('house:activity_log', handleActivityLog);

    socket.on('house:task_created', handleTaskCreated);
    socket.on('house:task_deleted', handleTaskDeleted);
    socket.on('house:task_status_changed', handleTaskStatusChanged);
    socket.on('house:note_created', handleNoteCreated);
    socket.on('house:note_deleted', handleNoteDeleted);
    socket.on('house:status_changed', handleStatusChanged);
    socket.on('house:rule_created', handleRuleCreated);
    socket.on('house:rule_deleted', handleRuleDeleted);
    socket.on('house:rotation_advanced', handleRotationAdvanced);

    return () => {
      socket.off('task:locked', handleTaskLocked);
      socket.off('task:unlocked', handleTaskUnlocked);
      socket.off('member:vacation_changed', handleVacationChanged);
      socket.off('task:swap_requested', handleSwapRequested);
      socket.off('house:presence', handlePresence);
      socket.off('house:members_updated', handleMembersUpdated);
      socket.off('house:activity_log', handleActivityLog);

      socket.off('house:task_created', handleTaskCreated);
      socket.off('house:task_deleted', handleTaskDeleted);
      socket.off('house:task_status_changed', handleTaskStatusChanged);
      socket.off('house:note_created', handleNoteCreated);
      socket.off('house:note_deleted', handleNoteDeleted);
      socket.off('house:status_changed', handleStatusChanged);
      socket.off('house:rule_created', handleRuleCreated);
      socket.off('house:rule_deleted', handleRuleDeleted);
      socket.off('house:rotation_advanced', handleRotationAdvanced);

      leaveHouseRoom(houseId);
    };
  }, [houseId, callbacks, user?.id, user?.name, user?.avatar]);
}
