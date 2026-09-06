import React, { useState, useMemo } from 'react';
import { MealItem, DayOfWeek, MealType } from '../../../types.js';
import {
  MealsViewProps,
  DAYS_OF_WEEK,
  MEAL_PERIODS,
} from '../types.js';
import { MealCard } from './MealCard.js';
import { EditMealModal } from './EditMealModal.js';

export const MealsView: React.FC<MealsViewProps> = ({
  mealPlan,
  familyMembers,
  currentUserRole,
  onUpdateMeal,
  onDeleteMeal,
  onToggleLock,
  onClearMeals,
}) => {
  // Determine current day of week as initial selection
  const currentDayIndex = new Date().getDay(); // 0 = Dom, 1 = Seg, ...
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
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);
  const [modalDay, setModalDay] = useState<DayOfWeek>(selectedDay);
  const [modalPeriod, setModalPeriod] = useState<MealType>('breakfast');

  // Role permissions
  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const isLocked = Boolean(mealPlan.isLocked);
  const canEdit = isGeneralAdmin || (isAdmin && !isLocked);

  // Group meals by day and period
  const mealsByDayAndPeriod = useMemo(() => {
    const map = new Map<string, MealItem>();
    (mealPlan.meals || []).forEach((m) => {
      map.set(`${m.dayOfWeek}_${m.mealType}`, m);
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
      if (m.title.trim()) {
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
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 min-h-[40px]"
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
            Planejamento alimentar semanal, restrições e cozinheiros responsáveis
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Switcher (Desktop & Tablet) */}
          <div className="hidden sm:flex bg-[#f0fcfa] p-1 rounded-xl border border-[#d0dddb] items-center">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white text-[#16302e] shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_view_week</span>
              <span>Visão Semanal</span>
            </button>
          </div>

          {/* Lock / Unlock Trigger for General Admin */}
          {isGeneralAdmin && (
            <button
              onClick={onToggleLock}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border min-h-[40px] ${
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
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200 min-h-[40px] cursor-pointer"
              title="Esvaziar todos os pratos cadastrados da semana"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              <span className="hidden sm:inline">Limpar Cardápio</span>
            </button>
          )}

          {/* Status Chip for Resident / SubAdmin when unlocked */}
          {!isGeneralAdmin && !isLocked && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0fcfa] text-[#16302e] border border-[#d0dddb] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Aberto para sugestões</span>
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
              const count = mealCountPerDay[day.key] || 0;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`min-w-[76px] sm:min-w-0 p-2.5 sm:p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[56px] ${
                    isSelected
                      ? 'bg-[#16302e] text-white border-[#16302e] shadow-sm ring-2 ring-[#16302e]/20'
                      : 'bg-white text-[#16302e] border-[#d9e5e3] hover:border-[#98b3b0]'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${day.fullLabel} (${count} refeições)`}
                >
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
                    {day.shortLabel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#ffca5e] text-[#16302e]'
                        : count > 0
                        ? 'bg-[#f0fcfa] text-[#7b5800] border border-[#d0dddb]'
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

      {/* VIEW MODE 1: VISÃO DIÁRIA */}
      {viewMode === 'daily' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black text-[#16302e] flex items-center gap-2">
              <span>{DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.fullLabel}</span>
              <span className="text-xs font-semibold text-[#727877]">
                ({mealCountPerDay[selectedDay] || 0}/4 refeições definidas)
              </span>
            </h3>

            {canEdit && (
              <button
                onClick={() => handleOpenAddMeal(selectedDay, 'lunch')}
                className="text-xs font-bold text-[#7b5800] hover:text-[#5a4000] flex items-center gap-1 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Adicionar Prato</span>
              </button>
            )}
          </div>

          {/* Grid of 4 Daily Periods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {MEAL_PERIODS.map((period) => {
              const meal = mealsByDayAndPeriod.get(`${selectedDay}_${period.type}`);

              return (
                <MealCard
                  key={period.type}
                  periodMeta={period}
                  meal={meal}
                  canEdit={canEdit}
                  isLocked={isLocked}
                  isSubAdmin={isAdmin}
                  onEdit={() => {
                    if (meal) {
                      handleOpenEditMeal(meal);
                    } else {
                      handleOpenAddMeal(selectedDay, period.type);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: VISÃO SEMANAL (PANORÂMICA KANBAN 7 DIAS) */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black text-[#16302e]">
              Grade Panorâmica da Semana
            </h3>
            <span className="text-xs text-[#727877] font-semibold">
              7 dias • Ideal para planejamento de compras
            </span>
          </div>

          {/* 7 Columns Container with smooth scroll if needed */}
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <div className="grid grid-cols-7 gap-3 min-w-[1050px]">
              {DAYS_OF_WEEK.map((day) => {
                const count = mealCountPerDay[day.key] || 0;
                return (
                  <div
                    key={day.key}
                    className="bg-[#f0fcfa]/60 rounded-2xl border border-[#d9e5e3] p-2.5 flex flex-col gap-2.5"
                  >
                    {/* Day Column Header */}
                    <div className="bg-white p-2 rounded-xl border border-[#d9e5e3] text-center">
                      <h4 className="text-xs font-black text-[#16302e]">
                        {day.shortLabel}
                      </h4>
                      <span className="text-[10px] font-bold text-[#727877]">
                        {count} de 4
                      </span>
                    </div>

                    {/* Column Meal Cards */}
                    <div className="flex flex-col gap-2">
                      {MEAL_PERIODS.map((period) => {
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
                              if (meal) {
                                handleOpenEditMeal(meal);
                              } else {
                                handleOpenAddMeal(day.key, period.type);
                              }
                            }}
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

      {/* Edit / Create Meal Modal */}
      <EditMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onUpdateMeal}
        onDelete={onDeleteMeal}
        initialMeal={editingMeal}
        defaultDay={modalDay}
        defaultPeriod={modalPeriod}
        familyMembers={familyMembers}
      />

      {/* Clear Menu Confirmation Modal */}
      {isClearConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131e1d]/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl border border-[#d0dddb] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
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
