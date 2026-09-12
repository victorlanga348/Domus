import React from 'react';
import { MealItem } from '../../../types.js';
import { MealPeriodMeta, AVAILABLE_DIET_TAGS } from '../types.js';

interface MealCardProps {
  periodMeta: MealPeriodMeta;
  meal?: MealItem;
  canEdit: boolean;
  isLocked: boolean;
  isSubAdmin: boolean;
  onEdit: () => void;
  onEditSchedule?: () => void;
  compact?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  periodMeta,
  meal,
  canEdit,
  isLocked,
  isSubAdmin,
  onEdit,
  onEditSchedule,
  compact = false,
}) => {
  const hasMeal = Boolean(meal && meal.title.trim());

  // Resolves dietary tag visual style
  const getTagStyle = (tagLabel: string) => {
    const found = AVAILABLE_DIET_TAGS.find(
      (t) => t.label.toLowerCase() === tagLabel.toLowerCase()
    );
    return found || { label: tagLabel, icon: 'restaurant_menu', color: 'bg-[#f0fcfa] text-[#16302e] border-[#d0dddb]' };
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        hasMeal
          ? 'border-[#d9e5e3] shadow-xs hover:border-[#98b3b0]'
          : 'border-dashed border-[#d9e5e3] bg-white/70'
      } ${compact ? 'p-3 gap-2 min-h-[140px]' : 'p-4 sm:p-5 gap-3.5 min-h-[160px]'}`}
    >
      {/* Top Header: Period Badge & Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 ${periodMeta.badgeColor}`}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              {periodMeta.icon}
            </span>
          </span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-[#16302e] truncate leading-tight">
              {periodMeta.label}
            </h4>
            {canEdit && onEditSchedule ? (
              <button
                type="button"
                onClick={onEditSchedule}
                className="text-[10px] text-[#727877] hover:text-[#7b5800] font-semibold flex items-center gap-1 mt-0.5 rounded px-1 -mx-1 py-0.5 hover:bg-[#fff8e6] transition-colors cursor-pointer group"
                title="Clique para ajustar horário desta refeição"
                aria-label={`Ajustar horário de ${periodMeta.label}`}
              >
                <span className="material-symbols-outlined text-[11px] group-hover:text-[#7b5800]">schedule</span>
                <span className="underline decoration-dotted decoration-[#98b3b0] group-hover:decoration-[#7b5800]">{periodMeta.timeRange}</span>
                <span className="material-symbols-outlined text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-[#7b5800]">edit</span>
              </button>
            ) : (
              <p className="text-[10px] text-[#727877] font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[11px]">schedule</span>
                <span>{periodMeta.timeRange}</span>
              </p>
            )}
          </div>
        </div>

        {/* Edit / Lock Action (Only displayed when meal exists or locked) */}
        <div>
          {canEdit && hasMeal ? (
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-[#16302e] hover:text-[#7b5800] hover:bg-[#fff8e6] active:scale-[0.96] rounded-xl transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7b5800]/40 cursor-pointer"
              title="Editar refeição"
              aria-label={`Editar ${periodMeta.label}`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">
                edit
              </span>
            </button>
          ) : isLocked && isSubAdmin ? (
            <span
              className="p-1.5 rounded-xl text-[#727877] bg-[#f0f4f3] flex items-center justify-center cursor-not-allowed"
              title="Cardápio trancado pelo Administrador Geral"
              aria-label="Bloqueado por trava global"
            >
              <span className="material-symbols-outlined text-base">lock</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Content: Dish Name & Description */}
      <div className="flex-1 flex flex-col justify-center">
        {hasMeal ? (
          <div>
            <h5
              className={`font-black text-[#16302e] line-clamp-2 leading-snug ${
                compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}
            >
              {meal!.title}
            </h5>
            {meal!.description && (
              <p
                className={`text-[#727877] font-medium mt-1 leading-relaxed ${
                  compact ? 'text-[11px] line-clamp-2' : 'text-xs line-clamp-3'
                }`}
              >
                {meal!.description}
              </p>
            )}
          </div>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs font-semibold text-[#98b3b0]">Nenhum prato definido</p>
            {canEdit && (
              <button
                onClick={onEdit}
                className="mt-1.5 text-[11px] font-bold text-[#7b5800] hover:underline active:scale-[0.96] transition-transform inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">add</span>
                <span>Adicionar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tags Section */}
      {hasMeal && meal!.tags && meal!.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-[#f0f4f3]">
          {meal!.tags.slice(0, compact ? 2 : 4).map((tag, idx) => {
            const meta = getTagStyle(tag);
            return (
              <span
                key={idx}
                className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${meta.color}`}
              >
                <span className="material-symbols-outlined text-[10px]">{meta.icon}</span>
                <span>{tag}</span>
              </span>
            );
          })}
          {compact && meal!.tags.length > 2 && (
            <span className="text-[9px] font-bold text-[#727877] px-1">
              +{meal!.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
