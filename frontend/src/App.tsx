/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TabType,
  FamilyMember,
  HouseTask,
  TaskRotation,
  ExpenseItem,
  HouseRule,
  ActivityLog,
  SystemPreferences,
  MuralNote,
  MemberStatus,
  MealItem,
  HouseMealPlan,
} from './types';
import { INITIAL_PREFERENCES } from './data.js';
import { Sidebar, Header } from './layouts/index.js';
import { DashboardView, dashboardApi } from './features/dashboard/index.js';
import { TasksRotationsView, tasksApi } from './features/tasks-rotation/index.js';
import { MealsView, createDefaultMealPlan } from './features/meals/index.js';
import { SettingsView } from './features/settings/index.js';
import { ReportsView } from './features/reports/index.js';
import { StatisticsView } from './features/statistics/index.js';
import { activityLogsApi } from './features/activity-logs/index.js';
import {
  AddExpenseModal,
  RequestReimbursementModal,
  AddHouseRuleModal,
  AddMemberModal,
  NotificationsDrawer,
  FamilyMembersDrawer,
  LeadershipTransferModal,
  LeaveHouseModal,
  ConfirmActionModal,
} from './components/index.js';
import { AuthView, HouseSelectionView, authApi, type AuthUser, type HouseResponse } from './features/auth/index.js';
import {
  useHouseSocket,
  emitHouseLog,
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitTaskStatusChanged,
  emitNoteCreated,
  emitNoteDeleted,
  emitStatusChanged,
  emitRuleCreated,
  emitRuleDeleted,
  emitRotationAdvanced,
  emitMembersUpdated,
  emitMealUpdated,
  emitMealDeleted,
  emitMealLockToggled,
} from './shared/socket/index.js';

function mapBackendTaskToHouseTask(task: any, currentMembers: FamilyMember[]): HouseTask {
  let period: 'morning' | 'afternoon' | 'night' = 'morning';
  if (task.shift === 'AFTERNOON') period = 'afternoon';
  if (task.shift === 'NIGHT') period = 'night';

  let status: HouseTask['status'] = 'pending';
  if (task.status === 'COMPLETED') status = 'completed';
  else if (task.status === 'BLOCKED') status = 'alert';
  else status = 'pending';

  let assignee: any = null;
  const isRotation = Boolean(task.participants && task.participants.length > 1);
  const rawParticipants = task.participants || [];
  const participantIds = rawParticipants.map((p: any) => p.user_id || p.user?.id || p.id).filter(Boolean);
  const participants = rawParticipants.map((p: any) => {
    const u = p.user || p;
    return {
      id: u.id,
      name: u.name,
      avatar: u.avatar_url || currentMembers.find((m) => m.id === u.id)?.avatar,
      vacation_mode: Boolean(u.vacation_mode),
    };
  });

  if (isRotation) {
    const sorted = [...task.participants].map((p: any) => p.user || p).sort((a: any, b: any) =>
      (a?.name || '').localeCompare(b?.name || '', 'pt-BR', { sensitivity: 'base' })
    );
    const poolSize = sorted.length;
    const baseIndex = (((task.rotation_index || 0) % poolSize) + poolSize) % poolSize;
    let chosen = null;
    for (let i = 0; i < poolSize; i++) {
      const cand = sorted[(baseIndex + i) % poolSize];
      if (!cand?.vacation_mode) {
        chosen = cand;
        break;
      }
    }
    assignee = chosen || sorted[0];
  } else {
    assignee = task.current_assignee || task.participants?.[0]?.user || task.creator;
  }

  const assigneeName = assignee?.name || 'Morador';
  const assigneeId = assignee?.id;
  const assigneeAvatar =
    assignee?.avatar_url ||
    currentMembers.find((m) => m.id === assignee?.id)?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assigneeName)}`;

  return {
    id: task.id,
    title: task.title,
    period,
    status,
    nextMember: assigneeName,
    nextMemberId: assigneeId,
    nextMemberAvatar: assigneeAvatar,
    icon: 'task_alt',
    isRotation,
    participantIds,
    participants,
    frequency:
      task.frequency === 'DAILY'
        ? 'Diária'
        : task.frequency === 'WEEKLY'
        ? 'Semanal'
        : task.frequency === 'MONTHLY'
        ? 'Mensal'
        : 'Única (Um só dia)',
    completedBy: task.status === 'COMPLETED' ? (task.locked_by?.name || 'Concluído') : undefined,
    completedById: task.status === 'COMPLETED' ? (task.locked_by?.id || undefined) : undefined,
  };
}

function mapBackendTasksToRotations(backendTasks: any[], currentMembers: FamilyMember[]): TaskRotation[] {
  const rotationTasks = backendTasks.filter((t) => t.participants && t.participants.length > 1);
  return rotationTasks.map((t) => {
    const sorted = [...t.participants].map((p: any) => p.user || p).sort((a: any, b: any) =>
      (a?.name || '').localeCompare(b?.name || '', 'pt-BR', { sensitivity: 'base' })
    );
    const poolSize = sorted.length;
    const baseIndex = (((t.rotation_index || 0) % poolSize) + poolSize) % poolSize;
    let nextIdx = baseIndex;
    for (let i = 0; i < poolSize; i++) {
      const cand = sorted[(baseIndex + i) % poolSize];
      if (!cand?.vacation_mode) {
        nextIdx = (baseIndex + i) % poolSize;
        break;
      }
    }

    const queue = sorted.map((u: any, idx: number) => ({
      id: u.id,
      name: u.name,
      avatar:
        u.avatar_url ||
        currentMembers.find((m) => m.id === u.id)?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      isNext: idx === nextIdx,
      vacation_mode: Boolean(u.vacation_mode),
    }));

    const nextUser = queue.find((q) => q.isNext) || queue[0];
    const freq =
      t.frequency === 'DAILY'
        ? 'Diária'
        : t.frequency === 'WEEKLY'
        ? 'Semanal'
        : t.frequency === 'MONTHLY'
        ? 'Mensal'
        : 'Única (Um só dia)';

    let period: 'morning' | 'afternoon' | 'night' = 'morning';
    if (t.shift === 'AFTERNOON') period = 'afternoon';
    if (t.shift === 'NIGHT') period = 'night';

    return {
      id: t.id,
      taskId: t.id,
      title: t.title,
      schedule: `${freq} • Turno ${period === 'morning' ? 'Manhã' : period === 'afternoon' ? 'Tarde' : 'Noite'}`,
      nextMember: nextUser?.name || 'Morador',
      nextMemberAvatar: nextUser?.avatar || '',
      queue,
      frequency: freq,
      poolSelection: 'Participantes selecionados',
      icon: 'sync',
      period,
      participantIds: t.participants.map((p: any) => p.user_id || p.user?.id || p.id),
    };
  });
}

function mapBackendLogToActivityLog(log: any): ActivityLog {
  const time = new Date(log.created_at);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
  let timeAgo = 'Agora mesmo';
  if (diffMinutes >= 1 && diffMinutes < 60) timeAgo = `Há ${diffMinutes} min`;
  else if (diffMinutes >= 60 && diffMinutes < 1440) timeAgo = `Há ${Math.floor(diffMinutes / 60)}h`;
  else if (diffMinutes >= 1440) timeAgo = time.toLocaleDateString();

  return {
    id: log.id,
    title: log.comment || (log.action_type === 'COMPLETED' ? `Concluiu a tarefa` : log.action_type),
    timeAgo,
    author: log.user?.name || 'Morador',
    type: log.action_type === 'COMPLETED' && Boolean(log.task_id) ? 'task' : 'system',
    created_at: log.created_at || new Date().toISOString(),
    timestamp: time.getTime(),
  };
}

function mapBulletinToMuralNote(post: any, index = 0): MuralNote {
  const colors: MuralNote['color'][] = ['teal', 'amber', 'lavender', 'rose', 'gray'];
  const postDate = new Date(post.created_at);
  return {
    id: post.id,
    content: post.content,
    author: post.author?.name || 'Morador',
    dateStr: `Hoje, ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    color: colors[index % colors.length],
  };
}

