import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  Store,
  Tag,
  CreditCard,
  FileText,
  Upload,
  Camera,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types/expense';
import { CATEGORY_CONFIGS } from '../data/initialData';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [merchant, setMerchant] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount || Number(amount) <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      merchant: merchant.trim(),
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      status: 'Paid',
      receiptUrl: receiptImage || undefined,
      notes: notes.trim() || undefined,
      isRecurring,
      referenceNumber: `MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    onClose();
    // Reset form
    setMerchant('');
    setAmount('');
    setNotes('');
    setReceiptImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-[#e5eeff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                Record New Expense
              </h2>
              <p className="text-xs text-[#76777d]">
                Enter transaction particulars into the ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded-lg hover:bg-[#eff4ff]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Merchant & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                Merchant / Store *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Foods, PG&E, Apple"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                Total Amount ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#006c4a]" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs font-mono font-bold text-[#006c4a] focus:ring-2 focus:ring-[#7671ff] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                Transaction Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
                >
                  {Object.keys(CATEGORY_CONFIGS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Apple Pay">Apple Pay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0b1c30]">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006c4a] focus:ring-[#006c4a]"
                />
                <span>Monthly Recurring Expense</span>
              </label>
            </div>
          </div>

          {/* Optional Receipt Attachment */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
              Receipt Attachment (Optional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5eeff] bg-[#eff4ff] hover:bg-[#dce9ff] text-xs font-semibold text-[#0b1c30]"
              >
                <Camera className="w-3.5 h-3.5" />
                {receiptImage ? 'Change Image' : 'Attach Receipt Image'}
              </button>
              {receiptImage && (
                <span className="text-xs text-[#006c4a] font-semibold flex items-center gap-1">
                  ✓ Receipt Attached
                </span>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
              Notes & Memo
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Project supply purchase, family dinner..."
              className="w-full p-2.5 rounded-xl border border-[#e5eeff] text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#7671ff] outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs"
            >
              Save to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
