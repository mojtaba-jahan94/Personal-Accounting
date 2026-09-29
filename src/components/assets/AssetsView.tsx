import React, { useState, useMemo } from 'react';
import {
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Sliders,
  Send,
  Gem,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
  BarChart3,
  Layers,
  History,
  Info,
  ToggleLeft,
  ToggleRight,
  Globe,
  ArrowRightLeft,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import {
  Asset,
  AssetCategory,
  AssetTransaction,
  MarketPriceItem,
} from '../../types';
import { formatNumber } from '../../utils/formatters';
import { AssetModal } from './AssetModal';
import { AssetTradeModal } from './AssetTradeModal';
import { TelegramPasteModal } from './TelegramPasteModal';
import { PriceSourceSettingsModal } from './PriceSourceSettingsModal';
import { EditMarketPriceModal } from './EditMarketPriceModal';

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  gold: '#f59e0b', // Amber / Gold
  coin: '#eab308', // Yellow Gold
  currency: '#10b981', // Emerald USD
  crypto: '#06b6d4', // Cyan Tether/Crypto
  custom: '#8b5cf6', // Purple
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  gold: 'طلای خام و آبشده',
  coin: 'انواع سکه بهار آزادی',
  currency: 'اسکناس و ارز خارجی',
  crypto: 'ارز دیجیتال و تتر',
  custom: 'سایر دارایی‌ها',
};

