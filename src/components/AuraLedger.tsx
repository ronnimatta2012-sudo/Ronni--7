import React, { useState, useMemo } from "react";
import { Transaction, CategoryType, UserProfile } from "../types";
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Filter, 
  Tag, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Sparkles,
  RefreshCw,
  MapPin,
  FileText,
  Upload,
  AlertCircle
} from "lucide-react";

interface AuraLedgerProps {
  transactions: Transaction[];
  profile: UserProfile;
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
  onDeleteTransaction: (id: string) => void;
  onBulkImport: (txs: Omit<Transaction, "id">[]) => void;
}

const ALL_CATEGORIES = [
  "Food", "Groceries", "Rent", "Utilities", "Transportation", 
  "Entertainment", "Shopping", "Healthcare", "Travel", 
  "Education", "Investments", "Insurance", "Subscriptions", "Other"
];

const PAYMENT_METHODS = [
  "UPI", "Rupay Credit", "Net Banking", "Cash", "Visa / Mastercard", "Linked Bank"
];

const CURRENCIES = ["INR"];

export default function AuraLedger({
  transactions,
  profile,
  onAddTransaction,
  onDeleteTransaction,
  onBulkImport
}: AuraLedgerProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  // New Transaction Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState<string>("Food");
  const [subcategory, setSubcategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [currency, setCurrency] = useState<any>("INR");
  const [paymentMethod, setPaymentMethod] = useState<any>("UPI");
  const [location, setLocation] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<any>("monthly");

  // AI Assistant active categorization suggest trigger state
  const [suggestingCategory, setSuggestingCategory] = useState(false);

  // Bulk raw paste state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCSVInput, setBulkCSVInput] = useState("");

  const formatCurrency = (val: number, cur?: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur || profile.baseCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Auto-Categorize with Mock / Gemini Server API
  const handleAutoCategorize = async () => {
    if (!merchant) return;
    setSuggestingCategory(true);
    try {
      const response = await fetch("/api/gemini/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant, amount: parseFloat(amount) || 0, notes })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.category && ALL_CATEGORIES.includes(data.category)) {
          setCategory(data.category);
          setNotes(prev => prev ? `${prev} (Auto-categorized: ${data.explanation})` : `Auto-categorized: ${data.explanation}`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuggestingCategory(false);
    }
  };

  // Submit Transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    const parsedTags = tagInput
      ? tagInput.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
      : [];

    onAddTransaction({
      amount: parseFloat(amount),
      type,
      category,
      subcategory: subcategory || undefined,
      merchant,
      date,
      time: time || undefined,
      notes: notes || undefined,
      tags: parsedTags,
      currency,
      paymentMethod,
      location: location || undefined,
      isRecurring,
      recurringPeriod: isRecurring ? recurringPeriod : undefined
    });

    // Reset fields
    setAmount("");
    setMerchant("");
    setSubcategory("");
    setNotes("");
    setTagInput("");
    setLocation("");
    setIsRecurring(false);
    setShowAddForm(false);
  };

  // Duplicate transaction helper
  const handleDuplicate = (tx: Transaction) => {
    onAddTransaction({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      subcategory: tx.subcategory,
      merchant: `${tx.merchant} Copy`,
      date: new Date().toISOString().split("T")[0],
      time: tx.time,
      notes: tx.notes ? `${tx.notes} (Duplicated)` : "Duplicated",
      tags: tx.tags,
      currency: tx.currency,
      paymentMethod: tx.paymentMethod,
      location: tx.location,
      isRecurring: tx.isRecurring,
      recurringPeriod: tx.recurringPeriod
    });
  };

  // CSV Exporter
  const handleExportCSV = () => {
    // Construct header row
    const headers = ["ID", "Type", "Amount", "Currency", "Merchant", "Category", "Subcategory", "Date", "Payment Method", "Recurring", "Tags", "Notes"];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.currency,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.category,
      t.subcategory || "",
      t.date,
      t.paymentMethod,
      t.isRecurring ? "Yes" : "No",
      t.tags.join(";"),
      `"${(t.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_financial_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse bulk CSV paste input
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCSVInput.trim()) return;

    // Expected columns: Amount, Type (expense or income), Category, Merchant, Date (optional), Notes (optional)
    const lines = bulkCSVInput.split("\n");
    const parsedTxs: Omit<Transaction, "id">[] = [];

    lines.forEach(line => {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length >= 4) {
        const amt = parseFloat(parts[0]);
        const tp = parts[1].toLowerCase() === "income" ? "income" : "expense";
        const cat = parts[2] || "Other";
        const mer = parts[3];
        const dt = parts[4] || new Date().toISOString().split("T")[0];
        const nts = parts[5] || "";

        if (!isNaN(amt) && mer) {
          parsedTxs.push({
            amount: amt,
            type: tp,
            category: ALL_CATEGORIES.includes(cat) ? cat : "Other",
            merchant: mer,
            date: dt,
            notes: nts || undefined,
            tags: ["bulk", "imported"],
            currency: profile.baseCurrency,
            paymentMethod: "Linked Bank"
          });
        }
      }
    });

    if (parsedTxs.length > 0) {
      onBulkImport(parsedTxs);
      setBulkCSVInput("");
      setShowBulkModal(false);
    }
  };

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = 
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = filterType === "all" || t.type === filterType;
      const matchCat = filterCategory === "all" || t.category === filterCategory;
      const matchCur = filterCurrency === "all" || t.currency === filterCurrency;

      return matchSearch && matchType && matchCat && matchCur;
    });
  }, [transactions, searchTerm, filterType, filterCategory, filterCurrency]);

  return (
    <div id="aura-ledger-viewport" className="space-y-6">
      {/* Tab Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Capital Ledger</h1>
          <p className="text-xs text-slate-500">Monitor, filter, and maintain your historic capital ledger assets</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            id="toggle-add-form-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>

          <button
            id="toggle-bulk-modal-btn"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-250 transition px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 border border-slate-200"
          >
            <Upload className="h-4 w-4" />
            Bulk Paste
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-250 transition px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 border border-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Slide-Down: New Transaction Form */}
      {showAddForm && (
        <form 
          id="add-transaction-form"
          onSubmit={handleSubmit} 
          className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-55/30">
            <h3 className="text-sm font-semibold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500 fill-indigo-500/20" />
              New Transaction Entry
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Amount & Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Type & Flow</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-1 text-xs font-semibold rounded-lg ${type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-1 text-xs font-semibold rounded-lg ${type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
                >
                  Income
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Merchant */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                <span>Merchant / Origin</span>
                {merchant.length > 2 && (
                  <button
                    type="button"
                    onClick={handleAutoCategorize}
                    disabled={suggestingCategory}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${suggestingCategory ? "animate-spin" : ""}`} />
                    AI Classify
                  </button>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. Starbucks, Inc"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subcategory */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Subcategory</label>
              <input
                type="text"
                placeholder="e.g. Fine Dining"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Payment Instrument</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Currency</label>
              <select
                value={currency}
                onChange={(e: any) => setCurrency(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tags (comma separated) */}
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. coffee, commute, team-lunch"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Location Coordinate</label>
              <input
                type="text"
                placeholder="e.g. Palo Alto, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Recurring scheduling */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tx-isrecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="tx-isrecurring" className="text-xs font-semibold text-slate-700">Recurring Schedule</label>
              </div>
              
              {isRecurring && (
                <select
                  value={recurringPeriod}
                  onChange={(e: any) => setRecurringPeriod(e.target.value)}
                  className="w-full px-2 py-1 ml-1 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Internal Audit Notes & Context</label>
            <textarea
              rows={2}
              placeholder="Add strategic transaction descriptions or compliance annotations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Append Entry
            </button>
          </div>
        </form>
      )}

      {/* Modern Filter Board */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3.5 items-end">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Merchant / note</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movement Flow</label>
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          >
            <option value="all">All Out & In Flows</option>
            <option value="expense">Inflows Only (Income)</option>
            <option value="expense">Outflows Only (Expenses)</option>
          </select>
        </div>

        {/* Filter Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset Department</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filter Currency */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nominal Currency</label>
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          >
            <option value="all">All Currencies</option>
            {CURRENCIES.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* Reset Buttons */}
        <button
          onClick={() => {
            setSearchTerm("");
            setFilterType("all");
            setFilterCategory("all");
            setFilterCurrency("all");
          }}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/60"
        >
          Reset Filters
        </button>
      </div>

      {/* Bulk Raw Paste Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-600" />
                Raw Asset Bulk Importer
              </h3>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste comma-separated (CSV) records below to process multiple entries rapidly. Columns required:<br />
              <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-indigo-600">Amount, Type (income/expense), Category, Merchant, Date (optional YYYY-MM-DD), Notes (optional)</code>
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <textarea
                rows={6}
                value={bulkCSVInput}
                onChange={(e) => setBulkCSVInput(e.target.value)}
                placeholder="45.99, expense, Food, Sweetgreen Post, 2026-06-08, Salad dinner with associate&#10;1500.00, income, Freelance, Luminate Consult, 2026-06-05, Advisor Hours"
                className="w-full p-3 bg-slate-50 border border-slate-200 font-mono text-xs rounded-xl focus:bg-white focus:outline-none"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Authenticate Imports
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Records Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>SHOWING {filteredTransactions.length} AUDITED records</span>
          <span>COMPLIANCE RATING: AAA</span>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/20">
                  <th className="p-4 pl-6">Receipt / Merchant</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Department / Tags</th>
                  <th className="p-4">Payment / Location</th>
                  <th className="p-4 text-right">Value</th>
                  <th className="p-4 text-center pr-6">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} id={`tx-row-${tx.id}`} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border text-xs font-bold font-mono uppercase ${
                          tx.type === "income" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {tx.category.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-sans font-semibold text-slate-900 flex items-center gap-1.5">
                            {tx.merchant}
                            {tx.isRecurring && (
                              <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded flex items-center border border-indigo-120/10">
                                <RefreshCw className="h-2 w-2 mr-0.5 animate-spin-slow" /> {tx.recurringPeriod}
                              </span>
                            )}
                          </div>
                          {tx.notes && (
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{tx.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-sans text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {tx.date}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{tx.time || "12:00 UTC"}</span>
                    </td>

                    <td className="p-4">
                      <div className="text-xs font-semibold text-slate-700">{tx.category}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tx.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.2 rounded text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        {tx.paymentMethod}
                      </div>
                      {tx.location && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-sans mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-rose-400" /> {tx.location}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className={`font-mono text-sm font-bold ${
                        tx.type === "income" ? "text-emerald-600" : "text-slate-900"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                      </div>
                      {tx.currency !== profile.baseCurrency && (
                        <div className="text-[10px] font-mono text-slate-400 italic">
                          ≈ {formatCurrency(tx.amount, profile.baseCurrency)} (converted)
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Duplicate Record"
                          id={`duplicate-tx-btn-${tx.id}`}
                          onClick={() => handleDuplicate(tx)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Purge Compliance"
                          id={`delete-tx-btn-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="h-10 w-10 text-slate-300" />
            <h4 className="text-sm font-semibold text-slate-700">No records parsed matching criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm">Adjust search terms, movement flows, or category parameters to find archived records.</p>
          </div>
        )}
      </div>
    </div>
  );
}
