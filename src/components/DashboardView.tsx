import React from 'react';
import {
  Camera,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CalendarClock,
  ShieldCheck,
  Receipt,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { CategoryBudget, Expense, RecurringBill } from '../types/expense';
import { KpiMetricsBento } from './KpiMetricsBento';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface DashboardViewProps {
  expenses: Expense[];
  categoryBudgets: CategoryBudget[];
  recurringBills: RecurringBill[];
  daysRemaining: number;
  onNavigate: (tab: string) => void;
  onOpenScanModal: () => void;
  onOpenAddModal: () => void;
  onSelectExpense: (expense: Expense) => void;
  onMarkBillPaid: (bill: RecurringBill) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  categoryBudgets,
  recurringBills,
  daysRemaining,
  onNavigate,
  onOpenScanModal,
  onOpenAddModal,
  onSelectExpense,
  onMarkBillPaid,
}) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const scannedCount = expenses.filter((e) => e.receiptData || e.receiptUrl).length;

  const recentExpenses = expenses.slice(0, 5);

  // Group spending by category
  const categorySpendingMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySpendingMap[e.category] = (categorySpendingMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = [...categoryBudgets].sort((a, b) => {
    const spentA = categorySpendingMap[a.category] || 0;
    const spentB = categorySpendingMap[b.category] || 0;
    return spentB - spentA;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* KPI Bento Strip */}
      <KpiMetricsBento
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        expensesCount={expenses.length}
        scannedCount={scannedCount}
        daysRemaining={daysRemaining}
        onOpenScanModal={onOpenScanModal}
      />

      {/* Main Grid: 8 Cols & 4 Cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Quick Scanner Hero Banner */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5 z-10 max-w-md">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#82f5c1] text-[#005137]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini Vision OCR
                </span>
                <span className="text-xs text-white/60">Instant Ledger Ingestion</span>
              </div>
              <h2 className="font-headline font-bold text-xl text-white">
                Snap or Upload a Receipt
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Extract merchant details, line items, taxes, and assign budget pools automatically in seconds.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onOpenScanModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Launch Receipt Scanner
                </button>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="flex items-center gap-1 text-xs text-[#82f5c1] hover:underline font-semibold"
                >
                  Sample Receipts <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Icon Illustration */}
            <div className="w-28 h-28 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center shrink-0">
              <Receipt className="w-10 h-10 text-[#82f5c1] mb-1" />
              <span className="text-[10px] uppercase font-mono font-bold text-white/90">
                100% Automated
              </span>
            </div>
          </div>

          {/* Recent Ledger Ingress Table */}
          <div className="bg-white rounded-xl border border-[#e5eeff] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0b1c30]">
                  Recent Expenses
                </h3>
                <p className="text-xs text-[#76777d]">
                  Latest outlays recorded across personal & estate accounts
                </p>
              </div>
              <button
                onClick={() => onNavigate('ledger')}
                className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-1"
              >
                View Full Ledger ({expenses.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#45464d] font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {recentExpenses.map((exp) => {
                    const catConfig = CATEGORY_CONFIGS[exp.category];
                    return (
                      <tr
                        key={exp.id}
                        onClick={() => onSelectExpense(exp)}
                        className="hover:bg-[#f8f9ff] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-[#0b1c30] whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#0b1c30] block">
                            {exp.merchant}
                          </span>
                          {exp.notes && (
                            <span className="text-[11px] text-[#76777d] line-clamp-1">
                              {exp.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: catConfig?.bgLight || '#eff4ff',
                              color: catConfig?.textColor || '#0b1c30',
                            }}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {exp.receiptData || exp.receiptUrl ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#82f5c1] text-[#005137]">
                              OCR Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#94a3b8]">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#0b1c30] whitespace-nowrap">
                          ${exp.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Top Spending Categories Progress */}
          <div className="bg-white rounded-xl border border-[#e5eeff] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
                Top Category Budgets
              </h3>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-[11px] font-semibold text-[#4f46e5] hover:underline"
              >
                Analytics →
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {sortedCategories.slice(0, 4).map((cat) => {
                const spent = categorySpendingMap[cat.category] || 0;
                const pct = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
                const isOver = pct > 100;

                return (
                  <div key={cat.category} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0b1c30]">
                        {cat.category}
                      </span>
                      <span className="font-mono text-[#76777d]">
                        ${spent.toFixed(0)} / ${cat.allocated.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOver ? 'bg-[#ba1a1a]' : pct > 80 ? 'bg-[#d97706]' : 'bg-[#006c4a]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bills Queue */}
          <div className="bg-white rounded-xl border border-[#e5eeff] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-[#0F172A]" />
                <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Scheduled Commitments
                </h3>
              </div>
              <button
                onClick={() => onNavigate('recurring')}
                className="text-[11px] font-semibold text-[#4f46e5] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {recurringBills.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="p-3 rounded-xl border border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-semibold text-[#0b1c30] truncate">
                      {bill.title}
                    </h4>
                    <span className="text-[11px] text-[#76777d]">
                      Due on {bill.dueDay}th • ${bill.amount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onMarkBillPaid(bill)}
                    className="px-2.5 py-1 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white text-[11px] font-semibold shrink-0"
                  >
                    Log Paid
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
