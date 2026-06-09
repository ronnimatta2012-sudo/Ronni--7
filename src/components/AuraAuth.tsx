import React, { useState } from "react";
import { UserProfile, Transaction, Budget, CapitalGoal } from "../types";
import { 
  Sparkles, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Building,
  RefreshCw,
  Building2,
  HelpCircle
} from "lucide-react";

interface AuraAuthProps {
  onCompleteAuth: (
    profile: UserProfile, 
    onboardedSalary: number, 
    linkBank: boolean, 
    linkedBankName: string
  ) => void;
}

const SUPPORTED_CURRENCIES = [
  { code: "INR", name: "Indian Rupee (₹)", symbol: "₹" }
];

const HEAR_ABOUT_US_CHANNELS = [
  "Twitter / X Platform",
  "Finology / Indian Business News",
  "Product Hunt",
  "Personal Recommendation / Friend",
  "Web Search (Google)",
  "Executive Wealth Newsletter India",
  "Other"
];

const POPULAR_BANKS = [
  { id: "sbi", name: "State Bank of India (SBI)", country: "India" },
  { id: "hdfc", name: "HDFC Bank Ltd.", country: "India" },
  { id: "icici", name: "ICICI Bank Ltd.", country: "India" },
  { id: "axis", name: "Axis Bank Ltd.", country: "India" },
  { id: "kotak", name: "Kotak Mahindra Bank Ltd.", country: "India" },
  { id: "pnb", name: "Punjab National Bank (PNB)", country: "India" }
];

