import { useEffect, useRef } from 'react';
import { getSocket, joinHouseRoom, leaveHouseRoom } from './socketClient.js';

interface SocketCallbacks {
  onTaskLocked?: (data: { taskId: string; userId: string; lockedAt: string }) => void;
  onTaskUnlocked?: (data: { taskId: string; reason?: string }) => void;
  onVacationChanged?: (data: { userId: string; name: string; vacation_mode: boolean }) => void;
  onSwapRequested?: (data: { taskId: string; taskTitle: string; requesterName: string; reason: string }) => void;
  onPresence?: (data: { houseId: string; onlineCount: number; onlineUserIds: string[]; users: any[] }) => void;
  onMembersUpdated?: (data?: any) => void;
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
  onCodeRegenerated?: (data: { houseId: string; invite_code: string }) => void;
}

export function useHouseSocket(
  houseId: string,
  callbacks?: SocketCallbacks,
  user?: { id: string; name?: string; avatar?: string }
) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!houseId) return;

    const socket = getSocket();
    joinHouseRoom(houseId, userRef.current);

    const handleTaskLocked = (data: any) => callbacksRef.current?.onTaskLocked?.(data);
    const handleTaskUnlocked = (data: any) => callbacksRef.current?.onTaskUnlocked?.(data);
    const handleVacationChanged = (data: any) => callbacksRef.current?.onVacationChanged?.(data);
    const handleSwapRequested = (data: any) => callbacksRef.current?.onSwapRequested?.(data);
    const handlePresence = (data: any) => callbacksRef.current?.onPresence?.(data);
    const handleMembersUpdated = (data: any) => callbacksRef.current?.onMembersUpdated?.(data);
    const handleActivityLog = (log: any) => callbacksRef.current?.onActivityLog?.(log);

    const handleTaskCreated = (task: any) => callbacksRef.current?.onTaskCreated?.(task);
    const handleTaskDeleted = (data: any) => callbacksRef.current?.onTaskDeleted?.(data);
    const handleTaskStatusChanged = (data: any) => callbacksRef.current?.onTaskStatusChanged?.(data);
    const handleNoteCreated = (note: any) => callbacksRef.current?.onNoteCreated?.(note);
    const handleNoteDeleted = (data: any) => callbacksRef.current?.onNoteDeleted?.(data);
    const handleStatusChanged = (status: any) => callbacksRef.current?.onStatusChanged?.(status);
    const handleRuleCreated = (rule: any) => callbacksRef.current?.onRuleCreated?.(rule);
    const handleRuleDeleted = (data: any) => callbacksRef.current?.onRuleDeleted?.(data);
    const handleRotationAdvanced = (data: any) => callbacksRef.current?.onRotationAdvanced?.(data);
    const handleCodeRegenerated = (data: any) => callbacksRef.current?.onCodeRegenerated?.(data);

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
    socket.on('house:code_regenerated', handleCodeRegenerated);

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
      socket.off('house:code_regenerated', handleCodeRegenerated);

      leaveHouseRoom(houseId);
    };
  }, [houseId, user?.id]);
}
