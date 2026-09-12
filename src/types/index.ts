export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'bank' | 'cash' | 'savings' | 'gold_crypto' | 'other';

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

export type DebtType = 'debt' | 'credit';

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  description?: string;
  isSettled: boolean;
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
  status: ChequeStatus;
  notes?: string;
}

// Investments & Portfolio Types
export type AssetType =
  | 'gold_18k'
  | 'gold_coin'
  | 'currency'
  | 'crypto'
  | 'stock_other';

export interface AssetHolding {
  id: string;
  name: string;
  type: AssetType;
  marketSymbol?: string; // e.g. 'usd', 'gold_18k', 'coin_emami', 'tether'
  amount: number; // e.g. 15 (grams), 2 (coins), 1000 (dollars)
  unitName: string; // گرم، عدد، دلار، واحد
  buyPrice: number; // average purchase price per unit in Toman
  currentPrice: number; // current market price per unit in Toman
  buyDate?: string; // Jalali date
  notes?: string;
}

export interface MarketRate {
  id: string;
  symbol: string;
  name: string;
  category: 'gold' | 'currency' | 'crypto';
  priceToman: number;
  changePercent?: number;
  unit: string;
  lastUpdated: string;
  source?: string;
  isManual?: boolean;
}

export interface MarketSourceConfig {
  sourceType: 'auto' | 'telegram' | 'tgju';
  telegramGoldChannel: string; // default: 'Narkuab'
  telegramUsdChannel: string; // default: 'tahran_sabza'
  lastTelegramMessageGold?: string;
  lastTelegramMessageUsd?: string;
}

export type Currency = 'toman' | 'rial';

// Theme Studio Pro Types
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'purple';
export type GlassIntensity = 'low' | 'medium' | 'high';
export type AnimationSpeed = 'fast' | 'normal' | 'none';

export interface ThemeConfig {
  mode: 'dark' | 'light';
  accent: AccentColor;
  glassIntensity: GlassIntensity;
  ambientOrbs: boolean;
  animationSpeed: AnimationSpeed;
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
