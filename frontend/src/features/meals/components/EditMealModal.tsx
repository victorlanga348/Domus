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
  const [selectedChefIds, setSelectedChefIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialMeal) {
      setDayOfWeek(initialMeal.dayOfWeek);
      setMealType(initialMeal.mealType);
      setTitle(initialMeal.title);
      setDescription(initialMeal.description || '');
      setSelectedTags(initialMeal.tags || []);
      const initialChefs =
        initialMeal.chefs && initialMeal.chefs.length > 0
          ? initialMeal.chefs.map((c) => c.id)
          : initialMeal.chefId
          ? [initialMeal.chefId]
          : [];
      setSelectedChefIds(initialChefs);
    } else {
      setDayOfWeek(defaultDay);
      setMealType(defaultPeriod);
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setSelectedChefIds([]);
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

  const handleChefToggle = (memberId: string) => {
    setSelectedChefIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedChefs = familyMembers
      .filter((m) => selectedChefIds.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));

    const updatedMeal: MealItem = {
      id: initialMeal?.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dayOfWeek,
      mealType,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: selectedTags,
      chefs: assignedChefs,
      chefId: assignedChefs[0]?.id,
      chefName: assignedChefs[0]?.name,
      chefAvatar: assignedChefs[0]?.avatar,
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

          {/* Chef / Responsible Members (Multi-Chef Selection) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-[#16302e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#7b5800]">skillet</span>
                <span>Cozinheiro(s) Responsável(is)</span>
                {selectedChefIds.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#fff8e6] text-[#7b5800] px-1.5 py-0.5 rounded-md border border-[#ffca5e]/60">
                    {selectedChefIds.length} {selectedChefIds.length === 1 ? 'selecionado' : 'selecionados'}
                  </span>
                )}
              </label>

              {selectedChefIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedChefIds([])}
                  className="text-[10px] font-bold text-[#727877] hover:text-red-600 transition-colors"
                >
                  Limpar seleção
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#727877] font-medium mb-2">
              Selecione uma ou mais pessoas que vão cozinhar ou ajudar nesta refeição.
            </p>

            {familyMembers.length === 0 ? (
              <p className="text-xs text-[#98b3b0] italic">Nenhum morador cadastrado na casa.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-[#f0fcfa] rounded-xl border border-[#d0dddb]">
                {familyMembers.map((m) => {
                  const isSelected = selectedChefIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleChefToggle(m.id)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all min-h-[44px] cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#16302e] shadow-xs ring-1 ring-[#16302e]'
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
                        className={`w-4 h-4 rounded flex items-center justify-center text-[11px] transition-colors shrink-0 ${
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
            )}
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
