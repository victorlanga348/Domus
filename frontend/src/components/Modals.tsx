import React, { useState } from 'react';
import { FamilyMember, HouseRule, ActivityLog, HouseTask } from '../types';
import { useBodyScrollLock } from '../shared/hooks/index.js';


/* --- Add House Rule Modal --- */
export const AddHouseRuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: Omit<HouseRule, 'id' | 'number'>) => void;
}> = ({ isOpen, onClose, onAddRule }) => {
  useBodyScrollLock(isOpen);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAddRule({ title, description });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">gavel</span>
            <h3 className="text-xl font-bold">Adicionar Regra da Casa</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Título da Regra
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Silêncio após às 22h, Sapatos na sapateira"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Descrição / Detalhes
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito da regra e como os moradores devem cumpri-la."
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-extrabold uppercase hover:bg-[#5d4200]"
            >
              Salvar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Leadership Transfer Confirmation Modal --- */
export const LeadershipTransferModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetMemberName: string;
}> = ({ isOpen, onClose, onConfirm, targetMemberName }) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#16302e] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#ffca5e] relative overflow-hidden"
      >
        {/* Background ambient badge */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#ffca5e]/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center font-black shadow-xs">
            <span className="material-symbols-outlined text-2xl font-black">workspace_premium</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Transferência de Liderança</h3>
            <span className="text-[11px] font-bold text-[#ffca5e] uppercase tracking-wider">
              Apenas 1 Admin Geral
            </span>
          </div>
        </div>

        <div className="bg-[#214340] border border-[#2d5753] p-4 rounded-2xl space-y-2 mb-6">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Existe estritamente <strong>1 Admin Geral</strong> por residência.
          </p>
          <p className="text-xs text-[#ffca5e] font-medium leading-relaxed">
            Ao nomear <strong>{targetMemberName}</strong> como novo Admin Geral, você deixará de ser o Admin Geral e passará a ser um <strong>Administrador Normal (Admin)</strong>.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#2d4644] hover:bg-[#3d5c5a] text-white rounded-xl text-xs font-bold transition-all border border-[#486b68]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-[#ffca5e] hover:bg-[#e0b04a] active:scale-98 text-[#755400] rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">verified</span>
            <span>Confirmar Transferência</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Add Family Member Modal --- */
export const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  currentUserRole?: FamilyMember['role'];
  onInitiateTransferGeneralAdmin?: (pendingMember: Omit<FamilyMember, 'id'>) => void;
}> = ({ isOpen, onClose, onAddMember, currentUserRole = 'Admin Geral', onInitiateTransferGeneralAdmin }) => {
  useBodyScrollLock(isOpen);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('Resident');

  if (!isOpen) return null;

  const isGeneralAdmin = currentUserRole === 'Admin Geral';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    ];

    const newMemberData: Omit<FamilyMember, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      role: role,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      balanceOwed: 0,
    };

    if (role === 'Admin Geral' && isGeneralAdmin && onInitiateTransferGeneralAdmin) {
      onInitiateTransferGeneralAdmin(newMemberData);
      onClose();
      return;
    }

    onAddMember(newMemberData);
    setName('');
    setEmail('');
    setRole('Resident');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">person_add</span>
            <h3 className="text-lg font-black text-[#16302e]">Convidar Novo Membro</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Carlos Silva"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-medium text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@exemplo.com"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-medium text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Categoria / Cargo de Acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FamilyMember['role'])}
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-bold text-[#131e1d] bg-white focus:border-[#7b5800]"
            >
              <option value="Resident">Morador (Residente Padrão)</option>
              <option value="Resident (Restricted)">Morador com Restrição</option>
              <option value="Guest Access">Convidado Temporário</option>
              {isGeneralAdmin && (
                <>
                  <option value="Admin">Admin (Administrador Normal)</option>
                  <option value="Admin Geral">Admin Geral (Transferir Liderança)</option>
                </>
              )}
            </select>
            {!isGeneralAdmin && (
              <p className="text-[11px] text-[#727877] mt-1">
                * Apenas o Admin Geral tem permissão para cadastrar ou promover Administradores.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-bold hover:bg-[#5d4200] transition-all shadow-xs"
            >
              Adicionar Membro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Notifications Drawer --- */
function getLogTimestamp(log: ActivityLog): number {
  if (typeof log.timestamp === 'number' && !isNaN(log.timestamp) && log.timestamp > 0) {
    return log.timestamp;
  }
  if (log.created_at) {
    const t = new Date(log.created_at).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (log.id && log.id.startsWith('log_')) {
    const parts = log.id.split('_');
    const t = Number(parts[1]);
    if (!isNaN(t) && t > 1600000000000) return t;
  }
  return Date.now();
}

export const NotificationsDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activityLogs: ActivityLog[];
  tasks?: HouseTask[];
  onTaskStatusChange?: (taskId: string, newStatus: HouseTask['status']) => void;
  readNotificationIds?: string[];
  notificationsClearedAt?: number;
  onClearReadNotifications?: () => void;
  onMarkAllAsRead?: () => void;
  onNavigateToReports?: () => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;
}> = ({
  isOpen,
  onClose,
  activityLogs,
  tasks = [],
  onTaskStatusChange,
  readNotificationIds = [],
  notificationsClearedAt = 0,
  onClearReadNotifications,
  onMarkAllAsRead,
  onNavigateToReports,
  currentUserId,
  currentUserName,
  currentUserRole,
}) => {
  useBodyScrollLock(isOpen);

  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  if (!isOpen) return null;

  const TTL_48H_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();
  const readSet = new Set(readNotificationIds);

  // Pending tasks that are upcoming or have advance notice set
  const alertTasks = tasks.filter((t) => t.status === 'pending');

  // Filtro Híbrido TTL 48h com Preservação de Histórico:
  // - Não lidas: permanecem visíveis até leitura do morador.
  // - Lidas: saem automaticamente após 48h de sua criação ou se limpas manualmente pelo botão.
  const drawerNotifications = activityLogs.filter((log) => {
    const isRead = readSet.has(log.id);
    if (!isRead) return true; // Não lidas nunca são descartadas por tempo

    const logTime = getLogTimestamp(log);
    const isExpiredTTL = now - logTime > TTL_48H_MS;
    if (isExpiredTTL) return false;

    if (notificationsClearedAt && logTime <= notificationsClearedAt) {
      return false;
    }

    return true;
  });

  const unreadCountInDrawer = drawerNotifications.filter((l) => !readSet.has(l.id)).length;
  const readCountInDrawer = drawerNotifications.filter((l) => readSet.has(l.id)).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end h-[100dvh] max-h-[100dvh] overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm h-full h-[100dvh] max-h-[100dvh] px-5 shadow-2xl flex flex-col justify-between border-l border-[#d9e5e3] overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#e4f0ee]">
            <div className="flex items-center gap-2 text-[#16302e]">
              <span className="material-symbols-outlined text-xl text-[#7b5800]">notifications_active</span>
              <h3 className="text-base font-bold">Alertas & Notificações</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#727877] hover:text-[#16302e] p-1 cursor-pointer"
              aria-label="Fechar painel de notificações"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#f0fcfa] p-1 rounded-xl border border-[#d0dddb] mb-4">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-[#16302e] text-white shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">alarm</span>
              <span>Alertas ({alertTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-[#16302e] text-white shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Notificações ({drawerNotifications.length})</span>
            </button>
          </div>

          {/* TAB 1: ALERTAS DE HORÁRIO DE ATIVIDADES */}
          {activeTab === 'alerts' && (
            <div className="space-y-2.5 max-h-[64vh] overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-[#727877] uppercase tracking-wider mb-2">
                Atividades prestes a acontecer ou pendentes
              </p>

              {alertTasks.length === 0 ? (
                <div className="text-center py-10 text-[#727877] space-y-1 bg-[#f0fcfa] rounded-2xl p-4 border border-[#e4f0ee]">
                  <span className="material-symbols-outlined text-3xl text-[#98b3b0]">notifications_off</span>
                  <p className="text-xs font-bold text-[#16302e]">Nenhum alerta de horário no momento.</p>
                  <p className="text-[11px] text-[#98b3b0]">Todas as atividades programadas foram concluídas!</p>
                </div>
              ) : (
                alertTasks.map((task) => {
                  const isGeneralAdmin = currentUserRole === 'Admin Geral' || currentUserRole === 'ADMIN';
                  const isAssignedUser = Boolean(
                    (currentUserId && task.nextMemberId && task.nextMemberId === currentUserId) ||
                    (currentUserName && task.nextMember && task.nextMember.trim().toLowerCase() === currentUserName.trim().toLowerCase())
                  );
                  const canComplete = isAssignedUser || isGeneralAdmin;

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-[#fffcf5] border border-[#ffca5e] shadow-xs flex flex-col gap-2 hover:border-[#7b5800] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#fff8e6] border border-[#fde396] flex items-center justify-center text-[#7b5800] shrink-0">
                            <span className="material-symbols-outlined text-lg">{task.icon || 'alarm'}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#16302e] truncate">{task.title}</h4>
                            <p className="text-[10px] text-[#727877]">
                              Turno da {task.period === 'morning' ? 'Manhã' : task.period === 'afternoon' ? 'Tarde' : 'Noite'}
                            </p>
                          </div>
                        </div>

                        {task.advanceNotice ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#7b5800] text-white shrink-0 flex items-center gap-1 shadow-2xs">
                            <span className="material-symbols-outlined text-[11px]">timer</span>
                            <span>{task.advanceNotice}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f0fcfa] text-[#16302e] border border-[#d0dddb] shrink-0">
                            Prestes a vencer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#f7e6bc] text-[11px]">
                        <div className="flex items-center gap-1 min-w-0">
                          {task.nextMemberAvatar && (
                            <img
                              src={task.nextMemberAvatar}
                              alt={task.nextMember}
                              className="w-4 h-4 rounded-full object-cover shrink-0"
                            />
                          )}
                          <span className="font-bold text-[#16302e] truncate">
                            Responsável: {task.nextMember || 'Todos'}
                          </span>
                        </div>

                        {onTaskStatusChange && (
                          canComplete ? (
                            <button
                              type="button"
                              onClick={() => onTaskStatusChange(task.id, 'completed')}
                              className="px-2.5 py-1 bg-[#16302e] hover:bg-[#2d4644] active:scale-95 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all shadow-2xs shrink-0 cursor-pointer"
                              aria-label="Concluir Tarefa"
                            >
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              <span>Concluir</span>
                            </button>
                          ) : (
                            <div className="relative group inline-block shrink-0">
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
                              <div className="hidden group-hover:block absolute bottom-full right-0 mb-1.5 z-30 px-2 py-1 bg-[#16302e] text-white text-[10px] font-medium rounded-md shadow-md whitespace-nowrap pointer-events-none">
                                Aguardando confirmação de {task.nextMember || 'outro morador'}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICAÇÕES DE EVENTOS / O QUE ACONTECEU */}
          {activeTab === 'notifications' && (
            <div className="space-y-2.5 max-h-[64vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <p className="text-[11px] font-bold text-[#727877] uppercase tracking-wider">
                  Atividades Recentes (48h)
                </p>
                <div className="flex items-center gap-1">
                  {unreadCountInDrawer > 0 && onMarkAllAsRead && (
                    <button
                      type="button"
                      onClick={onMarkAllAsRead}
                      className="text-[10px] font-bold text-[#7b5800] hover:text-[#5d4200] hover:bg-[#fff8e6] px-2 py-0.5 rounded-md border border-[#ffca5e]/60 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Marcar todas como lidas"
                    >
                      <span className="material-symbols-outlined text-xs">done_all</span>
                      <span>Marcar lidas</span>
                    </button>
                  )}
                  {readCountInDrawer > 0 && onClearReadNotifications && (
                    <button
                      type="button"
                      onClick={onClearReadNotifications}
                      className="text-[10px] font-bold text-[#727877] hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md border border-[#d0dddb] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Limpar notificações lidas da gaveta"
                    >
                      <span className="material-symbols-outlined text-xs">delete_sweep</span>
                      <span>Limpar lidas</span>
                    </button>
                  )}
                </div>
              </div>

              {drawerNotifications.length === 0 ? (
                <div className="text-center py-8 text-[#727877] space-y-2 bg-[#f0fcfa] rounded-2xl p-4 border border-[#e4f0ee]">
                  <span className="material-symbols-outlined text-3xl text-[#98b3b0]">check_circle</span>
                  <p className="text-xs font-bold text-[#16302e]">Nenhuma novidade recente (48h).</p>
                  <p className="text-[11px] text-[#727877]">
                    Todas as notificações anteriores estão preservadas no histórico de auditoria.
                  </p>
                  {onNavigateToReports && (
                    <button
                      type="button"
                      onClick={onNavigateToReports}
                      className="mt-1 px-3 py-1.5 bg-white border border-[#d0dddb] hover:border-[#16302e] text-[#16302e] rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-[#7b5800]">description</span>
                      <span>Acessar Relatórios</span>
                    </button>
                  )}
                </div>
              ) : (
                drawerNotifications.map((log) => {
                  const isUnread = !readSet.has(log.id);
                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-2xl border flex items-start justify-between gap-2 shadow-2xs transition-all ${
                        isUnread
                          ? 'bg-[#fffdf7] border-[#ffca5e] hover:border-[#7b5800]'
                          : 'bg-[#f0fcfa] border-[#d0dddb] hover:border-[#16302e]'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                            isUnread
                              ? 'bg-[#fff8e6] border-[#ffca5e] text-[#7b5800]'
                              : 'bg-white border-[#d0dddb] text-[#16302e]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {log.title.includes('concluída') || log.title.includes('Concluir')
                              ? 'task_alt'
                              : log.title.includes('excluída')
                              ? 'delete'
                              : 'notifications'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-[#16302e] leading-snug truncate">{log.title}</p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffca5e] shrink-0" title="Não lida" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#727877] mt-0.5 font-medium">
                            {log.timeAgo} • Por: {log.author || 'Sistema'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Discreet Footer with link to Reports & Close Button */}
        <div className="space-y-3 pt-3 border-t border-[#e4f0ee]">
          <button
            type="button"
            onClick={onNavigateToReports || onClose}
            className="w-full text-[11px] text-[#727877] hover:text-[#16302e] hover:underline flex items-center justify-center gap-1 py-1 cursor-pointer transition-colors"
            title="Ver histórico completo de atividades na aba Relatórios"
          >
            <span className="material-symbols-outlined text-sm text-[#7b5800]">history_toggle_off</span>
            <span>Exibindo atividades de 48h • <strong>Histórico em Relatórios</strong></span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#16302e] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#2d4644] active:scale-[0.98] transition-all cursor-pointer"
          >
            Fechar Notificações
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Family Members Drawer / Modal --- */
export const FamilyMembersDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  memberStatuses: { id: string; name: string; avatar: string; location: string; icon: string }[];
  familyMembers: FamilyMember[];
  onUpdateMemberStatus?: (memberId: string, newLocation: string, newIcon?: string) => void;
  onOpenAddMemberModal?: () => void;
  currentUserRole?: FamilyMember['role'];
  currentUserId?: string;
}> = ({
  isOpen,
  onClose,
  memberStatuses,
  familyMembers,
  onUpdateMemberStatus,
  onOpenAddMemberModal,
  currentUserRole = 'Admin Geral',
  currentUserId,
}) => {
  useBodyScrollLock(isOpen);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');

  if (!isOpen) return null;

  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const canAddMember = isGeneralAdmin || isAdmin;

  const handleStartEdit = (member: { id: string; location: string; icon: string }) => {
    setEditingMemberId(member.id);
    setLocationInput(member.location);
    setSelectedIcon(member.icon);
  };

  const handleSaveStatus = (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    onUpdateMemberStatus?.(memberId, locationInput.trim(), selectedIcon);
    setEditingMemberId(null);
  };

  const commonIcons = [
    { icon: 'home', label: 'Em Casa' },
    { icon: 'laptop', label: 'Home Office' },
    { icon: 'work', label: 'Trabalho' },
    { icon: 'fitness_center', label: 'Academia' },
    { icon: 'flight', label: 'Viagem' },
    { icon: 'directions_car', label: 'Trânsito' },
    { icon: 'shopping_bag', label: 'Compras' },
    { icon: 'local_cafe', label: 'Café / Pausa' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end h-[100dvh] max-h-[100dvh] overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full h-[100dvh] max-h-[100dvh] px-6 shadow-2xl flex flex-col justify-between border-l border-[#d9e5e3] overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e4f0ee]">
            <div className="flex items-center gap-2.5 text-[#16302e]">
              <div className="w-10 h-10 rounded-2xl bg-[#e4f0ee] flex items-center justify-center text-[#7b5800]">
                <span className="material-symbols-outlined text-2xl font-bold">group</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Membros da Residência</h3>
                <p className="text-xs text-[#727877]">Status e localizações dos moradores</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#727877] hover:text-[#16302e] p-2 rounded-full hover:bg-[#e4f0ee] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Member Status List */}
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {familyMembers.map((member) => {
              const matchedStatus = memberStatuses.find(
                (s) => s.id === member.id || s.name === member.name
              );
              const isEditing = editingMemberId === member.id;
              const isTargetGeneralAdmin = member.role === 'Admin Geral';
              const isTargetAdmin = member.role === 'Admin';
              const isSelf = member.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#f0fcfa] border border-[#e4f0ee] shadow-xs flex flex-col gap-3 transition-all hover:border-[#98b3b0]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#16302e]/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-[#16302e] truncate">{member.name}</h4>
                          {isSelf && (
                            <span className="text-[9px] bg-[#16302e] text-white px-1.5 py-0.5 rounded font-black uppercase">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#7b5800] font-semibold truncate">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            {matchedStatus?.icon || 'home'}
                          </span>
                          <span className="truncate">{matchedStatus?.location || 'Em Casa'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                          isTargetGeneralAdmin
                            ? 'bg-[#ffca5e] text-[#755400] border border-[#d99b00]'
                            : isTargetAdmin
                            ? 'bg-[#16302e] text-white'
                            : 'bg-[#e4f0ee] text-[#16302e]'
                        }`}
                      >
                        {isTargetGeneralAdmin ? 'Admin Geral' : isTargetAdmin ? 'Admin' : 'Morador'}
                      </span>

                      {/* Botão de alterar status exclusivamente para o próprio usuário */}
                      {isSelf && (
                        <button
                          onClick={() =>
                            isEditing
                              ? setEditingMemberId(null)
                              : handleStartEdit({
                                  id: member.id,
                                  location: matchedStatus?.location || 'Em Casa',
                                  icon: matchedStatus?.icon || 'home',
                                })
                          }
                          className="text-[11px] text-[#7b5800] hover:text-[#5f4400] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#c1c8c6] shadow-2xs hover:border-[#7b5800] transition-all"
                        >
                          {isEditing ? 'Cancelar' : 'Meu Status'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulário Inline de Edição de Status (Apenas para o próprio morador) */}
                  {isEditing && isSelf && (
                    <form
                      onSubmit={(e) => handleSaveStatus(e, member.id)}
                      className="mt-2 pt-3 border-t border-[#d0dddb] space-y-3 bg-white p-3 rounded-xl border"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#414847] mb-1">
                          Meu Novo Status / Localização
                        </label>
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="ex: Em Home Office, Na Academia, Viajando"
                          className="w-full px-3 py-2 rounded-xl text-xs border border-[#c1c8c6] focus:outline-none focus:border-[#7b5800]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#414847] mb-1">
                          Ícone de Atividade
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {commonIcons.map((item) => (
                            <button
                              key={item.icon}
                              type="button"
                              onClick={() => setSelectedIcon(item.icon)}
                              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                                selectedIcon === item.icon
                                  ? 'bg-[#16302e] text-white border-[#16302e]'
                                  : 'bg-[#f0fcfa] text-[#16302e] border-[#c1c8c6] hover:border-[#7b5800]'
                              }`}
                              title={item.label}
                            >
                              <span className="material-symbols-outlined text-sm">{item.icon}</span>
                              <span className="text-[10px]">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#7b5800] text-white text-xs font-bold hover:bg-[#5f4400]"
                        >
                          Salvar Meu Status
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="space-y-2 pt-4 border-t border-[#e4f0ee]">
          {canAddMember && onOpenAddMemberModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAddMemberModal();
              }}
              className="w-full py-2.5 bg-[#7b5800] hover:bg-[#5f4400] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Convidar Novo Membro</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#16302e] hover:bg-[#2d4644] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Leave House Modal with Mandatory General Admin Succession --- */
export const LeaveHouseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (successorId?: string) => Promise<void> | void;
  isGeneralAdmin: boolean;
  availableSuccessors: FamilyMember[];
  houseName: string;
  loading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  isGeneralAdmin,
  availableSuccessors,
  houseName,
  loading = false,
}) => {
  useBodyScrollLock(isOpen);

  const [selectedSuccessorId, setSelectedSuccessorId] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedSuccessorId(availableSuccessors.length > 0 ? availableSuccessors[0].id : '');
    }
  }, [isOpen, availableSuccessors]);

  if (!isOpen) return null;

  const mustNominateSuccessor = isGeneralAdmin && availableSuccessors.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mustNominateSuccessor && !selectedSuccessorId) return;
    onConfirm(mustNominateSuccessor ? selectedSuccessorId : undefined);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#16302e] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-rose-500/40 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black border border-rose-500/30 shrink-0">
            <span className="material-symbols-outlined text-2xl">logout</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Sair da Residência</h3>
            <p className="text-[11px] font-medium text-[#b0ccc9] truncate max-w-[240px]">
              {houseName}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mustNominateSuccessor ? (
            <div className="space-y-3">
              <div className="bg-[#214340] border border-[#ffca5e]/30 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-[#ffca5e] text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  <span>Sucessão Obrigatória de Admin Geral</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Como <strong>Admin Geral</strong>, você não pode deixar a residência sem liderança.
                  Selecione outro morador ou subadministrador para assumir como o novo <strong>Admin Geral</strong> antes de sair:
                </p>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {availableSuccessors.map((member) => {
                  const isSelected = selectedSuccessorId === member.id;
                  const isSubadmin = member.role === 'Admin';

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedSuccessorId(member.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#2a4d49] border-[#ffca5e] shadow-xs'
                          : 'bg-[#1b3836] border-[#2d5753] hover:border-[#486b68]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{member.name}</p>
                          <p className="text-[10px] text-[#b0ccc9] truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isSubadmin
                              ? 'bg-amber-400/20 text-[#ffca5e] border border-[#ffca5e]/30'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {isSubadmin ? 'Subadmin' : 'Morador'}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#ffca5e] bg-[#ffca5e]' : 'border-white/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#16302e]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isGeneralAdmin && availableSuccessors.length === 0 ? (
            <div className="bg-[#214340] border border-rose-500/30 p-4 rounded-2xl space-y-2 text-xs leading-relaxed text-white/90">
              <p>
                Você é o <strong>único morador</strong> restante nesta residência.
              </p>
              <p className="text-rose-300 font-semibold">
                ⚠️ Ao confirmar sua saída, esta residência será excluída definitivamente do sistema para evitar registros órfãos.
              </p>
            </div>
          ) : (
            <div className="bg-[#214340] border border-rose-500/30 p-4 rounded-2xl space-y-2 text-xs leading-relaxed text-white/90">
              <p>
                Tem certeza que deseja se desvincular de <strong>{houseName}</strong>?
              </p>
              <p className="text-[#b0ccc9]">
                Você sairá da residência e retornará ao seletor de casas. Suas tarefas e histórico serão preservados.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-[#2d4644] hover:bg-[#3d5c5a] text-white rounded-xl text-xs font-bold transition-all border border-[#486b68] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (mustNominateSuccessor && !selectedSuccessorId)}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                mustNominateSuccessor
                  ? 'bg-[#ffca5e] hover:bg-[#e0b04a] text-[#755400]'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {loading ? (
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    {mustNominateSuccessor ? 'crown' : 'check'}
                  </span>
                  <span>{mustNominateSuccessor ? 'Nomear e Sair' : 'Confirmar Saída'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Unified Action Confirmation Modal --- */
export const ConfirmActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: string;
  loading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon = 'warning',
  loading = false,
}) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const defaultIcon = variant === 'danger' ? 'warning' : variant === 'warning' ? 'info' : 'check_circle';
  const displayIcon = icon || defaultIcon;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#16302e] text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#2d4644] relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              variant === 'danger'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : variant === 'warning'
                ? 'bg-amber-500/20 text-[#ffca5e] border-amber-500/30'
                : 'bg-[#ffca5e]/20 text-[#ffca5e] border-[#ffca5e]/30'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{displayIcon}</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
          </div>
        </div>

        <p className="text-xs text-[#b0ccc9] leading-relaxed mb-6">{description}</p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold text-[#b0ccc9] hover:bg-[#234441] hover:text-white transition-colors cursor-pointer border border-transparent text-center justify-center flex items-center min-h-[42px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[42px] ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : variant === 'warning'
                ? 'bg-[#ffca5e] hover:bg-[#e0b04a] text-[#755400]'
                : 'bg-white hover:bg-zinc-100 text-[#16302e]'
            }`}
          >
            {loading ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
