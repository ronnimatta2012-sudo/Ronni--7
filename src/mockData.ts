import { Transaction, Budget, CapitalGoal, UserProfile, AuditLog, ActiveSession, Notification } from "./types";

export const initialProfile: UserProfile = {
  name: "Ronni Matta",
  email: "ronnimatta.2012@gmail.com",
  tier: "Founder Elite",
  baseCurrency: "INR",
  majorGoal: "Build ₹5-Lakh Emergency Runway & Invest in Nifty 50 Index Funds",
  security2FA: true,
  mfaMethod: "authenticator"
};

export const initialBudgets: Budget[] = [
  { id: "b1", category: "Rent", limit: 35000, spent: 35000, period: "monthly" },
  { id: "b2", category: "Utilities", limit: 6000, spent: 5420, period: "monthly" },
  { id: "b3", category: "Food", limit: 12000, spent: 10850, period: "monthly" },
  { id: "b4", category: "Groceries", limit: 10000, spent: 8750, period: "monthly" },
  { id: "b5", category: "Entertainment", limit: 8000, spent: 4500, period: "monthly" },
  { id: "b6", category: "Transportation", limit: 8000, spent: 8350, period: "monthly" }, // Slightly overspent
  { id: "b7", category: "Subscriptions", limit: 3000, spent: 2850, period: "monthly" },
  { id: "b8", category: "Shopping", limit: 15000, spent: 16200, period: "monthly" } // Overspent
];

export const initialGoals: CapitalGoal[] = [
  {
    id: "g1",
    name: "Emergency Runway (6-Months)",
    target: 500000,
    current: 385000,
    category: "Emergency Fund",
    deadline: "2026-12-31",
    notes: "Targeting 6 months of absolute operational security in high-yield corporate FD."
  },
  {
    id: "g2",
    name: "Kerala Backwaters Vacation",
    target: 80000,
    current: 62000,
    category: "Travel",
    deadline: "2026-08-15",
    notes: "Monsoon getaway in luxury houseboat."
  },
  {
    id: "g3",
    name: "Nifty Mutual Fund Allocation",
    target: 1000000,
    current: 650000,
    category: "Investment",
    deadline: "2027-06-30",
    notes: "Strategic lumpsum investments in Indian blue-chip funds."
  }
];

export const initialSessions: ActiveSession[] = [
  { id: "s1", device: "MacBook Pro 16\" (Aura Web Console)", location: "Mumbai, India", lastActive: "Just now", isCurrent: true },
  { id: "s2", device: "iPhone 15 Pro Max (Aura UPI Client)", location: "Bengaluru, India", lastActive: "2 hours ago", isCurrent: false },
  { id: "s3", device: "iPad M4 (Aura Analytics)", location: "New Delhi, India", lastActive: "Yesterday", isCurrent: false }
];

export const initialAuditLogs: AuditLog[] = [
  { id: "l1", timestamp: "2026-06-09 12:45:00", action: "NPCI OTP Validation Approved", ipAddress: "157.34.120.45", device: "Chrome / macOS (Mumbai)" },
  { id: "l2", timestamp: "2026-06-09 11:32:00", action: "UPI VPA Authenticated via HDFC API Hub", ipAddress: "157.34.120.45", device: "Chrome / macOS (Mumbai)" },
  { id: "l3", timestamp: "2026-06-08 09:24:00", action: "Updated capital goal [Emergency Fund] contribution", ipAddress: "103.88.22.11", device: "iOS UPI Client / Safari" },
  { id: "l4", timestamp: "2026-06-07 18:12:00", action: "Generated NPCI UPI Statement Feed Export", ipAddress: "157.34.120.45", device: "Chrome / macOS (Mumbai)" }
];

export const initialNotifications: Notification[] = [
  {
    id: "n1",
    title: "Overspending warning: Shopping",
    message: "You have exceeded your monthly Shopping budget of ₹15,000 by ₹1,200.",
    type: "warning",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "n2",
    title: "UPI Auto-Debit Pending",
    message: "Jio Fibre Ultra High Speed master billing is scheduled in 3 days via UPI Autopay (₹1,179).",
    type: "info",
    timestamp: "1 day ago",
    read: false
  },
  {
    id: "n3",
    title: "NPCI Secure-Token Synced",
    message: "UPI VPA authorization configured and verified successfully.",
    type: "success",
    timestamp: "1 day ago",
    read: true
  },
  {
    id: "n4",
    title: "Goal Milestone Achieved",
    message: "Congratulations! You have surpassed 75% of your Kerala Houseboat getaway target.",
    type: "goal",
    timestamp: "3 days ago",
    read: true
  }
];

