export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'bank' | 'cash' | 'savings' | 'other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  bankName?: string;
  cardNumber?: string;
  shaba?: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // Jalali format: YYYY/MM/DD
  time?: string;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  fee?: number; // Transfer fee
  receiptUrl?: string; // base64 or image url
  tags?: string[];
  debtId?: string; // Optional link to a Debt or Loan
  personId?: string; // Optional link to a Person/Contact
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // e.g. "1403-06"
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export interface Person {
  id: string;
  name: string;
  phoneNumber?: string;
  relation?: string; // مثلاً: دوست، خانواده، همکار، بانک، مشتری
  notes?: string;
  createdAt?: string;
}

export type DebtType = 'debt' | 'credit';

export interface DebtPayment {
  id: string;
  transactionId?: string;
  amount: number;
  date: string; // تاریخ شمسی
  accountId: string; // شناسه حساب بانکی
  accountName?: string;
  description?: string;
}


export interface Debt {
  id: string;
  type: DebtType;
  personId?: string;
  personName: string;
  phoneNumber?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  startDate?: string;
  category?: 'personal' | 'loan' | 'installment' | 'other';
  accountId?: string; // حساب پیش‌فرض برای تسویه
  description?: string;
  isSettled: boolean;
  payments?: DebtPayment[];
}

export type ChequeType = 'receivable' | 'payable';
export type ChequeStatus = 'pending' | 'passed' | 'bounced';

export interface Cheque {
  id: string;
  type: ChequeType;
  amount: number;
  dueDate: string;
  bankName: string;
  chequeNumber: string;
  sayadNumber?: string;
  partyName: string;
  personId?: string;
  status: ChequeStatus;
  notes?: string;
}

export type Currency = 'toman' | 'rial';

// Theme Studio Pro Types
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'purple' | 'custom';
export type GlassIntensity = 'low' | 'medium' | 'high';
export type AnimationSpeed = 'fast' | 'normal' | 'none';
export type BorderRadius = 'sharp' | 'smooth' | 'round';
export type AmbientGlow = 'off' | 'subtle' | 'vibrant';
export type LightStyle = 'pure_white' | 'frost' | 'warm_cream' | 'soft_slate';

export interface DashboardSectionConfig {
  showHero: boolean;
  showKpiCards: boolean;
  showAccounts: boolean;
  showExpenseChart: boolean;
  showRecentTransactions: boolean;
  showBudgetProgress: boolean;
  showCheques: boolean;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  accent: AccentColor;
  customAccentHex?: string;
  amoledMode?: boolean;
  liquidGlass: boolean; // Toggle Liquid Glass on/off
  performanceMode: boolean; // Ultra-light mode for mid-range phones
  lightStyle: LightStyle; // Light Mode Customization
  glassIntensity: GlassIntensity;
  ambientOrbs: boolean;
  ambientGlow?: AmbientGlow;
  animationSpeed: AnimationSpeed;
  borderRadius?: BorderRadius;
}

export interface ParsedBankSMS {
  bankName: string;
  type: TransactionType;
  amountToman: number;
  cardLast4?: string;
  accountNumber?: string;
  balanceToman?: number;
  date?: string;
  time?: string;
  description: string;
  rawText: string;
}

export interface FilterOptions {
  searchQuery: string;
  type?: TransactionType | 'all';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  tag?: string;
}
