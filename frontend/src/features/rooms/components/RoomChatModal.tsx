import React, { useState, useEffect, useRef } from 'react';
import type { RoomItem, RoomMessage } from '../types/index.js';

interface RoomChatModalProps {
  room: RoomItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  messages: RoomMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onPromoteMember: (targetUserId: string) => Promise<void>;
}

export const RoomChatModal: React.FC<RoomChatModalProps> = ({
  room,
  isOpen,
  onClose,
  currentUserId,
  messages,
  onSendMessage,
  onPromoteMember,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen || !room) return null;

  const isArchitect = room.my_role === 'ARCHITECT';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(inputText.trim());
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  const handlePromote = async (targetUserId: string) => {
    try {
      setPromotingId(targetUserId);
      await onPromoteMember(targetUserId);
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] shadow-2xl border border-[#d9e5e3] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-[#16302e] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#2d4644] border border-[#ffca5e] flex items-center justify-center text-[#ffca5e] shrink-0">
              <span className="material-symbols-outlined text-xl">forum</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black truncate">{room.title}</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isArchitect
                      ? 'bg-[#ffca5e] text-[#755400] border border-[#eed17d]'
                      : 'bg-[#2d4644] text-[#98b3b0]'
                  }`}
                >
                  {isArchitect ? '⭐ Arquiteto' : 'Membro'}
                </span>
              </div>
              <p className="text-[11px] text-[#98b3b0] truncate">
                {room.participants.length} participantes • Sala protegida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Gestão de Membros */}
            <button
              onClick={() => setShowMembersPanel((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showMembersPanel
                  ? 'bg-[#ffca5e] text-[#755400] border-[#ffca5e]'
                  : 'bg-[#2d4644] text-white border-transparent hover:bg-[#3b5855]'
              }`}
              title="Gerenciar participantes e cargos"
            >
              <span className="material-symbols-outlined text-sm">group</span>
              <span className="hidden sm:inline">Membros ({room.participants.length})</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#98b3b0] hover:text-white p-1 rounded-full hover:bg-[#2d4644] transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Content Body: Chat + Optional Sidebar */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#f0fcfa]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#727877] p-6">
                  <span className="material-symbols-outlined text-4xl text-[#98b3b0] mb-2">chat_bubble</span>
                  <p className="text-xs sm:text-sm font-bold text-[#16302e]">Nenhuma mensagem nesta sala ainda.</p>
                  <p className="text-[11px] text-[#727877] mt-0.5">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.user_id === currentUserId;
                  const authorName = msg.user?.name || (isMine ? 'Você' : 'Membro');
                  const timeFormatted = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-[#727877] font-semibold mb-1 px-1">
                        <span>{authorName}</span>
                        <span>•</span>
                        <span>{timeFormatted}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed break-words shadow-2xs ${
                          isMine
                            ? 'bg-[#16302e] text-white rounded-tr-xs'
                            : 'bg-white text-[#131e1d] border border-[#d9e5e3] rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSend} className="bg-white p-3 sm:p-4 border-t border-[#e4f0ee] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="flex-1 p-2.5 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-4 py-2.5 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>

          {/* Members & Hierarchy Panel (Side Drawer or Overlay) */}
          {showMembersPanel && (
            <div className="w-64 sm:w-72 bg-white border-l border-[#d9e5e3] flex flex-col shrink-0 animate-in slide-in-from-right duration-200 z-10">
              <div className="p-4 border-b border-[#e4f0ee] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#16302e] uppercase tracking-wider">
                    Gestão de Membros
                  </h3>
                  <p className="text-[10px] text-[#727877]">Controle de Cargos da Sala</p>
                </div>
                <button
                  onClick={() => setShowMembersPanel(false)}
                  className="text-[#727877] hover:text-[#16302e]"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {room.participants.map((participant) => {
                  const isMemberArchitect = participant.role === 'ARCHITECT';
                  const isSelf = participant.user_id === currentUserId;

                  return (
                    <div
                      key={participant.user_id}
                      className="p-2.5 rounded-xl bg-[#f0fcfa] border border-[#d0dddb] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#16302e] truncate">
                            {participant.name} {isSelf && '(Você)'}
                          </p>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              isMemberArchitect
                                ? 'bg-[#ffca5e] text-[#755400]'
                                : 'bg-[#e4f0ee] text-[#414847]'
                            }`}
                          >
                            {isMemberArchitect ? '⭐ Arquiteto' : 'Membro'}
                          </span>
                        </div>
                      </div>

                      {/* Botão Promover: Visível apenas se o usuário logado for Arquiteto e o alvo for Membro comum */}
                      {isArchitect && !isMemberArchitect && (
                        <button
                          onClick={() => handlePromote(participant.user_id)}
                          disabled={promotingId === participant.user_id}
                          className="w-full mt-1 py-1 px-2 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-lg text-[10px] font-extrabold transition-all shadow-2xs flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-xs">military_tech</span>
                          <span>
                            {promotingId === participant.user_id ? 'Promovendo...' : 'Promover a Arquiteto'}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-[#e4f0ee] bg-[#f0fcfa] text-[10px] text-[#727877]">
                <p>
                  {isArchitect
                    ? '👑 Como Arquiteto, você pode promover novos membros para gerenciar a sala.'
                    : '🔒 Apenas Arquitetos podem alterar cargos e convidar administradores.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
