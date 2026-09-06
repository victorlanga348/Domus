import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab?: TabType;
  subTab?: string;
  onSubTabChange?: (subTab: string) => void;
  vacationMode: boolean;
  onToggleVacationMode: () => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  onOpenMembersDrawer: () => void;
  onSwitchHouse?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vacationMode,
  onToggleVacationMode,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenMembersDrawer,
  onSwitchHouse,
  onToggleMobileMenu,
}) => {
  return (
    <header
      className="sticky top-0 z-50 bg-[#F4F9F7] border-b border-[#e4f0ee] w-full max-w-full min-w-0 pt-safe"
      style={{ backgroundColor: '#F4F9F7', paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-2.5 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between w-full max-w-full min-w-0 min-h-[56px] sm:min-h-[64px]">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink-0">
          {/* Hamburger Menu Button - ONLY visible on mobile (< md) */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden text-[#16302e] p-1.5 -ml-1 rounded-xl hover:bg-[#e4f0ee] active:bg-[#d0dddb] transition-colors flex items-center justify-center focus:outline-none shrink-0"
            title="Abrir Menu Navegação"
          >
            <span className="material-symbols-outlined text-2xl font-black">
              menu
            </span>
          </button>

          <span className="material-symbols-outlined text-[#16302e] text-2xl sm:text-3xl font-black hidden sm:inline-block shrink-0">
            roofing
          </span>
          <h1 className="text-base sm:text-2xl font-black tracking-tighter text-[#16302e] shrink-0">
            Domus
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            onClick={onToggleVacationMode}
            className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 border shrink-0 ${
              vacationMode
                ? 'bg-[#7b5800] text-white border-[#7b5800] shadow-xs'
                : 'bg-transparent border-[#16302e] text-[#16302e] hover:bg-[#16302e] hover:text-white'
            }`}
            title={vacationMode ? 'Modo Férias Ativo' : 'Ativar Modo Férias'}
          >
            <span className="material-symbols-outlined text-sm shrink-0">flight_takeoff</span>
            <span className="hidden sm:inline">{vacationMode ? 'Férias: Ativo' : 'Modo Férias'}</span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 border-l border-[#d0dddb] pl-1.5 sm:pl-3 shrink-0">
            <button
              onClick={onOpenNotifications}
              className="text-[#16302e] p-1 sm:p-2 rounded-full hover:bg-[#e4f0ee] transition-colors relative"
              title="Notificações da Residência"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#7b5800] rounded-full border border-[#F4F9F7]"></span>
              )}
            </button>

            <button
              onClick={onOpenMembersDrawer}
              className="text-[#16302e] p-1.5 sm:p-2 rounded-full hover:bg-[#e4f0ee] transition-colors"
              title="Membros da Residência"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">group</span>
            </button>

            {onSwitchHouse && (
              <button
                onClick={onSwitchHouse}
                className="text-[#16302e] p-1.5 sm:p-2 rounded-full hover:bg-[#e4f0ee] transition-colors"
                title="Trocar de Residência"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl text-[#7b5800]">apartment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
