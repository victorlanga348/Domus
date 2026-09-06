import React, { useState, useEffect } from 'react';
import { MealType, MealPeriodSchedule } from '../../../types.js';
import { DEFAULT_MEAL_SCHEDULES } from '../types.js';
import { useBodyScrollLock } from '../../../shared/hooks/index.js';

interface EditMealSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules?: Record<MealType, MealPeriodSchedule>;
  onSave: (newSchedules: Record<MealType, MealPeriodSchedule>) => void;
}

interface PeriodConfigItem {
  type: MealType;
  label: string;
  icon: string;
  badgeColor: string;
  defaultTime: string;
}

const PERIOD_CONFIGS: PeriodConfigItem[] = [
  {
    type: 'breakfast',
    label: 'Café da Manhã',
    icon: 'wb_twilight',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    defaultTime: '06:00 - 10:00',
  },
  {
    type: 'lunch',
    label: 'Almoço',
    icon: 'sunny',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    defaultTime: '11:30 - 14:30',
  },
  {
    type: 'snack',
    label: 'Lanche / Sobremesa',
    icon: 'bakery_dining',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    defaultTime: '15:30 - 18:00',
  },
  {
    type: 'dinner',
    label: 'Jantar',
    icon: 'dark_mode',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    defaultTime: '19:00 - 22:30',
  },
];

export const EditMealSchedulesModal: React.FC<EditMealSchedulesModalProps> = ({
  isOpen,
  onClose,
  schedules,
  onSave,
}) => {
  useBodyScrollLock(isOpen);

  const [formSchedules, setFormSchedules] = useState<Record<MealType, MealPeriodSchedule>>({
    ...DEFAULT_MEAL_SCHEDULES,
    ...(schedules || {}),
  });

  useEffect(() => {
    if (isOpen) {
      setFormSchedules({
        ...DEFAULT_MEAL_SCHEDULES,
        ...(schedules || {}),
      });
    }
  }, [isOpen, schedules]);

  if (!isOpen) return null;

  const handleChangeTime = (type: MealType, field: 'startTime' | 'endTime', value: string) => {
    setFormSchedules((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    setFormSchedules(DEFAULT_MEAL_SCHEDULES);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formSchedules);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#131e1d]/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#d0dddb] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixo no Topo) */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-[#e4f0ee] flex items-center justify-between bg-[#F4F9F7] shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#16302e] text-[#ffca5e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-lg">schedule</span>
            </span>
            <div className="min-w-0">
              <h3 id="schedule-modal-title" className="text-xs sm:text-base font-black text-[#16302e] truncate">
                Ajustar Horários das Refeições
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#727877] font-semibold truncate">
                Personalize os turnos de alimentação da casa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[#727877] hover:text-[#16302e] hover:bg-[#e4f0ee] transition-colors flex items-center justify-center focus:outline-none shrink-0 cursor-pointer"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">close</span>
          </button>
        </div>

        {/* Content Form Wrapper */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Body */}
          <div className="p-3 sm:p-5 overflow-y-auto overscroll-contain space-y-2.5 sm:space-y-3.5 flex-1 [scrollbar-width:thin]">
            <div className="bg-[#f0fcfa] border border-[#d0dddb] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-start gap-2 sm:gap-2.5">
              <span className="material-symbols-outlined text-base text-[#7b5800] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-[10px] sm:text-xs text-[#727877] font-medium leading-relaxed">
                Defina os intervalos de início e término de cada refeição. Estes horários aparecerão em todos os cartões do cardápio semanal.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {PERIOD_CONFIGS.map((period) => {
                const currentSchedule = formSchedules[period.type] || DEFAULT_MEAL_SCHEDULES[period.type];
                return (
                  <div
                    key={period.type}
                    className="bg-white border border-[#d9e5e3] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xs space-y-2 sm:space-y-2.5 w-full overflow-hidden box-border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border text-xs shrink-0 ${period.badgeColor}`}
                      >
                        <span className="material-symbols-outlined text-sm">{period.icon}</span>
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-[#16302e] truncate">
                        {period.label}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full min-w-0 pt-0.5">
                      <div className="w-full min-w-0 max-w-full overflow-hidden box-border">
                        <label className="block text-[10px] sm:text-[11px] font-bold text-[#727877] mb-0.5 sm:mb-1 truncate">
                          Início
                        </label>
                        <input
                          type="time"
                          required
                          value={currentSchedule.startTime}
                          onChange={(e) => handleChangeTime(period.type, 'startTime', e.target.value)}
                          className="w-full min-w-0 max-w-[90%] box-border h-8 sm:h-10 px-1 sm:px-3 py-1 sm:py-2 text-center text-[11px] sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl border border-teal-100 bg-teal-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500 text-[#16302e] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-75 sm:[&::-webkit-calendar-picker-indicator]:scale-100"
                        />
                      </div>

                      <div className="w-full min-w-0 max-w-full overflow-hidden box-border">
                        <label className="block text-[10px] sm:text-[11px] font-bold text-[#727877] mb-0.5 sm:mb-1 truncate">
                          Término
                        </label>
                        <input
                          type="time"
                          required
                          value={currentSchedule.endTime}
                          onChange={(e) => handleChangeTime(period.type, 'endTime', e.target.value)}
                          className="w-full min-w-0 max-w-[90%] box-border h-8 sm:h-10 px-1 sm:px-3 py-1 sm:py-2 text-center text-[11px] sm:text-sm font-medium sm:font-semibold rounded-lg sm:rounded-xl border border-teal-100 bg-teal-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500 text-[#16302e] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-75 sm:[&::-webkit-calendar-picker-indicator]:scale-100"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] sm:text-xs font-bold text-[#7b5800] hover:underline flex items-center gap-1 cursor-pointer py-1"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Restaurar horários padrão</span>
              </button>
            </div>
          </div>

          {/* Actions Footer (Fixo na Base, Sem Cortes) */}
          <div className="p-3.5 sm:p-4 border-t border-[#e4f0ee] bg-white flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#f0fcfa] transition-colors min-h-[44px] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] transition-colors shadow-xs flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Salvar Horários</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
