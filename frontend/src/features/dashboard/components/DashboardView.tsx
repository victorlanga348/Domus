import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { dashboardApi, type DashboardData } from '../api/dashboardApi.js';
import { MuralNote, FamilyMember } from '../../../types';
import { DashboardSkeleton } from '../../../components/index.js';
import { useBodyScrollLock } from '../../../shared/hooks/index.js';

interface DashboardViewProps {
  currentUserId?: string;
  currentUserName?: string;
  currentHouseId?: string;
  authToken?: string;
  houseName?: string;
  houseInviteCode?: string;
  onSyncHouse?: (house: any) => void;
  subTab?: string;
  vacationMode?: boolean;
  onShowToast?: (msg: string) => void;
  muralNotes?: MuralNote[];
  onAddMuralNote?: (note: Omit<MuralNote, 'id' | 'dateStr'>) => void;
  onDeleteMuralNote?: (id: string) => void;
  onToggleNoteItem?: (noteId: string, itemId: string) => void;
  familyMembers?: FamilyMember[];
  onSyncMembers?: (members: any[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUserId = 'user-1',
  currentUserName,
  currentHouseId = 'house-1',
  authToken,
  houseName,
  houseInviteCode,
  onSyncHouse,
  vacationMode = false,
  onShowToast,
  muralNotes = [],
  onAddMuralNote,
  onDeleteMuralNote,
  onToggleNoteItem,
  familyMembers = [],
  onSyncMembers,
}) => {
  const cacheKey = currentHouseId ? `domus_house_${currentHouseId}_dashboard_cache` : null;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(() => {
    if (!cacheKey) return null;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (!cacheKey) return true;
    return !localStorage.getItem(cacheKey);
  });

  // Modal Novo Recado
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  useBodyScrollLock(isAddNoteModalOpen);
  const [noteType, setNoteType] = useState<'text' | 'checklist'>('text');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [checklistItems, setChecklistItems] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [newItemText, setNewItemText] = useState('');
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const [noteColor, setNoteColor] = useState<MuralNote['color']>('amber');

  const loggedMember = familyMembers.find((m) => m.id === currentUserId);
  const authorNameToUse = currentUserName || loggedMember?.name || 'Morador';

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await dashboardApi.getDashboardData(currentHouseId, currentUserId, authToken);
      if (data) {
        setDashboardData(data);
        if (cacheKey) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
        if (data.house) {
          onSyncHouse?.(data.house);
        }
        if (data.members && data.members.length > 0) {
          onSyncMembers?.(data.members);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados da residência:', err);
    } finally {
      setLoading(false);
    }
  }, [currentHouseId, currentUserId, authToken, cacheKey, onSyncHouse, onSyncMembers]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAddChecklistItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `it_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, text: trimmed, done: false }
    ]);
    setNewItemText('');
    setTimeout(() => {
      newItemInputRef.current?.focus();
    }, 50);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (noteType === 'text') {
      if (!noteContent.trim()) {
        onShowToast?.('Por favor, digite a mensagem do recado.');
        return;
      }

      onAddMuralNote?.({
        title: noteTitle.trim() || undefined,
        content: noteContent.trim(),
        type: 'text',
        color: noteColor,
        author: authorNameToUse,
      });
    } else {
      // Modo Checklist / Lista de Compras
      const finalItems = [...checklistItems];
      const pendingText = newItemText.trim();
      if (pendingText) {
        finalItems.push({
          id: `it_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          text: pendingText,
          done: false,
        });
      }

      if (finalItems.length === 0) {
        onShowToast?.('Adicione pelo menos um item à sua lista antes de fixar.');
        newItemInputRef.current?.focus();
        return;
      }

      onAddMuralNote?.({
        title: noteTitle.trim() || 'Lista de Compras',
        content: noteContent.trim(),
        type: 'checklist',
        items: finalItems,
        color: noteColor,
        author: authorNameToUse,
      });
    }

    setNoteTitle('');
    setNoteContent('');
    setChecklistItems([]);
    setNewItemText('');
    setNoteType('text');
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

  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

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
                {houseName || dashboardData?.house.name || 'Minha Residência'}
              </h1>
              <span className="text-xs font-bold text-[#7b5800] bg-[#fff8e6] px-2.5 py-0.5 rounded-full border border-[#ffca5e]">
                {houseInviteCode || dashboardData?.house.invite_code || 'CASA-DOMUS'}
              </span>
            </div>
            <p className="text-xs text-[#727877] mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#7b5800]">group</span>
              <span>Total de Moradores: <strong className="tabular-nums">{familyMembers && familyMembers.length > 0 ? familyMembers.length : (dashboardData?.members?.length || 1)}</strong></span>
            </p>
          </div>
        </div>

        {/* Ação Rápida */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="w-full md:w-auto bg-[#7b5800] hover:bg-[#5f4400] active:scale-[0.96] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            aria-label="Fixar Novo Recado"
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
              <p className="text-xs text-[#727877]">Lembretes, avisos e mensagens compartilhadas entre os moradores</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#727877] bg-[#f0fcfa] px-3 py-1 rounded-xl border border-[#d0dddb] tabular-nums">
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
                className="mt-2 bg-[#16302e] hover:bg-[#2d4644] active:scale-[0.96] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                aria-label="Escrever Primeiro Recado"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Escrever Primeiro Recado</span>
              </button>
            </div>
          ) : (
            muralNotes.map((note, index) => {
              const bgClass = getNoteBgColor(note.color);
              const hasItems = Array.isArray(note.items) && note.items.length > 0;
              const doneCount = hasItems ? note.items!.filter((it) => it.done).length : 0;
              const totalCount = hasItems ? note.items!.length : 0;
              const isAllDone = hasItems && doneCount === totalCount && totalCount > 0;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04, ease: 'easeOut' }}
                  className={`p-5 rounded-3xl border shadow-2xs relative flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${bgClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-black/10">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {hasItems && (
                          <span className="material-symbols-outlined text-sm shrink-0 opacity-75">
                            {isAllDone ? 'check_circle' : 'checklist'}
                          </span>
                        )}
                        <h3 className="text-xs font-black tracking-wide truncate">
                          {note.title || (hasItems ? 'Lista de Compras' : 'Aviso da Casa')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasItems && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border tabular-nums ${
                              isAllDone
                                ? 'bg-emerald-500/20 text-emerald-900 border-emerald-500/40'
                                : 'bg-black/5 text-black/70 border-black/10'
                            }`}
                          >
                            {doneCount}/{totalCount}
                          </span>
                        )}
                        <button
                          onClick={() => onDeleteMuralNote?.(note.id)}
                          className="p-1 text-black/40 hover:text-rose-700 active:scale-[0.96] transition-all rounded-lg hover:bg-black/5 cursor-pointer"
                          title="Excluir recado"
                          aria-label="Excluir recado"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    {note.content && (
                      <p
                        className={`text-xs font-medium leading-relaxed whitespace-pre-line break-words ${
                          hasItems ? 'opacity-80 mb-2 pb-1.5 border-b border-black/5' : ''
                        }`}
                      >
                        {note.content}
                      </p>
                    )}

                    {hasItems && (
                      <div className="space-y-1.5 my-1 max-h-48 overflow-y-auto pr-1">
                        {note.items!.map((item) => (
                          <label
                            key={item.id}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-start gap-2 p-1.5 rounded-xl cursor-pointer select-none transition-all ${
                              item.done
                                ? 'bg-black/5 opacity-50'
                                : 'hover:bg-black/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(item.done)}
                              onChange={() => onToggleNoteItem?.(note.id, item.id)}
                              className="mt-0.5 w-3.5 h-3.5 rounded border-black/30 text-[#7b5800] focus:ring-0 cursor-pointer accent-[#7b5800] shrink-0"
                            />
                            <span
                              className={`text-xs font-medium leading-snug break-words flex-1 ${
                                item.done ? 'line-through' : ''
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
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
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Novo Recado */}
      {isAddNoteModalOpen && (
        <div
          onClick={() => setIsAddNoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[90dvh] my-auto shadow-2xl border border-[#d9e5e3] flex flex-col animate-in fade-in overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-[#e4f0ee] p-5 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-[#16302e]">
                <span className="material-symbols-outlined text-xl text-[#7b5800]">push_pin</span>
                <h3 className="text-base font-black">Fixar Novo Recado no Mural</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="text-[#727877] hover:text-[#16302e] p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {/* Seletor de Tipo: Texto ou Checklist */}
                <div className="flex bg-[#f0fcfa] p-1 rounded-2xl border border-[#d0dddb] gap-1">
                  <button
                    type="button"
                    onClick={() => setNoteType('text')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      noteType === 'text'
                        ? 'bg-white text-[#16302e] shadow-xs border border-[#d9e5e3]'
                        : 'text-[#727877] hover:text-[#16302e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">notes</span>
                    <span>Recado de Texto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteType('checklist');
                      if (!noteTitle) setNoteTitle('Lista de Compras');
                      setTimeout(() => newItemInputRef.current?.focus(), 50);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      noteType === 'checklist'
                        ? 'bg-white text-[#16302e] shadow-xs border border-[#d9e5e3]'
                        : 'text-[#727877] hover:text-[#16302e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">checklist</span>
                    <span>Checklist / Compras</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16302e] mb-1">
                    {noteType === 'checklist' ? 'Título da Lista' : 'Título do Recado (Opcional)'}
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={noteType === 'checklist' ? 'ex: Lista de Compras, Feira de Domingo...' : 'ex: Comprar café, Chaves na portaria...'}
                    className="w-full p-3 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] focus:outline-none focus:border-[#7b5800]"
                  />
                </div>

                {noteType === 'checklist' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#16302e] mb-1">
                        Observação / Contexto (Opcional)
                      </label>
                      <input
                        type="text"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="ex: Itens para o fim de semana, comprar até sábado..."
                        className="w-full p-2.5 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] focus:outline-none focus:border-[#7b5800]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#16302e] mb-1">
                        Adicionar Itens à Lista
                      </label>
                      <div className="flex gap-2">
                        <input
                          ref={newItemInputRef}
                          type="text"
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChecklistItem();
                            }
                          }}
                          placeholder="ex: Leite de aveia, Café em grãos..."
                          className="flex-1 p-2.5 rounded-xl text-xs border border-[#c1c8c6] bg-[#f0fcfa] text-[#131e1d] focus:outline-none focus:border-[#7b5800]"
                        />
                        <button
                          type="button"
                          onClick={handleAddChecklistItem}
                          disabled={!newItemText.trim()}
                          className="px-3 py-2.5 bg-[#16302e] hover:bg-[#2d4644] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>Inserir</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#727877] mt-1">
                        Dica: Digite o item e aperte <strong>Enter</strong> ou clique em <strong>Inserir</strong>.
                      </p>
                    </div>

                    {checklistItems.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-[#f0fcfa] rounded-xl border border-[#d0dddb] scrollbar-thin">
                        <div className="text-[10px] font-bold text-[#727877] px-1 mb-1">
                          {checklistItems.length} {checklistItems.length === 1 ? 'item adicionado' : 'itens adicionados'}:
                        </div>
                        {checklistItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-[#e4f0ee] text-xs">
                            <span className="font-medium text-[#131e1d] truncate flex-1 flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-[#727877] w-4">{idx + 1}.</span>
                              {item.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveChecklistItem(item.id)}
                              className="p-1 text-black/40 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Remover item"
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f0fcfa] rounded-xl border border-dashed border-[#c1c8c6] text-center text-xs text-[#727877]">
                        Nenhum item na lista ainda. Digite acima para começar.
                      </div>
                    )}
                  </div>
                ) : (
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
                )}

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
                        className={`w-7 h-7 rounded-full ${c.bg} border transition-all cursor-pointer ${
                          noteColor === c.id ? 'ring-2 ring-offset-2 ring-[#7b5800] scale-110' : 'hover:scale-105'
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Rodapé Fixo */}
              <div className="flex justify-end gap-2 p-4 pt-3 border-t border-[#e4f0ee] bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#727877] hover:bg-[#e4f0ee] rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7b5800] hover:bg-[#5f4400] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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
