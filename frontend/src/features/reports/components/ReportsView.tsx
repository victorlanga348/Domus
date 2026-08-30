import React, { useState } from 'react';
import { HouseTask, FamilyMember, ActivityLog } from '../../../types';

interface ReportsViewProps {
  tasks?: HouseTask[];
  familyMembers?: FamilyMember[];
  activityLogs?: ActivityLog[];
  onTaskStatusChange?: (taskId: string, newStatus: HouseTask['status']) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tasks = [],
  familyMembers = [],
  onTaskStatusChange,
  onDeleteTask,
}) => {
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Combine tasks that are completed, skipped or cancelled
  const completedOrPastTasks = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'skipped' || t.status === 'cancelled'
  );

  // Filter Logic
  const filteredTasks = completedOrPastTasks.filter((item) => {
    if (memberFilter !== 'all' && item.nextMember !== memberFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMember = item.nextMember?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchMember) return false;
    }
    return true;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#16302e] tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#7b5800]">history</span>
            Histórico de Tarefas
          </h1>
          <p className="text-xs text-[#727877] font-medium mt-0.5">
            Registro de todas as tarefas concluídas, puladas e canceladas na casa.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#727877]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar tarefa ou pessoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c1c8c6] rounded-xl text-xs focus:outline-none focus:border-[#7b5800] shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2 sm:gap-3">
        {/* Member Filter */}
        <div className="bg-white px-3 py-2 rounded-xl border border-[#c1c8c6] shadow-2xs flex items-center gap-2 text-xs font-bold text-[#16302e] w-full md:w-auto">
          <span className="material-symbols-outlined text-sm text-[#7b5800] shrink-0">
            person
          </span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer w-full"
          >
            <option value="all">Todos os Membros</option>
            {familyMembers.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="bg-white px-3 py-2 rounded-xl border border-[#c1c8c6] shadow-2xs flex items-center gap-2 text-xs font-bold text-[#16302e] w-full md:w-auto">
          <span className="material-symbols-outlined text-sm text-[#7b5800] shrink-0">
            category
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer w-full"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="skipped">Puladas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {paginatedTasks.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#d9e5e3] text-center text-[#727877]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#98b3b0]">
              task_alt
            </span>
            <p className="text-sm font-bold text-[#16302e]">Nenhuma tarefa no histórico.</p>
            <p className="text-xs text-[#98b3b0] mt-1">
              Conclua tarefas na aba de Tarefas para ver o registro aqui.
            </p>
          </div>
        ) : (
          paginatedTasks.map((item) => {
            return (
              <div
                key={item.id}
                className={`bg-white p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.status === 'completed'
                    ? 'border-emerald-200 bg-[#f0fcfa]/60'
                    : item.status === 'skipped'
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e4f0ee] flex items-center justify-center text-[#16302e] shrink-0">
                    <span className="material-symbols-outlined text-lg sm:text-xl">{item.icon || 'checklist'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#16302e] line-through leading-snug">
                        {item.title}
                      </h3>

                      {item.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[11px]">check_circle</span>
                          <span>Concluída</span>
                        </span>
                      )}
                      {item.status === 'skipped' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[11px]">skip_next</span>
                          <span>Pulada</span>
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[11px]">block</span>
                          <span>Cancelada</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-xs text-[#727877] flex-wrap">
                      <span className="font-medium">Responsável:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#16302e]">
                        {item.nextMemberAvatar && (
                          <img
                            src={item.nextMemberAvatar}
                            alt={item.nextMember}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                        )}
                        <span>{item.nextMember || 'Sem atribuição'}</span>
                      </span>
                      <span className="text-[#c1c8c6]">•</span>
                      <span className="text-[11px] font-semibold text-[#7b5800]">
                        {item.frequency || 'Diária'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions: Reverter / Excluir */}
                <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-[#e4f0ee] pt-2 sm:pt-0">
                  {onTaskStatusChange && (
                    <button
                      type="button"
                      onClick={() => {
                        onTaskStatusChange(item.id, 'pending');
                        showToast(`Tarefa "${item.title}" revertida para pendente.`);
                      }}
                      className="px-3 py-1.5 bg-[#16302e] hover:bg-[#2d4644] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                      title="Reverter para lista de tarefas pendentes"
                    >
                      <span className="material-symbols-outlined text-sm">undo</span>
                      <span className="sm:hidden">Reverter</span>
                      <span className="hidden sm:inline">Reverter p/ Pendente</span>
                    </button>
                  )}

                  {onDeleteTask && (
                    <button
                      type="button"
                      onClick={() => onDeleteTask(item.id)}
                      className="p-1.5 rounded-xl border border-[#c1c8c6] text-[#727877] hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all bg-white"
                      title="Excluir do histórico"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-full border border-[#c1c8c6] bg-white flex items-center justify-center text-xs font-bold text-[#16302e] disabled:opacity-40 hover:bg-[#e4f0ee] transition-colors"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#16302e] text-white shadow-xs'
                    : 'bg-white border border-[#c1c8c6] text-[#16302e] hover:bg-[#e4f0ee]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-full border border-[#c1c8c6] bg-white flex items-center justify-center text-xs font-bold text-[#16302e] disabled:opacity-40 hover:bg-[#e4f0ee] transition-colors"
          >
            &gt;
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16302e] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#ffca5e] text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#ffca5e]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
