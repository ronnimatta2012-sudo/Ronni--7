export type CategoryType =
  | "Food"
  | "Groceries"
  | "Rent"
  | "Utilities"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Healthcare"
  | "Travel"
  | "Education"
  | "Investments"
  | "Insurance"
  | "Subscriptions"
  | "Other";

export interface Transaction {
  id: string;
  amount: number;
  type: "expense" | "income";
  category: CategoryType | string;
  subcategory?: string;
  merchant: string;
  date: string;
  time?: string;
  notes?: string;
  receiptImage?: string; // base64 or placeholder URL
  tags: string[];
  currency: string;
  paymentMethod: "UPI" | "Rupay Credit" | "Net Banking" | "Cash" | "Visa / Mastercard" | "Linked Bank";
  location?: string;
  isRecurring?: boolean;
  recurringPeriod?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "annual" | "custom";
}

export interface CapitalGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: "Emergency Fund" | "Travel" | "Car" | "Property" | "Investment" | "Retirement" | "Other";
  deadline: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  tier: "Executive Premium" | "Founder Elite" | "Standard Free";
  baseCurrency: string;
  majorGoal: string;
  security2FA: boolean;
  mfaMethod: "none" | "authenticator" | "sms";
  birthday?: string;
  heardAboutUs?: string;
  onboardedSalary?: number;
  bankLinkedAtStart?: boolean;
  isNewUser?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  ipAddress: string;
  device: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "goal";
  timestamp: string;
  read: boolean;
}
