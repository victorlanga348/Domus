import React, { useState } from 'react';
import { FamilyMember, ExpenseItem, HouseRule, ActivityLog, HouseTask } from '../types';

/* --- Add Expense Modal --- */
export const AddExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
}> = ({ isOpen, onClose, familyMembers, onAddExpense }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(familyMembers[0]?.name || 'Morador');
  const [icon, setIcon] = useState('shopping_cart');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    onAddExpense({
      title,
      amount: num,
      dateStr: 'Agora mesmo',
      paidBy,
      categoryIcon: icon,
      status: 'Unsettled',
    });

    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">receipt_long</span>
            <h3 className="text-xl font-bold">Registrar Despesa</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Descrição / Título da Despesa
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Compras do Supermercado, Luz, Gás"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Valor (R$ / €)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
                Pago Por
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] bg-white font-bold"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
                <option value="Fundo da Casa">Fundo da Casa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
                Categoria
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] bg-white font-bold"
              >
                <option value="shopping_cart">🛒 Mercado / Compras</option>
                <option value="plumbing">🔧 Manutenção</option>
                <option value="bolt">⚡ Energia / Água</option>
                <option value="wifi">🌐 Internet / TV</option>
                <option value="restaurant">🍕 Alimentação</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-extrabold uppercase hover:bg-[#5d4200]"
            >
              Salvar Despesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Request Reimbursement Modal --- */
export const RequestReimbursementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleForm = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !reason.trim()) return;
    onSubmit(num, reason);
    setAmount('');
    setReason('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">currency_exchange</span>
            <h3 className="text-xl font-bold">Solicitar Reembolso</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Valor (R$ / €)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="75.00"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Motivo / Descrição do Comprovante
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: Paguei produtos de limpeza e lâmpadas da área comum"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#16302e] text-white text-xs font-extrabold uppercase hover:bg-[#2d4644]"
            >
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Add House Rule Modal --- */
export const AddHouseRuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: Omit<HouseRule, 'id' | 'number'>) => void;
}> = ({ isOpen, onClose, onAddRule }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAddRule({ title, description });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#16302e]">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">gavel</span>
            <h3 className="text-xl font-bold">Adicionar Regra da Casa</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Título da Regra
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Silêncio após às 22h, Sapatos na sapateira"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Descrição / Detalhes
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito da regra e como os moradores devem cumpri-la."
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-extrabold uppercase hover:bg-[#5d4200]"
            >
              Salvar Regra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Leadership Transfer Confirmation Modal --- */
export const LeadershipTransferModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetMemberName: string;
}> = ({ isOpen, onClose, onConfirm, targetMemberName }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#16302e] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#ffca5e] relative overflow-hidden"
      >
        {/* Background ambient badge */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#ffca5e]/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center font-black shadow-lg">
            <span className="material-symbols-outlined text-2xl font-black">crown</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Transferência de Liderança</h3>
            <span className="text-[11px] font-bold text-[#ffca5e] uppercase tracking-wider">
              Apenas 1 Admin Geral
            </span>
          </div>
        </div>

        <div className="bg-[#214340] border border-[#2d5753] p-4 rounded-2xl space-y-2 mb-6">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Existe estritamente <strong>1 Admin Geral</strong> por residência.
          </p>
          <p className="text-xs text-[#ffca5e] font-medium leading-relaxed">
            Ao nomear <strong>{targetMemberName}</strong> como novo Admin Geral, você deixará de ser o Admin Geral e passará a ser um <strong>Administrador Normal (Admin)</strong>.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#2d4644] hover:bg-[#3d5c5a] text-white rounded-xl text-xs font-bold transition-all border border-[#486b68]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-[#ffca5e] hover:bg-[#e0b04a] active:scale-98 text-[#755400] rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">verified</span>
            <span>Confirmar Transferência</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Add Family Member Modal --- */
export const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  currentUserRole?: FamilyMember['role'];
  onInitiateTransferGeneralAdmin?: (pendingMember: Omit<FamilyMember, 'id'>) => void;
}> = ({ isOpen, onClose, onAddMember, currentUserRole = 'Admin Geral', onInitiateTransferGeneralAdmin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('Resident');

  if (!isOpen) return null;

  const isGeneralAdmin = currentUserRole === 'Admin Geral';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const avatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    ];

    const newMemberData: Omit<FamilyMember, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      role: role,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      balanceOwed: 0,
    };

    if (role === 'Admin Geral' && isGeneralAdmin && onInitiateTransferGeneralAdmin) {
      onInitiateTransferGeneralAdmin(newMemberData);
      onClose();
      return;
    }

    onAddMember(newMemberData);
    setName('');
    setEmail('');
    setRole('Resident');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#7b5800]">person_add</span>
            <h3 className="text-lg font-black text-[#16302e]">Convidar Novo Membro</h3>
          </div>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Carlos Silva"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-medium text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@exemplo.com"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-medium text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Categoria / Cargo de Acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FamilyMember['role'])}
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-xs font-bold text-[#131e1d] bg-white focus:border-[#7b5800]"
            >
              <option value="Resident">Morador (Residente Padrão)</option>
              <option value="Resident (Restricted)">Morador com Restrição</option>
              <option value="Guest Access">Convidado Temporário</option>
              {isGeneralAdmin && (
                <>
                  <option value="Admin">Admin (Administrador Normal)</option>
                  <option value="Admin Geral">👑 Admin Geral (Transferir Liderança)</option>
                </>
              )}
            </select>
            {!isGeneralAdmin && (
              <p className="text-[11px] text-[#727877] mt-1">
                * Apenas o Admin Geral tem permissão para cadastrar ou promover Administradores.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-bold hover:bg-[#5d4200] transition-all shadow-xs"
            >
              Adicionar Membro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Notifications Drawer --- */
export const NotificationsDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activityLogs: ActivityLog[];
  tasks?: HouseTask[];
  onTaskStatusChange?: (taskId: string, newStatus: HouseTask['status']) => void;
}> = ({ isOpen, onClose, activityLogs, tasks = [], onTaskStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  if (!isOpen) return null;

  // Pending tasks that are upcoming or have advance notice set
  const alertTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm h-full p-5 shadow-2xl flex flex-col justify-between border-l border-[#d9e5e3] max-h-[100vh] overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#e4f0ee]">
            <div className="flex items-center gap-2 text-[#16302e]">
              <span className="material-symbols-outlined text-xl text-[#7b5800]">notifications_active</span>
              <h3 className="text-base font-bold">Alertas & Notificações</h3>
            </div>
            <button onClick={onClose} className="text-[#727877] hover:text-[#16302e] p-1">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#f0fcfa] p-1 rounded-xl border border-[#d0dddb] mb-4">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'alerts'
                  ? 'bg-[#16302e] text-white shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">alarm</span>
              <span>Alertas ({alertTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'notifications'
                  ? 'bg-[#16302e] text-white shadow-xs'
                  : 'text-[#727877] hover:text-[#16302e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Notificações ({activityLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: ALERTAS DE HORÁRIO DE ATIVIDADES */}
          {activeTab === 'alerts' && (
            <div className="space-y-2.5 max-h-[68vh] overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-[#727877] uppercase tracking-wider mb-2">
                Atividades prestes a acontecer ou pendentes
              </p>

              {alertTasks.length === 0 ? (
                <div className="text-center py-10 text-[#727877] space-y-1 bg-[#f0fcfa] rounded-2xl p-4 border border-[#e4f0ee]">
                  <span className="material-symbols-outlined text-3xl text-[#98b3b0]">notifications_off</span>
                  <p className="text-xs font-bold text-[#16302e]">Nenhum alerta de horário no momento.</p>
                  <p className="text-[11px] text-[#98b3b0]">Todas as atividades programadas foram concluídas!</p>
                </div>
              ) : (
                alertTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-[#fffcf5] border border-[#ffca5e] shadow-xs flex flex-col gap-2 hover:border-[#7b5800] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#fff8e6] border border-[#fde396] flex items-center justify-center text-[#7b5800] shrink-0">
                          <span className="material-symbols-outlined text-lg">{task.icon || 'alarm'}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#16302e] truncate">{task.title}</h4>
                          <p className="text-[10px] text-[#727877]">
                            Turno da {task.period === 'morning' ? 'Manhã' : task.period === 'afternoon' ? 'Tarde' : 'Noite'}
                          </p>
                        </div>
                      </div>

                      {task.advanceNotice ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#7b5800] text-white shrink-0 flex items-center gap-1 shadow-2xs">
                          <span className="material-symbols-outlined text-[11px]">timer</span>
                          <span>{task.advanceNotice}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f0fcfa] text-[#16302e] border border-[#d0dddb] shrink-0">
                          Prestes a vencer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f7e6bc] text-[11px]">
                      <div className="flex items-center gap-1 min-w-0">
                        {task.nextMemberAvatar && (
                          <img
                            src={task.nextMemberAvatar}
                            alt={task.nextMember}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                        )}
                        <span className="font-bold text-[#16302e] truncate">
                          Responsável: {task.nextMember || 'Todos'}
                        </span>
                      </div>

                      {onTaskStatusChange && (
                        <button
                          onClick={() => onTaskStatusChange(task.id, 'completed')}
                          className="px-2.5 py-1 bg-[#16302e] hover:bg-[#2d4644] active:scale-95 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all shadow-2xs shrink-0"
                        >
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>Concluir</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICAÇÕES DE EVENTOS / O QUE ACONTECEU */}
          {activeTab === 'notifications' && (
            <div className="space-y-2.5 max-h-[68vh] overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-[#727877] uppercase tracking-wider mb-2">
                Histórico de atividades realizadas no site
              </p>

              {activityLogs.length === 0 ? (
                <div className="text-center py-10 text-[#727877] space-y-1 bg-[#f0fcfa] rounded-2xl p-4 border border-[#e4f0ee]">
                  <span className="material-symbols-outlined text-3xl text-[#98b3b0]">history</span>
                  <p className="text-xs font-bold text-[#16302e]">Nenhuma notificação recente.</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#f0fcfa] border border-[#d0dddb] flex items-start justify-between gap-2 shadow-2xs hover:border-[#16302e] transition-all"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#d0dddb] flex items-center justify-center text-[#16302e] shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-sm">
                          {log.title.includes('concluída') || log.title.includes('Concluir')
                            ? 'task_alt'
                            : log.title.includes('excluída')
                            ? 'delete'
                            : 'notifications'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#16302e] leading-snug">{log.title}</p>
                        <p className="text-[10px] text-[#727877] mt-0.5 font-medium">
                          {log.timeAgo} • Por: {log.author || log.userName || 'Sistema'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 mt-4 bg-[#16302e] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#2d4644] transition-all"
        >
          Fechar Notificações
        </button>
      </div>
    </div>
  );
};

/* --- Family Members Drawer / Modal --- */
export const FamilyMembersDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  memberStatuses: { id: string; name: string; avatar: string; location: string; icon: string }[];
  familyMembers: FamilyMember[];
  onUpdateMemberStatus?: (memberId: string, newLocation: string, newIcon?: string) => void;
  onOpenAddMemberModal?: () => void;
  currentUserRole?: FamilyMember['role'];
  currentUserId?: string;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteToResident?: (memberId: string) => void;
  onTransferGeneralAdmin?: (member: FamilyMember) => void;
  onRemoveMember?: (memberId: string, memberName: string) => void;
}> = ({
  isOpen,
  onClose,
  memberStatuses,
  familyMembers,
  onUpdateMemberStatus,
  onOpenAddMemberModal,
  currentUserRole = 'Admin Geral',
  currentUserId,
  onPromoteToAdmin,
  onDemoteToResident,
  onTransferGeneralAdmin,
  onRemoveMember,
}) => {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');

  if (!isOpen) return null;

  const isGeneralAdmin = currentUserRole === 'Admin Geral';
  const isAdmin = currentUserRole === 'Admin';
  const canAddMember = isGeneralAdmin || isAdmin;

  const handleStartEdit = (member: { id: string; location: string; icon: string }) => {
    setEditingMemberId(member.id);
    setLocationInput(member.location);
    setSelectedIcon(member.icon);
  };

  const handleSaveStatus = (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    onUpdateMemberStatus?.(memberId, locationInput.trim(), selectedIcon);
    setEditingMemberId(null);
  };

  const commonIcons = [
    { icon: 'home', label: 'Em Casa' },
    { icon: 'laptop', label: 'Home Office' },
    { icon: 'work', label: 'Trabalho' },
    { icon: 'fitness_center', label: 'Academia' },
    { icon: 'flight', label: 'Viagem' },
    { icon: 'directions_car', label: 'Trânsito' },
    { icon: 'shopping_bag', label: 'Compras' },
    { icon: 'local_cafe', label: 'Café / Pausa' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between border-l border-[#d9e5e3] max-h-[100vh] overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e4f0ee]">
            <div className="flex items-center gap-2.5 text-[#16302e]">
              <div className="w-10 h-10 rounded-2xl bg-[#e4f0ee] flex items-center justify-center text-[#7b5800]">
                <span className="material-symbols-outlined text-2xl font-bold">group</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Membros da Residência</h3>
                <p className="text-xs text-[#727877]">Status, localizações e governança</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#727877] hover:text-[#16302e] p-2 rounded-full hover:bg-[#e4f0ee] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Member Status List */}
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {familyMembers.map((member) => {
              const matchedStatus = memberStatuses.find(
                (s) => s.id === member.id || s.name === member.name
              );
              const isEditing = editingMemberId === member.id;
              const isTargetGeneralAdmin = member.role === 'Admin Geral';
              const isTargetAdmin = member.role === 'Admin';
              const isTargetResident = member.role === 'Resident';
              const isSelf = member.id === currentUserId;

              const canRemoveThisMember =
                !isSelf &&
                ((isGeneralAdmin && !isTargetGeneralAdmin) ||
                  (isAdmin && !isTargetGeneralAdmin && !isTargetAdmin));

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#f0fcfa] border border-[#e4f0ee] shadow-xs flex flex-col gap-3 transition-all hover:border-[#98b3b0]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#16302e]/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-[#16302e] truncate">{member.name}</h4>
                          {isSelf && (
                            <span className="text-[9px] bg-[#16302e] text-white px-1.5 py-0.5 rounded font-black uppercase">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#7b5800] font-semibold truncate">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            {matchedStatus?.icon || 'home'}
                          </span>
                          <span className="truncate">{matchedStatus?.location || 'Em Casa'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                          isTargetGeneralAdmin
                            ? 'bg-[#ffca5e] text-[#755400] border border-[#d99b00]'
                            : isTargetAdmin
                            ? 'bg-[#16302e] text-white'
                            : 'bg-[#e4f0ee] text-[#16302e]'
                        }`}
                      >
                        {isTargetGeneralAdmin ? '👑 Admin Geral' : isTargetAdmin ? 'Admin' : 'Morador'}
                      </span>

                      {/* Botão de alterar status exclusivamente para o próprio usuário */}
                      {isSelf && (
                        <button
                          onClick={() =>
                            isEditing
                              ? setEditingMemberId(null)
                              : handleStartEdit({
                                  id: member.id,
                                  location: matchedStatus?.location || 'Em Casa',
                                  icon: matchedStatus?.icon || 'home',
                                })
                          }
                          className="text-[11px] text-[#7b5800] hover:text-[#5f4400] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#c1c8c6] shadow-2xs hover:border-[#7b5800] transition-all"
                        >
                          {isEditing ? 'Cancelar' : 'Meu Status'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ações Administrativas de Governança e Remoção */}
                  {(isGeneralAdmin || canRemoveThisMember) && !isSelf && (
                    <div className="pt-2 border-t border-[#d0dddb] flex items-center justify-end gap-2 flex-wrap">
                      {isGeneralAdmin && isTargetResident && onPromoteToAdmin && (
                        <button
                          type="button"
                          onClick={() => onPromoteToAdmin(member.id)}
                          className="px-2 py-1 bg-[#16302e] hover:bg-[#2d4644] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Promover a Administrador Normal"
                        >
                          <span className="material-symbols-outlined text-xs">shield_person</span>
                          <span>Tornar Admin</span>
                        </button>
                      )}

                      {isGeneralAdmin && isTargetAdmin && onDemoteToResident && (
                        <button
                          type="button"
                          onClick={() => onDemoteToResident(member.id)}
                          className="px-2 py-1 bg-white hover:bg-amber-50 text-[#7b5800] border border-[#ffca5e] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Destituir para Morador"
                        >
                          <span className="material-symbols-outlined text-xs">arrow_downward</span>
                          <span>Despromover</span>
                        </button>
                      )}

                      {isGeneralAdmin && onTransferGeneralAdmin && (
                        <button
                          type="button"
                          onClick={() => onTransferGeneralAdmin(member)}
                          className="px-2 py-1 bg-[#fff8e6] hover:bg-[#ffeec2] text-[#7b5800] border border-[#ffca5e] rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                          title="Transferir Liderança da Residência"
                        >
                          <span className="material-symbols-outlined text-xs">crown</span>
                          <span>Passar Admin Geral</span>
                        </button>
                      )}

                      {canRemoveThisMember && onRemoveMember && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id, member.name)}
                          className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Remover Morador da Residência"
                        >
                          <span className="material-symbols-outlined text-xs">person_remove</span>
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Formulário Inline de Edição de Status (Apenas para o próprio morador) */}
                  {isEditing && isSelf && (
                    <form
                      onSubmit={(e) => handleSaveStatus(e, member.id)}
                      className="mt-2 pt-3 border-t border-[#d0dddb] space-y-3 bg-white p-3 rounded-xl border"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#414847] mb-1">
                          Meu Novo Status / Localização
                        </label>
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="ex: Em Home Office, Na Academia, Viajando"
                          className="w-full px-3 py-2 rounded-xl text-xs border border-[#c1c8c6] focus:outline-none focus:border-[#7b5800]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#414847] mb-1">
                          Ícone de Atividade
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {commonIcons.map((item) => (
                            <button
                              key={item.icon}
                              type="button"
                              onClick={() => setSelectedIcon(item.icon)}
                              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                                selectedIcon === item.icon
                                  ? 'bg-[#16302e] text-white border-[#16302e]'
                                  : 'bg-[#f0fcfa] text-[#16302e] border-[#c1c8c6] hover:border-[#7b5800]'
                              }`}
                              title={item.label}
                            >
                              <span className="material-symbols-outlined text-sm">{item.icon}</span>
                              <span className="text-[10px]">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#7b5800] text-white text-xs font-bold hover:bg-[#5f4400]"
                        >
                          Salvar Meu Status
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="space-y-2 pt-4 border-t border-[#e4f0ee]">
          {canAddMember && onOpenAddMemberModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAddMemberModal();
              }}
              className="w-full py-2.5 bg-[#7b5800] hover:bg-[#5f4400] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Convidar Novo Membro</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#16302e] hover:bg-[#2d4644] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
