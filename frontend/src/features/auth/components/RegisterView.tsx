import React, { useState } from 'react';
import { RegisterFormData } from '../types.js';

interface RegisterViewProps {
  onRegister: (data: RegisterFormData) => void;
  onNavigateLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegister,
  onNavigateLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    setError(null);
    onRegister({
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0fcfa] font-['Inter',sans-serif] text-[#131e1d]">
      {/* Left Panel: Luxury Hero Section */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-5/12 bg-[#102521] overflow-hidden flex-col justify-end p-12 lg:p-16 text-white min-h-screen">
        {/* Background Image Overlay with Soft Dark Teal Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e211e] via-[#132c26]/90 to-[#16332d]/80" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white">
            Elevate Your Household.
          </h2>
          <p className="text-sm lg:text-base text-[#b6d4cf] font-normal leading-relaxed">
            Join DOMUS and experience the serene organization of a truly modern home management platform.
          </p>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Top Brand Logo */}
        <div>
          <span className="font-bold text-sm tracking-[0.28em] text-[#16302e] uppercase block mb-10">
            DOMUS
          </span>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112321] tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-sm text-[#5e7e7a]">
              Enter your details to establish your domestic hub.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#fdf2f2] border border-[#f8d7da] text-[#a94442] text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#d9534f]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  person
                </span>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  mail
                </span>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-white border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  lock
                </span>
                <input
                  id="reg-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-pass" className="block text-xs font-semibold text-[#2d4644] mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#5e7e7a] text-lg pointer-events-none">
                  sync_lock
                </span>
                <input
                  id="reg-confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#cfe0dc] rounded-xl pl-11 pr-4 py-3 text-sm text-[#112321] placeholder-[#7d9c97] focus:outline-none focus:ring-2 focus:ring-[#16302e] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-register-submit"
                className="w-full bg-[#16302e] hover:bg-[#20423f] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Create Account</span>
              </button>
            </div>
          </form>

          {/* Already have account */}
          <div className="text-center mt-6">
            <p className="text-xs text-[#526b68]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="font-bold text-[#112321] hover:underline cursor-pointer"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>

        {/* Legal notice */}
        <div className="text-center pt-8">
          <p className="text-[11px] text-[#7d9c97]">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
