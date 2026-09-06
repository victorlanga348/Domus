import React from 'react';

interface HouseholdSelectionViewProps {
  onSelectCreate: () => void;
  onSelectJoin: () => void;
  onLogout?: () => void;
}

export const HouseholdSelectionView: React.FC<HouseholdSelectionViewProps> = ({
  onSelectCreate,
  onSelectJoin,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-[#11241f] p-3 sm:p-6 md:p-8 flex items-center justify-center font-['Inter',sans-serif] text-[#131e1d]">
      {/* Outer Main Container */}
      <div className="w-full max-w-[960px] min-h-[620px] bg-[#f0fcfa] rounded-3xl md:rounded-[36px] shadow-2xl p-6 sm:p-10 md:p-14 flex flex-col justify-between border border-[#cde2dc] relative overflow-hidden">
        
        {/* Top Header Logo */}
        <header className="flex items-center justify-between w-full">
          <div className="w-16">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-[#5e7e7a] hover:text-[#16302e] transition-colors py-1 px-2 rounded hover:bg-[#e2f3ef]"
              >
                Sair
              </button>
            )}
          </div>
          
          <span className="font-bold text-sm tracking-[0.28em] text-[#16302e] uppercase text-center">
            DOMUS
          </span>

          <div className="w-16"></div>
        </header>

        {/* Center Content */}
        <div className="my-auto py-8">
          <div className="text-center max-w-lg mx-auto mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112321] tracking-tight mb-3">
              Bem-vindo ao DOMUS
            </h1>
            <p className="text-sm sm:text-base text-[#4b6360] font-normal leading-relaxed">
              Para começar a gerenciar sua casa, escolha uma das opções abaixo.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Card 1: Criar Residência */}
            <div
              onClick={onSelectCreate}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCreate()}
              id="card-create-household"
              className="group bg-white rounded-3xl p-7 border border-[#daebe6] hover:border-[#16302e] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#e3f4f0] text-[#16302e] flex items-center justify-center mb-6 group-hover:bg-[#16302e] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">cottage</span>
                </div>
                
                <h2 className="text-xl font-bold text-[#112321] mb-2 group-hover:text-[#16302e] transition-colors">
                  Criar Residência
                </h2>
                
                <p className="text-xs sm:text-sm text-[#526b68] leading-relaxed mb-6">
                  Configure uma nova residência do zero. Você será o administrador e poderá convidar outros membros da família.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#16302e] group-hover:translate-x-1 transition-transform duration-300 pt-2">
                <span>Começar</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>

            {/* Card 2: Entrar em Residência */}
            <div
              onClick={onSelectJoin}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectJoin()}
              id="card-join-household"
              className="group bg-white rounded-3xl p-7 border border-[#daebe6] hover:border-[#16302e] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#e3f4f0] text-[#16302e] flex items-center justify-center mb-6 group-hover:bg-[#16302e] group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">login</span>
                </div>
                
                <h2 className="text-xl font-bold text-[#112321] mb-2 group-hover:text-[#16302e] transition-colors">
                  Entrar em Residência
                </h2>
                
                <p className="text-xs sm:text-sm text-[#526b68] leading-relaxed mb-6">
                  Junte-se a uma residência existente usando um código de convite fornecido pelo administrador.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#16302e] group-hover:translate-x-1 transition-transform duration-300 pt-2">
                <span>Inserir Código</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="pt-6 pb-safe border-t border-[#d8eae6] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5e7e7a] gap-3"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <span className="font-bold tracking-wider text-[#16302e]">DOMUS</span>
          
          <div className="flex items-center gap-5">
            <a href="#privacy" className="hover:text-[#16302e] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#16302e] transition-colors">Terms of Service</a>
            <a href="#help" className="hover:text-[#16302e] transition-colors">Help Center</a>
          </div>

          <span>© 2024 DOMUS Home Management. All rights reserved.</span>
        </footer>

      </div>
    </div>
  );
};
