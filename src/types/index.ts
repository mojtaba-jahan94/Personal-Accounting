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
  initialBalance?: number;
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
export type BackgroundStyle = 'clean_minimal' | 'subtle_mesh' | 'dot_matrix' | 'soft_aurora' | 'pure_solid';

export type DashboardSectionKey =
  | 'showHero'
  | 'showKpiCards'
  | 'showAccounts'
  | 'showExpenseChart'
  | 'showRecentTransactions'
  | 'showBudgetProgress'
  | 'showCheques';

export interface DashboardSectionConfig {
  showHero: boolean;
  showKpiCards: boolean;
  showAccounts: boolean;
  showExpenseChart: boolean;
  showRecentTransactions: boolean;
  showBudgetProgress: boolean;
  showCheques: boolean;
  sectionOrder?: DashboardSectionKey[];
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  accent: AccentColor;
  customAccentHex?: string;
  amoledMode?: boolean;
  liquidGlass: boolean; // Toggle Liquid Glass on/off
  performanceMode: boolean; // Ultra-light mode for mid-range phones
  lightStyle: LightStyle; // Light Mode Customization
  backgroundStyle?: BackgroundStyle; // Customizable Background Style
  spotlight1Color?: string; // Independent Color for Spotlight 1
  spotlight2Color?: string; // Independent Color for Spotlight 2
  glassIntensity: GlassIntensity;
  glassOpacity?: number; // 0.2 to 1.0 (Transparency)
  glassBlur?: number; // 4 to 32 (Blur intensity in px)
  glassRefraction?: number; // 0.1 to 1.0 (Refraction highlight strength)
  glassSaturation?: number; // 100 to 220 (Color saturation percentage)
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

// ================= Asset & Investment Portfolio Types =================
export type AssetCategory = 'gold' | 'coin' | 'currency' | 'crypto' | 'custom';

export interface Asset {
  id: string;
  name: string; // e.g. "طلای ۱۸ عیار", "سکه امامی", "دلار نقدی", "تتر"
  category: AssetCategory;
  symbol: string; // 'gold_18k', 'gold_24k', 'coin_emami', 'coin_half', 'coin_quarter', 'coin_gram', 'gold_melted', 'usd', 'usdt', 'eur', 'aed', 'custom'
  quantity: number; // e.g. 15.5 گرم or 2 عدد
  unit: string; // 'گرم', 'عدد', 'دلار', 'تتر', 'واحد'
  buyPriceAverage: number; // میانگین قیمت خرید هر واحد به تومان
  totalCost: number; // کل هزینه خرید به تومان
  notes?: string;
  purchaseDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AssetTransactionType = 'buy' | 'sell';

export interface AssetTransaction {
  id: string;
  assetId: string;
  assetName: string;
  type: AssetTransactionType;
  quantity: number;
  unitPrice: number; // Toman
  totalAmount: number; // Toman
  date: string; // Jalali YYYY/MM/DD
  notes?: string;
  realizedPnl?: number; // Realized Profit/Loss in Toman
}

export interface MarketPriceItem {
  symbol: string;
  name: string;
  category: AssetCategory;
  unit: string;
  priceToman: number; // Stored canonical in Toman
  change24h?: number; // e.g. +1.4 or -0.5
  high24h?: number;
  low24h?: number;
  lastUpdated: string; // Jalali date/time
  source: string; // "نوبیتکس و بازار", "کانال تلگرام", "سایت tgju.org", "تنظیم دستی"
  isCustomManual?: boolean;
  isEnabled?: boolean; // Default true only for 'usd' and 'gold_18k', false for others
  displayCurrency?: 'toman' | 'rial'; // Custom unit display override per item
}

export type PriceSourceMode = 'default_markets' | 'telegram' | 'custom_api';
export type SourceCurrencyUnit = 'toman' | 'rial' | 'auto';
export type DisplayCurrencyUnit = 'toman' | 'rial' | 'app_default';

export interface PriceSourceConfig {
  sourceMode: PriceSourceMode;
  autoRefreshMinutes: number; // 0 = manual, 1, 5, 15, 30

  // Dedicated source settings for US Dollar & 18k Gold
  goldDollarSourceType: 'telegram' | 'website' | 'auto';
  goldDollarTelegramChannel: string; // e.g. "@tgju_org", "t.me/s/...", etc.
  goldDollarWebsiteUrl: string; // e.g. custom site for dollar & gold
  goldDollarSourceUnit: SourceCurrencyUnit; // فلان کانال قیمت‌های اعلامیش به تومنه یا ریال
  goldDollarDisplayUnit: DisplayCurrencyUnit; // ولی به ریال نشون بده یا برعکس (تومان یا ریال)

  // General Market Source for other prices (coins, euro, etc.)
  generalMarketSourceUrl: string; // پیش‌فرض tgju.org با قابلیت تغییر
  generalSourceUnit: SourceCurrencyUnit;

  // Telegram bot / general settings
  telegramChannelOrUrl?: string; // legacy/fallback
  telegramBotToken?: string;
  telegramChatId?: string;

  // Custom API / Website settings (legacy/fallback)
  customApiUrl?: string;
  customApiKey?: string;

  // Status Tracking
  lastFetchTime?: string;
  lastFetchStatus?: 'success' | 'error' | 'idle';
  lastFetchMessage?: string;
}


