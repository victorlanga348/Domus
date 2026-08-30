import React, { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '../api/roomsApi.js';
import type { RoomItem, RoomMessage, CreateRoomInput, JoinRoomInput } from '../types/index.js';
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
  // My Rooms state
  const [myRooms, setMyRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: Create Room
  const [createTitle, setCreateTitle] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State: Join Room
  const [joinTitle, setJoinTitle] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Chat Modal State
  const [activeChatRoom, setActiveChatRoom] = useState<RoomItem | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);

  const fetchMyRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomsApi.listMyRooms(currentUserId);
      setMyRooms(data);
    } catch {
      // Ignora erro inicial em mock dev
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchMyRooms();
  }, [fetchMyRooms]);

  const handleOpenRoomChat = async (room: RoomItem) => {
    try {
      const msgs = await roomsApi.getMessages(room.id, currentUserId);
      setRoomMessages(msgs);
    } catch {
      setRoomMessages([]);
    }
    setActiveChatRoom(room);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createPassword.trim()) return;

    try {
      setCreateLoading(true);
      setCreateError(null);

      const input: CreateRoomInput = {
        title: createTitle.trim(),
        password: createPassword.trim(),
      };

      const newRoom = await roomsApi.createRoom(input, currentHouseId, currentUserId);
      setCreateTitle('');
      setCreatePassword('');
      onShowToast?.(`Sala "${newRoom.title}" fundada com você como Arquiteto!`);

      await fetchMyRooms();
      await handleOpenRoomChat(newRoom);
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao fundar sala.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinByCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinTitle.trim() || !joinPassword.trim()) return;

    try {
      setJoinLoading(true);
      setJoinError(null);

      const input: JoinRoomInput = {
        title: joinTitle.trim(),
        password: joinPassword.trim(),
      };

      const result = await roomsApi.joinByCredentials(input, currentUserId);
      setJoinTitle('');
      setJoinPassword('');
      onShowToast?.(`Acesso concedido à sala "${result.room.title}"!`);

      await fetchMyRooms();
      await handleOpenRoomChat(result.room);
    } catch (err: any) {
      setJoinError(err.message || 'Credenciais da sala inválidas.');
    } finally {
      setJoinLoading(false);
    }
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
    await fetchMyRooms();

    // Atualiza sala ativa
    const updatedList = await roomsApi.listMyRooms(currentUserId);
    const updatedRoom = updatedList.find((r) => r.id === activeChatRoom.id);
    if (updatedRoom) {
      setActiveChatRoom(updatedRoom);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Saguão / Lobby */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] flex items-center justify-center text-[#755400] shadow-xs shrink-0">
            <span className="material-symbols-outlined text-3xl">key</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#16302e]">
              Saguão de Salas Privadas (Lobby)
            </h1>
            <p className="text-xs text-[#727877] mt-0.5">
              Acesso seguro por credenciais exclusivas (Nome Exato + Senha). Sem diretórios públicos.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Ações Principais da Lobby (Criar vs Entrar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Fundar Nova Sala */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d9e5e3] shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fff8e6] border border-[#ffca5e] flex items-center justify-center text-[#7b5800]">
              <span className="material-symbols-outlined text-2xl font-black">shield_person</span>
            </div>
            <div>
              <h2 className="text-base font-black text-[#16302e]">Fundar Nova Sala</h2>
              <p className="text-xs text-[#727877]">Você será o Arquiteto Principal da sala</p>
            </div>
          </div>

          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">
                Nome Único da Sala
              </label>
              <input
                type="text"
                required
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="ex: PlanejamentoFinanceiro, ReformaCozinha..."
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">
                Senha de Acesso à Sala
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Defina uma senha secreta (4+ chars)..."
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading || !createTitle.trim() || !createPassword.trim()}
              className="w-full py-3 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>{createLoading ? 'Fundando Sala...' : 'Fundar Sala & Abrir Chat'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Entrar em Sala Existente */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d9e5e3] shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e4f0ee] flex items-center justify-center text-[#16302e]">
              <span className="material-symbols-outlined text-2xl font-black">lock_open</span>
            </div>
            <div>
              <h2 className="text-base font-black text-[#16302e]">Entrar em Sala Existente</h2>
              <p className="text-xs text-[#727877]">Digite as credenciais fornecidas pelo Arquiteto</p>
            </div>
          </div>

          {joinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">lock</span>
              <span>{joinError}</span>
            </div>
          )}

          <form onSubmit={handleJoinByCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">
                Nome Exato da Sala
              </label>
              <input
                type="text"
                required
                value={joinTitle}
                onChange={(e) => setJoinTitle(e.target.value)}
                placeholder="Digite o nome exato da sala..."
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">
                Senha da Sala
              </label>
              <input
                type="password"
                required
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Digite a senha de acesso..."
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
            </div>

            <button
              type="submit"
              disabled={joinLoading || !joinTitle.trim() || !joinPassword.trim()}
              className="w-full py-3 bg-[#16302e] hover:bg-[#2d4644] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{joinLoading ? 'Autenticando...' : 'Desbloquear & Acessar Chat'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Seção Minhas Salas Conectadas (VIP / Acesso Rápido) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#16302e]">
              Minhas Salas Conectadas
            </h2>
            <p className="text-xs text-[#727877]">
              Salas desbloqueadas salvas na sua conta (dispensa reintroduzir a senha).
            </p>
          </div>
          <span className="text-xs font-bold text-[#7b5800] bg-[#fff8e6] px-3 py-1 rounded-full border border-[#ffca5e]">
            {myRooms.length} {myRooms.length === 1 ? 'sala ativa' : 'salas ativas'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#727877]">
            <span className="material-symbols-outlined text-2xl animate-spin mb-1">sync</span>
            <p className="text-xs font-bold">Carregando suas salas...</p>
          </div>
        ) : myRooms.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-dashed border-[#c1c8c6] space-y-2">
            <span className="material-symbols-outlined text-3xl text-[#98b3b0]">lock_clock</span>
            <h3 className="text-sm font-bold text-[#16302e]">Nenhuma sala conectada</h3>
            <p className="text-xs text-[#727877] max-w-md mx-auto">
              Você ainda não ingressou em nenhuma sala privada. Utilize os formulários acima para fundar uma nova sala ou digitar as credenciais de uma existente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRooms.map((room) => {
              const isArchitect = room.my_role === 'ARCHITECT';

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl p-6 border border-[#d9e5e3] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#e4f0ee] text-[#16302e] flex items-center justify-center shadow-2xs">
                        <span className="material-symbols-outlined text-2xl">forum</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isArchitect
                            ? 'bg-[#ffca5e] text-[#755400] border border-[#eed17d]'
                            : 'bg-[#2d4644] text-[#98b3b0]'
                        }`}
                      >
                        {isArchitect ? '⭐ Arquiteto' : 'Membro'}
                      </span>
                    </div>

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

                  <button
                    onClick={() => handleOpenRoomChat(room)}
                    className="w-full py-2.5 bg-[#16302e] hover:bg-[#2d4644] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>Abrir Chat da Sala</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Chat & Gestão */}
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
