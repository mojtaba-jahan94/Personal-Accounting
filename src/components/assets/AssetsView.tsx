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
  MarketPriceItem,
} from '../../types';
import { formatNumber, toPersianDigits } from '../../utils/formatters';
import { LiquidGlassContainer } from '../common/LiquidGlassContainer';
import { AssetModal } from './AssetModal';
import { AssetTradeModal } from './AssetTradeModal';
import { TelegramPasteModal } from './TelegramPasteModal';
import { PriceSourceSettingsModal } from './PriceSourceSettingsModal';
import { EditMarketPriceModal } from './EditMarketPriceModal';

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  gold: '#A68A64', // Warm Wood
  coin: '#C2A882', // Brass / Light Wood
  currency: '#2E7D5B', // Nordic Sage Emerald
  crypto: '#4A6FA5', // Fjord Blue
  custom: '#6B7280', // Fjord Gray
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
        color: CATEGORY_COLORS[cat] || '#A68A64',
      }));
  }, [assets, marketPrices]);

  // Only active/enabled rates
  const enabledMarketPrices = useMemo(
    () => marketPrices.filter((p) => p.isEnabled !== false),
    [marketPrices]
  );

  // Helper for displaying prices with either Toman or Rial
  const getItemDisplayUnit = (item: MarketPriceItem): 'toman' | 'rial' => {
    if (item.displayCurrency && item.displayCurrency !== 'app_default') {
      return item.displayCurrency;
    }
    if (item.symbol === 'gold_18k' && priceSourceConfig.goldDisplayUnit && priceSourceConfig.goldDisplayUnit !== 'app_default') {
      return priceSourceConfig.goldDisplayUnit;
    }
    if (item.symbol === 'usd' && priceSourceConfig.dollarDisplayUnit && priceSourceConfig.dollarDisplayUnit !== 'app_default') {
      return priceSourceConfig.dollarDisplayUnit;
    }
    return displayUnit;
  };

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
          ? 'fixed inset-0 z-50 overflow-y-auto bg-[#1F2933] p-4 sm:p-8 text-[#F7F7F2]'
          : 'relative'
      }`}
    >
      {/* 1. Live Market Ticker Marquee Bar */}
      <div className="rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/70 border border-[#A68A64]/25 dark:border-[#A68A64]/30 backdrop-blur-md p-2 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2">
          {/* Header Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#A68A64] text-[#F7F7F2] font-black text-[11px] shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#F7F7F2] animate-ping" />
            <span>نرخ‌های زنده</span>
          </div>

          {/* Active Count & Quick Config Badge */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#A68A64]/10 hover:bg-[#A68A64]/20 border border-[#A68A64]/25 text-[#A68A64] text-[10px] font-bold shrink-0 transition"
            title="مدیریت اقلام فعال و سورس‌ها"
          >
            <span>{toPersianDigits(enabledMarketPrices.length)} فعال</span>
            <Sliders className="w-3 h-3" />
          </button>

          {/* Global Toman / Rial toggle for ticker */}
          <div className="flex items-center bg-[#F7F7F2] dark:bg-[#141B22] p-0.5 rounded-lg border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[10px] font-bold shrink-0">
            <button
              onClick={() => setDisplayUnit('toman')}
              className={`px-1.5 py-0.5 rounded-md transition ${
                displayUnit === 'toman'
                  ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => setDisplayUnit('rial')}
              className={`px-1.5 py-0.5 rounded-md transition ${
                displayUnit === 'rial'
                  ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
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
                  getItemDisplayUnit(item)
                );

                return (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      setEditingRateItem(item);
                      setIsEditRateModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-[#F7F7F2] dark:bg-[#141B22]/80 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/40 transition group cursor-pointer"
                    title="کلیک برای تنظیم نرخ"
                  >
                    <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB] group-hover:text-[#A68A64]">
                      {item.name}:
                    </span>
                    <span className="font-mono tabular-nums font-black text-[#1F2933] dark:text-[#F7F7F2] dir-ltr">
                      {formatted.value}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">{formatted.unit}</span>

                    {change !== 0 && (
                      <span
                        className={`text-[10px] font-mono tabular-nums font-bold px-1 rounded-sm dir-ltr flex items-center ${
                          change > 0
                            ? 'text-[#2E7D5B] dark:text-[#4ADE80] bg-[#2E7D5B]/10'
                            : 'text-[#C0564B] dark:text-[#F87171] bg-[#C0564B]/10'
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
                className="text-xs text-[#A68A64] font-bold hover:underline"
              >
                هیچ نرخی فعال نیست — جهت شخصی‌سازی و فعال‌سازی اقلام کلیک کنید
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Portfolio Hero Banner */}
      <LiquidGlassContainer
        className="rounded-3xl border border-[#A68A64]/30 p-6 sm:p-8 shadow-lg dark:shadow-2xl bg-gradient-to-br from-white via-[#F7F7F2] to-[#EAE4DC] text-[#1F2933] dark:from-[#1F2933] dark:via-[#141B22] dark:to-[#1F2933] dark:text-[#F7F7F2] relative overflow-hidden"
      >
        {/* Soft Ambient Radiance */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A68A64]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2E7D5B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#A68A64]/20 text-[#A68A64] dark:text-[#C2A882] border border-[#A68A64]/30 text-[11px] font-black tracking-wide flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-[#A68A64] dark:text-[#C2A882]" />
                  پرتفوی دارایی‌های سرمایه‌گذاری
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E7D5B]/15 dark:bg-[#2E7D5B]/20 border border-[#2E7D5B]/30 text-[#2E7D5B] dark:text-[#4ADE80] text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D5B] dark:bg-[#4ADE80] animate-pulse" />
                  <span>
                    سورس‌ها: {priceSourceConfig.dollarTelegramChannel || '@tgju_org'}
                  </span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight">
                مدیریت سبد طلا، سکه، ارز و سرمایه‌گذاری
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/80 max-w-2xl leading-relaxed">
                ارزش روز دارایی‌ها، سود و زیان محقق‌نشده، توزیع ریسک و اتصال لحظه‌ای به منابع مظنه بازار
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Add Asset */}
              <button
                onClick={() => {
                  setAssetToEdit(null);
                  setIsAssetModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs transition shadow-lg shadow-[#A68A64]/20 flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ثبت دارایی جدید</span>
              </button>

              {/* Trade Action */}
              <button
                onClick={() => {
                  setTradingAsset(assets[0] || null);
                  setIsTradeModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-[#F7F7F2]/10 dark:hover:bg-[#F7F7F2]/15 border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#A68A64] dark:text-[#C2A882]" />
                <span>ثبت خرید/فروش</span>
              </button>

              {/* Live Refresh */}
              <button
                onClick={handleRefreshRates}
                disabled={isRefreshing}
                className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-[#F7F7F2]/10 dark:hover:bg-[#F7F7F2]/15 border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                title="به‌روزرسانی قیمت‌ها"
              >
                <RefreshCw className={`w-4 h-4 text-[#A68A64] dark:text-[#C2A882] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">بروزرسانی آنلاین نرخ‌ها</span>
              </button>

              {/* Telegram Paste Button */}
              <button
                onClick={() => setIsTelegramModalOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4A6FA5]/15 hover:bg-[#4A6FA5]/25 dark:bg-[#4A6FA5]/25 dark:hover:bg-[#4A6FA5]/35 border border-[#4A6FA5]/30 dark:border-[#4A6FA5]/40 text-[#4A6FA5] dark:text-[#60A5FA] text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="پیست متن مظنه از تلگرام"
              >
                <Send className="w-4 h-4 text-[#4A6FA5] dark:text-[#60A5FA] -rotate-45" />
                <span>خواندن از تلگرام</span>
              </button>

              {/* Price Sources Settings */}
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-[#F7F7F2]/10 dark:hover:bg-[#F7F7F2]/15 border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-[#6B7280] dark:text-[#D1D5DB] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                title="تنظیمات منابع قیمت"
              >
                <Sliders className="w-4 h-4 text-[#A68A64] dark:text-[#C2A882]" />
                <span className="hidden sm:inline">تنظیمات منابع قیمت</span>
              </button>

              {/* Terminal Zen Mode Toggle */}
              <button
                onClick={() => setIsTerminalMode(!isTerminalMode)}
                className="p-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-[#F7F7F2]/10 dark:hover:bg-[#F7F7F2]/15 border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-[#6B7280] dark:text-[#D1D5DB] transition"
                title={isTerminalMode ? 'خروج از حالت تمام‌صفحه' : 'حالت ترمینال مستقل'}
              >
                {isTerminalMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hero 3-Pillar Valuation KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
            {/* 1. Total Market Value */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#F7F7F2]/10 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 space-y-1">
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 font-medium">ارزش روز کل دارایی‌ها</span>
              <div className="text-2xl font-black font-mono tabular-nums text-[#1F2933] dark:text-[#F7F7F2] dir-ltr text-right">
                {formatNumber(totalPortfolioValueToman)}
                <span className="text-xs font-sans font-bold text-[#6B7280] dark:text-[#D1D5DB]/70 mr-1.5">تومان</span>
              </div>
              <div className="text-xs font-mono tabular-nums font-bold text-[#A68A64] dir-ltr text-right">
                ≈ {formatNumber(Math.round(totalPortfolioValueUsd))} USD $
              </div>
            </div>

            {/* 2. Total Buy Cost */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#F7F7F2]/10 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 space-y-1">
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 font-medium">بهای تمام‌شده کل دارایی‌ها</span>
              <div className="text-2xl font-black font-mono tabular-nums text-[#1F2933] dark:text-[#F7F7F2] dir-ltr text-right">
                {formatNumber(totalPortfolioCostToman)}
                <span className="text-xs font-sans font-bold text-[#6B7280] dark:text-[#D1D5DB]/70 mr-1.5">تومان</span>
              </div>
              <div className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/60">
                مجموع سرمایه اولیه اختصاص داده شده
              </div>
            </div>

            {/* 3. Total Profit / Loss */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#F7F7F2]/10 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 space-y-1">
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 font-medium">سود / زیان کل سبد</span>
              <div
                className={`text-2xl font-black font-mono tabular-nums dir-ltr text-right ${
                  totalPortfolioPnlToman >= 0 ? 'text-[#2E7D5B] dark:text-[#4ADE80]' : 'text-[#C0564B] dark:text-[#F87171]'
                }`}
              >
                {totalPortfolioPnlToman >= 0 ? '+' : ''}
                {formatNumber(totalPortfolioPnlToman)}
                <span className="text-xs font-sans font-bold text-[#6B7280] dark:text-[#D1D5DB]/70 mr-1.5">تومان</span>
              </div>
              <div
                className={`text-xs font-mono tabular-nums font-bold dir-ltr text-right flex items-center justify-end gap-1 ${
                  totalPortfolioPnlPercent >= 0 ? 'text-[#2E7D5B] dark:text-[#4ADE80]' : 'text-[#C0564B] dark:text-[#F87171]'
                }`}
              >
                {totalPortfolioPnlPercent >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {totalPortfolioPnlPercent >= 0 ? '+' : ''}
                  {totalPortfolioPnlPercent.toFixed(1)}% بازدهی
                </span>
              </div>
            </div>
          </div>
        </div>

        {refreshMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#2E7D5B]/20 border border-[#2E7D5B]/30 text-[#4ADE80] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>{refreshMessage}</span>
          </div>
        )}
      </LiquidGlassContainer>

      {/* 3. Gold & Currency Asset Share Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gold Share & Weight */}
        <div className="p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
            <span className="font-bold">سهم طلا و مسکوکات</span>
            <div className="w-8 h-8 rounded-xl bg-[#A68A64]/15 text-[#A68A64] flex items-center justify-center">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-[#1F2933] dark:text-[#F7F7F2] font-mono tabular-nums dir-ltr text-right">
              {formatNumber(goldStats.totalGoldValue)}
              <span className="text-xs font-bold text-[#6B7280] dark:text-[#D1D5DB]/70 mr-1.5">
                تومان
              </span>
            </div>
            <div className="text-xs font-bold text-[#A68A64] flex items-center justify-between">
              <span>{toPersianDigits(goldStats.percentOfPortfolio.toFixed(0))}٪ کل سبد</span>
              {goldStats.totalGrams > 0 && (
                <span className="font-mono tabular-nums">{toPersianDigits(goldStats.totalGrams)} گرم طلا</span>
              )}
            </div>
          </div>
        </div>

        {/* Currency & Crypto Share */}
        <div className="p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
            <span className="font-bold">سهم ارز، دلار و تتر</span>
            <div className="w-8 h-8 rounded-xl bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-[#1F2933] dark:text-[#F7F7F2] font-mono tabular-nums dir-ltr text-right">
              {formatNumber(currencyStats.totalCurrencyValue)}
              <span className="text-xs font-bold text-[#6B7280] dark:text-[#D1D5DB]/70 mr-1.5">
                تومان
              </span>
            </div>
            <div className="text-xs font-bold text-[#2E7D5B] dark:text-[#4ADE80] flex items-center justify-between">
              <span>{toPersianDigits(currencyStats.percentOfPortfolio.toFixed(0))}٪ کل سبد</span>
              {currencyStats.totalUsdCount > 0 && (
                <span className="font-mono tabular-nums">{formatNumber(currencyStats.totalUsdCount)} $</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 pb-3 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('portfolio')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'portfolio'
                ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20 font-black'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>پرتفوی و تحلیل</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assets')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'assets'
                ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20 font-black'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>دارایی‌های من ({toPersianDigits(assets.length)})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rates')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'rates'
                ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20 font-black'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>تابلوی زنده قیمت‌ها</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trades')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'trades'
                ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20 font-black'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10'
            }`}
          >
            <History className="w-4 h-4" />
            <span>معاملات خرید و فروش ({toPersianDigits(assetTransactions.length)})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sources')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'sources'
                ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20 font-black'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تنظیمات سورس‌ها</span>
          </button>
        </div>
      </div>

      {/* 5. Sub-Tab Content */}

      {/* Tab 1: Portfolio Overview & Allocation */}
      {activeSubTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Allocation Donut Chart */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs flex flex-col justify-between">
              <div className="space-y-1 pb-2 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                <h3 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  ترکیب و توزیع سبد دارایی
                </h3>
                <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
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
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  هنوز دارایی در سبد ثبت نشده است
                </div>
              )}

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
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
                        <span className="text-[#1F2933] dark:text-[#D1D5DB]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-[#1F2933] dark:text-[#F7F7F2]">{toPersianDigits(pct.toFixed(1))}٪</span>
                        <span className="text-[10px] text-[#6B7280]">
                          ({formatNumber(item.value)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holdings Quick Summary Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                      بررسی اجمالی دارایی‌های ثبت شده
                    </h3>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
                      وضعیت سود و زیان هر قلم دارایی به تفکیک قیمت روز بازار
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('assets')}
                    className="text-xs font-bold text-[#A68A64] hover:underline flex items-center gap-1"
                  >
                    <span>مشاهده تمام جزئیات</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#6B7280] dark:text-[#D1D5DB]/70 pb-2">
                        <th className="py-2.5 px-3 font-bold">نام دارایی</th>
                        <th className="py-2.5 px-3 font-bold">موجودی</th>
                        <th className="py-2.5 px-3 font-bold">میانگین خرید</th>
                        <th className="py-2.5 px-3 font-bold">نرخ روز</th>
                        <th className="py-2.5 px-3 font-bold">ارزش روز</th>
                        <th className="py-2.5 px-3 font-bold text-left">بازدهی / سود</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#6B7280]/10 dark:divide-[#D1D5DB]/10">
                      {assets.map((asset) => {
                        const mPrice = marketPrices.find((p) => p.symbol === asset.symbol);
                        const curPrice = mPrice ? mPrice.priceToman : asset.buyPriceAverage;
                        const curVal = asset.quantity * curPrice;
                        const cost = asset.totalCost || asset.quantity * asset.buyPriceAverage;
                        const pnl = curVal - cost;
                        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

                        return (
                          <tr key={asset.id} className="hover:bg-[#6B7280]/5 dark:hover:bg-[#D1D5DB]/5 transition">
                            <td className="py-3 px-3 font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: CATEGORY_COLORS[asset.category] || '#A68A64' }}
                                />
                                <span>{asset.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums text-[#1F2933] dark:text-[#D1D5DB]">
                              {formatNumber(asset.quantity)} {asset.unit}
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums text-[#6B7280] dark:text-[#D1D5DB]/70">
                              {formatNumber(asset.buyPriceAverage)} تومان
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#A68A64]">
                              {formatNumber(curPrice)} تومان
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums font-black text-[#1F2933] dark:text-[#F7F7F2]">
                              {formatNumber(curVal)} تومان
                            </td>
                            <td className="py-3 px-3 text-left">
                              <span
                                className={`font-mono tabular-nums font-bold text-[11px] px-2 py-0.5 rounded-full dir-ltr inline-block ${
                                  pnl >= 0
                                    ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] dark:text-[#4ADE80]'
                                    : 'bg-[#C0564B]/10 text-[#C0564B] dark:text-[#F87171]'
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

      {/* Tab 2: Asset Holdings Cards */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setAssetCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  assetCategoryFilter === 'all'
                    ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                    : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                }`}
              >
                همه دسته‌ها ({toPersianDigits(assets.length)})
              </button>

              {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAssetCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    assetCategoryFilter === cat
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setAssetToEdit(null);
                setIsAssetModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن دارایی</span>
            </button>
          </div>

          {/* Holdings Grid */}
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
                  className="p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex flex-col justify-between gap-3 shadow-xs hover:border-[#A68A64]/30 transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: CATEGORY_COLORS[asset.category] || '#A68A64' }}
                      >
                        {asset.category === 'gold' && <Gem className="w-5 h-5 text-[#F7F7F2]" />}
                        {asset.category === 'coin' && <Coins className="w-5 h-5 text-[#F7F7F2]" />}
                        {asset.category === 'currency' && (
                          <DollarSign className="w-5 h-5 text-[#F7F7F2]" />
                        )}
                        {asset.category === 'crypto' && <span className="font-mono text-sm">₮</span>}
                        {asset.category === 'custom' && <Layers className="w-5 h-5 text-[#F7F7F2]" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                          {asset.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#6B7280]">
                          {CATEGORY_LABELS[asset.category]}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono tabular-nums font-black px-2 py-0.5 rounded-full dir-ltr ${
                        pnl >= 0
                          ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/20'
                          : 'bg-[#C0564B]/10 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/20'
                      }`}
                    >
                      {pnl >= 0 ? '+' : ''}
                      {pnlPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Quantity & Value metrics */}
                  <div className="p-3 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7280]">موجودی:</span>
                      <span className="font-mono tabular-nums font-black text-[#1F2933] dark:text-[#F7F7F2]">
                        {formatNumber(asset.quantity)} {asset.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7280]">نرخ روز بازار:</span>
                      <button
                        onClick={() => {
                          if (mPrice) {
                            setEditingRateItem(mPrice);
                            setIsEditRateModalOpen(true);
                          }
                        }}
                        className="font-mono tabular-nums font-bold text-[#A68A64] hover:underline flex items-center gap-1"
                        title="ویرایش قیمت این قلم"
                      >
                        <span>{formatNumber(curPrice)} تومان</span>
                        <Edit2 className="w-3 h-3 text-[#A68A64]" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                      <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                        ارزش روز کل:
                      </span>
                      <span className="font-mono tabular-nums font-black text-sm text-[#1F2933] dark:text-[#F7F7F2]">
                        {formatNumber(curVal)} تومان
                      </span>
                    </div>
                  </div>

                  {/* PnL & Cost info */}
                  <div className="flex justify-between items-center text-[11px] text-[#6B7280] px-1">
                    <span>
                      سود/زیان: {pnl >= 0 ? '+' : ''}
                      {formatNumber(pnl)} تومان
                    </span>
                    <span>خرید: {formatNumber(asset.buyPriceAverage)}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                    <button
                      onClick={() => {
                        setTradingAsset(asset);
                        setIsTradeModalOpen(true);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-[#A68A64]/10 hover:bg-[#A68A64]/20 text-[#A68A64] text-xs font-bold transition flex items-center justify-center gap-1 border border-[#A68A64]/20"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>معامله (خرید/فروش)</span>
                    </button>

                    <button
                      onClick={() => {
                        setAssetToEdit(asset);
                        setIsAssetModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 dark:hover:bg-[#D1D5DB]/10 transition"
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
                      className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#C0564B] hover:bg-[#C0564B]/10 transition"
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
          <div className="p-3.5 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/20 text-xs text-[#1F2933] dark:text-[#D1D5DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A68A64] shrink-0" />
              <span>
                <strong>توجه:</strong> به‌طور پیش‌فرض فقط <strong>دلار آمریکا</strong> و <strong>طلای ۱۸ عیار</strong> فعال هستند. سایر اقلام را می‌توانید با کلید سوئیچ شخصی‌سازی و روشن نمایید.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-[#A68A64] text-[#F7F7F2] font-black text-[11px] shrink-0 hover:bg-[#8A704C] transition shadow-xs flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>تنظیمات سورس‌ها</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={ratesSearchQuery}
                  onChange={(e) => setRatesSearchQuery(e.target.value)}
                  placeholder="جستجوی طلا، سکه، دلار، تتر..."
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-[#F7F7F2] dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] focus:outline-hidden focus:ring-2 focus:ring-[#A68A64]/30"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-xs">
                <button
                  onClick={() => setRatesFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'all'
                      ? 'bg-[#1F2933] dark:bg-[#F7F7F2] text-[#F7F7F2] dark:text-[#1F2933] shadow-xs'
                      : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                  }`}
                >
                  همه اقلام ({toPersianDigits(marketPrices.length)})
                </button>
                <button
                  onClick={() => setRatesFilter('enabled')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1 ${
                    ratesFilter === 'enabled'
                      ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                      : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] dark:bg-[#4ADE80]" />
                  <span>فقط فعال‌ها ({toPersianDigits(enabledMarketPrices.length)})</span>
                </button>
                <button
                  onClick={() => setRatesFilter('gold')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'gold'
                      ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                      : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                  }`}
                >
                  طلا و سکه
                </button>
                <button
                  onClick={() => setRatesFilter('currency')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    ratesFilter === 'currency'
                      ? 'bg-[#2E7D5B] text-[#F7F7F2] font-black shadow-xs'
                      : 'bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 text-[#6B7280] dark:text-[#D1D5DB] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10'
                  }`}
                >
                  اسکناس و ارز
                </button>
              </div>
            </div>

            {/* Actions: Unit toggle + Telegram + Refresh */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              {/* Unit Toggle */}
              <div className="flex items-center bg-[#F7F7F2] dark:bg-[#141B22] p-1 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold">
                <button
                  onClick={() => setDisplayUnit('toman')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    displayUnit === 'toman'
                      ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB]/70'
                  }`}
                >
                  تومان
                </button>
                <button
                  onClick={() => setDisplayUnit('rial')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    displayUnit === 'rial'
                      ? 'bg-[#A68A64] text-[#F7F7F2] font-black shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB]/70'
                  }`}
                >
                  ریال
                </button>
              </div>

              <button
                onClick={() => setIsTelegramModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#4A6FA5]/15 hover:bg-[#4A6FA5]/25 border border-[#4A6FA5]/30 text-[#4A6FA5] dark:text-[#60A5FA] text-xs font-bold transition flex items-center gap-1.5"
                title="استخراج نرخ‌ها از متن تلگرام"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span className="hidden sm:inline">پیست تلگرام</span>
              </button>

              <button
                onClick={handleRefreshRates}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی قیمت‌ها</span>
              </button>
            </div>
          </div>

          {/* Rates Table */}
          <div className="rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#6B7280] dark:text-[#D1D5DB]/70 bg-[#6B7280]/5 dark:bg-[#D1D5DB]/5">
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
                <tbody className="divide-y divide-[#6B7280]/10 dark:divide-[#D1D5DB]/10">
                  {filteredMarketRates.map((item) => {
                    const isItemEnabled = item.isEnabled !== false;
                    const change = item.change24h ?? 0;
                    const isDedicated = item.symbol === 'usd' || item.symbol === 'gold_18k';
                    const formatted = formatPriceWithUnit(
                      item.priceToman,
                      getItemDisplayUnit(item)
                    );

                    return (
                      <tr
                        key={item.symbol}
                        className={`transition ${
                          isItemEnabled
                            ? 'hover:bg-[#6B7280]/5 dark:hover:bg-[#D1D5DB]/5'
                            : 'opacity-60 bg-[#6B7280]/5 dark:bg-[#141B22]/30 hover:opacity-90'
                        }`}
                      >
                        {/* On / Off Toggle Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => toggleMarketPriceEnabled(item.symbol)}
                            className="p-1 rounded-lg hover:bg-[#6B7280]/10 transition"
                            title={isItemEnabled ? 'کلیک برای غیرفعال‌سازی (خاموش)' : 'کلیک برای فعال‌سازی (روشن)'}
                          >
                            {isItemEnabled ? (
                              <ToggleRight className="w-6 h-6 text-[#2E7D5B] dark:text-[#4ADE80] transition" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-[#6B7280] transition" />
                            )}
                          </button>
                        </td>

                        {/* Name and Symbol */}
                        <td className="py-3.5 px-4 font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#6B7280] uppercase bg-[#6B7280]/10 dark:bg-[#D1D5DB]/10 px-1.5 py-0.5 rounded">
                              {item.symbol}
                            </span>
                            <span>{item.name}</span>
                            {!isItemEnabled && (
                              <span className="text-[10px] text-[#6B7280] bg-[#6B7280]/10 px-1.5 py-0.2 rounded font-normal">
                                خاموش
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-[#6B7280] dark:text-[#D1D5DB]/70">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </td>

                        {/* Current Price */}
                        <td className="py-3.5 px-4 font-mono tabular-nums font-black text-sm text-[#1F2933] dark:text-[#F7F7F2]">
                          {formatted.value}{' '}
                          <span className="text-[10px] font-normal text-[#6B7280]">
                            {formatted.unit} / {item.unit}
                          </span>
                        </td>

                        {/* 24h Change */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 font-mono tabular-nums font-bold px-2 py-0.5 rounded-md dir-ltr ${
                              change > 0
                                ? 'text-[#2E7D5B] dark:text-[#4ADE80] bg-[#2E7D5B]/10'
                                : change < 0
                                ? 'text-[#C0564B] dark:text-[#F87171] bg-[#C0564B]/10'
                                : 'text-[#6B7280] bg-[#6B7280]/10'
                            }`}
                          >
                            {change > 0 ? '+' : ''}
                            {change.toFixed(2)}%
                          </span>
                        </td>

                        {/* Source Badge */}
                        <td className="py-3.5 px-4 text-xs">
                          {isDedicated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#A68A64]/10 text-[#A68A64] font-bold border border-[#A68A64]/20 text-[10px]">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>
                                {item.symbol === 'gold_18k'
                                  ? `کانال طلا (${priceSourceConfig.goldSourceType === 'telegram' ? 'تلگرام' : 'سایت'})`
                                  : `کانال دلار (${priceSourceConfig.dollarSourceType === 'telegram' ? 'تلگرام' : 'سایت'})`}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB] text-[10px]">
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
                                getItemDisplayUnit(item) === 'rial' ? 'toman' : 'rial'
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F7F7F2] dark:bg-[#141B22] hover:bg-[#A68A64]/15 hover:text-[#A68A64] text-[#1F2933] dark:text-[#D1D5DB] text-[11px] font-bold transition border border-[#6B7280]/15 dark:border-[#D1D5DB]/10"
                            title="تغییر واحد نمایش بین تومان و ریال برای این قلم"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            <span>{getItemDisplayUnit(item) === 'rial' ? 'ریال' : 'تومان'}</span>
                          </button>
                        </td>

                        {/* Edit Price Modal Button */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setEditingRateItem(item);
                              setIsEditRateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-[#A68A64]/10 hover:bg-[#A68A64]/20 text-[#A68A64] text-[11px] font-bold transition border border-[#A68A64]/20"
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
          <div className="p-6 rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  تاریخچه معاملات خرید و فروش طلا و ارز
                </h3>
                <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
                  سوابق خرید، فروش و سودهای محقق شده سبد سرمایه‌گذاری
                </p>
              </div>
            </div>

            {assetTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#6B7280] dark:text-[#D1D5DB]/70 pb-2">
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
                  <tbody className="divide-y divide-[#6B7280]/10 dark:divide-[#D1D5DB]/10">
                    {assetTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#6B7280]/5 dark:hover:bg-[#D1D5DB]/5 transition">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                              tx.type === 'buy'
                                ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/20'
                                : 'bg-[#C0564B]/10 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/20'
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
                        <td className="py-3 px-3 font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                          {tx.assetName}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                          {formatNumber(tx.quantity)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-[#6B7280] dark:text-[#D1D5DB]/70">
                          {formatNumber(tx.unitPrice)} تومان
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-black text-[#1F2933] dark:text-[#F7F7F2]">
                          {formatNumber(tx.totalAmount)} تومان
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-bold">
                          {tx.realizedPnl !== undefined ? (
                            <span
                              className={
                                tx.realizedPnl >= 0
                                  ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                                  : 'text-[#C0564B] dark:text-[#F87171]'
                              }
                            >
                              {tx.realizedPnl >= 0 ? '+' : ''}
                              {formatNumber(tx.realizedPnl)} تومان
                            </span>
                          ) : (
                            <span className="text-[#6B7280]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-[#6B7280] text-[11px] dir-ltr text-right">
                          {toPersianDigits(tx.date)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => deleteAssetTransaction(tx.id)}
                            className="p-1 rounded-lg text-[#6B7280] hover:text-[#C0564B] transition"
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
              <div className="py-12 text-center text-xs text-[#6B7280]">
                هنوز معامله‌ای در تاریخچه ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Sources Overview */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
              <div>
                <h3 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A68A64]" />
                  مدیریت سورس‌های تلگرام، وب‌سایت و شخصی‌سازی اقلام
                </h3>
                <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
                  تنظیم اختصاصی سورس دلار و طلای ۱۸ عیار، سامانه عمومی tgju.org و انتخاب واحدهای اعلامی/نمایش
                </p>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>پیکربندی کامل سورس‌ها و اقلام</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Card 1: Dedicated Dollar */}
              <div className="p-4 rounded-2xl bg-[#2E7D5B]/5 border border-[#2E7D5B]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#2E7D5B] dark:text-[#4ADE80] font-bold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    سورس دلار آمریکا (USD):
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2E7D5B]/20 text-[#2E7D5B] dark:text-[#4ADE80] font-bold text-[10px]">
                    {priceSourceConfig.dollarSourceType === 'telegram' ? 'کانال تلگرام' : 'وب‌سایت'}
                  </span>
                </div>
                <div className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-xs truncate dir-ltr text-right">
                  {priceSourceConfig.dollarTelegramChannel || '@tgju_org'}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 space-y-0.5 pt-1 border-t border-[#2E7D5B]/10">
                  <div className="flex justify-between">
                    <span>واحد کانال:</span>
                    <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                      {priceSourceConfig.dollarSourceUnit === 'rial' ? 'ریال' : 'تومان'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>نمایش در برنامه:</span>
                    <span className="font-bold text-[#2E7D5B] dark:text-[#4ADE80]">
                      {priceSourceConfig.dollarDisplayUnit === 'rial' ? 'ریال' : 'تومان'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dedicated Gold 18k */}
              <div className="p-4 rounded-2xl bg-[#A68A64]/5 border border-[#A68A64]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#A68A64] font-bold flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-[#A68A64]" />
                    سورس طلای ۱۸ عیار:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#A68A64]/20 text-[#A68A64] font-bold text-[10px]">
                    {priceSourceConfig.goldSourceType === 'telegram' ? 'کانال تلگرام' : 'وب‌سایت'}
                  </span>
                </div>
                <div className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-xs truncate dir-ltr text-right">
                  {priceSourceConfig.goldTelegramChannel || '@tgju_org'}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 space-y-0.5 pt-1 border-t border-[#A68A64]/10">
                  <div className="flex justify-between">
                    <span>واحد کانال:</span>
                    <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                      {priceSourceConfig.goldSourceUnit === 'rial' ? 'ریال' : 'تومان'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>نمایش در برنامه:</span>
                    <span className="font-bold text-[#A68A64]">
                      {priceSourceConfig.goldDisplayUnit === 'rial' ? 'ریال' : 'تومان'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: General Source (tgju.org) */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/50 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#1F2933] dark:text-[#D1D5DB] font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#4A6FA5]" />
                    سورس عمومی سایر نرخ‌ها:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA] font-bold text-[10px]">
                    سایر اقلام
                  </span>
                </div>
                <div className="font-mono text-[#1F2933] dark:text-[#F7F7F2] text-xs truncate dir-ltr text-right">
                  {priceSourceConfig.generalMarketSourceUrl || 'https://www.tgju.org'}
                </div>
                <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 leading-relaxed">
                  سایر اقلام (سکه، انس، یورو و...) تنها در صورت روشن شدن از این سایت استعلام می‌شوند.
                </p>
              </div>

              {/* Card 4: Personalization & Refresh Status */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/50 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#1F2933] dark:text-[#D1D5DB] font-bold">وضعیت اقلام سبد:</span>
                  <span className="font-mono tabular-nums font-black text-[#A68A64] text-xs">
                    {toPersianDigits(enabledMarketPrices.length)} از {toPersianDigits(marketPrices.length)} فعال
                  </span>
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 truncate">
                  {enabledMarketPrices.map((i) => i.name).join('، ')}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 space-y-0.5 pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                  <div className="flex justify-between items-center">
                    <span>آخرین به‌روزرسانی:</span>
                    <span
                      className={`font-bold ${
                        priceSourceConfig.lastFetchStatus === 'success'
                          ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                          : priceSourceConfig.lastFetchStatus === 'error'
                          ? 'text-[#C0564B] dark:text-[#F87171]'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      {priceSourceConfig.lastFetchStatus === 'success'
                        ? 'موفق'
                        : priceSourceConfig.lastFetchStatus === 'error'
                        ? 'خطا'
                        : 'آماده'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-mono tabular-nums dir-ltr text-right">
                    {priceSourceConfig.lastFetchTime || 'دستی'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/20 text-xs text-[#1F2933] dark:text-[#D1D5DB] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#A68A64]" />
                قابلیت‌های کانال‌های مجزا و تبدیل نرخ:
              </span>
              <p className="leading-relaxed text-[11px]">
                شما می‌توانید برای <strong>دلار آمریکا</strong> و <strong>طلای ۱۸ عیار</strong> دو کانال تلگرامی مجزا با واحدهای اعلامی متفاوت (یکی به تومان و دیگری به ریال) تعریف کنید و نحوه نمایش هر کدام را در برنامه شخصی‌سازی نمایید.
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
        onApplyRates={(text, unit) => applyTelegramPricesFromText(text, unit)}
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
