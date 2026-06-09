import React, { useState } from "react";
import { UserProfile, ActiveSession, AuditLog } from "../types";
import { 
  User, 
  ShieldCheck, 
  Pocket, 
  History, 
  KeyRound, 
  CheckCircle, 
  LogOut, 
  AlertCircle,
  Globe,
  Coins
} from "lucide-react";

interface AuraSettingsProps {
  profile: UserProfile;
  sessions: ActiveSession[];
  logs: AuditLog[];
  onUpdateProfile: (p: Partial<UserProfile>) => void;
}

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee (₹)", symbol: "₹" }
];

export default function AuraSettings({
  profile,
  sessions,
  logs,
  onUpdateProfile
}: AuraSettingsProps) {
  // Local modified states
  const [name, setName] = useState(profile.name);
  const [majorGoal, setMajorGoal] = useState(profile.majorGoal);
  const [security2FA, setSecurity2FA] = useState(profile.security2FA);
  const [baseCurrency, setBaseCurrency] = useState(profile.baseCurrency);

  const [savingStatus, setSavingStatus] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus(true);
    setTimeout(() => {
      onUpdateProfile({
        name,
        majorGoal,
        security2FA,
        baseCurrency
      });
      setSavingStatus(false);
    }, 800);
  };

  return (
    <div id="aura-settings-viewport" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security & Prefs Console</h1>
        <p className="text-xs text-slate-500">Configure base currencies, multi-factor logins, examine active devices, and inspect compliance audits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Form options */}
        <div className="lg:col-span-2 space-y-6">
          <form 
            onSubmit={handleSaveProfile} 
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
          >
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-indigo-500" />
                Regional & General Preference
              </h3>
              
              {savingStatus && (
                <span className="text-xs text-indigo-600 animate-pulse font-mono">Syncing Vault...</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Executive Account Holder</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Designated Base Nominal Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(e: any) => setBaseCurrency(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-600">Major Wealth target description</label>
                <input
                  type="text"
                  value={majorGoal}
                  onChange={(e) => setMajorGoal(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  MFA / 2-Factor Authentication Secures
                </h4>
                <p className="text-[10px] text-slate-400">Forces authentication token confirmation on fresh browser sessions.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={security2FA}
                  onChange={(e) => setSecurity2FA(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                id="save-profile-btn"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-xs text-white rounded-xl shadow-xs"
              >
                Apply Preferences
              </button>
            </div>
          </form>

          {/* Compliance Audit Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <History className="h-4.5 w-4.5 text-slate-400" />
              Vault compliance Audit log
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight">These entries logs administrative adjustments to verify compliance metrics.</p>

            <div className="divide-y divide-slate-150 text-xs">
              {logs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50 rounded-lg px-1.5">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800">{log.action}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      IP: {log.ipAddress} • {log.device}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-405 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active sessions visualization */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-950 shadow-lg space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 border border-indigo-400/20 rounded font-bold font-mono">ACTIVE SESSIONS</span>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                <KeyRound className="h-4 w-4" /> Device Sync Matrix
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {sessions.map(s => (
                <div key={s.id} className="p-3 bg-slate-800/65 rounded-xl border border-slate-700/50 space-y-1 hover:border-slate-600 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-none text-slate-200">{s.device}</span>
                    {s.isCurrent && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-bold border border-emerald-400/20 flex items-center">
                        <span className="h-1 text-[9px] w-1 rounded-full bg-emerald-400 mr-1"></span> Current
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans leading-none">
                    Location: {s.location}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Last synchronised: {s.lastActive}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
              <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <span>To force termination of synchronised peripheral endpoints, generate a master credentials audit refresh.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
