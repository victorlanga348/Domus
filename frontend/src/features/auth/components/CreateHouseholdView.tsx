import React, { useState } from 'react';
import { CreateHouseholdFormData } from '../types.js';

interface CreateHouseholdViewProps {
  onSuccess: (data: CreateHouseholdFormData) => void;
  onBack: () => void;
  onNavigateLogin?: () => void;
}

export const CreateHouseholdView: React.FC<CreateHouseholdViewProps> = ({
  onSuccess,
  onBack,
  onNavigateLogin,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(() => `DOMUS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = () => {
    const randomCode = `DOMUS-${Math.floor(1000 + Math.random() * 9000)}`;
    setCode(randomCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da residência.');
      return;
    }
    if (!code.trim()) {
      setError('Por favor, defina um código para a residência.');
      return;
    }
    setError(null);
    onSuccess({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
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
              <span className="material-symbols-outlined text-2xl">cottage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112321] tracking-tight mb-2">
              Criar Residência
            </h1>
            <p className="text-sm text-[#4b6360] font-normal leading-relaxed">
              Defina o nome da sua residência e o código exclusivo para gerenciar seu espaço e convidar moradores.
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
              <label htmlFor="house-name" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Nome da Residência <span className="text-[#d9534f]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  home
                </span>
                <input
                  id="house-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Residência Alameda, Flat 402"
                  className="w-full bg-[#f8fdfc] border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Input Código da Residência */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="house-code" className="block text-xs font-semibold text-[#2d4644]">
                  Código da Residência <span className="text-[#d9534f]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] font-semibold text-[#16302e] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Gerar novo código
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  vpn_key
                </span>
                <input
                  id="house-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: DOMUS-8924"
                  className="w-full bg-[#f8fdfc] border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm font-mono tracking-wider font-semibold text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-[#5e7e7a]">
                Este código será compartilhado com outros moradores para que possam ingressar nesta residência.
              </p>
            </div>

            {/* Input Descrição Opcional */}
            <div>
              <label htmlFor="house-desc" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Descrição ou Endereço <span className="text-xs text-[#7d9c97] font-normal">(Opcional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  notes
                </span>
                <input
                  id="house-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Apartamento compartilhado Centro"
                  className="w-full bg-[#f8fdfc] border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Botão Submit */}
            <div className="pt-3">
              <button
                type="submit"
                id="btn-create-household-submit"
                className="w-full bg-[#16302e] hover:bg-[#20423f] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Criar Residência</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Link secundário */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-medium text-[#4b6360] hover:text-[#16302e] transition-colors"
            >
              Prefere ingressar em uma residência existente? <span className="font-semibold text-[#16302e] underline">Entrar em Residência</span>
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
