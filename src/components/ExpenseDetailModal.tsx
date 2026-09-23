import React from 'react';
import {
  X,
  Store,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  Trash2,
  FileText,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Expense } from '../types/expense';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onDelete,
}) => {
  if (!expense) return null;

  const catConfig = CATEGORY_CONFIGS[expense.category];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-[#e5eeff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: catConfig?.color || '#0F172A' }}
            >
              <span className="material-symbols-outlined text-base">
                {catConfig?.icon || 'receipt'}
              </span>
            </span>
            <div>
              <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                {expense.merchant}
              </h2>
              <span className="text-[11px] text-[#76777d] font-mono">
                {expense.referenceNumber || `EXP-${expense.id.slice(-6)}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded-lg hover:bg-[#eff4ff]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Main Hero Details */}
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#76777d] block">
                Total Transaction Value
              </span>
              <span className="font-mono font-bold text-3xl text-[#006c4a]">
                ${expense.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: catConfig?.bgLight,
                  color: catConfig?.textColor,
                }}
              >
                {expense.category}
              </span>
              <span className="text-xs text-[#76777d] block mt-1 font-mono">
                {expense.date}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-[#e5eeff] bg-white">
              <span className="text-[10px] uppercase font-bold text-[#76777d] block mb-1">
                Payment Instrument
              </span>
              <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#76777d]" />
                {expense.paymentMethod}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[#e5eeff] bg-white">
              <span className="text-[10px] uppercase font-bold text-[#76777d] block mb-1">
                OCR Verification Status
              </span>
              <span className="font-semibold text-[#006c4a] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006c4a]" />
                {expense.receiptData ? 'Audit Verified' : 'Manually Logged'}
              </span>
            </div>
          </div>

          {/* Itemized lines if available */}
          {expense.receiptData?.items && expense.receiptData.items.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#006c4a]" />
                Line Items Breakdown ({expense.receiptData.items.length})
              </span>
              <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8f9ff] text-[#76777d] font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {expense.receiptData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-[#0b1c30]">{item.name}</td>
                        <td className="py-2 px-2 text-center text-[#76777d] font-mono">{item.quantity}</td>
                        <td className="py-2 px-2 text-right text-[#76777d] font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-[#0b1c30]">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Receipt Image if available */}
          {expense.receiptUrl && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#0b1c30]">
                Attached Receipt Photo
              </span>
              <div className="rounded-xl overflow-hidden border border-[#e5eeff] bg-[#f8f9ff] max-h-56 flex items-center justify-center p-2">
                <img
                  src={expense.receiptUrl}
                  alt="Receipt"
                  className="max-h-52 w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {expense.notes && (
            <div>
              <span className="text-[10px] uppercase font-bold text-[#76777d] block mb-1">
                Memo & Notes
              </span>
              <p className="text-xs text-[#0b1c30] bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                {expense.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
          <button
            onClick={() => {
              onDelete(expense.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Record
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
