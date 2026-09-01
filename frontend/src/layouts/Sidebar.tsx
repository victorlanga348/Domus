import React from 'react';
import { TabType, FamilyMember } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentUser: FamilyMember;
  activeUsers: FamilyMember[];
  onLogoutClick: () => void;
  onSwitchHouseClick?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  activeUsers,
  onLogoutClick,
  onSwitchHouseClick,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'tasks', label: 'Tarefas', icon: 'assignment' },
    { id: 'reports', label: 'Histórico de Tarefas', icon: 'history' },
    { id: 'statistics', label: 'Estatísticas', icon: 'bar_chart' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />

          {/* Slide-In Drawer */}
          <aside className="relative w-72 max-w-[80%] bg-[#16302e] h-full shadow-2xl flex flex-col justify-between py-5 px-4 z-50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in slide-in-from-left duration-200">
            {/* Top Bar with Brand & Close Button */}
            <div className="flex items-center justify-between border-b border-[#2d4644] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffca5e] text-2xl font-black">
                  roofing
                </span>
                <span className="text-lg font-black tracking-tight text-white">
                  DOMUS
                </span>
              </div>
              <button
                onClick={onCloseMobile}
                className="text-[#98b3b0] hover:text-white p-1 rounded-full hover:bg-[#2d4644] transition-colors"
                title="Fechar Menu"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* User Profile Area */}
            <div className="flex items-center gap-3 px-2 mb-6">
              <img
                className="w-12 h-12 rounded-full object-cover border-2 border-[#ffca5e] shadow-md"
                src={currentUser.avatar}
                alt={currentUser.name}
              />
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-white uppercase truncate">
                  {currentUser.name}
                </h2>
                <p className="text-[11px] text-[#98b3b0] opacity-80 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#f0fcfa] text-[#16302e] shadow-md'
                        : 'text-[#98b3b0] hover:text-white hover:bg-[#2d4644]/50'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-[#7b5800]' : ''
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Active Members & Logout */}
            <div className="border-t border-[#2d4644] pt-4 mt-6">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[10px] font-bold text-[#98b3b0] opacity-70 uppercase tracking-widest">
                  MEMBROS ONLINE ({activeUsers.length})
                </h3>
              </div>
              <div className="flex items-center -space-x-2 px-1 mb-4">
                {activeUsers.slice(0, 5).map((user, idx) => (
                  <img
                    key={user.id}
                    src={user.avatar}
                    alt={user.name}
                    title={user.name}
                    className="w-7 h-7 rounded-full border-2 border-[#16302e] object-cover relative"
                    style={{ zIndex: 30 - idx * 5 }}
                  />
                ))}
              </div>

              {/* Switch House & Logout Buttons */}
              <div className="space-y-1">
                {onSwitchHouseClick && (
                  <button
                    onClick={() => {
                      onSwitchHouseClick();
                      onCloseMobile?.();
                    }}
                    className="text-[#98b3b0] hover:text-[#ffca5e] flex items-center gap-2.5 px-2 py-2 text-xs font-semibold w-full transition-colors rounded-xl hover:bg-[#2d4644]/40"
                  >
                    <span className="material-symbols-outlined text-base text-[#ffca5e]">apartment</span>
                    <span>Trocar Residência</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogoutClick();
                    onCloseMobile?.();
                  }}
                  className="text-[#98b3b0] hover:text-rose-300 flex items-center gap-2.5 px-2 py-2 text-xs font-semibold w-full transition-colors rounded-xl hover:bg-[#2d4644]/40"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
      {/* Desktop Sidebar (hidden on mobile, fixed no scroll on desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[250px] lg:w-[280px] bg-[#16302e] shadow-none flex-col justify-between py-4 lg:py-6 z-50 transition-all duration-300 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Profile Area */}
        <div className="flex flex-col items-center justify-center px-5 mb-2 lg:mb-4 shrink-0">
          <div
            className="relative mb-1.5 lg:mb-2 group cursor-pointer"
            onClick={() => onTabChange('settings')}
          >
            <img
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-[#ffca5e] shadow-md transition-transform duration-300 group-hover:scale-105"
              src={currentUser.avatar}
              alt={currentUser.name}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-emerald-500 border-2 border-[#16302e] rounded-full"></div>
          </div>
          <h2 className="text-sm lg:text-base font-bold text-white tracking-wider text-center uppercase">
            {currentUser.name}
          </h2>
          <p className="text-[10px] lg:text-[11px] text-[#98b3b0] opacity-80 text-center font-medium truncate max-w-[200px]">
            {currentUser.email}
          </p>
        </div>

        {/* Navigation Tabs (compact spacing to guarantee no scrollbar) */}
        <nav className="flex-1 w-full flex flex-col justify-center gap-0.5 lg:gap-1 relative py-1 px-0 shrink-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            if (isActive) {
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="bg-[#f0fcfa] text-[#16302e] rounded-l-full relative flex items-center gap-3.5 px-5 py-2 lg:py-2.5 ml-3 pl-5 text-left w-[calc(100%-12px)] font-bold transition-all duration-200 after:content-[''] after:absolute after:right-0 after:top-[-16px] after:w-[16px] after:h-[16px] after:bg-transparent after:shadow-[8px_8px_0_0_#f0fcfa] before:content-[''] before:absolute before:right-0 before:bottom-[-16px] before:w-[16px] before:h-[16px] before:bg-transparent before:shadow-[8px_-8px_0_0_#f0fcfa] focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[#7b5800] filled text-lg lg:text-xl">
                    {item.icon}
                  </span>
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="text-[#98b3b0] opacity-75 flex items-center gap-3.5 px-7 py-2 lg:py-2.5 hover:opacity-100 hover:text-white transition-all duration-200 text-left w-full group focus:outline-none"
              >
                <span className="material-symbols-outlined text-base lg:text-lg group-hover:text-[#ffca5e] transition-colors duration-200">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Users & Blueprint Footer (compact) */}
        <div className="px-5 shrink-0 mt-1 mb-1 lg:mt-2 lg:mb-2">
          <div className="flex items-center justify-between mb-1.5 lg:mb-2">
            <h3 className="text-[10px] font-bold text-[#98b3b0] opacity-70 uppercase tracking-widest">
              ACTIVE MEMBERS
            </h3>
            <span className="text-[10px] text-[#ffca5e] font-bold">
              {activeUsers.length} Online
            </span>
          </div>
          <div className="flex items-center -space-x-2">
            {activeUsers.slice(0, 4).map((user, idx) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                title={`${user.name} (${user.role})`}
                className="w-6 h-6 lg:w-7 lg:h-7 rounded-full border-2 border-[#16302e] object-cover relative transition-transform duration-200 hover:scale-110 hover:z-40"
                style={{ zIndex: 30 - idx * 5 }}
              />
            ))}
          </div>
        </div>

        {/* Actions (bottom: Switch House & Logout) */}
        <div className="px-5 border-t border-[#2d4644] pt-2 lg:pt-3 shrink-0 space-y-1">
          {onSwitchHouseClick && (
            <button
              onClick={onSwitchHouseClick}
              className="text-[#98b3b0] opacity-75 hover:opacity-100 hover:text-[#ffca5e] flex items-center gap-2.5 transition-all duration-200 text-xs font-semibold w-full py-1"
            >
              <span className="material-symbols-outlined text-base text-[#ffca5e]">apartment</span>
              <span>Trocar Residência</span>
            </button>
          )}
          <button
            onClick={onLogoutClick}
            className="text-[#98b3b0] opacity-75 hover:opacity-100 hover:text-rose-300 flex items-center gap-2.5 transition-all duration-200 text-xs font-semibold w-full py-1"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};
