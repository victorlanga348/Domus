import React, { useState, useEffect } from 'react';
import { authApi, type AuthUser, type HouseResponse } from '../api/authApi.js';

interface HouseSelectionViewProps {
  currentUser: AuthUser;
  token?: string;
  onHouseSelected: (houseData: HouseResponse) => void;
  onLogout: () => void;
  onShowToast?: (msg: string) => void;
}

export const HouseSelectionView: React.FC<HouseSelectionViewProps> = ({
  currentUser,
  token,
  onHouseSelected,
  onLogout,
  onShowToast,
}) => {
  // My Houses State
  const [myHouses, setMyHouses] = useState<any[]>([]);
  const [loadingMyHouses, setLoadingMyHouses] = useState(true);
  const [selectingHouseId, setSelectingHouseId] = useState<string | null>(null);

  // Create State
  const [createName, setCreateName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join State
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Carregar residências salvas do usuário apenas se possuir residência ativa
  useEffect(() => {
    let isMounted = true;
    async function loadMyHouses() {
      if (!currentUser.house_id) {
        setMyHouses([]);
        setLoadingMyHouses(false);
        return;
      }
      try {
        setLoadingMyHouses(true);
        const list = await authApi.listMyHouses(currentUser.id, token);
        if (isMounted) {
          setMyHouses(list);
        }
      } catch (err) {
        console.warn('Erro ao carregar minhas casas:', err);
      } finally {
        if (isMounted) setLoadingMyHouses(false);
      }
    }
    loadMyHouses();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.house_id, token]);

  const handleSelectExistingHouse = async (houseItem: any) => {
    try {
      setSelectingHouseId(houseItem.id);
      const result = await authApi.switchHouse(currentUser.id, houseItem.id, token);
      onShowToast?.(`Acessando residência "${result.house.name}"...`);
      onHouseSelected(result);
    } catch (err: any) {
      onShowToast?.(err.message || 'Erro ao alternar para residência.');
    } finally {
      setSelectingHouseId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setCreateLoading(true);
      setCreateError(null);

      const result = await authApi.createHouse(
        {
          name: createName.trim(),
          user_id: currentUser.id,
        },
        token
      );

      onShowToast?.(`Residência "${result.house.name}" criada com sucesso! Você é o Administrador Geral.`);
      onHouseSelected(result);
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao criar residência.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinLoading(true);
      setJoinError(null);

      const result = await authApi.joinHouse(
        {
          inviteCode: joinCode.trim().toUpperCase(),
          user_id: currentUser.id,
        },
        token
      );

      onShowToast?.(`Você entrou na residência "${result.house.name}" como Morador!`);
      onHouseSelected(result);
    } catch (err: any) {
      setJoinError(err.message || 'Código de convite inválido ou residência não encontrada.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e4f0ee] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header with user info & logout */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-[#d9e5e3] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center font-black text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#16302e]">
              Conectado como {currentUser.name}
            </h2>
            <p className="text-[11px] text-[#727877]">{currentUser.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 bg-[#f0fcfa] hover:bg-rose-50 text-rose-700 border border-[#c1c8c6] rounded-xl text-xs font-bold transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full my-auto space-y-6 py-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#16302e]">
            Escolha uma Residência / Sala
          </h1>
          <p className="text-xs sm:text-sm text-[#727877] max-w-lg mx-auto">
            Acesse uma casa onde você já é membro ou crie uma nova residência para gerenciar tarefas e escalas.
          </p>
        </div>

        {/* Seção de Minha Residência Salva (Apenas se o usuário estiver ativamente vinculado) */}
        {Boolean(currentUser.house_id) && myHouses.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d9e5e3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-xl text-[#7b5800]">apartment</span>
                <h2 className="text-sm sm:text-base font-black text-[#16302e]">
                  Minha Residência Atual ({myHouses.length})
                </h2>
              </div>
              <span className="text-xs text-[#727877]">Acesso seguro</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myHouses.map((houseItem) => {
                const isSelecting = selectingHouseId === houseItem.id;
                return (
                  <div
                    key={houseItem.id}
                    className="p-4 rounded-2xl border border-[#d9e5e3] bg-[#f0fcfa] hover:border-[#7b5800] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[#16302e]">{houseItem.name}</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16302e] text-white">
                        {houseItem.my_role === 'ADMIN' ? 'Arquiteto' : 'Morador'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#d0dddb] text-xs text-[#727877]">
                      <span>{houseItem.members_count || 1} membro(s)</span>
                      <button
                        onClick={() => handleSelectExistingHouse(houseItem)}
                        disabled={isSelecting}
                        className="px-3.5 py-1.5 bg-[#7b5800] hover:bg-[#5d4200] text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">login</span>
                        <span>{isSelecting ? 'Acessando...' : 'Acessar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Fundar Nova Casa */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d9e5e3] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff8e6] border border-[#ffca5e] text-[#7b5800] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">shield_person</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-[#16302e]">Criar Nova Residência</h2>
                  <p className="text-xs text-[#727877]">Você será o Administrador Geral da casa</p>
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} id="create-house-form" className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#16302e] mb-1">
                    Nome da Residência
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="ex: Casa Alameda, República Central..."
                    className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-base font-medium focus:outline-none focus:border-[#7b5800]"
                  />
                  <p className="text-[11px] text-[#727877] mt-1.5">
                    Um Código de Convite único será gerado automaticamente para novos membros.
                  </p>
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="create-house-form"
              disabled={createLoading || !createName.trim()}
              className="w-full py-3 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span className="material-symbols-outlined text-base">add_home</span>
              <span>{createLoading ? 'Criando Residência...' : 'Criar Residência & Acessar'}</span>
            </button>
          </div>

          {/* Card 2: Entrar em Residência Existente */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d9e5e3] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e4f0ee] text-[#16302e] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">key</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-[#16302e]">Entrar em Residência</h2>
                  <p className="text-xs text-[#727877]">Insira o Código de Convite da casa (ex: CASA-4892)</p>
                </div>
              </div>

              {joinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">lock</span>
                  <span>{joinError}</span>
                </div>
              )}

              <form onSubmit={handleJoin} id="join-house-form" className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#16302e] mb-1">
                    Código de Convite da Residência
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ex: CASA-4892"
                    className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-base font-bold font-mono tracking-wider focus:outline-none focus:border-[#16302e]"
                  />
                  <p className="text-[11px] text-[#727877] mt-1.5">
                    Solicite o código a qualquer morador ou ao Administrador Geral da casa.
                  </p>
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="join-house-form"
              disabled={joinLoading || !joinCode.trim()}
              className="w-full py-3 bg-[#16302e] hover:bg-[#2d4644] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{joinLoading ? 'Validando...' : 'Entrar na Residência'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#727877] mt-6">
        DOMUS • Gestão Residencial Compartilhada
      </div>
    </div>
  );
};
