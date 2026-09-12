import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AssetHolding } from '../../types';
import { formatCurrency, numberToWordsPersian, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { getAccountTypeMeta } from '../accounts/TransferModal';
import {
  X,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  Check,
  Building2,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetHolding | null;
}

export const SellAssetModal: React.FC<SellAssetModalProps> = ({ isOpen, onClose, asset }) => {
  const { accounts, currency, sellAsset } = useFinance();

  const [amountToSell, setAmountToSell] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [sellFee, setSellFee] = useState<string>('');
  const [depositToAccount, setDepositToAccount] = useState<boolean>(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [sellDate, setSellDate] = useState<string>(getTodayJalali());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (asset) {
      setAmountToSell(String(asset.amount));
      setSellingPrice(String(asset.currentPrice || asset.buyPrice));
      setSellFee('');
      setSellDate(getTodayJalali());
      setNotes(`فروش ${asset.name}`);
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [asset, accounts]);

  if (!isOpen || !asset) return null;

  const numAmount = parseFloat(amountToSell) || 0;
  const numSellingPrice = parseFloat(sellingPrice) || 0;
  const numSellFee = parseFloat(sellFee) || 0;

  // Real-time calculations
  const grossProceeds = Math.round(numAmount * numSellingPrice);
  const netProceeds = Math.max(0, grossProceeds - numSellFee);
  const costOfSold = Math.round(numAmount * asset.buyPrice);
  const realizedProfitLoss = netProceeds - costOfSold;
  const roiPercent = costOfSold > 0 ? (realizedProfitLoss / costOfSold) * 100 : 0;
  const remainingAmount = Math.max(0, asset.amount - numAmount);

  const handlePercentageQuickSelect = (pct: number) => {
    const val = (asset.amount * pct) / 100;
    // Format to max 4 decimal digits
    setAmountToSell(String(Number(val.toFixed(4))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مقدار معتبر برای فروش وارد کنید.');
      return;
    }
    if (numAmount > asset.amount) {
      alert('مقدار فروش نمی‌تواند بیشتر از کل موجودی دارایی در سبد باشد.');
      return;
    }
    if (numSellingPrice <= 0) {
      alert('لطفاً قیمت فروش هر واحد را وارد کنید.');
      return;
    }

    sellAsset({
      assetId: asset.id,
      amountToSell: numAmount,
      pricePerUnit: numSellingPrice,
      fee: numSellFee > 0 ? numSellFee : undefined,
      depositToAccountId: depositToAccount ? selectedAccountId : undefined,
      description: notes.trim() || `فروش ${toPersianDigits(numAmount)} ${asset.unitName} ${asset.name}`,
      date: sellDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                فروش دارایی از سبد سرمایه
              </h3>
              <p className="text-xs text-slate-400">
                فروش {asset.name} و محاسبه سود/زیان معامله
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Asset Info Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white">{asset.name}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400">
              موجودی سبد: {toPersianDigits(asset.amount)} {asset.unitName}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>میانگین خرید: {formatCurrency(asset.buyPrice, currency)}</span>
            <span>قیمت روز بازار: {formatCurrency(asset.currentPrice, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Amount to Sell & Quick Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مقدار فروش ({asset.unitName})
              </label>
              <div className="flex items-center gap-1">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageQuickSelect(pct)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 hover:bg-amber-500 hover:text-white transition"
                  >
                    {pct === 100 ? 'تمام دارایی' : `${toPersianDigits(pct)}٪`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              max={asset.amount}
              required
              value={amountToSell}
              onChange={e => setAmountToSell(e.target.value)}
              placeholder={`حداکثر ${asset.amount}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-amber-500 transition"
            />
            {remainingAmount > 0 && numAmount > 0 && (
              <p className="text-[11px] text-slate-400 mt-1">
                باقیمانده پس از فروش: {toPersianDigits(remainingAmount.toFixed(4))} {asset.unitName}
              </p>
            )}
          </div>

          {/* Price per unit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              قیمت فروش هر واحد ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="number"
              min="0"
              required
              value={sellingPrice}
              onChange={e => setSellingPrice(e.target.value)}
              placeholder="قیمت توافقی فروش هر واحد"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Sell Fee / Commission */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              کارمزد / کمیسیون فروش ({currency === 'toman' ? 'تومان' : 'ریال'}) - اختیاری
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={sellFee}
              onChange={e => setSellFee(e.target.value)}
              placeholder="مثلاً: ۵۰,۰۰۰ تومان"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Live Realized Profit & Proceeds Card */}
          {numAmount > 0 && numSellingPrice > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/40 dark:border-white/5">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  مبلغ دریافتی خالص شما (واریزی):
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                  {formatCurrency(netProceeds, currency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>مبلغ ناخالص فروش:</span>
                <span className="font-mono">{formatCurrency(grossProceeds, currency)}</span>
              </div>

              {numSellFee > 0 && (
                <div className="flex justify-between items-center text-[11px] text-rose-500 font-bold">
                  <span>کسر کارمزد و کمیسیون فروش:</span>
                  <span className="font-mono">-{formatCurrency(numSellFee, currency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>بهای تمام‌شده خرید این مقدار:</span>
                <span className="font-mono">{formatCurrency(costOfSold, currency)}</span>
              </div>

              <div className="flex justify-between items-center pt-1 font-bold border-t border-amber-200/40 dark:border-white/5">
                <span className="flex items-center gap-1">
                  {realizedProfitLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                  <span>سود / زیان واقعی پس از کسر کارمزد:</span>
                </span>
                <span
                  className={`font-mono text-xs ${
                    realizedProfitLoss >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {realizedProfitLoss >= 0 ? '+ ' : ''}
                  {formatCurrency(realizedProfitLoss, currency)} ({toPersianDigits(roiPercent.toFixed(1))}٪)
                </span>
              </div>
            </div>
          )}

          {/* Deposit to Account Option */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-slate-200/60 dark:border-white/10 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={depositToAccount}
                onChange={e => setDepositToAccount(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                واریز خودکار مبلغ حاصل از فروش به یکی از حساب‌های بانکی / نقدی
              </span>
            </label>

            {depositToAccount && (
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  انتخاب حساب مقصد جهت واریز:
                </label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                >
                  {accounts.map(acc => {
                    const meta = getAccountTypeMeta(acc.type);
                    return (
                      <option key={acc.id} value={acc.id}>
                        [{meta.shortLabel}] {acc.name} • موجودی: {formatCurrency(acc.balance, currency)}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاریخ فروش
              </label>
              <input
                type="text"
                value={sellDate}
                onChange={e => setSellDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                یادداشت بابت فروش
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="مثلاً: سود معاملات طلا"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>تایید نهایی و ثبت فروش دارایی</span>
          </button>
        </form>
      </div>
    </div>
  );
};
