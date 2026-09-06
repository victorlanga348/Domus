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
    { id: 'dashboard', label: 'Mural de Recados', icon: 'push_pin' },
    { id: 'tasks', label: 'Tarefas & Rodízio', icon: 'assignment' },
    { id: 'reports', label: 'Histórico & Relatórios', icon: 'history' },
    { id: 'statistics', label: 'Estatísticas', icon: 'bar_chart' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];

  const desktopNavRef = React.useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<{ top: number; height: number; ready: boolean }>({
    top: 0,
    height: 44,
    ready: false,
  });

  const syncIndicator = React.useCallback(() => {
    if (!desktopNavRef.current) return;
    const targetEl = desktopNavRef.current.querySelector<HTMLElement>(`[data-nav-item="${currentTab}"]`);
    if (targetEl) {
      setIndicatorStyle({
        top: targetEl.offsetTop,
        height: targetEl.offsetHeight,
        ready: true,
      });
    }
  }, [currentTab]);

  React.useLayoutEffect(() => {
    syncIndicator();
  }, [syncIndicator]);

  React.useEffect(() => {
    const handleResize = () => syncIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncIndicator]);

  return (
    <>
      {/* Mobile Slide-Over Sidebar Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] overflow-hidden transition-all duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
        />

        {/* Slide-In Drawer */}
        <aside
          className={`relative w-72 max-w-[80%] bg-[#16302e] h-full h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between px-4 z-50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Top Bar with Brand & Close Button */}
          <div className="flex items-center justify-between border-b border-[#2d4644] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffca5e] text-2xl font-black">
                roofing
              </span>
              <span className="text-lg font-black tracking-tight text-white">
                Domus
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="text-[#98b3b0] hover:text-white p-1 rounded-full hover:bg-[#2d4644] transition-all active:scale-[0.96] cursor-pointer"
              title="Fechar Menu"
              aria-label="Fechar Menu"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* User Profile Area */}
          <div
            onClick={() => {
              onTabChange('settings');
              onCloseMobile?.();
            }}
            className="flex items-center gap-3 px-2 mb-6 cursor-pointer group"
          >
            <img
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ffca5e] shadow-md group-hover:scale-105 transition-transform"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.96] cursor-pointer ${
                    isActive
                      ? 'bg-[#f0fcfa] text-[#16302e] shadow-md'
                      : 'text-[#98b3b0] hover:text-white hover:bg-[#2d4644]/50'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
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
                MEMBROS ONLINE (<span className="tabular-nums">{activeUsers.length}</span>)
              </h3>
            </div>
            <div className="flex items-center -space-x-2 px-1 mb-4">
              {activeUsers.slice(0, 5).map((user, idx) => (
                <div
                  key={user.id}
                  className="relative inline-block"
                  style={{ zIndex: 30 - idx * 5 }}
                  title={`${user.name} - Online`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border-2 border-[#16302e] object-cover relative"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#16302e]" />
                </div>
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
                  className="text-[#98b3b0] hover:text-[#ffca5e] flex items-center gap-2.5 px-2 py-2 text-xs font-semibold w-full transition-all rounded-xl hover:bg-[#2d4644]/40 active:scale-[0.96] cursor-pointer"
                  aria-label="Trocar Residência"
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
                className="text-[#98b3b0] hover:text-rose-300 flex items-center gap-2.5 px-2 py-2 text-xs font-semibold w-full transition-all rounded-xl hover:bg-[#2d4644]/40 active:scale-[0.96] cursor-pointer"
                aria-label="Sair da Conta"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
      {/* Desktop Sidebar (hidden on mobile, fixed no scroll on desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-[100dvh] w-[250px] lg:w-[280px] bg-[#16302e] shadow-none flex-col justify-between py-4 lg:py-6 z-50 transition-all duration-300 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

        {/* Navigation Tabs (compact spacing with animated cut-out sliding indicator) */}
        <nav
          ref={desktopNavRef}
          className="flex-1 w-full flex flex-col justify-center gap-1 lg:gap-1.5 relative py-2 px-0 shrink-0"
        >
          {/* Animated Indicator with Inverted Border-Radius Curves */}
          <div
            className={`absolute top-0 left-3 lg:left-3.5 right-0 pointer-events-none transition-transform duration-250 ease-[cubic-bezier(0.2,0,0,1)] z-0 ${
              indicatorStyle.ready ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              height: `${indicatorStyle.height}px`,
              transform: `translateY(${indicatorStyle.top}px)`,
            }}
          >
            <div className="w-full h-full bg-[#f0fcfa] rounded-l-full relative">
              <div className="sidebar-curve-top" />
              <div className="sidebar-curve-bottom" />
            </div>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                data-nav-item={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative z-10 flex items-center gap-3.5 px-6 lg:px-7 py-2.5 lg:py-3 text-left w-full cursor-pointer focus:outline-none transition-all duration-200 active:scale-[0.96] group ${
                  isActive
                    ? 'active text-[#16302e]'
                    : 'text-[#98b3b0] hover:text-white'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={`material-symbols-outlined text-lg lg:text-xl transition-colors duration-200 ${
                    isActive
                      ? 'text-[#7b5800] filled font-bold'
                      : 'text-[#98b3b0] group-hover:text-[#ffca5e]'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-xs tracking-wide transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#16302e]' : 'font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Active Users & Blueprint Footer (compact) */}
        <div className="px-5 shrink-0 mt-1 mb-1 lg:mt-2 lg:mb-2">
          <div className="flex items-center justify-between mb-1.5 lg:mb-2">
            <h3 className="text-[10px] font-bold text-[#98b3b0] opacity-70 uppercase tracking-widest">
              MORADORES ONLINE
            </h3>
            <span className="text-[10px] text-[#ffca5e] font-bold tabular-nums">
              {activeUsers.length} Online
            </span>
          </div>
          <div className="flex items-center -space-x-2">
            {activeUsers.slice(0, 4).map((user, idx) => (
              <div
                key={user.id}
                className="relative inline-block"
                style={{ zIndex: 30 - idx * 5 }}
                title={`${user.name} (${user.role}) - Online`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 lg:w-7 lg:h-7 rounded-full border-2 border-[#16302e] object-cover relative transition-transform duration-200 hover:scale-110 hover:z-40"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#16302e]" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions (bottom: Switch House & Logout) */}
        <div className="px-5 border-t border-[#2d4644] pt-2 lg:pt-3 shrink-0 space-y-1">
          {onSwitchHouseClick && (
            <button
              onClick={onSwitchHouseClick}
              className="text-[#98b3b0] opacity-75 hover:opacity-100 hover:text-[#ffca5e] flex items-center gap-2.5 transition-all duration-200 active:scale-[0.96] text-xs font-semibold w-full py-1 cursor-pointer"
              aria-label="Trocar Residência"
            >
              <span className="material-symbols-outlined text-base text-[#ffca5e]">apartment</span>
              <span>Trocar Residência</span>
            </button>
          )}
          <button
            onClick={onLogoutClick}
            className="text-[#98b3b0] opacity-75 hover:opacity-100 hover:text-rose-300 flex items-center gap-2.5 transition-all duration-200 active:scale-[0.96] text-xs font-semibold w-full py-1 cursor-pointer"
            aria-label="Sair da Conta"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};
