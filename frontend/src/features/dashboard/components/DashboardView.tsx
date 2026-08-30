import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, type DashboardData, type DashboardTaskItem } from '../api/dashboardApi.js';
import { tasksApi } from '../../tasks-rotation/api/tasksApi.js';
import { useHouseSocket } from '../../../shared/socket/useHouseSocket.js';
import { MuralNote, FamilyMember } from '../../../types';

interface DashboardViewProps {
  currentUserId?: string;
  currentHouseId?: string;
  subTab?: string;
  vacationMode?: boolean;
  onShowToast?: (msg: string) => void;
  muralNotes?: MuralNote[];
  onAddMuralNote?: (note: Omit<MuralNote, 'id' | 'dateStr'>) => void;
  onDeleteMuralNote?: (id: string) => void;
  familyMembers?: FamilyMember[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUserId = 'user-1',
  currentHouseId = 'house-1',
  vacationMode = false,
  onShowToast,
  muralNotes = [],
  onAddMuralNote,
  onDeleteMuralNote,
  familyMembers = [],
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activePinTask, setActivePinTask] = useState<DashboardTaskItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  const [activeBlockTask, setActiveBlockTask] = useState<DashboardTaskItem | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // New Note Modal state
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<MuralNote['color']>('amber');
  const [selectedAuthor, setSelectedAuthor] = useState('Alex Johnson');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getDashboardData(currentHouseId, currentUserId);
      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [currentHouseId, currentUserId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Sincronização em Tempo Real via WebSocket
  useHouseSocket(currentHouseId, {
    onTaskLocked: (data) => {
      onShowToast?.(`Uma tarefa foi trancada para execução em tempo real.`);
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          current_shift_tasks: prev.current_shift_tasks.map((t) =>
            t.id === data.taskId
              ? { ...t, status: 'LOCKED', locked_at: data.lockedAt, locked_by: { id: data.userId, name: 'Morador' } }
              : t
          ),
        };
      });
    },
    onTaskUnlocked: (data) => {
      onShowToast?.(`Uma tarefa foi destrancada.`);
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          current_shift_tasks: prev.current_shift_tasks.map((t) =>
            t.id === data.taskId
              ? { ...t, status: 'OPEN', locked_at: null, locked_by: null }
              : t
          ),
        };
      });
    },
    onVacationChanged: (data) => {
      onShowToast?.(`${data.name} alterou o modo férias. Rodízio recalculado.`);
      fetchDashboard();
    },
    onSwapRequested: (data) => {
      onShowToast?.(`${data.requesterName} solicitou troca de escala na tarefa "${data.taskTitle}".`);
    },
  });

  const handleLockTask = async (task: DashboardTaskItem) => {
    try {
      await tasksApi.lockTask(task.id, currentUserId, currentHouseId);
      onShowToast?.(`Tarefa "${task.title}" trancada para sua execução.`);
      fetchDashboard();
    } catch (err: any) {
      onShowToast?.(err.message || 'Erro ao trancar tarefa.');
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePinTask) return;

    try {
      setPinLoading(true);
      setPinError(null);

      await tasksApi.completeTask(activePinTask.id, currentUserId, pinInput.trim() || undefined);
      onShowToast?.(`Tarefa "${activePinTask.title}" concluída com sucesso! Rodízio avançado.`);

      setActivePinTask(null);
      setPinInput('');
      fetchDashboard();
    } catch (err: any) {
      setPinError(err.message || 'PIN incorreto.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlockTask || !blockReason.trim()) return;

    try {
      setBlockLoading(true);
      await tasksApi.blockTask(activeBlockTask.id, currentUserId, blockReason.trim());
      onShowToast?.(`Impedimento registrado na tarefa "${activeBlockTask.title}".`);

      setActiveBlockTask(null);
      setBlockReason('');
      fetchDashboard();
    } catch (err: any) {
      onShowToast?.(err.message || 'Erro ao registrar impedimento.');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() && !noteTitle.trim()) return;

    const authorMember = familyMembers.find((m) => m.name === selectedAuthor);

    onAddMuralNote?.({
      title: noteTitle.trim() || undefined,
      content: noteContent.trim(),
      color: noteColor,
      author: selectedAuthor,
      authorAvatar: authorMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isPinned: true,
    });

    setNoteTitle('');
    setNoteContent('');
    setIsAddNoteModalOpen(false);
  };

  const getNoteBgColor = (color: MuralNote['color']) => {
    switch (color) {
      case 'amber':
        return 'bg-[#fde396] text-[#543c00] border-[#eed17d]';
      case 'teal':
        return 'bg-[#c3e8e2] text-[#133834] border-[#a2d8cf]';
      case 'gray':
        return 'bg-[#e3eae8] text-[#273634] border-[#cdd8d5]';
      case 'rose':
        return 'bg-[#fcdede] text-[#591d1d] border-[#f5c6c6]';
      default:
        return 'bg-[#fde396] text-[#543c00] border-[#eed17d]';
    }
  };

  const currentShiftLabel = () => {
    const shift = dashboardData?.shift_info.current_shift || 'MORNING';
    if (shift === 'MORNING') return 'Manhã (06h - 12h)';
    if (shift === 'AFTERNOON') return 'Tarde (12h - 18h)';
    return 'Noite (18h - 06h)';
  };

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Vacation Banner */}
      {vacationMode && (
        <div className="bg-[#7b5800] text-white p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-[#ffca5e] shrink-0">flight_takeoff</span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold">Modo Férias Ativo</h3>
              <p className="text-[11px] sm:text-xs text-white/80">
                Você está temporariamente fora da escala automática do rodízio.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-black/20 text-xs font-bold text-[#ffca5e]">
            Pausado
          </span>
        </div>
      )}

      {/* Top Header Card / Overview */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-2xl">roofing</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#16302e]">
                {dashboardData?.house.name || 'Minha Residência'}
              </h1>
              <span className="text-xs font-bold text-[#7b5800] bg-[#fff8e6] px-2.5 py-0.5 rounded-full border border-[#ffca5e]">
                {dashboardData?.house.invite_code || 'CASA-DOMUS'}
              </span>
            </div>
            <p className="text-xs text-[#727877] mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#7b5800]">schedule</span>
              <span>Turno Ativo: <strong>{currentShiftLabel()}</strong></span>
            </p>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <div className="bg-[#f0fcfa] px-3.5 py-2 rounded-2xl border border-[#d0dddb] text-xs font-bold text-[#16302e] flex items-center gap-2 flex-1 md:flex-initial justify-center">
            <span className="material-symbols-outlined text-base text-[#7b5800]">pending_actions</span>
            <span>{dashboardData?.summary.pending_tasks_count ?? 0} Pendentes</span>
          </div>
          <div className="bg-[#fff8e6] px-3.5 py-2 rounded-2xl border border-[#ffca5e] text-xs font-bold text-[#7b5800] flex items-center gap-2 flex-1 md:flex-initial justify-center">
            <span className="material-symbols-outlined text-base">task_alt</span>
            <span>{dashboardData?.summary.completed_today_count ?? 0} Hoje</span>
          </div>
        </div>
      </div>

      {/* Grid de Tarefas do Turno Atual (BFF Real-time) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">wb_twilight</span>
            <h2 className="text-base font-black text-[#16302e]">Tarefas do Turno Atual</h2>
          </div>
          <span className="text-xs text-[#727877]">
            Lock em tempo real ativo
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#727877] bg-white rounded-3xl border border-[#d9e5e3]">
            <span className="material-symbols-outlined text-2xl animate-spin mb-1">sync</span>
            <p className="text-xs font-bold">Carregando tarefas do turno...</p>
          </div>
        ) : (dashboardData?.current_shift_tasks?.length ?? 0) === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-[#c1c8c6] space-y-2">
            <span className="material-symbols-outlined text-3xl text-[#98b3b0]">check_circle</span>
            <h3 className="text-sm font-bold text-[#16302e]">Tudo limpo e organizado!</h3>
            <p className="text-xs text-[#727877]">Nenhuma tarefa pendente para o turno atual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.current_shift_tasks.map((task) => {
              const isLocked = task.status === 'LOCKED';
              const isBlocked = task.status === 'BLOCKED';
              const isLockedByMe = isLocked && task.locked_by?.id === currentUserId;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                    isLocked
                      ? 'border-[#ffca5e] bg-[#fffdfa]'
                      : isBlocked
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-[#d9e5e3] hover:border-[#7b5800]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e4f0ee] text-[#16302e]">
                        {task.frequency}
                      </span>

                      {isLocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffca5e] text-[#755400] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs animate-pulse">lock</span>
                          <span>{isLockedByMe ? 'Você trancou' : `${task.locked_by?.name || 'Morador'}`}</span>
                        </span>
                      ) : isBlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">block</span>
                          <span>Bloqueada</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Aberta
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-[#16302e] line-clamp-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-[#727877] mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {/* Próximo da Vez (Motor de Rodízio A-Z) */}
                    <div className="mt-3 pt-3 border-t border-[#f0f4f3] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#727877]">Responsável da Vez:</span>
                      <span className="font-bold text-[#16302e] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#7b5800]">person</span>
                        <span>{task.current_assignee?.name || 'Livre no pool'}</span>
                      </span>
                    </div>

                    {isBlocked && task.last_block_reason && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium">
                        <strong>Motivo:</strong> {task.last_block_reason}
                      </div>
                    )}
                  </div>

                  {/* Ações da Tarefa ("Sistema de 3 Vias") */}
                  <div className="space-y-2 pt-2 border-t border-[#f0f4f3]">
                    {isLocked ? (
                      isLockedByMe ? (
                        <button
                          onClick={() => setActivePinTask(task)}
                          className="w-full py-2 bg-[#7b5800] hover:bg-[#5d4200] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Concluir com PIN</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-[#f0f4f3] text-[#727877] text-center text-xs font-bold rounded-xl">
                          Em execução por outro morador
                        </div>
                      )
                    ) : isBlocked ? (
                      <button
                        onClick={() => handleLockTask(task)}
                        className="w-full py-2 bg-[#16302e] hover:bg-[#2d4644] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                        <span>Desbloquear & Executar</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleLockTask(task)}
                          className="py-2 bg-[#7b5800] hover:bg-[#5d4200] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span>Iniciar</span>
                        </button>
                        <button
                          onClick={() => setActiveBlockTask(task)}
                          className="py-2 bg-[#f0fcfa] hover:bg-[#e0f5f2] text-[#16302e] border border-[#c1c8c6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm text-rose-600">block</span>
                          <span>Bloquear</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Container: Mural de Recados da Família */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e4f0ee] pb-3">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">push_pin</span>
            <h2 className="text-base font-black">Mural de Recados</h2>
          </div>

          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="bg-[#7b5800] hover:bg-[#5f4400] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Novo Recado</span>
          </button>
        </div>

        {/* Recados Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-h-[160px]">
          {muralNotes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-[#727877]">
              <span className="material-symbols-outlined text-3xl mb-1 text-[#98b3b0]">sticky_note_2</span>
              <p className="text-xs font-bold text-[#16302e]">Nenhum recado no mural.</p>
              <p className="text-[11px] text-[#98b3b0]">Clique em "Novo Recado" para fixar um aviso para a família.</p>
            </div>
          ) : (
            muralNotes.map((note) => {
              const bgClass = getNoteBgColor(note.color);
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl border shadow-2xs relative flex flex-col justify-between transition-all ${bgClass}`}
                >
                  <div>
                    {note.title && <h3 className="text-xs font-bold mb-1 border-b border-black/10 pb-1">{note.title}</h3>}
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{note.content}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-[10px] font-bold opacity-80">
                    <span>{note.author}</span>
                    <button
                      onClick={() => onDeleteMuralNote?.(note.id)}
                      className="p-1 hover:text-rose-700 transition-colors"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Conclusão com PIN */}
      {activePinTask && (
        <div
          onClick={() => setActivePinTask(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#d9e5e3] space-y-4 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-2">
              <div>
                <h3 className="text-sm font-black text-[#16302e]">Concluir Tarefa</h3>
                <p className="text-xs text-[#727877]">{activePinTask.title}</p>
              </div>
              <button onClick={() => setActivePinTask(null)} className="text-[#727877] p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Digite seu PIN (4-6 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-center text-lg tracking-widest font-black focus:outline-none focus:border-[#7b5800]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePinTask(null)}
                  className="flex-1 py-2.5 bg-[#f0fcfa] text-[#727877] text-xs font-bold rounded-xl border border-[#c1c8c6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pinLoading}
                  className="flex-1 py-2.5 bg-[#7b5800] hover:bg-[#5d4200] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {pinLoading ? 'Concluindo...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Registro de Impedimento */}
      {activeBlockTask && (
        <div
          onClick={() => setActiveBlockTask(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#d9e5e3] space-y-4 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-2">
              <div>
                <h3 className="text-sm font-black text-[#16302e]">Reportar Impedimento</h3>
                <p className="text-xs text-[#727877]">{activeBlockTask.title}</p>
              </div>
              <button onClick={() => setActiveBlockTask(null)} className="text-[#727877] p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Motivo do Bloqueio
                </label>
                <textarea
                  required
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="ex: Falta detergente, máquina ocupada..."
                  className="w-full p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBlockTask(null)}
                  className="flex-1 py-2.5 bg-[#f0fcfa] text-[#727877] text-xs font-bold rounded-xl border border-[#c1c8c6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={blockLoading || !blockReason.trim()}
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {blockLoading ? 'Registrando...' : 'Bloquear Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Note Modal */}
      {isAddNoteModalOpen && (
        <div
          onClick={() => setIsAddNoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-[#d9e5e3] space-y-3 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-2">
              <h3 className="text-sm font-black text-[#16302e]">Novo Recado no Mural</h3>
              <button onClick={() => setIsAddNoteModalOpen(false)} className="text-[#727877] p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">Título (Opcional)</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="ex: Lembrar do Pão"
                  className="w-full p-2.5 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">Recado</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Escreva sua mensagem..."
                  className="w-full p-2.5 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">Cor</label>
                <div className="flex gap-2">
                  {[
                    { id: 'amber', bg: 'bg-[#fde396]' },
                    { id: 'teal', bg: 'bg-[#c3e8e2]' },
                    { id: 'gray', bg: 'bg-[#e3eae8]' },
                    { id: 'rose', bg: 'bg-[#fcdede]' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNoteColor(c.id as any)}
                      className={`w-6 h-6 rounded-full ${c.bg} border ${
                        noteColor === c.id ? 'ring-2 ring-[#7b5800]' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e4f0ee]">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[#727877]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7b5800] text-white text-xs font-bold rounded-xl"
                >
                  Fixar Recado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
