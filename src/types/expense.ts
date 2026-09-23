export type ExpenseCategory =
  | 'Housing & Utilities'
  | 'Groceries'
  | 'Dining & Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Health & Wellness'
  | 'Shopping'
  | 'Maintenance & Services'
  | 'Subscriptions'
  | 'Education'
  | 'Travel'
  | 'Miscellaneous';

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Apple Pay'
  | 'Google Pay'
  | 'UPI'
  | 'Bank Transfer'
  | 'Other';

export interface ReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface ReceiptData {
  merchant: {
    name: string;
    category?: string;
    address?: string;
    phone?: string;
  };
  transaction: {
    date: string;
    time?: string;
    currency: string;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    paymentMethod: PaymentMethod | string;
    cardLast4?: string;
    receiptNumber?: string;
  };
  category: ExpenseCategory;
  items: ReceiptItem[];
  confidenceScore: number;
  summary?: string;
  suggestedBudgetImpact?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: PaymentMethod;
  status: 'Paid' | 'Pending' | 'Flagged';
  receiptUrl?: string; // Data URL or image link
  receiptData?: ReceiptData;
  notes?: string;
  isRecurring?: boolean;
  referenceNumber?: string;
  itemsCount?: number;
  tags?: string[];
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocated: number;
  color: string;
  icon: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  dueDay: number; // 1-31
  paymentMethod: PaymentMethod;
  autoPay: boolean;
  provider: string;
  lastPaidDate?: string;
  status: 'Active' | 'Paused' | 'Due Soon';
}

export interface BudgetAnalysis {
  healthScore: number;
  projectedMonthEnd: number;
  safeDailySpend: number;
  status: 'On Track' | 'Caution - High Velocity' | 'Over Budget';
  insights: string[];
  recommendations: string[];
}
