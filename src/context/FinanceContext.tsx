import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getTursoClient } from '../services/tursoClient';
import {
  CloudSyncManager,
  markCollectionDirty,
  SYNC_COLLECTIONS,
  getInitialAuthUserId,
  SyncCollectionKey,
} from '../services/cloudSync';
import {
  Account,
  Category,
  Transaction,
  Budget,
  Goal,
  Debt,
  Cheque,
  Currency,
  ThemeConfig,
  ThemePaletteId,
  DashboardSectionConfig,
  Person,
  DebtPayment,
  TransactionType,
  Asset,
  AssetTransaction,
  MarketPriceItem,
  PriceSourceConfig,
  SourceCurrencyUnit,
} from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_PERSONS, getDemoData } from '../utils/sampleData';
import { getTodayJalali } from '../utils/jalali';
import {
  DEFAULT_MARKET_PRICES,
  DEFAULT_PRICE_SOURCE_CONFIG,
  fetchLiveMarketRates,
  parseTelegramMarketText,
} from '../services/marketPriceService';

export const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'asset-gold-18k',
    name: 'طلای ۱۸ عیار (آبشده و زینتی)',
    category: 'gold',
    symbol: 'gold_18k',
    quantity: 15.5,
    unit: 'گرم',
    buyPriceAverage: 3950000,
    totalCost: 15.5 * 3950000,
    notes: 'خرید پله‌ای از بازار طلا',
    purchaseDate: '1403/05/10',
    createdAt: '1403/05/10',
  },
  {
    id: 'asset-coin-emami',
    name: 'سکه تمام امامی (طرح جدید)',
    category: 'coin',
    symbol: 'coin_emami',
    quantity: 2,
    unit: 'عدد',
    buyPriceAverage: 47800000,
    totalCost: 2 * 47800000,
    notes: 'سرمایه‌گذاری بلندمدت صندوق امانات',
    purchaseDate: '1403/04/15',
    createdAt: '1403/04/15',
  },
  {
    id: 'asset-usd-cash',
    name: 'دلار کاغذی آمریکا',
    category: 'currency',
    symbol: 'usd',
    quantity: 1200,
    unit: 'دلار',
    buyPriceAverage: 86500,
    totalCost: 1200 * 86500,
    notes: 'پس‌انداز ارزی سفر و تورم‌زدایی',
    purchaseDate: '1403/06/01',
    createdAt: '1403/06/01',
  },
  {
    id: 'asset-usdt',
    name: 'تتر دیجیتال (USDT)',
    category: 'crypto',
    symbol: 'usdt',
    quantity: 650,
    unit: 'تتر',
    buyPriceAverage: 88200,
    totalCost: 650 * 88200,
    notes: 'کیف پول تراست والت',
    purchaseDate: '1403/07/20',
    createdAt: '1403/07/20',
  },
];

export const DEFAULT_ASSET_TRANSACTIONS: AssetTransaction[] = [
  {
    id: 'atx-1',
    assetId: 'asset-gold-18k',
    assetName: 'طلای ۱۸ عیار (آبشده و زینتی)',
    type: 'buy',
    quantity: 15.5,
    unitPrice: 3950000,
    totalAmount: 15.5 * 3950000,
    date: '1403/05/10',
    notes: 'خرید اولیه طلا',
  },
  {
    id: 'atx-2',
    assetId: 'asset-coin-emami',
    assetName: 'سکه تمام امامی (طرح جدید)',
    type: 'buy',
    quantity: 2,
    unitPrice: 47800000,
    totalAmount: 2 * 47800000,
    date: '1403/04/15',
    notes: 'خرید ۲ عدد سکه امامی',
  },
  {
    id: 'atx-3',
    assetId: 'asset-usd-cash',
    assetName: 'دلار کاغذی آمریکا',
    type: 'buy',
    quantity: 1200,
    unitPrice: 86500,
    totalAmount: 1200 * 86500,
    date: '1403/06/01',
    notes: 'خرید اسکناس از صرافی مجاز',
  },
];

export interface AccountTransactionsBreakdown {
  income: number;
  expense: number;
  netDelta: number;
  txCount: number;
}

/**
 * Helper to generate unique IDs
 */
export function genId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Pure ledger calculation: Account Balance = Initial Balance + Net Transactions Delta
 */
export function calculateAccountBalance(
  account: { id: string; initialBalance?: number; balance?: number },
  transactions: Transaction[]
): number {
  const initial = typeof account.initialBalance === 'number'
    ? account.initialBalance
    : (typeof account.balance === 'number' ? account.balance : 0);

  let netDelta = 0;
  for (const tx of transactions) {
    const fee = tx.fee || 0;
    if (tx.type === 'income' && tx.accountId === account.id) {
      netDelta += tx.amount;
    } else if (tx.type === 'expense' && tx.accountId === account.id) {
      netDelta -= (tx.amount + fee);
    } else if (tx.type === 'transfer') {
      if (tx.accountId === account.id) {
        netDelta -= (tx.amount + fee);
      }
      if (tx.toAccountId === account.id) {
        netDelta += tx.amount;
      }
    }
  }

  return initial + netDelta;
}

/**
 * Pure ledger batch calculation: Recalculates all accounts balances deterministically
 */
export function recalculateAllAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  return accounts.map(acc => {
    const computedBalance = calculateAccountBalance(acc, transactions);
    return {
      ...acc,
      initialBalance: typeof acc.initialBalance === 'number' ? acc.initialBalance : computedBalance,
      balance: computedBalance,
    };
  });
}

export function getAccountBreakdown(
  accountId: string,
  transactions: Transaction[]
): AccountTransactionsBreakdown {
  let income = 0;
  let expense = 0;
  let txCount = 0;

  for (const tx of transactions) {
    const fee = tx.fee || 0;
    if (tx.type === 'income' && tx.accountId === accountId) {
      income += tx.amount;
      txCount++;
    } else if (tx.type === 'expense' && tx.accountId === accountId) {
      expense += (tx.amount + fee);
      txCount++;
    } else if (tx.type === 'transfer') {
      if (tx.accountId === accountId) {
        expense += (tx.amount + fee);
        txCount++;
      }
      if (tx.toAccountId === accountId) {
        income += tx.amount;
        txCount++;
      }
    }
  }

  return {
    income,
    expense,
    netDelta: income - expense,
    txCount,
  };
}

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  cheques: Cheque[];
  persons: Person[];
  currency: Currency;
  darkMode: boolean;
  themeConfig: ThemeConfig;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addTransactionAndReconcile: (tx: Omit<Transaction, 'id' | 'createdAt'>, targetBalance: number) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  divideTransactionBy10: (txId: string) => void;
  multiplyTransactionBy10: (txId: string) => void;
  batchFixRialTransactions: () => number;
  convertAllDataCurrency: (factor: 0.1 | 10) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  reconcileAccountBalance: (accountId: string, targetCurrentBalance: number) => void;
  getAccountTransactionsDelta: (accountId: string) => AccountTransactionsBreakdown;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addPerson: (p: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (p: Person) => void;
  deletePerson: (id: string) => void;

  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, accountId?: string) => void;

  addDebt: (d: Omit<Debt, 'id'>) => void;
  updateDebt: (d: Debt) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;
  payDebtWithAccount: (params: {
    debtId: string;
    amount: number;
    accountId: string;
    date?: string;
    description?: string;
  }) => void;

  addCheque: (ch: Omit<Cheque, 'id'>) => void;
  updateCheque: (ch: Cheque) => void;
  deleteCheque: (id: string) => void;
  changeChequeStatus: (id: string, status: Cheque['status'], accountId?: string) => void;

  setCurrency: (c: Currency) => void;
  toggleDarkMode: () => void;
  updateThemeConfig: (config: Partial<ThemeConfig>) => void;
  dashboardConfig: DashboardSectionConfig;
  updateDashboardConfig: (config: Partial<DashboardSectionConfig>) => void;
  loadDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  clearAllData: () => void;

  // Assets & Portfolio
  assets: Asset[];
  assetTransactions: AssetTransaction[];
  marketPrices: MarketPriceItem[];
  priceSourceConfig: PriceSourceConfig;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addAssetTransaction: (tx: Omit<AssetTransaction, 'id'>) => void;
  deleteAssetTransaction: (id: string) => void;
  updateMarketPrice: (symbol: string, newPriceToman: number) => void;
  toggleMarketPriceEnabled: (symbol: string) => void;
  setMarketPriceEnabled: (symbol: string, enabled: boolean) => void;
  setMarketPriceDisplayUnit: (symbol: string, unit: 'toman' | 'rial') => void;
  refreshMarketPrices: () => Promise<{ success: boolean; message: string }>;
  updatePriceSourceConfig: (cfg: Partial<PriceSourceConfig>) => void;
  applyTelegramPricesFromText: (
    text: string,
    overrideUnit?: SourceCurrencyUnit
  ) => { count: number; symbols: string[]; message: string };

  // Computed values
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalPortfolioValueToman: number;
  totalPortfolioCostToman: number;
  totalPortfolioPnlToman: number;
  totalPortfolioPnlPercent: number;

  // Cloud & Turso Sync
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  syncAllToTurso: () => Promise<void>;
  isCloudLoading: boolean;
  conflictNotice?: string | null;
  dismissConflictNotice?: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'pf_accounts_v1',
  TRANSACTIONS: 'pf_transactions_v1',
  CATEGORIES: 'pf_categories_v2',
  BUDGETS: 'pf_budgets_v1',
  GOALS: 'pf_goals_v1',
  DEBTS: 'pf_debts_v1',
  CHEQUES: 'pf_cheques_v1',
  PERSONS: 'pf_persons_v1',
  CURRENCY: 'pf_currency_v1',
  THEME_CONFIG: 'pf_theme_config_v2',
  DASHBOARD_CONFIG: 'pf_dashboard_config_v1',
  ASSETS: 'pf_assets_v1',
  ASSET_TRANSACTIONS: 'pf_asset_transactions_v1',
  MARKET_PRICES: 'pf_market_prices_v1',
  PRICE_SOURCE_CONFIG: 'pf_price_source_config_v1',
  PRIVACY_MODE: 'pf_privacy_mode',
};

