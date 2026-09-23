import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Store,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, ReceiptData, ReceiptItem } from '../types/expense';
import { CATEGORY_CONFIGS, SAMPLE_RECEIPTS } from '../data/initialData';

interface ReceiptScannerViewProps {
  onAddExpense: (expense: Expense) => void;
  onNavigateToLedger: () => void;
}

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  onAddExpense,
  onNavigateToLedger,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('Idle');
  const [scanResult, setScanResult] = useState<ReceiptData | null>(null);
  const [selectedSampleHint, setSelectedSampleHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessCommitted, setIsSuccessCommitted] = useState<boolean>(false);

  // Form states for editable parsed result
  const [merchantName, setMerchantName] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (base64Image: string, hint?: string) => {
    setImagePreview(base64Image);
    setIsScanning(true);
    setErrorMessage(null);
    setIsSuccessCommitted(false);

    try {
      setScanStep('Transmitting receipt to Gemini vision OCR...');
      await new Promise((r) => setTimeout(r, 600));

      setScanStep('Analyzing merchant, itemized lines, and tax breakdowns...');

      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          sampleHint: hint || selectedSampleHint || 'grocery',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      setScanStep('Validating ledger mathematical totals...');
      await new Promise((r) => setTimeout(r, 400));

      const result = await response.json();
      if (result.success && result.data) {
        const data: ReceiptData = result.data;
        setScanResult(data);
        // Pre-fill editable state
        setMerchantName(data.merchant?.name || 'Unknown Store');
        setTotalAmount(data.transaction?.total || 0);
        setExpenseDate(data.transaction?.date || new Date().toISOString().split('T')[0]);
        setCategory(data.category || 'Groceries');
        setPaymentMethod((data.transaction?.paymentMethod as PaymentMethod) || 'Credit Card');
        setNotes(data.summary || data.notes || 'Scanned with Gemini Vision OCR');
        setItems(data.items || []);
        setSubtotal(data.transaction?.subtotal || 0);
        setTax(data.transaction?.tax || 0);
        setTip(data.transaction?.tip || 0);
      } else {
        throw new Error(result.error || 'Failed to parse receipt.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Error occurred while scanning receipt. You can still enter details manually.');
    } finally {
      setIsScanning(false);
      setScanStep('Idle');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedSampleHint(null);
      processImageFile(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleReceiptClick = (sample: (typeof SAMPLE_RECEIPTS)[0]) => {
    setSelectedSampleHint(sample.hint);
    // Create an evocative SVG data URL representation of the receipt
    const mockReceiptSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:%23ffffff;font-family:monospace;font-size:14px;color:%23000;">
      <rect width="600" height="800" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="8" fill="${encodeURIComponent(sample.svgColor)}"/>
      <text x="300" y="60" text-anchor="middle" font-size="22" font-weight="bold" fill="%230b1c30">${encodeURIComponent(sample.merchant)}</text>
      <text x="300" y="90" text-anchor="middle" font-size="12" fill="%2364748b">Verified Receipt Record • Suite 402</text>
      <line x1="40" y1="120" x2="560" y2="120" stroke="%23cbd5e1" stroke-dasharray="4"/>
      <text x="50" y="150" fill="%23334155">Date: ${sample.date}  14:22</text>
      <text x="50" y="175" fill="%23334155">Register: Terminal 04</text>
      <text x="450" y="150" fill="%23334155" text-anchor="end">Ref: #${Math.floor(100000 + Math.random() * 900000)}</text>
      <line x1="40" y1="200" x2="560" y2="200" stroke="%23cbd5e1"/>
      <text x="50" y="240" font-weight="bold" fill="%230b1c30">ITEM DESCRIPTION</text>
      <text x="380" y="240" font-weight="bold" fill="%230b1c30">QTY</text>
      <text x="550" y="240" font-weight="bold" fill="%230b1c30" text-anchor="end">TOTAL</text>
      <line x1="40" y1="260" x2="560" y2="260" stroke="%23f1f5f9"/>
      <text x="50" y="300" fill="%231e293b">1. Primary Goods / Service</text>
      <text x="390" y="300" fill="%231e293b">1</text>
      <text x="550" y="300" fill="%231e293b" text-anchor="end">${sample.amount}</text>
      <text x="50" y="340" fill="%231e293b">2. Supplemental Item Package</text>
      <text x="390" y="340" fill="%231e293b">1</text>
      <text x="550" y="340" fill="%231e293b" text-anchor="end">Included</text>
      <line x1="40" y1="460" x2="560" y2="460" stroke="%23cbd5e1" stroke-dasharray="4"/>
      <text x="400" y="500" fill="%23475569">Subtotal:</text>
      <text x="550" y="500" fill="%230b1c30" text-anchor="end">${sample.amount}</text>
      <text x="400" y="530" fill="%23475569">Sales Tax (EST):</text>
      <text x="550" y="530" fill="%230b1c30" text-anchor="end">$0.00</text>
      <line x1="400" y1="550" x2="560" y2="550" stroke="%230b1c30" stroke-width="2"/>
      <text x="400" y="580" font-size="18" font-weight="bold" fill="%230b1c30">TOTAL:</text>
      <text x="550" y="580" font-size="18" font-weight="bold" fill="%23006c4a" text-anchor="end">${sample.amount}</text>
      <text x="300" y="660" text-anchor="middle" font-size="13" fill="%2364748b">CARD TRANSACTION APPROVED</text>
      <text x="300" y="685" text-anchor="middle" font-size="11" fill="%2394a3b8">AUTH: 981240 • THANK YOU FOR YOUR BUSINESS</text>
      <rect x="220" y="710" width="160" height="40" fill="%23f8fafc" stroke="%23cbd5e1"/>
      <text x="300" y="735" text-anchor="middle" font-size="12" fill="%230F172A">||||| | |||| ||||| |||</text>
    </svg>`;

    processImageFile(mockReceiptSvg, sample.hint);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: 'New Item',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.totalPrice = Math.round(qty * price * 100) / 100;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleCommitToLedger = () => {
    if (!merchantName.trim()) {
      alert('Please enter a merchant name.');
      return;
    }
    if (totalAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      merchant: merchantName.trim(),
      amount: totalAmount,
      category: category,
      date: expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod,
      status: 'Paid',
      receiptUrl: imagePreview || undefined,
      receiptData: scanResult
        ? {
            ...scanResult,
            merchant: { ...scanResult.merchant, name: merchantName },
            category: category,
            items: items,
            transaction: {
              ...scanResult.transaction,
              date: expenseDate,
              total: totalAmount,
              subtotal: subtotal,
              tax: tax,
              tip: tip,
              paymentMethod: paymentMethod,
            },
          }
        : undefined,
      notes: notes,
      itemsCount: items.length || 1,
      tags: [category, 'Scanned'],
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    setIsSuccessCommitted(true);
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    setIsSuccessCommitted(false);
    setErrorMessage(null);
    setMerchantName('');
    setTotalAmount(0);
    setItems([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#e5eeff] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#82f5c1] text-[#005137]">
              <Sparkles className="w-3 h-3 mr-1" />
              Multimodal Vision OCR
            </span>
            <span className="text-xs text-[#76777d]">Powered by Gemini 3.8 Flash</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-[#0b1c30] tracking-tight">
            AI Receipt & Invoice Scanner
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Instant extraction of merchants, itemized rows, tax calculations, and category assignment directly into your ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {imagePreview && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Scan
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Upload / Camera / Image Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#e5eeff] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#76777d]">
                Receipt Visual Capture
              </span>
              {scanResult && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#82f5c1] text-[#005137]">
                  <CheckCircle2 className="w-3 h-3" />
                  {Math.round((scanResult.confidenceScore || 0.95) * 100)}% Confidence
                </span>
              )}
            </div>

            {/* Dropzone Container */}
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      processImageFile(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="group relative border-2 border-dashed border-[#c6c6cd] hover:border-[#006c4a] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#eff4ff]/30 hover:bg-[#eff4ff]/60 transition-all min-h-[280px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-[#e5eeff] flex items-center justify-center text-[#006c4a] group-hover:scale-110 transition-transform mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-headline font-bold text-sm text-[#0b1c30]">
                  Drop receipt or click to upload
                </h3>
                <p className="text-xs text-[#76777d] mt-1 max-w-xs">
                  Supports PNG, JPG, JPEG, WEBP. You can also take a photo on mobile devices.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-white text-[11px] font-mono text-[#0b1c30] border border-[#e5eeff]">
                    Auto OCR
                  </span>
                  <span className="px-2 py-1 rounded bg-white text-[11px] font-mono text-[#0b1c30] border border-[#e5eeff]">
                    Line Item Extraction
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-[#f1f5f9] border border-[#e5eeff] max-h-[460px] flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Scanned Receipt Preview"
                  className="w-full h-auto max-h-[460px] object-contain"
                />

                {/* Scanning Animation Laser Bar */}
                {isScanning && (
                  <div className="absolute inset-0 bg-[#0F172A]/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#82f5c1] to-transparent shadow-[0_0_12px_#006c4a] animate-pulse" />
                    <div className="bg-white/95 px-4 py-3 rounded-xl shadow-lg border border-[#e5eeff] flex flex-col items-center gap-2 text-center max-w-xs mx-4">
                      <RefreshCw className="w-5 h-5 text-[#006c4a] animate-spin" />
                      <span className="font-headline font-semibold text-xs text-[#0b1c30]">
                        {scanStep}
                      </span>
                      <span className="text-[10px] text-[#76777d]">
                        Gemini Vision inspecting merchant & totals...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick One-Click Sample Receipts */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                Or Try Sample Receipts (Instant 1-Click Test):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_RECEIPTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSampleReceiptClick(sample)}
                    disabled={isScanning}
                    className="p-2.5 rounded-xl border border-[#e5eeff] bg-white hover:bg-[#eff4ff] text-left transition-all text-xs flex flex-col gap-1 disabled:opacity-50 hover:border-[#006c4a]/50 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0b1c30] truncate">
                        {sample.merchant}
                      </span>
                      <span className="font-mono font-bold text-[#006c4a]">
                        {sample.amount}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#76777d] line-clamp-1">
                      {sample.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Extracted Data Sheet & Commit Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#e5eeff] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h2 className="font-headline font-bold text-base text-[#0b1c30]">
                  Extraction Review & Audit
                </h2>
                <p className="text-xs text-[#76777d]">
                  Review parsed values, adjust categories or items, then commit to your active ledger.
                </p>
              </div>
              {isSuccessCommitted && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#82f5c1] text-[#005137] text-xs font-bold animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  Added to Ledger!
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!imagePreview && !scanResult ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-[#76777d]">
                <FileText className="w-12 h-12 stroke-1 text-[#c6c6cd] mb-3" />
                <p className="text-sm font-semibold text-[#0b1c30]">
                  No receipt selected yet
                </p>
                <p className="text-xs text-[#76777d] max-w-sm mt-1">
                  Upload an image from your device or click any of the sample receipts on the left to see instant OCR breakdown here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Merchant / Vendor
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                      <input
                        type="text"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        placeholder="e.g. Whole Foods Market"
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-semibold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#006c4a]" />
                      <input
                        type="number"
                        step="0.01"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-mono font-bold text-[#006c4a] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] bg-white text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Budget Category
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                      >
                        {Object.keys(CATEGORY_CONFIGS).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Payment Instrument
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Apple Pay">Apple Pay</option>
                        <option value="Google Pay">Google Pay</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                      Tax & Surcharges
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                        placeholder="Tax"
                        className="w-1/2 h-9 px-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-mono text-[#0b1c30]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={tip}
                        onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                        placeholder="Tip"
                        className="w-1/2 h-9 px-3 rounded-xl border border-[#e5eeff] bg-white text-xs font-mono text-[#0b1c30]"
                      />
                    </div>
                  </div>
                </div>

                {/* Itemized Line Items Table */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#006c4a]" />
                      Itemized Breakdown ({items.length} lines detected)
                    </span>
                    <button
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#eff4ff] text-[#45464d] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-2 w-16 text-center">Qty</th>
                          <th className="py-2 px-2 w-24 text-right">Price</th>
                          <th className="py-2 px-2 w-24 text-right">Total</th>
                          <th className="py-2 px-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-[#76777d]">
                              No line items parsed. You can add items manually above.
                            </td>
                          </tr>
                        ) : (
                          items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#eff4ff]/40">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="w-full bg-transparent font-medium text-[#0b1c30] outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-12 text-center bg-transparent font-mono outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  className="w-20 text-right bg-transparent font-mono outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-semibold text-[#0b1c30]">
                                ${item.totalPrice.toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-[#76777d] hover:text-[#ba1a1a]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit & Notes */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[#76777d] mb-1">
                    Notes & AI Observations
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add memo, warranty notes, or tax details..."
                    className="w-full p-2.5 rounded-xl border border-[#e5eeff] bg-white text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#7671ff]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    {isSuccessCommitted && (
                      <button
                        onClick={onNavigateToLedger}
                        className="text-xs font-semibold text-[#006c4a] hover:underline flex items-center gap-1"
                      >
                        View in Ledger <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleCommitToLedger}
                      disabled={isScanning}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Commit ${totalAmount.toFixed(2)} to Ledger
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
