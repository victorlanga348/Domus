import React, { useState } from 'react';
import { SystemPreferences, HouseRule, FamilyMember } from '../../../types';

interface SettingsViewProps {
  preferences: SystemPreferences;
  onUpdatePreferences: (pref: SystemPreferences) => void;
  houseRules: HouseRule[];
  onUpdateHouseRules: (rules: HouseRule[]) => void;
  familyMembers: FamilyMember[];
  onOpenAddMemberModal: () => void;
  onOpenAddRuleModal: () => void;
  onSwitchHouse?: () => void;
  currentUserRole?: FamilyMember['role'];
  currentUserId?: string;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteToResident?: (memberId: string) => void;
  onTransferGeneralAdmin?: (member: FamilyMember) => void;
  onRemoveMember?: (memberId: string, memberName: string) => void;
  onLeaveHouse?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  houseRules,
  onUpdateHouseRules,
  familyMembers,
  onOpenAddMemberModal,
  onOpenAddRuleModal,
  onSwitchHouse,
  currentUserRole = 'Admin Geral',
  currentUserId,
  onPromoteToAdmin,
  onDemoteToResident,
  onTransferGeneralAdmin,
  onRemoveMember,
  onLeaveHouse,
}) => {
  const [nightMode, setNightMode] = useState(preferences.nightMode);

  const handleToggleNightMode = () => {
    const updated = { ...nightMode, enabled: !nightMode.enabled };
    setNightMode(updated);
    onUpdatePreferences({ ...preferences, nightMode: updated });
  };

  const handleStartTimeChange = (startTime: string) => {
    const updated = { ...nightMode, startTime };
    setNightMode(updated);
    onUpdatePreferences({ ...preferences, nightMode: updated });
  };

  const handleEndTimeChange = (endTime: string) => {
    const updated = { ...nightMode, endTime };
    setNightMode(updated);
    onUpdatePreferences({ ...preferences, nightMode: updated });
  };

  const handleDeleteRule = (id: string) => {
    const updated = houseRules.filter((r) => r.id !== id);
    onUpdateHouseRules(updated);
  };

  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const canAddMember = isGeneralAdmin || isAdmin;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Coluna Esquerda: Preferências do Sistema & Regras da Casa */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#16302e]">Preferências da Residência</h2>

        {/* Card Modo Noturno */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d9e5e3] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-[#16302e]">
                <span className="material-symbols-outlined text-2xl text-[#7b5800]">routine</span>
                <h3 className="text-lg font-bold">Modo Noturno</h3>
              </div>
              {/* Toggle switch */}
              <button
                onClick={handleToggleNightMode}
                className={`w-12 h-6 rounded-full relative transition-colors p-0.5 ${
                  nightMode.enabled ? 'bg-[#7b5800]' : 'bg-[#d0dddb]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    nightMode.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#414847] leading-relaxed mb-6">
              Define o período de silêncio e repouso da casa, pausando notificações e alertas sonoros de tarefas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md">
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#727877] mb-1">
                HORÁRIO DE INÍCIO
              </label>
              <div className="border border-[#c1c8c6] focus-within:border-[#7b5800] rounded-xl px-3 py-2 bg-[#f0fcfa] transition-colors">
                <input
                  type="time"
                  value={nightMode.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-[#131e1d] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#727877] mb-1">
                HORÁRIO DE TÉRMINO
              </label>
              <div className="border border-[#c1c8c6] focus-within:border-[#7b5800] rounded-xl px-3 py-2 bg-[#f0fcfa] transition-colors">
                <input
                  type="time"
                  value={nightMode.endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-[#131e1d] focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Regras da Casa & Convivência */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d9e5e3] mt-2">
          <div className="flex justify-between items-center border-b border-[#d9e5e3] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#7b5800]">gavel</span>
              <h3 className="text-lg font-bold text-[#16302e]">
                Regras de Convivência da Casa
              </h3>
            </div>
            {canAddMember && (
              <button
                onClick={onOpenAddRuleModal}
                className="text-[#7b5800] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span> Adicionar Regra
              </button>
            )}
          </div>

          <div className="space-y-4">
            {houseRules.length === 0 ? (
              <p className="text-xs text-[#727877] italic py-2">
                Nenhuma regra cadastrada ainda. Clique no botão acima para adicionar a primeira regra de convivência.
              </p>
            ) : (
              houseRules.map((rule, idx) => (
                <div key={rule.id} className="flex gap-4 items-start group">
                  <div className="w-8 h-8 rounded-full bg-[#ffca5e] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <span className="text-[#755400] font-black text-xs">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#131e1d]">{rule.title}</h4>
                    <p className="text-xs text-[#414847] leading-relaxed">{rule.description}</p>
                  </div>
                  {canAddMember && (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#727877] hover:text-rose-500 transition-opacity p-1"
                      title="Excluir regra"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              ))
            )}

            {/* Atalho para adicionar regra */}
            {canAddMember && (
              <div
                onClick={onOpenAddRuleModal}
                className="flex gap-4 items-center cursor-pointer pt-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#d0dddb] flex items-center justify-center shrink-0 group-hover:bg-[#ffca5e] transition-colors">
                  <span className="material-symbols-outlined text-[#414847] group-hover:text-[#755400] text-sm">
                    add
                  </span>
                </div>
                <span className="text-xs font-semibold italic text-[#727877] group-hover:text-[#16302e]">
                  Criar nova regra de convivência...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coluna Direita: Painel de Membros e Governança */}
      <div className="lg:col-span-4 bg-[#16302e] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-[#2d4644] min-h-[500px] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Membros da Residência</h3>
              <p className="text-xs text-[#b0ccc9]">Hierarquia e papéis de acesso</p>
            </div>
            {canAddMember && (
              <button
                onClick={onOpenAddMemberModal}
                className="bg-[#ffca5e] text-[#755400] rounded-full p-2 hover:scale-105 transition-transform shadow-md"
                title="Convidar Novo Membro"
              >
                <span className="material-symbols-outlined text-lg font-bold">person_add</span>
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {familyMembers.map((member) => {
              const isTargetGeneralAdmin = member.role === 'Admin Geral' || member.isPrimary;
              const isTargetAdmin = member.role === 'Admin';
              const isTargetResident = member.role === 'Resident';
              const isSelf = member.id === currentUserId;

              const canRemoveThisMember =
                !isSelf &&
                ((isGeneralAdmin && !isTargetGeneralAdmin) ||
                  (isAdmin && !isTargetGeneralAdmin && !isTargetAdmin));

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl flex flex-col gap-2.5 border transition-all ${
                    isTargetGeneralAdmin
                      ? 'bg-[#2d4644] border-[#ffca5e]'
                      : 'bg-[#2d4644]/50 border-transparent hover:border-[#3e4241]'
                  }`}
                >
                  {/* Linha superior: Avatar + Dados + Badge com zero sobreposição */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#ffca5e] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-white truncate">{member.name}</p>
                          {isSelf && (
                            <span className="text-[9px] bg-white text-[#16302e] px-1.5 py-0.5 rounded font-black uppercase">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#b0ccc9] truncate">{member.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        isTargetGeneralAdmin
                          ? 'bg-[#ffca5e] text-[#755400]'
                          : isTargetAdmin
                          ? 'bg-[#16302e] text-white border border-[#486b68]'
                          : 'bg-[#213836] text-[#b0ccc9]'
                      }`}
                    >
                      {isTargetGeneralAdmin ? '👑 Admin Geral' : isTargetAdmin ? 'Admin' : 'Morador'}
                    </span>
                  </div>

                  {/* Ações Administrativas Exclusivas do Admin Geral e Remoção */}
                  {((isGeneralAdmin && !isTargetGeneralAdmin) || canRemoveThisMember) && !isSelf && (
                    <div className="pt-2 border-t border-[#3d5c5a] flex items-center justify-end gap-1.5 flex-wrap">
                      {isGeneralAdmin && isTargetResident && onPromoteToAdmin && (
                        <button
                          type="button"
                          onClick={() => onPromoteToAdmin(member.id)}
                          className="px-2 py-1 bg-[#16302e] hover:bg-[#213836] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border border-[#486b68]"
                          title="Promover a Administrador Normal"
                        >
                          <span className="material-symbols-outlined text-xs">shield_person</span>
                          <span>Tornar Admin</span>
                        </button>
                      )}

                      {isGeneralAdmin && isTargetAdmin && onDemoteToResident && (
                        <button
                          type="button"
                          onClick={() => onDemoteToResident(member.id)}
                          className="px-2 py-1 bg-white hover:bg-amber-50 text-[#7b5800] border border-[#ffca5e] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Destituir para Morador"
                        >
                          <span className="material-symbols-outlined text-xs">arrow_downward</span>
                          <span>Despromover</span>
                        </button>
                      )}

                      {isGeneralAdmin && onTransferGeneralAdmin && (
                        <button
                          type="button"
                          onClick={() => onTransferGeneralAdmin(member)}
                          className="px-2 py-1 bg-[#ffca5e] hover:bg-[#e0b04a] text-[#755400] rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                          title="Transferir Liderança da Residência"
                        >
                          <span className="material-symbols-outlined text-xs">crown</span>
                          <span>Passar Admin Geral</span>
                        </button>
                      )}

                      {canRemoveThisMember && onRemoveMember && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id, member.name)}
                          className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Remover Morador"
                        >
                          <span className="material-symbols-outlined text-xs">person_remove</span>
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Troca de Residência */}
        <div className="relative z-10 pt-4 border-t border-[#2d4644] flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-[#b0ccc9] gap-2">
          <span>Total de Moradores: {familyMembers.length}</span>
          <div className="flex items-center gap-4 flex-wrap">
            {onSwitchHouse && (
              <button
                onClick={onSwitchHouse}
                className="text-[#ffca5e] hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">apartment</span>
                <span>Trocar Residência</span>
              </button>
            )}
            {onLeaveHouse && (
              <button
                onClick={onLeaveHouse}
                className="text-rose-400 hover:text-rose-300 hover:underline font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Sair desta residência"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sair da Residência</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
