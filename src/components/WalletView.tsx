import React, { useState } from 'react';
import { ExpenseItem, FamilyMember } from '../types';

interface WalletViewProps {
  expenses: ExpenseItem[];
  familyMembers: FamilyMember[];
  onSettleExpense: (id: string) => void;
  onOpenAddExpenseModal: () => void;
  onOpenReimbursementModal: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  expenses,
  familyMembers,
  onSettleExpense,
  onOpenAddExpenseModal,
  onOpenReimbursementModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Settled'>('All');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'Pending') return matchesSearch && e.status === 'Unsettled';
    if (filterStatus === 'Settled') return matchesSearch && e.status === 'Settled';
    return matchesSearch;
  });

  const homeFundBalance = 1240.00;
  const monthlyTarget = 2000.00;
  const spentJuly = 760.00;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm border border-[#d9e5e3]">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727877]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c1c8c6] focus:border-[#7b5800] focus:ring-1 focus:ring-[#7b5800] bg-transparent text-sm text-[#131e1d]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-[#2d4644] text-[#98b3b0] text-xs font-bold flex items-center gap-2 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>

          <div className="flex bg-[#e4f0ee] rounded-xl p-1">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'All'
                  ? 'bg-white text-[#16302e] shadow-sm'
                  : 'text-[#414847] hover:text-[#16302e]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Pending')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'Pending'
                  ? 'bg-white text-[#16302e] shadow-sm'
                  : 'text-[#414847] hover:text-[#16302e]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('Settled')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'Settled'
                  ? 'bg-white text-[#16302e] shadow-sm'
                  : 'text-[#414847] hover:text-[#16302e]'
              }`}
            >
              Settled
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Transactions vs Balance Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Expenses */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-end mb-1">
            <div>
              <h3 className="text-xl font-bold text-[#16302e]">Recent Expenses</h3>
              <p className="text-xs text-[#727877] mt-0.5">
                Showing last {filteredExpenses.length} activities
              </p>
            </div>
            <button className="text-xs font-bold uppercase tracking-wider text-[#7b5800] hover:underline">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredExpenses.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-[#c1c8c6] text-[#727877]">
                <p className="text-sm font-medium">Nenhuma despesa encontrada com esse filtro.</p>
              </div>
            ) : (
              filteredExpenses.map((expense) => {
                const isUnsettled = expense.status === 'Unsettled';
                return (
                  <div
                    key={expense.id}
                    className={`bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-[#d9e5e3] hover:-translate-y-0.5 transition-all ${
                      isUnsettled ? 'border-l-4 border-l-[#16302e]' : 'border-l-4 border-l-[#7b5800]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#e4f0ee] flex items-center justify-center text-[#16302e]">
                        <span className="material-symbols-outlined text-2xl">
                          {expense.categoryIcon}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#131e1d]">
                          {expense.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#727877] mt-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{expense.dateStr}</span>
                          <span className="mx-1">•</span>
                          <span>Paid by {expense.paidBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-lg font-black text-[#16302e]">
                          ${expense.amount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 ${
                            isUnsettled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-[#2d4644] text-[#98b3b0]'
                          }`}
                        >
                          {expense.status}
                        </span>
                      </div>

                      {isUnsettled ? (
                        <button
                          onClick={() => onSettleExpense(expense.id)}
                          className="px-4 py-2 rounded-xl bg-[#7b5800] text-white text-xs font-bold hover:bg-[#5d4200] transition-colors shadow-sm"
                        >
                          Settle
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl border border-[#c1c8c6] text-[#727877] text-xs font-bold cursor-default"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Home Fund & Actions */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Balance Card */}
          <div className="bg-[#16302e] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-[#2d4644]">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffca5e] rounded-full opacity-10 blur-2xl pointer-events-none"></div>
            <h3 className="text-xs font-bold text-[#b0ccc9] uppercase tracking-wider mb-2">
              HOME FUND BALANCE
            </h3>
            <p className="text-4xl font-black mb-6 tracking-tight">
              ${homeFundBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            <div className="flex justify-between items-end border-t border-[#2d4644] pt-4">
              <div>
                <p className="text-[10px] font-bold text-[#b0ccc9] uppercase mb-1">
                  Monthly Target
                </p>
                <p className="text-sm font-bold">${monthlyTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#b0ccc9] uppercase mb-1">
                  Spent (July)
                </p>
                <p className="text-sm font-bold text-[#f3bf54]">${spentJuly.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenAddExpenseModal}
              className="bg-[#7b5800] text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#5d4200] transition-all shadow-md group"
            >
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                add_circle
              </span>
              <span className="text-xs font-extrabold uppercase">Add Expense</span>
            </button>

            <button
              onClick={onOpenReimbursementModal}
              className="bg-white border border-[#c1c8c6] text-[#16302e] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#7b5800] transition-all shadow-sm group"
            >
              <span className="material-symbols-outlined text-3xl text-[#7b5800] group-hover:scale-110 transition-transform">
                currency_exchange
              </span>
              <span className="text-xs font-extrabold uppercase text-center leading-tight">
                Request<br />Reimbursement
              </span>
            </button>
          </div>

          {/* Member Balances Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d9e5e3]">
            <h4 className="text-base font-bold text-[#16302e] mb-4">
              Member Balances
            </h4>

            <div className="space-y-4">
              {familyMembers.map((member) => {
                const bal = member.balanceOwed || 0;
                let text = 'Settled';
                let style = 'text-[#727877]';

                if (bal < 0) {
                  text = `Owes $${Math.abs(bal).toFixed(2)}`;
                  style = 'text-[#7b5800] font-bold';
                } else if (bal > 0) {
                  text = `Gets $${bal.toFixed(2)}`;
                  style = 'text-[#16302e] font-bold';
                }

                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-semibold text-[#131e1d]">
                        {member.name} {member.isPrimary ? '(You)' : ''}
                      </span>
                    </div>
                    <span className={`text-xs ${style}`}>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