export const initialTransactions: Transaction[] = [
  // Current Month: June 2026 (All localized in INR and paymentMethod restricted to Indian options)
  {
    id: "t1",
    amount: 35000.0,
    type: "expense",
    category: "Rent",
    merchant: "Lodha Prestige Apartments",
    date: "2026-06-01",
    time: "09:00",
    notes: "June Apartment Lease payout via Net Banking Autopay",
    tags: ["rent", "living", "mumbai"],
    currency: "INR",
    paymentMethod: "Net Banking",
    location: "Lower Parel, Mumbai"
  },
  {
    id: "t2",
    amount: 145000.00,
    type: "income",
    category: "Salary",
    merchant: "Infosys Technologies Ltd",
    date: "2026-06-01",
    time: "08:30",
    notes: "Senior Architect Monthly Compensation - HDFC Account Credit",
    tags: ["salary", "primary"],
    currency: "INR",
    paymentMethod: "Linked Bank",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t3",
    amount: 4230.15,
    type: "expense",
    category: "Utilities",
    merchant: "Tata Power Electricity",
    date: "2026-06-03",
    time: "14:15",
    notes: "Monthly electric power charges via UPI Autopay",
    tags: ["utility", "house"],
    currency: "INR",
    paymentMethod: "UPI",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t4",
    amount: 3840.20,
    type: "expense",
    category: "Groceries",
    merchant: "BigBasket / Tata Enterprise",
    date: "2026-06-04",
    time: "11:45",
    notes: "Weekly organic provisioning, vegetables, dairy, and grains",
    tags: ["groceries", "home"],
    currency: "INR",
    paymentMethod: "UPI",
    location: "Bandra, Mumbai"
  },
  {
    id: "t5",
    amount: 4200.00,
    type: "expense",
    category: "Transportation",
    merchant: "HP Petrol Pump",
    date: "2026-06-04",
    time: "08:10",
    notes: "Full tank fuel up for city transit",
    tags: ["commute", "car"],
    currency: "INR",
    paymentMethod: "Rupay Credit",
    location: "Worli, Mumbai"
  },
  {
    id: "t6",
    amount: 1540.00,
    type: "expense",
    category: "Transportation",
    merchant: "Ola Cabs Elite Wallet",
    date: "2026-06-05",
    time: "17:30",
    notes: "Prime Sedan rides to corporate summit",
    tags: ["commute", "ola"],
    currency: "INR",
    paymentMethod: "UPI"
  },
  {
    id: "t7",
    amount: 25000.00,
    type: "income",
    category: "Freelance",
    merchant: "Ather Energy Consult",
    date: "2026-06-05",
    time: "16:00",
    notes: "EV architecture review consulting commission",
    tags: ["consulting", "ev"],
    currency: "INR",
    paymentMethod: "UPI"
  },
  {
    id: "t8",
    amount: 12499.00,
    type: "expense",
    category: "Shopping",
    merchant: "Reliance Digital (Infinity Mall)",
    date: "2026-06-06",
    time: "13:00",
    notes: "Premium wireless noise-cancelling desk setup gear",
    tags: ["tech", "shopping"],
    currency: "INR",
    paymentMethod: "Rupay Credit",
    location: "Andheri West, Mumbai"
  },
  {
    id: "t9",
    amount: 1179.00,
    type: "expense",
    category: "Subscriptions",
    merchant: "Jio Fibre Ultra Broadband",
    date: "2026-06-06",
    time: "00:05",
    notes: "High-speed gigabit home connection autopay",
    tags: ["internet", "broadband"],
    currency: "INR",
    paymentMethod: "UPI",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t10",
    amount: 179.00,
    type: "expense",
    category: "Subscriptions",
    merchant: "Spotify Premium India",
    date: "2026-06-07",
    time: "02:15",
    notes: "Individual Premium Audio plan",
    tags: ["music", "subscriptions"],
    currency: "INR",
    paymentMethod: "UPI",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t11",
    amount: 649.00,
    type: "expense",
    category: "Subscriptions",
    merchant: "Netflix Premium India (Ultra HD)",
    date: "2026-06-07",
    time: "04:30",
    notes: "Netflix India Family Multi-screen subscription",
    tags: ["entertainment", "subscriptions"],
    currency: "INR",
    paymentMethod: "UPI",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t12",
    amount: 2450.50,
    type: "expense",
    category: "Food",
    merchant: "The Taj Mahal Palace (Souk)",
    date: "2026-06-07",
    time: "20:00",
    notes: "Executive celebratory lunch dinner",
    tags: ["food", "luxury"],
    currency: "INR",
    paymentMethod: "UPI",
    location: "Colaba, Mumbai"
  },
  {
    id: "t13",
    amount: 1750.00,
    type: "expense",
    category: "Food",
    merchant: "Swiggy Select Order",
    date: "2026-06-08",
    time: "21:30",
    notes: "Gourmet biryani feast ordered to residence",
    tags: ["dinner", "swiggy"],
    currency: "INR",
    paymentMethod: "UPI"
  },
  // May 2026 Data
  {
    id: "t14",
    amount: 145000.00,
    type: "income",
    category: "Salary",
    merchant: "Infosys Technologies Ltd",
    date: "2026-05-01",
    time: "08:30",
    notes: "Monthly architect salary credit",
    tags: ["salary"],
    currency: "INR",
    paymentMethod: "Linked Bank",
    isRecurring: true,
    recurringPeriod: "monthly"
  },
  {
    id: "t15",
    amount: 35000.00,
    type: "expense",
    category: "Rent",
    merchant: "Lodha Prestige Apartments",
    date: "2026-05-01",
    time: "09:00",
    tags: ["rent"],
    currency: "INR",
    paymentMethod: "Net Banking"
  },
  {
    id: "t16",
    amount: 45000.00,
    type: "expense",
    category: "Travel",
    merchant: "Indigo Air Lines India",
    date: "2026-05-12",
    time: "10:30",
    notes: "Houseboat vacation flight bookings",
    tags: ["travel", "vacation"],
    currency: "INR",
    paymentMethod: "UPI"
  },
  {
    id: "t17",
    amount: 1850.20,
    type: "expense",
    category: "Healthcare",
    merchant: "Apollo Pharmacy Store",
    date: "2026-05-15",
    time: "11:00",
    notes: "Daily wellness supplements and prescriptions",
    tags: ["health", "wellbeing"],
    currency: "INR",
    paymentMethod: "UPI"
  },
  {
    id: "t18",
    amount: 15000.00,
    type: "income",
    category: "Investments",
    merchant: "Nippon India ETF Payout",
    date: "2026-05-20",
    time: "10:00",
    notes: "Strategic dividend payouts compounding on index holding",
    tags: ["investments", "dividends"],
    currency: "INR",
    paymentMethod: "Linked Bank"
  }
];

export const sampleReceipts = [
  {
    name: "Swiggy Biryani Feast, Mumbai",
    image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
    ocrData: {
      merchant: "Swiggy / Bundl Technologies",
      amount: 1899.00,
      tax: 90.00,
      date: "2026-06-08",
      category: "Food",
      items: [
        { name: "Premium Hyderabadi Chicken Biryani Large", price: 1250.00 },
        { name: "Double Ka Meetha Saffron Dessert Combo", price: 350.00 },
        { name: "Garlic Butter Naan Portion x3", price: 209.00 },
        { name: "CGST/SGST & Swiggy Platform Surcharges", price: 90.00 }
      ]
    }
  },
  {
    name: "Reliance Digital Electronics",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
    ocrData: {
      merchant: "Reliance Digital Retail",
      amount: 12499.00,
      tax: 1906.00,
      date: "2026-06-06",
      category: "Shopping",
      items: [
        { name: "OnePlus Nord Buds 3 Pro Active ANC Edition", price: 10593.00 },
        { name: "Type-C High-Speed Premium Braided Cable 2m", price: 1906.00 }
      ]
    }
  }
];
