import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ReceiptScannerView } from './components/ReceiptScannerView';
import { BudgetAnalyticsView } from './components/BudgetAnalyticsView';
import { ExpenseLedgerView } from './components/ExpenseLedgerView';
import { RecurringBillsView } from './components/RecurringBillsView';
import { AuditedReportsView } from './components/AuditedReportsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { ExportReportModal } from './components/ExportReportModal';
import {
  CategoryBudget,
  Expense,
  ExpenseCategory,
  RecurringBill,
} from './types/expense';
import {
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_EXPENSES,
  INITIAL_RECURRING_BILLS,
} from './data/initialData';

export default function App() {
  // Local storage state initialization with seeds
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('civicspend_expenses_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXPENSES;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem('civicspend_budgets_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORY_BUDGETS;
  });

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem('civicspend_recurring_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RECURRING_BILLS;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<string>('2026-09');

  // Days remaining in cycle (assuming Sep 30 end)
  const daysRemaining = 8;

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('civicspend_expenses_v1', JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('civicspend_budgets_v1', JSON.stringify(categoryBudgets));
    } catch (e) {
      console.error(e);
    }
  }, [categoryBudgets]);

  useEffect(() => {
    try {
      localStorage.setItem('civicspend_recurring_v1', JSON.stringify(recurringBills));
    } catch (e) {
      console.error(e);
    }
  }, [recurringBills]);

  // Handlers
  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (selectedExpense?.id === id) {
      setSelectedExpense(null);
    }
  };

  const handleUpdateCategoryBudget = (category: ExpenseCategory, newAllocated: number) => {
    setCategoryBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, allocated: newAllocated } : b))
    );
  };

  const handleAddRecurringBill = (newBill: RecurringBill) => {
    setRecurringBills((prev) => [newBill, ...prev]);
  };

  const handleDeleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleMarkBillPaid = (bill: RecurringBill) => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      merchant: bill.title,
      amount: bill.amount,
      category: bill.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: bill.paymentMethod,
      status: 'Paid',
      isRecurring: true,
      referenceNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Recurring payment for ${bill.provider}`,
      createdAt: new Date().toISOString(),
    };
    handleAddExpense(expense);
    alert(`Logged $${bill.amount.toFixed(2)} for ${bill.title} into the ledger.`);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenScanModal={() => setCurrentTab('scanner')}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCycle={selectedCycle}
        onCycleChange={setSelectedCycle}
      />

      <div className="flex flex-1 pt-16">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          daysRemaining={daysRemaining}
        />

        {/* Main Content View Container */}
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:p-8 min-h-[calc(100vh-4rem)] overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              expenses={expenses}
              categoryBudgets={categoryBudgets}
              recurringBills={recurringBills}
              daysRemaining={daysRemaining}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenScanModal={() => setCurrentTab('scanner')}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              onMarkBillPaid={handleMarkBillPaid}
            />
          )}

          {currentTab === 'scanner' && (
            <ReceiptScannerView
              onAddExpense={handleAddExpense}
              onNavigateToLedger={() => setCurrentTab('ledger')}
            />
          )}

          {currentTab === 'analytics' && (
            <BudgetAnalyticsView
              expenses={expenses}
              categoryBudgets={categoryBudgets}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
              daysRemaining={daysRemaining}
            />
          )}

          {currentTab === 'ledger' && (
            <ExpenseLedgerView
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenScanModal={() => setCurrentTab('scanner')}
              onSelectExpense={(exp) => setSelectedExpense(exp)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'recurring' && (
            <RecurringBillsView
              bills={recurringBills}
              onAddRecurringBill={handleAddRecurringBill}
              onDeleteRecurringBill={handleDeleteRecurringBill}
              onMarkBillPaid={handleMarkBillPaid}
            />
          )}

          {currentTab === 'reports' && (
            <AuditedReportsView
              expenses={expenses}
              categoryBudgets={categoryBudgets}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onDelete={handleDeleteExpense}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={expenses}
      />
    </div>
  );
}
