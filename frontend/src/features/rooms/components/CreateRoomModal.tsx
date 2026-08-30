import React, { useState } from 'react';
import type { CreateRoomInput } from '../types/index.js';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateRoomInput) => Promise<void>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onCreate({
        title: title.trim(),
        password: password.trim(),
      });
      setTitle('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar sala.');
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
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#d9e5e3] space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center border-b border-[#e4f0ee] pb-3">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-2xl text-[#7b5800]">meeting_room</span>
            <h3 className="text-base font-black">Criar Nova Sala</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e] p-1">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16302e] mb-1">
              Nome da Sala / Tópico
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Planejamento de Compras, Reforma da Sala..."
              className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16302e] mb-1">
              Senha de Acesso à Sala
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Defina uma senha de 4+ caracteres..."
              className="w-full p-3 bg-[#f0fcfa] border border-[#c1c8c6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#7b5800]"
            />
            <p className="text-[11px] text-[#727877] mt-1">
              Você será automaticamente definido como <strong className="text-[#7b5800]">Arquiteto</strong> desta sala.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4f0ee]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[#727877] hover:text-[#16302e] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !password.trim()}
              className="px-5 py-2.5 bg-[#7b5800] hover:bg-[#5d4200] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Criando Sala...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Criar Sala</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
