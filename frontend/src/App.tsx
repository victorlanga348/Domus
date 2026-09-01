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
import { TasksRotationsView } from './features/tasks-rotation/index.js';
import { SettingsView } from './features/settings/index.js';
import { ReportsView } from './features/reports/index.js';
import { StatisticsView } from './features/statistics/index.js';
import {
  AddExpenseModal,
  RequestReimbursementModal,
  AddHouseRuleModal,
  AddMemberModal,
  NotificationsDrawer,
  AccessLogsModal,
  FamilyMembersDrawer,
  LeadershipTransferModal,
} from './components/index.js';
import { AuthView, HouseSelectionView, type AuthUser, type HouseResponse } from './features/auth/index.js';

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

  // 4. Estados Reais por Residência (Iniciam 100% vazios para casas novas)
  const houseKey = currentHouse ? `domus_house_${currentHouse.id}` : null;

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    if (!currentHouse || !authUser) return [];
    const saved = houseKey ? localStorage.getItem(`${houseKey}_members`) : null;
    if (saved) return JSON.parse(saved);

    // Membro inicial é estritamente o usuário cadastrado (Admin Geral quando criador)
    return [
      {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role === 'ADMIN' ? 'Admin Geral' : 'Resident',
        isPrimary: true,
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
    return saved ? JSON.parse(saved) : [];
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
  const [isAccessLogsOpen, setIsAccessLogsOpen] = useState(false);
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

    // Inicializar membro como estritamente o usuário logado
    const primary: FamilyMember = {
      id: houseData.user.id,
      name: houseData.user.name,
      email: houseData.user.email,
      role: houseData.user.role === 'ADMIN' ? 'Admin Geral' : 'Resident',
      isPrimary: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(houseData.user.name)}`,
    };

    setFamilyMembers([primary]);
    setTasks([]);
    setRotations([]);
    setExpenses([]);
    setHouseRules([]);
    setMuralNotes([]);
    setMemberStatuses([]);
    setActivityLogs([
      {
        id: `log_${Date.now()}`,
        title: `Residência "${houseData.house.name}" fundada por ${houseData.user.name}`,
        timeAgo: 'Agora mesmo',
        author: houseData.user.name,
        type: 'system',
      },
    ]);
  };

  const handleSwitchHouse = () => {
    setCurrentHouse(null);
    localStorage.removeItem('domus_auth_house');
    showToast('Alternando de residência. Escolha uma residência salva ou funde uma nova.');
  };

  const handleSyncMembers = useCallback((backendMembers: any[]) => {
    if (!backendMembers || backendMembers.length === 0) return;
    setFamilyMembers((prev) => {
      const merged: FamilyMember[] = backendMembers.map((bm, index) => {
        const existing = prev.find((p) => p.id === bm.id);
        const isPrimary = existing ? existing.isPrimary : (index === 0 && bm.role === 'ADMIN');
        const role = existing?.role || (bm.role === 'ADMIN' ? (isPrimary ? 'Admin Geral' : 'Admin') : 'Resident');
        return {
          id: bm.id,
          name: bm.name,
          email: bm.email,
          role,
          isPrimary: role === 'Admin Geral',
          avatar: existing?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bm.name)}`,
        };
      });
      return merged;
    });
  }, []);

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
    showToast(next ? 'Modo Férias Ativado: Você foi temporariamente pausado do rodízio.' : 'Modo Férias Desativado: Retornando à escala normal.');
  };

  const handleAddMuralNote = (newNote: Omit<MuralNote, 'id' | 'dateStr'>) => {
    const note: MuralNote = {
      ...newNote,
      id: 'n_' + Date.now(),
      dateStr: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMuralNotes((prev) => [note, ...prev]);
    showToast('Recado fixado no mural!');
  };

  const handleDeleteMuralNote = (id: string) => {
    setMuralNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Recado removido!');
  };

  const handleAddTask = (newTask: Omit<HouseTask, 'id' | 'status'>) => {
    const taskObj: HouseTask = {
      ...newTask,
      id: `t_${Date.now()}`,
      status: 'pending',
    };
    setTasks((prev) => [taskObj, ...prev]);
    showToast(`Tarefa "${taskObj.title}" criada com sucesso!`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskObj) {
      showToast(`Tarefa "${taskObj.title}" excluída.`);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: HouseTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
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
    showToast('Rodízio avançado.');
  };

  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = { ...expense, id: `exp_${Date.now()}` };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Despesa adicionada.`);
  };

  const handleReimbursement = (amount: number, reason: string) => {
    showToast(`Solicitação de reembolso de ${amount.toFixed(2)} enviada: "${reason}".`);
  };

  const handleAddHouseRule = (rule: Omit<HouseRule, 'id' | 'number'>) => {
    const newRule: HouseRule = {
      ...rule,
      id: `hr_${Date.now()}`,
      number: houseRules.length + 1,
    };
    setHouseRules((prev) => [...prev, newRule]);
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
    showToast(`Membro ${member.name} adicionado com sucesso!`);
  };

  const handlePromoteToAdmin = (memberId: string) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: 'Admin' } : m))
    );
    showToast('Membro promovido a Administrador Normal.');
  };

  const handleDemoteToResident = (memberId: string) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: 'Resident' } : m))
    );
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
      showToast(`Novo Admin Geral ${transferTarget.newMemberData.name} cadastrado! Você agora é Admin Normal.`);
    }

    setIsTransferModalOpen(false);
    setTransferTarget(null);
  };

  const handleUpdateMemberStatus = (memberId: string, newLocation: string, newIcon?: string) => {
    setMemberStatuses((prev) =>
      prev.map((s) => (s.id === memberId ? { ...s, location: newLocation, icon: newIcon || s.icon } : s))
    );
    showToast('Status atualizado!');
  };

  const currentUser: FamilyMember = familyMembers.find((m) => m.id === authUser?.id) ||
    familyMembers.find((m) => m.isPrimary) || {
      id: authUser?.id || 'user-1',
      name: authUser?.name || 'Morador',
      email: authUser?.email || 'morador@domus.local',
      role: authUser?.role === 'ADMIN' ? 'Admin Geral' : 'Resident',
      isPrimary: authUser?.role === 'ADMIN',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser?.name || 'Morador')}`,
    };

  // --- HIERARQUIA DE ACESSO ---

  // Nível 1: Não autenticado ➔ Tela de Login / Cadastro
  if (!authUser || !authToken) {
    return (
      <>
        <AuthView onAuthSuccess={handleAuthSuccess} onShowToast={showToast} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#ffca5e] text-xs font-bold flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // Nível 2: Autenticado, mas sem casa vinculada ➔ Tela de Escolha de Residência
  if (!authUser.house_id || !currentHouse) {
    return (
      <>
        <HouseSelectionView
          currentUser={authUser}
          token={authToken}
          onHouseSelected={handleHouseSelected}
          onLogout={handleLogout}
          onShowToast={showToast}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#ffca5e] text-xs font-bold flex items-center gap-3 animate-bounce">
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
      <main className="ml-0 md:ml-[250px] lg:ml-[280px] flex-1 flex flex-col bg-[#f0fcfa] h-full overflow-y-auto relative rounded-none md:rounded-tl-[40px] shadow-none md:shadow-2xl border-l-0 md:border-l border-[#e4f0ee]">
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
              currentHouseId={currentHouse.id}
              subTab={subTab}
              vacationMode={vacationMode}
              onShowToast={showToast}
              muralNotes={muralNotes}
              onAddMuralNote={handleAddMuralNote}
              onDeleteMuralNote={handleDeleteMuralNote}
              familyMembers={familyMembers}
              onSyncMembers={handleSyncMembers}
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
              onOpenAccessLogsModal={() => setIsAccessLogsOpen(true)}
              onOpenAddRuleModal={() => setIsAddRuleOpen(true)}
              onSwitchHouse={handleSwitchHouse}
              currentUserRole={currentUser.role}
              onPromoteToAdmin={handlePromoteToAdmin}
              onDemoteToResident={handleDemoteToResident}
              onTransferGeneralAdmin={handleInitiateTransferGeneralAdmin}
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
            />
          )}
        </div>
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#ffca5e] text-xs font-bold flex items-center gap-3 animate-bounce">
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

      <AccessLogsModal
        isOpen={isAccessLogsOpen}
        onClose={() => setIsAccessLogsOpen(false)}
      />

      <FamilyMembersDrawer
        isOpen={isMembersDrawerOpen}
        onClose={() => setIsMembersDrawerOpen(false)}
        memberStatuses={memberStatuses}
        familyMembers={familyMembers}
        onUpdateMemberStatus={handleUpdateMemberStatus}
        onOpenAddMemberModal={() => setIsAddMemberOpen(true)}
        currentUserRole={currentUser.role}
        onPromoteToAdmin={handlePromoteToAdmin}
        onDemoteToResident={handleDemoteToResident}
        onTransferGeneralAdmin={handleInitiateTransferGeneralAdmin}
      />
    </div>
  );
}
