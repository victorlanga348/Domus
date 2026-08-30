/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { TabType, FamilyMember, HouseTask, TaskRotation, ExpenseItem, HouseRule, ActivityLog, SystemPreferences, MuralNote, MemberStatus } from './types';
import {
  INITIAL_FAMILY_MEMBERS,
  INITIAL_TASKS,
  INITIAL_ROTATIONS,
  INITIAL_EXPENSES,
  INITIAL_HOUSE_RULES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_PREFERENCES,
  INITIAL_MURAL_NOTES,
  INITIAL_MEMBER_STATUSES,
} from './data';
import { Sidebar, Header } from './layouts/index.js';
import { DashboardView } from './features/dashboard/index.js';
import { TasksRotationsView } from './features/tasks-rotation/index.js';
import { SettingsView } from './features/settings/index.js';
import { ReportsView } from './features/reports/index.js';
import { StatisticsView } from './features/statistics/index.js';
import { RoomsView } from './features/rooms/index.js';
import {
  AddExpenseModal,
  RequestReimbursementModal,
  AddHouseRuleModal,
  AddMemberModal,
  NotificationsDrawer,
  AccessLogsModal,
  FamilyMembersDrawer,
} from './components/index.js';
import {
  AuthScreen,
  RegisterView,
  LoginView,
  HouseholdSelectionView,
  CreateHouseholdView,
  JoinHouseholdView,
} from './features/auth/index.js';

