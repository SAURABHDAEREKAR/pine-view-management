import React from 'react';
import { Camera, Plus, Download, Bell, Building2, Search } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenScanModal: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCycle: string;
  onCycleChange: (cycle: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenScanModal,
  onOpenAddModal,
  onOpenExportModal,
  searchQuery,
  onSearchChange,
  selectedCycle,
  onCycleChange,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] h-16">
      <div className="h-full w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Brand & Society / Ledger Selector */}
        <div className="flex items-center gap-3 min-w-[240px] shrink-0">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1E293B] transition-colors">
              <span className="material-symbols-outlined text-lg leading-none">account_balance_wallet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-lg tracking-tight text-[#0b1c30]">
                CivicSpend
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#45464d] border border-[#d3e4fe]">
                Ledger
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] text-xs text-[#0b1c30]">
            <Building2 className="w-3.5 h-3.5 text-[#006c4a]" />
            <select
              value={selectedCycle}
              onChange={(e) => onCycleChange(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer text-[#0b1c30]"
            >
              <option value="2026-09">Sep 2026 • Palm Grove HQ</option>
              <option value="2026-08">Aug 2026 • Palm Grove HQ</option>
              <option value="2026-07">Jul 2026 • Palm Grove HQ</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search expenses, merchants, receipts, categories (e.g. Whole Foods, INV-1042)..."
              className="w-full h-9 pl-9 pr-4 bg-white font-body text-xs lg:text-sm rounded-xl border border-[#e5eeff] placeholder:text-[#76777d] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]/40 shadow-xs transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#76777d] hover:text-[#0b1c30]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Scan Receipt Button */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95"
            title="Scan Receipt with AI OCR"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Receipt</span>
            <span className="inline-flex items-center px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono">AI</span>
          </button>

          {/* Quick Add Expense */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenExportModal}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#e5eeff] text-xs font-medium shadow-xs transition-colors"
            title="Export Audited Statement"
          >
            <Download className="w-3.5 h-3.5 text-[#76777d]" />
            <span>Export</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => onNavigate('recurring')}
            className="relative p-2 rounded-xl text-[#45464d] hover:bg-[#eff4ff] transition-colors"
            title="Recurring bill notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c4a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006c4a]"></span>
            </span>
          </button>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#e5eeff]">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#e5eeff] bg-[#0F172A] flex items-center justify-center text-white text-xs font-bold">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrfWxcu3UcaR2r6eFlVL35qJT4m7HkZMLH52mlZ2O8HM0FHGAXrd2uEJd0AHpfgsM9QZzbxm8ci-qCh_NchAiCEO-tbokjeDtusO3p8aX80-PURYIFIrIt2IDXB95gBRE72ru8AJNE3ICwOgp2Mhz_gt9b-kvps_Ox3teTqKClBS30bGeDyJco4T71r0cLuTcT9h6QBP7flDxFEuxXg4uiKCPZmWGqNRw9NO9JbNTj4Vk4lpfhvUC6"
                alt="Account Holder"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="select-none">AO</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
