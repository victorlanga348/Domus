/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
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
} from './types';
import { INITIAL_PREFERENCES } from './data.js';
import { Sidebar, Header } from './layouts/index.js';
import { DashboardView } from './features/dashboard/index.js';
import { TasksRotationsView, tasksApi } from './features/tasks-rotation/index.js';
import { SettingsView } from './features/settings/index.js';
import { ReportsView } from './features/reports/index.js';
import { StatisticsView } from './features/statistics/index.js';
import {
  AddExpenseModal,
  RequestReimbursementModal,
  AddHouseRuleModal,
  AddMemberModal,
  NotificationsDrawer,
  FamilyMembersDrawer,
  LeadershipTransferModal,
} from './components/index.js';
import { AuthView, HouseSelectionView, type AuthUser, type HouseResponse } from './features/auth/index.js';
import {
  useHouseSocket,
  emitHouseLog,
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskStatusChanged,
  emitNoteCreated,
  emitNoteDeleted,
  emitStatusChanged,
  emitRuleCreated,
  emitRuleDeleted,
  emitRotationAdvanced,
} from './shared/socket/index.js';

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

  // 3. Navegação & Abas
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [subTab, setSubTab] = useState<string>('bulletin');
  const [vacationMode, setVacationMode] = useState<boolean>(() => authUser?.vacation_mode || false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Modal Visibility States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReimbursementOpen, setIsReimbursementOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      localStorage.setItem(`${houseKey}_prefs`, JSON.stringify(preferences));
      localStorage.setItem(`${houseKey}_notes`, JSON.stringify(muralNotes));
      localStorage.setItem(`${houseKey}_statuses`, JSON.stringify(memberStatuses));
    }
  }, [
    houseKey,
    familyMembers,
    tasks,
    rotations,
    expenses,
    houseRules,
    activityLogs,
    preferences,
    muralNotes,
    memberStatuses,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Helper de registro e sincronização de notificações em tempo real
  const recordHouseActivity = useCallback(
    (title: string, author?: string) => {
      const newLog: ActivityLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        timeAgo: 'Agora mesmo',
        author: author || authUser?.name || 'Morador',
        type: 'system',
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      if (currentHouse?.id) {
        emitHouseLog(currentHouse.id, newLog);
      }
    },
    [authUser?.name, currentHouse?.id]
  );

  // Escuta Notificações e Atividades em tempo real de outros dispositivos
  useHouseSocket(currentHouse?.id || '', {
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
  });

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    setVacationMode(user.vacation_mode);

    if (user.house_id && !currentHouse) {
      setCurrentHouse({
        id: user.house_id,
        name: 'Minha Residência',
        invite_code: 'CASA-DOMUS',
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
  };

  const handleSwitchHouse = () => {
    setCurrentHouse(null);
    localStorage.removeItem('domus_auth_house');
    showToast('Alternando de residência. Escolha uma residência salva ou funde uma nova.');
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
    setMuralNotes([]);
    setMemberStatuses([]);
    showToast('Sessão encerrada.');
  };

  const handleToggleVacationMode = () => {
    const next = !vacationMode;
    setVacationMode(next);
    if (authUser) {
      setAuthUser({ ...authUser, vacation_mode: next });
    }
    recordHouseActivity(`${authUser?.name || 'Morador'} ${next ? 'ativou' : 'desativou'} o modo férias.`);
    showToast(next ? 'Modo Férias Ativado: Você foi temporariamente pausado do rodízio.' : 'Modo Férias Desativado: Retornando à escala normal.');
  };

  const handleAddMuralNote = (newNote: Omit<MuralNote, 'id' | 'dateStr'>) => {
    const note: MuralNote = {
      ...newNote,
      id: 'n_' + Date.now(),
      dateStr: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMuralNotes((prev) => [note, ...prev]);
    if (currentHouse?.id) {
      emitNoteCreated(currentHouse.id, note);
    }
    recordHouseActivity(`Novo recado no mural fixado por ${newNote.author}`);
    showToast('Recado fixado no mural!');
  };

  const handleDeleteMuralNote = (id: string) => {
    setMuralNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentHouse?.id) {
      emitNoteDeleted(currentHouse.id, id);
    }
    showToast('Recado removido!');
  };

  const handleAddTask = (newTask: Omit<HouseTask, 'id' | 'status'>) => {
    const taskObj: HouseTask = {
      ...newTask,
      id: `t_${Date.now()}`,
      status: 'pending',
    };
    setTasks((prev) => [taskObj, ...prev]);
    if (currentHouse?.id) {
      emitTaskCreated(currentHouse.id, taskObj);
    }
    recordHouseActivity(`Nova tarefa "${taskObj.title}" criada.`);
    showToast(`Tarefa "${taskObj.title}" criada com sucesso!`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentHouse?.id) {
      emitTaskDeleted(currentHouse.id, taskId);
    }
    if (taskObj) {
      recordHouseActivity(`Tarefa "${taskObj.title}" foi excluída.`);
      showToast(`Tarefa "${taskObj.title}" excluída.`);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: HouseTask['status']) => {
    const completedByName = authUser?.name || 'Morador';
    const completedById = authUser?.id;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === 'completed') {
            recordHouseActivity(`Tarefa "${t.title}" foi concluída por ${completedByName}.`);
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
    if (newStatus === 'completed' && authUser?.id) {
      tasksApi.completeTask(taskId, authUser.id).catch(() => {
        // Ignora silenciosamente se for tarefa em mock local ou offline
      });
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
    const newMember: FamilyMember = { ...member, id: `m_${Date.now()}` };
    setFamilyMembers((prev) => [...prev, newMember]);
    recordHouseActivity(`Novo membro adicionado: ${member.name} (${member.role})`);
    showToast(`Membro ${member.name} adicionado com sucesso!`);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === authUser?.id) {
      showToast('Você não pode se auto-remover pelas configurações. Use a opção Trocar ou Sair da Residência.');
      return;
    }
    setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId));
    setMemberStatuses((prev) => prev.filter((s) => s.id !== memberId));
    recordHouseActivity(`${memberName} foi removido da residência por ${authUser?.name || 'Administrador'}`);
    showToast(`Membro ${memberName} removido da residência.`);
  };

  const handlePromoteToAdmin = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: 'Admin' } : m))
    );
    if (member) {
      recordHouseActivity(`${member.name} foi promovido a Administrador Normal por ${authUser?.name}`);
    }
    showToast('Membro promovido a Administrador Normal.');
  };

  const handleDemoteToResident = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: 'Resident' } : m))
    );
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

    if (transferTarget.member) {
      const targetId = transferTarget.member.id;
      setFamilyMembers((prev) =>
        prev.map((m) => {
          if (m.id === targetId) {
            return { ...m, role: 'Admin Geral', isPrimary: true };
          }
          if (m.role === 'Admin Geral' || m.id === authUser?.id) {
            return { ...m, role: 'Admin', isPrimary: false };
          }
          return m;
        })
      );
      recordHouseActivity(`Liderança da residência transferida para ${transferTarget.member.name}`);
      showToast(`Liderança transferida para ${transferTarget.member.name}! Você agora é Admin Normal.`);
    } else if (transferTarget.newMemberData) {
      const newCreatedMember: FamilyMember = {
        ...transferTarget.newMemberData,
        id: `m_${Date.now()}`,
        role: 'Admin Geral',
        isPrimary: true,
      };
      setFamilyMembers((prev) => [
        ...prev.map((m) =>
          m.role === 'Admin Geral' || m.id === authUser?.id ? { ...m, role: 'Admin' as const, isPrimary: false } : m
        ),
        newCreatedMember,
      ]);
      recordHouseActivity(`Novo Admin Geral nomeado: ${transferTarget.newMemberData.name}`);
      showToast(`Novo Admin Geral ${transferTarget.newMemberData.name} cadastrado! Você agora é Admin Normal.`);
    }

    setIsTransferModalOpen(false);
    setTransferTarget(null);
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

  // Nível 1: Não Autenticado ➔ Tela de Login / Cadastro
  if (!authUser) {
    return (
      <>
        <AuthView onAuthSuccess={handleAuthSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
          onHouseSelected={handleHouseSelected}
          onLogout={handleLogout}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Nível 3: Autenticado e com Residência ➔ Aplicação Principal DOMUS
  return (
    <div className="flex h-screen bg-[#e4f0ee] overflow-hidden text-[#131e1d]">
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
        activeUsers={familyMembers}
        onLogoutClick={handleLogout}
        onSwitchHouseClick={handleSwitchHouse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="ml-0 md:ml-[250px] lg:ml-[280px] flex-1 flex flex-col bg-[#f0fcfa] h-full overflow-y-auto relative">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          subTab={subTab}
          onSubTabChange={setSubTab}
          vacationMode={vacationMode}
          onToggleVacationMode={handleToggleVacationMode}
          unreadNotificationCount={activityLogs.length}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMembersDrawer={() => setIsMembersDrawerOpen(true)}
          onSwitchHouse={handleSwitchHouse}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic View Canvas */}
        <div className="flex-1 pb-6 md:pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUserId={authUser.id}
              currentUserName={authUser.name}
              currentHouseId={currentHouse.id}
              subTab={subTab}
              vacationMode={vacationMode}
              onShowToast={showToast}
              muralNotes={muralNotes}
              onAddMuralNote={handleAddMuralNote}
              onDeleteMuralNote={handleDeleteMuralNote}
              familyMembers={familyMembers}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksRotationsView
              tasks={tasks}
              rotations={rotations}
              familyMembers={familyMembers}
              onAddTask={handleAddTask}
              onTaskStatusChange={handleTaskStatusChange}
              onDeleteTask={handleDeleteTask}
              onRotateNext={handleRotateNext}
              onUpdateRotations={setRotations}
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
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              tasks={tasks}
              familyMembers={familyMembers}
              activityLogs={activityLogs}
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-lg border border-[#2d4644] text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
    </div>
  );
}
