import React, { useState } from 'react';
import { JoinHouseholdFormData } from '../types.js';

interface JoinHouseholdViewProps {
  onSuccess: (data: JoinHouseholdFormData) => void;
  onBack: () => void;
  onNavigateCreate?: () => void;
}

export const JoinHouseholdView: React.FC<JoinHouseholdViewProps> = ({
  onSuccess,
  onBack,
  onNavigateCreate,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da residência.');
      return;
    }
    if (!code.trim()) {
      setError('Por favor, informe o código de convite.');
      return;
    }
    setError(null);
    onSuccess({
      name: name.trim(),
      code: code.trim().toUpperCase(),
    });
  };

  return (
    <div className="min-h-screen bg-[#11241f] p-3 sm:p-6 md:p-8 flex items-center justify-center font-['Inter',sans-serif] text-[#131e1d]">
      {/* Outer Card Container with Soft Frame */}
      <div className="w-full max-w-[960px] min-h-[620px] bg-[#f0fcfa] rounded-3xl md:rounded-[36px] shadow-2xl p-6 sm:p-10 md:p-14 flex flex-col justify-between border border-[#cde2dc] relative overflow-hidden">
        
        {/* Top Bar / Brand */}
        <header className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2d4644] hover:text-[#16302e] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#e2f3ef]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Voltar</span>
          </button>
          
          <span className="font-bold text-sm tracking-[0.28em] text-[#16302e] uppercase pr-2">
            DOMUS
          </span>

          <div className="w-16"></div>
        </header>

        {/* Form Body */}
        <div className="max-w-[480px] w-full mx-auto my-auto py-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#dff3ee] text-[#16302e] mb-4 shadow-sm border border-[#cbebe3]">
              <span className="material-symbols-outlined text-2xl">login</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112321] tracking-tight mb-2">
              Entrar em Residência
            </h1>
            <p className="text-sm text-[#4b6360] font-normal leading-relaxed">
              Insira o nome da residência e o código de convite fornecido pelo administrador para ingressar no espaço.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#fdf2f2] border border-[#f8d7da] text-[#a94442] text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#d9534f]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nome da Residência */}
            <div>
              <label htmlFor="join-house-name" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Nome da Residência <span className="text-[#d9534f]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  home
                </span>
                <input
                  id="join-house-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Residência Alameda"
                  className="w-full bg-[#f8fdfc] border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Input Código de Convite */}
            <div>
              <label htmlFor="join-house-code" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Código de Convite <span className="text-[#d9534f]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  vpn_key
                </span>
                <input
                  id="join-house-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: DOMUS-789X ou CASA-4892"
                  className="w-full bg-[#f8fdfc] border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm font-mono tracking-wider font-semibold text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#5e7e7a]">
                O código de convite é gerado e fornecido pelo morador administrador da residência.
              </p>
            </div>

            {/* Dica de Suporte / Informação */}
            <div className="p-3.5 rounded-xl bg-[#e6f4f1] border border-[#d2ebe5] text-xs text-[#2d4644] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-[#16302e] shrink-0 mt-0.5">info</span>
              <p className="leading-relaxed text-[11px]">
                Ao entrar, seu perfil será sincronizado com a escala de tarefas, mural de recados e divisões financeiras desta residência.
              </p>
            </div>

            {/* Botão Submit */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-join-household-submit"
                className="w-full bg-[#16302e] hover:bg-[#20423f] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Entrar na Residência</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Link secundário */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={onNavigateCreate || onBack}
              className="text-xs font-medium text-[#4b6360] hover:text-[#16302e] transition-colors"
            >
              Não tem um código? <span className="font-semibold text-[#16302e] underline">Criar uma nova residência</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-[#d8eae6] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5e7e7a] gap-3">
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
