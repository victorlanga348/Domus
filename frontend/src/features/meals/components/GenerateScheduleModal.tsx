import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember, MealType, DayOfWeek } from '../../../types.js';
import {
  CookingScheduleConfig,
  MEAL_PERIODS,
  DAYS_OF_WEEK,
} from '../types.js';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  savedConfig?: CookingScheduleConfig | null;
  onApplySchedule: (config: CookingScheduleConfig) => void;
}

export const GenerateScheduleModal: React.FC<GenerateScheduleModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  savedConfig,
  onApplySchedule,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Weekday Rotation (Mon-Fri)
  const [selectedWeekdayMemberIds, setSelectedWeekdayMemberIds] = useState<string[]>([]);
  const [selectedWeekdayMeals, setSelectedWeekdayMeals] = useState<MealType[]>(['lunch', 'dinner']);

  // Step 2: Weekend Rule (Sat-Sun)
  const [weekendMode, setWeekendMode] = useState<'fixed' | 'free'>('free');
  const [selectedWeekendMemberIds, setSelectedWeekendMemberIds] = useState<string[]>([]);
  const [selectedWeekendMeals, setSelectedWeekendMeals] = useState<MealType[]>(['lunch', 'dinner']);

  // Initialize from savedConfig or default to all members
  useEffect(() => {
    if (!isOpen) return;

    if (savedConfig) {
      setSelectedWeekdayMemberIds(savedConfig.weekdayPool.map((c) => c.id));
      setSelectedWeekdayMeals(savedConfig.weekdayMeals || ['lunch', 'dinner']);
      setWeekendMode(savedConfig.weekendMode || 'free');
      setSelectedWeekendMemberIds(savedConfig.weekendChefs?.map((c) => c.id) || []);
      setSelectedWeekendMeals(savedConfig.weekendMeals || ['lunch', 'dinner']);
    } else {
      setSelectedWeekdayMemberIds(familyMembers.map((m) => m.id));
      setSelectedWeekdayMeals(['lunch', 'dinner']);
      setWeekendMode('free');
      setSelectedWeekendMemberIds([]);
      setSelectedWeekendMeals(['lunch', 'dinner']);
    }
    setStep(1);
  }, [isOpen, savedConfig, familyMembers]);

  if (!isOpen) return null;

  // Toggle helpers
  const handleToggleWeekdayMember = (memberId: string) => {
    setSelectedWeekdayMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleToggleWeekdayMeal = (meal: MealType) => {
    setSelectedWeekdayMeals((prev) =>
      prev.includes(meal)
        ? prev.length > 1
          ? prev.filter((m) => m !== meal)
          : prev
        : [...prev, meal]
    );
  };

  const handleToggleWeekendMember = (memberId: string) => {
    setSelectedWeekendMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleToggleWeekendMeal = (meal: MealType) => {
    setSelectedWeekendMeals((prev) =>
      prev.includes(meal)
        ? prev.length > 1
          ? prev.filter((m) => m !== meal)
          : prev
        : [...prev, meal]
    );
  };

  // Generate deterministic preview map
  const previewSchedule = useMemo(() => {
    const weekdayDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekendDays: DayOfWeek[] = ['saturday', 'sunday'];

    const poolMembers = familyMembers
      .filter((m) => selectedWeekdayMemberIds.includes(m.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fixedWeekendChefs = familyMembers
      .filter((m) => selectedWeekendMemberIds.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));

    const assignments: {
      day: DayOfWeek;
      dayLabel: string;
      mealType: MealType;
      mealLabel: string;
      chefs: { id: string; name: string; avatar?: string }[];
    }[] = [];

    const statsMap: Record<string, number> = {};
    poolMembers.forEach((m) => {
      statsMap[m.name] = 0;
    });
    if (weekendMode === 'fixed') {
      fixedWeekendChefs.forEach((c) => {
        statsMap[c.name] = (statsMap[c.name] || 0);
      });
    }

    let poolIndex = 0;

    // Weekdays
    weekdayDays.forEach((dayKey) => {
      const dayMeta = DAYS_OF_WEEK.find((d) => d.key === dayKey)!;
      selectedWeekdayMeals.forEach((mealTypeKey) => {
        const mealMeta = MEAL_PERIODS.find((p) => p.type === mealTypeKey)!;
        if (poolMembers.length > 0) {
          const assignedMember = poolMembers[poolIndex % poolMembers.length];
          poolIndex++;
          statsMap[assignedMember.name] = (statsMap[assignedMember.name] || 0) + 1;
          assignments.push({
            day: dayKey,
            dayLabel: dayMeta.shortLabel,
            mealType: mealTypeKey,
            mealLabel: mealMeta.label,
            chefs: [{ id: assignedMember.id, name: assignedMember.name, avatar: assignedMember.avatar }],
          });
        }
      });
    });

    // Weekends
    weekendDays.forEach((dayKey) => {
      const dayMeta = DAYS_OF_WEEK.find((d) => d.key === dayKey)!;
      selectedWeekendMeals.forEach((mealTypeKey) => {
        const mealMeta = MEAL_PERIODS.find((p) => p.type === mealTypeKey)!;
        if (weekendMode === 'fixed' && fixedWeekendChefs.length > 0) {
          fixedWeekendChefs.forEach((c) => {
            statsMap[c.name] = (statsMap[c.name] || 0) + 1;
          });
          assignments.push({
            day: dayKey,
            dayLabel: dayMeta.shortLabel,
            mealType: mealTypeKey,
            mealLabel: mealMeta.label,
            chefs: fixedWeekendChefs,
          });
        } else {
          assignments.push({
            day: dayKey,
            dayLabel: dayMeta.shortLabel,
            mealType: mealTypeKey,
            mealLabel: mealMeta.label,
            chefs: [],
          });
        }
      });
    });

    return { assignments, statsMap };
  }, [
    familyMembers,
    selectedWeekdayMemberIds,
    selectedWeekdayMeals,
    weekendMode,
    selectedWeekendMemberIds,
    selectedWeekendMeals,
  ]);

  const handleApply = () => {
    const weekdayPool = familyMembers
      .filter((m) => selectedWeekdayMemberIds.includes(m.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));

    const weekendChefs =
      weekendMode === 'fixed'
        ? familyMembers
            .filter((m) => selectedWeekendMemberIds.includes(m.id))
            .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }))
        : [];

    const config: CookingScheduleConfig = {
      weekdayPool,
      weekdayMeals: selectedWeekdayMeals,
      weekendMode,
      weekendChefs,
      weekendMeals: selectedWeekendMeals,
      updatedAt: new Date().toISOString(),
    };

    onApplySchedule(config);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#131e1d]/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[#d0dddb] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e4f0ee] flex items-center justify-between bg-[#F4F9F7]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#16302e] text-[#ffca5e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">auto_mode</span>
            </span>
            <div>
              <h3 id="schedule-modal-title" className="text-sm sm:text-base font-black text-[#16302e]">
                Gerar Escala da Semana
              </h3>
              <p className="text-[11px] text-[#727877] font-semibold">
                Passo {step} de 3 —{' '}
                {step === 1
                  ? 'Rodízio Segunda a Sexta'
                  : step === 2
                  ? 'Regra de Fim de Semana'
                  : 'Pré-visualização e Confirmação'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#727877] hover:text-[#16302e] hover:bg-[#e4f0ee] transition-colors flex items-center justify-center focus:outline-none"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Wizard Steps Progress Bar */}
        <div className="w-full bg-[#e4f0ee] h-1.5 flex">
          <div
            className={`h-full bg-[#16302e] transition-all duration-300 ${
              step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
            }`}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: Weekday Rotation */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#f0fcfa] border border-[#d0dddb] rounded-2xl p-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7b5800] text-lg">sync_alt</span>
                  <h4 className="text-xs font-black text-[#16302e]">
                    Rodízio Automático (Segunda a Sexta)
                  </h4>
                </div>
                <p className="text-[11px] text-[#727877] font-medium mt-1">
                  O sistema distribui os turnos de forma equilibrada entre os moradores selecionados.
                </p>
              </div>

              {/* Members Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-[#16302e]">
                    Quem entra no rodízio de seg-sex? ({selectedWeekdayMemberIds.length} selecionados)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedWeekdayMemberIds.length === familyMembers.length) {
                        setSelectedWeekdayMemberIds([]);
                      } else {
                        setSelectedWeekdayMemberIds(familyMembers.map((m) => m.id));
                      }
                    }}
                    className="text-[11px] font-bold text-[#7b5800] hover:underline"
                  >
                    {selectedWeekdayMemberIds.length === familyMembers.length
                      ? 'Desmarcar todos'
                      : 'Selecionar todos'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-[#f0fcfa] rounded-xl border border-[#d0dddb]">
                  {familyMembers.map((m) => {
                    const isSelected = selectedWeekdayMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleWeekdayMember(m.id)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all min-h-[44px] cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#16302e] ring-1 ring-[#16302e] shadow-xs'
                            : 'bg-white/60 border-transparent hover:bg-white hover:border-[#d0dddb]'
                        }`}
                      >
                        {m.avatar ? (
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#d0dddb] shrink-0"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-[#16302e] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#16302e] truncate">{m.name}</p>
                          <p className="text-[10px] text-[#727877] font-medium truncate">{m.role}</p>
                        </div>
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[11px] shrink-0 ${
                            isSelected
                              ? 'bg-[#16302e] text-[#ffca5e]'
                              : 'border border-[#d0dddb] text-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">check</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals to include */}
              <div>
                <label className="block text-xs font-black text-[#16302e] mb-1.5">
                  Quais refeições entram no rodízio útil?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_PERIODS.map((period) => {
                    const isSelected = selectedWeekdayMeals.includes(period.type);
                    return (
                      <button
                        key={period.type}
                        type="button"
                        onClick={() => handleToggleWeekdayMeal(period.type)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all min-h-[44px] cursor-pointer ${
                          isSelected
                            ? 'bg-[#16302e] text-white border-[#16302e] shadow-xs'
                            : 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb] hover:border-[#98b3b0]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{period.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{period.label}</p>
                          <p
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-[#ffca5e]' : 'text-[#727877]'
                            }`}
                          >
                            {period.timeRange}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Weekend Rule */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#f0fcfa] border border-[#d0dddb] rounded-2xl p-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7b5800] text-lg">weekend</span>
                  <h4 className="text-xs font-black text-[#16302e]">
                    Regra do Fim de Semana (Sábado e Domingo)
                  </h4>
                </div>
                <p className="text-[11px] text-[#727877] font-medium mt-1">
                  Defina se a cozinha é livre ou se há cozinheiro(s) fixo(s) aos sábados e domingos.
                </p>
              </div>

              {/* Mode Selection Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWeekendMode('free')}
                  className={`p-3.5 rounded-2xl border text-left transition-all min-h-[70px] cursor-pointer flex items-start gap-3 ${
                    weekendMode === 'free'
                      ? 'bg-[#16302e] text-white border-[#16302e] shadow-xs ring-2 ring-[#16302e]'
                      : 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb] hover:border-[#98b3b0]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mt-0.5">sentiment_satisfied</span>
                  <div>
                    <h5 className="text-xs font-black">Livre / Cada um por si</h5>
                    <p
                      className={`text-[11px] font-medium mt-0.5 ${
                        weekendMode === 'free' ? 'text-[#d0dddb]' : 'text-[#727877]'
                      }`}
                    >
                      Nenhum cozinheiro fixo. Refeições ficam livres para quem quiser cozinhar.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWeekendMode('fixed')}
                  className={`p-3.5 rounded-2xl border text-left transition-all min-h-[70px] cursor-pointer flex items-start gap-3 ${
                    weekendMode === 'fixed'
                      ? 'bg-[#16302e] text-white border-[#16302e] shadow-xs ring-2 ring-[#16302e]'
                      : 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb] hover:border-[#98b3b0]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mt-0.5">person_pin</span>
                  <div>
                    <h5 className="text-xs font-black">Pessoa(s) Fixa(s)</h5>
                    <p
                      className={`text-[11px] font-medium mt-0.5 ${
                        weekendMode === 'fixed' ? 'text-[#d0dddb]' : 'text-[#727877]'
                      }`}
                    >
                      Atribui pessoa(s) específica(s) como responsável(is) do fim de semana.
                    </p>
                  </div>
                </button>
              </div>

              {/* If Fixed Mode: Select Weekend Cooks */}
              {weekendMode === 'fixed' && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black text-[#16302e]">
                    Selecione quem cozinha no Fim de Semana:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-[#f0fcfa] rounded-xl border border-[#d0dddb]">
                    {familyMembers.map((m) => {
                      const isSelected = selectedWeekendMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleWeekendMember(m.id)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all min-h-[44px] cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#16302e] ring-1 ring-[#16302e] shadow-xs'
                              : 'bg-white/60 border-transparent hover:bg-white hover:border-[#d0dddb]'
                          }`}
                        >
                          {m.avatar ? (
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#d0dddb] shrink-0"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-[#16302e] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                              {m.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#16302e] truncate">{m.name}</p>
                            <p className="text-[10px] text-[#727877] font-medium truncate">{m.role}</p>
                          </div>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[11px] shrink-0 ${
                              isSelected
                                ? 'bg-[#16302e] text-[#ffca5e]'
                                : 'border border-[#d0dddb] text-transparent'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">check</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview & Confirm */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#fff8e6] border border-[#ffca5e] text-[#7b5800] rounded-2xl p-3.5 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">info</span>
                <div>
                  <h4 className="text-xs font-black">Pratos e Informações Preservados</h4>
                  <p className="text-[11px] font-medium mt-0.5">
                    Os pratos que já cadastrou <strong>não serão apagados</strong>. Apenas os cozinheiros responsáveis serão preenchidos de acordo com a escala abaixo.
                  </p>
                </div>
              </div>

              {/* Equilíbrio / Stats */}
              <div className="bg-[#f0fcfa] border border-[#d0dddb] rounded-2xl p-3">
                <h5 className="text-xs font-black text-[#16302e] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#7b5800]">equalizer</span>
                  <span>Distribuição de Turnos na Semana</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewSchedule.statsMap).map(([name, count]) => (
                    <span
                      key={name}
                      className="text-xs font-bold bg-white text-[#16302e] px-2.5 py-1 rounded-lg border border-[#d0dddb] flex items-center gap-1.5"
                    >
                      <span>{name}:</span>
                      <span className="text-[#7b5800] font-black">{count}x</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-[#d0dddb] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F4F9F7] border-b border-[#e4f0ee] sticky top-0">
                    <tr>
                      <th className="p-2.5 font-black text-[#16302e]">Dia</th>
                      <th className="p-2.5 font-black text-[#16302e]">Refeição</th>
                      <th className="p-2.5 font-black text-[#16302e]">Cozinheiro(s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4f3]">
                    {previewSchedule.assignments.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#f0fcfa]">
                        <td className="p-2.5 font-bold text-[#16302e]">{item.dayLabel}</td>
                        <td className="p-2.5 font-semibold text-[#727877]">{item.mealLabel}</td>
                        <td className="p-2.5">
                          {item.chefs.length > 0 ? (
                            <span className="font-bold text-[#16302e] flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-[#7b5800]">
                                skillet
                              </span>
                              <span>{item.chefs.map((c) => c.name).join(', ')}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#98b3b0] italic">Livre</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-[#e4f0ee] flex items-center justify-between gap-2 bg-[#F4F9F7]">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#e4f0ee] transition-colors min-h-[44px] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Voltar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#e4f0ee] transition-colors min-h-[44px] cursor-pointer"
            >
              Cancelar
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && selectedWeekdayMemberIds.length === 0}
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center gap-1 cursor-pointer"
              >
                <span>Próximo Passo</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#7b5800] text-white hover:bg-[#604400] transition-colors shadow-xs min-h-[44px] flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Aplicar Escala no Cardápio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
