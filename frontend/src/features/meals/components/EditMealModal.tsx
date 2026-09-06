import React, { useState, useEffect } from 'react';
import { MealItem, DayOfWeek, MealType, FamilyMember } from '../../../types.js';
import { MEAL_PERIODS, DAYS_OF_WEEK, AVAILABLE_DIET_TAGS } from '../types.js';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: MealItem) => void;
  onDelete?: (mealId: string) => void;
  initialMeal?: MealItem | null;
  defaultDay: DayOfWeek;
  defaultPeriod: MealType;
  familyMembers: FamilyMember[];
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialMeal,
  defaultDay,
  defaultPeriod,
  familyMembers,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [mealType, setMealType] = useState<MealType>(defaultPeriod);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChefId, setSelectedChefId] = useState<string>('');

  useEffect(() => {
    if (initialMeal) {
      setDayOfWeek(initialMeal.dayOfWeek);
      setMealType(initialMeal.mealType);
      setTitle(initialMeal.title);
      setDescription(initialMeal.description || '');
      setSelectedTags(initialMeal.tags || []);
      setSelectedChefId(initialMeal.chefId || '');
    } else {
      setDayOfWeek(defaultDay);
      setMealType(defaultPeriod);
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setSelectedChefId('');
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

    const assignedChef = familyMembers.find((m) => m.id === selectedChefId);

    const updatedMeal: MealItem = {
      id: initialMeal?.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dayOfWeek,
      mealType,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: selectedTags,
      chefId: assignedChef?.id,
      chefName: assignedChef?.name,
      chefAvatar: assignedChef?.avatar,
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
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#d0dddb] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e4f0ee] flex items-center justify-between bg-[#F4F9F7]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#16302e] text-[#ffca5e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            </span>
            <div>
              <h3 id="modal-meal-title" className="text-sm sm:text-base font-black text-[#16302e]">
                {initialMeal ? 'Editar Refeição' : 'Adicionar ao Cardápio'}
              </h3>
              <p className="text-[11px] text-[#727877] font-semibold">
                Planejamento alimentar compartilhado
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Day and Meal Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#16302e] mb-1.5">
                Dia da Semana
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#16302e]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.fullLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#16302e] mb-1.5">
                Horário / Turno
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#16302e]"
              >
                {MEAL_PERIODS.map((p) => (
                  <option key={p.type} value={p.type}>
                    {p.label} ({p.timeRange})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meal Title */}
          <div>
            <label className="block text-xs font-black text-[#16302e] mb-1.5">
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
            <label className="block text-xs font-black text-[#16302e] mb-1.5">
              Ingredientes / Detalhes / Observações
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Usar cogumelos frescos, verificar se temos creme de leite na despensa."
              className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#16302e] placeholder:text-[#98b3b0]"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-xs font-black text-[#16302e] mb-1.5">
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

          {/* Chef / Responsible Member */}
          <div>
            <label className="block text-xs font-black text-[#16302e] mb-1.5">
              Cozinheiro(a) Responsável
            </label>
            <select
              value={selectedChefId}
              onChange={(e) => setSelectedChefId(e.target.value)}
              className="w-full bg-[#f0fcfa] border border-[#d0dddb] text-[#16302e] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#16302e]"
            >
              <option value="">Nenhum cozinheiro definido (Geral)</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-[#e4f0ee] flex items-center justify-between gap-2">
            <div>
              {initialMeal && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialMeal.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 min-h-[44px]"
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#727877] hover:bg-[#f0fcfa] transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#16302e] text-[#ffca5e] hover:bg-[#204542] transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-h-[44px]"
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
