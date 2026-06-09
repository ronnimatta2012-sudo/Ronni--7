import React, { useState, useMemo, useEffect } from "react";
import { 
  initialTransactions, 
  initialBudgets, 
  initialGoals, 
  initialProfile, 
  initialSessions, 
  initialAuditLogs, 
  initialNotifications 
} from "./mockData";
import { Transaction, Budget, CapitalGoal, UserProfile, Notification } from "./types";

// Import custom components
import AuraDashboard from "./components/AuraDashboard";
import AuraLedger from "./components/AuraLedger";
import AuraBudgetHelper from "./components/AuraBudgetHelper";
import AuraCoach from "./components/AuraCoach";
import ReceiptAI from "./components/ReceiptAI";
import FinancialGoals from "./components/FinancialGoals";
import AuraSettings from "./components/AuraSettings";
import AuraAuth from "./components/AuraAuth";

import { 
  Sparkles, 
  Wallet, 
  Receipt, 
  LayoutDashboard, 
  Layers, 
  BrainCircuit, 
  TrendingUp, 
  Settings, 
  Bell, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  RefreshCw,
  Cpu,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States with LocalStorage persistence helper
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("aura_transactions");
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("aura_budgets");
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [goals, setGoals] = useState<CapitalGoal[]>(() => {
    const saved = localStorage.getItem("aura_goals");
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("aura_profile");
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("aura_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [logs, setLogs] = useState<any[]>(initialAuditLogs);

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isSyncingBank, setIsSyncingBank] = useState(false);

  // Core Authentication Security States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("aura_authenticated") === "true";
  });

  const handleCompleteAuth = (
    newProfile: UserProfile, 
    onboardedSalary: number, 
    linkBank: boolean, 
    linkedBankName: string
  ) => {
    setProfile(newProfile);
    setIsAuthenticated(true);
    localStorage.setItem("aura_authenticated", "true");

    // 1. Reset all transactions so expenses are exactly $0 at the start
    const freshTransactions: Transaction[] = [];

    // 2. Initialize starting salary as the primary income base statement
    if (onboardedSalary > 0) {
      freshTransactions.push({
        id: `t-salary-${Date.now()}`,
        amount: onboardedSalary,
        type: "income",
        category: "Salary",
        merchant: linkBank ? `${linkedBankName} Direct Deposit` : "Salary Deposit",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        notes: "Executive monthly salary registered during onboarded client setup.",
        tags: ["salary", "onboarding"],
        currency: newProfile.baseCurrency,
        paymentMethod: linkBank ? "Linked Bank" : "Net Banking"
      });
    }

    setTransactions(freshTransactions);
    localStorage.setItem("aura_transactions", JSON.stringify(freshTransactions));

    // 3. Reset budgets so we have 0 spend in all categories
    setBudgets(prev => prev.map(b => ({ ...b, spent: 0 })));

    // Update notifications list with welcome warning
    const welcomeNotif: Notification = {
      id: `n-welcome-${Date.now()}`,
      title: "Consolidated Profile Activated",
      message: `Welcome ${newProfile.name}! Your premium dashboard is live. Starter expenses are initialized to zero.`,
      type: "success",
      timestamp: "Just now",
      read: false
    };
    setNotifications([welcomeNotif]);

    // Append security audit log entries
    const securityLog = {
      id: `l-welcome-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: `Completed secure onboarding & bank integration. Preferred currency: ${newProfile.baseCurrency}`,
      ipAddress: "192.168.1.18",
      device: "macOS / Aura Client Console"
    };
    setLogs([securityLog]);
  };

  const handleLogout = () => {
    localStorage.removeItem("aura_authenticated");
    localStorage.removeItem("aura_profile");
    localStorage.removeItem("aura_transactions");
    localStorage.removeItem("aura_budgets");
    localStorage.removeItem("aura_goals");
    localStorage.removeItem("aura_notifications");
    window.location.reload();
  };

  // Sync to database localStorage
  useEffect(() => {
    localStorage.setItem("aura_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("aura_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("aura_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("aura_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("aura_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Recalculate spent budgets automatically when transactions list changes!
  useEffect(() => {
    setBudgets(prevBudgets => {
      const updated = prevBudgets.map(b => {
        // sum expenses current month (June 2026) in this category
        const spent = transactions
          .filter(t => t.type === "expense" && t.category.toLowerCase() === b.category.toLowerCase() && t.date.startsWith("2026-06"))
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...b, spent };
      });
      return updated;
    });
  }, [transactions]);

  // Transaction mutation handlers
  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    const fullTx: Transaction = {
      ...newTx,
      id: `t-add-${Date.now()}`
    };
    setTransactions(prev => [fullTx, ...prev]);

    // Check for potential budget breach warning logs
    const correspondingBudget = budgets.find(b => b.category.toLowerCase() === newTx.category.toLowerCase());
    if (correspondingBudget) {
      const currentSpent = correspondingBudget.spent + newTx.amount;
      if (currentSpent > correspondingBudget.limit) {
        const warningNotif: Notification = {
          id: `n-warn-${Date.now()}`,
          title: `Limit Breached: ${newTx.category}`,
          message: `Your recent purchase of $${newTx.amount} at ${newTx.merchant} pushes you over your category limit.`,
          type: "warning",
          timestamp: "Just now",
          read: false
        };
        setNotifications(prev => [warningNotif, ...prev]);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleBulkImport = (newTxs: Omit<Transaction, "id">[]) => {
    const mapped = newTxs.map((tx, index) => ({
      ...tx,
      id: `t-bulk-${Date.now()}-${index}`
    }));
    setTransactions(prev => [...mapped, ...prev]);
  };

  // Budget handlers
  const handleUpdateLimit = (id: string, limit: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit } : b));
  };

  const handleAddBudget = (category: string, limit: number, period: any) => {
    const newB: Budget = {
      id: `b-${Date.now()}`,
      category,
      limit,
      spent: 0,
      period
    };
    setBudgets(prev => [...prev, newB]);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Goals handlers
  const handleAddGoal = (newGoal: Omit<CapitalGoal, "id">) => {
    const goal: CapitalGoal = {
      ...newGoal,
      id: `g-${Date.now()}`
    };
    setGoals(prev => [goal, ...prev]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleIncreaseGoal = (id: string, amt: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: g.current + amt } : g));

    // Append a mock transaction to reflect active contribution
    const goalItem = goals.find(g => g.id === id);
    if (goalItem) {
      handleAddTransaction({
        amount: amt,
        type: "expense",
        category: "Investments",
        merchant: `${goalItem.name} allocation`,
        date: new Date().toISOString().split("T")[0],
        notes: `Milestone allocation backing savings targets.`,
        tags: ["goal-savings", "compound"],
        currency: profile.baseCurrency,
        paymentMethod: "Net Banking"
      });

      // Notification
      const rewardNotif: Notification = {
        id: `n-goal-${Date.now()}`,
        title: "Contribution Completed",
        message: `Successfully allocated ₹${amt} backing your ${goalItem.name} target.`,
        type: "success",
        timestamp: "Just now",
        read: false
      };
      setNotifications(prev => [rewardNotif, ...prev]);
    }
  };

  // Profile Preferences
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
    
    // Append compliance logs automatically
    const newLog = {
      id: `l-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action: "Updated executive parameters base currencies",
      ipAddress: "192.168.1.18",
      device: "Chrome / macOS"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Notification handlers
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Bank Account Sync Simulator handler (Extremely premium Fintech visual vibe!)
  const handleSimulateBankSync = () => {
    setIsSyncingBank(true);
    setTimeout(() => {
      // Import 2 mock fresh salaries and dividend yields
      const syncedTransactions: Omit<Transaction, "id">[] = [
        {
          amount: 25000.00,
          type: "income",
          category: "Freelance",
          merchant: "Tata Consult Contract",
          date: new Date().toISOString().split("T")[0],
          time: "10:15",
          notes: "Synchronised Consulting Fee for NPCI integration review",
          tags: ["consulting", "sync"],
          currency: "INR",
          paymentMethod: "Linked Bank",
          location: "Mumbai, India"
        },
        {
          amount: 1179.00,
          type: "expense",
          category: "Subscriptions",
          merchant: "Jio Fibre Broadband",
          date: new Date().toISOString().split("T")[0],
          time: "09:30",
          notes: "Automated recurring renewal via UPI Autopay.",
          tags: ["internet", "subscriptions"],
          currency: "INR",
          paymentMethod: "UPI"
        }
      ];

      handleBulkImport(syncedTransactions);
      setIsSyncingBank(false);

      // Add a success notification
      const successNotif: Notification = {
        id: `n-sync-${Date.now()}`,
        title: "Bank Synchronized",
        message: "2 fresh transactions imported successfully from your linked Wealth checking account.",
        type: "success",
        timestamp: "Just now",
        read: false
      };
      setNotifications(prev => [successNotif, ...prev]);
      setActiveTab("ledger"); // Open ledger immediately
    }, 1800);
  };

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  if (!isAuthenticated) {
    return <AuraAuth onCompleteAuth={handleCompleteAuth} />;
  }

  return (
    <div id="aura-finance-master-container" className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 2. Responsive Sidebars (Desktop Layout Left sidebar) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 sticky top-0 h-screen justify-between flex-shrink-0">
        <div className="p-5 flex flex-col h-full space-y-6">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-slate-100">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">AURA FINTECH</h2>
              <span className="text-[10px] font-bold text-indigo-600 font-mono">EXECUTIVE SUITE</span>
            </div>
          </div>

          {/* Quick Bank linkage Sync trigger card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-indigo-650" /> Live Integrations
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">Sync assets and credit cards with secure API handshakes.</p>
            </div>
            
            <button
              id="simulate-bank-sync-btn"
              onClick={handleSimulateBankSync}
              disabled={isSyncingBank}
              className="w-full py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition text-[10px] font-bold rounded-xl text-slate-700 hover:text-indigo-700 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingBank ? "animate-spin" : ""}`} />
              {isSyncingBank ? "Syncing Handshakes..." : "Sync Bank Account"}
            </button>
          </div>

          {/* Primary Navigation Options */}
          <nav className="flex-1 space-y-1.5">
            <button
              id="nav-to-dashboard"
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "dashboard" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Overview Console
            </button>

            <button
              id="nav-to-ledger"
              onClick={() => { setActiveTab("ledger"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "ledger" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Receipt className="h-4.5 w-4.5" />
              Capital Ledger
            </button>

            <button
              id="nav-to-budgets"
              onClick={() => { setActiveTab("budgets"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "budgets" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Layers className="h-4.5 w-4.5" />
              Budgeting Lab
            </button>

            <button
              id="nav-to-receipts"
              onClick={() => { setActiveTab("receipts"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "receipts" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Receipt className="h-4.5 w-4.5" />
              Receipt OCR Scanner
            </button>

            <button
              id="nav-to-goals"
              onClick={() => { setActiveTab("goals"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "goals" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Target className="h-4.5 w-4.5" />
              Savings Milestones
            </button>

            <button
              id="nav-to-coach"
              onClick={() => { setActiveTab("coach"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all bg-gradient-to-r ${
                activeTab === "coach" 
                  ? "from-slate-900 to-indigo-900 text-white " 
                  : "from-indigo-50/40 to-slate-50 text-indigo-950 hover:from-indigo-50 hover:to-indigo-50"
              } border border-indigo-200/30 shadow-xs`}
            >
              <BrainCircuit className="h-4.5 w-4.5 text-indigo-600" />
              Aura Advisor AI
            </button>

            <button
              id="nav-to-settings"
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "settings" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              Settings & Prefs
            </button>
          </nav>
        </div>

        {/* Executive log out status banner */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center justify-center">
              {profile.name ? profile.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "RM"}
            </div>
            <div className="max-w-[110px] overflow-hidden">
              <h4 className="text-xs font-bold leading-none text-slate-800 truncate">{profile.name}</h4>
              <span className="text-[10px] text-slate-400 font-medium truncate block">{profile.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Secure Account Logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="flex md:hidden items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Wallet className="h-4.5 w-4.5" />
          </span>
          <h2 className="text-xs font-extrabold text-slate-900">AURA FINTECH</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-600 hover:bg-slate-50 rounded"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[53px] z-35 bg-white flex flex-col justify-between p-5 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "dashboard" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Overview Console
            </button>

            <button
              onClick={() => { setActiveTab("ledger"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "ledger" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Receipt className="h-5 w-5" />
              Capital Ledger
            </button>

            <button
              onClick={() => { setActiveTab("budgets"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "budgets" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Layers className="h-5 w-5" />
              Budgeting Lab
            </button>

            <button
              onClick={() => { setActiveTab("receipts"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "receipts" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Receipt className="h-5 w-5" />
              Receipt OCR Scanner
            </button>

            <button
              onClick={() => { setActiveTab("goals"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "goals" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Target className="h-5 w-5" />
              Savings Milestones
            </button>

            <button
              onClick={() => { setActiveTab("coach"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-900`}
            >
              <BrainCircuit className="h-5 w-5 text-indigo-650" />
              Aura Advisor AI
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl ${
                activeTab === "settings" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings & Prefs
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50/65 transition"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto md:p-6 p-4 space-y-6">
        
        {/* Workspace global utilities (Topbar metrics/notifs triggers) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div>
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-widest uppercase">June Balance Sheet Framework</span>
            <div id="live-time-ticker" className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <span>Standard Time: 2026-06-09 12:51 UTC</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Notification center bell icon trigger element */}
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 cursor-pointer transition relative"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-mono text-[9px] font-bold">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification dropdown popover */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-45 p-4 space-y-3 animate-in zoom-in-95 leading-tight duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-900">Notifications ({unreadNotifCount})</h4>
                  <div className="flex gap-2">
                    <button onClick={handleMarkAllRead} className="text-[10px] text-indigo-600 hover:underline">Mark read</button>
                    <button onClick={handleClearAllNotifications} className="text-[10px] text-rose-500 hover:underline">Clear</button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto scrollbar-thin space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`pt-2 first:pt-0 pb-1 flex items-start gap-2.5 text-xs ${n.read ? "opacity-60" : ""}`}>
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                          n.type === "warning" ? "bg-rose-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                        }`} />
                        <div className="space-y-0.5">
                          <h5 className="font-semibold text-slate-800">{n.title}</h5>
                          <p className="text-[10px] text-slate-500">{n.message}</p>
                          <span className="text-[8px] text-slate-405 font-mono block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">No notifications.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab view controllers renderer */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <AuraDashboard 
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  profile={profile}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onAddTransactionClick={() => { setActiveTab("ledger"); }}
                />
              )}

              {activeTab === "ledger" && (
                <AuraLedger 
                  transactions={transactions}
                  profile={profile}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onBulkImport={handleBulkImport}
                />
              )}

              {activeTab === "budgets" && (
                <AuraBudgetHelper 
                  budgets={budgets}
                  profile={profile}
                  onUpdateLimit={handleUpdateLimit}
                  onAddBudget={handleAddBudget}
                  onDeleteBudget={handleDeleteBudget}
                />
              )}

              {activeTab === "receipts" && (
                <ReceiptAI 
                  onCommitTransaction={handleAddTransaction}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === "goals" && (
                <FinancialGoals 
                  goals={goals}
                  profile={profile}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onIncreaseGoal={handleIncreaseGoal}
                />
              )}

              {activeTab === "coach" && (
                <AuraCoach 
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  profile={profile}
                />
              )}

              {activeTab === "settings" && (
                <AuraSettings 
                  profile={profile}
                  sessions={sessions}
                  logs={logs}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
