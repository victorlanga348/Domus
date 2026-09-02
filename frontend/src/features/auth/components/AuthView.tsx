import React, { useState } from 'react';
import { authApi, type AuthUser } from '../api/authApi.js';

interface AuthViewProps {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onShowToast }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password || !pin) {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
        if (pin.length < 4 || pin.length > 6) {
          throw new Error('O PIN deve conter entre 4 e 6 dígitos.');
        }

        const data = await authApi.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          pin: pin.trim(),
        });

        onShowToast?.(`Conta criada com sucesso! Bem-vindo, ${data.user.name}.`);
        onAuthSuccess(data.user, data.token);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Informe seu email e senha.');
        }

        const data = await authApi.login({
          email: email.trim().toLowerCase(),
          password,
        });

        onShowToast?.(`Sessão iniciada como ${data.user.name}.`);
        onAuthSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e4f0ee] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#d9e5e3] shadow-xl space-y-6 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#ffca5e] text-[#755400] mx-auto flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-3xl font-black">roofing</span>
          </div>
          <h1 className="text-2xl font-black text-[#16302e] tracking-tight">DOMUS</h1>
          <p className="text-xs text-[#727877]">
            Gestão compartilhada da casa, tarefas e despesas em família
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 bg-[#f0fcfa] p-1 rounded-2xl border border-[#d0dddb]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister ? 'bg-[#16302e] text-white shadow-xs' : 'text-[#727877] hover:text-[#16302e]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister ? 'bg-[#16302e] text-white shadow-xs' : 'text-[#727877] hover:text-[#16302e]'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Victor Langa"
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#16302e] mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302e] mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha secreta (6+ caracteres)"
              className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#16302e] mb-1">
                PIN de Execução Rápida (4 a 6 dígitos)
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="ex: 1234"
                className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs text-center tracking-widest font-black focus:outline-none focus:border-[#7b5800]"
              />
              <p className="text-[10px] text-[#727877] mt-1">
                Usado para confirmar conclusão de tarefas sem precisar digitar a senha completa.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {isRegister ? 'person_add' : 'login'}
            </span>
            <span>{loading ? 'Processando...' : isRegister ? 'Cadastrar Conta' : 'Acessar DOMUS'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
