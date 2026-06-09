import React, { useState, useMemo } from "react";
import { Budget, UserProfile } from "../types";
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  BrainCircuit,
  PiggyBank
} from "lucide-react";

interface AuraBudgetHelperProps {
  budgets: Budget[];
  profile: UserProfile;
  onUpdateLimit: (id: string, limit: number) => void;
  onAddBudget: (category: string, limit: number, period: any) => void;
  onDeleteBudget: (id: string) => void;
}

const ALL_CATEGORIES = [
  "Food", "Groceries", "Rent", "Utilities", "Transportation", 
  "Entertainment", "Shopping", "Healthcare", "Travel", 
  "Education", "Investments", "Insurance", "Subscriptions", "Other"
];

export default function AuraBudgetHelper({
  budgets,
  profile,
  onUpdateLimit,
  onAddBudget,
  onDeleteBudget
}: AuraBudgetHelperProps) {
  // Add Budget State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState("Entertainment");
  const [newLimit, setNewLimit] = useState("");
  const [newPeriod, setNewPeriod] = useState<any>("monthly");

  // Edit Limit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: profile.baseCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Forecasting Calculation: June 9, 2026 => 30% of month elapsed (9 days out of 30)
  const monthPercentElapsed = 0.30; 

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimit) return;
    
    // Check if budget for category already exists
    if (budgets.some(b => b.category.toLowerCase() === newCategory.toLowerCase())) {
      alert(`Budget for ${newCategory} category already exists. Please edit its limit instead.`);
      return;
    }

    onAddBudget(newCategory, parseFloat(newLimit), newPeriod);
    setNewLimit("");
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editLimitVal) return;
    onUpdateLimit(id, parseFloat(editLimitVal));
    setEditingId(null);
    setEditLimitVal("");
  };

  // Dynamic recommendations based on budgets
  const recommendations = useMemo(() => {
    const list: string[] = [];
    let totalLimits = 0;
    let totalSpent = 0;

    budgets.forEach(b => {
      totalLimits += b.limit;
      totalSpent += b.spent;

      // Category specific forecasting rules
      const forecasted = b.spent / monthPercentElapsed;
      if (forecasted > b.limit) {
        list.push(`The monthly trajectory for "${b.category}" is estimated to reach ${formatCurrency(forecasted)}, exceeding your cap of ${formatCurrency(b.limit)} by ${(forecasted/b.limit*100 - 100).toFixed(0)}%. Highly recommend chilling premium retail outings or luxury purchases for the remainder of June.`);
      }
    });

    if (totalSpent > totalLimits) {
      list.push(`Total allocation is exceeding limits. Your overall spending efficiency has shrunk. Consider pruning non-subsistence caps like Shopping or Travel.`);
    } else if (totalSpent / totalLimits > 0.8) {
      list.push(`Your cumulative budget utilization sits at ${(totalSpent/totalLimits*100).toFixed(0)}%. You possess healthy headroom, but suggest setting up recurring automated transfers to your high-yield goal reserves to capture excess arbitrage.`);
    }

    if (list.length === 0) {
      list.push("Excellent wealth administration! All categories are inside healthy threshold zones. Keep maintaining current habits.");
    }

    return list;
  }, [budgets]);

  return (
    <div id="aura-budget-viewport" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wealth Budgeting Lab</h1>
          <p className="text-xs text-slate-500">Configure absolute category caps, review trajectories, and optimize resource utility</p>
        </div>

        <button
          id="toggle-add-budget-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Cap Target
        </button>
      </div>

      {showAddForm && (
        <form 
          id="add-budget-form"
          onSubmit={handleAddSubmit} 
          className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-50">
            <h3 className="text-xs font-bold text-indigo-900">Define Novel Cap Target</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400">Dismiss</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Category Selection</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Monthly Limit Cap</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  placeholder="2000"
                  required
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Targeting Cycle</label>
              <select
                value={newPeriod}
                onChange={(e: any) => setNewPeriod(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="monthly">Monthly Master Cycle</option>
                <option value="annual">Yearly Macro Cycle</option>
                <option value="custom">Custom Milestone</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
            >
              Confirm Cap
            </button>
          </div>
        </form>
      )}

      {/* Main Budget layout & Predictive analytics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active limit list (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Operational Category Budgets</h3>
                <p className="text-xs text-slate-500">Live limits versus spent aggregates</p>
              </div>

              <span className="px-2.5 py-1 text-[10px] font-mono bg-indigo-50 text-indigo-700 rounded-full border border-indigo-120/10 font-bold">
                JUNE CYCLE PROGRESS: 30% ELAPSED
              </span>
            </div>

            <div className="mt-5 divide-y divide-slate-100 space-y-5">
              {budgets.map(b => {
                const prc = Math.min(100, (b.spent / b.limit) * 100);
                const isOver = b.spent > b.limit;
                const isWarning = b.spent / b.limit > 0.85 && !isOver;
                const projected = b.spent / monthPercentElapsed;
                const isProjectedOver = projected > b.limit;

                return (
                  <div key={b.id} id={`budget-card-${b.id}`} className="pt-4 first:pt-0 space-y-2.5 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          isOver 
                            ? "bg-rose-500" 
                            : isWarning 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                        }`}></span>
                        <h4 className="text-sm font-bold text-slate-800 font-sans">{b.category}</h4>
                        <span className="text-[10px] font-mono text-slate-400 capitalize">({b.period})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {editingId === b.id ? (
                          <div className="flex items-center gap-1 animate-in zoom-in-95 duration-150">
                            <input
                              type="number"
                              placeholder={b.limit.toString()}
                              value={editLimitVal}
                              onChange={(e) => setEditLimitVal(e.target.value)}
                              className="w-20 px-1.5 py-0.5 border border-indigo-350 text-xs font-mono rounded bg-slate-50 focus:outline-none"
                            />
                            <button
                              id={`save-budget-btn-${b.id}`}
                              onClick={() => handleSaveEdit(b.id)}
                              className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-1.5 py-0.5 bg-slate-150 text-slate-600 text-[10px] rounded"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-600">
                              Spent: <strong className="text-slate-900 font-semibold">{formatCurrency(b.spent)}</strong> of {formatCurrency(b.limit)}
                            </span>
                            <button
                              id={`edit-budget-btn-${b.id}`}
                              onClick={() => {
                                setEditingId(b.id);
                                setEditLimitVal(b.limit.toString());
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              id={`delete-budget-btn-${b.id}`}
                              onClick={() => onDeleteBudget(b.id)}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress tracking line */}
                    <div className="relative">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver 
                              ? "bg-rose-500" 
                              : isWarning 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${prc}%` }}
                        />
                      </div>
                      
                      {/* Standard month-elapsed marker line to easily visual overspending trajectory */}
                      <div 
                        title="Elapsed month progress marker (30% point)"
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400/60"
                        style={{ left: "30%" }}
                      />
                    </div>

                    {/* Rich dynamic forecasting and warnings */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                      <div className="text-slate-500 font-sans flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-cyan-600" />
                        <span>Trajectory Forecast: </span>
                        <strong className={`font-mono text-[11px] ${isProjectedOver ? "text-rose-500" : "text-emerald-600"}`}>
                          {formatCurrency(projected)}
                        </strong>
                        <span className="text-[10px]">by June 30</span>
                      </div>

                      {isOver ? (
                        <span className="text-rose-500 font-mono font-bold tracking-tight text-[10px] flex items-center gap-0.5 bg-rose-50/50 px-2 py-0.5 rounded-lg border border-rose-100">
                          <AlertTriangle className="h-3 w-3" /> EXCEEDED BY {formatCurrency(b.spent - b.limit)}
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-600 font-mono text-[10px] flex items-center gap-1 bg-amber-50/50 px-2 py-0.5 rounded-lg">
                          <AlertTriangle className="h-3 w-3" /> UTILIZED {(b.spent/b.limit*100).toFixed(0)}% (HIGH VOLUME)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-mono text-[10px] flex items-center gap-1 bg-emerald-50/50 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="h-3 w-3" /> EFFICIENT ZONE ({(b.spent/b.limit*100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI budget Center & Advisor insights (1 col) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-5 rounded-2xl border border-indigo-950 shadow-lg text-white flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <BrainCircuit className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Aura Forecast Engine</span>
              </div>
              <h3 className="text-base font-bold font-sans">Strategic Recommendations</h3>
              <p className="text-xs text-slate-300">Generative AI observations compiled from active account velocities.</p>
            </div>

            <div className="mt-4 space-y-3.5 flex-1 select-none">
              {recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-slate-300 leading-normal flex gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                  <span className="text-indigo-400 font-bold font-mono">#{index+1}</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/30">
                <PiggyBank className="h-4 w-4 text-emerald-400" />
                <div className="text-[10px] text-slate-300 leading-tight">
                  Adjusting budgets acts as live triggers for cashflow alert warnings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