export default function AuraAuth({ onCompleteAuth }: AuraAuthProps) {
  // Mode: "signin" | "signup" | "onboarding"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "onboarding">("signin");
  
  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Onboarding Quiz Steps
  // Step 0: Basic Info (Name, Birthday)
  // Step 1: Currency & Income (Currency Selection, Salary)
  // Step 2: Discovery (How heard about us)
  // Step 3: Link Bank Account (Bank linking option)
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Onboarding state values
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [monthlySalary, setMonthlySalary] = useState("125000");
  const [heardChannel, setHeardChannel] = useState(HEAR_ABOUT_US_CHANNELS[0]); // Twitter default
  const [linkBank, setLinkBank] = useState<boolean>(true);
  const [selectedBankId, setSelectedBankId] = useState("hdfc");
  const [upiId, setUpiId] = useState("");
  const [isLinkingBankInUI, setIsLinkingBankInUI] = useState(false);
  const [bankLinkSuccess, setBankLinkSuccess] = useState(false);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide your account credentials.");
      return;
    }
    setErrorMsg("");

    // Automatically transition to completed setup for a personalized customized workspace
    // Let's assume standard sign in sets up Ronni Matta or starts clean onboarding if they want
    if (email.toLowerCase().includes("new") || email.toLowerCase().includes("fresh")) {
      setFullName("");
      setAuthMode("onboarding");
      setOnboardingStep(0);
    } else {
      // Direct Sign In simulation: load configured profile but reset values if they wish
      // Let's greet them:
      setFullName("Ronni Matta");
      setAuthMode("onboarding");
      setOnboardingStep(0);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Required specifications are missing.");
      return;
    }
    setErrorMsg("");
    setFullName("");
    setAuthMode("onboarding");
    setOnboardingStep(0);
  };

  const handleNextStep = () => {
    if (onboardingStep === 0) {
      if (!fullName) {
        setErrorMsg("Please specify your name.");
        return;
      }
      if (!birthday) {
        setErrorMsg("Please specify your date of birth.");
        return;
      }
      setErrorMsg("");
    }
    if (onboardingStep === 1) {
      if (!monthlySalary || parseFloat(monthlySalary) <= 0) {
        setErrorMsg("Please supply a valid monthly income.");
        return;
      }
      setErrorMsg("");
    }

    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
    } else {
      handleFinalizeSetup();
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    if (onboardingStep > 0) {
      setOnboardingStep(prev => prev - 1);
    } else {
      setAuthMode("signup");
    }
  };

  const handleSimulateBankConnection = () => {
    setIsLinkingBankInUI(true);
    setTimeout(() => {
      setIsLinkingBankInUI(false);
      setBankLinkSuccess(true);
      setErrorMsg("");
    }, 1800);
  };

  const handleFinalizeSetup = () => {
    const selectedBankObj = POPULAR_BANKS.find(b => b.id === selectedBankId);
    let linkedBankName = linkBank && bankLinkSuccess ? (selectedBankObj?.name || "Connected Bank") : "None";
    if (linkBank && bankLinkSuccess && upiId) {
      linkedBankName = `${linkedBankName} (UPI VPA: ${upiId})`;
    }

    const customProfile: UserProfile = {
      name: fullName || "Noble Investor",
      email: email || "user@aurafintech.in",
      tier: "Executive Premium",
      baseCurrency: baseCurrency,
      majorGoal: `Maximize wealth yield through UPI autopay, recurring funds and portfolio logs.`,
      security2FA: true,
      mfaMethod: "authenticator",
      birthday: birthday,
      heardAboutUs: heardChannel,
      onboardedSalary: parseFloat(monthlySalary),
      bankLinkedAtStart: linkBank && bankLinkSuccess,
      isNewUser: true
    };

    onCompleteAuth(customProfile, parseFloat(monthlySalary), linkBank && bankLinkSuccess, linkedBankName);
  };

  // Helper currency representation
  const activeCurrencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === baseCurrency)?.symbol || "$";

  return (
    <div id="auth-portal-viewport" className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Visual Ambient glow in background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl" />

      <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 relative z-10 backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-1 pb-6 border-b border-slate-800">
          <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-900/30">
            <Wallet className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-white mt-3">AURA FINTECH</h1>
          <p className="text-[11px] text-slate-400 font-mono tracking-widest uppercase font-bold">EXECUTIVE MANAGEMENT CONSOLE</p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. SIGN IN SCREEN */}
        {authMode === "signin" && (
          <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">EXECUTIVE EMAIL</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. executive@aurafintech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">SECURITY PASSCODE</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 transition py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-900/30"
            >
              Secure Login Authorization
            </button>

            <div className="text-center pt-4 text-xs text-slate-400">
              New client to Aura console?{" "}
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setErrorMsg(""); }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Establish Fresh Credentials
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP SCREEN */}
        {authMode === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">DESIRED ACCOUNT EMAIL</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. investor@aurafintech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">DEFINE SECURITY KEY</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 transition py-2.5 rounded-xl text-xs font-bold text-white shadow-lg"
            >
              Create Elite Account Matrix
            </button>

            <div className="text-center pt-4 text-xs text-slate-400">
              Already possess an account?{" "}
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setErrorMsg(""); }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. MULTI-STEP ONBOARDING QUESTIONNAIRE */}
        {authMode === "onboarding" && (
          <div className="mt-6 space-y-6">
            
            {/* Step indicators */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                SETUP FLOW: STEP {onboardingStep + 1} OF 4
              </span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((idx) => (
                  <span 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${
                      idx === onboardingStep ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 0: Human Details (Name & Birth Date) */}
            {onboardingStep === 0 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-indigo-400" />
                    Tell us about yourself
                  </h3>
                  <p className="text-xs text-slate-400">Please provide your executive name and birthday to open your personal vault.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ronni Matta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Date of Birth</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">
                      <Calendar className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="date"
                      required
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Core Financial Parameters (Default Currency & Monthly Salary) */}
            {onboardingStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-indigo-400" />
                    Determine Wealth Scope
                  </h3>
                  <p className="text-xs text-slate-400">Choose your base denomination currency (featuring all major global assets) and enter your monthly net salary.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Nominal Valuation Currency</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {SUPPORTED_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Monthly Salary / Primary Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-indigo-400 font-mono font-bold">
                      {activeCurrencySymbol}
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 8500"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-505 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 leading-normal block">This income will initialize automatically inside your fresh ledger statement.</span>
                </div>
              </div>
            )}

            {/* STEP 2: Discovery Poll (How did you hear about us?) */}
            {onboardingStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-indigo-400" />
                    How did you hear about us?
                  </h3>
                  <p className="text-xs text-slate-400">Help us map the distribution reach of the Aura suite.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Acquisition Channel</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {HEAR_ABOUT_US_CHANNELS.map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setHeardChannel(channel)}
                        className={`w-full p-3 rounded-xl border text-xs text-left font-semibold transition ${
                          heardChannel === channel
                            ? "bg-indigo-600/20 border-indigo-505 text-white"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-350"
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Bank Link & UPI Integration simulation */}
            {onboardingStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Building2 className="h-4.5 w-4.5 text-indigo-400" />
                    Indian Bank & UPI VPA API Link
                  </h3>
                  <p className="text-xs text-slate-400">Would you like to register and link your primary bank account and UPI address? This activates automated Indian Rupee ledger live updates.</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-slate-200">Enable Secure Bank & UPI Sync</h4>
                    <p className="text-[10px] text-slate-500">Enable to automatically sync UPI statements securely.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={linkBank}
                      onChange={(e) => {
                        setLinkBank(e.target.checked);
                        if (!e.target.checked) {
                          setBankLinkSuccess(false);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {linkBank && (
                  <div className="space-y-3.5 p-3 bg-slate-900 rounded-xl border border-slate-805 animate-in zoom-in-95 leading-normal">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Select Primary Indian Bank</label>
                      <select
                        value={selectedBankId}
                        onChange={(e) => {
                          setSelectedBankId(e.target.value);
                          setBankLinkSuccess(false);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      >
                        {POPULAR_BANKS.map(bank => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">UPI VPA ID (Virtual Private Address)</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile@okhdfcbank or user@oksbi"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setBankLinkSuccess(false);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-805 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[9px] text-slate-500 mt-1 block">Compatible with Google Pay, PhonePe, Paytm, BHIM and CRED VPAs</span>
                    </div>

                    {bankLinkSuccess ? (
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-semibold block">UPI & Core Bank Registered</span>
                          <span className="text-[10px] text-emerald-400/80">Successfully linked HDFC/SBI instance via Secure UPI API token.</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSimulateBankConnection}
                        disabled={isLinkingBankInUI || !upiId}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5"
                      >
                        {isLinkingBankInUI ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Authorizing UPI Link with NPCI...
                          </>
                        ) : (
                          "Verify & Link UPI Account"
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs select-none hover:bg-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs select-none hover:bg-indigo-700 flex items-center gap-1"
              >
                {onboardingStep === 3 ? "Complete Registration" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
