import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { MealItem, DayOfWeek, MealType } from '../../../types.js';
import {
  MealsViewProps,
  DAYS_OF_WEEK,
  getMealPeriods,
} from '../types.js';
import { MealCard } from './MealCard.js';
import { EditMealModal } from './EditMealModal.js';
import { EditMealSchedulesModal } from './EditMealSchedulesModal.js';
import { useBodyScrollLock } from '../../../shared/hooks/index.js';

export const MealsView: React.FC<MealsViewProps> = ({
  mealPlan,
  currentUserRole,
  onUpdateMeal,
  onDeleteMeal,
  onToggleLock,
  onClearMeals,
  onUpdateSchedules,
}) => {
  // Determine current day of week as initial selection
  const currentDayIndex = new Date().getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
  const initialDayKey: DayOfWeek =
    currentDayIndex === 0
      ? 'sunday'
      : currentDayIndex === 1
      ? 'monday'
      : currentDayIndex === 2
      ? 'tuesday'
      : currentDayIndex === 3
      ? 'wednesday'
      : currentDayIndex === 4
      ? 'thursday'
      : currentDayIndex === 5
      ? 'friday'
      : 'saturday';

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDayKey);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSchedulesModalOpen, setIsSchedulesModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);
  const [modalDay, setModalDay] = useState<DayOfWeek>(selectedDay);
  const [modalPeriod, setModalPeriod] = useState<MealType>('breakfast');

  // Prevent background scrolling when confirmation dialog is open
  useBodyScrollLock(isClearConfirmOpen);

  // Role permissions
  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const isLocked = Boolean(mealPlan.isLocked);
  const canEdit = isGeneralAdmin || (isAdmin && !isLocked);

  // Dynamic meal periods based on custom schedules
  const mealPeriods = useMemo(
    () => getMealPeriods(mealPlan.schedules),
    [mealPlan.schedules]
  );

  // Group meals by day and period
  const mealsByDayAndPeriod = useMemo(() => {
    const map = new Map<string, MealItem>();
    (mealPlan.meals || []).forEach((m) => {
      if (m.title && m.title.trim()) {
        map.set(`${m.dayOfWeek}_${m.mealType}`, m);
      }
    });
    return map;
  }, [mealPlan.meals]);

  // Count planned meals per day
  const mealCountPerDay = useMemo(() => {
    const countMap: Record<DayOfWeek, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };
    (mealPlan.meals || []).forEach((m) => {
      if (m.title && m.title.trim()) {
        countMap[m.dayOfWeek] = (countMap[m.dayOfWeek] || 0) + 1;
      }
    });
    return countMap;
  }, [mealPlan.meals]);

  const handleOpenAddMeal = (day: DayOfWeek, period: MealType) => {
    if (!canEdit) return;
    setEditingMeal(null);
    setModalDay(day);
    setModalPeriod(period);
    setIsModalOpen(true);
  };

  const handleOpenEditMeal = (meal: MealItem) => {
    if (!canEdit) return;
    setEditingMeal(meal);
    setModalDay(meal.dayOfWeek);
    setModalPeriod(meal.mealType);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Banner: Global Lock Warning */}
      {isLocked && (
        <div className="bg-[#fff8e6] border border-[#ffca5e] text-[#7b5800] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#ffca5e]/30 border border-[#ffca5e] flex items-center justify-center text-[#7b5800] shrink-0">
              <span className="material-symbols-outlined text-xl">lock</span>
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#16302e]">
                Cardápio Trancado pelo Administrador Geral
              </h4>
              <p className="text-[11px] text-[#727877] font-semibold mt-0.5">
                {mealPlan.lockedByName
                  ? `Trancado por ${mealPlan.lockedByName}. Somente o Admin Geral pode realizar alterações.`
                  : 'O planejamento semanal está fechado para edições regulares.'}
              </p>
            </div>
          </div>

          {/* Admin Geral Quick Unlock Action */}
          {isGeneralAdmin && (
            <button
              onClick={onToggleLock}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 min-h-[40px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              <span>Destrancar Cardápio</span>
            </button>
          )}
        </div>
      )}

      {/* Main Header & Controls */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#d9e5e3] p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">restaurant</span>
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-[#16302e] tracking-tight">
              Cardápio da Casa
            </h2>
          </div>
          <p className="text-xs text-[#727877] font-semibold mt-1">
            Planejamento alimentar compartilhado, turnos e restrições dietéticas
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Switcher (Desktop & Tablet) */}
          <div className="hidden sm:flex bg-[#f0fcfa] p-1 rounded-xl border border-[#d0dddb] items-center">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.97] ${
                viewMode === 'daily'
                  ? 'bg-white text-[#16302e] shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_view_day</span>
              <span>Visão Diária</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.97] ${
                viewMode === 'weekly'
                  ? 'bg-white text-[#16302e] shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_view_week</span>
              <span>Visão Semanal</span>
            </button>
          </div>

          {/* Adjust Schedules Button (Available for Admin Geral and Sub-Admin when unlocked) */}
          {canEdit && onUpdateSchedules && (
            <button
              onClick={() => setIsSchedulesModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#f0fcfa] text-[#16302e] hover:bg-[#e4f0ee] active:scale-[0.97] transition-all flex items-center gap-1.5 border border-[#d0dddb] min-h-[40px] cursor-pointer"
              title="Ajustar horários de início e término das refeições"
            >
              <span className="material-symbols-outlined text-base text-[#7b5800]">schedule</span>
              <span>Ajustar Horários</span>
            </button>
          )}

          {/* Lock / Unlock Trigger for General Admin */}
          {isGeneralAdmin && (
            <button
              onClick={onToggleLock}
              className={`px-3.5 py-2 rounded-xl text-xs font-black active:scale-[0.97] transition-all flex items-center gap-1.5 border min-h-[40px] cursor-pointer ${
                isLocked
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb] hover:bg-[#e4f0ee]'
              }`}
              title={isLocked ? 'Destrancar Cardápio' : 'Trancar Cardápio contra edições'}
            >
              <span className="material-symbols-outlined text-base">
                {isLocked ? 'lock_open' : 'lock'}
              </span>
              <span>{isLocked ? 'Destrancar' : 'Trancar Cardápio'}</span>
            </button>
          )}

          {/* Clear Menu Action (Available when meals exist and user has edit rights) */}
          {canEdit && (mealPlan.meals?.length || 0) > 0 && onClearMeals && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.97] transition-all flex items-center gap-1.5 border border-red-200 min-h-[40px] cursor-pointer"
              title="Esvaziar todos os pratos cadastrados da semana"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              <span className="hidden sm:inline">Limpar Cardápio</span>
            </button>
          )}

          {/* Status Chip for Resident when unlocked */}
          {!canEdit && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0fcfa] text-[#727877] border border-[#d0dddb] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">visibility</span>
              <span>Somente leitura</span>
            </span>
          )}
        </div>
      </div>

      {/* DAYS OF THE WEEK SELECTOR (Always visible on mobile, and visible in Daily mode on tablet/desktop) */}
      {(viewMode === 'daily' || window.innerWidth < 640) && (
        <div className="w-full">
          {/* Mobile Horizontal Carousel / Desktop Button Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-7">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day.key;
              const isToday = day.key === initialDayKey;
              const count = mealCountPerDay[day.key] || 0;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-[0.96] shrink-0 min-w-[76px] sm:min-w-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16302e] text-[#ffca5e] border-[#16302e] shadow-md scale-100'
                      : 'bg-white text-[#16302e] border-[#d9e5e3] hover:border-[#98b3b0] hover:bg-[#f0fcfa]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {day.shortLabel}
                    </span>
                    {isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#ffca5e]' : 'bg-[#7b5800]'
                        }`}
                        title="Hoje"
                      />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : count > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-[#98b3b0]'
                    }`}
                  >
                    {count} {count === 1 ? 'prato' : 'pratos'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY VIEW CONTENT: 4 Periods Grid */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#16302e] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#7b5800]">calendar_today</span>
              <span>
                {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.fullLabel}
              </span>
              {selectedDay === initialDayKey && (
                <span className="text-[10px] font-extrabold uppercase bg-[#fff8e6] text-[#7b5800] px-2 py-0.5 rounded-md border border-[#ffca5e]/60">
                  Hoje
                </span>
              )}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {mealPeriods.map((period, index) => {
              const meal = mealsByDayAndPeriod.get(`${selectedDay}_${period.type}`);
              return (
                <motion.div
                  key={period.type}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04, ease: 'easeOut' }}
                  className="h-full flex flex-col"
                >
                  <MealCard
                    periodMeta={period}
                    meal={meal}
                    canEdit={canEdit}
                    isLocked={isLocked}
                    isSubAdmin={isAdmin}
                    onEdit={() => {
                      if (meal) handleOpenEditMeal(meal);
                      else handleOpenAddMeal(selectedDay, period.type);
                    }}
                    onEditSchedule={() => setIsSchedulesModalOpen(true)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKLY KANBAN VIEW (Desktop / Tablet Panorâmico) */}
      {viewMode === 'weekly' && (
        <div className="hidden sm:block space-y-4">
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-7 gap-3 min-w-[980px]">
              {DAYS_OF_WEEK.map((day) => {
                const isToday = day.key === initialDayKey;
                return (
                  <div
                    key={day.key}
                    className={`rounded-2xl border p-3 flex flex-col gap-3 ${
                      isToday
                        ? 'bg-[#F4F9F7] border-[#16302e] shadow-xs'
                        : 'bg-white border-[#d9e5e3]'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="flex items-center justify-between border-b border-[#e4f0ee] pb-2">
                      <div>
                        <span className="text-xs font-black text-[#16302e]">
                          {day.fullLabel}
                        </span>
                        {isToday && (
                          <span className="block text-[10px] font-bold text-[#7b5800]">
                            Hoje
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#f0fcfa] text-[#16302e] border border-[#d0dddb]">
                        {mealCountPerDay[day.key] || 0}
                      </span>
                    </div>

                    {/* Meal Cards for this Day */}
                    <div className="space-y-2.5 flex-1">
                      {mealPeriods.map((period) => {
                        const meal = mealsByDayAndPeriod.get(`${day.key}_${period.type}`);
                        return (
                          <MealCard
                            key={period.type}
                            periodMeta={period}
                            meal={meal}
                            canEdit={canEdit}
                            isLocked={isLocked}
                            isSubAdmin={isAdmin}
                            compact
                            onEdit={() => {
                              if (meal) handleOpenEditMeal(meal);
                              else handleOpenAddMeal(day.key, period.type);
                            }}
                            onEditSchedule={() => setIsSchedulesModalOpen(true)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Meal Modal */}
      {isModalOpen && (
        <EditMealModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(saved) => {
            onUpdateMeal(saved);
          }}
          onDelete={onDeleteMeal}
          initialMeal={editingMeal}
          defaultDay={modalDay}
          defaultPeriod={modalPeriod}
          lockPeriod={true}
          schedules={mealPlan.schedules}
        />
      )}

      {/* Edit Schedules Modal */}
      {isSchedulesModalOpen && onUpdateSchedules && (
        <EditMealSchedulesModal
          isOpen={isSchedulesModalOpen}
          onClose={() => setIsSchedulesModalOpen(false)}
          schedules={mealPlan.schedules}
          onSave={onUpdateSchedules}
        />
      )}

      {/* Clear Confirmation Modal */}
      {isClearConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131e1d]/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#d0dddb] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-200">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#16302e]">
                  Esvaziar Cardápio?
                </h3>
                <p className="text-[11px] text-[#727877] font-semibold">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-xs text-[#727877] leading-relaxed">
              Tem certeza que deseja remover todos os pratos cadastrados para a semana? O cardápio ficará completamente vazio, pronto para um novo planejamento.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#f0fcfa] transition-colors min-h-[40px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMeals?.();
                  setIsClearConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5 min-h-[40px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                <span>Sim, Esvaziar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
