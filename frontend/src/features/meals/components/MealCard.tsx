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
      className={`h-full w-full bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        hasMeal
          ? 'border-[#d9e5e3] shadow-xs hover:border-[#98b3b0]'
          : 'border-dashed border-[#d9e5e3] bg-white/70'
      } ${compact ? 'p-2 xl:p-2.5 gap-1.5 min-h-[135px]' : 'p-4 sm:p-5 gap-3.5 min-h-[160px]'}`}
    >
      {/* Top Header: Period Badge & Action */}
      {compact ? (
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${periodMeta.badgeColor}`}
              >
                <span className="material-symbols-outlined text-xs">
                  {periodMeta.icon}
                </span>
              </span>
              <h4 className="text-[11px] xl:text-xs font-black text-[#16302e] truncate leading-tight">
                {periodMeta.label}
              </h4>
            </div>

            {/* Edit / Lock Action (Compact) */}
            <div>
              {canEdit && hasMeal ? (
                <button
                  onClick={onEdit}
                  className="p-0.5 text-[#16302e] hover:text-[#7b5800] hover:bg-[#fff8e6] active:scale-[0.96] rounded-md transition-all min-h-[22px] min-w-[22px] flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#7b5800]/40 cursor-pointer shrink-0"
                  title="Editar refeição"
                  aria-label={`Editar ${periodMeta.label}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                </button>
              ) : isLocked && isSubAdmin ? (
                <span
                  className="p-0.5 rounded text-[#727877] bg-[#f0f4f3] flex items-center justify-center cursor-not-allowed shrink-0"
                  title="Cardápio trancado pelo Administrador Geral"
                  aria-label="Bloqueado por trava global"
                >
                  <span className="material-symbols-outlined text-xs">lock</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Schedule Row */}
          <div className="min-w-0">
            {canEdit && onEditSchedule ? (
              <button
                type="button"
                onClick={onEditSchedule}
                className="text-[9px] xl:text-[10px] text-[#727877] hover:text-[#7b5800] font-semibold inline-flex items-center gap-0.5 rounded px-1 -mx-1 py-0.5 hover:bg-[#fff8e6] transition-colors cursor-pointer group truncate max-w-full"
                title="Clique para ajustar horário desta refeição"
                aria-label={`Ajustar horário de ${periodMeta.label}`}
              >
                <span className="material-symbols-outlined text-[10px] group-hover:text-[#7b5800] shrink-0">schedule</span>
                <span className="underline decoration-dotted decoration-[#98b3b0] group-hover:decoration-[#7b5800] truncate">{periodMeta.timeRange}</span>
              </button>
            ) : (
              <p className="text-[9px] xl:text-[10px] text-[#727877] font-semibold flex items-center gap-0.5 truncate">
                <span className="material-symbols-outlined text-[10px] shrink-0">schedule</span>
                <span className="truncate">{periodMeta.timeRange}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
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

          {/* Edit / Lock Action (Daily) */}
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
      )}

      {/* Main Content: Dish Name & Description */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        {hasMeal ? (
          <div className="min-w-0">
            <h5
              className={`font-black text-[#16302e] line-clamp-2 leading-snug ${
                compact ? 'text-xs' : 'text-sm sm:text-base'
              }`}
            >
              {meal!.title}
            </h5>
            {meal!.description && (
              <p
                className={`text-[#727877] font-medium leading-relaxed ${
                  compact ? 'text-[10px] mt-0.5 line-clamp-2' : 'text-xs mt-1 line-clamp-3'
                }`}
              >
                {meal!.description}
              </p>
            )}
          </div>
        ) : (
          <div className="py-1 text-center min-w-0">
            <p className="text-[10px] font-semibold text-[#98b3b0]">Nenhum prato</p>
            {canEdit && (
              <button
                onClick={onEdit}
                className="mt-1 text-[10px] font-bold text-[#7b5800] hover:underline active:scale-[0.96] transition-transform inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">add</span>
                <span>Adicionar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tags Section */}
      {hasMeal && meal!.tags && meal!.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-[#f0f4f3] min-w-0">
          {meal!.tags.slice(0, compact ? 2 : 4).map((tag, idx) => {
            const meta = getTagStyle(tag);
            return (
              <span
                key={idx}
                className={`font-extrabold rounded-md border flex items-center gap-0.5 shrink-0 ${meta.color} ${
                  compact ? 'text-[8px] xl:text-[9px] px-1 py-0.2' : 'text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5'
                }`}
              >
                <span className="material-symbols-outlined text-[9px]">{meta.icon}</span>
                <span className="truncate max-w-[80px]">{tag}</span>
              </span>
            );
          })}
          {compact && meal!.tags.length > 2 && (
            <span className="text-[8px] font-bold text-[#727877] px-0.5">
              +{meal!.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