export const DEFAULT_DASHBOARD_CONFIG: DashboardSectionConfig = {
  showHero: true,
  showKpiCards: true,
  showAccounts: true,
  showExpenseChart: true,
  showRecentTransactions: true,
  showBudgetProgress: true,
  showCheques: true,
  sectionOrder: [
    'showHero',
    'showKpiCards',
    'showAccounts',
    'showExpenseChart',
    'showRecentTransactions',
    'showBudgetProgress',
    'showCheques',
  ],
};

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'dark',
  palette: 'cyber_violet',
  accent: 'violet',
  customAccentHex: '#8B5CF6',
  amoledMode: false,
  liquidGlass: true,
  performanceMode: false,
  lightStyle: 'frost',
  backgroundStyle: 'silk_wave',
  spotlight1Color: '#8B5CF6',
  spotlight2Color: '#6366F1',
  glassIntensity: 'high',
  glassOpacity: 0.88,
  glassBlur: 20,
  glassRefraction: 0.6,
  glassSaturation: 170,
  ambientOrbs: true,
  ambientGlow: 'vibrant',
  animationSpeed: 'fast',
  borderRadius: 'round',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tursoStatus } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>(() => {
    const initialUserId = getInitialAuthUserId();
    const key = initialUserId ? `${STORAGE_KEYS.CATEGORIES}_${initialUserId}` : STORAGE_KEYS.CATEGORIES;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.transactions;
  });

  const [accountsBase, setAccountsBase] = useState<Account[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.ACCOUNTS}_${initialUserId}`);
      const rawAccs: Account[] = saved ? JSON.parse(saved) : [];
      return rawAccs;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const rawAccs: Account[] = saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    const savedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const txs: Transaction[] = savedTxs ? JSON.parse(savedTxs) : getDemoData().transactions;

    return rawAccs.map(acc => {
      if (typeof acc.initialBalance === 'number') {
        return acc;
      }
      const b = getAccountBreakdown(acc.id, txs);
      const curr = typeof acc.balance === 'number' ? acc.balance : 0;
      return {
        ...acc,
        initialBalance: curr - b.netDelta,
      };
    });
  });

  const accounts = useMemo(() => {
    return recalculateAllAccountBalances(accountsBase, transactions);
  }, [accountsBase, transactions]);

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.BUDGETS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.budgets;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.GOALS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.goals;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.DEBTS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.debts;
  });

  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.CHEQUES}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CHEQUES);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.cheques;
  });

  const [persons, setPersons] = useState<Person[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.PERSONS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return saved ? JSON.parse(saved) : DEFAULT_PERSONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.ASSETS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : DEFAULT_ASSETS;
  });

  const [assetTransactions, setAssetTransactions] = useState<AssetTransaction[]>(() => {
    const initialUserId = getInitialAuthUserId();
    if (initialUserId) {
      const saved = localStorage.getItem(`${STORAGE_KEYS.ASSET_TRANSACTIONS}_${initialUserId}`);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ASSET_TRANSACTIONS);
    return saved ? JSON.parse(saved) : DEFAULT_ASSET_TRANSACTIONS;
  });

  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKET_PRICES);
    if (saved) {
      try {
        const parsed: MarketPriceItem[] = JSON.parse(saved);
        // Ensure only usd and gold_18k are enabled by default if not explicitly set
        return parsed.map((item) => ({
          ...item,
          isEnabled:
            item.isEnabled !== undefined
              ? item.isEnabled
              : (item.symbol === 'usd' || item.symbol === 'gold_18k'),
        }));
      } catch {
        return DEFAULT_MARKET_PRICES;
      }
    }
    return DEFAULT_MARKET_PRICES;
  });

  const [priceSourceConfig, setPriceSourceConfig] = useState<PriceSourceConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_SOURCE_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PRICE_SOURCE_CONFIG,
          ...parsed,
          dollarTelegramChannel:
            parsed.dollarTelegramChannel ||
            parsed.goldDollarTelegramChannel ||
            DEFAULT_PRICE_SOURCE_CONFIG.dollarTelegramChannel,
          dollarWebsiteUrl:
            parsed.dollarWebsiteUrl ||
            parsed.goldDollarWebsiteUrl ||
            DEFAULT_PRICE_SOURCE_CONFIG.dollarWebsiteUrl,
          dollarSourceUnit:
            parsed.dollarSourceUnit ||
            parsed.goldDollarSourceUnit ||
            DEFAULT_PRICE_SOURCE_CONFIG.dollarSourceUnit,
          dollarDisplayUnit:
            parsed.dollarDisplayUnit ||
            parsed.goldDollarDisplayUnit ||
            DEFAULT_PRICE_SOURCE_CONFIG.dollarDisplayUnit,

          goldTelegramChannel:
            parsed.goldTelegramChannel ||
            parsed.goldDollarTelegramChannel ||
            DEFAULT_PRICE_SOURCE_CONFIG.goldTelegramChannel,
          goldWebsiteUrl:
            parsed.goldWebsiteUrl ||
            parsed.goldDollarWebsiteUrl ||
            DEFAULT_PRICE_SOURCE_CONFIG.goldWebsiteUrl,
          goldSourceUnit:
            parsed.goldSourceUnit ||
            parsed.goldDollarSourceUnit ||
            DEFAULT_PRICE_SOURCE_CONFIG.goldSourceUnit,
          goldDisplayUnit:
            parsed.goldDisplayUnit ||
            parsed.goldDollarDisplayUnit ||
            DEFAULT_PRICE_SOURCE_CONFIG.goldDisplayUnit,
        };
      } catch {
        return DEFAULT_PRICE_SOURCE_CONFIG;
      }
    }
    return DEFAULT_PRICE_SOURCE_CONFIG;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const initialUserId = getInitialAuthUserId();
    const key = initialUserId ? `${STORAGE_KEYS.CURRENCY}_${initialUserId}` : STORAGE_KEYS.CURRENCY;
    return (localStorage.getItem(key) as Currency) || 'toman';
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const initialUserId = getInitialAuthUserId();
    const key = initialUserId ? `${STORAGE_KEYS.THEME_CONFIG}_${initialUserId}` : STORAGE_KEYS.THEME_CONFIG;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const palette = parsed.palette || 'nordic';
        return {
          ...DEFAULT_THEME_CONFIG,
          ...parsed,
          palette,
          accent: 'wood',
          customAccentHex: palette === 'juniper_coral' ? '#7D2826' : '#A68A64',
          amoledMode: false,
        };
      } catch (e) {
        return DEFAULT_THEME_CONFIG;
      }
    }
    return DEFAULT_THEME_CONFIG;
  });

  const darkMode = themeConfig.mode === 'dark';

  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PRIVACY_MODE) === 'true';
    } catch {
      return false;
    }
  });

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.PRIVACY_MODE, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Apply Theme Settings to Root Document & Body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (themeConfig.mode === 'dark') {
      root.classList.add('dark');
      body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
    }

    // Always clear legacy AMOLED class to prevent light mode overrides
    root.classList.remove('amoled');
    body?.classList.remove('amoled');

    // Liquid Glass On/Off
    if (themeConfig.liquidGlass === false || themeConfig.performanceMode) {
      root.classList.add('no-glass');
    } else {
      root.classList.remove('no-glass');
    }

    // Performance Mode (for mid-range phones)
    if (themeConfig.performanceMode) {
      root.classList.add('perf-mode');
    } else {
      root.classList.remove('perf-mode');
    }

    // Apply Palette Identity (Cyber Violet, Emerald Neon, Quantum Gold, Cyber Cyan, Cyber Crimson, Nordic)
    const currentPalette: ThemePaletteId = themeConfig.palette || 'cyber_violet';
    root.setAttribute('data-theme', currentPalette);
    body?.setAttribute('data-theme', currentPalette);
    const isDark = themeConfig.mode === 'dark';

    interface PaletteTokens {
      primaryColor: string;
      primaryRgb: string;
      primaryHover: string;
      primaryGlow: string;
      accentFrom: string;
      accentTo: string;
      aurora1: string;
      aurora2: string;
      aurora3: string;
      bgAppDark: string;
      bgSurfaceDark: string;
      bgElevatedDark: string;
    }

    const PALETTE_MAP: Record<ThemePaletteId, PaletteTokens> = {
      cyber_violet: {
        primaryColor: '#8B5CF6',
        primaryRgb: '139, 92, 246',
        primaryHover: '#7C3AED',
        primaryGlow: 'rgba(139, 92, 246, 0.45)',
        accentFrom: '#8B5CF6',
        accentTo: '#6366F1',
        aurora1: 'rgba(139, 92, 246, 0.30)',
        aurora2: 'rgba(6, 182, 212, 0.22)',
        aurora3: 'rgba(244, 63, 94, 0.18)',
        bgAppDark: '#08070B',
        bgSurfaceDark: '#110E1B',
        bgElevatedDark: 'rgba(22, 18, 36, 0.75)',
      },
      emerald_neon: {
        primaryColor: '#10B981',
        primaryRgb: '16, 185, 129',
        primaryHover: '#059669',
        primaryGlow: 'rgba(16, 185, 129, 0.45)',
        accentFrom: '#10B981',
        accentTo: '#059669',
        aurora1: 'rgba(16, 185, 129, 0.32)',
        aurora2: 'rgba(20, 184, 166, 0.24)',
        aurora3: 'rgba(6, 182, 212, 0.18)',
        bgAppDark: '#050D0A',
        bgSurfaceDark: '#0A1612',
        bgElevatedDark: 'rgba(15, 34, 27, 0.75)',
      },
      quantum_gold: {
        primaryColor: '#F59E0B',
        primaryRgb: '245, 158, 11',
        primaryHover: '#D97706',
        primaryGlow: 'rgba(245, 158, 11, 0.45)',
        accentFrom: '#F59E0B',
        accentTo: '#D97706',
        aurora1: 'rgba(245, 158, 11, 0.30)',
        aurora2: 'rgba(251, 146, 60, 0.24)',
        aurora3: 'rgba(234, 88, 12, 0.18)',
        bgAppDark: '#0D0A05',
        bgSurfaceDark: '#17130A',
        bgElevatedDark: 'rgba(34, 28, 14, 0.75)',
      },
      cyber_cyan: {
        primaryColor: '#06B6D4',
        primaryRgb: '6, 182, 212',
        primaryHover: '#0891B2',
        primaryGlow: 'rgba(6, 182, 212, 0.45)',
        accentFrom: '#06B6D4',
        accentTo: '#3B82F6',
        aurora1: 'rgba(6, 182, 212, 0.32)',
        aurora2: 'rgba(59, 130, 246, 0.24)',
        aurora3: 'rgba(99, 102, 241, 0.18)',
        bgAppDark: '#050B10',
        bgSurfaceDark: '#08141F',
        bgElevatedDark: 'rgba(13, 30, 45, 0.75)',
      },
      cyber_crimson: {
        primaryColor: '#F43F5E',
        primaryRgb: '244, 63, 94',
        primaryHover: '#E11D48',
        primaryGlow: 'rgba(244, 63, 94, 0.45)',
        accentFrom: '#F43F5E',
        accentTo: '#E11D48',
        aurora1: 'rgba(244, 63, 94, 0.32)',
        aurora2: 'rgba(217, 70, 239, 0.24)',
        aurora3: 'rgba(168, 85, 247, 0.18)',
        bgAppDark: '#0D0608',
        bgSurfaceDark: '#170A0F',
        bgElevatedDark: 'rgba(35, 14, 23, 0.75)',
      },
      nordic: {
        primaryColor: '#94A3B8',
        primaryRgb: '148, 163, 184',
        primaryHover: '#64748B',
        primaryGlow: 'rgba(148, 163, 184, 0.35)',
        accentFrom: '#94A3B8',
        accentTo: '#475569',
        aurora1: 'rgba(148, 163, 184, 0.24)',
        aurora2: 'rgba(100, 116, 139, 0.18)',
        aurora3: 'rgba(71, 85, 105, 0.14)',
        bgAppDark: '#0A0C10',
        bgSurfaceDark: '#12161E',
        bgElevatedDark: 'rgba(26, 32, 44, 0.75)',
      },
      juniper_coral: {
        primaryColor: '#E26865',
        primaryRgb: '226, 104, 101',
        primaryHover: '#F87171',
        primaryGlow: 'rgba(226, 104, 101, 0.45)',
        accentFrom: '#E26865',
        accentTo: '#7D2826',
        aurora1: 'rgba(226, 104, 101, 0.30)',
        aurora2: 'rgba(137, 136, 97, 0.22)',
        aurora3: 'rgba(52, 55, 35, 0.18)',
        bgAppDark: '#202316',
        bgSurfaceDark: '#343723',
        bgElevatedDark: 'rgba(52, 55, 35, 0.75)',
      },
    };

    const activeTokens = PALETTE_MAP[currentPalette] || PALETTE_MAP.cyber_violet;

    root.style.setProperty('--primary-color', activeTokens.primaryColor);
    root.style.setProperty('--primary-rgb', activeTokens.primaryRgb);
    root.style.setProperty('--primary-hover', activeTokens.primaryHover);
    root.style.setProperty('--primary-glow', activeTokens.primaryGlow);
    root.style.setProperty('--accent-from', activeTokens.accentFrom);
    root.style.setProperty('--accent-to', activeTokens.accentTo);
    root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${activeTokens.accentFrom} 0%, ${activeTokens.accentTo} 100%)`);
    root.style.setProperty('--border-glass-glow', activeTokens.primaryGlow);

    root.style.setProperty('--aurora-1', activeTokens.aurora1);
    root.style.setProperty('--aurora-2', activeTokens.aurora2);
    root.style.setProperty('--aurora-3', activeTokens.aurora3);

    if (isDark) {
      root.style.setProperty('--bg-app', activeTokens.bgAppDark);
      root.style.setProperty('--bg-base', activeTokens.bgAppDark);
      root.style.setProperty('--bg-surface', activeTokens.bgSurfaceDark);
      root.style.setProperty('--bg-surface-secondary', activeTokens.bgElevatedDark);
      root.style.setProperty('--text-primary', '#F7F5FA');
      root.style.setProperty('--text-muted', '#9E97AA');
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-cloud', 'rgba(255, 255, 255, 0.12)');
    } else {
      root.style.setProperty('--bg-app', '#F8F7FA');
      root.style.setProperty('--bg-base', '#F8F7FA');
      root.style.setProperty('--bg-surface', '#FFFFFF');
      root.style.setProperty('--bg-surface-secondary', '#F0EDF5');
      root.style.setProperty('--text-primary', '#14111D');
      root.style.setProperty('--text-muted', '#6B6476');
      root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--border-cloud', 'rgba(0, 0, 0, 0.12)');
    }

    root.setAttribute('data-glass', themeConfig.glassIntensity || 'medium');
    root.setAttribute('data-anim', themeConfig.animationSpeed || 'fast');
    root.setAttribute('data-radius', themeConfig.borderRadius || 'smooth');
    root.setAttribute('data-glow', themeConfig.ambientGlow || 'subtle');
    root.setAttribute('data-light-style', themeConfig.lightStyle || 'frost');

    // Dynamic Glassmorphism Variables
    root.style.setProperty('--glass-bg-opacity', String(themeConfig.glassOpacity ?? 0.86));
    root.style.setProperty('--glass-blur', `${themeConfig.glassBlur ?? 14}px`);
    root.style.setProperty('--glass-refraction', String(themeConfig.glassRefraction ?? 0.5));
    root.style.setProperty('--glass-saturate', `${themeConfig.glassSaturation ?? 160}%`);

    localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(themeConfig));
  }, [themeConfig]);

  const toggleDarkMode = () => {
    setThemeConfig(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => {
      const nextPalette = updates.palette !== undefined ? updates.palette : (prev.palette || 'nordic');
      const nextAccentHex = nextPalette === 'juniper_coral' ? '#7D2826' : '#A68A64';
      return {
        ...prev,
        ...updates,
        palette: nextPalette,
        accent: 'wood',
        customAccentHex: updates.customAccentHex || nextAccentHex,
      };
    });
  };

  const [dashboardConfig, setDashboardConfig] = useState<DashboardSectionConfig>(() => {
    const initialUserId = getInitialAuthUserId();
    const key = initialUserId ? `${STORAGE_KEYS.DASHBOARD_CONFIG}_${initialUserId}` : STORAGE_KEYS.DASHBOARD_CONFIG;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return { ...DEFAULT_DASHBOARD_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_DASHBOARD_CONFIG;
      }
    }
    return DEFAULT_DASHBOARD_CONFIG;
  });

  const updateDashboardConfig = (updates: Partial<DashboardSectionConfig>) => {
    setDashboardConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG, JSON.stringify(next));
      return next;
    });
  };

  // Conflict notification state
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  // Latest state references for CloudSyncManager
  const stateRef = useRef({
    accounts: accountsBase,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    assets,
    assetTransactions,
    currency,
    themeConfig,
    dashboardConfig,
  });
  stateRef.current = {
    accounts: accountsBase,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    assets,
    assetTransactions,
    currency,
    themeConfig,
    dashboardConfig,
  };

  const cloudSyncManagerRef = useRef<CloudSyncManager | null>(null);
  if (!cloudSyncManagerRef.current) {
    cloudSyncManagerRef.current = new CloudSyncManager({
      getLocalData: (col) => (stateRef.current as any)[col],
      setLocalData: (col, data) => {
        const userSuffix = user ? `_${user.id}` : '';
        if (col === 'accounts') {
          setAccountsBase(data);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userSuffix, JSON.stringify(data));
        } else if (col === 'transactions') {
          setTransactions(data);
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userSuffix, JSON.stringify(data));
        } else if (col === 'categories') {
          setCategories(data);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES + userSuffix, JSON.stringify(data));
        } else if (col === 'budgets') {
          setBudgets(data);
          localStorage.setItem(STORAGE_KEYS.BUDGETS + userSuffix, JSON.stringify(data));
        } else if (col === 'goals') {
          setGoals(data);
          localStorage.setItem(STORAGE_KEYS.GOALS + userSuffix, JSON.stringify(data));
        } else if (col === 'debts') {
          setDebts(data);
          localStorage.setItem(STORAGE_KEYS.DEBTS + userSuffix, JSON.stringify(data));
        } else if (col === 'cheques') {
          setCheques(data);
          localStorage.setItem(STORAGE_KEYS.CHEQUES + userSuffix, JSON.stringify(data));
        } else if (col === 'persons') {
          setPersons(data);
          localStorage.setItem(STORAGE_KEYS.PERSONS + userSuffix, JSON.stringify(data));
        } else if (col === 'assets') {
          setAssets(data);
          localStorage.setItem(STORAGE_KEYS.ASSETS + userSuffix, JSON.stringify(data));
        } else if (col === 'assetTransactions') {
          setAssetTransactions(data);
          localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS + userSuffix, JSON.stringify(data));
        } else if (col === 'currency') {
          setCurrency(data);
          localStorage.setItem(STORAGE_KEYS.CURRENCY + userSuffix, data);
        } else if (col === 'themeConfig') {
          setThemeConfig(data);
          localStorage.setItem(STORAGE_KEYS.THEME_CONFIG + userSuffix, JSON.stringify(data));
        } else if (col === 'dashboardConfig') {
          setDashboardConfig(data);
          localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG + userSuffix, JSON.stringify(data));
        }
      },
      onStatusChange: (status) => setCloudSyncStatus(status),
      onConflictNotice: (msg) => setConflictNotice(msg),
    });
  }

  // Keep manager callbacks synced with current user
  useEffect(() => {
    cloudSyncManagerRef.current?.setCallbacks({
      getLocalData: (col) => (stateRef.current as any)[col],
      setLocalData: (col, data) => {
        const userSuffix = user ? `_${user.id}` : '';
        if (col === 'accounts') {
          setAccountsBase(data);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userSuffix, JSON.stringify(data));
        } else if (col === 'transactions') {
          setTransactions(data);
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userSuffix, JSON.stringify(data));
        } else if (col === 'categories') {
          setCategories(data);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES + userSuffix, JSON.stringify(data));
        } else if (col === 'budgets') {
          setBudgets(data);
          localStorage.setItem(STORAGE_KEYS.BUDGETS + userSuffix, JSON.stringify(data));
        } else if (col === 'goals') {
          setGoals(data);
          localStorage.setItem(STORAGE_KEYS.GOALS + userSuffix, JSON.stringify(data));
        } else if (col === 'debts') {
          setDebts(data);
          localStorage.setItem(STORAGE_KEYS.DEBTS + userSuffix, JSON.stringify(data));
        } else if (col === 'cheques') {
          setCheques(data);
          localStorage.setItem(STORAGE_KEYS.CHEQUES + userSuffix, JSON.stringify(data));
        } else if (col === 'persons') {
          setPersons(data);
          localStorage.setItem(STORAGE_KEYS.PERSONS + userSuffix, JSON.stringify(data));
        } else if (col === 'assets') {
          setAssets(data);
          localStorage.setItem(STORAGE_KEYS.ASSETS + userSuffix, JSON.stringify(data));
        } else if (col === 'assetTransactions') {
          setAssetTransactions(data);
          localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS + userSuffix, JSON.stringify(data));
        } else if (col === 'currency') {
          setCurrency(data);
          localStorage.setItem(STORAGE_KEYS.CURRENCY + userSuffix, data);
        } else if (col === 'themeConfig') {
          setThemeConfig(data);
          localStorage.setItem(STORAGE_KEYS.THEME_CONFIG + userSuffix, JSON.stringify(data));
        } else if (col === 'dashboardConfig') {
          setDashboardConfig(data);
          localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG + userSuffix, JSON.stringify(data));
        }
      },
      onStatusChange: (status) => setCloudSyncStatus(status),
      onConflictNotice: (msg) => setConflictNotice(msg),
    });
  }, [user]);

  // Lifecycle listeners for visibilitychange, pagehide, beforeunload, and online/offline
  useEffect(() => {
    if (!user) return;
    const cleanup = cloudSyncManagerRef.current?.setupLifecycle(
      user.id,
      () => getTursoClient()
    );
    return cleanup;
  }, [user]);

  // Track previous user to trigger data loading / switching only on change
  const prevUserIdRef = useRef<string | null>(getInitialAuthUserId());
  const isHydratedRef = useRef<boolean>(!getInitialAuthUserId());

  // Load user data on login or user switch
  useEffect(() => {
    const currentUserId = user?.id || null;
    if (prevUserIdRef.current === currentUserId) {
      return;
    }
    prevUserIdRef.current = currentUserId;

    if (!user) {
      // User logged out: restore guest data from global localStorage keys
      isHydratedRef.current = true;
      setIsCloudLoading(false);
      setCloudSyncStatus('synced');

      const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);

      const savedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const txs = savedTxs ? JSON.parse(savedTxs) : getDemoData().transactions;
      setTransactions(txs);

      const savedAccs = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const accs = savedAccs ? JSON.parse(savedAccs) : DEFAULT_ACCOUNTS;
      setAccountsBase(accs.map((a: any) => ({
        ...a,
        initialBalance: typeof a.initialBalance === 'number' ? a.initialBalance : a.balance || 0,
      })));

      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      setBudgets(savedBudgets ? JSON.parse(savedBudgets) : getDemoData().budgets);

      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      setGoals(savedGoals ? JSON.parse(savedGoals) : getDemoData().goals);

      const savedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);
      setDebts(savedDebts ? JSON.parse(savedDebts) : getDemoData().debts);

      const savedCheques = localStorage.getItem(STORAGE_KEYS.CHEQUES);
      setCheques(savedCheques ? JSON.parse(savedCheques) : getDemoData().cheques);

      const savedPersons = localStorage.getItem(STORAGE_KEYS.PERSONS);
      setPersons(savedPersons ? JSON.parse(savedPersons) : DEFAULT_PERSONS);

      const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
      setAssets(savedAssets ? JSON.parse(savedAssets) : DEFAULT_ASSETS);

      const savedAssetTxs = localStorage.getItem(STORAGE_KEYS.ASSET_TRANSACTIONS);
      setAssetTransactions(savedAssetTxs ? JSON.parse(savedAssetTxs) : DEFAULT_ASSET_TRANSACTIONS);

      const savedCur = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCur === 'toman' || savedCur === 'rial') setCurrency(savedCur);

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
      if (savedTheme) setThemeConfig(JSON.parse(savedTheme));

      const savedDash = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG);
      if (savedDash) setDashboardConfig(JSON.parse(savedDash));
      return;
    }

    // User logged in / switched:
    isHydratedRef.current = false;
    setIsCloudLoading(true);
    const userSuffix = '_' + user.id;

    // Load user-scoped local data (never read global keys!)
    const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES + userSuffix);
    setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);

    const savedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + userSuffix);
    setTransactions(savedTxs ? JSON.parse(savedTxs) : []);

    const savedAccs = localStorage.getItem(STORAGE_KEYS.ACCOUNTS + userSuffix);
    setAccountsBase(savedAccs ? JSON.parse(savedAccs) : []);

    const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS + userSuffix);
    setBudgets(savedBudgets ? JSON.parse(savedBudgets) : []);

    const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS + userSuffix);
    setGoals(savedGoals ? JSON.parse(savedGoals) : []);

    const savedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS + userSuffix);
    setDebts(savedDebts ? JSON.parse(savedDebts) : []);

    const savedCheques = localStorage.getItem(STORAGE_KEYS.CHEQUES + userSuffix);
    setCheques(savedCheques ? JSON.parse(savedCheques) : []);

    const savedPersons = localStorage.getItem(STORAGE_KEYS.PERSONS + userSuffix);
    setPersons(savedPersons ? JSON.parse(savedPersons) : []);

    const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS + userSuffix);
    setAssets(savedAssets ? JSON.parse(savedAssets) : []);

    const savedAssetTxs = localStorage.getItem(STORAGE_KEYS.ASSET_TRANSACTIONS + userSuffix);
    setAssetTransactions(savedAssetTxs ? JSON.parse(savedAssetTxs) : []);

    const savedCur = localStorage.getItem(STORAGE_KEYS.CURRENCY + userSuffix);
    if (savedCur === 'toman' || savedCur === 'rial') setCurrency(savedCur);

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG + userSuffix);
    if (savedTheme) setThemeConfig(JSON.parse(savedTheme));

    const savedDash = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG + userSuffix);
    if (savedDash) setDashboardConfig(JSON.parse(savedDash));

    const runHydration = async () => {
      const client = getTursoClient();
      if (client && tursoStatus === 'connected') {
        try {
          await cloudSyncManagerRef.current?.hydrate(user.id, client);
        } catch (e) {
          console.error('Hydration error:', e);
        }
      }
      isHydratedRef.current = true;
      setIsCloudLoading(false);
    };

    runHydration();
  }, [user, tursoStatus]);

  // Initial hydration from Turso if user already active on mount
  useEffect(() => {
    if (!user || tursoStatus !== 'connected' || isHydratedRef.current) return;

    const runInitialHydration = async () => {
      const client = getTursoClient();
      if (client) {
        try {
          await cloudSyncManagerRef.current?.hydrate(user.id, client);
        } catch (e) {
          console.error('Initial hydration error:', e);
        }
      }
      isHydratedRef.current = true;
      setIsCloudLoading(false);
    };

    runInitialHydration();
  }, [user, tursoStatus]);

  // Manual trigger to sync all collections to Turso
  const syncAllToTurso = useCallback(async () => {
    if (!user?.id) return;
    const client = getTursoClient();
    if (!client || tursoStatus !== 'connected') {
      setCloudSyncStatus('offline');
      return;
    }

    for (const col of SYNC_COLLECTIONS) {
      markCollectionDirty(user.id, col);
    }
    await cloudSyncManagerRef.current?.flush(user.id, client);
  }, [user?.id, tursoStatus]);

  // Per-collection persistence and atomic sync triggers
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS + '_' + user.id, JSON.stringify(accountsBase));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'accounts');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accountsBase));
    }
  }, [accountsBase, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + '_' + user.id, JSON.stringify(transactions));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'transactions');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES + '_' + user.id, JSON.stringify(categories));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'categories');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }, [categories, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS + '_' + user.id, JSON.stringify(budgets));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'budgets');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
  }, [budgets, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.GOALS + '_' + user.id, JSON.stringify(goals));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'goals');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.DEBTS + '_' + user.id, JSON.stringify(debts));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'debts');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    }
  }, [debts, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CHEQUES + '_' + user.id, JSON.stringify(cheques));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'cheques');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CHEQUES, JSON.stringify(cheques));
    }
  }, [cheques, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.PERSONS + '_' + user.id, JSON.stringify(persons));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'persons');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
    }
  }, [persons, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENCY + '_' + user.id, currency);
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'currency');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    }
  }, [currency, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ASSETS + '_' + user.id, JSON.stringify(assets));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'assets');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    }
  }, [assets, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS + '_' + user.id, JSON.stringify(assetTransactions));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'assetTransactions');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS, JSON.stringify(assetTransactions));
    }
  }, [assetTransactions, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.THEME_CONFIG + '_' + user.id, JSON.stringify(themeConfig));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'themeConfig');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(themeConfig));
    }
  }, [themeConfig, user, tursoStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG + '_' + user.id, JSON.stringify(dashboardConfig));
      if (isHydratedRef.current) {
        markCollectionDirty(user.id, 'dashboardConfig');
        const client = getTursoClient();
        if (client && tursoStatus === 'connected') {
          cloudSyncManagerRef.current?.scheduleFlush(user.id, client);
        }
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG, JSON.stringify(dashboardConfig));
    }
  }, [dashboardConfig, user, tursoStatus]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKET_PRICES, JSON.stringify(marketPrices));
  }, [marketPrices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE_SOURCE_CONFIG, JSON.stringify(priceSourceConfig));
  }, [priceSourceConfig]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const id = genId('tx');
    const newTx: Transaction = { ...tx, id };

    setTransactions(prev => [newTx, ...prev]);

    // If transaction is linked to a debt, automatically update the debt balance & history
    if (newTx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === newTx.debtId) {
            const addedPaid = d.paidAmount + newTx.amount;
            const isSettled = addedPaid >= d.amount;
            const accName = accounts.find(a => a.id === newTx.accountId)?.name;
            const newPayment: DebtPayment = {
              id: genId('dp'),
              transactionId: id,
              amount: newTx.amount,
              date: newTx.date,
              accountId: newTx.accountId,
              accountName: accName,
              description: newTx.description,
            };
            return {
              ...d,
              paidAmount: addedPaid,
              isSettled,
              payments: [...(d.payments || []), newPayment],
            };
          }
          return d;
        })
      );
    }

    // If transaction is linked to a goal
    if (newTx.goalId) {
      setGoals(prev =>
        prev.map(g =>
          g.id === newTx.goalId ? { ...g, currentAmount: g.currentAmount + newTx.amount } : g
        )
      );
    }
  };

  const addTransactionAndReconcile = (
    tx: Omit<Transaction, 'id' | 'createdAt'>,
    targetBalance: number
  ) => {
    const id = genId('tx');
    const newTx: Transaction = { ...tx, id };
    const nextTransactions = [newTx, ...transactions];

    setTransactions(nextTransactions);

    // If transaction is linked to a debt, automatically update the debt balance & history
    if (newTx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === newTx.debtId) {
            const addedPaid = d.paidAmount + newTx.amount;
            const isSettled = addedPaid >= d.amount;
            const accName = accounts.find(a => a.id === newTx.accountId)?.name;
            const newPayment: DebtPayment = {
              id: genId('dp'),
              transactionId: id,
              amount: newTx.amount,
              date: newTx.date,
              accountId: newTx.accountId,
              accountName: accName,
              description: newTx.description,
            };
            return {
              ...d,
              paidAmount: addedPaid,
              isSettled,
              payments: [...(d.payments || []), newPayment],
            };
          }
          return d;
        })
      );
    }

    // If transaction is linked to a goal
    if (newTx.goalId) {
      setGoals(prev =>
        prev.map(g =>
          g.id === newTx.goalId ? { ...g, currentAmount: g.currentAmount + newTx.amount } : g
        )
      );
    }

    const targetAccountId = newTx.accountId;
    const breakdown = getAccountBreakdown(targetAccountId, nextTransactions);
    const newInitial = targetBalance - breakdown.netDelta;

    setAccountsBase(prev =>
      prev.map(a => (a.id === targetAccountId ? { ...a, initialBalance: newInitial } : a))
    );
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    // Sync debt updates
    if (oldTx.debtId || updatedTx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          // If transaction moved away from this debt, revert payment
          if (d.id === oldTx.debtId && oldTx.debtId !== updatedTx.debtId) {
            const newPaid = Math.max(0, d.paidAmount - oldTx.amount);
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: d.payments?.filter(p => p.transactionId !== updatedTx.id && p.id !== 'dp-' + updatedTx.id),
            };
          }
          // If transaction moved to this debt
          if (d.id === updatedTx.debtId && oldTx.debtId !== updatedTx.debtId) {
            const newPaid = d.paidAmount + updatedTx.amount;
            const accName = accounts.find(a => a.id === updatedTx.accountId)?.name;
            const newPayment: DebtPayment = {
              id: 'dp-' + updatedTx.id,
              transactionId: updatedTx.id,
              amount: updatedTx.amount,
              date: updatedTx.date,
              accountId: updatedTx.accountId,
              accountName: accName,
              description: updatedTx.description,
            };
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: [...(d.payments || []), newPayment],
            };
          }
          // If transaction stayed with this debt, update amount and details
          if (d.id === updatedTx.debtId && oldTx.debtId === updatedTx.debtId) {
            const diff = updatedTx.amount - oldTx.amount;
            const newPaid = Math.max(0, d.paidAmount + diff);
            const accName = accounts.find(a => a.id === updatedTx.accountId)?.name;
            const updatedPayments = (d.payments || []).map(p => {
              if (p.transactionId === updatedTx.id || p.id === 'dp-' + updatedTx.id) {
                return {
                  ...p,
                  amount: updatedTx.amount,
                  date: updatedTx.date,
                  accountId: updatedTx.accountId,
                  accountName: accName,
                  description: updatedTx.description,
                };
              }
              return p;
            });
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: updatedPayments,
            };
          }
          return d;
        })
      );
    }

    // Sync goal updates
    if (oldTx.goalId || updatedTx.goalId) {
      setGoals(prev =>
        prev.map(g => {
          if (g.id === oldTx.goalId && oldTx.goalId !== updatedTx.goalId) {
            return { ...g, currentAmount: Math.max(0, g.currentAmount - oldTx.amount) };
          }
          if (g.id === updatedTx.goalId && oldTx.goalId !== updatedTx.goalId) {
            return { ...g, currentAmount: g.currentAmount + updatedTx.amount };
          }
          if (g.id === updatedTx.goalId && oldTx.goalId === updatedTx.goalId) {
            const diff = updatedTx.amount - oldTx.amount;
            return { ...g, currentAmount: Math.max(0, g.currentAmount + diff) };
          }
          return g;
        })
      );
    }

    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      if (tx.debtId) {
        setDebts(prev =>
          prev.map(d => {
            if (d.id === tx.debtId) {
              const newPaid = Math.max(0, d.paidAmount - tx.amount);
              return {
                ...d,
                paidAmount: newPaid,
                isSettled: newPaid >= d.amount,
                payments: d.payments?.filter(p => p.transactionId !== id && p.id !== 'dp-' + id),
              };
            }
            return d;
          })
        );
      }
      if (tx.goalId) {
        setGoals(prev =>
          prev.map(g =>
            g.id === tx.goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - tx.amount) } : g
          )
        );
      }
      // If transaction has chequeId or matches a cheque's transactionId, revert cheque to pending
      setCheques(prev =>
        prev.map(c =>
          (tx.chequeId && c.id === tx.chequeId) || c.transactionId === id
            ? {
                ...c,
                status: 'pending',
                transactionId: undefined,
                clearedDate: undefined,
              }
            : c
        )
      );
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const divideTransactionBy10 = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const oldAmount = tx.amount;
    const newAmount = Math.round(oldAmount / 10);
    const diff = oldAmount - newAmount;

    const newFee = tx.fee ? Math.round(tx.fee / 10) : undefined;

    if (tx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === tx.debtId) {
            const updatedPaid = Math.max(0, d.paidAmount - diff);
            const updatedPayments = (d.payments || []).map(p =>
              p.transactionId === txId || p.id === 'dp-' + txId
                ? { ...p, amount: Math.round(p.amount / 10) }
                : p
            );
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
              payments: updatedPayments,
            };
          }
          return d;
        })
      );
    }

    if (tx.goalId) {
      setGoals(prev =>
        prev.map(g =>
          g.id === tx.goalId
            ? { ...g, currentAmount: Math.max(0, g.currentAmount - diff) }
            : g
        )
      );
    }

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, amount: newAmount, fee: newFee } : t))
    );
  };

  const multiplyTransactionBy10 = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const oldAmount = tx.amount;
    const newAmount = Math.round(oldAmount * 10);
    const diff = newAmount - oldAmount;

    const newFee = tx.fee ? Math.round(tx.fee * 10) : undefined;

    if (tx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === tx.debtId) {
            const updatedPaid = d.paidAmount + diff;
            const updatedPayments = (d.payments || []).map(p =>
              p.transactionId === txId || p.id === 'dp-' + txId
                ? { ...p, amount: Math.round(p.amount * 10) }
                : p
            );
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
              payments: updatedPayments,
            };
          }
          return d;
        })
      );
    }

    if (tx.goalId) {
      setGoals(prev =>
        prev.map(g =>
          g.id === tx.goalId
            ? { ...g, currentAmount: g.currentAmount + diff }
            : g
        )
      );
    }

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, amount: newAmount, fee: newFee } : t))
    );
  };

  const batchFixRialTransactions = (): number => {
    let fixedCount = 0;
    const debtDeltas = new Map<string, number>();
    const fixedTxIds = new Set<string>();

    const updatedTransactions = transactions.map(tx => {
      if (tx.amount >= 100000000) {
        fixedCount++;
        fixedTxIds.add(tx.id);
        const newAmount = Math.round(tx.amount / 10);
        const diff = tx.amount - newAmount;
        const newFee = tx.fee ? Math.round(tx.fee / 10) : undefined;

        if (tx.debtId) {
          const currentDebtDiff = debtDeltas.get(tx.debtId) || 0;
          debtDeltas.set(tx.debtId, currentDebtDiff + diff);
        }

        return { ...tx, amount: newAmount, fee: newFee };
      }
      return tx;
    });

    if (fixedCount > 0) {
      setTransactions(updatedTransactions);

      if (debtDeltas.size > 0) {
        setDebts(prev =>
          prev.map(d => {
            const dDiff = debtDeltas.get(d.id);
            if (dDiff) {
              const newPaid = Math.max(0, d.paidAmount - dDiff);
              const updatedPayments = (d.payments || []).map(p => {
                if ((p.transactionId && fixedTxIds.has(p.transactionId)) || fixedTxIds.has(p.id.replace(/^dp-/, ''))) {
                  return { ...p, amount: Math.round(p.amount / 10) };
                }
                return p;
              });
              return {
                ...d,
                paidAmount: newPaid,
                isSettled: newPaid >= d.amount,
                payments: updatedPayments,
              };
            }
            return d;
          })
        );
      }
    }

    return fixedCount;
  };

  const convertAllDataCurrency = (factor: 0.1 | 10) => {
    const scale = (val: number) => factor === 10 ? Math.round(val * 10) : (val * 0.1);
    setAccountsBase(prev =>
      prev.map(a => ({
        ...a,
        initialBalance: typeof a.initialBalance === 'number' ? scale(a.initialBalance) : 0,
        balance: scale(a.balance),
      }))
    );
    setTransactions(prev =>
      prev.map(t => ({
        ...t,
        amount: scale(t.amount),
        fee: t.fee ? scale(t.fee) : undefined,
      }))
    );
    setBudgets(prev => prev.map(b => ({ ...b, amount: scale(b.amount) })));
    setGoals(prev =>
      prev.map(g => ({
        ...g,
        targetAmount: scale(g.targetAmount),
        currentAmount: scale(g.currentAmount),
      }))
    );
    setDebts(prev =>
      prev.map(d => ({
        ...d,
        amount: scale(d.amount),
        paidAmount: scale(d.paidAmount),
        payments: d.payments?.map(p => ({ ...p, amount: scale(p.amount) })),
      }))
    );
    setCheques(prev => prev.map(c => ({ ...c, amount: scale(c.amount) })));
  };

  // Account Actions
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const initBal = typeof acc.initialBalance === 'number' ? acc.initialBalance : (acc.balance ?? 0);
    const newAcc: Account = {
      ...acc,
      id: genId('acc'),
      initialBalance: initBal,
      balance: initBal,
    };
    setAccountsBase(prev => [...prev, newAcc]);
  };

  const updateAccount = (acc: Account) => {
    setAccountsBase(prev =>
      prev.map(a => {
        if (a.id === acc.id) {
          const initBal = typeof acc.initialBalance === 'number' ? acc.initialBalance : (a.initialBalance ?? 0);
          return {
            ...acc,
            initialBalance: initBal,
          };
        }
        return a;
      })
    );
  };

  const deleteAccount = (id: string) => {
    setAccountsBase(prev => prev.filter(a => a.id !== id));
  };

  const reconcileAccountBalance = (accountId: string, targetCurrentBalance: number) => {
    const breakdown = getAccountBreakdown(accountId, transactions);
    const newInitial = targetCurrentBalance - breakdown.netDelta;
    setAccountsBase(prev =>
      prev.map(a => (a.id === accountId ? { ...a, initialBalance: newInitial } : a))
    );
  };

  const getAccountTransactionsDelta = useCallback(
    (accountId: string) => getAccountBreakdown(accountId, transactions),
    [transactions]
  );

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: genId('cat') };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Budget Actions
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = { ...b, id: genId('b') };
    setBudgets(prev => [...prev, newB]);
  };

  const updateBudget = (b: Budget) => {
    setBudgets(prev => prev.map(item => (item.id === b.id ? b : item)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Goals
  const addGoal = (g: Omit<Goal, 'id'>) => {
    const newG: Goal = { ...g, id: genId('g') };
    setGoals(prev => [...prev, newG]);
  };

  const updateGoal = (g: Goal) => {
    setGoals(prev => prev.map(item => (item.id === g.id ? g : item)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number, accountId?: string) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    if (accountId) {
      const txId = genId('tx');
      const newTx: Transaction = {
        id: txId,
        type: 'expense',
        amount,
        date: getTodayJalali(),
        description: `واریز به هدف پس‌انداز: ${goal?.title || 'هدف'}`,
        categoryId: 'cat-invest',
        accountId,
        goalId: id,
        relatedEntityId: id,
        tags: ['هدف پس‌انداز', goal?.title || ''],
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  // Debts
  const addDebt = (d: Omit<Debt, 'id'>) => {
    const newD: Debt = { ...d, id: genId('d') };
    setDebts(prev => [...prev, newD]);
  };

  const updateDebt = (d: Debt) => {
    setDebts(prev => prev.map(item => (item.id === d.id ? d : item)));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const payDebt = (id: string, amount: number) => {
    setDebts(prev =>
      prev.map(d => {
        if (d.id === id) {
          const paidAmount = d.paidAmount + amount;
          return {
            ...d,
            paidAmount,
            isSettled: paidAmount >= d.amount,
          };
        }
        return d;
      })
    );
  };

  const payDebtWithAccount = (params: {
    debtId: string;
    amount: number;
    accountId: string;
    date?: string;
    description?: string;
  }) => {
    const debt = debts.find(d => d.id === params.debtId);
    if (!debt) return;

    const remaining = Math.max(0, debt.amount - debt.paidAmount);
    // Clamp payment amount to remaining amount
    const actualPayAmount = Math.min(params.amount, remaining);
    if (actualPayAmount <= 0) return;

    const txDate = params.date || getTodayJalali();
    const isDebtPay = debt.type === 'debt';
    const txType: TransactionType = isDebtPay ? 'expense' : 'income';
    const txDesc =
      params.description ||
      (isDebtPay
        ? `پرداخت بدهی / قسط به ${debt.personName}`
        : `دریافت طلب از ${debt.personName}`);

    // 1. Create transaction
    const txId = genId('tx');
    const newTx: Transaction = {
      id: txId,
      type: txType,
      amount: actualPayAmount,
      date: txDate,
      description: txDesc,
      categoryId: isDebtPay ? 'cat-debt-pay' : 'cat-debt-collect',
      accountId: params.accountId,
      debtId: debt.id,
      relatedEntityId: debt.id,
      personId: debt.personId,
      tags: [isDebtPay ? 'تسویه بدهی' : 'وصول طلب', debt.personName],
    };

    setTransactions(prev => [newTx, ...prev]);

    // 2. Update debt and payment history (auto-mark settled when fully paid)
    const accName = accounts.find(a => a.id === params.accountId)?.name;
    setDebts(prev =>
      prev.map(d => {
        if (d.id === params.debtId) {
          const paidAmount = d.paidAmount + actualPayAmount;
          const isSettled = paidAmount >= d.amount;
          const newPayment: DebtPayment = {
            id: genId('dp'),
            transactionId: txId,
            amount: actualPayAmount,
            date: txDate,
            accountId: params.accountId,
            accountName: accName,
            description: txDesc,
          };
          return {
            ...d,
            paidAmount,
            isSettled,
            payments: [...(d.payments || []), newPayment],
          };
        }
        return d;
      })
    );
  };

  // Persons / Contacts CRUD
  const addPerson = (p: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newP: Person = {
      ...p,
      id: genId('per'),
      createdAt: getTodayJalali(),
    };
    setPersons(prev => [newP, ...prev]);
    return newP;
  };

  const updatePerson = (p: Person) => {
    setPersons(prev => prev.map(item => (item.id === p.id ? p : item)));
  };

  const deletePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
  };

  // Cheques & Balance Integrity (only impact account balance when transitioning to/from cleared/passed)
  const addCheque = (ch: Omit<Cheque, 'id'>) => {
    const newChId = genId('ch');
    let linkedTxId: string | undefined;

    const isCleared = ch.status === 'passed' || ch.status === 'cleared';
    const finalAccountId = isCleared ? (ch.accountId || (accounts[0]?.id || '')) : ch.accountId;
    if (isCleared && finalAccountId) {
      linkedTxId = genId('tx-ch');
      const isPayable = ch.type === 'payable';
      const chTx: Transaction = {
        id: linkedTxId,
        type: isPayable ? 'expense' : 'income',
        amount: ch.amount,
        date: getTodayJalali(),
        description: isPayable
          ? `پاس شدن چک پرداختی شماره ${ch.chequeNumber} (در وجه ${ch.partyName})`
          : `وصول چک دریافتی شماره ${ch.chequeNumber} (از ${ch.partyName})`,
        categoryId: isPayable ? 'cat-cheque-pay' : 'cat-cheque-collect',
        accountId: finalAccountId,
        chequeId: newChId,
        relatedEntityId: newChId,
        tags: ['چک', ch.bankName, ch.partyName],
      };
      setTransactions(prev => [chTx, ...prev]);
    }

    const newCh: Cheque = {
      ...ch,
      id: newChId,
      accountId: finalAccountId,
      transactionId: linkedTxId,
      clearedDate: isCleared ? (ch.clearedDate || getTodayJalali()) : undefined,
    };
    setCheques(prev => [...prev, newCh]);
  };

  const updateCheque = (ch: Cheque) => {
    const oldCh = cheques.find(c => c.id === ch.id);
    if (!oldCh) return;

    const oldWasCleared = oldCh.status === 'passed' || oldCh.status === 'cleared';
    const newIsCleared = ch.status === 'passed' || ch.status === 'cleared';
    let updatedTxId = ch.transactionId || oldCh.transactionId;

    if (!oldWasCleared && newIsCleared) {
      const targetAccountId = ch.accountId || oldCh.accountId || (accounts[0]?.id || '');
      if (targetAccountId) {
        updatedTxId = genId('tx-ch');
        const isPayable = ch.type === 'payable';
        const chTx: Transaction = {
          id: updatedTxId,
          type: isPayable ? 'expense' : 'income',
          amount: ch.amount,
          date: getTodayJalali(),
          description: isPayable
            ? `پاس شدن چک پرداختی شماره ${ch.chequeNumber} (در وجه ${ch.partyName})`
            : `وصول چک دریافتی شماره ${ch.chequeNumber} (از ${ch.partyName})`,
          categoryId: isPayable ? 'cat-cheque-pay' : 'cat-cheque-collect',
          accountId: targetAccountId,
          chequeId: ch.id,
          relatedEntityId: ch.id,
          tags: ['چک', ch.bankName, ch.partyName],
        };
        setTransactions(prev => [chTx, ...prev]);
      }
    } else if (oldWasCleared && !newIsCleared) {
      if (updatedTxId) {
        setTransactions(prev => prev.filter(t => t.id !== updatedTxId && t.chequeId !== ch.id));
        updatedTxId = undefined;
      }
    } else if (oldWasCleared && newIsCleared && updatedTxId) {
      const isPayable = ch.type === 'payable';
      setTransactions(prev =>
        prev.map(t =>
          t.id === updatedTxId || t.chequeId === ch.id
            ? {
                ...t,
                amount: ch.amount,
                accountId: ch.accountId || t.accountId,
                description: isPayable
                  ? `پاس شدن چک پرداختی شماره ${ch.chequeNumber} (در وجه ${ch.partyName})`
                  : `وصول چک دریافتی شماره ${ch.chequeNumber} (از ${ch.partyName})`,
              }
            : t
        )
      );
    }

    setCheques(prev =>
      prev.map(item =>
        item.id === ch.id
          ? {
              ...ch,
              transactionId: updatedTxId,
              clearedDate: newIsCleared ? (ch.clearedDate || getTodayJalali()) : undefined,
            }
          : item
      )
    );
  };

  const deleteCheque = (id: string) => {
    const ch = cheques.find(c => c.id === id);
    if (ch && (ch.status === 'passed' || ch.status === 'cleared')) {
      if (ch.transactionId) {
        setTransactions(prev => prev.filter(t => t.id !== ch.transactionId && t.chequeId !== id));
      }
    }
    setCheques(prev => prev.filter(c => c.id !== id));
  };

  const changeChequeStatus = (id: string, status: Cheque['status'], accountId?: string) => {
    const cheque = cheques.find(c => c.id === id);
    if (!cheque) return;

    const oldStatus = cheque.status;
    const isNowCleared = status === 'passed' || status === 'cleared';
    const wasCleared = oldStatus === 'passed' || oldStatus === 'cleared';

    let linkedTxId = cheque.transactionId;

    if (!wasCleared && isNowCleared) {
      // Transitioning to cleared -> impact linked bank account
      const targetAccountId = accountId || cheque.accountId || (accounts[0]?.id || '');
      if (targetAccountId) {
        linkedTxId = genId('tx-ch');
        const isPayable = cheque.type === 'payable';
        const chTx: Transaction = {
          id: linkedTxId,
          type: isPayable ? 'expense' : 'income',
          amount: cheque.amount,
          date: getTodayJalali(),
          description: isPayable
            ? `پاس شدن چک پرداختی شماره ${cheque.chequeNumber} (در وجه ${cheque.partyName})`
            : `وصول چک دریافتی شماره ${cheque.chequeNumber} (از ${cheque.partyName})`,
          categoryId: isPayable ? 'cat-cheque-pay' : 'cat-cheque-collect',
          accountId: targetAccountId,
          chequeId: cheque.id,
          relatedEntityId: cheque.id,
          tags: ['چک', cheque.bankName, cheque.partyName],
        };
        setTransactions(prev => [chTx, ...prev]);
      }
    } else if (wasCleared && !isNowCleared) {
      // Transitioning away from cleared -> reverse balance impact
      if (linkedTxId) {
        setTransactions(prev => prev.filter(t => t.id !== linkedTxId && t.chequeId !== cheque.id));
        linkedTxId = undefined;
      }
    }

    setCheques(prev =>
      prev.map(ch =>
        ch.id === id
          ? {
              ...ch,
              status,
              transactionId: linkedTxId,
              accountId: accountId || ch.accountId,
              clearedDate: isNowCleared ? (ch.clearedDate || getTodayJalali()) : undefined,
            }
          : ch
      )
    );
  };

  // Asset & Portfolio Actions
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'createdAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: genId('asset'),
      createdAt: getTodayJalali(),
    };
    setAssets(prev => [newAsset, ...prev]);
  }, []);

  const updateAsset = useCallback((asset: Asset) => {
    setAssets(prev => prev.map(a => (a.id === asset.id ? { ...asset, updatedAt: getTodayJalali() } : a)));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const addAssetTransaction = useCallback((tx: Omit<AssetTransaction, 'id'>) => {
    const newTxId = genId('atx');
    let linkedLedgerTxId: string | undefined;

    // If trade is linked to a bank account, automatically create a ledger transaction
    if (tx.accountId) {
      linkedLedgerTxId = genId('tx-asset');
      const isBuy = tx.type === 'buy';
      const tradeLedgerTx: Transaction = {
        id: linkedLedgerTxId,
        type: isBuy ? 'expense' : 'income',
        amount: tx.totalAmount,
        date: tx.date || getTodayJalali(),
        description: isBuy
          ? `خرید ${tx.quantity} ${tx.assetName}`
          : `فروش ${tx.quantity} ${tx.assetName}`,
        categoryId: isBuy ? 'cat-investment-buy' : 'cat-investment-sell',
        accountId: tx.accountId,
        assetTransactionId: newTxId,
        relatedEntityId: tx.assetId,
        tags: ['سرمایه‌گذاری', tx.assetName],
      };
      setTransactions(prev => [tradeLedgerTx, ...prev]);
    }

    const newTx: AssetTransaction = {
      ...tx,
      id: newTxId,
      transactionId: linkedLedgerTxId,
    };
    setAssetTransactions(prev => [newTx, ...prev]);

    // Automatically update the parent asset quantity and cost basis
    setAssets(prev =>
      prev.map(asset => {
        if (asset.id !== tx.assetId) return asset;

        if (tx.type === 'buy') {
          const oldQty = asset.quantity || 0;
          const oldBuyPrice = asset.buyPriceAverage || 0;
          const buyQty = tx.quantity;
          const tradePrice = tx.unitPrice;

          const newQty = oldQty + buyQty;
          // Weighted Average Cost basis: ((oldQty * oldBuyPrice) + (buyQty * tradePrice)) / (oldQty + buyQty)
          const newBuyPrice = newQty > 0
            ? ((oldQty * oldBuyPrice) + (buyQty * tradePrice)) / newQty
            : tradePrice;
          const newTotalCost = newQty * newBuyPrice;

          return {
            ...asset,
            quantity: newQty,
            buyPriceAverage: Math.round(newBuyPrice),
            buyPrice: Math.round(newBuyPrice),
            totalCost: Math.round(newTotalCost),
            updatedAt: getTodayJalali(),
          };
        } else {
          // Sell: keep buyPrice unchanged, only reduce quantity
          const oldQty = asset.quantity || 0;
          const sellQty = Math.min(tx.quantity, oldQty);
          const newQty = Math.max(0, oldQty - sellQty);
          const buyPrice = asset.buyPriceAverage || 0;
          const newTotalCost = newQty * buyPrice;

          return {
            ...asset,
            quantity: newQty,
            buyPriceAverage: buyPrice,
            buyPrice: buyPrice,
            totalCost: Math.round(newTotalCost),
            updatedAt: getTodayJalali(),
          };
        }
      })
    );
  }, []);

  const deleteAssetTransaction = useCallback((id: string) => {
    const target = assetTransactions.find(t => t.id === id);
    if (!target) return;

    if (target.transactionId) {
      setTransactions(txs => txs.filter(t => t.id !== target.transactionId && t.assetTransactionId !== id));
    }

    setAssetTransactions(prev => prev.filter(t => t.id !== id));

    setAssets(prev =>
      prev.map(asset => {
        if (asset.id !== target.assetId) return asset;

        if (target.type === 'buy') {
          const newQty = Math.max(0, (asset.quantity || 0) - target.quantity);
          const currentTotalCost = (asset.quantity || 0) * (asset.buyPriceAverage || 0);
          const tradeCost = target.totalAmount || (target.quantity * target.unitPrice);
          const newTotalCost = Math.max(0, currentTotalCost - tradeCost);
          const newBuyPrice = newQty > 0 ? Math.round(newTotalCost / newQty) : 0;

          return {
            ...asset,
            quantity: newQty,
            buyPriceAverage: newBuyPrice,
            buyPrice: newBuyPrice,
            totalCost: Math.round(newQty * newBuyPrice),
            updatedAt: getTodayJalali(),
          };
        } else {
          // Reverting sell: add back quantity, keep buyPriceAverage
          const newQty = (asset.quantity || 0) + target.quantity;
          const buyPrice = asset.buyPriceAverage || 0;
          const newTotalCost = newQty * buyPrice;

          return {
            ...asset,
            quantity: newQty,
            buyPriceAverage: buyPrice,
            buyPrice: buyPrice,
            totalCost: Math.round(newTotalCost),
            updatedAt: getTodayJalali(),
          };
        }
      })
    );
  }, [assetTransactions]);

  const updateMarketPrice = useCallback((symbol: string, newPriceToman: number) => {
    setMarketPrices(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? {
              ...item,
              priceToman: newPriceToman,
              isCustomManual: true,
              lastUpdated: getTodayJalali() + ' (دستی)',
              source: 'تنظیم دستی کاربر',
            }
          : item
      )
    );
  }, []);

  const toggleMarketPriceEnabled = useCallback((symbol: string) => {
    setMarketPrices(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? { ...item, isEnabled: !item.isEnabled }
          : item
      )
    );
  }, []);

  const setMarketPriceEnabled = useCallback((symbol: string, enabled: boolean) => {
    setMarketPrices(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? { ...item, isEnabled: enabled }
          : item
      )
    );
  }, []);

  const setMarketPriceDisplayUnit = useCallback((symbol: string, unit: 'toman' | 'rial') => {
    setMarketPrices(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? { ...item, displayCurrency: unit }
          : item
      )
    );
  }, []);

  const refreshMarketPrices = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetchLiveMarketRates(priceSourceConfig, marketPrices);
    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${getTodayJalali()} - ${nowTime}`;

    if (res.success) {
      setMarketPrices(res.updatedPrices);
      setPriceSourceConfig(prev => ({
        ...prev,
        lastFetchTime: timestamp,
        lastFetchStatus: 'success',
        lastFetchMessage: res.message,
      }));
    } else {
      setPriceSourceConfig(prev => ({
        ...prev,
        lastFetchTime: timestamp,
        lastFetchStatus: 'error',
        lastFetchMessage: res.message,
      }));
    }
    return { success: res.success, message: res.message };
  }, [priceSourceConfig, marketPrices]);

  const updatePriceSourceConfig = useCallback((cfg: Partial<PriceSourceConfig>) => {
    setPriceSourceConfig(prev => {
      const next = { ...prev, ...cfg };
      localStorage.setItem(STORAGE_KEYS.PRICE_SOURCE_CONFIG, JSON.stringify(next));
      return next;
    });

    if (cfg.dollarDisplayUnit || cfg.goldDisplayUnit) {
      setMarketPrices(prev =>
        prev.map(item => {
          if (item.symbol === 'usd' && cfg.dollarDisplayUnit) {
            return { ...item, displayCurrency: cfg.dollarDisplayUnit };
          }
          if (item.symbol === 'gold_18k' && cfg.goldDisplayUnit) {
            return { ...item, displayCurrency: cfg.goldDisplayUnit };
          }
          return item;
        })
      );
    }
  }, []);

  const applyTelegramPricesFromText = useCallback(
    (text: string, overrideUnit?: SourceCurrencyUnit) => {
      const unitToUse =
        overrideUnit ||
        priceSourceConfig.dollarSourceUnit ||
        priceSourceConfig.goldDollarSourceUnit ||
        'auto';
      const res = parseTelegramMarketText(text, unitToUse);
    if (!res.success || res.matchedItems.length === 0) {
      return { count: 0, symbols: [], message: 'هیچ قیمت معتبری در متن شناسایی نشد.' };
    }

    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${getTodayJalali()} - ${nowTime} (تلگرام)`;

    setMarketPrices(prev =>
      prev.map(item => {
        const found = res.matchedItems.find(m => m.symbol === item.symbol);
        if (found) {
          return {
            ...item,
            priceToman: found.priceToman,
            lastUpdated: timestamp,
            source: 'پیست متن تلگرام',
            isCustomManual: true,
          };
        }
        return item;
      })
    );

    return {
      count: res.matchedItems.length,
      symbols: res.matchedItems.map(m => m.name),
      message: `${res.matchedItems.length} نرخ از متن تلگرام با موفقیت استخراج و اعمال شد.`,
    };
  }, [priceSourceConfig]);

  // Auto-refresh interval for market prices if enabled
  useEffect(() => {
    const intervalMins = priceSourceConfig.autoRefreshMinutes || 0;
    if (intervalMins <= 0) return;

    const timer = setInterval(() => {
      refreshMarketPrices();
    }, intervalMins * 60 * 1000);

    return () => clearInterval(timer);
  }, [priceSourceConfig.autoRefreshMinutes, refreshMarketPrices]);

  // Demo data and Backup
  const loadDemoData = useCallback(() => {
    const demo = getDemoData();
    setAccountsBase(demo.accounts);
    setTransactions(demo.transactions);
    setBudgets(demo.budgets);
    setGoals(demo.goals);
    setDebts(demo.debts);
    setCheques(demo.cheques);
    setPersons(DEFAULT_PERSONS);
    setAssets(DEFAULT_ASSETS);
    setAssetTransactions(DEFAULT_ASSET_TRANSACTIONS);
  }, []);

  const exportDataJSON = useCallback((): string => {
    const data = {
      version: 7,
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      debts,
      cheques,
      persons,
      currency,
      themeConfig,
      dashboardConfig,
      assets,
      assetTransactions,
      marketPrices,
      priceSourceConfig,
    };
    return JSON.stringify(data, null, 2);
  }, [
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    currency,
    themeConfig,
    dashboardConfig,
    assets,
    assetTransactions,
    marketPrices,
    priceSourceConfig,
  ]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.accounts) setAccountsBase(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.categories) setCategories(data.categories);
      if (data.budgets) setBudgets(data.budgets);
      if (data.goals) setGoals(data.goals);
      if (data.debts) setDebts(data.debts);
      if (data.cheques) setCheques(data.cheques);
      if (data.persons) setPersons(data.persons);
      if (data.currency) setCurrency(data.currency);
      if (data.themeConfig) setThemeConfig(data.themeConfig);
      if (data.dashboardConfig) setDashboardConfig(data.dashboardConfig);
      if (data.assets) setAssets(data.assets);
      if (data.assetTransactions) setAssetTransactions(data.assetTransactions);
      if (data.marketPrices) setMarketPrices(data.marketPrices);
      if (data.priceSourceConfig) setPriceSourceConfig(data.priceSourceConfig);
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setCheques([]);
    setPersons([]);
    setAssets([]);
    setAssetTransactions([]);
    setAccountsBase(DEFAULT_ACCOUNTS.map(a => ({ ...a, initialBalance: 0, balance: 0 })));
  }, []);

  // Memoized Computations for high performance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Portfolio calculations
  const totalPortfolioValueToman = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const marketItem = marketPrices.find(m => m.symbol === asset.symbol);
      const currentPrice = marketItem ? marketItem.priceToman : asset.buyPriceAverage;
      return sum + (asset.quantity * currentPrice);
    }, 0);
  }, [assets, marketPrices]);

  const totalPortfolioCostToman = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (asset.totalCost || (asset.quantity * asset.buyPriceAverage)), 0);
  }, [assets]);

  const totalPortfolioPnlToman = totalPortfolioValueToman - totalPortfolioCostToman;
  const totalPortfolioPnlPercent = totalPortfolioCostToman > 0
    ? (totalPortfolioPnlToman / totalPortfolioCostToman) * 100
    : 0;

  const contextValue = useMemo(() => ({
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    currency,
    darkMode,
    themeConfig,
    isPrivacyMode,
    togglePrivacyMode,
    assets,
    assetTransactions,
    marketPrices,
    priceSourceConfig,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssetTransaction,
    deleteAssetTransaction,
    updateMarketPrice,
    toggleMarketPriceEnabled,
    setMarketPriceEnabled,
    setMarketPriceDisplayUnit,
    refreshMarketPrices,
    updatePriceSourceConfig,
    applyTelegramPricesFromText,
    addTransaction,
    addTransactionAndReconcile,
    updateTransaction,
    deleteTransaction,
    divideTransactionBy10,
    multiplyTransactionBy10,
    batchFixRialTransactions,
    convertAllDataCurrency,
    addAccount,
    updateAccount,
    deleteAccount,
    reconcileAccountBalance,
    getAccountTransactionsDelta,
    addCategory,
    updateCategory,
    deleteCategory,
    addPerson,
    updatePerson,
    deletePerson,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    payDebt,
    payDebtWithAccount,
    addCheque,
    updateCheque,
    deleteCheque,
    changeChequeStatus,
    setCurrency,
    toggleDarkMode,
    updateThemeConfig,
    dashboardConfig,
    updateDashboardConfig,
    loadDemoData,
    exportDataJSON,
    importDataJSON,
    clearAllData,
    totalBalance,
    totalIncome,
    totalExpense,
    totalPortfolioValueToman,
    totalPortfolioCostToman,
    totalPortfolioPnlToman,
    totalPortfolioPnlPercent,
    cloudSyncStatus,
    syncAllToTurso,
    isCloudLoading,
    conflictNotice,
    dismissConflictNotice: () => setConflictNotice(null),
  }), [
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    currency,
    darkMode,
    themeConfig,
    isPrivacyMode,
    togglePrivacyMode,
    assets,
    assetTransactions,
    marketPrices,
    priceSourceConfig,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssetTransaction,
    deleteAssetTransaction,
    updateMarketPrice,
    toggleMarketPriceEnabled,
    setMarketPriceEnabled,
    setMarketPriceDisplayUnit,
    refreshMarketPrices,
    updatePriceSourceConfig,
    applyTelegramPricesFromText,
    dashboardConfig,
    totalBalance,
    totalIncome,
    totalExpense,
    totalPortfolioValueToman,
    totalPortfolioCostToman,
    totalPortfolioPnlToman,
    totalPortfolioPnlPercent,
    getAccountTransactionsDelta,
    cloudSyncStatus,
    syncAllToTurso,
    isCloudLoading,
    conflictNotice,
  ]);

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
