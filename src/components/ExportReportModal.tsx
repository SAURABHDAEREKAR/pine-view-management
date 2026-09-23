import React from 'react';
import { X, FileSpreadsheet, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Expense } from '../types/expense';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  expenses,
}) => {
  if (!isOpen) return null;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'PaymentMethod', 'Amount', 'Reference', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.paymentMethod}"`,
      e.amount.toFixed(2),
      `"${e.referenceNumber || ''}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicSpend_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleDownloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(expenses, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `CivicSpend_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#e5eeff] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006c4a] flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                Export Audited Ledger
              </h2>
              <p className="text-xs text-[#76777d]">
                Download transaction records and receipt audits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0b1c30]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#76777d] block font-semibold">Total Records:</span>
              <span className="font-mono font-bold text-base text-[#0b1c30]">
                {expenses.length} Entries
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#76777d] block font-semibold">Aggregate Outlay:</span>
              <span className="font-mono font-bold text-base text-[#006c4a]">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5eeff] hover:border-[#006c4a] hover:bg-[#eff4ff] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#0b1c30]">
                    CSV Spreadsheet (.csv)
                  </h4>
                  <p className="text-[11px] text-[#76777d]">
                    Compatible with Excel, Google Sheets, QuickBooks
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-[#76777d] group-hover:text-[#006c4a]" />
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-between p-3.5 rounded-xl border border-[#e5eeff] hover:border-[#4f46e5] hover:bg-[#eff4ff] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#0b1c30]">
                    Full JSON Archive (.json)
                  </h4>
                  <p className="text-[11px] text-[#76777d]">
                    Complete raw payloads including OCR line items & images
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-[#76777d] group-hover:text-[#4f46e5]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#76777d] pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006c4a]" />
            <span>Format compliant with standard tax and accounting ledgers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
