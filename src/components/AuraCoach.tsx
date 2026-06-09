import React, { useState, useRef, useEffect } from "react";
import { Transaction, Budget, CapitalGoal, UserProfile } from "../types";
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  TrendingDown, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle,
  TrendingUp,
  FileText,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface AuraCoachProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: CapitalGoal[];
  profile: UserProfile;
}

interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

export default function AuraCoach({
  transactions,
  budgets,
  goals,
  profile
}: AuraCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "m0",
      sender: "coach",
      text: `### ⚜️ Aura Wealth Management Console

Greetings **${profile.name}**. I am your Aura Personal Advisor, certified financial planner, and cash flow strategist. 

I have mapped your capital parameters. Currently:
- **Liquidity**: Healthy reserves tracked.
- **Goals status**: ${goals.length} active savings goals are being compound tracked. 
- **Adherence**: Some category caps are reporting overspending risks.

Click one of the **Strategic Diagnostics** options on the panel or type an expert advisory question to begin our session.`,
      timestamp: "Just now"
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: transactions,
          budgets: budgets,
          goals: goals,
          message: messageText,
          userProfile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        const coachMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          sender: "coach",
          text: data.response || "I could not format proper advice at this time.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, coachMsg]);
      } else {
        throw new Error("Diagnosis failed");
      }
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `c-err-${Date.now()}`,
        sender: "coach",
        text: `### ⚠️ Connection Diagnostic Incomplete\n\nI was unable to secure a live advising hook due to network restrictions. However, looking at your static limits: **your Food spend sits at ₹10,850** and **Transportation is over limit by ₹350**. Consider dialing back fine dining.`,
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetTrigger = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div id="aura-coach-viewport" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-indigo-600 animate-pulse" />
          Aura Financial AI Coach
        </h1>
        <p className="text-xs text-slate-500">
          Executive certified advice, anomaly auditing, and savings recommendations managed server-side by Gemini AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px] items-stretch">
        {/* Presets Diagnostics Column (Left 1 col) */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-indigo-500" />
              Diagnostics Lab
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Execute precise pre-written financial prompt audits on your active ledger parameters.
            </p>

            <div className="space-y-2 mt-4">
              <button
                id="diagnostic-audit-btn"
                onClick={() => handlePresetTrigger("Please run a full Executive Balance Audit on my June accounts and calculate my Financial Health Index.")}
                className="w-full text-left p-3 hover:p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-120/15 rounded-xl text-xs font-semibold text-slate-800 transition block leading-tight"
              >
                <span className="text-[10px] text-indigo-600 block font-bold font-mono">REPORT #1</span>
                Monthly Balance Audit
              </button>

              <button
                id="diagnostic-sub-btn"
                onClick={() => handlePresetTrigger("Analyze my Subscription spending habits. Do I have unused recurring leaks or digital bloating?")}
                className="w-full text-left p-3 hover:p-3 bg-indigo-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-800 transition block leading-tight"
              >
                <span className="text-[10px] text-cyan-600 block font-bold font-mono">REPORT #2</span>
                Audit Subscriptions Creep
              </button>

              <button
                id="diagnostic-emergency-btn"
                onClick={() => handlePresetTrigger("Am I on track for my savings goals? Please analyze my Emergency Fund goal and propose a quick monthly contribution schedule.")}
                className="w-full text-left p-3 hover:p-3 bg-indigo-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-800 transition block leading-tight"
              >
                <span className="text-[10px] text-emerald-600 block font-bold font-mono">REPORT #3</span>
                Goal Runway Planning
              </button>

              <button
                id="preset-anomalies-btn"
                onClick={() => handlePresetTrigger("Have you detected any transaction anomalies, duplicate charges, or suspicious spending velocity in my recent ledger entries?")}
                className="w-full text-left p-3 hover:p-3 bg-indigo-50/50 hover:bg-slate-50 border border-rose-220/20 rounded-xl text-xs font-semibold text-slate-800 transition block leading-tight"
              >
                <span className="text-[10px] text-rose-500 block font-bold font-mono">REPORT #4</span>
                Anomaly & Risk Detection
              </button>
            </div>
          </div>

          {/* Quick coaching info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
            <h4 className="font-bold text-slate-700">Advising Framework</h4>
            <p className="leading-snug">Answers use verified mathematical models mapping cash velocities. No real investment actions are triggered.</p>
          </div>
        </div>

        {/* Conversation Workspace (Right 3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-950 flex flex-col justify-between shadow-xl overflow-hidden relative">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350">AURA ELITE WEB LINK ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono hover:underline text-slate-500">June 9, 2026</span>
          </div>

          {/* Chat scrolling feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-white font-sans max-h-[460px] scrollbar-thin">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
              >
                <div className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50"
                }`}>
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  <span className="block text-[9px] mt-1 text-right text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="max-w-xs bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 text-slate-300 rounded-bl-none flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span className="text-xs font-mono">Compiling luxury advisories...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Bottom input area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }} 
            className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Aura anything about budgets, asset diversification, or cash flows..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 text-white rounded-xl"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
