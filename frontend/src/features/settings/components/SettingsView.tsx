import React, { useState } from 'react';
import { SystemPreferences, HouseRule, FamilyMember } from '../../../types';

interface SettingsViewProps {
  preferences: SystemPreferences;
  onUpdatePreferences: (pref: SystemPreferences) => void;
  houseRules: HouseRule[];
  onUpdateHouseRules: (rules: HouseRule[]) => void;
  familyMembers: FamilyMember[];
  onOpenAddMemberModal: () => void;
  onOpenAccessLogsModal: () => void;
  onOpenAddRuleModal: () => void;
  onSwitchHouse?: () => void;
  currentUserRole?: FamilyMember['role'];
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteToResident?: (memberId: string) => void;
  onTransferGeneralAdmin?: (member: FamilyMember) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  houseRules,
  onUpdateHouseRules,
  familyMembers,
  onOpenAddMemberModal,
  onOpenAccessLogsModal,
  onOpenAddRuleModal,
  onSwitchHouse,
  currentUserRole = 'Admin Geral',
  onPromoteToAdmin,
  onDemoteToResident,
  onTransferGeneralAdmin,
}) => {
  const [nightMode, setNightMode] = useState(preferences.nightMode);
  const [vacationTriggers, setVacationTriggers] = useState(preferences.vacationTriggers);

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

  const handleToggleVacationTriggers = () => {
    const updated = { ...vacationTriggers, enabled: !vacationTriggers.enabled };
    setVacationTriggers(updated);
    onUpdatePreferences({ ...preferences, vacationTriggers: updated });
  };

  const handleDeleteRule = (id: string) => {
    const updated = houseRules.filter((r) => r.id !== id);
    onUpdateHouseRules(updated);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left Column: System Preferences & House Rules */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#16302e]">System Preferences</h2>

        {/* Global Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Night Mode Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d9e5e3] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#16302e]">
                  <span className="material-symbols-outlined text-2xl">routine</span>
                  <h3 className="text-lg font-bold">Night Mode</h3>
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
                Automatically dim lights, arm external sensors, and lower thermostat based on schedule.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
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

          {/* Vacation Triggers Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d9e5e3] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#16302e]">
                  <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                  <h3 className="text-lg font-bold">Vacation Triggers</h3>
                </div>
                <button
                  onClick={handleToggleVacationTriggers}
                  className={`w-12 h-6 rounded-full relative transition-colors p-0.5 ${
                    vacationTriggers.enabled ? 'bg-[#7b5800]' : 'bg-[#d0dddb]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      vacationTriggers.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-[#414847] leading-relaxed mb-6">
                Simulate occupancy with randomized lighting and suspend non-essential climate control.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-[#eaf6f4] p-2.5 rounded-xl text-xs font-semibold text-[#131e1d]">
                <span>Randomize Living Room Lights</span>
                <span className="material-symbols-outlined text-[#7b5800] text-sm filled">
                  check_circle
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#eaf6f4] p-2.5 rounded-xl text-xs font-semibold text-[#131e1d]">
                <span>Suspend Water Heater Scheduling</span>
                <span className="material-symbols-outlined text-[#7b5800] text-sm filled">
                  check_circle
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* House Rules & Philosophy Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d9e5e3] mt-2">
          <div className="flex justify-between items-center border-b border-[#d9e5e3] pb-4 mb-4">
            <h3 className="text-lg font-bold text-[#16302e]">
              House Rules & Philosophy
            </h3>
            <button
              onClick={onOpenAddRuleModal}
              className="text-[#7b5800] hover:underline text-xs font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span> Edit
            </button>
          </div>

          <div className="space-y-4">
            {houseRules.map((rule, idx) => (
              <div key={rule.id} className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-full bg-[#ffca5e] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <span className="text-[#755400] font-black text-xs">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#131e1d]">{rule.title}</h4>
                  <p className="text-xs text-[#414847] leading-relaxed">{rule.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#727877] hover:text-rose-500 transition-opacity p-1"
                  title="Excluir regra"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}

            {/* Add Rule Button */}
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
                Add a new house rule...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Member Management Panel */}
      <div className="lg:col-span-4 bg-[#16302e] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-[#2d4644] min-h-[500px] relative overflow-hidden">
        {/* Subtle background overlay graphic */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbc90CKwQWyJE93sFiR5_Kk-X-8CYswcsFW0GpVUhOuMaHGnF5CyHSC4_Pvjp43ZmjogfClMlFYBCfrb0Y9gJSWFjAkJgjLTybjDTxpvLUWuocKlIFc_nnsXTdWhgLmiLa8HiOOKMT9YjZ-RKPWC7V0LE10FvteDXmXn0LuReYKFLRfodLLFP31AwKxixyraiV1cfmAm9bMlfGmdhi4NHFl3U14K9N4Nco0UwjDlfIaqfjSXOtqcc')",
          }}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Membros da Residência</h3>
              <p className="text-xs text-[#b0ccc9]">Hierarquia e papéis de acesso</p>
            </div>
            {(currentUserRole === 'Admin Geral' || currentUserRole === 'Admin') && (
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
              const isGeneralAdmin = currentUserRole === 'Admin Geral';

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl flex flex-col gap-2 border transition-all ${
                    isTargetGeneralAdmin
                      ? 'bg-[#2d4644] border-[#ffca5e]'
                      : 'bg-[#2d4644]/50 border-transparent hover:border-[#3e4241]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#ffca5e] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{member.name}</p>
                      <p className="text-[11px] text-[#b0ccc9]">{member.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
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

                  {/* Ações Administrativas Exclusivas do Admin Geral */}
                  {isGeneralAdmin && !isTargetGeneralAdmin && (
                    <div className="pt-2 border-t border-[#3d5c5a] flex items-center justify-end gap-1.5 flex-wrap">
                      {isTargetResident && onPromoteToAdmin && (
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

                      {isTargetAdmin && onDemoteToResident && (
                        <button
                          type="button"
                          onClick={() => onDemoteToResident(member.id)}
                          className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Destituir para Residente"
                        >
                          <span className="material-symbols-outlined text-xs">person_remove</span>
                          <span>Destituir p/ Morador</span>
                        </button>
                      )}

                      {onTransferGeneralAdmin && (
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-[#2d4644] flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-[#b0ccc9] gap-2">
          <span>Total de Moradores: {familyMembers.length}</span>
          <div className="flex items-center gap-3">
            {onSwitchHouse && (
              <button
                onClick={onSwitchHouse}
                className="text-[#ffca5e] hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">apartment</span>
                <span>Trocar Residência</span>
              </button>
            )}
            <button
              onClick={onOpenAccessLogsModal}
              className="text-[#98b3b0] hover:text-white hover:underline font-medium"
            >
              Logs de Acesso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