export const AssetsView: React.FC = () => {
  const {
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
    setMarketPriceDisplayUnit,
    refreshMarketPrices,
    updatePriceSourceConfig,
    applyTelegramPricesFromText,
    totalPortfolioValueToman,
    totalPortfolioCostToman,
    totalPortfolioPnlToman,
    totalPortfolioPnlPercent,
  } = useFinance();

  // Sub-Navigation Tabs
  type SubTab = 'portfolio' | 'assets' | 'rates' | 'trades' | 'sources';
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('portfolio');

  // Zen / Terminal Mode state
  const [isTerminalMode, setIsTerminalMode] = useState(false);

  // Filter state for assets and rates
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [ratesSearchQuery, setRatesSearchQuery] = useState('');
  const [ratesFilter, setRatesFilter] = useState<'all' | 'enabled' | 'gold' | 'currency'>('all');
  const [displayUnit, setDisplayUnit] = useState<'toman' | 'rial'>('toman');

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradingAsset, setTradingAsset] = useState<Asset | null>(null);

  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [editingRateItem, setEditingRateItem] = useState<MarketPriceItem | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Manual Trigger for Live Refresh
  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const res = await refreshMarketPrices();
      setRefreshMessage(res.message);
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Dollar live price to compute USD equivalency
  const dollarPrice = useMemo(() => {
    const usdItem = marketPrices.find((p) => p.symbol === 'usd' || p.symbol === 'usdt');
    return usdItem && usdItem.priceToman > 0 ? usdItem.priceToman : 93500;
  }, [marketPrices]);

  const totalPortfolioValueUsd = totalPortfolioValueToman > 0 ? totalPortfolioValueToman / dollarPrice : 0;

  // Gold statistics
  const goldStats = useMemo(() => {
    let totalGoldValue = 0;
    let totalGrams = 0;
    for (const a of assets) {
      if (a.category === 'gold' || a.category === 'coin') {
        const item = marketPrices.find((m) => m.symbol === a.symbol);
        const curPrice = item ? item.priceToman : a.buyPriceAverage;
        totalGoldValue += a.quantity * curPrice;
        if (a.unit === 'گرم') {
          totalGrams += a.quantity;
        }
      }
    }
    const percentOfPortfolio =
      totalPortfolioValueToman > 0 ? (totalGoldValue / totalPortfolioValueToman) * 100 : 0;
    return { totalGoldValue, totalGrams, percentOfPortfolio };
  }, [assets, marketPrices, totalPortfolioValueToman]);

  // Currency statistics
  const currencyStats = useMemo(() => {
    let totalCurrencyValue = 0;
    let totalUsdCount = 0;
    for (const a of assets) {
      if (a.category === 'currency' || a.category === 'crypto') {
        const item = marketPrices.find((m) => m.symbol === a.symbol);
        const curPrice = item ? item.priceToman : a.buyPriceAverage;
        totalCurrencyValue += a.quantity * curPrice;
        if (a.unit === 'دلار' || a.unit === 'تتر') {
          totalUsdCount += a.quantity;
        }
      }
    }
    const percentOfPortfolio =
      totalPortfolioValueToman > 0 ? (totalCurrencyValue / totalPortfolioValueToman) * 100 : 0;
    return { totalCurrencyValue, totalUsdCount, percentOfPortfolio };
  }, [assets, marketPrices, totalPortfolioValueToman]);

  // Allocation data for Chart
  const allocationChartData = useMemo(() => {
    const map = new Map<AssetCategory, number>();
    for (const a of assets) {
      const item = marketPrices.find((m) => m.symbol === a.symbol);
      const val = a.quantity * (item ? item.priceToman : a.buyPriceAverage);
      map.set(a.category, (map.get(a.category) || 0) + val);
    }

    return Array.from(map.entries())
      .filter(([_, val]) => val > 0)
      .map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat] || cat,
        category: cat,
        value: val,
        color: CATEGORY_COLORS[cat] || '#8b5cf6',
      }));
  }, [assets, marketPrices]);

  // Only active/enabled rates (by default only USD and 18K Gold)
  const enabledMarketPrices = useMemo(
    () => marketPrices.filter((p) => p.isEnabled !== false),
    [marketPrices]
  );

  // Helper for displaying prices with either Toman or Rial
  const formatPriceWithUnit = (priceToman: number, itemUnit?: 'toman' | 'rial') => {
    const activeUnit = itemUnit || displayUnit;
    if (activeUnit === 'rial') {
      return {
        value: formatNumber(Math.round(priceToman * 10)),
        unit: 'ریال',
      };
    }
    return {
      value: formatNumber(priceToman),
      unit: 'تومان',
    };
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    if (assetCategoryFilter === 'all') return assets;
    return assets.filter((a) => a.category === assetCategoryFilter);
  }, [assets, assetCategoryFilter]);

  // Filtered Market Rates list
  const filteredMarketRates = useMemo(() => {
    let list = marketPrices;
    if (ratesFilter === 'enabled') {
      list = list.filter((p) => p.isEnabled !== false);
    } else if (ratesFilter === 'gold') {
      list = list.filter((p) => p.category === 'gold' || p.category === 'coin');
    } else if (ratesFilter === 'currency') {
      list = list.filter((p) => p.category === 'currency' || p.category === 'crypto');
    }

    if (ratesSearchQuery.trim()) {
      const q = ratesSearchQuery.toLowerCase().trim();
      list = list.filter(
        (item) => item.name.toLowerCase().includes(q) || item.symbol.toLowerCase().includes(q)
      );
    }
    return list;
  }, [marketPrices, ratesFilter, ratesSearchQuery]);

  return (
    <div
      className={`space-y-6 transition-all duration-300 ${
        isTerminalMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-950 p-4 sm:p-8 text-white'
          : 'relative'
      }`}
    >
      {/* 1. Live Market Ticker Marquee Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/20 backdrop-blur-md p-2 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2">
          {/* Header Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>نرخ‌های زنده</span>
          </div>

          {/* Active Count & Quick Config Badge */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold shrink-0 transition"
            title="مدیریت اقلام فعال و سورس‌ها"
          >
            <span>{enabledMarketPrices.length} فعال</span>
            <Sliders className="w-3 h-3" />
          </button>

          {/* Global Toman / Rial toggle for ticker */}
          <div className="flex items-center bg-white/70 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[10px] font-bold shrink-0">
            <button
              onClick={() => setDisplayUnit('toman')}
              className={`px-1.5 py-0.5 rounded-md transition ${
                displayUnit === 'toman'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => setDisplayUnit('rial')}
              className={`px-1.5 py-0.5 rounded-md transition ${
                displayUnit === 'rial'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ریال
            </button>
          </div>

          {/* Marquee list */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5 text-xs">
            {enabledMarketPrices.length > 0 ? (
              enabledMarketPrices.map((item) => {
                const change = item.change24h ?? 0;
                const formatted = formatPriceWithUnit(
                  item.priceToman,
                  item.displayCurrency || displayUnit
                );

                return (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      setEditingRateItem(item);
                      setIsEditRateModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800 hover:border-amber-500/40 transition group cursor-pointer"
                    title="کلیک برای تنظیم نرخ"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-500">
                      {item.name}:
                    </span>
                    <span className="font-mono font-black text-slate-900 dark:text-white dir-ltr">
                      {formatted.value}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatted.unit}</span>

                    {change !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1 rounded-sm dir-ltr flex items-center ${
                          change > 0
                            ? 'text-emerald-600 bg-emerald-500/10'
                            : 'text-rose-600 bg-rose-500/10'
                        }`}
                      >
                        {change > 0 ? '+' : ''}
                        {change.toFixed(1)}%
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                هیچ نرخی فعال نیست — جهت شخصی‌سازی و فعال‌سازی اقلام کلیک کنید
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Standalone VIP Terminal Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-white">
        {/* Shimmer Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black tracking-wide flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                ترمینال سرمایه‌گذاری و دارایی‌ها
              </span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {priceSourceConfig.sourceMode === 'telegram'
                    ? `سورس تلگرام ${priceSourceConfig.telegramChannelOrUrl}`
                    : priceSourceConfig.sourceMode === 'custom_api'
                    ? 'سورس سفارشی وب'
                    : 'نرخ لحظه‌ای بازار و نوبیتکس'}
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              مدیریت سبد طلا، سکه، دلار و دارایی‌ها
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              محاسبه لحظه‌ای ارزش روز دارایی‌ها، سود و زیان محقق‌نشده، توزیع ریسک و اتصال به سورس‌های تلگرام و وب‌سایت
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Quick Refresh */}
            <button
              onClick={handleRefreshRates}
              disabled={isRefreshing}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              title="به‌روزرسانی قیمت‌ها"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">به‌روزرسانی نرخ‌ها</span>
            </button>

            {/* Telegram Paste Button */}
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-xs"
              title="پیست متن مظنه از تلگرام"
            >
              <Send className="w-4 h-4 text-sky-400 -rotate-45" />
              <span>پیست پیام تلگرام</span>
            </button>

            {/* Price Sources Settings */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center gap-2 active:scale-95"
              title="پیکربندی سورس تلگرام و وب"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">تنظیمات سورس</span>
            </button>

            {/* Add Asset Button */}
            <button
              onClick={() => {
                setAssetToEdit(null);
                setIsAssetModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت دارایی جدید</span>
            </button>

            {/* Terminal Zen Mode Toggle */}
            <button
              onClick={() => setIsTerminalMode(!isTerminalMode)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 transition"
              title={isTerminalMode ? 'خروج از حالت تمام‌صفحه' : 'حالت ترمینال مستقل'}
            >
              {isTerminalMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {refreshMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{refreshMessage}</span>
          </div>
        )}
      </div>

      {/* 3. KPI Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold">ارزش کل سبد دارایی</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono dir-ltr text-right">
              {formatNumber(totalPortfolioValueToman)}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">
                تومان
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 dir-ltr text-right">
              ≈ {formatNumber(Math.round(totalPortfolioValueUsd))} USD $
            </div>
          </div>
        </div>

        {/* Card 2: Unrealized P&L */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold">سود / زیان کل سبد</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                totalPortfolioPnlToman >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {totalPortfolioPnlToman >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <div
              className={`text-xl font-black font-mono dir-ltr text-right ${
                totalPortfolioPnlToman >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalPortfolioPnlToman >= 0 ? '+' : ''}
              {formatNumber(totalPortfolioPnlToman)}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">
                تومان
              </span>
            </div>
            <div
              className={`text-xs font-mono font-bold dir-ltr text-right ${
                totalPortfolioPnlPercent >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalPortfolioPnlPercent >= 0 ? '+' : ''}
              {totalPortfolioPnlPercent.toFixed(1)}% بازدهی کل
            </div>
          </div>
        </div>

        {/* Card 3: Gold Share & Weight */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold">سهم طلا و مسکوکات</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono dir-ltr text-right">
              {formatNumber(goldStats.totalGoldValue)}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">
                تومان
              </span>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>{goldStats.percentOfPortfolio.toFixed(0)}% کل سبد</span>
              {goldStats.totalGrams > 0 && (
                <span className="font-mono">{goldStats.totalGrams} گرم طلا</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Currency & Crypto Share */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold">سهم دلار و کریپتو</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono dir-ltr text-right">
              {formatNumber(currencyStats.totalCurrencyValue)}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">
                تومان
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>{currencyStats.percentOfPortfolio.toFixed(0)}% کل سبد</span>
              {currencyStats.totalUsdCount > 0 && (
                <span className="font-mono">{formatNumber(currencyStats.totalUsdCount)} $</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('portfolio')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'portfolio'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>پرتفوی و تحلیل</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assets')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'assets'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>دارایی‌های من ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rates')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'rates'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>تابلوی زنده قیمت‌ها</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trades')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'trades'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>معاملات خرید و فروش ({assetTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sources')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'sources'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>سورس‌های قیمت</span>
          </button>
        </div>
      </div>

      {/* 5. Sub-Tab Content */}

      {/* Tab 1: Portfolio Overview & Allocation */}
      {activeSubTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Allocation Donut Chart */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ترکیب و توزیع سبد دارایی
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  درصد سهم هر دسته در کل سرمایه‌گذاری
                </p>
              </div>

              {allocationChartData.length > 0 ? (
                <div className="h-56 w-full my-3 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {allocationChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [`${formatNumber(val)} تومان`, 'ارزش روز']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  هنوز دارایی در سبد ثبت نشده است
                </div>
              )}

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {allocationChartData.map((item) => {
                  const pct =
                    totalPortfolioValueToman > 0 ? (item.value / totalPortfolioValueToman) * 100 : 0;
                  return (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-900 dark:text-white">{pct.toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-400">
                          ({formatNumber(item.value)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holdings Quick Summary Table & Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      بررسی اجمالی دارایی‌های ثبت شده
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      وضعیت سود و زیان هر قلم دارایی به تفکیک قیمت روز بازار
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('assets')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>مشاهده تمام جزئیات</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 pb-2">
                        <th className="py-2.5 px-3 font-bold">نام دارایی</th>
                        <th className="py-2.5 px-3 font-bold">موجودی</th>
                        <th className="py-2.5 px-3 font-bold">میانگین خرید</th>
                        <th className="py-2.5 px-3 font-bold">نرخ روز</th>
                        <th className="py-2.5 px-3 font-bold">ارزش روز</th>
                        <th className="py-2.5 px-3 font-bold text-left">بازدهی / سود</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {assets.map((asset) => {
                        const mPrice = marketPrices.find((p) => p.symbol === asset.symbol);
                        const curPrice = mPrice ? mPrice.priceToman : asset.buyPriceAverage;
                        const curVal = asset.quantity * curPrice;
                        const cost = asset.totalCost || asset.quantity * asset.buyPriceAverage;
                        const pnl = curVal - cost;
                        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

                        return (
                          <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: CATEGORY_COLORS[asset.category] }}
                                />
                                <span>{asset.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {formatNumber(asset.quantity)} {asset.unit}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {formatNumber(asset.buyPriceAverage)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {formatNumber(curPrice)}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                              {formatNumber(curVal)}
                            </td>
                            <td className="py-3 px-3 text-left dir-ltr">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                                  pnl >= 0
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {pnl >= 0 ? '+' : ''}
                                {pnlPct.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Assets Holdings Cards */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {(['all', 'gold', 'coin', 'currency', 'crypto', 'custom'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAssetCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    assetCategoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'all' ? 'همه دارایی‌ها' : CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setAssetToEdit(null);
                setIsAssetModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن دارایی</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const mPrice = marketPrices.find((p) => p.symbol === asset.symbol);
              const curPrice = mPrice ? mPrice.priceToman : asset.buyPriceAverage;
              const curVal = asset.quantity * curPrice;
              const cost = asset.totalCost || asset.quantity * asset.buyPriceAverage;
              const pnl = curVal - cost;
              const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

              return (
                <div
                  key={asset.id}
                  className="rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:border-amber-500/40 transition group"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: CATEGORY_COLORS[asset.category] || '#f59e0b' }}
                      >
                        {asset.category === 'gold' && <Gem className="w-5 h-5 text-slate-950" />}
                        {asset.category === 'coin' && <Coins className="w-5 h-5 text-slate-950" />}
                        {asset.category === 'currency' && (
                          <DollarSign className="w-5 h-5 text-slate-950" />
                        )}
                        {asset.category === 'crypto' && <span className="font-mono text-sm">₮</span>}
                        {asset.category === 'custom' && <Layers className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {asset.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">
                          {CATEGORY_LABELS[asset.category]}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded-full dir-ltr ${
                        pnl >= 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {pnl >= 0 ? '+' : ''}
                      {pnlPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Quantity & Value metrics */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">موجودی:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {formatNumber(asset.quantity)} {asset.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">نرخ روز بازار:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatNumber(curPrice)} تومان
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        ارزش روز کل:
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {formatNumber(curVal)} تومان
                      </span>
                    </div>
                  </div>

                  {/* PnL & Cost info */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
                    <span>
                      سود/زیان: {pnl >= 0 ? '+' : ''}
                      {formatNumber(pnl)} تومان
                    </span>
                    <span>خرید: {formatNumber(asset.buyPriceAverage)}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setTradingAsset(asset);
                        setIsTradeModalOpen(true);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-500/20"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>معامله (خرید/فروش)</span>
                    </button>

                    <button
                      onClick={() => {
                        setAssetToEdit(asset);
                        setIsAssetModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="ویرایش دارایی"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف دارایی «${asset.name}» مطمئن هستید؟`)) {
                          deleteAsset(asset.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="حذف دارایی"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Live Market Rates Board */}
      {activeSubTab === 'rates' && (
        <div className="space-y-4">
          {/* Information banner about Dollar & 18K Gold being active and others customizable */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>توجه:</strong> به‌طور پیش‌فرض فقط <strong>دلار آمریکا</strong> و <strong>طلای ۱۸ عیار</strong> فعال هستند. سایر اقلام خاموش‌اند اما با کلیک بر روی کلید سوئیچ هر سطر می‌توانید آن‌ها را شخصی‌سازی و روشن کنید. منبع دلار و طلا از تلگرام/وب اختصاصی و بقیه نرخ‌ها از سامانه <strong>tgju.org</strong> است.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 hover:bg-amber-600 transition shadow-xs flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>تنظیمات سورس‌ها</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ratesSearchQuery}
                  onChange={(e) => setRatesSearchQuery(e.target.value)}
                  placeholder="جستجوی طلا، سکه، دلار، تتر..."
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-xs">
                <button
                  onClick={() => setRatesFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  همه اقلام ({marketPrices.length})
                </button>
                <button
                  onClick={() => setRatesFilter('enabled')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1 ${
                    ratesFilter === 'enabled'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>فقط فعال‌ها ({enabledMarketPrices.length})</span>
                </button>
                <button
                  onClick={() => setRatesFilter('gold')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'gold'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  طلا و سکه
                </button>
                <button
                  onClick={() => setRatesFilter('currency')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'currency'
                      ? 'bg-emerald-500 text-white font-black shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  اسکناس و ارز
                </button>
              </div>
            </div>

            {/* Actions: Unit toggle + Telegram + Refresh */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              {/* Unit Toggle */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setDisplayUnit('toman')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    displayUnit === 'toman'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  تومان
                </button>
                <button
                  onClick={() => setDisplayUnit('rial')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    displayUnit === 'rial'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ریال
                </button>
              </div>

              <button
                onClick={() => setIsTelegramModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-600 dark:text-sky-300 text-xs font-bold transition flex items-center gap-1.5"
                title="استخراج نرخ‌ها از متن تلگرام"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span className="hidden sm:inline">پیست تلگرام</span>
              </button>

              <button
                onClick={handleRefreshRates}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی قیمت‌ها</span>
              </button>
            </div>
          </div>

          {/* Rates Table */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3 px-3 font-bold text-center">وضعیت</th>
                    <th className="py-3 px-4 font-bold">نام دارایی / نماد</th>
                    <th className="py-3 px-3 font-bold">دسته‌بندی</th>
                    <th className="py-3 px-4 font-bold">قیمت لحظه‌ای</th>
                    <th className="py-3 px-3 font-bold">تغییرات ۲۴ ساعته</th>
                    <th className="py-3 px-4 font-bold">سورس نرخ</th>
                    <th className="py-3 px-3 font-bold text-center">واحد نمایش</th>
                    <th className="py-3 px-3 font-bold text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredMarketRates.map((item) => {
                    const isItemEnabled = item.isEnabled !== false;
                    const change = item.change24h ?? 0;
                    const isDedicated = item.symbol === 'usd' || item.symbol === 'gold_18k';
                    const formatted = formatPriceWithUnit(
                      item.priceToman,
                      item.displayCurrency || displayUnit
                    );

                    return (
                      <tr
                        key={item.symbol}
                        className={`transition ${
                          isItemEnabled
                            ? 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                            : 'opacity-60 bg-slate-50/20 dark:bg-slate-950/20 hover:opacity-90'
                        }`}
                      >
                        {/* On / Off Toggle Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => toggleMarketPriceEnabled(item.symbol)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title={isItemEnabled ? 'کلیک برای غیرفعال‌سازی (خاموش)' : 'کلیک برای فعال‌سازی (روشن)'}
                          >
                            {isItemEnabled ? (
                              <ToggleRight className="w-6 h-6 text-emerald-500 hover:text-emerald-600 transition" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-400 hover:text-slate-600 transition" />
                            )}
                          </button>
                        </td>

                        {/* Name and Symbol */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {item.symbol}
                            </span>
                            <span>{item.name}</span>
                            {!isItemEnabled && (
                              <span className="text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.2 rounded font-normal">
                                خاموش
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </td>

                        {/* Current Price */}
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900 dark:text-white">
                          {formatted.value}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            {formatted.unit} / {item.unit}
                          </span>
                        </td>

                        {/* 24h Change */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md dir-ltr ${
                              change > 0
                                ? 'text-emerald-600 bg-emerald-500/10'
                                : change < 0
                                ? 'text-rose-600 bg-rose-500/10'
                                : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                            }`}
                          >
                            {change > 0 ? '+' : ''}
                            {change.toFixed(2)}%
                          </span>
                        </td>

                        {/* Source Badge */}
                        <td className="py-3.5 px-4 text-xs">
                          {isDedicated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20 text-[10px]">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>سورس اختصاصی ({priceSourceConfig.goldDollarSourceType === 'telegram' ? 'تلگرام' : 'سایت'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                              <Globe className="w-2.5 h-2.5" />
                              <span>سایت عمومی (tgju.org)</span>
                            </span>
                          )}
                        </td>

                        {/* Unit Switcher */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() =>
                              setMarketPriceDisplayUnit(
                                item.symbol,
                                (item.displayCurrency || displayUnit) === 'rial' ? 'toman' : 'rial'
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition border border-slate-200 dark:border-slate-700"
                            title="تغییر واحد نمایش بین تومان و ریال برای این قلم"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            <span>{(item.displayCurrency || displayUnit) === 'rial' ? 'ریال' : 'تومان'}</span>
                          </button>
                        </td>

                        {/* Edit Price Modal Button */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setEditingRateItem(item);
                              setIsEditRateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold transition border border-amber-500/20"
                          >
                            ویرایش نرخ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Trades Log */}
      {activeSubTab === 'trades' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تاریخچه معاملات خرید و فروش طلا و ارز
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  سوابق خرید، فروش و سودهای محقق شده سبد سرمایه‌گذاری
                </p>
              </div>
            </div>

            {assetTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 pb-2">
                      <th className="py-2.5 px-3 font-bold">نوع معامله</th>
                      <th className="py-2.5 px-3 font-bold">نام دارایی</th>
                      <th className="py-2.5 px-3 font-bold">مقدار</th>
                      <th className="py-2.5 px-3 font-bold">قیمت واحد</th>
                      <th className="py-2.5 px-3 font-bold">مبلغ کل معامله</th>
                      <th className="py-2.5 px-3 font-bold">سود محقق شده</th>
                      <th className="py-2.5 px-3 font-bold">تاریخ</th>
                      <th className="py-2.5 px-3 font-bold text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {assetTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                              tx.type === 'buy'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {tx.type === 'buy' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                            <span>{tx.type === 'buy' ? 'خرید' : 'فروش'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {tx.assetName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatNumber(tx.quantity)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {formatNumber(tx.unitPrice)} تومان
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                          {formatNumber(tx.totalAmount)} تومان
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {tx.realizedPnl !== undefined ? (
                            <span
                              className={
                                tx.realizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }
                            >
                              {tx.realizedPnl >= 0 ? '+' : ''}
                              {formatNumber(tx.realizedPnl)} تومان
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px] dir-ltr text-right">
                          {tx.date}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => deleteAssetTransaction(tx.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="حذف رکورد معامله"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                هنوز معامله‌ای در تاریخچه ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Sources Overview */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  مدیریت سورس‌های تلگرام، وب‌سایت و شخصی‌سازی اقلام
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تنظیم اختصاصی سورس دلار و طلای ۱۸ عیار، سامانه عمومی tgju.org و انتخاب واحدهای اعلامی/نمایش
                </p>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>پیکربندی کامل سورس‌ها و اقلام</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Dedicated Dollar & Gold */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    سورس اختصاصی دلار و طلا:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    {priceSourceConfig.goldDollarSourceType === 'telegram' ? 'کانال تلگرام' : 'وب‌سایت اختصاصی'}
                  </span>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate dir-ltr text-right">
                  {priceSourceConfig.goldDollarSourceType === 'telegram'
                    ? priceSourceConfig.goldDollarTelegramChannel || '@tala_dollar_live'
                    : priceSourceConfig.goldDollarWebsiteUrl || 'پیش‌فرض'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-amber-500/10">
                  <div className="flex justify-between">
                    <span>واحد اعلامی سورس:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {priceSourceConfig.goldDollarSourceUnit === 'toman'
                        ? 'تومان'
                        : priceSourceConfig.goldDollarSourceUnit === 'rial'
                        ? 'ریال'
                        : 'تشخیص خودکار'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>واحد نمایش در برنامه:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {priceSourceConfig.goldDollarDisplayUnit === 'rial' ? 'ریال' : 'تومان'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: General Source (tgju.org) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    سورس عمومی سایر نرخ‌ها:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold text-[10px]">
                    قابل تغییر
                  </span>
                </div>
                <div className="font-mono text-slate-900 dark:text-white text-xs truncate dir-ltr text-right">
                  {priceSourceConfig.generalMarketSourceUrl || 'https://www.tgju.org'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 leading-relaxed">
                  این سورس برای سایر اقلام (سکه، انس طلا، یورو و...) استفاده می‌شود و فقط زمانی که هر قلم را فعال کنید استعلام می‌گردد.
                </p>
              </div>

              {/* Card 3: Personalization & Refresh Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-bold">وضعیت شخصی‌سازی:</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                    {enabledMarketPrices.length} از {marketPrices.length} فعال
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {enabledMarketPrices.map((i) => i.name).join('، ')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <span>آخرین به‌روزرسانی:</span>
                    <span
                      className={`font-bold ${
                        priceSourceConfig.lastFetchStatus === 'success'
                          ? 'text-emerald-500'
                          : priceSourceConfig.lastFetchStatus === 'error'
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {priceSourceConfig.lastFetchStatus === 'success'
                        ? 'موفق'
                        : priceSourceConfig.lastFetchStatus === 'error'
                        ? 'خطا'
                        : 'آماده'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono dir-ltr text-right">
                    {priceSourceConfig.lastFetchTime || 'دستی'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" />
                قابلیت‌های شخصی‌سازی سورس و تبدیل نرخ:
              </span>
              <p className="leading-relaxed text-[11px]">
                اگر کانال یا سایت مظنه شما قیمت‌ها را به <strong>تومان</strong> اعلام می‌کند ولی ترجیح می‌دهید در برنامه به <strong>ریال</strong> نمایش یابد (یا برعکس)، سیستم به‌صورت بلادرنگ تبدیل ریاضی (ضرب یا تقسیم بر ۱۰) را انجام می‌دهد. همچنین می‌توانید هر زمان متن پیام مظنه کانال تلگرام را با کلیک بر روی دکمه «پیست پیام تلگرام» وارد کنید تا بدون نیاز به اتصال مستقیم اینترنتی به‌روز شود.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AssetModal
        isOpen={isAssetModalOpen}
        assetToEdit={assetToEdit}
        marketPrices={marketPrices}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetToEdit(null);
        }}
        onSave={(data) => {
          if (assetToEdit) {
            updateAsset({ ...data, id: assetToEdit.id, createdAt: assetToEdit.createdAt });
          } else {
            addAsset(data);
          }
        }}
      />

      <AssetTradeModal
        isOpen={isTradeModalOpen}
        asset={tradingAsset}
        marketPrices={marketPrices}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradingAsset(null);
        }}
        onExecuteTrade={(trade) => addAssetTransaction(trade)}
      />

      <TelegramPasteModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onApplyRates={(text) => applyTelegramPricesFromText(text)}
      />

      <PriceSourceSettingsModal
        isOpen={isSettingsModalOpen}
        config={priceSourceConfig}
        marketPrices={marketPrices}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveConfig={(cfg) => updatePriceSourceConfig(cfg)}
        onToggleItem={toggleMarketPriceEnabled}
        onRefreshNow={refreshMarketPrices}
      />

      <EditMarketPriceModal
        isOpen={isEditRateModalOpen}
        item={editingRateItem}
        onClose={() => {
          setIsEditRateModalOpen(false);
          setEditingRateItem(null);
        }}
        onSave={(symbol, newPrice) => updateMarketPrice(symbol, newPrice)}
      />
    </div>
  );
};

export default AssetsView;
