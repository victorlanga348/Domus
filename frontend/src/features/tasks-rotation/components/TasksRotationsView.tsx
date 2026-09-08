import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HouseTask, TaskRotation, FamilyMember } from '../../../types';
import { ConfirmActionModal, TasksSkeleton } from '../../../components/index.js';
import { useBodyScrollLock } from '../../../shared/hooks/index.js';

interface TasksRotationsViewProps {
  tasks: HouseTask[];
  rotations: TaskRotation[];
  familyMembers: FamilyMember[];
  loading?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  currentUserName?: string;
  onAddTask?: (task: Omit<HouseTask, 'id' | 'status'>) => void;
  onUpdateTask?: (
    taskId: string,
    data: {
      title: string;
      period: 'morning' | 'afternoon' | 'night';
      frequency: string;
      participantIds: string[];
    }
  ) => Promise<void> | void;
  onTaskStatusChange: (taskId: string, newStatus: HouseTask['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  onRotateNext: (rotationId: string) => void;
  onUpdateRotations: (updated: TaskRotation[]) => void;
}

export const TasksRotationsView: React.FC<TasksRotationsViewProps> = ({
  tasks,
  rotations,
  familyMembers,
  loading = false,
  currentUserId,
  currentUserRole = 'Resident',
  currentUserName,
  onAddTask,
  onUpdateTask,
  onTaskStatusChange,
  onDeleteTask,
  onRotateNext,
  onUpdateRotations,
}) => {
  const [activeTab, setActiveTab] = useState<'all_tasks' | 'rotations'>('all_tasks');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'morning' | 'afternoon' | 'night'>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [taskToRevert, setTaskToRevert] = useState<HouseTask | null>(null);

  const isGeneralAdmin = currentUserRole === 'Admin Geral' || currentUserRole === 'ADMIN';
  const isAdmin = currentUserRole === 'Admin' || currentUserRole === 'SUB_ADMIN';
  const canRevert = isGeneralAdmin || isAdmin;
  const currentMember = familyMembers.find((m) => m.id === currentUserId);
  const effectiveUserName = currentUserName || currentMember?.name;

  // New Task Modal state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskFrequency, setTaskFrequency] = useState('Diária');
  const [customFrequencyText, setCustomFrequencyText] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [taskPeriod, setTaskPeriod] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [taskAssignmentType, setTaskAssignmentType] = useState<'member' | 'rotation'>('member');
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]?.name || 'Qualquer pessoa');

  // Rotation selection / creation within task modal
  const [rotationMode, setRotationMode] = useState<'existing' | 'new'>('existing');
  const [selectedRotationId, setSelectedRotationId] = useState(rotations[0]?.id || '');
  const [newRotationTitle, setNewRotationTitle] = useState('');
  const [selectedRotationMembers, setSelectedRotationMembers] = useState<string[]>(
    familyMembers.map((m) => m.name)
  );

  // Advance notice / reminder time state
  const [advanceNoticeOption, setAdvanceNoticeOption] = useState('Sem aviso');
  const [customAdvanceNotice, setCustomAdvanceNotice] = useState('');

  const [taskIcon] = useState('checklist');