export default function App() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('household-selection');
  const [houseName, setHouseName] = useState<string>('Residência Alameda');
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [subTab, setSubTab] = useState<string>('bulletin');
  const [vacationMode, setVacationMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent / Reactive State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('domus_members');
    return saved ? JSON.parse(saved) : INITIAL_FAMILY_MEMBERS;
  });

  const [tasks, setTasks] = useState<HouseTask[]>(() => {
    const saved = localStorage.getItem('domus_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [rotations, setRotations] = useState<TaskRotation[]>(() => {
    const saved = localStorage.getItem('domus_rotations');
    return saved ? JSON.parse(saved) : INITIAL_ROTATIONS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('domus_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [houseRules, setHouseRules] = useState<HouseRule[]>(() => {
    const saved = localStorage.getItem('domus_rules');
    return saved ? JSON.parse(saved) : INITIAL_HOUSE_RULES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('domus_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    const saved = localStorage.getItem('domus_prefs');
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [muralNotes, setMuralNotes] = useState<MuralNote[]>(() => {
    const saved = localStorage.getItem('domus_notes');
    return saved ? JSON.parse(saved) : INITIAL_MURAL_NOTES;
  });

  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>(() => {
    const saved = localStorage.getItem('domus_statuses');
    return saved ? JSON.parse(saved) : INITIAL_MEMBER_STATUSES;
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

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('domus_members', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('domus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('domus_rotations', JSON.stringify(rotations));
  }, [rotations]);

  useEffect(() => {
    localStorage.setItem('domus_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('domus_rules', JSON.stringify(houseRules));
  }, [houseRules]);

  useEffect(() => {
    localStorage.setItem('domus_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('domus_prefs', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('domus_notes', JSON.stringify(muralNotes));
  }, [muralNotes]);

  useEffect(() => {
    localStorage.setItem('domus_statuses', JSON.stringify(memberStatuses));
  }, [memberStatuses]);

  const handleAddMuralNote = (newNote: Omit<MuralNote, 'id' | 'dateStr'>) => {
    const note: MuralNote = {
      ...newNote,
      id: 'n_' + Date.now(),
      dateStr: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMuralNotes((prev) => [note, ...prev]);
    showToast('Nota adicionada ao Mural!');
  };

  const handleDeleteMuralNote = (id: string) => {
    setMuralNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Nota removida!');
  };

  const handleToggleNoteItem = (noteId: string, itemId: string) => {
    setMuralNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.items) return n;
        return {
          ...n,
          items: n.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  };

  const handleTogglePinNote = (noteId: string) => {
    setMuralNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleUpdateMemberStatus = (memberId: string, newLocation: string, newIcon?: string) => {
    setMemberStatuses((prev) =>
      prev.map((s) =>
        s.id === memberId
          ? { ...s, location: newLocation, icon: newIcon || s.icon }
          : s
      )
    );
    showToast('Status atualizado!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleVacationMode = () => {
    const next = !vacationMode;
    setVacationMode(next);
    showToast(next ? 'Modo Férias Ativado: Simulação de presença e economia iniciada.' : 'Modo Férias Desativado: Rotinas normais restauradas.');
  };

  const currentUser = familyMembers.find((m) => m.isPrimary) || familyMembers[0];

  const handleAddTask = (newTask: Omit<HouseTask, 'id' | 'status'>) => {
    const taskObj: HouseTask = {
      ...newTask,
      id: `t_${Date.now()}`,
      status: 'pending',
    };
    setTasks((prev) => [taskObj, ...prev]);

    // If advanceNotice is set, create a system activity log alert
    if (newTask.advanceNotice && newTask.advanceNotice !== 'Sem aviso') {
      setActivityLogs((prev) => [
        {
          id: `a_rem_${Date.now()}`,
          title: `⏰ Lembrete: "${taskObj.title}" (Aviso: ${newTask.advanceNotice} para ${taskObj.nextMember})`,
          timeAgo: 'Agendado',
          author: 'Sistema',
          type: 'task',
        },
        ...prev,
      ]);
    }

    showToast(`Nova tarefa "${taskObj.title}" (${taskObj.frequency || 'Agendada'}) criada com sucesso!`);
  };

  /* Handlers for Task status & Deletion */
  const handleDeleteTask = (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskObj) {
      const logText = `Tarefa "${taskObj.title}" foi excluída`;
      setActivityLogs((prev) => [
        {
          id: `a_${Date.now()}`,
          title: logText,
          timeAgo: 'Agora mesmo',
          author: currentUser.name,
          type: 'task',
        },
        ...prev,
      ]);
      showToast(logText);
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: HouseTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    const taskObj = tasks.find((t) => t.id === taskId);
    if (taskObj) {
      const logText =
        newStatus === 'completed'
          ? `Tarefa "${taskObj.title}" concluída por ${currentUser.name}`
          : newStatus === 'skipped'
          ? `Vez pulada na tarefa "${taskObj.title}"`
          : newStatus === 'cancelled'
          ? `Tarefa "${taskObj.title}" cancelada`
          : `Tarefa "${taskObj.title}" revertida para pendente`;

      setActivityLogs((prev) => [
        {
          id: `a_${Date.now()}`,
          title: logText,
          timeAgo: 'Agora mesmo',
          author: currentUser.name,
          type: 'task',
        },
        ...prev,
      ]);
      showToast(logText);
    }
  };

  /* Handlers for Rotations */
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
    showToast('Fila de rotação girada para o próximo membro!');
  };

  /* Handlers for Expenses */
  const handleSettleExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Settled' } : e))
    );
    showToast('Despesa marcada como liquidada com sucesso!');
  };

  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      ...expense,
      id: `exp_${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);

    setActivityLogs((prev) => [
      {
        id: `a_${Date.now()}`,
        title: `Nova despesa: ${expense.title} ($${expense.amount.toFixed(2)})`,
        timeAgo: 'Agora mesmo',
        author: expense.paidBy,
        type: 'system',
      },
      ...prev,
    ]);

    showToast(`Despesa "$${expense.title}" adicionada!`);
  };

  const handleReimbursement = (amount: number, reason: string) => {
    showToast(`Solicitação de reembolso de $${amount.toFixed(2)} enviada!`);
  };

  /* Handlers for Activity logs */
  const handleAddActivityLog = (text: string) => {
    setActivityLogs((prev) => [
      {
        id: `a_${Date.now()}`,
        title: text,
        timeAgo: 'Agora mesmo',
        author: currentUser.name,
        likes: 1,
      },
      ...prev,
    ]);
  };

  const handleLikeActivity = (id: string) => {
    setActivityLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, likes: (l.likes || 1) + 1 } : l))
    );
  };

  /* Handlers for House Rules */
  const handleAddHouseRule = (rule: Omit<HouseRule, 'id' | 'number'>) => {
    const newRule: HouseRule = {
      ...rule,
      id: `hr_${Date.now()}`,
      number: houseRules.length + 1,
    };
    setHouseRules((prev) => [...prev, newRule]);
    showToast('Nova regra da casa adicionada!');
  };

  /* Handlers for Family Members */
  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `m_${Date.now()}`,
    };
    setFamilyMembers((prev) => [...prev, newMember]);
    showToast(`Convite enviado para ${member.name}!`);
  };

  // Switcher flutuante para transição e testes de visualização
  const devSwitcher = (
    <div className="fixed bottom-4 left-4 z-50 bg-[#16302e]/95 backdrop-blur-md text-white text-xs py-2 px-3 rounded-2xl shadow-2xl border border-[#2d4644] flex items-center gap-1.5 overflow-x-auto max-w-[90vw]">
      <span className="material-symbols-outlined text-sm text-[#ffca5e]">layers</span>
      <span className="font-bold text-[10px] uppercase tracking-wider text-[#98b3b0] mr-1 hidden sm:inline">Telas:</span>
      
      <button
        type="button"
        onClick={() => setAuthScreen('register')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'register' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Cadastro
      </button>

      <button
        type="button"
        onClick={() => setAuthScreen('login')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'login' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => setAuthScreen('household-selection')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'household-selection' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Escolha
      </button>

      <button
        type="button"
        onClick={() => setAuthScreen('create-household')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'create-household' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Criar Sala/Residência
      </button>

      <button
        type="button"
        onClick={() => setAuthScreen('join-household')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'join-household' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Entrar em Sala/Residência
      </button>

      <button
        type="button"
        onClick={() => setAuthScreen('app')}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
          authScreen === 'app' ? 'bg-[#ffca5e] text-[#16302e] font-bold shadow' : 'hover:bg-[#2d4644] text-white/90'
        }`}
      >
        Dashboard
      </button>
    </div>
  );

  // Renderização condicional das Telas de Autenticação / Onboarding
  if (authScreen === 'register') {
    return (
      <>
        <RegisterView
          onRegister={(data) => {
            showToast(`Conta criada com sucesso para ${data.fullName}!`);
            setAuthScreen('household-selection');
          }}
          onNavigateLogin={() => setAuthScreen('login')}
        />
        {devSwitcher}
      </>
    );
  }

  if (authScreen === 'login') {
    return (
      <>
        <LoginView
          onLogin={(data) => {
            showToast(`Bem-vindo de volta (${data.email})!`);
            setAuthScreen('household-selection');
          }}
          onNavigateRegister={() => setAuthScreen('register')}
          onNavigateSetupHome={() => setAuthScreen('household-selection')}
        />
        {devSwitcher}
      </>
    );
  }

  if (authScreen === 'household-selection') {
    return (
      <>
        <HouseholdSelectionView
          onSelectCreate={() => setAuthScreen('create-household')}
          onSelectJoin={() => setAuthScreen('join-household')}
          onLogout={() => {
            showToast('Sessão finalizada.');
            setAuthScreen('login');
          }}
        />
        {devSwitcher}
      </>
    );
  }

  if (authScreen === 'create-household') {
    return (
      <>
        <CreateHouseholdView
          onSuccess={(data) => {
            setHouseName(data.name);
            showToast(`Residência "${data.name}" fundada com código ${data.code}!`);
            setAuthScreen('app');
          }}
          onBack={() => setAuthScreen('household-selection')}
          onNavigateLogin={() => setAuthScreen('login')}
        />
        {devSwitcher}
      </>
    );
  }

  if (authScreen === 'join-household') {
    return (
      <>
        <JoinHouseholdView
          onSuccess={(data) => {
            setHouseName(data.name);
            showToast(`Entrou na residência "${data.name}" (${data.code}) com sucesso!`);
            setAuthScreen('app');
          }}
          onBack={() => setAuthScreen('household-selection')}
          onNavigateCreate={() => setAuthScreen('create-household')}
        />
        {devSwitcher}
      </>
    );
  }

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
        onLogoutClick={() => {
          showToast('Sessão encerrada com segurança.');
          setAuthScreen('login');
        }}
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
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Dynamic View Canvas */}
        <div className="flex-1 pb-6 md:pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUserId={currentUser?.id || 'user-1'}
              currentHouseId="house-1"
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

          {currentTab === 'rooms' && (
            <RoomsView
              currentUserId={currentUser?.id || 'user-1'}
              currentHouseId="house-1"
              onShowToast={showToast}
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
              currentHouseId="house-1"
              currentUserId={currentUser?.id || 'user-1'}
              familyMembers={familyMembers}
            />
          )}
        </div>
      </main>

      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#ffca5e] text-xs font-bold flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#ffca5e] text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals & Drawers */}
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
      />

      {devSwitcher}
    </div>
  );
}
