import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, type DashboardData } from '../api/dashboardApi.js';
import { useHouseSocket } from '../../../shared/socket/useHouseSocket.js';
import { MuralNote, FamilyMember } from '../../../types';

interface DashboardViewProps {
  currentUserId?: string;
  currentUserName?: string;
  currentHouseId?: string;
  subTab?: string;
  vacationMode?: boolean;
  onShowToast?: (msg: string) => void;
  muralNotes?: MuralNote[];
  onAddMuralNote?: (note: Omit<MuralNote, 'id' | 'dateStr'>) => void;
  onDeleteMuralNote?: (id: string) => void;
  familyMembers?: FamilyMember[];
  onSyncMembers?: (members: any[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUserId = 'user-1',
  currentUserName,
  currentHouseId = 'house-1',
  vacationMode = false,
  onShowToast,
  muralNotes = [],
  onAddMuralNote,
  onDeleteMuralNote,
  familyMembers = [],
  onSyncMembers,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Novo Recado
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<MuralNote['color']>('amber');

  const loggedMember = familyMembers.find((m) => m.id === currentUserId);
  const authorNameToUse = currentUserName || loggedMember?.name || 'Morador';

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getDashboardData(currentHouseId, currentUserId);
      if (data) {
        setDashboardData(data);
        if (data.members && data.members.length > 0) {
          onSyncMembers?.(data.members);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados da residência:', err);
    } finally {
      setLoading(false);
    }
  }, [currentHouseId, currentUserId, onSyncMembers]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Sincronização em Tempo Real via WebSocket
  useHouseSocket(currentHouseId, {
    onVacationChanged: (data) => {
      onShowToast?.(`${data.name} alterou o modo férias.`);
    },
    onMembersUpdated: () => {
      fetchDashboard();
    },
  });

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    onAddMuralNote?.({
      title: noteTitle.trim() || undefined,
      content: noteContent.trim(),
      color: noteColor,
      author: authorNameToUse,
    });

    setNoteTitle('');
    setNoteContent('');
    setIsAddNoteModalOpen(false);
  };

  const getNoteBgColor = (color: MuralNote['color']) => {
    switch (color) {
      case 'amber':
        return 'bg-[#fef3c7] border-[#fde68a] text-[#78350f]';
      case 'teal':
        return 'bg-[#ccfbf1] border-[#99f6e4] text-[#115e59]';
      case 'rose':
        return 'bg-[#ffe4e6] border-[#fecdd3] text-[#9f1239]';
      case 'lavender':
        return 'bg-[#ede9fe] border-[#ddd6fe] text-[#5b21b6]';
      case 'gray':
      default:
        return 'bg-[#f3f4f6] border-[#e5e7eb] text-[#1f2937]';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-200">
      {/* Banner de Boas-vindas da Residência */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-2xl font-black">dashboard</span>
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
              <span className="material-symbols-outlined text-sm text-[#7b5800]">group</span>
              <span>Total de Moradores: <strong>{familyMembers.length || dashboardData?.members?.length || 1}</strong></span>
            </p>
          </div>
        </div>

        {/* Ação Rápida */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="w-full md:w-auto bg-[#7b5800] hover:bg-[#5f4400] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">push_pin</span>
            <span>Fixar Novo Recado</span>
          </button>
        </div>
      </div>

      {/* Container Principal: Mural de Recados da Residência */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4f0ee] pb-4">
          <div className="flex items-center gap-2.5 text-[#16302e]">
            <div className="w-9 h-9 rounded-xl bg-[#fff8e6] border border-[#ffca5e] flex items-center justify-center text-[#7b5800]">
              <span className="material-symbols-outlined text-xl">draw</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#16302e]">Mural de Recados & Avisos</h2>
              <p className="text-xs text-[#727877]">Espaço colaborativo para mensagens, lembretes e notas da casa</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#727877] bg-[#f0fcfa] px-3 py-1 rounded-xl border border-[#d0dddb]">
              {muralNotes.length} {muralNotes.length === 1 ? 'recado fixado' : 'recados fixados'}
            </span>
          </div>
        </div>

        {/* Grid de Recados do Mural */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[220px]">
          {muralNotes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-[#727877] bg-[#f0fcfa] rounded-3xl border border-dashed border-[#c1c8c6] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#d0dddb] flex items-center justify-center text-[#7b5800] shadow-2xs">
                <span className="material-symbols-outlined text-3xl">sticky_note_2</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#16302e]">Nenhum recado fixado no mural</h3>
                <p className="text-xs text-[#727877] mt-0.5">
                  Deixe lembretes de compras, avisos de visitas ou recados carinhosos para a família.
                </p>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="mt-2 bg-[#16302e] hover:bg-[#2d4644] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Escrever Primeiro Recado</span>
              </button>
            </div>
          ) : (
            muralNotes.map((note) => {
              const bgClass = getNoteBgColor(note.color);
              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-3xl border shadow-2xs relative flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${bgClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-black/10">
                      <h3 className="text-xs font-black tracking-wide truncate flex-1">
                        {note.title || 'Aviso da Casa'}
                      </h3>
                      <button
                        onClick={() => onDeleteMuralNote?.(note.id)}
                        className="p-1 text-black/40 hover:text-rose-700 transition-colors rounded-lg hover:bg-black/5"
                        title="Excluir recado"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>

                    <p className="text-xs font-medium leading-relaxed whitespace-pre-line break-words">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-black/10 text-[10px] font-bold opacity-80">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">person</span>
                      <span>{note.author}</span>
                    </span>
                    <span className="text-[9px] font-semibold opacity-70">
                      {note.dateStr}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Novo Recado */}
      {isAddNoteModalOpen && (
        <div
          onClick={() => setIsAddNoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d9e5e3] space-y-4 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-3">
              <div className="flex items-center gap-2 text-[#16302e]">
                <span className="material-symbols-outlined text-xl text-[#7b5800]">push_pin</span>
                <h3 className="text-base font-black">Fixar Novo Recado no Mural</h3>
              </div>
              <button onClick={() => setIsAddNoteModalOpen(false)} className="text-[#727877] hover:text-[#16302e] p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Título do Recado (Opcional)
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="ex: Comprar café, Chaves na portaria..."
                  className="w-full p-3 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] focus:outline-none focus:border-[#7b5800]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Mensagem / Conteúdo
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Escreva seu recado para os outros moradores..."
                  className="w-full p-3 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] focus:outline-none focus:border-[#7b5800]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1">
                  Autor da Mensagem
                </label>
                <div className="w-full p-2.5 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#7b5800]">person</span>
                    <span>{authorNameToUse}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#7b5800] bg-[#fff8e6] px-2 py-0.5 rounded-md border border-[#ffca5e]">
                    Identidade Verificada
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16302e] mb-1.5">
                  Cor do Post-it
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'amber', bg: 'bg-[#fde396]', label: 'Amarelo' },
                    { id: 'teal', bg: 'bg-[#c3e8e2]', label: 'Menta' },
                    { id: 'rose', bg: 'bg-[#fcdede]', label: 'Rosa' },
                    { id: 'lavender', bg: 'bg-[#ddd6fe]', label: 'Lavanda' },
                    { id: 'gray', bg: 'bg-[#e3eae8]', label: 'Cinza' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNoteColor(c.id as any)}
                      className={`w-7 h-7 rounded-full ${c.bg} border transition-all ${
                        noteColor === c.id ? 'ring-2 ring-offset-2 ring-[#7b5800] scale-110' : 'hover:scale-105'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e4f0ee]">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#727877] hover:bg-[#e4f0ee] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7b5800] hover:bg-[#5f4400] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
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
