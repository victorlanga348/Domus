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
      dateStr: 'Just now',
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
          <h3 className="text-xl font-bold text-[#16302e]">Add New Expense</h3>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Description / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supermarket Groceries"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Amount ($)
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
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] bg-white"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
                <option value="Home Fund">Home Fund</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
                Category Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] bg-white"
              >
                <option value="shopping_cart">🛒 Shopping</option>
                <option value="plumbing">🔧 Repair</option>
                <option value="bolt">⚡ Utility</option>
                <option value="wifi">🌐 Internet</option>
                <option value="restaurant">🍕 Dining</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-extrabold uppercase hover:bg-[#5d4200]"
            >
              Add Expense
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
          <h3 className="text-xl font-bold text-[#16302e]">Request Reimbursement</h3>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Amount ($)
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
              Reason / Receipt Note
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Paid for HVAC air filter replacements out of pocket"
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#16302e] text-white text-xs font-extrabold uppercase hover:bg-[#2d4644]"
            >
              Submit Request
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
          <h3 className="text-xl font-bold text-[#16302e]">Add House Rule</h3>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Rule Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shoe-Free Zone"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outdoor shoes must be kept on the entryway rack upon arrival."
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7b5800] text-white text-xs font-extrabold uppercase hover:bg-[#5d4200]"
            >
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Add Family Member Modal --- */
export const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
}> = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('Resident');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const avatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8TYOmIkYXRZide5HArpu-t7fu6HGnjVoYW-fT8kjMkFhmfedQAf43AqakxLaSSxWaHE3OQx1cpw97t-jPZ6bcKS9OshL9ks7FJTYV5g_t4rcu1aca3mxuCSIuYpeoZ4YlglztQm2CayEdq1eBmXIZNvFuS3878_gdkjmSROe2iO_vvdEWifnAA2O-oVoOkBLeksUDLWQ-bUmqrDWfr2WYJPuR9prj3UZJG6gmCDqWGz6Rl6-whI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSRfWa_-6MKjmFp5UY08eDyV4qTAn7mVTxouTxMZWAw4Jyyuiic-WQdHAC1DsG68ZiDmJQk4lQ5t4fTOZWzVwETeEIwx7PeRmFLVJUw-H4uYp-rfwF51tsC7zlssRv64ZxTQXpicdQTO2to-sNTYBoHp_5EerZyQhr7KQzliqM1XqDryqws2d09jEl48HsjWst3N32Votqs-vNF0EcVQAOCrtjVsmhL8B6Hxd9o6e_hTHhfz4iiNU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADpC8k_C79YOfxtPphhWhwt-CWjWWIx1NUWLD-qwpmP3nEKdrRWMCnnH8083bHzDeafNIkzgIjmIsyO38eZrfRSKN0JHntWBQGlFRaa9f325UG8Yo5NTC4KP4X2XBOg6_fAMG80zWwF2ShpncDZCITTRkLs4rnhkCu79Al1GBpyUcy-RNLFn9w1ThRAEHNPEUkyv4jzsrPys1XEN_je5MZ4vQndh9QPV2GB4rZgLl-9zl6_qn4lss',
    ];

    onAddMember({
      name,
      email,
      role,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      balanceOwed: 0,
    });

    setName('');
    setEmail('');
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
          <h3 className="text-xl font-bold text-[#16302e]">Invite Family Member</h3>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Michael Johnson"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="michael@gmail.com"
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] focus:border-[#7b5800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#727877] mb-1">
              Access Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FamilyMember['role'])}
              className="w-full p-3 rounded-xl border border-[#c1c8c6] text-sm text-[#131e1d] bg-white"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="Resident">Resident (Standard)</option>
              <option value="Resident (Restricted)">Resident (Restricted)</option>
              <option value="Guest Access">Guest Access (Temporary)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#414847] hover:bg-[#e4f0ee]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#16302e] text-white text-xs font-extrabold uppercase hover:bg-[#2d4644]"
            >
              Send Invite
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
}> = ({ isOpen, onClose, memberStatuses, familyMembers, onUpdateMemberStatus, onOpenAddMemberModal }) => {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');

  if (!isOpen) return null;

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
                <h3 className="text-lg font-black tracking-tight">Membros da Família</h3>
                <p className="text-xs text-[#727877]">Status e localizações em tempo real</p>
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
            {memberStatuses.map((member) => {
              const matchedFamilyMember = familyMembers.find((m) => m.name === member.name);
              const isEditing = editingMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#f0fcfa] border border-[#e4f0ee] shadow-xs flex flex-col gap-3 transition-all hover:border-[#98b3b0]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#16302e]/20 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#16302e]">{member.name}</h4>
                          {matchedFamilyMember && (
                            <span className="text-[10px] bg-[#e4f0ee] text-[#16302e] px-2 py-0.5 rounded-full font-bold">
                              {matchedFamilyMember.role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#7b5800] font-semibold">
                          <span className="material-symbols-outlined text-sm">{member.icon}</span>
                          <span>{member.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => (isEditing ? setEditingMemberId(null) : handleStartEdit(member))}
                      className="text-xs text-[#7b5800] hover:text-[#5f4400] font-bold px-2.5 py-1 rounded-xl bg-white border border-[#c1c8c6] shadow-2xs hover:border-[#7b5800]"
                    >
                      {isEditing ? 'Cancelar' : 'Alterar Status'}
                    </button>
                  </div>

                  {/* Inline Status Edit Form */}
                  {isEditing && (
                    <form
                      onSubmit={(e) => handleSaveStatus(e, member.id)}
                      className="mt-2 pt-3 border-t border-[#d0dddb] space-y-3 bg-white p-3 rounded-xl border"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#414847] mb-1">
                          Nova Localização / Status
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
                          Salvar Status
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
          {onOpenAddMemberModal && (
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

/* --- View Access Logs Modal --- */
export const AccessLogsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logs = [
    { time: 'Today 02:14 AM', event: 'Front Door Unlocked via Smart Lock', user: 'Alex Johnson' },
    { time: 'Yesterday 10:00 PM', event: 'Night Mode Activated (Auto Schedule)', user: 'DOMUS System' },
    { time: 'Yesterday 04:30 PM', event: 'Guest Pass Generated for Cleaner', user: 'Sarah Johnson' },
    { time: '28 Jul 09:15 AM', event: 'HVAC Eco-Mode Triggered', user: 'DOMUS System' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#d9e5e3] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#16302e]">House Access Logs</h3>
          <button onClick={onClose} className="text-[#727877] hover:text-[#16302e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6">
          {logs.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-[#f0fcfa] rounded-xl border border-[#d0dddb]">
              <div className="flex justify-between text-xs font-bold text-[#16302e]">
                <span>{item.event}</span>
                <span className="text-[#727877] font-normal">{item.time}</span>
              </div>
              <p className="text-[11px] text-[#7b5800] mt-1 font-semibold">User: {item.user}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#16302e] text-white rounded-xl text-xs font-bold uppercase"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};
