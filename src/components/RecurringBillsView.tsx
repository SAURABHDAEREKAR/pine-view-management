import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  RefreshCw,
  Bell,
  Trash2,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, RecurringBill } from '../types/expense';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface RecurringBillsViewProps {
  bills: RecurringBill[];
  onAddRecurringBill: (bill: RecurringBill) => void;
  onDeleteRecurringBill: (id: string) => void;
  onMarkBillPaid: (bill: RecurringBill) => void;
}

export const RecurringBillsView: React.FC<RecurringBillsViewProps> = ({
  bills,
  onAddRecurringBill,
  onDeleteRecurringBill,
  onMarkBillPaid,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [category, setCategory] = useState<ExpenseCategory>('Subscriptions');
  const [dueDay, setDueDay] = useState<number>(15);
  const [provider, setProvider] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');

  const totalMonthlyCommitment = bills.reduce((sum, b) => sum + b.amount, 0);
  const todayDate = new Date();
  const currentDay = todayDate.getDate();

  const handleCreateBill = () => {
    if (!title.trim() || amount <= 0) return;
    const newBill: RecurringBill = {
      id: `rec-${Date.now()}`,
      title: title.trim(),
      amount: amount,
      category: category,
      frequency: 'Monthly',
      dueDay: dueDay,
      provider: provider.trim() || title.trim(),
      paymentMethod: paymentMethod,
      autoPay: true,
      status: 'Active',
    };
    onAddRecurringBill(newBill);
    setShowAddModal(false);
    setTitle('');
    setAmount(50);
    setProvider('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              Fixed Outlay Scheduling
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-semibold">
              ${totalMonthlyCommitment.toFixed(2)} / Month Committed
            </span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-[#0b1c30] tracking-tight">
            Recurring Bills & Subscriptions
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Automated tracking of estate fees, broadband, gym, insurance, and streaming memberships with 1-click ledger logging.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Recurring Bill
        </button>
      </div>

      {/* Grid of Recurring Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((bill) => {
          const daysLeft = bill.dueDay >= currentDay ? bill.dueDay - currentDay : 30 - currentDay + bill.dueDay;
          const isDueSoon = daysLeft <= 5;
          const catConfig = CATEGORY_CONFIGS[bill.category];

          return (
            <div
              key={bill.id}
              className="p-5 rounded-xl border border-[#e5eeff] bg-white hover:border-[#cbd5e1] transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: catConfig?.color || '#0F172A' }}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {catConfig?.icon || 'calendar_today'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-[#0b1c30] line-clamp-1">
                      {bill.title}
                    </h3>
                    <span className="text-[11px] text-[#76777d]">
                      {bill.provider}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRecurringBill(bill.id)}
                  className="text-[#94a3b8] hover:text-[#ba1a1a] p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-baseline justify-between py-2 border-y border-[#f1f5f9]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#76777d] block">
                    Amount
                  </span>
                  <span className="font-mono font-bold text-lg text-[#0b1c30]">
                    ${bill.amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#76777d] block">
                    Cycle
                  </span>
                  <span className="text-xs font-semibold text-[#006c4a]">
                    Every month on {bill.dueDay}th
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    isDueSoon ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#eff4ff] text-[#0b1c30]'
                  }`}
                >
                  <CalendarClock className="w-3 h-3" />
                  {daysLeft === 0 ? 'Due Today' : `Due in ${daysLeft} days`}
                </span>

                <button
                  onClick={() => onMarkBillPaid(bill)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-2xs transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Log to Ledger
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e5eeff]">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-[#0b1c30]">
                Add Recurring Commitment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#76777d] hover:text-[#0b1c30]">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                  Bill or Service Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Society Maintenance Dues, Netflix, Broadband"
                  className="w-full h-9 px-3 rounded-xl border border-[#e5eeff] text-xs font-medium text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                    Monthly Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-xl border border-[#e5eeff] text-xs font-mono font-bold text-[#0b1c30] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-9 px-3 rounded-xl border border-[#e5eeff] text-xs font-mono text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-9 px-3 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] outline-none"
                >
                  {Object.keys(CATEGORY_CONFIGS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                  Provider / Entity
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. CivicGate Estate Management"
                  className="w-full h-9 px-3 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBill}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs"
              >
                Save Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
