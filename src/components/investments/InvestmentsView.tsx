import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AssetHolding } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { AssetModal } from './AssetModal';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const InvestmentsView: React.FC = () => {
  const { assets, marketRates, currency, deleteAsset, refreshMarketRates } = useFinance();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetHolding | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Totals
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.amount * a.currentPrice, 0);
  const totalCostValue = assets.reduce((sum, a) => sum + a.amount * a.buyPrice, 0);
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>سبد سرمایه‌گذاری و دارایی‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ردگیری طلای ۱۸ عیار، سکه، دلار، تتر، ارزهای دیجیتال و سود/زیان لحظه‌ای
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-amber-400 transition"
          >
            <RefreshCw className={`w-4 h-4 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>به‌روزرسانی قیمت‌های بازار</span>
          </button>

          <button
            onClick={() => {
              setEditingAsset(null);
              setIsAssetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ثبت دارایی جدید</span>
          </button>
        </div>
      </div>

      {/* Portfolio Value KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            ارزش کل روز دارایی‌ها (سبد سرمایه)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalCurrentValue, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            تعداد {toPersianDigits(assets.length)} قلم دارایی ثبت شده
          </span>
        </div>

        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            مجموع سرمایه‌گذاری اولیه (قیمت خرید)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalCostValue, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            میانگین هزینه خرید
          </span>
        </div>

        <div className="liquid-glass-card p-5">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            سود / زیان کل سبد
          </span>
          <h3
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              totalProfitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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

      {/* Live Market Rates Ticker Bar */}
      <div className="liquid-glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              تابلوی زنده قیمت‌های طلا، سکه و ارز در ایران
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            بروزرسانی: {marketRates[0]?.lastUpdated || 'لحظه‌ای'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {marketRates.map(rate => (
            <div
              key={rate.id}
              className="p-3 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 space-y-1 hover:border-amber-400/50 transition"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {rate.name}
                </span>
                {rate.changePercent !== undefined && (
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      rate.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {rate.changePercent >= 0 ? '▲' : '▼'} {Math.abs(rate.changePercent)}٪
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(rate.priceToman, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Holdings and Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Holdings List (2 cols) */}
        <div className="lg:col-span-2 liquid-glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                دارایی‌های ثبت‌شده در سبد شما
              </h3>
              <p className="text-xs text-slate-400">فهرست جزئیات خرید، مقدار و سود/زیان</p>
            </div>
            <button
              onClick={() => {
                setEditingAsset(null);
                setIsAssetModalOpen(true);
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن دارایی</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200/40 dark:divide-white/10">
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                هنوز هیچ دارایی (طلا، ارز، رمزارز و...) در سبد ثبت نشده است. با دکمه بالا اولین دارایی خود را ثبت کنید.
              </div>
            ) : (
              assets.map(asset => {
                const totalAssetValue = asset.amount * asset.currentPrice;
                const totalAssetCost = asset.amount * asset.buyPrice;
                const assetProfit = totalAssetValue - totalAssetCost;
                const roi = totalAssetCost > 0 ? (assetProfit / totalAssetCost) * 100 : 0;

                return (
                  <div
                    key={asset.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-slate-800/40 transition rounded-2xl px-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                        <Coins className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {asset.name}
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {toPersianDigits(asset.amount)} {asset.unitName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>خرید: {formatCurrency(asset.buyPrice, currency)}</span>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            قیمت روز: {formatCurrency(asset.currentPrice, currency)}
                          </span>
                          {asset.buyDate && (
                            <>
                              <span>•</span>
                              <span>تاریخ: {toPersianDigits(asset.buyDate)}</span>
                            </>
                          )}
                          {asset.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{asset.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right sm:text-left">
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          {formatCurrency(totalAssetValue, currency)}
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            assetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {assetProfit >= 0 ? '+ ' : ''}
                          {formatCurrency(assetProfit, currency)} ({roi.toFixed(1)}٪)
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsAssetModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-white/40 dark:hover:bg-slate-800"
                          title="ویرایش دارایی"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/40 dark:hover:bg-slate-800"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Portfolio Distribution Donut (1 col) */}
        <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              توزیع سبد سرمایه‌گذاری
            </h3>
            <span className="text-xs text-slate-400">سهم دارایی‌ها</span>
          </div>

          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs text-center">
              دارایی برای رسم نمودار ثبت نشده است
            </div>
          ) : (
            <div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'ارزش']}
                      contentStyle={{
                        borderRadius: '1rem',
                        fontFamily: 'Vazirmatn',
                        direction: 'rtl',
                        textAlign: 'right',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                {pieData.map(item => {
                  const percent = totalCurrentValue > 0 ? ((item.value / totalCurrentValue) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {toPersianDigits(percent)}٪
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        initialAsset={editingAsset}
      />
    </div>
  );
};
