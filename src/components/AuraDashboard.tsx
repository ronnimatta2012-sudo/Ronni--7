import React, { useMemo } from "react";
import { Transaction, Budget, CapitalGoal, UserProfile } from "../types";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Wallet, 
  Percent, 
  Calendar, 
  ArrowUpRight, 
  DollarSign, 
  Sparkles,
  Play,
  Clock
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

interface AuraDashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: CapitalGoal[];
  profile: UserProfile;
  onNavigate: (tab: string) => void;
  onAddTransactionClick: () => void;
}

const COLORS = [
  "#3B82F6", // Food
  "#10B981", // Groceries
  "#8B5CF6", // Rent
  "#F59E0B", // Utilities
  "#EC4899", // Transport
  "#6366F1", // Entertainment
  "#EF4444", // Shopping
  "#06B6D4", // Health
  "#84CC16", // Travel
  "#14B8A6", // Subscriptions
  "#9333EA", // Investments
  "#F43F5E", // Insurance
  "#0F172A"  // Other
];

export default function AuraDashboard({
  transactions,
  budgets,
  goals,
  profile,
  onNavigate,
  onAddTransactionClick
}: AuraDashboardProps) {
  // 1. Calculations
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: profile.baseCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    // Filter transactions for current month (June 2026)
    const currentMonthTxs = transactions.filter(t => t.date.startsWith("2026-06"));
    
    currentMonthTxs.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    // Net worth (simulate total capital in ₹)
    const savedInGoals = goals.reduce((acc, g) => acc + g.current, 0);
    const bankBalance = 148500; // Pre-set checking liquidity in INR
    const netWorth = bankBalance + savedInGoals - 41500; // subtract credit card bill in INR

    const savings = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savings,
      savingsRate,
      netWorth,
      liquidity: bankBalance
    };
  }, [transactions, goals]);

  // 2. Prepare charts data: Monthly Cashflow Trend
  const cashflowTrendData = useMemo(() => {
    // Group transactions by month for the line chart (April, May, June 2026)
    const months = ["2026-04", "2026-05", "2026-06"];
    const labels = ["April", "May", "June (Current)"];

    return months.map((m, idx) => {
      let income = 0;
      let expenses = 0;
      transactions.forEach(t => {
        if (t.date.startsWith(m)) {
          if (t.type === "income") income += t.amount;
          else expenses += t.amount;
        }
      });
      return {
        name: labels[idx],
        Income: income,
        Expenses: expenses,
        NetMargin: income - expenses
      };
    });
  }, [transactions]);

  // 3. Category Breakdown Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Current month expenses
    transactions
      .filter(t => t.type === "expense" && t.date.startsWith("2026-06"))
      .forEach(t => {
        counts[t.category] = (counts[t.category] || 0) + t.amount;
      });

    return Object.keys(counts).map(cat => ({
      name: cat,
      value: counts[cat]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 4. Budget status summary
  const overspentBudgetsCount = useMemo(() => {
    return budgets.filter(b => b.spent > b.limit).length;
  }, [budgets]);

  // Financial Health Score Calculation (1-100)
  const healthScore = useMemo(() => {
    let score = 60; // Base score
    // Savings Rate contribution (up to 20 pts)
    score += Math.min(20, (totals.savingsRate / 30) * 20);
    // Goals milestone performance (up to 10 pts)
    const goalsPerformance = goals.length > 0 
      ? goals.reduce((acc, g) => acc + (g.current / g.target), 0) / goals.length 
      : 1;
    score += Math.min(10, goalsPerformance * 10);
    // Overspent budgets subtractor (up to -20 pts)
    score -= Math.min(20, overspentBudgetsCount * 8);
    // Positive limit boundaries
    return Math.floor(Math.max(10, Math.min(100, score)));
  }, [totals.savingsRate, goals, overspentBudgetsCount]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div id="aura-dashboard-viewport" className="space-y-6">
      {/* 1. executive notification banner or high end greeting banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
              {profile.tier}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> SYSTEM HEALTHY
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-sans tracking-tight font-semibold">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Aura Financial AI has finished indexing your assets. Your executive score is steady at <span className="text-indigo-300 font-semibold font-mono">{healthScore}/100</span>.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-3 h-fit">
          <button 
            id="quick-add-transaction-btn"
            onClick={onAddTransactionClick}
            className="flex items-center gap-2 bg-gradient-to-r from-white to-slate-100 hover:from-indigo-50 hover:to-indigo-100 transition-all text-slate-950 px-4 py-2.5 rounded-xl font-medium text-sm shadow-md"
          >
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            Manually Add Capital
          </button>
          
          <button
            id="summon-ai-coach-banner-btn"
            onClick={() => onNavigate("coach")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-indigo-300 hover:text-white"
          >
            <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
            Aura Review
          </button>
        </div>
      </div>

      {/* 2. Executive coordinates matrix Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card: Net Worth */}
        <div id="metric-card-networth" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Portfolio Net Worth</span>
            <Wallet className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl md:text-2xl font-mono font-semibold tracking-tight text-slate-900">
              {formatCurrency(totals.netWorth)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 leading-none">
              <span className="text-emerald-600 font-semibold tracking-tight font-mono flex items-center">
                ↑ 14.8%
              </span>
              <span>vs last quarter</span>
            </div>
          </div>
        </div>

        {/* Metric Card: Monthly Income */}
        <div id="metric-card-income" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>June Total Income</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl md:text-2xl font-mono font-semibold tracking-tight text-slate-900">
              {formatCurrency(totals.monthlyIncome)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 leading-none">
              <span className="text-slate-600 font-semibold font-mono flex items-center">
                Salary + Consultant
              </span>
            </div>
          </div>
        </div>

        {/* Metric Card: Monthly Expenses */}
        <div id="metric-card-expenses" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>June Outflows</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl md:text-2xl font-mono font-semibold tracking-tight text-slate-900">
              {formatCurrency(totals.monthlyExpenses)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 leading-none">
              {overspentBudgetsCount > 0 ? (
                <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                  <ShieldAlert className="h-3 w-3" /> {overspentBudgetsCount} over limit
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold">Perfect Budget adherence</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric Card: Savings Rate */}
        <div id="metric-card-savings-rate" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Premium Savings Rate</span>
            <Percent className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl md:text-2xl font-mono font-semibold tracking-tight text-slate-900">
              {totals.savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 leading-none">
              <span className="text-emerald-600 font-semibold">+2.1%</span>
              <span>above target benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mid-Section: Area Chart (Income vs Expense Cashflow) & Category Breakdown Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-sans font-semibold text-slate-900">Cash Flow Operations</h3>
              <p className="text-xs text-slate-500">Capital inflows vs structural expenditures</p>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
              Last 3 Quarters
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), ""]} 
                  contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "12px", color: "#FFF" }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" name="Capital Inflow" />
                <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" name="Capital Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown (Right col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-sans font-semibold text-slate-900">Portfolio Distribution</h3>
            <p className="text-xs text-slate-500">June category allocation and concentration</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-mono">No expenditures logged this month.</div>
            )}
            
            {/* Center aggregate labels */}
            <div className="absolute text-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Outflows</span>
              <div className="text-lg font-bold font-mono text-slate-800">
                {formatCurrency(totals.monthlyExpenses)}
              </div>
            </div>
          </div>

          {/* Quick legend listing top 4 categories */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin text-xs">
            {categoryData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-600 bg-slate-50/50 p-1.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-medium text-slate-700">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(entry.value)}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    ({((entry.value / totals.monthlyExpenses) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Down: Budget Warning widget & Recent Ledger Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Overview (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-sans font-semibold text-slate-900">Recent Capital Activities</h3>
                <p className="text-xs text-slate-500">Live transaction synchronization feed</p>
              </div>
              <button 
                onClick={() => onNavigate("ledger")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg"
              >
                View Ledger 
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl text-xs font-sans font-semibold ${
                      tx.type === "income" 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}>
                      {tx.category.slice(0, 4).toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-sm font-sans font-medium text-slate-900">{tx.merchant}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold ${
                      tx.type === "income" ? "text-emerald-600" : "text-slate-900"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                    {tx.tags && tx.tags.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-100 px-1.5 py-0.2 rounded bg-slate-50">
                        #{tx.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Status Widget (Right col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-sans font-semibold text-slate-900">Capital Budget Caps</h3>
            <p className="text-xs text-slate-500">Live capacity indicators</p>
          </div>

          <div className="mt-3 space-y-3.5 flex-1 justify-center flex flex-col">
            {budgets.slice(0, 4).map((b) => {
              const prc = Math.min(100, (b.spent / b.limit) * 100);
              const isOver = b.spent > b.limit;
              const isYellow = b.spent / b.limit > 0.85 && !isOver;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{b.category}</span>
                    <span className="font-mono text-slate-600">
                      <strong>{formatCurrency(b.spent)}</strong> / {formatCurrency(b.limit)}
                    </span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver 
                          ? "bg-rose-500" 
                          : isYellow 
                            ? "bg-amber-500" 
                            : "bg-indigo-600"
                      }`}
                      style={{ width: `${prc}%` }}
                    />
                  </div>
                  
                  {isOver && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-500 font-mono tracking-tight">
                      <ShieldAlert className="h-3 w-3" /> CAP EXCEEDED BY {formatCurrency(b.spent - b.limit)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => onNavigate("budgets")}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all rounded-xl border border-slate-200/60 text-xs font-semibold"
          >
            Adjust Budget Caps
          </button>
        </div>
      </div>
    </div>
  );
}
