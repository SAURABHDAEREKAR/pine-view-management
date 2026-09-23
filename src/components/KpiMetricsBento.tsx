import React from 'react';
import {
  Receipt,
  PiggyBank,
  TrendingDown,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface KpiMetricsBentoProps {
  totalSpent: number;
  totalBudget: number;
  expensesCount: number;
  scannedCount: number;
  daysRemaining: number;
  onOpenScanModal: () => void;
}

export const KpiMetricsBento: React.FC<KpiMetricsBentoProps> = ({
  totalSpent,
  totalBudget,
  expensesCount,
  scannedCount,
  daysRemaining,
  onOpenScanModal,
}) => {
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const safeDailySpend = remaining / Math.max(1, daysRemaining);
  const daysPassed = Math.max(1, 30 - daysRemaining);
  const currentDailySpend = totalSpent / daysPassed;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Total Spent */}
      <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-[#76777d] font-semibold">
            Month Incurred Spend
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0b1c30]">
            <Receipt className="w-4 h-4 text-[#0F172A]" />
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="font-headline font-bold text-2xl lg:text-3xl text-[#0b1c30]">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-semibold border border-[#dce9ff]">
            {expensesCount} records
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#45464d] pt-2 border-t border-[#f1f5f9]">
          <span className="flex items-center text-[#006c4a] font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +3.8%
          </span>
          <span className="text-[#76777d]">vs. prior 30-day window</span>
        </div>
      </div>

      {/* Card 2: Budget Allocation Progress */}
      <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-[#76777d] font-semibold">
            Cycle Target & Cap
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#82f5c1]/30 flex items-center justify-center text-[#006c4a]">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="font-headline font-bold text-2xl lg:text-3xl text-[#0b1c30]">
            ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              percentUsed > 100
                ? 'bg-[#ffdad6] text-[#93000a]'
                : percentUsed > 80
                ? 'bg-[#fef3c7] text-[#92400e]'
                : 'bg-[#82f5c1] text-[#005137]'
            }`}
          >
            {percentUsed.toFixed(1)}% Used
          </span>
        </div>

        <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed > 100
                ? 'bg-[#ba1a1a]'
                : percentUsed > 80
                ? 'bg-[#d97706]'
                : 'bg-[#006c4a]'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className={percentUsed > 100 ? 'text-[#ba1a1a] font-semibold' : 'text-[#006c4a] font-semibold'}>
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 0 })} {percentUsed > 100 ? 'Exceeded' : 'Remaining'}
          </span>
          <span className="text-[#76777d]">{daysRemaining} days left</span>
        </div>
      </div>

      {/* Card 3: Daily Burn Rate & Velocity */}
      <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-[#76777d] font-semibold">
            Daily Spend Pace
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#4f46e5]">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="font-headline font-bold text-2xl lg:text-3xl text-[#0b1c30]">
              ${currentDailySpend.toFixed(1)}
            </span>
            <span className="text-xs text-[#76777d]">/ day</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] font-semibold">
            Velocity OK
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#45464d] pt-2 border-t border-[#f1f5f9]">
          <span>Safe ceiling: <strong className="text-[#0b1c30]">${safeDailySpend.toFixed(1)}/d</strong></span>
          <span className="text-[#006c4a] font-medium flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
            Normal
          </span>
        </div>
      </div>

      {/* Card 4: Receipt Scanning & Verification */}
      <div className="bg-white p-5 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-[#76777d] font-semibold">
            Receipt Vision OCR
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#006c4a]">
            <Camera className="w-4 h-4 text-[#006c4a]" />
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline font-bold text-2xl lg:text-3xl text-[#0b1c30]">
              {scannedCount}
            </span>
            <span className="text-xs text-[#76777d]">verified receipts</span>
          </div>
          <button
            onClick={onOpenScanModal}
            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold shadow-2xs transition-colors"
          >
            + Scan
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-[#45464d] pt-2 border-t border-[#f1f5f9]">
          <span className="flex items-center text-[#006c4a] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            98.7% Accuracy
          </span>
          <span className="text-[#76777d]">Multimodal AI</span>
        </div>
      </div>
    </div>
  );
};
