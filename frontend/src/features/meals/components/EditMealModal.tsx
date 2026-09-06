import React, { useState, useEffect, useMemo } from 'react';
import { MealItem, DayOfWeek, MealType, MealPeriodSchedule } from '../../../types.js';
import { getMealPeriods, DAYS_OF_WEEK, AVAILABLE_DIET_TAGS } from '../types.js';
import { useBodyScrollLock } from '../../../shared/hooks/index.js';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: MealItem) => void;
  onDelete?: (mealId: string) => void;
  initialMeal?: MealItem | null;
  defaultDay: DayOfWeek;
  defaultPeriod: MealType;
  schedules?: Record<MealType, MealPeriodSchedule>;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialMeal,
  defaultDay,
  defaultPeriod,
  schedules,
}) => {
  useBodyScrollLock(isOpen);

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [mealType, setMealType] = useState<MealType>(defaultPeriod);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const mealPeriods = useMemo(() => getMealPeriods(schedules), [schedules]);

  useEffect(() => {
    if (initialMeal) {
      setDayOfWeek(initialMeal.dayOfWeek);
      setMealType(initialMeal.mealType);
      setTitle(initialMeal.title);
      setDescription(initialMeal.description || '');
      setSelectedTags(initialMeal.tags || []);
    } else {
      setDayOfWeek(defaultDay);
      setMealType(defaultPeriod);
      setTitle('');
      setDescription('');
      setSelectedTags([]);
    }
  }, [initialMeal, defaultDay, defaultPeriod, isOpen]);

  if (!isOpen) return null;

  const handleTagToggle = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedMeal: MealItem = {
      id: initialMeal?.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dayOfWeek,
      mealType,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: selectedTags,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedMeal);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#131e1d]/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-meal-title"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#d0dddb] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixo no Topo) */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#e4f0ee] flex items-center justify-between bg-[#F4F9F7] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#16302e] text-[#ffca5e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            </span>
            <div className="min-w-0">
              <h3 id="modal-meal-title" className="text-sm sm:text-base font-black text-[#16302e] truncate">
                {initialMeal ? 'Editar Refeição' : 'Adicionar ao Cardápio'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#727877] font-semibold truncate">
                Planejamento alimentar da casa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#727877] hover:text-[#16302e] hover:bg-[#e4f0ee] transition-colors flex items-center justify-center focus:outline-none shrink-0 cursor-pointer"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3.5 flex-1 [scrollbar-width:thin]">
            {/* Day and Meal Type Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <label className="block text-[11px] sm:text-xs font-black text-[#16302e] mb-1 truncate">
                  Dia da Semana
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                  className="w-full min-w-0 max-w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#16302e]"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.fullLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] sm:text-xs font-black text-[#16302e] mb-1 truncate">
                  Horário / Turno
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full min-w-0 max-w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#16302e]"
                >
                  {mealPeriods.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.label} ({p.timeRange})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meal Title */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black text-[#16302e] mb-1">
                Prato / Nome da Refeição <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Strogonoff de Frango com Arroz e Batata Palha"
                className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16302e] placeholder:text-[#98b3b0]"
              />
            </div>

            {/* Description & Ingredients */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black text-[#16302e] mb-1">
                Ingredientes / Detalhes / Observações
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Usar cogumelos frescos, verificar se temos creme de leite na despensa."
                className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#16302e] placeholder:text-[#98b3b0]"
              />
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black text-[#16302e] mb-1">
                Tags & Restrições Dietéticas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_DIET_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleTagToggle(tag.label)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer min-h-[34px] ${
                        isSelected
                          ? 'bg-[#16302e] text-white border-[#16302e] shadow-xs'
                          : 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb] hover:border-[#98b3b0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{tag.icon}</span>
                      <span>{tag.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions Footer (Fixo na Base, Sem Cortes) */}
          <div className="p-3.5 sm:p-4 border-t border-[#e4f0ee] bg-white flex items-center justify-between gap-2 shrink-0">
            <div>
              {initialMeal && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialMeal.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 min-h-[44px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>Excluir</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#f0fcfa] transition-colors min-h-[44px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-h-[44px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">check</span>
                <span>Salvar Prato</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
