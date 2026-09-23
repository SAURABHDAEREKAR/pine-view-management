import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { CategoryBudget, Expense, ExpenseCategory } from '../types/expense';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface BudgetAnalyticsViewProps {
  expenses: Expense[];
  categoryBudgets: CategoryBudget[];
  onUpdateCategoryBudget: (category: ExpenseCategory, newAllocated: number) => void;
  daysRemaining: number;
}

export const BudgetAnalyticsView: React.FC<BudgetAnalyticsViewProps> = ({
  expenses,
  categoryBudgets,
  onUpdateCategoryBudget,
  daysRemaining,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<ExpenseCategory | null>(null);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<ExpenseCategory | null>(null);
  const [newBudgetVal, setNewBudgetVal] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    healthScore: number;
    projectedMonthEnd: number;
    safeDailySpend: number;
    status: string;
    insights: string[];
    recommendations: string[];
  } | null>(null);

  // Calculate actual spending per category
  const categorySpendingMap: Record<ExpenseCategory, number> = {} as any;
  expenses.forEach((exp) => {
    categorySpendingMap[exp.category] = (categorySpendingMap[exp.category] || 0) + exp.amount;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const safeDailySpend = remaining / Math.max(1, daysRemaining);

  // Prepare Donut Chart data
  const nonZeroCategories = categoryBudgets
    .map((b) => ({
      category: b.category,
      spent: categorySpendingMap[b.category] || 0,
      allocated: b.allocated,
      color: CATEGORY_CONFIGS[b.category]?.color || b.color,
    }))
    .filter((item) => item.spent > 0);

  // SVG Donut calculations
  const circumference = 2 * Math.PI * 38; // r = 38
  let cumulativePercent = 0;
  const donutSegments = nonZeroCategories.map((item) => {
    const fraction = totalSpent > 0 ? item.spent / totalSpent : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += fraction;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      percent: Math.round(fraction * 100),
    };
  });

  // Daily cumulative spend for trajectory graph (30 days)
  const daysInMonth = 30;
  const dailySpendArray: number[] = new Array(daysInMonth).fill(0);
  expenses.forEach((exp) => {
    const day = parseInt(exp.date.split('-')[2], 10);
    if (!isNaN(day) && day >= 1 && day <= daysInMonth) {
      dailySpendArray[day - 1] += exp.amount;
    }
  });

  let runningTotal = 0;
  const cumulativeDailySpend = dailySpendArray.map((dailyVal, idx) => {
    // Only show up to current day (approx day 22)
    if (idx + 1 > 30 - daysRemaining) return null;
    runningTotal += dailyVal;
    return runningTotal;
  });

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget,
          totalSpent,
          daysRemaining,
          currentMonth: 'September 2026',
          categoryBreakdowns: categoryBudgets.map((b) => ({
            category: b.category,
            allocated: b.allocated,
            spent: categorySpendingMap[b.category] || 0,
          })),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data);
      }
    } catch (e) {
      console.error('Failed to run AI analysis:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenEdit = (category: ExpenseCategory, currentAllocated: number) => {
    setEditingBudgetCategory(category);
    setNewBudgetVal(currentAllocated);
  };

  const handleSaveBudget = () => {
    if (editingBudgetCategory && newBudgetVal >= 0) {
      onUpdateCategoryBudget(editingBudgetCategory, newBudgetVal);
      setEditingBudgetCategory(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#0b1c30]">
              <Layers className="w-3 h-3 mr-1 text-[#006c4a]" />
              Fund Deployment Analytics
            </span>
            <span className="text-xs text-[#76777d]">FY 2026 • Cycle Ends in {daysRemaining} days</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-[#0b1c30] tracking-tight">
            Monthly Budget & Expense Analytics
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Monitor category spending caps, daily burn trajectories, and automated AI financial health audits.
          </p>
        </div>

        <button
          onClick={runAiAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#82f5c1]" />
          )}
          <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Run AI Budget Audit'}</span>
        </button>
      </div>

      {/* Row 1: Donut Allocation + AI Health Score Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Donut Chart & Category Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e5eeff] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div>
              <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                Budget Allocation & Outlay Distribution
              </h2>
              <p className="text-xs text-[#76777d]">
                Relative share of actual incurred expenses across categories
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#0b1c30] font-semibold border border-[#dce9ff]">
              100% Tracked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="md:col-span-6 flex items-center justify-center relative py-2">
              <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#eff4ff"
                  strokeWidth="11"
                />

                {/* Segments */}
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="11"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    opacity={hoveredCategory && hoveredCategory !== seg.category ? 0.4 : 1}
                    onMouseEnter={() => setHoveredCategory(seg.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                ))}
              </svg>

              {/* Center Metrics Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-[#76777d] font-bold">
                  {hoveredCategory || 'Total Spend'}
                </span>
                <span className="font-headline font-bold text-xl lg:text-2xl text-[#0b1c30]">
                  ${hoveredCategory
                    ? (categorySpendingMap[hoveredCategory] || 0).toFixed(0)
                    : totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] text-[#006c4a] font-semibold">
                  {hoveredCategory
                    ? `${Math.round(((categorySpendingMap[hoveredCategory] || 0) / (totalSpent || 1)) * 100)}% of Outlay`
                    : `${overallPercent.toFixed(1)}% of Budget`}
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="md:col-span-6 flex flex-col gap-2">
              {donutSegments.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    hoveredCategory === item.category ? 'bg-[#eff4ff]' : 'hover:bg-[#f8f9ff]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-[#0b1c30] truncate">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-[#0b1c30]">
                      ${item.spent.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#76777d] w-8 text-right font-mono">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Financial Health & Advisory Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e5eeff] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#006c4a]" />
              <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                AI Financial Advisor
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#82f5c1] text-[#005137]">
              {aiAnalysis ? aiAnalysis.status : 'Audit Ready'}
            </span>
          </div>

          {/* Health Score Pill */}
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                Budget Health Score
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-headline font-bold text-3xl text-[#006c4a]">
                  {aiAnalysis?.healthScore || (overallPercent > 100 ? 58 : overallPercent > 80 ? 76 : 94)}
                </span>
                <span className="text-xs text-[#76777d]">/ 100</span>
              </div>
              <span className="text-xs text-[#0b1c30] font-medium mt-1">
                Safe remaining allowance: <strong className="font-mono text-[#006c4a]">${safeDailySpend.toFixed(2)}/day</strong>
              </span>
            </div>

            <div className="w-14 h-14 rounded-full border-4 border-[#006c4a] flex items-center justify-center bg-white shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-[#006c4a]" />
            </div>
          </div>

          {/* Insights List */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#76777d]">
              Key Spending Insights
            </span>
            {(aiAnalysis?.insights || [
              `You have spent ${overallPercent.toFixed(0)}% of your monthly $${totalBudget.toLocaleString()} allocation with ${daysRemaining} days remaining.`,
              'Housing & Utilities and Groceries constitute your top essential cost centers.',
              'Discretionary Dining & Food is within target parameters.',
            ]).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#45464d]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#006c4a] mt-1.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#f1f5f9]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#76777d]">
              Actionable Recommendations
            </span>
            {(aiAnalysis?.recommendations || [
              'Keep daily discretionary spend under the safe limit for the remaining cycle.',
              'Review upcoming recurring maintenance and broadband bills before month-end.',
              `Consider transferring the expected surplus ($${remaining.toFixed(0)}) to reserve savings.`,
            ]).map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#0b1c30] font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#4f46e5] shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Category Budget Caps & Progress Bars */}
      <div className="bg-white rounded-xl border border-[#e5eeff] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9]">
          <div>
            <h2 className="font-headline font-bold text-base text-[#0b1c30]">
              Category Budget Thresholds
            </h2>
            <p className="text-xs text-[#76777d]">
              Track real-time spend vs budget allocations. Click "Adjust" on any category to change limits.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]" /> &lt;80% Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /> 80-100% Caution
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" /> &gt;100% Over
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((cat) => {
            const spent = categorySpendingMap[cat.category] || 0;
            const pct = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
            const isOver = pct > 100;
            const isNear = pct >= 80 && pct <= 100;
            const diff = cat.allocated - spent;

            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl border border-[#e5eeff] bg-white hover:border-[#cbd5e1] transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: CATEGORY_CONFIGS[cat.category]?.color || cat.color }}
                    >
                      <span className="material-symbols-outlined text-base">
                        {CATEGORY_CONFIGS[cat.category]?.icon || 'label'}
                      </span>
                    </div>
                    <span className="font-semibold text-xs text-[#0b1c30]">
                      {cat.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(cat.category, cat.allocated)}
                    className="text-[11px] font-semibold text-[#4f46e5] hover:underline"
                  >
                    Adjust
                  </button>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-[#0b1c30]">
                    ${spent.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#76777d]">
                    of ${cat.allocated.toFixed(0)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#ba1a1a]' : isNear ? 'bg-[#d97706]' : 'bg-[#006c4a]'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#f8f9ff]">
                  <span className={isOver ? 'text-[#ba1a1a] font-semibold' : 'text-[#006c4a] font-semibold'}>
                    {isOver ? `+$${Math.abs(diff).toFixed(0)} Over` : `$${diff.toFixed(0)} Left`}
                  </span>
                  <span className="text-[#76777d] font-mono">{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Daily Spending Velocity Trajectory Curve */}
      <div className="bg-white rounded-xl border border-[#e5eeff] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
          <div>
            <h2 className="font-headline font-bold text-base text-[#0b1c30]">
              Cumulative Spend Trajectory vs. Safe Linear Pace
            </h2>
            <p className="text-xs text-[#76777d]">
              Day 1 through Day 30 spending path compared to safe linear target
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#006c4a]" /> Actual Incurred
            </span>
            <span className="flex items-center gap-1.5 text-[#76777d]">
              <span className="w-3 h-0.5 bg-[#cbd5e1] border-dashed" /> Linear Safe Target
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-56 pt-2">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="40" y1="20" x2="590" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="65" x2="590" y2="65" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="110" x2="590" y2="110" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="155" x2="590" y2="155" stroke="#f1f5f9" strokeWidth="1" />

            {/* Y axis labels */}
            <text x="35" y="24" textAnchor="end" fontSize="10" fill="#94a3b8">$4.0k</text>
            <text x="35" y="69" textAnchor="end" fontSize="10" fill="#94a3b8">$3.0k</text>
            <text x="35" y="114" textAnchor="end" fontSize="10" fill="#94a3b8">$2.0k</text>
            <text x="35" y="159" textAnchor="end" fontSize="10" fill="#94a3b8">$1.0k</text>

            {/* Ideal Linear Path */}
            <line
              x1="50"
              y1="190"
              x2="580"
              y2="30"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Actual Spend Area and Line */}
            {(() => {
              const maxVal = Math.max(totalBudget, 4500);
              const points = cumulativeDailySpend
                .map((val, idx) => {
                  if (val === null) return null;
                  const x = 50 + (idx / 29) * 530;
                  const y = 190 - (val / maxVal) * 160;
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');

              if (!points) return null;

              const firstPt = points.split(' ')[0];
              const lastPt = points.split(' ').slice(-1)[0];
              const lastX = lastPt.split(',')[0];
              const areaPath = `M 50,190 L ${points} L ${lastX},190 Z`;

              return (
                <>
                  <path d={areaPath} fill="#82f5c1" fillOpacity="0.25" />
                  <polyline
                    fill="none"
                    stroke="#006c4a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {/* Current Day Point */}
                  <circle
                    cx={lastX}
                    cy={lastPt.split(',')[1]}
                    r="5"
                    fill="#006c4a"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingBudgetCategory && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e5eeff]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#006c4a]" />
                <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Adjust Category Budget
                </h3>
              </div>
              <button
                onClick={() => setEditingBudgetCategory(null)}
                className="text-[#76777d] hover:text-[#0b1c30]"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#0b1c30] block mb-1">
                {editingBudgetCategory}
              </span>
              <p className="text-xs text-[#76777d] mb-3">
                Current month allocation:
              </p>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <input
                  type="number"
                  step="50"
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] font-mono font-bold text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingBudgetCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
