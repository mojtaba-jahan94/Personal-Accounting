import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AssetHolding, MarketRate } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { AssetModal } from './AssetModal';
import { MarketSourceModal } from './MarketSourceModal';
import { ManualRateModal } from './ManualRateModal';
import { SellAssetModal } from './SellAssetModal';
import { MarketRatesCustomizeModal } from './MarketRatesCustomizeModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import {
  Coins,
  TrendingUp,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  Radio,
  SlidersHorizontal,
  Layers,
  ArrowDownLeft,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const RATES_ORDER_KEY = 'pf_market_rates_custom_order_v1';
const RATES_HIDDEN_KEY = 'pf_market_rates_hidden_v1';

export const InvestmentsView: React.FC = () => {
  const { assets, marketRates, currency, deleteAsset, refreshMarketRates, setManualRate } =
    useFinance();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetHolding | null>(null);
  const [sellingAsset, setSellingAsset] = useState<AssetHolding | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isCustomizeRatesOpen, setIsCustomizeRatesOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);

  // Custom order and hidden rates preferences
  const [rateOrder, setRateOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RATES_ORDER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hiddenRateIds, setHiddenRateIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RATES_HIDDEN_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate visible & ordered market rates
  const visibleMarketRates = useMemo(() => {
    const rateMap = new Map(marketRates.map(r => [r.id, r]));
    const hiddenSet = new Set(hiddenRateIds);

    // 1. Arrange rates according to rateOrder
    const ordered: MarketRate[] = [];
    const addedIds = new Set<string>();

    for (const id of rateOrder) {
      const r = rateMap.get(id);
      if (r && !hiddenSet.has(id)) {
        ordered.push(r);
        addedIds.add(id);
      }
    }

    // 2. Add any remaining rates that weren't in rateOrder
    for (const r of marketRates) {
      if (!addedIds.has(r.id) && !hiddenSet.has(r.id)) {
        ordered.push(r);
      }
    }

    return ordered.length > 0 ? ordered : marketRates;
  }, [marketRates, rateOrder, hiddenRateIds]);

  const handleSaveRateCustomization = (newOrder: string[], newHiddenIds: string[]) => {
    setRateOrder(newOrder);
    setHiddenRateIds(newHiddenIds);
    localStorage.setItem(RATES_ORDER_KEY, JSON.stringify(newOrder));
    localStorage.setItem(RATES_HIDDEN_KEY, JSON.stringify(newHiddenIds));
  };

  // Totals
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.amount * a.currentPrice, 0);
  const totalCostValue = assets.reduce((sum, a) => sum + a.amount * a.buyPrice + (a.buyFee || 0), 0);
  const totalProfitLoss = totalCurrentValue - totalCostValue;
  const overallRoiPercent = totalCostValue > 0 ? (totalProfitLoss / totalCostValue) * 100 : 0;

  // Asset allocation by type
  const allocationByType = assets.reduce((acc, a) => {
    const val = a.amount * a.currentPrice;
    acc[a.type] = (acc[a.type] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const assetTypeLabels: Record<string, { label: string; color: string }> = {
    gold_18k: { label: 'طلای ۱۸ عیار', color: '#f59e0b' },
    gold_coin: { label: 'مسکوکات طلا', color: '#d97706' },
    currency: { label: 'ارز اسکناسی', color: '#10b981' },
    crypto: { label: 'ارز دیجیتال', color: '#6366f1' },
    stock_other: { label: 'سایر دارایی‌ها', color: '#8b5cf6' },
  };

  const pieData = Object.entries(allocationByType).map(([type, val]) => ({
    name: assetTypeLabels[type]?.label || type,
    value: val,
    color: assetTypeLabels[type]?.color || '#94a3b8',
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMarketRates();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این دارایی از سبد اطمینان دارید؟')) {
      deleteAsset(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>سبد سرمایه‌گذاری و دارایی‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ردگیری طلا، سکه، دلار، تتر، ارز دیجیتال، ثبت خرید و فروش دارایی
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsSourceModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-sky-400 transition"
            title="پیکربندی کانال‌های تلگرام و سایت منبع قیمت‌ها"
          >
            <Radio className="w-4 h-4 text-sky-500 animate-pulse" />
            <span className="whitespace-nowrap">منبع قیمت‌ها</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-amber-400 transition"
          >
            <RefreshCw className={`w-4 h-4 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">به‌روزرسانی قیمت‌ها</span>
          </button>

          <button
            onClick={() => {
              setEditingAsset(null);
              setIsAssetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="whitespace-nowrap">ثبت خرید دارایی</span>
          </button>
        </div>
      </div>

      {/* 1. Portfolio KPI Summary (Collapsible) */}
      <CollapsibleSection
        storageKey="inv_kpi_summary"
        title="خلاصه ارزش و بازدهی کل سبد سرمایه‌گذاری"
        subtitle={`ارزش روز دارایی‌ها و سود/زیان کلی (${toPersianDigits(assets.length)} قلم دارایی)`}
        icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              ارزش کل روز دارایی‌ها (سبد سرمایه)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(totalCurrentValue, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              تعداد {toPersianDigits(assets.length)} قلم دارایی ثبت شده
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              مجموع بهای خرید اولیه (سرمایه پرداختی)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatCurrency(totalCostValue, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">میانگین هزینه کل خرید</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              سود / زیان کل سبد
            </span>
            <h3
              className={`text-xl sm:text-2xl font-black tracking-tight font-mono ${
                totalProfitLoss >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalProfitLoss >= 0 ? '+ ' : ''}
              {formatCurrency(totalProfitLoss, currency)}
            </h3>
            <span
              className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${
                totalProfitLoss >= 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              بازدهی کل: {totalProfitLoss >= 0 ? '+' : ''}
              {toPersianDigits(overallRoiPercent.toFixed(1))}٪
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Live Market Rates Ticker Bar (Collapsible with Customization) */}
      <CollapsibleSection
        storageKey="inv_market_rates_ticker"
        title="تابلوی زنده قیمت‌های طلا، سکه و ارز در ایران"
        subtitle={`منبع قیمت‌ها: بروزرسانی ${marketRates[0]?.lastUpdated || 'لحظه‌ای'} • ${toPersianDigits(visibleMarketRates.length)} نماد فعال`}
        icon={<Radio className="w-5 h-5 text-sky-500" />}
        defaultExpanded={true}
        headerAction={
          <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                setIsCustomizeRatesOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition"
              title="شخصی‌سازی نمادها و چیدمان تابلوی قیمت‌ها"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span className="whitespace-nowrap">شخصی‌سازی تابلو</span>
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                setIsSourceModalOpen(true);
              }}
              className="text-sky-500 hover:underline flex items-center gap-1 text-xs font-bold px-2 py-1"
            >
              <span className="whitespace-nowrap">تنظیم منبع و واحد</span>
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {visibleMarketRates.map(rate => (
            <div
              key={rate.id}
              onClick={() => setEditingRate(rate)}
              className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 space-y-2 hover:border-amber-400/60 hover:shadow-lg transition cursor-pointer group relative"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {rate.name}
                </span>
                <div className="flex items-center gap-1">
                  {rate.changePercent !== undefined && (
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        rate.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {rate.changePercent >= 0 ? '▲' : '▼'} {Math.abs(rate.changePercent)}٪
                    </span>
                  )}
                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition hover:text-amber-500" />
                </div>
              </div>

              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(rate.priceToman, currency)}
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/30 dark:border-white/5">
                <span
                  className={`truncate max-w-[120px] ${
                    rate.isManual
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                  title={rate.source}
                >
                  {rate.isManual ? '✏️ قیمت دستی' : rate.source || 'خودکار'}
                </span>
                <span className="text-[9px] text-slate-400 opacity-75">تنظیم</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 3 & 4. Asset Holdings and Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Holdings List (2 cols) */}
        <div className="lg:col-span-2">
          <CollapsibleSection
            storageKey="inv_holdings_list"
            title="دارایی‌های ثبت‌شده در سبد شما"
            subtitle="خرید، فروش، مقدار و سود/زیان لحظه‌ای هر دارایی"
            icon={<Layers className="w-5 h-5 text-amber-500" />}
            defaultExpanded={true}
            headerAction={
              <button
                onClick={e => {
                  e.stopPropagation();
                  setEditingAsset(null);
                  setIsAssetModalOpen(true);
                }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 px-2 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">ثبت خرید</span>
              </button>
            }
          >
            <div className="space-y-3.5 pt-1">
              {assets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  هنوز هیچ دارایی (طلا، ارز، رمزارز و...) در سبد ثبت نشده است. با دکمه بالا دارایی جدید
                  ثبت کنید.
                </div>
              ) : (
                assets.map(asset => {
                  const totalAssetValue = asset.amount * asset.currentPrice;
                  const totalAssetCost = asset.amount * asset.buyPrice + (asset.buyFee || 0);
                  const assetProfit = totalAssetValue - totalAssetCost;
                  const roi = totalAssetCost > 0 ? (assetProfit / totalAssetCost) * 100 : 0;

                  return (
                    <div
                      key={asset.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 hover:border-amber-400/50 hover:shadow-md transition space-y-3"
                    >
                      {/* Card Header: Name + Badge + Total Value & ROI */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Coins className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                {asset.name}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                {toPersianDigits(asset.amount)} {asset.unitName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{assetTypeLabels[asset.type]?.label || 'سرمایه‌گذاری'}</span>
                              {asset.buyDate && (
                                <>
                                  <span>•</span>
                                  <span>خرید: {toPersianDigits(asset.buyDate)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Total Value & Profit Badge */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700/50">
                          <div className="text-right sm:text-left">
                            <div className="text-[10px] text-slate-400">ارزش کل روز:</div>
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                              {formatCurrency(totalAssetValue, currency)}
                            </div>
                          </div>
                          <div
                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black shrink-0 ${
                              assetProfit >= 0
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {assetProfit >= 0 ? '+' : ''}
                            {toPersianDigits(roi.toFixed(1))}٪
                            <span className="text-[10px] mr-1 opacity-85 font-mono">
                              ({formatCurrency(assetProfit, currency)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Clean 3-Column Numbers Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/40 dark:border-white/5 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px] mb-0.5">قیمت خرید هر واحد:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(asset.buyPrice, currency)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px] mb-0.5">قیمت لحظه‌ای روز:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(asset.currentPrice, currency)}
                          </span>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[11px] mb-0.5">بهای کل خرید (سرمایه):</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totalAssetCost, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Notes if any */}
                      {asset.notes && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-200/30 dark:border-white/5">
                          <span className="font-bold text-slate-600 dark:text-slate-300">یادداشت: </span>
                          {asset.notes}
                        </div>
                      )}

                      {/* Action Buttons Toolbar */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                        <button
                          onClick={() => setSellingAsset(asset)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white text-xs font-bold transition shadow-xs active:scale-95"
                          title="فروش بخشی یا تمام این دارایی"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>ثبت فروش دارایی</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsAssetModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition"
                          title="ویرایش اطلاعات"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-500/15 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="حذف از سبد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* Portfolio Distribution Donut (1 col) */}
        <div>
          <CollapsibleSection
            storageKey="inv_distribution_donut"
            title="توزیع سبد سرمایه‌گذاری"
            subtitle="سهم هر نوع دارایی از کل ارزش"
            icon={<PieIcon className="w-5 h-5 text-amber-500" />}
            defaultExpanded={true}
          >
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs text-center">
                دارایی برای رسم نمودار ثبت نشده است
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val), currency), 'ارزش روز']}
                        contentStyle={{
                          borderRadius: '16px',
                          direction: 'rtl',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  {pieData.map(d => {
                    const pct =
                      totalCurrentValue > 0
                        ? Math.round((d.value / totalCurrentValue) * 100)
                        : 0;
                    return (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {d.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span>{formatCurrency(d.value, currency)}</span>
                          <span className="text-slate-400">({toPersianDigits(pct)}٪)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>

      {/* Modals */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        initialAsset={editingAsset}
      />

      <SellAssetModal
        isOpen={!!sellingAsset}
        onClose={() => setSellingAsset(null)}
        asset={sellingAsset}
      />

      <MarketSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onRefresh={handleRefresh}
      />

      <MarketRatesCustomizeModal
        isOpen={isCustomizeRatesOpen}
        onClose={() => setIsCustomizeRatesOpen(false)}
        allRates={marketRates}
        visibleRateIds={visibleMarketRates.map(r => r.id)}
        rateOrder={rateOrder}
        onSave={handleSaveRateCustomization}
        currency={currency}
      />

      {editingRate && (
        <ManualRateModal
          isOpen={true}
          onClose={() => setEditingRate(null)}
          rate={editingRate}
          currency={currency}
          onSave={setManualRate}
        />
      )}
    </div>
  );
};
