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
    <header className="sticky top-0 z-40 bg-[#f0fcfa]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e4f0ee]">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu Button - ONLY visible on mobile (< md) */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden text-[#16302e] p-1.5 -ml-1 rounded-xl hover:bg-[#e4f0ee] active:bg-[#d0dddb] transition-colors flex items-center justify-center focus:outline-none"
          title="Abrir Menu Navegação"
        >
          <span className="material-symbols-outlined text-2xl font-black">
            menu
          </span>
        </button>

        <span className="material-symbols-outlined text-[#16302e] text-2xl sm:text-3xl font-black hidden sm:inline-block">
          roofing
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#16302e]">
          DOMUS
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleVacationMode}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 border ${
            vacationMode
              ? 'bg-[#7b5800] text-white border-[#7b5800] shadow-xs'
              : 'bg-transparent border-[#16302e] text-[#16302e] hover:bg-[#16302e] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">flight_takeoff</span>
          <span className="hidden sm:inline">{vacationMode ? 'Férias: Ativo' : 'Modo Férias'}</span>
          <span className="sm:hidden">{vacationMode ? 'Férias' : 'Férias'}</span>
        </button>

        <div className="flex items-center gap-1 border-l border-[#d0dddb] pl-2 sm:pl-3">
          <button
            onClick={onOpenNotifications}
            className="text-[#16302e] p-1.5 sm:p-2 rounded-full hover:bg-[#e4f0ee] transition-colors relative"
            title="Notificações da Residência"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#7b5800] rounded-full border border-[#f0fcfa]"></span>
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
    </header>
  );
};
