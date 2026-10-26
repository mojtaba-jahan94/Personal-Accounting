import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getTursoClient } from '../services/tursoClient';
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

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
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
  mode: 'light',
  palette: 'nordic',
  accent: 'wood',
  customAccentHex: '#A68A64',
  amoledMode: false,
  liquidGlass: true,
  performanceMode: false,
  lightStyle: 'frost',
  backgroundStyle: 'clean_minimal',
  spotlight1Color: '#A68A64',
  spotlight2Color: '#C2A882',
  glassIntensity: 'medium',
  glassOpacity: 0.85,
  glassBlur: 14,
  glassRefraction: 0.5,
  glassSaturation: 160,
  ambientOrbs: true,
  ambientGlow: 'subtle',
  animationSpeed: 'fast',
  borderRadius: 'smooth',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tursoStatus } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.transactions;
  });

  const [accountsBase, setAccountsBase] = useState<Account[]>(() => {
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
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.budgets;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.goals;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.debts;
  });

  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHEQUES);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.cheques;
  });

  const [persons, setPersons] = useState<Person[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return saved ? JSON.parse(saved) : DEFAULT_PERSONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : DEFAULT_ASSETS;
  });

  const [assetTransactions, setAssetTransactions] = useState<AssetTransaction[]>(() => {
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
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || 'toman';
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
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

    // Apply Palette Identity (Nordic vs Juniper & Coral)
    const currentPalette = themeConfig.palette || 'nordic';
    root.setAttribute('data-theme', currentPalette);
    body?.setAttribute('data-theme', currentPalette);

    if (currentPalette === 'juniper_coral') {
      root.setAttribute('data-accent', 'coral');
      const isDark = themeConfig.mode === 'dark';
      const coralAccent = isDark ? '#E26865' : '#7D2826';
      const coralHover = isDark ? '#F87171' : '#631E1D';
      const coralRgb = isDark ? '226, 104, 101' : '125, 40, 38';

      root.style.setProperty('--primary-color', coralAccent);
      root.style.setProperty('--primary-rgb', coralRgb);
      root.style.setProperty('--primary-hover', coralHover);
      root.style.setProperty('--primary-glow', 'rgba(125, 40, 38, 0.35)');

      // Palette core tokens
      root.style.setProperty('--color-candle', '#EFE9D7');
      root.style.setProperty('--color-coral', '#7D2826');
      root.style.setProperty('--color-leaf', '#898861');
      root.style.setProperty('--color-juniper', '#343723');

      if (isDark) {
        root.style.setProperty('--bg-base', '#202316');
        root.style.setProperty('--bg-surface', '#343723');
        root.style.setProperty('--bg-surface-secondary', 'rgba(52, 55, 35, 0.75)');
        root.style.setProperty('--text-primary', '#EFE9D7');
        root.style.setProperty('--text-muted', '#C5C3A5');
        root.style.setProperty('--border-subtle', 'rgba(137, 136, 97, 0.25)');
        root.style.setProperty('--border-cloud', 'rgba(239, 233, 215, 0.2)');
      } else {
        root.style.setProperty('--bg-base', '#EFE9D7');
        root.style.setProperty('--bg-surface', '#FFFFFF');
        root.style.setProperty('--bg-surface-secondary', '#E5DEC8');
        root.style.setProperty('--text-primary', '#343723');
        root.style.setProperty('--text-muted', '#626647');
        root.style.setProperty('--border-subtle', 'rgba(137, 136, 97, 0.25)');
        root.style.setProperty('--border-cloud', '#D6CEBA');
      }
    } else {
      root.setAttribute('data-accent', 'wood');
      root.style.setProperty('--primary-color', '#A68A64');
      root.style.setProperty('--primary-rgb', '166, 138, 100');
      root.style.setProperty('--primary-hover', '#8A704C');
      root.style.setProperty('--primary-glow', 'rgba(166, 138, 100, 0.35)');

      if (themeConfig.mode === 'dark') {
        root.style.setProperty('--bg-base', '#1F2933');
        root.style.setProperty('--bg-surface', '#263340');
        root.style.setProperty('--bg-surface-secondary', 'rgba(31, 41, 51, 0.75)');
        root.style.setProperty('--text-primary', '#F7F7F2');
        root.style.setProperty('--text-muted', '#D1D5DB');
        root.style.setProperty('--border-subtle', 'rgba(209, 213, 219, 0.15)');
        root.style.setProperty('--border-cloud', 'rgba(209, 213, 219, 0.22)');
      } else {
        root.style.setProperty('--bg-base', '#F7F7F2');
        root.style.setProperty('--bg-surface', '#FFFFFF');
        root.style.setProperty('--bg-surface-secondary', '#D1D5DB');
        root.style.setProperty('--text-primary', '#1F2933');
        root.style.setProperty('--text-muted', '#6B7280');
        root.style.setProperty('--border-subtle', 'rgba(107, 114, 128, 0.2)');
        root.style.setProperty('--border-cloud', '#D1D5DB');
      }
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
    const saved = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG);
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

  // Track previous user to trigger data loading only on change
  const prevUserIdRef = useRef<string | null>(null);

  // Initial hydration guard to prevent empty/default local state from overwriting remote Turso data
  const isHydratedRef = useRef<boolean>(!user);

  // Load user data from Turso server (or local user-scoped storage) on login
  useEffect(() => {
    if (!user) {
      prevUserIdRef.current = null;
      isHydratedRef.current = true;
      return;
    }

    if (prevUserIdRef.current === user.id) {
      return;
    }
    prevUserIdRef.current = user.id;

    const loadUserData = async () => {
      setIsCloudLoading(true);
      isHydratedRef.current = false;
      const userSuffix = '_' + user.id;
      const client = getTursoClient();
      let loadedFromTurso = false;

      if (client && tursoStatus === 'connected') {
        try {
          const res = await client.execute({
            sql: 'SELECT collection_key, data_json FROM user_finance_data WHERE user_id = ?',
            args: [user.id],
          });

          if (res.rows && res.rows.length > 0) {
            loadedFromTurso = true;
            for (const row of res.rows) {
              try {
                const k = row.collection_key as string;
                const v = JSON.parse(row.data_json as string);
                if (k === 'categories' && Array.isArray(v)) setCategories(v);
                else if (k === 'transactions' && Array.isArray(v)) setTransactions(v);
                else if (k === 'accounts' && Array.isArray(v)) setAccountsBase(v);
                else if (k === 'budgets' && Array.isArray(v)) setBudgets(v);
                else if (k === 'goals' && Array.isArray(v)) setGoals(v);
                else if (k === 'debts' && Array.isArray(v)) setDebts(v);
                else if (k === 'cheques' && Array.isArray(v)) setCheques(v);
                else if (k === 'persons' && Array.isArray(v)) setPersons(v);
                else if (k === 'assets' && Array.isArray(v)) setAssets(v);
                else if (k === 'assetTransactions' && Array.isArray(v)) setAssetTransactions(v);
                else if (k === 'currency' && (v === 'toman' || v === 'rial')) setCurrency(v);
                else if (k === 'themeConfig' && typeof v === 'object') setThemeConfig(v);
                else if (k === 'dashboardConfig' && typeof v === 'object') setDashboardConfig(v);
              } catch (e) {
                console.error('Error parsing Turso row:', e);
              }
            }
            setCloudSyncStatus('synced');
          }
        } catch (e) {
          console.error('Error fetching data from Turso:', e);
          setCloudSyncStatus('error');
        }
      }

      // If not loaded from Turso, check user-scoped local storage
      if (!loadedFromTurso) {
        try {
          const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES + userSuffix);
          if (savedCats) setCategories(JSON.parse(savedCats));

          const savedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + userSuffix);
          if (savedTxs) setTransactions(JSON.parse(savedTxs));

          const savedAccs = localStorage.getItem(STORAGE_KEYS.ACCOUNTS + userSuffix);
          if (savedAccs) setAccountsBase(JSON.parse(savedAccs));

          const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS + userSuffix);
          if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

          const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS + userSuffix);
          if (savedGoals) setGoals(JSON.parse(savedGoals));

          const savedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS + userSuffix);
          if (savedDebts) setDebts(JSON.parse(savedDebts));

          const savedCheques = localStorage.getItem(STORAGE_KEYS.CHEQUES + userSuffix);
          if (savedCheques) setCheques(JSON.parse(savedCheques));

          const savedPersons = localStorage.getItem(STORAGE_KEYS.PERSONS + userSuffix);
          if (savedPersons) setPersons(JSON.parse(savedPersons));

          const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS + userSuffix);
          if (savedAssets) setAssets(JSON.parse(savedAssets));

          const savedAssetTxs = localStorage.getItem(STORAGE_KEYS.ASSET_TRANSACTIONS + userSuffix);
          if (savedAssetTxs) setAssetTransactions(JSON.parse(savedAssetTxs));

          const savedCur = localStorage.getItem(STORAGE_KEYS.CURRENCY + userSuffix);
          if (savedCur === 'toman' || savedCur === 'rial') setCurrency(savedCur);
        } catch (e) {
          console.error('Error loading user-scoped local data:', e);
        }
      }

      // Mark hydration complete to allow safe syncing
      isHydratedRef.current = true;
      setIsCloudLoading(false);
    };

    loadUserData();
  }, [user, tursoStatus]);

  // Debounced sync to Turso server (1500ms debounce with hydration guard)
  const syncTimeoutRef = useRef<Record<string, any>>({});

  const syncCollectionToTurso = useCallback((collectionKey: string, data: any) => {
    if (!isHydratedRef.current) {
      // Guard: never push local default/empty state to cloud before initial load completes
      return;
    }
    if (!user?.id) return;
    const client = getTursoClient();
    if (!client || tursoStatus !== 'connected') {
      setCloudSyncStatus('offline');
      return;
    }

    if (syncTimeoutRef.current[collectionKey]) {
      clearTimeout(syncTimeoutRef.current[collectionKey]);
    }

    setCloudSyncStatus('syncing');

    syncTimeoutRef.current[collectionKey] = setTimeout(async () => {
      try {
        await client.execute({
          sql: `
            INSERT INTO user_finance_data (user_id, collection_key, data_json, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, collection_key)
            DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at
          `,
          args: [user.id, collectionKey, JSON.stringify(data), new Date().toISOString()],
        });
        setCloudSyncStatus('synced');
      } catch (e) {
        console.error(`Failed to sync ${collectionKey} to Turso:`, e);
        setCloudSyncStatus('error');
      }
    }, 1500);
  }, [user?.id, tursoStatus]);

  // Manual trigger to sync all collections to Turso
  const syncAllToTurso = useCallback(async () => {
    if (!user?.id) return;
    const client = getTursoClient();
    if (!client || tursoStatus !== 'connected') {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');
    try {
      const collections = [
        { key: 'accounts', data: accountsBase },
        { key: 'transactions', data: transactions },
        { key: 'categories', data: categories },
        { key: 'budgets', data: budgets },
        { key: 'goals', data: goals },
        { key: 'debts', data: debts },
        { key: 'cheques', data: cheques },
        { key: 'persons', data: persons },
        { key: 'assets', data: assets },
        { key: 'assetTransactions', data: assetTransactions },
        { key: 'currency', data: currency },
        { key: 'themeConfig', data: themeConfig },
        { key: 'dashboardConfig', data: dashboardConfig },
      ];

      for (const col of collections) {
        await client.execute({
          sql: `
            INSERT INTO user_finance_data (user_id, collection_key, data_json, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, collection_key)
            DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at
          `,
          args: [user.id, col.key, JSON.stringify(col.data), new Date().toISOString()],
        });
      }
      setCloudSyncStatus('synced');
    } catch (e) {
      console.error('Manual sync to Turso failed:', e);
      setCloudSyncStatus('error');
    }
  }, [
    user?.id,
    tursoStatus,
    accountsBase,
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
  ]);

  // Sync state to local storage & Turso server
  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userSuffix, JSON.stringify(accountsBase));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accountsBase));
    if (user?.id) syncCollectionToTurso('accounts', accountsBase);
  }, [accountsBase, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userSuffix, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    if (user?.id) syncCollectionToTurso('transactions', transactions);
  }, [transactions, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.CATEGORIES + userSuffix, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    if (user?.id) syncCollectionToTurso('categories', categories);
  }, [categories, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.BUDGETS + userSuffix, JSON.stringify(budgets));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    if (user?.id) syncCollectionToTurso('budgets', budgets);
  }, [budgets, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.GOALS + userSuffix, JSON.stringify(goals));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    if (user?.id) syncCollectionToTurso('goals', goals);
  }, [goals, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.DEBTS + userSuffix, JSON.stringify(debts));
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    if (user?.id) syncCollectionToTurso('debts', debts);
  }, [debts, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.CHEQUES + userSuffix, JSON.stringify(cheques));
    localStorage.setItem(STORAGE_KEYS.CHEQUES, JSON.stringify(cheques));
    if (user?.id) syncCollectionToTurso('cheques', cheques);
  }, [cheques, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.PERSONS + userSuffix, JSON.stringify(persons));
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
    if (user?.id) syncCollectionToTurso('persons', persons);
  }, [persons, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.CURRENCY + userSuffix, currency);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    if (user?.id) syncCollectionToTurso('currency', currency);
  }, [currency, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.ASSETS + userSuffix, JSON.stringify(assets));
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    if (user?.id) syncCollectionToTurso('assets', assets);
  }, [assets, user, syncCollectionToTurso]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '';
    localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS + userSuffix, JSON.stringify(assetTransactions));
    localStorage.setItem(STORAGE_KEYS.ASSET_TRANSACTIONS, JSON.stringify(assetTransactions));
    if (user?.id) syncCollectionToTurso('assetTransactions', assetTransactions);
  }, [assetTransactions, user, syncCollectionToTurso]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKET_PRICES, JSON.stringify(marketPrices));
  }, [marketPrices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE_SOURCE_CONFIG, JSON.stringify(priceSourceConfig));
  }, [priceSourceConfig]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now();
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
              id: 'dp-' + id,
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
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const divideTransactionBy10 = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const oldAmount = tx.amount;
    const newAmount = oldAmount / 10;
    const diff = oldAmount - newAmount;

    const newFee = tx.fee ? (tx.fee / 10) : undefined;

    if (tx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === tx.debtId) {
            const updatedPaid = Math.max(0, d.paidAmount - diff);
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
            };
          }
          return d;
        })
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
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
            };
          }
          return d;
        })
      );
    }

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, amount: newAmount, fee: newFee } : t))
    );
  };

  const batchFixRialTransactions = (): number => {
    let fixedCount = 0;
    const debtDeltas = new Map<string, number>();

    const updatedTransactions = transactions.map(tx => {
      if (tx.amount >= 100000000) {
        fixedCount++;
        const newAmount = tx.amount / 10;
        const diff = tx.amount - newAmount;
        const newFee = tx.fee ? (tx.fee / 10) : undefined;

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
              return {
                ...d,
                paidAmount: newPaid,
                isSettled: newPaid >= d.amount,
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
      id: 'acc-' + Date.now(),
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
    const newCat: Category = { ...cat, id: 'cat-' + Date.now() };
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
    const newB: Budget = { ...b, id: 'b-' + Date.now() };
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
    const newG: Goal = { ...g, id: 'g-' + Date.now() };
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
      const txId = 'tx-' + Date.now();
      const newTx: Transaction = {
        id: txId,
        type: 'expense',
        amount,
        date: getTodayJalali(),
        description: `واریز به هدف پس‌انداز: ${goal?.title || 'هدف'}`,
        categoryId: 'cat-invest',
        accountId,
        tags: ['هدف پس‌انداز', goal?.title || ''],
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  // Debts
  const addDebt = (d: Omit<Debt, 'id'>) => {
    const newD: Debt = { ...d, id: 'd-' + Date.now() };
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
    const txId = 'tx-' + Date.now();
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
            id: 'dp-' + Date.now(),
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
      id: 'per-' + Date.now(),
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
    const newChId = 'ch-' + Date.now();
    let linkedTxId: string | undefined;

    const isCleared = ch.status === 'passed' || ch.status === 'cleared';
    if (isCleared && ch.accountId) {
      linkedTxId = 'tx-ch-' + Date.now();
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
        accountId: ch.accountId,
        chequeId: newChId,
        relatedEntityId: newChId,
        tags: ['چک', ch.bankName, ch.partyName],
      };
      setTransactions(prev => [chTx, ...prev]);
    }

    const newCh: Cheque = {
      ...ch,
      id: newChId,
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
        updatedTxId = 'tx-ch-' + Date.now();
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
        linkedTxId = 'tx-ch-' + Date.now();
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
      id: 'asset-' + Date.now(),
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
    const newTxId = 'atx-' + Date.now();
    let linkedLedgerTxId: string | undefined;

    // If trade is linked to a bank account, automatically create a ledger transaction
    if (tx.accountId) {
      linkedLedgerTxId = 'tx-asset-' + Date.now();
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
    setAssetTransactions(prev => {
      const target = prev.find(t => t.id === id);
      if (target?.transactionId) {
        setTransactions(txs => txs.filter(t => t.id !== target.transactionId && t.assetTransactionId !== id));
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

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
