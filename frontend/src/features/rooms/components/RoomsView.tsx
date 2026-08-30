import React, { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '../api/roomsApi.js';
import type { RoomItem, RoomMessage, CreateRoomInput } from '../types/index.js';
import { PasswordPromptModal } from './PasswordPromptModal.js';
import { CreateRoomModal } from './CreateRoomModal.js';
import { RoomChatModal } from './RoomChatModal.js';

interface RoomsViewProps {
  currentUserId: string;
  currentHouseId: string;
  onShowToast?: (msg: string) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  currentUserId,
  currentHouseId,
  onShowToast,
}) => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoomToUnlock, setSelectedRoomToUnlock] = useState<RoomItem | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<RoomItem | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomsApi.listRooms(currentHouseId, currentUserId);
      setRooms(data);
    } catch {
      // Ignora erro inicial em mock dev
    } finally {
      setLoading(false);
    }
  }, [currentHouseId, currentUserId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleOpenRoom = async (room: RoomItem) => {
    if (!room.is_member) {
      // Abre modal de senha
      setSelectedRoomToUnlock(room);
    } else {
      // Abre chat
      try {
        const msgs = await roomsApi.getMessages(room.id, currentUserId);
        setRoomMessages(msgs);
      } catch {
        setRoomMessages([]);
      }
      setActiveChatRoom(room);
    }
  };

  const handleConfirmPassword = async (password: string) => {
    if (!selectedRoomToUnlock) return;
    await roomsApi.joinRoom(selectedRoomToUnlock.id, password, currentUserId);
    onShowToast?.(`Acesso liberado para a sala "${selectedRoomToUnlock.title}"!`);
    await fetchRooms();

    // Abre o chat da sala recém-desbloqueada
    const updatedList = await roomsApi.listRooms(currentHouseId, currentUserId);
    const updatedRoom = updatedList.find((r) => r.id === selectedRoomToUnlock.id);
    if (updatedRoom) {
      try {
        const msgs = await roomsApi.getMessages(updatedRoom.id, currentUserId);
        setRoomMessages(msgs);
      } catch {
        setRoomMessages([]);
      }
      setActiveChatRoom(updatedRoom);
    }
  };

  const handleCreateRoom = async (data: CreateRoomInput) => {
    const newRoom = await roomsApi.createRoom(data, currentHouseId, currentUserId);
    onShowToast?.(`Sala "${data.title}" criada com você como Arquiteto!`);
    await fetchRooms();
    setActiveChatRoom(newRoom);
    setRoomMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChatRoom) return;
    const newMsg = await roomsApi.sendMessage(activeChatRoom.id, text, currentUserId);
    setRoomMessages((prev) => [...prev, newMsg]);
  };

  const handlePromoteMember = async (targetUserId: string) => {
    if (!activeChatRoom) return;
    await roomsApi.promoteMember(activeChatRoom.id, targetUserId, currentUserId);
    onShowToast?.('Membro promovido a Arquiteto com sucesso!');
    await fetchRooms();

    // Atualiza sala ativa
    const updatedList = await roomsApi.listRooms(currentHouseId, currentUserId);
    const updatedRoom = updatedList.find((r) => r.id === activeChatRoom.id);
    if (updatedRoom) {
      setActiveChatRoom(updatedRoom);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#ffca5e] flex items-center justify-center text-[#755400] shadow-xs">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#16302e]">
                Salas de Convivência & Governança
              </h1>
              <p className="text-xs text-[#727877]">
                Salas protegidas por senha com gestão de permissões de Arquiteto.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Criar Nova Sala</span>
        </button>
      </div>

      {/* Grid de Salas */}
      {loading ? (
        <div className="p-12 text-center text-[#727877]">
          <span className="material-symbols-outlined text-3xl animate-spin mb-2">sync</span>
          <p className="text-xs font-bold">Carregando salas...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#c1c8c6] space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#f0fcfa] text-[#7b5800] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">meeting_room</span>
          </div>
          <h3 className="text-base font-black text-[#16302e]">Nenhuma sala criada ainda</h3>
          <p className="text-xs text-[#727877] max-w-sm mx-auto">
            Crie a primeira sala temática ou geral protegida por senha para começar a coordenar sua residência.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#16302e] text-white rounded-xl text-xs font-bold hover:bg-[#2d4644] transition-colors"
          >
            + Criar Sala Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isMember = room.is_member;
            const isArchitect = room.my_role === 'ARCHITECT';

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl p-6 border border-[#d9e5e3] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Header: Icon & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs ${
                        isMember
                          ? 'bg-[#e4f0ee] text-[#16302e]'
                          : 'bg-[#fff8e6] text-[#7b5800] border border-[#ffca5e]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {isMember ? 'forum' : 'lock'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isMember ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isArchitect
                              ? 'bg-[#ffca5e] text-[#755400] border border-[#eed17d]'
                              : 'bg-[#2d4644] text-[#98b3b0]'
                          }`}
                        >
                          {isArchitect ? '⭐ Arquiteto' : 'Membro'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Protegida
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <h3 className="text-base font-black text-[#16302e] mb-2 group-hover:text-[#7b5800] transition-colors">
                    {room.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#727877] mb-6">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">group</span>
                      <span>{room.members_count || room.participants?.length || 0} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>{room.messages_count || 0} msgs</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div>
                  {isMember ? (
                    <button
                      onClick={() => handleOpenRoom(room)}
                      className="w-full py-2.5 bg-[#16302e] hover:bg-[#2d4644] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>Abrir Chat da Sala</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenRoom(room)}
                      className="w-full py-2.5 bg-[#7b5800] hover:bg-[#5d4200] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">key</span>
                      <span>Desbloquear com Senha</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <PasswordPromptModal
        room={selectedRoomToUnlock}
        isOpen={Boolean(selectedRoomToUnlock)}
        onClose={() => setSelectedRoomToUnlock(null)}
        onConfirm={handleConfirmPassword}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <RoomChatModal
        room={activeChatRoom}
        isOpen={Boolean(activeChatRoom)}
        onClose={() => setActiveChatRoom(null)}
        currentUserId={currentUserId}
        messages={roomMessages}
        onSendMessage={handleSendMessage}
        onPromoteMember={handlePromoteMember}
      />
    </div>
  );
};
