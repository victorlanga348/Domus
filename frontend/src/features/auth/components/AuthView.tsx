import React, { useState, useEffect } from 'react';
import { authApi, type AuthUser } from '../api/authApi.js';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthViewProps {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onShowToast }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    '248488236065-n5dela4vbnsh5kdfqke3n3ol4nedp7m2.apps.googleusercontent.com';

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setError('Credencial do Google não recebida.');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    try {
      const data = await authApi.googleLogin(response.credential);
      onShowToast?.(`Autenticado com sucesso como ${data.user.name}!`);
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnContainer = document.getElementById('google-btn-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            const parentWidth = btnContainer.parentElement?.clientWidth || 320;
            const targetWidth = Math.max(240, Math.min(parentWidth - 8, 360));
            window.google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: targetWidth,
              text: isRegister ? 'signup_with' : 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              locale: 'pt-BR',
            });
          }
        } catch (e) {
          console.warn('[DOMUS GSI] Aviso ao inicializar Google Identity Services:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, isRegister]);

  const handleManualGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Carregando serviço de autenticação Google. Aguarde alguns instantes.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve conter no mínimo 6 caracteres.');
        }

        const data = await authApi.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
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
    <div className="min-h-[100dvh] w-full max-w-full bg-[#e4f0ee] flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto py-8">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full border border-[#d9e5e3] shadow-xl space-y-5 sm:space-y-6 animate-in fade-in duration-300 my-auto">
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

        {/* Google OAuth 2.0 / Google Identity Services */}
        <div className="space-y-3">
          <div id="google-btn-container" className="w-full max-w-full flex justify-center min-h-[44px] overflow-hidden">
            {/* Fallback caso o script do Google ainda esteja carregando ou bloqueado */}
            <button
              type="button"
              onClick={handleManualGoogleLogin}
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#f0fcfa] active:scale-[0.99] border border-[#c1c8c6] text-[#16302e] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="material-symbols-outlined text-base animate-spin text-[#7b5800]">
                  progress_activity
                </span>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {googleLoading
                  ? 'Autenticando com o Google...'
                  : isRegister
                  ? 'Cadastrar com o Google'
                  : 'Continuar com o Google'}
              </span>
            </button>
          </div>

          {/* Divisor discreto */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#d0dddb] w-full" />
            <span className="bg-white px-3 text-[10px] font-semibold text-[#727877] uppercase tracking-wider shrink-0">
              ou continue com e-mail
            </span>
          </div>
        </div>

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