  // Edit Rotation Modal state
  const [editingTask, setEditingTask] = useState<HouseTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPeriod, setEditPeriod] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [editFrequency, setEditFrequency] = useState('Diária');
  const [editParticipantIds, setEditParticipantIds] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Lock background scroll when task modal or edit modal is active
  useBodyScrollLock(isAddTaskModalOpen || Boolean(editingTask));

  const handleOpenEditRotation = (task: HouseTask) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPeriod(task.period || 'morning');
    setEditFrequency(task.frequency || 'Diária');
    setEditError(null);

    let participantIds: string[] = [];
    if (task.participantIds && task.participantIds.length > 0) {
      participantIds = [...task.participantIds];
    } else if (task.participants && task.participants.length > 0) {
      participantIds = task.participants.map((p) => p.id);
    } else {
      const matchingRot = rotations.find((r) => r.id === task.id || r.taskId === task.id);
      if (matchingRot && matchingRot.queue) {
        participantIds = matchingRot.queue
          .map((q) => q.id || familyMembers.find((m) => m.name === q.name)?.id)
          .filter(Boolean) as string[];
      }
      if (participantIds.length === 0) {
        participantIds = familyMembers.map((m) => m.id);
      }
    }
    setEditParticipantIds(participantIds);
  };

  const handleOpenEditFromRotation = (rot: TaskRotation) => {
    let task = tasks.find((t) => t.id === rot.taskId || t.id === rot.id);
    if (!task) {
      task = {
        id: rot.taskId || rot.id,
        title: rot.title,
        period: rot.period || 'morning',
        nextMember: rot.nextMember,
        status: 'pending',
        icon: rot.icon || 'sync',
        isRotation: true,
        frequency: rot.frequency || 'Diária',
        participantIds: rot.participantIds || (rot.queue.map((q) => q.id).filter(Boolean) as string[]),
      };
    }
    handleOpenEditRotation(task);
  };

  const handleToggleEditParticipant = (memberId: string) => {
    setEditParticipantIds((prev) =>
      prev.includes(memberId)
        ? prev.length > 1
          ? prev.filter((id) => id !== memberId)
          : prev
        : [...prev, memberId]
    );
  };

  const handleSaveEditRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !onUpdateTask) return;
    if (!editTitle.trim()) {
      setEditError('O nome da tarefa é obrigatório.');
      return;
    }
    if (editParticipantIds.length === 0) {
      setEditError('Selecione pelo menos um participante para o rodízio.');
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError(null);
      await onUpdateTask(editingTask.id, {
        title: editTitle.trim(),
        period: editPeriod,
        frequency: editFrequency,
        participantIds: editParticipantIds,
      });
      setEditingTask(null);
    } catch (err: any) {
      setEditError(err.message || 'Erro ao salvar alterações no rodízio.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.status || t.status === 'pending');

  const filteredTasks = tasks.filter((t) => {
    const isCompleted = t.status === 'completed';
    if (statusFilter === 'pending' && isCompleted) return false;
    if (statusFilter === 'completed' && !isCompleted) return false;
    if (selectedPeriod !== 'all' && t.period !== selectedPeriod) return false;
    return true;
  });

  const daysOfWeek = [
    { key: 'Seg', label: 'Seg' },
    { key: 'Ter', label: 'Ter' },
    { key: 'Qua', label: 'Qua' },
    { key: 'Qui', label: 'Qui' },
    { key: 'Sex', label: 'Sex' },
    { key: 'Sáb', label: 'Sáb' },
    { key: 'Dom', label: 'Dom' },
  ];

  const handleToggleDay = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleToggleRotationMember = (memberName: string) => {
    setSelectedRotationMembers((prev) =>
      prev.includes(memberName)
        ? prev.length > 1
          ? prev.filter((m) => m !== memberName)
          : prev // Keep at least 1 member
        : [...prev, memberName]
    );
  };

  const getFinalFrequencyString = () => {
    if (taskFrequency === 'Personalizada') {
      if (selectedDays.length > 0) {
        return `Personalizada (${selectedDays.join(', ')})`;
      }
      return customFrequencyText.trim() || 'Personalizada';
    }
    return taskFrequency;
  };

  const getFinalAdvanceNoticeString = () => {
    if (advanceNoticeOption === 'Personalizado') {
      return customAdvanceNotice.trim() ? `${customAdvanceNotice.trim()} antes` : 'Aviso personalizado';
    }
    return advanceNoticeOption;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let assignedName = 'Sem atribuição';
    let assignedAvatar: string | undefined;
    let rotationIdToUse: string | undefined;

    if (taskAssignmentType === 'member') {
      assignedName = selectedMember;
      const found = familyMembers.find((m) => m.name === selectedMember);
      if (found) assignedAvatar = found.avatar;
    } else {
      // Rotation assignment
      if (rotationMode === 'new') {
        const titleToUse = newRotationTitle.trim() || `Rodízio: ${taskTitle.trim()}`;
        const participants = familyMembers.filter((m) =>
          selectedRotationMembers.includes(m.name)
        );

        if (participants.length === 0) {
          participants.push(familyMembers[0]);
        }

        const newRotId = `rot_${Date.now()}`;
        const newQueue = participants.map((m, idx) => ({
          name: m.name,
          avatar: m.avatar,
          isNext: idx === 0,
        }));

        const newRotation: TaskRotation = {
          id: newRotId,
          title: titleToUse,
          schedule: `${getFinalFrequencyString()} • Turno ${taskPeriod === 'morning' ? 'Manhã' : taskPeriod === 'afternoon' ? 'Tarde' : 'Noite'}`,
          nextMember: newQueue[0].name,
          nextMemberAvatar: newQueue[0].avatar,
          queue: newQueue,
          frequency: getFinalFrequencyString(),
          poolSelection: 'Participantes selecionados',
          icon: 'sync',
          period: taskPeriod,
        };

        onUpdateRotations([...rotations, newRotation]);

        rotationIdToUse = newRotId;
        assignedName = newQueue[0].name;
        assignedAvatar = newQueue[0].avatar;
      } else {
        // Existing rotation
        let foundRot = rotations.find((r) => r.id === selectedRotationId);
        if (!foundRot && rotations.length > 0) {
          foundRot = rotations[0];
        }

        if (foundRot) {
          // Check if user modified members of this existing rotation
          const participants = familyMembers.filter((m) =>
            selectedRotationMembers.includes(m.name)
          );

          if (participants.length > 0) {
            const updatedQueue = participants.map((m, idx) => {
              const prevInRot = foundRot?.queue.find((q) => q.name === m.name);
              return {
                name: m.name,
                avatar: m.avatar,
                isNext: prevInRot ? prevInRot.isNext : idx === 0,
              };
            });

            if (!updatedQueue.some((q) => q.isNext)) {
              updatedQueue[0].isNext = true;
            }

            const nextObj = updatedQueue.find((q) => q.isNext) || updatedQueue[0];

            const updatedRot: TaskRotation = {
              ...foundRot,
              nextMember: nextObj.name,
              nextMemberAvatar: nextObj.avatar,
              queue: updatedQueue,
            };

            const updatedList = rotations.map((r) => (r.id === updatedRot.id ? updatedRot : r));
            onUpdateRotations(updatedList);

            rotationIdToUse = updatedRot.id;
            assignedName = nextObj.name;
            assignedAvatar = nextObj.avatar;
          } else {
            rotationIdToUse = foundRot.id;
            assignedName = foundRot.nextMember;
            assignedAvatar = foundRot.nextMemberAvatar;
          }
        }
      }
    }

    const finalFrequency = getFinalFrequencyString();
    const finalNotice = getFinalAdvanceNoticeString();

    if (onAddTask) {
      onAddTask({
        title: taskTitle.trim(),
        nextMember: assignedName,
        nextMemberAvatar: assignedAvatar,
        isRotation: Boolean(rotationIdToUse),
        frequency: finalFrequency,
        icon: taskIcon,
        period: taskPeriod,
        advanceNotice: finalNotice !== 'Sem aviso' ? finalNotice : undefined,
      });
    }

    // Reset form
    setTaskTitle('');
    setCustomFrequencyText('');
    setSelectedDays([]);
    setAdvanceNoticeOption('Sem aviso');
    setCustomAdvanceNotice('');
    setNewRotationTitle('');
    setIsAddTaskModalOpen(false);
  };

  // When changing selected existing rotation in modal, load its members
  const handleSelectExistingRotation = (rotId: string) => {
    setSelectedRotationId(rotId);
    const rot = rotations.find((r) => r.id === rotId);
    if (rot && rot.queue) {
      setSelectedRotationMembers(rot.queue.map((q) => q.name));
    }
  };

  if (loading) {
    return <TasksSkeleton />;
  }

  return (
    <div className="p-3 sm:p-5 max-w-5xl mx-auto w-full space-y-3.5 sm:space-y-5">
      {/* Header Bar */}
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-[#16302e] tracking-tight flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-xl sm:text-2xl text-[#7b5800] shrink-0">checklist</span>
            <span>Tarefas da Casa</span>
          </h1>
        </div>

        <button
          onClick={() => {
            if (rotations.length > 0) {
              setSelectedRotationId(rotations[0].id);
              setSelectedRotationMembers(rotations[0].queue.map((q) => q.name));
            } else {
              setRotationMode('new');
            }
            setIsAddTaskModalOpen(true);
          }}
          className="px-3.5 py-2 bg-[#7b5800] hover:bg-[#5d4200] active:scale-[0.96] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          aria-label="Adicionar Nova Tarefa"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Navigation Switcher & Turno Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-1.5 rounded-xl border border-[#d9e5e3] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex items-center gap-1 bg-[#f0fcfa] p-1 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('all_tasks')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-[0.96] cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'all_tasks'
                ? 'bg-[#16302e] text-white shadow-xs'
                : 'text-[#727877] hover:text-[#16302e]'
            }`}
            aria-label="Ver todas as tarefas pendentes"
          >
            <span className="material-symbols-outlined text-sm shrink-0">task_alt</span>
            <span>Tarefas (<span className="tabular-nums">{pendingTasks.length}</span>)</span>
          </button>

          <button
            onClick={() => setActiveTab('rotations')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-[0.96] cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'rotations'
                ? 'bg-[#16302e] text-white shadow-xs'
                : 'text-[#727877] hover:text-[#16302e]'
            }`}
            aria-label="Ver rodízios de tarefas"
          >
            <span className="material-symbols-outlined text-sm shrink-0">sync</span>
            <span>Rodízios (<span className="tabular-nums">{rotations.length}</span>)</span>
          </button>
        </div>

        {activeTab === 'all_tasks' && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 shrink-0 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] text-xs font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer flex-1 sm:flex-initial tabular-nums"
              aria-label="Filtrar tarefas por status"
            >
              <option value="pending">Pendentes ({tasks.filter((t) => t.status !== 'completed').length})</option>
              <option value="completed">Concluídas ({tasks.filter((t) => t.status === 'completed').length})</option>
              <option value="all">Todas ({tasks.length})</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] text-xs font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer flex-1 sm:flex-initial"
              aria-label="Filtrar tarefas por turno"
            >
              <option value="all">Todos os Turnos</option>
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="night">Noite</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: ALL PENDING TASKS */}
      {activeTab === 'all_tasks' && (
        <div>
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#d9e5e3] text-center text-[#727877]">
              <span className="material-symbols-outlined text-3xl mb-1 text-[#98b3b0]">
                check_circle
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#16302e]">Nenhuma tarefa pendente neste turno!</p>
              <p className="text-[11px] text-[#98b3b0] mt-0.5">
                Tudo em ordem por aqui. Adicione uma nova tarefa se precisar.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => {
                  const isRotation = Boolean(task.isRotation);

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: 'spring', duration: 0.28, bounce: 0 }}
                      className="bg-white p-3.5 rounded-xl border border-[#d9e5e3] shadow-2xs hover:border-[#98b3b0] transition-colors flex flex-col justify-between gap-2.5"
                    >
                      <div>
                        {/* Top Row: Icon, Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#f0fcfa] border border-[#d0dddb] flex items-center justify-center text-[#7b5800] shrink-0">
                              <span className="material-symbols-outlined text-lg">{task.icon || 'checklist'}</span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-[#16302e] truncate leading-tight">
                                {task.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-[#727877] font-medium bg-[#f0fcfa] px-1.5 py-0.5 rounded border border-[#e4f0ee] inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[11px]">repeat</span>
                                  <span>{task.frequency || 'Diária'}</span>
                                </span>
                                {task.advanceNotice && (
                                  <span className="text-[10px] text-[#7b5800] font-bold bg-[#fff8e6] px-1.5 py-0.5 rounded border border-[#ffca5e]/50 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[11px]">notifications_active</span>
                                    <span>{task.advanceNotice}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Rotation or Period Badge */}
                          {isRotation ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#ffca5e]/30 text-[#755400] border border-[#ffca5e] shrink-0 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">sync</span>
                              <span>Rodízio</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#f0fcfa] text-[#16302e] border border-[#d0dddb] shrink-0">
                              {task.period === 'morning' ? 'Manhã' : task.period === 'afternoon' ? 'Tarde' : 'Noite'}
                            </span>
                          )}
                        </div>

                        {/* Responsável Bar */}
                        <div className="mt-2.5 bg-[#f0fcfa] px-2.5 py-1.5 rounded-lg border border-[#e4f0ee] flex items-center justify-between text-xs">
                          <span className="text-[10px] font-semibold text-[#727877]">Responsável:</span>
                          <div className="flex items-center gap-1 min-w-0">
                            {task.nextMemberAvatar && (
                              <img
                                src={task.nextMemberAvatar}
                                alt={task.nextMember}
                                className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                              />
                            )}
                            <span className="font-bold text-[11px] text-[#16302e] truncate">
                              {task.nextMember || 'Livre'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0fcfa]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.status === 'completed' ? (
                            <>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                                <span>Concluída</span>
                              </span>
                              {canRevert && (
                                <button
                                  type="button"
                                  onClick={() => setTaskToRevert(task)}
                                  className="px-2 py-0.5 text-slate-500 hover:text-[#7b5800] hover:bg-amber-50 active:scale-[0.96] text-[11px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                                  title="Reverter para Pendente"
                                  aria-label="Reverter tarefa para pendente"
                                >
                                  <span className="material-symbols-outlined text-xs">undo</span>
                                  <span>Reverter p/ Pendente</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {Boolean(
                                (currentUserId && task.nextMemberId && task.nextMemberId === currentUserId) ||
                                (effectiveUserName && task.nextMember && task.nextMember.trim().toLowerCase() === effectiveUserName.trim().toLowerCase()) ||
                                isGeneralAdmin
                              ) ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onTaskStatusChange(task.id, 'completed');
                                    if (task.isRotation && rotations.length > 0) {
                                      const matchingRot = rotations.find((r) => r.taskId === task.id || r.id === task.id) || rotations[0];
                                      onRotateNext(matchingRot.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  aria-label="Concluir Tarefa"
                                >
                                  <span className="material-symbols-outlined text-xs">check_circle</span>
                                  <span>Concluir</span>
                                </button>
                              ) : (
                                <div className="relative group inline-block">
                                  <button
                                    type="button"
                                    disabled
                                    className="px-2.5 py-1 bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-not-allowed opacity-80"
                                    aria-disabled="true"
                                    aria-label="Conclusão bloqueada"
                                  >
                                    <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
                                    <span>Concluir</span>
                                  </button>
                                  <div className="hidden group-hover:block absolute bottom-full left-0 mb-1.5 z-30 px-2 py-1 bg-[#16302e] text-white text-[10px] font-medium rounded-md shadow-md whitespace-nowrap pointer-events-none">
                                    Aguardando confirmação de {task.nextMember || 'outro morador'}
                                  </div>
                                </div>
                              )}

                              {isRotation && rotations.length > 0 && Boolean(
                                (currentUserId && task.nextMemberId && task.nextMemberId === currentUserId) ||
                                (effectiveUserName && task.nextMember && task.nextMember.trim().toLowerCase() === effectiveUserName.trim().toLowerCase())
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchingRot = rotations.find((r) => r.taskId === task.id || r.id === task.id) || rotations[0];
                                    onRotateNext(matchingRot.id);
                                    onTaskStatusChange(task.id, 'skipped');
                                  }}
                                  className="px-2 py-1 bg-white border border-[#c1c8c6] text-[#7b5800] hover:bg-amber-50 active:scale-[0.96] text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Pular vez para a próxima pessoa da fila"
                                  aria-label="Pular vez na fila do rodízio"
                                >
                                  <span className="material-symbols-outlined text-xs">skip_next</span>
                                  <span>Pular</span>
                                </button>
                              )}
                              {isRotation && canRevert && onUpdateTask && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRotation(task)}
                                  className="px-2 py-1 bg-white border border-[#c1c8c6] text-[#16302e] hover:bg-[#f0fcfa] hover:border-[#7b5800] active:scale-[0.96] text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Editar participantes e escala do rodízio"
                                  aria-label={`Editar participantes e escala do rodízio da tarefa ${task.title}`}
                                >
                                  <span className="material-symbols-outlined text-xs text-[#7b5800]">edit</span>
                                  <span>Editar Rodízio</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {onDeleteTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-[#727877] hover:text-rose-600 hover:bg-rose-50 active:scale-[0.96] transition-all cursor-pointer"
                            title="Excluir tarefa"
                            aria-label="Excluir tarefa"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: ROTATIONS LIST */}
      {activeTab === 'rotations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rotations.map((rot) => {
            const nextUser = rot.queue.find((q) => q.isNext);
            const isMyTurn = Boolean(
              (currentUserId && nextUser?.id && nextUser.id === currentUserId) ||
              (effectiveUserName && nextUser?.name && nextUser.name.trim().toLowerCase() === effectiveUserName.trim().toLowerCase()) ||
              (effectiveUserName && rot.nextMember && rot.nextMember.trim().toLowerCase() === effectiveUserName.trim().toLowerCase())
            );

            return (
              <div
                key={rot.id}
                className="bg-white p-3.5 rounded-xl border border-[#d9e5e3] shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#f0fcfa] border border-[#d0dddb] flex items-center justify-center text-[#7b5800] shrink-0">
                        <span className="material-symbols-outlined text-lg">{rot.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-[#16302e] truncate">{rot.title}</h3>
                        <p className="text-[10px] text-[#727877] mt-0.5">{rot.schedule}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {canRevert && onUpdateTask && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditFromRotation(rot)}
                          className="px-2.5 py-1 bg-white border border-[#c1c8c6] hover:bg-[#f0fcfa] hover:border-[#7b5800] text-[#16302e] active:scale-[0.96] rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Editar participantes e escala deste rodízio"
                          aria-label={`Editar participantes e escala do rodízio ${rot.title}`}
                        >
                          <span className="material-symbols-outlined text-xs text-[#7b5800]">edit</span>
                          <span>Editar</span>
                        </button>
                      )}
                      {isMyTurn ? (
                        <button
                          type="button"
                          onClick={() => onRotateNext(rot.id)}
                          className="px-2.5 py-1 bg-[#7b5800] hover:bg-[#5d4200] active:scale-[0.96] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          aria-label={`Girar rodízio de ${rot.title}`}
                        >
                          <span className="material-symbols-outlined text-xs">sync</span>
                          <span>Girar</span>
                        </button>
                      ) : (
                        <div className="relative group inline-block shrink-0">
                          <button
                            type="button"
                            disabled
                            className="px-2.5 py-1 bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-not-allowed opacity-80"
                            aria-disabled="true"
                            aria-label={`Giro de rodízio bloqueado: aguardando a vez de ${rot.nextMember || 'outro morador'}`}
                          >
                            <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
                            <span>Girar</span>
                          </button>
                          <div className="hidden group-hover:block absolute bottom-full right-0 mb-1.5 z-30 px-2 py-1 bg-[#16302e] text-white text-[10px] font-medium rounded-md shadow-md whitespace-nowrap pointer-events-none">
                            Aguardando a vez de {rot.nextMember || 'outro morador'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Queue Display */}
                  <div className="mt-2.5 bg-[#f0fcfa] p-2 rounded-lg border border-[#e4f0ee] space-y-1">
                    <span className="text-[9px] font-bold text-[#727877] uppercase tracking-wider block">
                      Ordem do Rodízio (<span className="tabular-nums">{rot.queue.length}</span> membros):
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                      {rot.queue.map((q, idx) => {
                        const memberObj = familyMembers.find((m) => m.id === q.id || m.name === q.name);
                        const isOnVacation = Boolean(q.vacation_mode || memberObj?.vacation_mode || memberObj?.statusTag === 'Férias');
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold shrink-0 border ${
                              q.isNext
                                ? 'bg-[#16302e] text-white border-[#16302e] shadow-2xs'
                                : isOnVacation
                                ? 'bg-amber-50/80 text-amber-900 border-amber-300 opacity-80'
                                : 'bg-white text-[#727877] border-[#c1c8c6]'
                            }`}
                          >
                            <img
                              src={q.avatar}
                              alt={q.name}
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                            <span>{q.name}</span>
                            {isOnVacation && (
                              <span
                                className="text-[9px] font-semibold text-amber-800 bg-amber-100 px-1 rounded ml-0.5"
                                title="Membro em férias (pulado automaticamente na escala ativa)"
                              >
                                🏖️ Férias
                              </span>
                            )}
                            {q.isNext && <span className="text-[9px]">⭐</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {isAddTaskModalOpen && (
        <div
          onClick={() => setIsAddTaskModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl border border-[#d9e5e3] space-y-4 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-3">
              <h3 className="text-base font-bold text-[#16302e]">Nova Tarefa</h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-[#727877] hover:text-[#16302e] p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Nome da Tarefa
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="ex: Lavar a louça do jantar"
                  className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
                />
              </div>

              {/* Assignment Choice */}
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Quem vai fazer?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setTaskAssignmentType('member')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      taskAssignmentType === 'member'
                        ? 'bg-[#16302e] text-white border-[#16302e]'
                        : 'bg-white text-[#727877] border-[#c1c8c6]'
                    }`}
                  >
                    Pessoa Específica
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskAssignmentType('rotation')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      taskAssignmentType === 'rotation'
                        ? 'bg-[#16302e] text-white border-[#16302e]'
                        : 'bg-white text-[#727877] border-[#c1c8c6]'
                    }`}
                  >
                    Seguir um Rodízio
                  </button>
                </div>

                {taskAssignmentType === 'member' ? (
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#16302e]"
                  >
                    <option value="Qualquer pessoa">Qualquer pessoa (Livre)</option>
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2.5 bg-[#f0fcfa] p-3 rounded-xl border border-[#d0dddb]">
                    {/* Rotation Sub-mode: Existing vs New */}
                    <div className="flex items-center justify-between text-xs font-bold text-[#16302e] border-b border-[#d0dddb] pb-2">
                      <span>Modo de Rodízio:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setRotationMode('existing')}
                          className={`px-2 py-1 rounded-md text-[11px] ${
                            rotationMode === 'existing'
                              ? 'bg-[#7b5800] text-white'
                              : 'bg-white text-[#727877] border'
                          }`}
                        >
                          Usar Existente
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotationMode('new')}
                          className={`px-2 py-1 rounded-md text-[11px] ${
                            rotationMode === 'new'
                              ? 'bg-[#7b5800] text-white'
                              : 'bg-white text-[#727877] border'
                          }`}
                        >
                          Novo Rodízio
                        </button>
                      </div>
                    </div>

                    {rotationMode === 'existing' && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#16302e] mb-1">
                          Selecione o Rodízio
                        </label>
                        <select
                          value={selectedRotationId}
                          onChange={(e) => handleSelectExistingRotation(e.target.value)}
                          className="w-full p-2 bg-white border border-[#c1c8c6] rounded-lg text-xs font-bold text-[#16302e]"
                        >
                          {rotations.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title} ({r.queue.length} pessoas)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {rotationMode === 'new' && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#16302e] mb-1">
                          Nome do Novo Rodízio
                        </label>
                        <input
                          type="text"
                          value={newRotationTitle}
                          onChange={(e) => setNewRotationTitle(e.target.value)}
                          placeholder="ex: Escala de Limpeza da Cozinha"
                          className="w-full p-2 bg-white border border-[#c1c8c6] rounded-lg text-xs"
                        />
                      </div>
                    )}

                    {/* Checkboxes to select who participates in the rotation */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-[#16302e] mb-1.5 flex items-center justify-between">
                        <span>Membros Participantes do Rodízio:</span>
                        <span className="text-[10px] text-[#727877] font-normal">
                          ({selectedRotationMembers.length} selecionados)
                        </span>
                      </label>

                      <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-lg border border-[#c1c8c6]">
                        {familyMembers.map((member) => {
                          const isSelected = selectedRotationMembers.includes(member.name);
                          return (
                            <label
                              key={member.id}
                              className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                                isSelected ? 'bg-[#f0fcfa] text-[#16302e]' : 'text-[#727877] opacity-70'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRotationMember(member.name)}
                                className="accent-[#7b5800] rounded w-3.5 h-3.5 cursor-pointer"
                              />
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-4 h-4 rounded-full object-cover shrink-0"
                              />
                              <span className="truncate">{member.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Frequency Section */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#16302e] mb-1">
                      Frequência
                    </label>
                    <select
                      value={taskFrequency}
                      onChange={(e) => setTaskFrequency(e.target.value)}
                      className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#16302e]"
                    >
                      <option value="Diária">Diária</option>
                      <option value="Dias Úteis (Seg-Sex)">Dias Úteis (Seg-Sex)</option>
                      <option value="Fim de Semana (Sáb-Dom)">Fim de Semana (Sáb-Dom)</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Única">Única</option>
                      <option value="Personalizada">Personalizada...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#16302e] mb-1">
                      Turno
                    </label>
                    <select
                      value={taskPeriod}
                      onChange={(e) => setTaskPeriod(e.target.value as any)}
                      className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#16302e]"
                    >
                      <option value="morning">Manhã</option>
                      <option value="afternoon">Tarde</option>
                      <option value="night">Noite</option>
                    </select>
                  </div>
                </div>

                {/* Custom Frequency Sub-fields */}
                {taskFrequency === 'Personalizada' && (
                  <div className="bg-[#f0fcfa] p-2.5 rounded-xl border border-[#d0dddb] space-y-2 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-[#16302e] mb-1">
                        Descrição ou Intervalo Personalizado
                      </label>
                      <input
                        type="text"
                        value={customFrequencyText}
                        onChange={(e) => setCustomFrequencyText(e.target.value)}
                        placeholder="ex: A cada 3 dias, De 2 em 2 semanas..."
                        className="w-full p-2 bg-white border border-[#c1c8c6] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#16302e] mb-1">
                        Ou selecione os dias da semana:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {daysOfWeek.map((d) => {
                          const active = selectedDays.includes(d.key);
                          return (
                            <button
                              type="button"
                              key={d.key}
                              onClick={() => handleToggleDay(d.key)}
                              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                active
                                  ? 'bg-[#16302e] text-white shadow-2xs'
                                  : 'bg-white text-[#727877] border border-[#c1c8c6]'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tempo de Aviso / Lembrete Section */}
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#7b5800]">notifications_active</span>
                  <span>Aviso Prévio / Lembrete</span>
                </label>
                <select
                  value={advanceNoticeOption}
                  onChange={(e) => setAdvanceNoticeOption(e.target.value)}
                  className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#16302e]"
                >
                  <option value="Sem aviso">Sem aviso (No horário)</option>
                  <option value="5 minutos antes">5 minutos antes</option>
                  <option value="15 minutos antes">15 minutos antes</option>
                  <option value="30 minutos antes">30 minutos antes</option>
                  <option value="1 hora antes">1 hora antes</option>
                  <option value="2 horas antes">2 horas antes</option>
                  <option value="1 dia antes">1 dia antes</option>
                  <option value="Personalizado">Personalizado...</option>
                </select>

                {advanceNoticeOption === 'Personalizado' && (
                  <div className="mt-2 bg-[#f0fcfa] p-2 rounded-xl border border-[#d0dddb]">
                    <input
                      type="text"
                      value={customAdvanceNotice}
                      onChange={(e) => setCustomAdvanceNotice(e.target.value)}
                      placeholder="ex: 45 minutos, 3 horas"
                      className="w-full p-2 bg-white border border-[#c1c8c6] rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#e4f0ee]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3.5 py-2 border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#727877]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7b5800] text-white rounded-xl text-xs font-bold hover:bg-[#5d4200]"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROTATION MODAL */}
      {editingTask && (
        <div
          onClick={() => !isSavingEdit && setEditingTask(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-xl border border-[#d9e5e3] space-y-4 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-[#e4f0ee] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#16302e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#7b5800] text-lg">edit</span>
                  <span>Editar Escala de Rodízio</span>
                </h3>
                <p className="text-[11px] text-[#727877] mt-0.5">
                  Adicione ou remova moradores sem quebrar a vez atual. Membros de férias são pulados automaticamente.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={() => setEditingTask(null)}
                className="text-[#727877] hover:text-[#16302e] p-1 disabled:opacity-50 cursor-pointer"
                aria-label="Fechar modal de edição de rodízio"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-sm">error</span>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditRotation} className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Nome da Tarefa
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
                />
              </div>

              {/* Shift & Frequency Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#16302e] mb-1">
                    Turno
                  </label>
                  <select
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value as any)}
                    className="w-full p-2 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800] cursor-pointer"
                  >
                    <option value="morning">Manhã</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16302e] mb-1">
                    Frequência
                  </label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    className="w-full p-2 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800] cursor-pointer"
                  >
                    <option value="Diária">Diária</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Única (Um só dia)">Única (Um só dia)</option>
                  </select>
                </div>
              </div>

              {/* Members Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#16302e]">
                    Moradores na Escala ({editParticipantIds.length} selecionados)
                  </label>
                  <span className="text-[10px] text-[#727877]">
                    Mínimo: 1 morador
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-[#e4f0ee] p-2 rounded-xl bg-[#fcfdfd]">
                  {familyMembers.map((member) => {
                    const isSelected = editParticipantIds.includes(member.id);
                    const isOnVacation = Boolean(member.vacation_mode || member.statusTag === 'Férias');

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleEditParticipant(member.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#f0fcfa] border-[#7b5800]/40'
                            : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div click
                            className="rounded border-[#c1c8c6] text-[#7b5800] focus:ring-[#7b5800] cursor-pointer"
                          />
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#16302e] block truncate">
                              {member.name}
                            </span>
                            <span className="text-[10px] text-[#727877] block truncate">
                              {member.role}
                            </span>
                          </div>
                        </div>

                        {isOnVacation && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0 flex items-center gap-1"
                            title="Em modo férias — será pulado automaticamente na rotação ativa"
                          >
                            <span>🏖️</span>
                            <span>Férias (fora da escala ativa)</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Scale Preview */}
              {(() => {
                const selectedMembers = familyMembers.filter((m) =>
                  editParticipantIds.includes(m.id)
                );
                const sorted = [...selectedMembers].sort((a, b) =>
                  a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
                );
                const currentAssigneeName = editingTask.nextMember;
                const currentAssignee = sorted.find(
                  (m) =>
                    m.name.trim().toLowerCase() === currentAssigneeName?.trim().toLowerCase() ||
                    (editingTask.nextMemberId && m.id === editingTask.nextMemberId)
                );

                let baseIdx = 0;
                if (currentAssignee) {
                  baseIdx = sorted.findIndex((m) => m.id === currentAssignee.id);
                }

                let nextIdx = baseIdx;
                for (let i = 0; i < sorted.length; i++) {
                  const cand = sorted[(baseIdx + i) % sorted.length];
                  const candVacation = Boolean(cand.vacation_mode || cand.statusTag === 'Férias');
                  if (!candVacation) {
                    nextIdx = (baseIdx + i) % sorted.length;
                    break;
                  }
                }

                const nextMember = sorted[nextIdx];
                const isPreserved = Boolean(currentAssignee && nextMember && currentAssignee.id === nextMember.id);

                return (
                  <div className="p-3 bg-[#f0fcfa] rounded-xl border border-[#d0dddb] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#16302e] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#7b5800]">visibility</span>
                        <span>Prévia da Ordem Preservada:</span>
                      </span>
                      {nextMember && (
                        <span className="text-[10px] font-semibold text-[#7b5800] bg-[#fff8e6] px-1.5 py-0.5 rounded border border-[#ffca5e]/50">
                          ⭐ Vez de: <strong>{nextMember.name}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {sorted.map((m, idx) => {
                        const isNextTurn = idx === nextIdx;
                        const isVacation = Boolean(m.vacation_mode || m.statusTag === 'Férias');

                        return (
                          <div
                            key={m.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 border ${
                              isNextTurn
                                ? 'bg-[#16302e] text-white border-[#16302e] shadow-xs'
                                : isVacation
                                ? 'bg-amber-50 text-amber-900 border-amber-200 opacity-75'
                                : 'bg-white text-[#727877] border-[#d9e5e3]'
                            }`}
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span>{m.name}</span>
                            {isVacation && <span className="text-[9px]">🏖️</span>}
                            {isNextTurn && <span className="text-[9px]">⭐</span>}
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-[#727877] italic">
                      {isPreserved
                        ? `✓ Vez preservada: ${nextMember?.name} continua como responsável atual.`
                        : currentAssignee
                        ? `Aviso: O morador atual (${currentAssignee.name}) está de férias, então a vez passa para ${nextMember?.name || 'o próximo ativo'}.`
                        : `O morador anterior foi removido. A vez agora passa suavemente para ${nextMember?.name || 'o próximo na ordem'}.`}
                    </p>
                  </div>
                );
              })()}

              {/* Submit & Cancel */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#e4f0ee]">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-2 border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#727877] hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-[#7b5800] text-white rounded-xl text-xs font-bold hover:bg-[#5d4200] active:scale-[0.97] transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Salvar Escala</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Reversão de Tarefa */}
      <ConfirmActionModal
        isOpen={Boolean(taskToRevert)}
        onClose={() => setTaskToRevert(null)}
        onConfirm={() => {
          if (taskToRevert) {
            onTaskStatusChange(taskToRevert.id, 'pending');
            setTaskToRevert(null);
          }
        }}
        title="Reverter Tarefa para Pendente"
        description={`Deseja realmente reverter a tarefa "${taskToRevert?.title}"? Ela retornará para a lista de tarefas pendentes.`}
        confirmText="Reverter Tarefa"
        cancelText="Cancelar"
        variant="warning"
        icon="undo"
      />
    </div>
  );
};
