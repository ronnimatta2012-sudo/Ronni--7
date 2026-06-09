import React, { useState, useMemo } from "react";
import { CapitalGoal, UserProfile } from "../types";
import { 
  Plus, 
  Target, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  PiggyBank, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface FinancialGoalsProps {
  goals: CapitalGoal[];
  profile: UserProfile;
  onAddGoal: (goal: Omit<CapitalGoal, "id">) => void;
  onDeleteGoal: (id: string) => void;
  onIncreaseGoal: (id: string, amt: number) => void;
}

export default function FinancialGoals({
  goals,
  profile,
  onAddGoal,
  onDeleteGoal,
  onIncreaseGoal
}: FinancialGoalsProps) {
  // Add goal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [category, setCategory] = useState<any>("Emergency Fund");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  // Contribute state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmt, setContributeAmt] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: profile.baseCurrency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;

    onAddGoal({
      name,
      target: parseFloat(target),
      current: current ? parseFloat(current) : 0,
      category,
      deadline: deadline || new Date().toISOString().split("T")[0],
      notes: notes || undefined
    });

    setName("");
    setTarget("");
    setCurrent("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleContributeSubmit = (id: string) => {
    if (!contributeAmt) return;
    onIncreaseGoal(id, parseFloat(contributeAmt));
    setContributeGoalId(null);
    setContributeAmt("");
  };

  return (
    <div id="aura-goals-viewport" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Capital Savings Targets</h1>
          <p className="text-xs text-slate-500">Formulate high-yield emergency reserves, luxury vacations, or portfolio targets</p>
        </div>

        <button
          id="toggle-add-goal-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Capital Target
        </button>
      </div>

      {showAddForm && (
        <form 
          id="add-goal-form"
          onSubmit={handleAddSubmit} 
          className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-50">
            <h3 className="text-xs font-bold text-indigo-900">Define Novel Capital Target</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400">Dismiss</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="value-y-1">
              <label className="text-xs font-semibold text-slate-600">Goal Designation</label>
              <input
                type="text"
                placeholder="e.g. Rolex Submariner Fund"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="value-y-1">
              <label className="text-xs font-semibold text-slate-600">Target Value</label>
              <input
                type="number"
                placeholder="10000"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="value-y-1">
              <label className="text-xs font-semibold text-slate-600">Current Balance</label>
              <input
                type="number"
                placeholder="1500"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="value-y-1">
              <label className="text-xs font-semibold text-slate-600">Asset Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Travel">Travel & Leisure</option>
                <option value="Car">Vehicular Purchase</option>
                <option value="Property">Real Estate Holdings</option>
                <option value="Investment">Asset Allocation / Stocks</option>
                <option value="Retirement">Retirement Reserve (401k/IRA)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="value-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600">Strategic Target Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="value-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600">Strategic Intent Annotations</label>
              <input
                type="text"
                placeholder="High-yield storage, interest compounding mechanisms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
            >
              Secure Milestone
            </button>
          </div>
        </form>
      )}

      {/* Grid of goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(g => {
          const prc = Math.min(100, (g.current / g.target) * 100);
          const needsStr = formatCurrency(g.target - g.current);
          const isCompleted = g.current >= g.target;

          // Estimate months to goal assuming normal regular monthly contribution of, say, ₹10,000/month
          const monthlyEstimateContribution = 10000;
          const remainingCapital = Math.max(0, g.target - g.current);
          const estimatedMonthsLeft = Math.ceil(remainingCapital / monthlyEstimateContribution);

          return (
            <div 
              key={g.id} 
              id={`goal-card-${g.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[9px] bg-indigo-50 border border-indigo-200/20 text-indigo-750 rounded font-bold uppercase tracking-wider font-mono">
                    {g.category}
                  </span>
                  
                  <button
                    id={`delete-goal-btn-${g.id}`}
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-1.5">
                  <Target className="h-4.5 w-4.5 text-indigo-500" />
                  {g.name}
                </h3>
                
                {g.notes && (
                  <p className="text-xs text-slate-400 leading-normal">{g.notes}</p>
                )}
              </div>

              {/* Progress visualizers */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-800">{prc.toFixed(0)}% Achrived</span>
                  <span className="text-slate-500">
                    <strong>{formatCurrency(g.current)}</strong> / {formatCurrency(g.target)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-indigo-600"}`}
                    style={{ width: `${prc}%` }}
                  />
                </div>
              </div>

              {/* Estimations & interactive contributing sliders */}
              <div className="pt-2 border-t border-slate-100 flex flex-col justify-between space-y-3">
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center justify-between font-sans">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> Months Remaining:</span>
                    <strong className="font-mono text-slate-800">
                      {isCompleted ? "Fully Met" : `${estimatedMonthsLeft} months`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>At contribution rate:</span>
                    <span>{formatCurrency(monthlyEstimateContribution)}/mo</span>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Target Fully Met
                  </div>
                ) : (
                  <div>
                    {contributeGoalId === g.id ? (
                      <div className="flex items-center gap-1.5 animate-in zoom-in-95 leading-none">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">₹</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={contributeAmt}
                            onChange={(e) => setContributeAmt(e.target.value)}
                            className="w-full pl-6 pr-1.5 py-1 text-xs border border-slate-250 bg-slate-50 focus:bg-white rounded font-mono"
                          />
                        </div>
                        <button
                          id={`save-contribution-btn-${g.id}`}
                          onClick={() => handleContributeSubmit(g.id)}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white text-[11px] rounded font-bold"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setContributeGoalId(null)}
                          className="px-1.5 py-1.5 bg-slate-100 text-slate-500 text-[11px] rounded"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`contribute-goal-btn-${g.id}`}
                        onClick={() => setContributeGoalId(g.id)}
                        className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/60 transition"
                      >
                        Allocate Capital Contribution
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
