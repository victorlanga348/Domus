import React, { useState } from 'react';
import type { RoomItem } from '../types/index.js';

interface PasswordPromptModalProps {
  room: RoomItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  room,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#d9e5e3] space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#fff8e6] border border-[#ffca5e] flex items-center justify-center text-[#7b5800] shadow-sm">
            <span className="material-symbols-outlined text-2xl font-bold">lock</span>
          </div>
          <h3 className="text-lg font-black text-[#16302e]">Sala Protegida</h3>
          <p className="text-xs text-[#727877]">
            Digite a senha para desbloquear e entrar na sala <strong className="text-[#16302e]">"{room.title}"</strong>.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16302e] mb-1.5">
              Senha de Acesso
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha da sala..."
              className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-bold text-[#16302e] focus:outline-none focus:border-[#7b5800]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4f0ee]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[#727877] hover:text-[#16302e] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="px-5 py-2.5 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">key</span>
                  <span>Desbloquear Sala</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
