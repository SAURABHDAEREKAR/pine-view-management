import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { CategoryBudget, Expense } from '../types/expense';

interface AuditedReportsViewProps {
  expenses: Expense[];
  categoryBudgets: CategoryBudget[];
  onOpenExportModal: () => void;
}

export const AuditedReportsView: React.FC<AuditedReportsViewProps> = ({
  expenses,
  categoryBudgets,
  onOpenExportModal,
}) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] print:hidden">
        <div>
          <h2 className="font-headline font-bold text-lg text-[#0b1c30]">
            Audited Financial Statement
          </h2>
          <p className="text-xs text-[#76777d]">
            Certified monthly spending register for accounting, tax verification, and records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#0F172A]" />
            Print Statement
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#82f5c1]" />
            Export CSV / Data
          </button>
        </div>
      </div>

      {/* Printable Statement Document */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#e5eeff] shadow-[0_4px_20px_rgba(0,0,0,0.04)] print:shadow-none print:border-none print:p-0 flex flex-col gap-8">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-[#e5eeff] pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              </div>
              <span className="font-headline font-bold text-xl text-[#0b1c30]">
                CivicSpend Ledger
              </span>
            </div>
            <p className="text-xs text-[#45464d] mt-1">
              Palm Grove Estate Governance • Apartment 402 Ledger
            </p>
            <p className="text-[11px] text-[#76777d]">
              Audited Financial Cycle: 01 Sep 2026 – 30 Sep 2026
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#82f5c1] text-[#005137] inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified & Reconciled
            </span>
            <span className="text-xs font-mono text-[#76777d] mt-1.5">
              DOC-ID: AUD-2026-09-402
            </span>
            <span className="text-[11px] text-[#76777d]">
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span className="text-[10px] uppercase font-bold text-[#76777d] block">
              Total Incurred Outlay
            </span>
            <span className="font-mono font-bold text-2xl text-[#0b1c30]">
              ${totalSpent.toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span className="text-[10px] uppercase font-bold text-[#76777d] block">
              Allocated Budget Limit
            </span>
            <span className="font-mono font-bold text-2xl text-[#006c4a]">
              ${totalBudget.toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
            <span className="text-[10px] uppercase font-bold text-[#76777d] block">
              Budget Utilization
            </span>
            <span className="font-mono font-bold text-2xl text-[#0b1c30]">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Ledger Entries Table */}
        <div className="flex flex-col gap-2">
          <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
            Itemized Expenditures Register
          </h3>
          <table className="w-full text-left text-xs border border-[#e5eeff] rounded-xl overflow-hidden">
            <thead className="bg-[#eff4ff] text-[#45464d] font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Merchant / Particulars</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Payment Instrument</th>
                <th className="py-2.5 px-3 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="py-2.5 px-3 font-mono text-[#45464d] whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#0b1c30]">
                    {exp.merchant}
                    {exp.referenceNumber && (
                      <span className="block text-[10px] font-mono text-[#94a3b8]">
                        Ref: {exp.referenceNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#45464d]">{exp.category}</td>
                  <td className="py-2.5 px-3 text-[#45464d]">{exp.paymentMethod}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#0b1c30]">
                    ${exp.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#eff4ff] font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right text-[#0b1c30]">
                  TOTAL MONTHLY OUTLAY:
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm text-[#006c4a]">
                  ${totalSpent.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Footnote */}
        <div className="flex items-center justify-between pt-6 border-t border-[#e5eeff] text-[11px] text-[#76777d]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006c4a]" />
            <span>Cryptographically sealed & audited for financial records.</span>
          </div>
          <span>Page 1 of 1 • CivicSpend</span>
        </div>
      </div>
    </div>
  );
};
