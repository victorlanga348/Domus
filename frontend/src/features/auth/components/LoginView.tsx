import React, { useState } from 'react';
import { LoginFormData } from '../types.js';

interface LoginViewProps {
  onLogin: (data: LoginFormData) => void;
  onNavigateRegister: () => void;
  onNavigateSetupHome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onNavigateRegister,
  onNavigateSetupHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError(null);
    onLogin({
      email: email.trim(),
      password: password.trim(),
      rememberMe,
    });
  };

  return (
    <div className="min-h-screen bg-[#eaf6f4] p-4 sm:p-6 flex flex-col justify-between items-center font-['Inter',sans-serif] text-[#131e1d]">
      <div className="w-full"></div>

      {/* Centered Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#d8ebe6] relative">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-[0.25em] text-[#112321] uppercase mb-1.5">
            DOMUS
          </h1>
          <p className="text-xs font-medium text-[#5e7e7a] tracking-wide">
            Home Management
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#fdf2f2] border border-[#f8d7da] text-[#a94442] text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#d9534f]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@household.com"
                className="w-full bg-[#f4faf8] border border-[#d3e5e1] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#2d4644]">
                Password
              </label>
              <a
                href="#forgot"
                className="text-[11px] font-medium text-[#5e7e7a] hover:text-[#16302e] transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f4faf8] border border-[#d3e5e1] rounded-xl pl-11 pr-11 py-3 text-sm text-[#112321] placeholder-[#7d9c97] placeholder:text-[10px] placeholder:tracking-widest focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#5e7e7a] hover:text-[#16302e] transition-colors p-1 flex items-center justify-center cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center gap-2.5 py-1">
            <button
              type="button"
              role="switch"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer flex items-center p-0.5 ${
                rememberMe ? 'bg-[#16302e]' : 'bg-[#cfe0dc]'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                  rememberMe ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              onClick={() => setRememberMe(!rememberMe)}
              className="text-xs text-[#2d4644] font-medium select-none cursor-pointer"
            >
              Remember me
            </span>
          </div>

          {/* Sign in Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-login-submit"
              className="w-full bg-[#16302e] hover:bg-[#20423f] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Card Footer Link */}
        <div className="text-center mt-6 pt-5 border-t border-[#ebf5f3]">
          <p className="text-xs text-[#526b68]">
            New to DOMUS?{' '}
            <button
              type="button"
              onClick={onNavigateSetupHome || onNavigateRegister}
              className="font-bold text-[#112321] hover:underline cursor-pointer"
            >
              Set up your home
            </button>
          </p>
        </div>
      </div>

      {/* Global Page Footer */}
      <footer
        className="w-full max-w-5xl py-6 pb-safe flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5e7e7a] gap-3"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
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
  );
};
