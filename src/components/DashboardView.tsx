import React, { useState } from 'react';
import { HouseTask, ActivityLog, MuralNote, MemberStatus, FamilyMember } from '../types';

interface DashboardViewProps {
  subTab?: string;
  tasks: HouseTask[];
  onTaskStatusChange: (taskId: string, newStatus: HouseTask['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  activityLogs: ActivityLog[];
  onAddActivityLog: (logText: string) => void;
  onLikeActivity: (id: string) => void;
  vacationMode: boolean;
  muralNotes?: MuralNote[];
  memberStatuses?: MemberStatus[];
  onAddMuralNote?: (note: Omit<MuralNote, 'id' | 'dateStr'>) => void;
  onDeleteMuralNote?: (id: string) => void;
  onToggleNoteItem?: (noteId: string, itemId: string) => void;
  onTogglePinNote?: (noteId: string) => void;
  onUpdateMemberStatus?: (memberId: string, newLocation: string, newIcon?: string) => void;
  familyMembers?: FamilyMember[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  vacationMode,
  muralNotes = [],
  onAddMuralNote,
  onDeleteMuralNote,
  familyMembers = [],
}) => {
  // New Note Modal state
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<MuralNote['color']>('amber');
  const [selectedAuthor, setSelectedAuthor] = useState('Alex Johnson');

  const pendingTasks = tasks.filter((t) => !t.status || t.status === 'pending');

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

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Vacation Banner */}
      {vacationMode && (
        <div className="bg-[#7b5800] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-[#ffca5e] shrink-0">flight_takeoff</span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold">Modo Férias Ativo</h3>
            <p className="text-[11px] sm:text-xs text-white/80">Tarefas e notificações pausadas para a família.</p>
          </div>
        </div>
      )}

      {/* Overview Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d9e5e3] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0fcfa] border border-[#d0dddb] flex items-center justify-center text-[#7b5800] shrink-0">
            <span className="material-symbols-outlined text-2xl">home</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#16302e]">Visão Geral da Casa</h1>
            <p className="text-xs text-[#727877]">
              {pendingTasks.length === 0
                ? 'Todas as tarefas de hoje foram concluídas!'
                : `Você tem ${pendingTasks.length} tarefas pendentes hoje.`}
            </p>
          </div>
        </div>

        <div className="bg-[#f0fcfa] px-3 py-1.5 rounded-xl border border-[#d0dddb] text-xs font-bold text-[#16302e] self-start sm:self-auto">
          {pendingTasks.length} Pendentes
        </div>
      </div>

      {/* Main Container: Mural de Recados Full Width */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d9e5e3] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e4f0ee] pb-3">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">push_pin</span>
            <h2 className="text-sm sm:text-base font-bold">Mural de Recados</h2>
          </div>

          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="bg-[#7b5800] hover:bg-[#5f4400] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Novo Recado</span>
          </button>
        </div>

        {/* Recados Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-h-[220px]">
          {muralNotes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-10 text-center text-[#727877]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#98b3b0]">sticky_note_2</span>
              <p className="text-sm font-bold text-[#16302e]">Nenhum recado no mural.</p>
              <p className="text-xs text-[#98b3b0] mt-0.5">Clique em "Novo Recado" para deixar uma nota para a família.</p>
            </div>
          ) : (
            muralNotes.map((note) => {
              const bgClass = getNoteBgColor(note.color);
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border shadow-2xs relative flex flex-col justify-between transition-all ${bgClass}`}
                >
                  <div>
                    {note.title && <h3 className="text-xs font-bold mb-1.5 border-b border-black/10 pb-1">{note.title}</h3>}
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

      {/* New Note Modal */}
      {isAddNoteModalOpen && (
        <div
          onClick={() => setIsAddNoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-[#d9e5e3] space-y-3 animate-in fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-2">
              <h3 className="text-sm font-bold text-[#16302e]">Novo Recado no Mural</h3>
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
                  className="w-full p-2 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">Recado</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Escreva sua mensagem..."
                  className="w-full p-2 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa]"
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
