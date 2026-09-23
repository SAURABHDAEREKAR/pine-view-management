import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  Camera,
  CheckCircle2,
  Clock,
  Plus,
  Tag,
  CreditCard,
  Building,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types/expense';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface ExpenseLedgerViewProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenScanModal: () => void;
  onSelectExpense: (expense: Expense) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ExpenseLedgerView: React.FC<ExpenseLedgerViewProps> = ({
  expenses,
  onDeleteExpense,
  onOpenAddModal,
  onOpenScanModal,
  onSelectExpense,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'merchant'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = exp.merchant.toLowerCase().includes(q);
          const matchCategory = exp.category.toLowerCase().includes(q);
          const matchNotes = exp.notes?.toLowerCase().includes(q);
          const matchRef = exp.referenceNumber?.toLowerCase().includes(q);
          const matchItems = exp.receiptData?.items?.some((i) => i.name.toLowerCase().includes(q));
          if (!matchMerchant && !matchCategory && !matchNotes && !matchRef && !matchItems) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedPaymentMethod !== 'ALL' && exp.paymentMethod !== selectedPaymentMethod) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'desc'
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          return sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        } else {
          return sortDirection === 'desc'
            ? b.merchant.localeCompare(a.merchant)
            : a.merchant.localeCompare(b.merchant);
        }
      });
  }, [expenses, searchQuery, selectedCategory, selectedPaymentMethod, sortField, sortDirection]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const toggleSort = (field: 'date' | 'amount' | 'merchant') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              Audited Transaction Register
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-semibold">
              {filteredExpenses.length} of {expenses.length} Records
            </span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-[#0b1c30] tracking-tight">
            Expense Ledger
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Full itemized records with receipt attachments, classification tags, and real-time reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan Receipt
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by vendor, memo, item description, reference..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1 bg-[#f8f9ff] px-2.5 py-1.5 rounded-xl border border-[#e5eeff] text-xs">
            <Tag className="w-3.5 h-3.5 text-[#76777d]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(CATEGORY_CONFIGS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex items-center gap-1 bg-[#f8f9ff] px-2.5 py-1.5 rounded-xl border border-[#e5eeff] text-xs">
            <CreditCard className="w-3.5 h-3.5 text-[#76777d]" />
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="bg-transparent font-medium text-[#0b1c30] outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Types</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Apple Pay">Apple Pay</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* Subtotal of matches */}
          <div className="px-3 py-1.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-mono font-bold text-[#0b1c30]">
            Filtered: ${filteredTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-semibold uppercase text-[10px] tracking-wider select-none border-b border-[#e5eeff]">
              <tr>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-[#0b1c30]"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('merchant')}
                  className="py-3 px-4 cursor-pointer hover:text-[#0b1c30]"
                >
                  <div className="flex items-center gap-1">
                    <span>Merchant & Particulars</span>
                    <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                  </div>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Receipt OCR</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0b1c30]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-[#76777d]" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#76777d]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-[#cbd5e1]" />
                      <p className="font-semibold text-sm text-[#0b1c30]">
                        No matching expenses found
                      </p>
                      <p className="text-xs text-[#76777d]">
                        Try adjusting your filters or search keywords.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const catConfig = CATEGORY_CONFIGS[exp.category] || {
                    color: '#64748b',
                    bgLight: '#f1f5f9',
                    textColor: '#334155',
                    icon: 'receipt',
                  };

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-[#f8f9ff] transition-colors group cursor-pointer"
                      onClick={() => onSelectExpense(exp)}
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[#0b1c30] whitespace-nowrap">
                        {exp.date}
                      </td>

                      {/* Merchant & Particulars */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#0b1c30]">
                              {exp.merchant}
                            </span>
                            {exp.isRecurring && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#e0e7ff] text-[#3730a3] font-semibold">
                                Recurring
                              </span>
                            )}
                          </div>
                          {exp.notes && (
                            <span className="text-[11px] text-[#76777d] line-clamp-1">
                              {exp.notes}
                            </span>
                          )}
                          {exp.referenceNumber && (
                            <span className="text-[10px] font-mono text-[#94a3b8]">
                              Ref: {exp.referenceNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: catConfig.bgLight,
                            color: catConfig.textColor,
                          }}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {catConfig.icon}
                          </span>
                          {exp.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-[#45464d] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-[#76777d]" />
                          {exp.paymentMethod}
                        </span>
                      </td>

                      {/* Receipt OCR Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {exp.receiptData ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#82f5c1] text-[#005137] text-[10px] font-bold"
                            title="Receipt attached and OCR verified"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Verified OCR
                          </span>
                        ) : exp.receiptUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] text-[10px] font-medium">
                            <Camera className="w-3 h-3" />
                            Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#94a3b8]">
                            Manual
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-[#0b1c30]">
                          ${exp.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectExpense(exp)}
                            className="p-1 rounded-lg text-[#76777d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
                            title="View Full Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 rounded-lg text-[#76777d] hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