export default function App() {
  // 1. Limpeza proativa de chaves antigas de mock / un-scoped
  useEffect(() => {
    const legacyKeys = [
      'domus_members',
      'domus_tasks',
      'domus_rotations',
      'domus_expenses',
      'domus_rules',
      'domus_logs',
      'domus_notes',
      'domus_statuses',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  }, []);

  // 2. Autenticação Real & Hierarquia de Acesso
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('domus_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('domus_auth_token');
  });

  const [currentHouse, setCurrentHouse] = useState<{ id: string; name: string; invite_code: string } | null>(() => {
    const saved = localStorage.getItem('domus_auth_house');
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Navegação & Abas (Persistidas para manter o estado após bloqueio/reativação do celular)
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('domus_active_tab') as TabType | null;
    return saved && ['dashboard', 'tasks', 'meals', 'reports', 'statistics', 'settings'].includes(saved) ? saved : 'dashboard';
  });
  const [subTab, setSubTab] = useState<string>(() => {
    return localStorage.getItem('domus_active_subtab') || 'bulletin';
  });
  const [vacationMode, setVacationMode] = useState<boolean>(() => authUser?.vacation_mode || false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('domus_active_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('domus_active_subtab', subTab);
  }, [subTab]);

  // Captura o evento nativo de instalação do PWA para uso nas Configurações
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // 4. Estados Reais por Residência
  const houseKey = currentHouse ? `domus_house_${currentHouse.id}` : null;

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    if (!currentHouse || !authUser) return [];
    const saved = houseKey ? localStorage.getItem(`${houseKey}_members`) : null;
    if (saved) return JSON.parse(saved);

    const isPrimary = authUser.role === 'ADMIN';
    return [
      {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: isPrimary ? 'Admin Geral' : 'Resident',
        isPrimary,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`,
      },
    ];
  });

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const [tasks, setTasks] = useState<HouseTask[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_tasks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [rotations, setRotations] = useState<TaskRotation[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_rotations`);
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_expenses`);
    return saved ? JSON.parse(saved) : [];
  });

  const [houseRules, setHouseRules] = useState<HouseRule[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_rules`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_logs`);
    if (saved) {
      try {
        const parsed: ActivityLog[] = JSON.parse(saved);
        return parsed.filter(
          (log) =>
            !log.title?.toLowerCase().includes('fundada por') &&
            !log.title?.toLowerCase().includes('fundou a residência') &&
            !log.title?.toLowerCase().includes('criada por')
        );
      } catch {
        return [];
      }
    }
    return [];
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_read_notifications`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [notificationsClearedAt, setNotificationsClearedAt] = useState<number>(() => {
    if (!houseKey) return 0;
    const saved = localStorage.getItem(`${houseKey}_notifications_cleared_at`);
    return saved ? Number(saved) || 0 : 0;
  });

  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    if (!houseKey) return INITIAL_PREFERENCES;
    const saved = localStorage.getItem(`${houseKey}_prefs`);
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [muralNotes, setMuralNotes] = useState<MuralNote[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_notes`);
    return saved ? JSON.parse(saved) : [];
  });

  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>(() => {
    if (!houseKey) return [];
    const saved = localStorage.getItem(`${houseKey}_statuses`);
    return saved ? JSON.parse(saved) : [];
  });

  const [mealPlan, setMealPlan] = useState<HouseMealPlan>(() => {
    if (!houseKey) return { houseId: '', isLocked: false, meals: [] };
    const saved = localStorage.getItem(`${houseKey}_meals`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanMeals = (parsed.meals || []).filter(
          (m: any) =>
            !m.id?.startsWith('meal_mon_') &&
            !m.id?.startsWith('meal_tue_') &&
            !m.id?.startsWith('meal_wed_') &&
            !m.id?.startsWith('meal_thu_') &&
            !m.id?.startsWith('meal_fri_') &&
            !m.id?.startsWith('meal_sat_') &&
            !m.id?.startsWith('meal_sun_')
        );
        return { ...parsed, meals: cleanMeals };
      } catch {}
    }
    return createDefaultMealPlan(currentHouse?.id || '');
  });

  // Modal Visibility States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReimbursementOpen, setIsReimbursementOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeaveHouseOpen, setIsLeaveHouseOpen] = useState(false);
  const [leaveHouseLoading, setLeaveHouseLoading] = useState(false);

  // Sync Auth State
  useEffect(() => {
    if (authUser) localStorage.setItem('domus_auth_user', JSON.stringify(authUser));
    else localStorage.removeItem('domus_auth_user');
  }, [authUser]);

  useEffect(() => {
    if (authToken) localStorage.setItem('domus_auth_token', authToken);
    else localStorage.removeItem('domus_auth_token');
  }, [authToken]);

  useEffect(() => {
    if (currentHouse) localStorage.setItem('domus_auth_house', JSON.stringify(currentHouse));
    else localStorage.removeItem('domus_auth_house');
  }, [currentHouse]);

  // Sync House Data State
  useEffect(() => {
    if (houseKey) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(familyMembers));
      localStorage.setItem(`${houseKey}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${houseKey}_rotations`, JSON.stringify(rotations));
      localStorage.setItem(`${houseKey}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${houseKey}_rules`, JSON.stringify(houseRules));
      localStorage.setItem(`${houseKey}_logs`, JSON.stringify(activityLogs));
      localStorage.setItem(`${houseKey}_read_notifications`, JSON.stringify(readNotificationIds));
      localStorage.setItem(`${houseKey}_notifications_cleared_at`, String(notificationsClearedAt));
      localStorage.setItem(`${houseKey}_prefs`, JSON.stringify(preferences));
      localStorage.setItem(`${houseKey}_notes`, JSON.stringify(muralNotes));
      localStorage.setItem(`${houseKey}_statuses`, JSON.stringify(memberStatuses));
      localStorage.setItem(`${houseKey}_meals`, JSON.stringify(mealPlan));
    }
  }, [
    houseKey,
    familyMembers,
    tasks,
    rotations,
    expenses,
    houseRules,
    activityLogs,
    readNotificationIds,
    notificationsClearedAt,
    preferences,
    muralNotes,
    memberStatuses,
    mealPlan,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Helper de registro e sincronização de notificações em tempo real centralizada
  const recordHouseActivity = useCallback(
    (
      title: string,
      author?: string,
      actionType?: 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'LOCKED' | 'ROTATED',
      taskId?: string
    ) => {
      const isTaskCompleted = actionType === 'COMPLETED' && Boolean(taskId);
      const nowTs = Date.now();
      const newLog: ActivityLog = {
        id: `log_${nowTs}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        timeAgo: 'Agora mesmo',
        author: author || authUser?.name || 'Morador',
        type: isTaskCompleted ? 'task' : 'system',
        created_at: new Date(nowTs).toISOString(),
        timestamp: nowTs,
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      if (currentHouse?.id) {
        emitHouseLog(currentHouse.id, newLog);
        // Apenas persiste na tabela ActivityLog do backend se houver ação de tarefa e taskId válidos
        if (authUser?.id && actionType && taskId) {
          activityLogsApi
            .createLog({
              house_id: currentHouse.id,
              user_id: authUser.id,
              action_type: actionType,
              comment: title,
              task_id: taskId,
            })
            .catch(() => {});
        }
      }
    },
    [authUser?.name, authUser?.id, currentHouse?.id]
  );

  const handleSyncMembers = useCallback(
    (backendMembers: any[]) => {
      if (!backendMembers || backendMembers.length === 0) return;
      setFamilyMembers((prev) => {
        const merged: FamilyMember[] = backendMembers.map((bm) => {
          const existing = prev.find((p) => p.id === bm.id || p.email === bm.email);
          const isGeneralAdmin = bm.role === 'ADMIN';
          return {
            id: bm.id,
            name: bm.name,
            email: bm.email,
            role: isGeneralAdmin ? 'Admin Geral' : existing?.role || 'Resident',
            isPrimary: isGeneralAdmin,
            avatar:
              bm.avatar_url ||
              existing?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bm.name)}`,
            statusTag: bm.vacation_mode ? 'Férias' : existing?.statusTag,
            vacation_mode: Boolean(bm.vacation_mode ?? existing?.vacation_mode),
          };
        });

        if (houseKey) {
          localStorage.setItem(`${houseKey}_members`, JSON.stringify(merged));
        }
        return merged;
      });
    },
    [houseKey]
  );

  // Sincronização inicial automática dos dados centrais da residência ao carregar
  useEffect(() => {
    if (currentHouse?.id && authUser?.id) {
      // 1. Membros e Mural de Recados via BFF Dashboard
      dashboardApi
        .getDashboardData(currentHouse.id, authUser.id)
        .then((data) => {
          if (data?.house) {
            setCurrentHouse((prev) => ({
              ...(prev || {}),
              id: data.house.id,
              name: data.house.name,
              invite_code: data.house.invite_code,
            }));
          }
          if (data?.members && data.members.length > 0) {
            handleSyncMembers(data.members);
          }
          if (data?.bulletin_posts && Array.isArray(data.bulletin_posts)) {
            setMuralNotes(data.bulletin_posts.map((p, idx) => mapBulletinToMuralNote(p, idx)));
          }
        })
        .catch((err) => {
          console.warn('[DOMUS] Erro ao sincronizar membros da casa:', err);
        });

      // 2. Tarefas Centrais da Residência (PostgreSQL)
      tasksApi
        .getTasks(currentHouse.id, authUser.id)
        .then((backendTasks) => {
          if (Array.isArray(backendTasks) && backendTasks.length > 0) {
            setTasks(backendTasks.map((t) => mapBackendTaskToHouseTask(t, familyMembers)));
            const generatedRotations = mapBackendTasksToRotations(backendTasks, familyMembers);
            if (generatedRotations.length > 0) {
              setRotations(generatedRotations);
            }
          }
        })
        .catch((err) => {
          console.warn('[DOMUS] Erro ao sincronizar tarefas centralizadas:', err);
        });

      // 3. Histórico e Notificações Centrais da Residência (PostgreSQL)
      activityLogsApi
        .getLogs(currentHouse.id)
        .then((backendLogs) => {
          if (Array.isArray(backendLogs) && backendLogs.length > 0) {
            setActivityLogs(backendLogs.map(mapBackendLogToActivityLog));
          }
        })
        .catch((err) => {
          console.warn('[DOMUS] Erro ao sincronizar logs de atividade centralizados:', err);
        });
    }
  }, [currentHouse?.id, authUser?.id, handleSyncMembers]);

  // Escuta Notificações e Atividades em tempo real de outros dispositivos
  useHouseSocket(
    currentHouse?.id || '',
    {
      onPresence: (presenceData) => {
        if (presenceData?.onlineUserIds) {
          setOnlineUserIds(presenceData.onlineUserIds);
        }
      },
      onMembersUpdated: (data: any) => {
        if (data?.members && Array.isArray(data.members)) {
          setFamilyMembers(data.members);
          if (houseKey) {
            localStorage.setItem(`${houseKey}_members`, JSON.stringify(data.members));
          }
          return;
        }
        if (currentHouse?.id && authUser?.id) {
          dashboardApi
            .getDashboardData(currentHouse.id, authUser.id)
            .then((data) => {
              if (data?.members) handleSyncMembers(data.members);
            })
            .catch(() => {});
        }
      },
      onActivityLog: (incomingLog: ActivityLog) => {
        setActivityLogs((prev) => {
          if (prev.some((l) => l.id === incomingLog.id)) return prev;
          return [incomingLog, ...prev];
        });
      },
      onTaskCreated: (incomingTask: HouseTask) => {
        setTasks((prev) => {
          if (prev.some((t) => t.id === incomingTask.id)) return prev;
          return [incomingTask, ...prev];
        });
      },
      onTaskUpdated: (incomingData: any) => {
        const taskPayload = incomingData?.task || incomingData;
        if (taskPayload?.id) {
          const mapped = mapBackendTaskToHouseTask(taskPayload, familyMembers);
          setTasks((prev) => prev.map((t) => (t.id === mapped.id ? mapped : t)));
          setRotations((prev) => {
            const generated = mapBackendTasksToRotations([taskPayload], familyMembers);
            if (generated.length === 0) return prev.filter((r) => r.id !== mapped.id && r.taskId !== mapped.id);
            const exists = prev.some((r) => r.id === mapped.id || r.taskId === mapped.id);
            if (exists) return prev.map((r) => (r.id === mapped.id || r.taskId === mapped.id ? generated[0] : r));
            return [...generated, ...prev];
          });
        }
      },
      onVacationChanged: ({ userId, vacation_mode }: { userId: string; vacation_mode: boolean }) => {
        setFamilyMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, vacation_mode, statusTag: vacation_mode ? 'Férias' : undefined } : m))
        );
        if (currentHouse?.id && authUser?.id) {
          tasksApi.getTasks(currentHouse.id, authUser.id).then((backendTasks) => {
            if (Array.isArray(backendTasks)) {
              setTasks(backendTasks.map((t) => mapBackendTaskToHouseTask(t, familyMembers)));
              setRotations(mapBackendTasksToRotations(backendTasks, familyMembers));
            }
          }).catch(() => {});
        }
      },
      onTaskDeleted: ({ taskId }: { taskId: string }) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      },
      onTaskStatusChanged: ({ taskId, status }: { taskId: string; status: HouseTask['status'] }) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
      },
      onNoteCreated: (incomingNote: MuralNote) => {
        setMuralNotes((prev) => {
          if (prev.some((n) => n.id === incomingNote.id)) return prev;
          return [incomingNote, ...prev];
        });
      },
      onNoteDeleted: ({ noteId }: { noteId: string }) => {
        setMuralNotes((prev) => prev.filter((n) => n.id !== noteId));
      },
      onStatusChanged: (statusData: MemberStatus) => {
        setMemberStatuses((prev) => {
          const exists = prev.some((s) => s.id === statusData.id || s.name === statusData.name);
          if (exists) {
            return prev.map((s) =>
              s.id === statusData.id || s.name === statusData.name ? statusData : s
            );
          }
          return [...prev, statusData];
        });
      },
      onRuleCreated: (incomingRule: HouseRule) => {
        setHouseRules((prev) => {
          if (prev.some((r) => r.id === incomingRule.id)) return prev;
          return [...prev, incomingRule];
        });
      },
      onRuleDeleted: ({ ruleId }: { ruleId: string }) => {
        setHouseRules((prev) => prev.filter((r) => r.id !== ruleId));
      },
      onRotationAdvanced: ({ rotationId }: { rotationId: string }) => {
        setRotations((prev) =>
          prev.map((rot) => {
            if (rot.id === rotationId) {
              const queue = [...rot.queue];
              if (queue.length > 0) {
                const first = queue.shift()!;
                first.isNext = false;
                queue.push(first);
                queue[0].isNext = true;
                return {
                  ...rot,
                  nextMember: queue[0].name,
                  nextMemberAvatar: queue[0].avatar,
                  queue,
                };
              }
            }
            return rot;
          })
        );
      },
      onCodeRegenerated: ({ invite_code }: { invite_code: string }) => {
        setCurrentHouse((prev) => (prev ? { ...prev, invite_code } : prev));
        showToast(`O código de convite da casa foi atualizado para: ${invite_code}`);
      },
      onMealUpdated: ({ meal }: { meal: any }) => {
        if (!meal) return;
        setMealPlan((prev) => {
          const exists = prev.meals.some(
            (m) => m.id === meal.id || (m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType)
          );
          const updatedMeals = exists
            ? prev.meals.map((m) =>
                m.id === meal.id || (m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType) ? meal : m
              )
            : [...prev.meals, meal];
          return { ...prev, meals: updatedMeals };
        });
      },
      onMealDeleted: ({ mealId }: { mealId: string }) => {
        setMealPlan((prev) => ({
          ...prev,
          meals: prev.meals.filter((m) => m.id !== mealId),
        }));
      },
      onMealLockToggled: (data: any) => {
        setMealPlan((prev) => ({
          ...prev,
          isLocked: Boolean(data.isLocked),
          lockedBy: data.lockedBy,
          lockedByName: data.lockedByName,
          lockedAt: data.lockedAt,
        }));
      },
    },
    authUser
      ? {
          id: authUser.id,
          name: authUser.name,
          avatar:
            authUser.avatar ||
            authUser.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`,
        }
      : undefined
  );

  // Membros ativos e online para exibição na barra lateral (declarado no topo para conformidade com regras de hooks)
  const activeMembersForSidebar = useMemo(() => {
    if (onlineUserIds.length === 0) return familyMembers;
    const online = familyMembers.filter((m) => onlineUserIds.includes(m.id));
    return online.length > 0 ? online : familyMembers;
  }, [familyMembers, onlineUserIds]);

  // Contagem estrita de notificações não vistas para o indicador do sino
  const unreadNotificationCount = useMemo(() => {
    const readSet = new Set(readNotificationIds);
    return activityLogs.filter((log) => !readSet.has(log.id)).length;
  }, [activityLogs, readNotificationIds]);

  // Ao abrir o painel de notificações, marca todos os logs correntes como lidos
  const handleOpenNotifications = useCallback(() => {
    setIsNotificationsOpen(true);
    const currentIds = activityLogs.map((log) => log.id);
    setReadNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...currentIds]));
      if (houseKey) {
        localStorage.setItem(`${houseKey}_read_notifications`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [activityLogs, houseKey]);

  const handleClearReadNotifications = useCallback(() => {
    const now = Date.now();
    setNotificationsClearedAt(now);
    if (houseKey) {
      localStorage.setItem(`${houseKey}_notifications_cleared_at`, String(now));
    }
    showToast('Notificações lidas foram limpas da gaveta.');
  }, [houseKey, showToast]);

  const handleMarkAllAsRead = useCallback(() => {
    const currentIds = activityLogs.map((log) => log.id);
    setReadNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...currentIds]));
      if (houseKey) {
        localStorage.setItem(`${houseKey}_read_notifications`, JSON.stringify(updated));
      }
      return updated;
    });
    showToast('Todas as notificações foram marcadas como lidas.');
  }, [activityLogs, houseKey, showToast]);

  const handleNavigateToReports = useCallback(() => {
    setIsNotificationsOpen(false);
    setCurrentTab('reports');
  }, []);

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    setVacationMode(user.vacation_mode);

    if (user.house_id && !currentHouse) {
      setCurrentHouse({
        id: user.house_id,
        name: 'Minha Residência',
        invite_code: '',
      });
    }
  };

  const handleHouseSelected = (houseData: HouseResponse) => {
    setCurrentHouse(houseData.house);
    setAuthUser(houseData.user);

    const key = `domus_house_${houseData.house.id}`;
    const cachedMembersRaw = localStorage.getItem(`${key}_members`);
    let membersList: FamilyMember[] = [];

    try {
      if (cachedMembersRaw) {
        membersList = JSON.parse(cachedMembersRaw);
      }
    } catch {}

    if (membersList.length > 0) {
      // Verifica se o usuário atual já está na lista
      const userIndex = membersList.findIndex(
        (m) => m.id === houseData.user.id || m.email === houseData.user.email
      );
      if (userIndex === -1) {
        const hasGeneralAdmin = membersList.some((m) => m.role === 'Admin Geral');
        const role: FamilyMember['role'] =
          houseData.user.role === 'ADMIN'
            ? hasGeneralAdmin
              ? 'Admin'
              : 'Admin Geral'
            : 'Resident';

        membersList.push({
          id: houseData.user.id,
          name: houseData.user.name,
          email: houseData.user.email,
          role,
          isPrimary: role === 'Admin Geral',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(houseData.user.name)}`,
        });
      }
      setFamilyMembers(membersList);
    } else {
      // Primeira inicialização local da residência
      const isPrimary = houseData.user.role === 'ADMIN';
      const initialMember: FamilyMember = {
        id: houseData.user.id,
        name: houseData.user.name,
        email: houseData.user.email,
        role: isPrimary ? 'Admin Geral' : 'Resident',
        isPrimary,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(houseData.user.name)}`,
      };
      setFamilyMembers([initialMember]);
    }

    const cachedMealsRaw = localStorage.getItem(`${key}_meals`);
    if (cachedMealsRaw) {
      try {
        const parsed = JSON.parse(cachedMealsRaw);
        const cleanMeals = (parsed.meals || []).filter(
          (m: any) =>
            !m.id?.startsWith('meal_mon_') &&
            !m.id?.startsWith('meal_tue_') &&
            !m.id?.startsWith('meal_wed_') &&
            !m.id?.startsWith('meal_thu_') &&
            !m.id?.startsWith('meal_fri_') &&
            !m.id?.startsWith('meal_sat_') &&
            !m.id?.startsWith('meal_sun_')
        );
        setMealPlan({ ...parsed, meals: cleanMeals });
      } catch {
        setMealPlan(createDefaultMealPlan(houseData.house.id));
      }
    } else {
      setMealPlan(createDefaultMealPlan(houseData.house.id));
    }
  };

  const handleSwitchHouse = () => {
    const isGeneralAdmin = currentUser.role === 'Admin Geral' || authUser?.role === 'ADMIN';
    const otherMembers = familyMembers.filter((m) => m.id !== authUser?.id && m.email !== authUser?.email);
    if (isGeneralAdmin && otherMembers.length > 0) {
      showToast('Como Admin Geral, você não pode trocar de residência sem antes transferir a liderança.');
      return;
    }
    setCurrentHouse(null);
    localStorage.removeItem('domus_auth_house');
    showToast('Alternando de residência. Escolha uma residência salva ou funde uma nova.');
  };

  const handleConfirmLeaveHouse = async (successorId?: string) => {
    if (!authUser?.id || !currentHouse?.id) return;

    try {
      setLeaveHouseLoading(true);
      await authApi.leaveHouse(authUser.id, authToken || undefined, successorId);

      const oldHouseName = currentHouse.name;
      setCurrentHouse(null);
      localStorage.removeItem('domus_auth_house');
      setIsLeaveHouseOpen(false);

      const updatedUser: AuthUser = {
        ...authUser,
        house_id: null,
        role: 'MEMBER',
      };
      setAuthUser(updatedUser);
      localStorage.setItem('domus_auth_user', JSON.stringify(updatedUser));

      showToast(
        successorId
          ? `Liderança transferida e você se desvinculou de "${oldHouseName}".`
          : `Você se desvinculou de "${oldHouseName}".`
      );
    } catch (err: any) {
      showToast(err.message || 'Erro ao sair da residência.');
    } finally {
      setLeaveHouseLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthToken(null);
    setCurrentHouse(null);
    localStorage.clear();
    setFamilyMembers([]);
    setTasks([]);
    setRotations([]);
    setExpenses([]);
    setHouseRules([]);
    setActivityLogs([]);
    setReadNotificationIds([]);
    setMuralNotes([]);
    setMemberStatuses([]);
    setMealPlan({ houseId: '', isLocked: false, meals: [] });
    setCurrentTab('dashboard');
    setSubTab('bulletin');
    showToast('Sessão encerrada.');
  };

  const handleToggleVacationMode = () => {
    const next = !vacationMode;
    setVacationMode(next);
    if (authUser) {
      setAuthUser({ ...authUser, vacation_mode: next });
    }
    if (authUser?.id) {
      tasksApi.toggleVacation(authUser.id).catch((err) => {
        console.warn('[Vacation] Erro ao persistir modo férias no backend:', err);
      });
    }
    recordHouseActivity(`${authUser?.name || 'Morador'} ${next ? 'ativou' : 'desativou'} o modo férias.`);
    showToast(next ? 'Modo Férias Ativado: Você foi temporariamente pausado do rodízio.' : 'Modo Férias Desativado: Retornando à escala normal.');
  };

  const handleAddMuralNote = async (newNote: Omit<MuralNote, 'id' | 'dateStr'>) => {
    let noteObj: MuralNote;
    if (currentHouse?.id && authUser?.id) {
      try {
        const created = await dashboardApi.createBulletinPost(currentHouse.id, authUser.id, newNote.content);
        noteObj = {
          ...newNote,
          id: created.id,
          dateStr: 'Hoje, ' + new Date(created.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: created.author?.name || newNote.author,
        };
      } catch {
        noteObj = {
          ...newNote,
          id: 'n_' + Date.now(),
          dateStr: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    } else {
      noteObj = {
        ...newNote,
        id: 'n_' + Date.now(),
        dateStr: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    setMuralNotes((prev) => [noteObj, ...prev]);
    if (currentHouse?.id) {
      emitNoteCreated(currentHouse.id, noteObj);
    }
    recordHouseActivity(`Novo recado no mural fixado por ${noteObj.author}`);
    showToast('Recado fixado no mural!');
  };

  const handleDeleteMuralNote = async (id: string) => {
    setMuralNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentHouse?.id) {
      emitNoteDeleted(currentHouse.id, id);
      if (authUser?.id) {
        dashboardApi.deleteBulletinPost(id, authUser.id, currentHouse.id).catch(() => {});
      }
    }
    showToast('Recado removido!');
  };

  const handleAddTask = async (newTask: Omit<HouseTask, 'id' | 'status'>) => {
    const shiftMap: Record<string, 'MORNING' | 'AFTERNOON' | 'NIGHT'> = {
      morning: 'MORNING',
      afternoon: 'AFTERNOON',
      night: 'NIGHT',
    };

    const frequencyMap: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE'> = {
      'Diária': 'DAILY',
      'Semanal': 'WEEKLY',
      'Mensal': 'MONTHLY',
      'Única (Um só dia)': 'ONCE',
    };

    const matchedMember = familyMembers.find((m) => m.name === newTask.nextMember);
    const participantIds =
      newTask.participantIds && newTask.participantIds.length > 0
        ? newTask.participantIds
        : matchedMember
        ? [matchedMember.id]
        : authUser?.id
        ? [authUser.id]
        : [];

    let taskObj: HouseTask;
    if (currentHouse?.id && authUser?.id) {
      try {
        const backendCreated = await tasksApi.createTask({
          title: newTask.title,
          description: newTask.title,
          shift: shiftMap[newTask.period] || 'MORNING',
          frequency: frequencyMap[newTask.frequency || ''] || 'DAILY',
          creator_id: authUser.id,
          house_id: currentHouse.id,
          participant_ids: participantIds,
        });
        taskObj = mapBackendTaskToHouseTask(backendCreated, familyMembers);
      } catch (err) {
        console.warn('[Tasks] Fallback local para criação de tarefa:', err);
        taskObj = {
          ...newTask,
          id: `t_${Date.now()}`,
          status: 'pending',
        };
      }
    } else {
      taskObj = {
        ...newTask,
        id: `t_${Date.now()}`,
        status: 'pending',
      };
    }

    setTasks((prev) => [taskObj, ...prev]);
    if (taskObj.isRotation) {
      setRotations((prev) => {
        if (prev.some((r) => r.id === taskObj.id || r.taskId === taskObj.id)) return prev;
        const newRot = mapBackendTasksToRotations([taskObj], familyMembers);
        return [...newRot, ...prev];
      });
    }

    if (currentHouse?.id) {
      emitTaskCreated(currentHouse.id, taskObj);
    }
    recordHouseActivity(`Nova tarefa "${taskObj.title}" criada.`, authUser?.name, 'ROTATED', taskObj.id);
    showToast(`Tarefa "${taskObj.title}" criada com sucesso!`);
  };

  const handleUpdateTask = async (
    taskId: string,
    data: {
      title: string;
      period: 'morning' | 'afternoon' | 'night';
      frequency: string;
      participantIds: string[];
    }
  ) => {
    const shiftMap: Record<string, 'MORNING' | 'AFTERNOON' | 'NIGHT'> = {
      morning: 'MORNING',
      afternoon: 'AFTERNOON',
      night: 'NIGHT',
    };

    const frequencyMap: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE'> = {
      'Diária': 'DAILY',
      'Semanal': 'WEEKLY',
      'Mensal': 'MONTHLY',
      'Única (Um só dia)': 'ONCE',
    };

    if (currentHouse?.id && authUser?.id) {
      try {
        const result = await tasksApi.updateTask(
          taskId,
          {
            title: data.title,
            shift: shiftMap[data.period] || 'MORNING',
            frequency: frequencyMap[data.frequency] || 'DAILY',
            participant_ids: data.participantIds,
          },
          authUser.id,
          currentUser.role
        );

        const updatedTaskObj = mapBackendTaskToHouseTask(result.task, familyMembers);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTaskObj : t)));

        // Sincroniza a lista de rodízios
        setRotations((prev) => {
          const generated = mapBackendTasksToRotations([result.task], familyMembers);
          if (generated.length === 0) {
            return prev.filter((r) => r.id !== taskId && r.taskId !== taskId);
          }
          const exists = prev.some((r) => r.id === taskId || r.taskId === taskId);
          if (exists) {
            return prev.map((r) => (r.id === taskId || r.taskId === taskId ? generated[0] : r));
          }
          return [...generated, ...prev];
        });

        if (currentHouse?.id) {
          emitTaskUpdated(currentHouse.id, updatedTaskObj);
        }

        recordHouseActivity(
          `Escala de rodízio da tarefa "${data.title}" foi atualizada por ${authUser.name}.`,
          authUser.name,
          'ROTATED',
          taskId
        );
        showToast('Escala de rodízio atualizada com sucesso!');
      } catch (err: any) {
        showToast(err.message || 'Erro ao atualizar escala de rodízio.');
        throw err;
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentHouse?.id) {
      emitTaskDeleted(currentHouse.id, taskId);
      if (authUser?.id) {
        tasksApi.deleteTask(taskId, authUser.id, authUser.role).catch(() => {});
      }
    }
    if (taskObj) {
      recordHouseActivity(`Tarefa "${taskObj.title}" foi excluída.`, authUser?.name, 'FAILED', taskId);
      showToast(`Tarefa "${taskObj.title}" excluída.`);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: HouseTask['status']) => {
    const completedByName = authUser?.name || 'Morador';
    const completedById = authUser?.id;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === 'completed') {
            return {
              ...t,
              status: newStatus,
              completedBy: completedByName,
              completedById: completedById,
              completedAt: new Date().toISOString(),
            };
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
    if (currentHouse?.id) {
      emitTaskStatusChanged(currentHouse.id, taskId, newStatus);
    }

    const taskObj = tasks.find((t) => t.id === taskId);
    const wasCompleted = taskObj?.status === 'completed';

    if (newStatus === 'completed') {
      recordHouseActivity(
        `Tarefa "${taskObj?.title || 'Tarefa'}" foi concluída por ${completedByName}.`,
        completedByName,
        'COMPLETED',
        taskId
      );
      if (authUser?.id) {
        tasksApi.completeTask(taskId, authUser.id).catch((err: any) => {
          showToast(err.message || 'Erro ao concluir tarefa.');
          // Reverte o estado visual caso o backend recuse (ex: 403)
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: taskObj?.status || 'pending' } : t))
          );
        });
      }
    } else if (newStatus === 'pending' && wasCompleted) {
      recordHouseActivity(
        `Tarefa "${taskObj?.title || 'Tarefa'}" foi revertida para pendente por ${completedByName}.`,
        completedByName,
        'ROTATED',
        taskId
      );
      if (authUser?.id) {
        tasksApi.revertTask(taskId, authUser.id, currentUser.role).catch((err: any) => {
          showToast(err.message || 'Erro ao reverter tarefa.');
          // Reverte o estado visual caso o backend recuse (ex: 403)
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
          );
        });
      }
      showToast(`Tarefa "${taskObj?.title || 'Tarefa'}" revertida para pendente.`);
    } else if (newStatus === 'alert') {
      recordHouseActivity(
        `Tarefa "${taskObj?.title || 'Tarefa'}" reportou impedimento.`,
        completedByName,
        'BLOCKED',
        taskId
      );
      if (authUser?.id) {
        tasksApi.blockTask(taskId, authUser.id, 'Impedimento reportado').catch(() => {});
      }
    }
  };

  const handleRotateNext = (rotationId: string) => {
    setRotations((prev) =>
      prev.map((rot) => {
        if (rot.id === rotationId) {
          const queue = [...rot.queue];
          if (queue.length > 0) {
            const first = queue.shift()!;
            first.isNext = false;
            queue.push(first);
            queue[0].isNext = true;
            return {
              ...rot,
              nextMember: queue[0].name,
              nextMemberAvatar: queue[0].avatar,
              queue,
            };
          }
        }
        return rot;
      })
    );
    if (currentHouse?.id) {
      emitRotationAdvanced(currentHouse.id, rotationId);
    }
    showToast('Rodízio avançado.');
  };

  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = { ...expense, id: `exp_${Date.now()}` };
    setExpenses((prev) => [newExp, ...prev]);
    recordHouseActivity(`Nova despesa registrada: ${expense.title} (R$ ${expense.amount.toFixed(2)})`);
    showToast(`Despesa adicionada.`);
  };

  const handleReimbursement = (amount: number, reason: string) => {
    recordHouseActivity(`Solicitação de reembolso de R$ ${amount.toFixed(2)} por ${authUser?.name}`);
    showToast(`Solicitação de reembolso de ${amount.toFixed(2)} enviada: "${reason}".`);
  };

  const handleAddHouseRule = (rule: Omit<HouseRule, 'id' | 'number'>) => {
    const newRule: HouseRule = {
      ...rule,
      id: `hr_${Date.now()}`,
      number: houseRules.length + 1,
    };
    setHouseRules((prev) => [...prev, newRule]);
    if (currentHouse?.id) {
      emitRuleCreated(currentHouse.id, newRule);
    }
    recordHouseActivity(`Nova regra adicionada: "${rule.title}"`);
    showToast('Regra da casa adicionada!');
  };

  // Estados e Handlers de Governança de Liderança & Membros
  const [transferTarget, setTransferTarget] = useState<{
    member?: FamilyMember;
    newMemberData?: Omit<FamilyMember, 'id'>;
  } | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    if (currentUser.role !== 'Admin Geral' && currentUser.role !== 'Admin') {
      showToast('Apenas administradores ou o Admin Geral podem adicionar novos membros.');
      return;
    }
    const newMember: FamilyMember = { ...member, id: `m_${Date.now()}` };
    const updated = [...familyMembers, newMember];
    setFamilyMembers(updated);
    if (houseKey) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(updated));
    }
    if (currentHouse?.id) {
      emitMembersUpdated(currentHouse.id, { members: updated });
    }
    recordHouseActivity(`Novo membro adicionado: ${member.name} (${member.role})`);
    showToast(`Membro ${member.name} adicionado com sucesso!`);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === authUser?.id) {
      showToast('Você não pode se auto-remover pelas configurações. Use a opção Trocar ou Sair da Residência.');
      return;
    }
    const updated = familyMembers.filter((m) => m.id !== memberId);
    setFamilyMembers(updated);
    setMemberStatuses((prev) => prev.filter((s) => s.id !== memberId));
    if (houseKey) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(updated));
    }
    if (currentHouse?.id) {
      emitMembersUpdated(currentHouse.id, { members: updated });
    }
    recordHouseActivity(`${memberName} foi removido da residência por ${authUser?.name || 'Administrador'}`);
    showToast(`Membro ${memberName} removido da residência.`);
  };

  const handlePromoteToAdmin = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    const updated: FamilyMember[] = familyMembers.map((m) =>
      m.id === memberId ? { ...m, role: 'Admin' as const } : m
    );
    setFamilyMembers(updated);
    if (houseKey) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(updated));
    }
    if (currentHouse?.id) {
      emitMembersUpdated(currentHouse.id, { members: updated });
    }
    if (member) {
      recordHouseActivity(`${member.name} foi promovido a Administrador Normal por ${authUser?.name}`);
    }
    showToast('Membro promovido a Administrador Normal.');
  };

  const handleDemoteToResident = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    const updated: FamilyMember[] = familyMembers.map((m) =>
      m.id === memberId ? { ...m, role: 'Resident' as const } : m
    );
    setFamilyMembers(updated);
    if (houseKey) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(updated));
    }
    if (currentHouse?.id) {
      emitMembersUpdated(currentHouse.id, { members: updated });
    }
    if (member) {
      recordHouseActivity(`${member.name} foi destituído para Morador regular por ${authUser?.name}`);
    }
    showToast('Administrador destituído para Morador regular.');
  };

  const handleInitiateTransferGeneralAdmin = (targetMember: FamilyMember) => {
    setTransferTarget({ member: targetMember });
    setIsTransferModalOpen(true);
  };

  const handleInitiateTransferForNewMember = (pendingData: Omit<FamilyMember, 'id'>) => {
    setTransferTarget({ newMemberData: pendingData });
    setIsTransferModalOpen(true);
  };

  const handleConfirmLeadershipTransfer = () => {
    if (!transferTarget) return;

    let updated: FamilyMember[] = [];
    if (transferTarget.member) {
      const targetId = transferTarget.member.id;
      updated = familyMembers.map((m) => {
        if (m.id === targetId) {
          return { ...m, role: 'Admin Geral' as const, isPrimary: true };
        }
        if (m.role === 'Admin Geral' || m.id === authUser?.id) {
          return { ...m, role: 'Admin' as const, isPrimary: false };
        }
        return m;
      });
      setFamilyMembers(updated);
      recordHouseActivity(`Liderança da residência transferida para ${transferTarget.member.name}`);
      showToast(`Liderança transferida para ${transferTarget.member.name}! Você agora é Admin Normal.`);
    } else if (transferTarget.newMemberData) {
      const newCreatedMember: FamilyMember = {
        ...transferTarget.newMemberData,
        id: `m_${Date.now()}`,
        role: 'Admin Geral',
        isPrimary: true,
      };
      updated = [
        ...familyMembers.map((m) =>
          m.role === 'Admin Geral' || m.id === authUser?.id ? { ...m, role: 'Admin' as const, isPrimary: false } : m
        ),
        newCreatedMember,
      ];
      setFamilyMembers(updated);
      recordHouseActivity(`Novo Admin Geral nomeado: ${transferTarget.newMemberData.name}`);
      showToast(`Novo Admin Geral ${transferTarget.newMemberData.name} cadastrado! Você agora é Admin Normal.`);
    }

    if (houseKey && updated.length > 0) {
      localStorage.setItem(`${houseKey}_members`, JSON.stringify(updated));
    }
    if (currentHouse?.id && updated.length > 0) {
      emitMembersUpdated(currentHouse.id, { members: updated });
    }

    setIsTransferModalOpen(false);
    setTransferTarget(null);
  };

  // Regeneração de Código de Convite da Residência
  const [isRegenerateCodeModalOpen, setIsRegenerateCodeModalOpen] = useState(false);
  const [regenerateCodeLoading, setRegenerateCodeLoading] = useState(false);

  const handleConfirmRegenerateCode = async () => {
    if (!currentHouse?.id || !authUser?.id) return;
    try {
      setRegenerateCodeLoading(true);
      const res = await authApi.regenerateHouseCode(currentHouse.id, authUser.id, authToken || undefined);
      setCurrentHouse((prev) => (prev ? { ...prev, invite_code: res.invite_code } : prev));
      setIsRegenerateCodeModalOpen(false);
      showToast(`Novo código gerado com sucesso: ${res.invite_code}`);
      recordHouseActivity(`Código de acesso da residência foi regenerado pelo Administrador Geral.`);
    } catch (err: any) {
      showToast(err.message || 'Erro ao regenerar código da residência.');
    } finally {
      setRegenerateCodeLoading(false);
    }
  };

  const handleUpdateMemberStatus = (memberId: string, newLocation: string, newIcon?: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    const memberName = member?.name || authUser?.name || 'Morador';
    const iconToUse = newIcon || 'home';

    const updatedStatusObj: MemberStatus = {
      id: memberId,
      name: memberName,
      avatar: member?.avatar,
      location: newLocation,
      icon: iconToUse,
    };

    setMemberStatuses((prev) => {
      const exists = prev.some((s) => s.id === memberId || s.name === memberName);
      if (exists) {
        return prev.map((s) =>
          s.id === memberId || s.name === memberName ? updatedStatusObj : s
        );
      }
      return [...prev, updatedStatusObj];
    });

    if (currentHouse?.id) {
      emitStatusChanged(currentHouse.id, updatedStatusObj);
    }

    recordHouseActivity(`${memberName} atualizou seu status para: "${newLocation}"`);
    showToast('Status atualizado com sucesso!');
  };

  const currentLoggedInMember = familyMembers.find(
    (m) => m.id === authUser?.id || (authUser?.email && m.email === authUser.email)
  );

  const currentUser: FamilyMember = currentLoggedInMember
    ? {
        ...currentLoggedInMember,
        name: authUser?.name || currentLoggedInMember.name,
        email: authUser?.email || currentLoggedInMember.email,
        avatar:
          authUser?.avatar ||
          authUser?.avatar_url ||
          currentLoggedInMember.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser?.name || 'User')}`,
      }
    : {
        id: authUser?.id || 'guest',
        name: authUser?.name || 'Morador Conectado',
        email: authUser?.email || 'morador@domus.local',
        role: authUser?.role === 'ADMIN' ? 'Admin Geral' : 'Resident',
        isPrimary: authUser?.role === 'ADMIN',
        avatar:
          authUser?.avatar ||
          authUser?.avatar_url ||
          (authUser?.name
            ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
      };

  const handleUpdateMeal = useCallback(
    (meal: MealItem) => {
      setMealPlan((prev) => {
        const exists = prev.meals.some(
          (m) => m.id === meal.id || (m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType)
        );
        const updatedMeals = exists
          ? prev.meals.map((m) =>
              m.id === meal.id || (m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType) ? meal : m
            )
          : [...prev.meals, meal];
        const updatedPlan: HouseMealPlan = { ...prev, meals: updatedMeals };
        if (houseKey) {
          localStorage.setItem(`${houseKey}_meals`, JSON.stringify(updatedPlan));
        }
        return updatedPlan;
      });

      if (currentHouse?.id) {
        emitMealUpdated(currentHouse.id, meal);
      }
      showToast(`Prato "${meal.title}" salvo no cardápio!`);
    },
    [houseKey, currentHouse?.id, showToast]
  );

  const handleDeleteMeal = useCallback(
    (mealId: string) => {
      setMealPlan((prev) => {
        const updatedPlan: HouseMealPlan = {
          ...prev,
          meals: prev.meals.filter((m) => m.id !== mealId),
        };
        if (houseKey) {
          localStorage.setItem(`${houseKey}_meals`, JSON.stringify(updatedPlan));
        }
        return updatedPlan;
      });

      if (currentHouse?.id) {
        emitMealDeleted(currentHouse.id, mealId);
      }
      showToast('Prato removido do cardápio.');
    },
    [houseKey, currentHouse?.id, showToast]
  );

  const handleClearMeals = useCallback(() => {
    setMealPlan((prev) => {
      const updatedPlan: HouseMealPlan = {
        ...prev,
        meals: [],
      };
      if (houseKey) {
        localStorage.setItem(`${houseKey}_meals`, JSON.stringify(updatedPlan));
      }
      return updatedPlan;
    });

    showToast('Cardápio esvaziado com sucesso. Pronto para novos pratos!');
  }, [houseKey, showToast]);

  const handleToggleMealLock = useCallback(() => {
    if (currentUser.role !== 'Admin Geral') {
      showToast('Apenas o Administrador Geral pode trancar ou destrancar o cardápio.');
      return;
    }

    setMealPlan((prev) => {
      const nextLocked = !prev.isLocked;
      const updatedPlan: HouseMealPlan = {
        ...prev,
        isLocked: nextLocked,
        lockedBy: nextLocked ? authUser?.id : undefined,
        lockedByName: nextLocked ? authUser?.name : undefined,
        lockedAt: nextLocked ? new Date().toISOString() : undefined,
      };

      if (houseKey) {
        localStorage.setItem(`${houseKey}_meals`, JSON.stringify(updatedPlan));
      }

      if (currentHouse?.id) {
        emitMealLockToggled(
          currentHouse.id,
          nextLocked,
          nextLocked ? authUser?.id : undefined,
          nextLocked ? authUser?.name : undefined
        );
      }

      showToast(
        nextLocked
          ? 'Cardápio trancado com sucesso pelo Administrador Geral.'
          : 'Cardápio destrancado. Edições liberadas.'
      );

      return updatedPlan;
    });
  }, [currentUser.role, authUser?.id, authUser?.name, houseKey, currentHouse?.id, showToast]);

  // Nível 1: Não Autenticado ➔ Tela de Login / Cadastro
  if (!authUser) {
    return (
      <>
        <AuthView onAuthSuccess={handleAuthSuccess} />
        {toastMessage && (
          <div
            className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Nível 2: Autenticado mas sem Residência Ativa ➔ Seletor / Criação de Residência
  if (!currentHouse) {
    return (
      <>
        <HouseSelectionView
          currentUser={authUser}
          token={authToken || undefined}
          onHouseSelected={handleHouseSelected}
          onLogout={handleLogout}
        />
        {toastMessage && (
          <div
            className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Nível 3: Autenticado e com Residência ➔ Aplicação Principal Domus
  return (
    <div className="flex min-h-[100dvh] w-full max-w-full bg-[#F4F9F7] text-[#131e1d]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'dashboard') setSubTab('bulletin');
          if (tab === 'tasks') setSubTab('rotations');
          if (tab === 'settings') setSubTab('preferences');
          setIsMobileMenuOpen(false);
        }}
        currentUser={currentUser}
        activeUsers={activeMembersForSidebar}
        onLogoutClick={handleLogout}
        onSwitchHouseClick={handleSwitchHouse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="ml-0 md:ml-[250px] lg:ml-[280px] flex-1 min-w-0 max-w-full flex flex-col bg-[#F4F9F7] min-h-[100dvh] relative">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          subTab={subTab}
          onSubTabChange={setSubTab}
          vacationMode={vacationMode}
          onToggleVacationMode={handleToggleVacationMode}
          unreadNotificationCount={unreadNotificationCount}
          onOpenNotifications={handleOpenNotifications}
          onOpenMembersDrawer={() => setIsMembersDrawerOpen(true)}
          onSwitchHouse={handleSwitchHouse}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic View Canvas */}
        <div
          className="flex-1 min-w-0 max-w-full pb-6 md:pb-12"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUserId={authUser.id}
              currentUserName={authUser.name}
              currentHouseId={currentHouse.id}
              houseName={currentHouse?.name}
              houseInviteCode={currentHouse?.invite_code}
              subTab={subTab}
              vacationMode={vacationMode}
              onShowToast={showToast}
              muralNotes={muralNotes}
              onAddMuralNote={handleAddMuralNote}
              onDeleteMuralNote={handleDeleteMuralNote}
              familyMembers={familyMembers}
              onSyncMembers={handleSyncMembers}
              onSyncHouse={(house) => {
                setCurrentHouse((prev) => ({
                  ...(prev || {}),
                  id: house.id,
                  name: house.name,
                  invite_code: house.invite_code,
                }));
              }}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksRotationsView
              tasks={tasks}
              rotations={rotations}
              familyMembers={familyMembers}
              currentUserId={authUser?.id}
              currentUserRole={currentUser.role}
              currentUserName={authUser?.name}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onTaskStatusChange={handleTaskStatusChange}
              onDeleteTask={handleDeleteTask}
              onRotateNext={handleRotateNext}
              onUpdateRotations={setRotations}
            />
          )}

          {currentTab === 'meals' && (
            <MealsView
              mealPlan={mealPlan}
              familyMembers={familyMembers}
              currentUserRole={currentUser.role}
              currentUserId={authUser?.id}
              currentUserName={authUser?.name}
              onUpdateMeal={handleUpdateMeal}
              onDeleteMeal={handleDeleteMeal}
              onToggleLock={handleToggleMealLock}
              onClearMeals={handleClearMeals}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              preferences={preferences}
              onUpdatePreferences={setPreferences}
              houseRules={houseRules}
              onUpdateHouseRules={setHouseRules}
              familyMembers={familyMembers}
              onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
              onOpenAddRuleModal={() => setIsAddRuleOpen(true)}
              onSwitchHouse={handleSwitchHouse}
              currentUserRole={currentUser.role}
              currentUserId={authUser.id}
              onPromoteToAdmin={handlePromoteToAdmin}
              onDemoteToResident={handleDemoteToResident}
              onTransferGeneralAdmin={handleInitiateTransferGeneralAdmin}
              onRemoveMember={handleRemoveMember}
              onLeaveHouse={() => setIsLeaveHouseOpen(true)}
              houseInviteCode={currentHouse?.invite_code}
              houseName={currentHouse?.name}
              onRegenerateCode={() => setIsRegenerateCodeModalOpen(true)}
              onShowToast={showToast}
              installPromptEvent={deferredInstallPrompt}
              onInstallAccepted={() => setDeferredInstallPrompt(null)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              tasks={tasks}
              familyMembers={familyMembers}
              activityLogs={activityLogs}
              currentUserRole={currentUser.role}
              onTaskStatusChange={handleTaskStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentTab === 'statistics' && (
            <StatisticsView
              currentHouseId={currentHouse.id}
              currentUserId={authUser.id}
              familyMembers={familyMembers}
              tasks={tasks}
              activityLogs={activityLogs}
            />
          )}
        </div>
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        familyMembers={familyMembers}
        onAddExpense={handleAddExpense}
      />

      <RequestReimbursementModal
        isOpen={isReimbursementOpen}
        onClose={() => setIsReimbursementOpen(false)}
        onSubmit={handleReimbursement}
      />

      <AddHouseRuleModal
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        onAddRule={handleAddHouseRule}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddFamilyMember}
        currentUserRole={currentUser.role}
        onInitiateTransferGeneralAdmin={handleInitiateTransferForNewMember}
      />

      <LeadershipTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferTarget(null);
        }}
        onConfirm={handleConfirmLeadershipTransfer}
        targetMemberName={transferTarget?.member?.name || transferTarget?.newMemberData?.name || 'Novo Membro'}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        activityLogs={activityLogs}
        tasks={tasks}
        onTaskStatusChange={handleTaskStatusChange}
        readNotificationIds={readNotificationIds}
        notificationsClearedAt={notificationsClearedAt}
        onClearReadNotifications={handleClearReadNotifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNavigateToReports={handleNavigateToReports}
      />

      <FamilyMembersDrawer
        isOpen={isMembersDrawerOpen}
        onClose={() => setIsMembersDrawerOpen(false)}
        memberStatuses={memberStatuses}
        familyMembers={familyMembers}
        onUpdateMemberStatus={handleUpdateMemberStatus}
        onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
        currentUserRole={currentUser.role}
        currentUserId={authUser.id}
        onPromoteToAdmin={handlePromoteToAdmin}
        onDemoteToResident={handleDemoteToResident}
        onTransferGeneralAdmin={handleInitiateTransferGeneralAdmin}
        onRemoveMember={handleRemoveMember}
      />

      <LeaveHouseModal
        isOpen={isLeaveHouseOpen}
        onClose={() => setIsLeaveHouseOpen(false)}
        onConfirm={handleConfirmLeaveHouse}
        isGeneralAdmin={currentUser.role === 'Admin Geral'}
        availableSuccessors={familyMembers.filter((m) => m.id !== authUser?.id)}
        houseName={currentHouse?.name || 'Residência Atual'}
        loading={leaveHouseLoading}
      />

      <ConfirmActionModal
        isOpen={isRegenerateCodeModalOpen}
        onClose={() => setIsRegenerateCodeModalOpen(false)}
        onConfirm={handleConfirmRegenerateCode}
        title="Regenerar Código da Residência"
        description="Ao confirmar, o código anterior será invalidado imediatamente. Novos membros precisarão do novo código gerado para ingressar nesta casa."
        confirmText="Regenerar Código"
        cancelText="Cancelar"
        variant="warning"
        icon="autorenew"
        loading={regenerateCodeLoading}
      />
    </div>
  );
}
