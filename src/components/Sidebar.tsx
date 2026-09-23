import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  PieChart,
  Receipt,
  CalendarClock,
  FileSpreadsheet,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  totalSpent: number;
  totalBudget: number;
  daysRemaining: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  totalSpent,
  totalBudget,
  daysRemaining,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'scanner',
      label: 'Receipt Scanner',
      icon: ScanLine,
      badge: 'AI Vision',
      badgeColor: 'bg-[#82f5c1] text-[#005137]',
    },
    {
      id: 'analytics',
      label: 'Monthly Budget & Analytics',
      icon: PieChart,
    },
    {
      id: 'ledger',
      label: 'Expense Ledger',
      icon: Receipt,
    },
    {
      id: 'recurring',
      label: 'Recurring & Subscriptions',
      icon: CalendarClock,
    },
    {
      id: 'reports',
      label: 'Audited Statements',
      icon: FileSpreadsheet,
    },
  ];

  const percentSpent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));
  const remaining = Math.max(0, totalBudget - totalSpent);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex flex-col justify-between py-4 select-none">
      <div className="flex flex-col">
        {/* Navigation Group Header */}
        <div className="px-5 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
            Financial Operations
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#82f5c1]' : 'text-[#76777d]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#e5eeff] text-[#0b1c30]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mini-Widget: Budget Gauge & SLA */}
      <div className="px-3 flex flex-col gap-3">
        <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0b1c30] flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-[#006c4a]" />
              Cycle Pace
            </span>
            <span className="text-[11px] font-mono font-bold text-[#0b1c30]">
              {percentSpent}%
            </span>
          </div>

          <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentSpent > 100
                  ? 'bg-[#ba1a1a]'
                  : percentSpent > 80
                  ? 'bg-[#d97706]'
                  : 'bg-[#006c4a]'
              }`}
              style={{ width: `${Math.min(100, percentSpent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-0.5">
            <span>
              Safe: <strong className="font-mono text-[#0b1c30]">${remaining.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
            </span>
            <span className="text-[10px] text-[#76777d]">
              {daysRemaining}d left
            </span>
          </div>
        </div>

        {/* Audit & Compliance Footnote */}
        <div className="flex items-center gap-2 px-2 text-[11px] text-[#76777d]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006c4a]" />
          <span>Ledger encrypted & verified</span>
        </div>
      </div>
    </aside>
  );
};
