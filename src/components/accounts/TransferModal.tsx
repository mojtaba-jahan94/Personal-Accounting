import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType, AssetHolding } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { formatCurrency, numberToWordsPersian, toPersianDigits } from '../../utils/formatters';
import {
  X,
  ArrowLeftRight,
  Check,
  CreditCard,
  Wallet,
  Coins,
  PiggyBank,
  ArrowDown,
  Info,
  Sparkles,
  Scale,
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const getAccountTypeMeta = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return {
        label: 'کارت / حساب بانکی',
        shortLabel: 'بانکی',
        icon: CreditCard,
        color: 'text-blue-500',
        badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      };
    case 'cash':
      return {
        label: 'وجه نقد / اسکناس',
        shortLabel: 'نقد / اسکناس',
        icon: Wallet,
        color: 'text-emerald-500',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      };
    case 'gold_crypto':
      return {
        label: 'صندوق طلا، سکه یا رمزارز',
        shortLabel: 'طلا و رمزارز',
        icon: Coins,
        color: 'text-amber-500',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      };
    case 'savings':
      return {
        label: 'حساب پس‌انداز و اندوخته',
        shortLabel: 'پس‌انداز',
        icon: PiggyBank,
        color: 'text-purple-500',
        badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      };
    default:
      return {
        label: 'سایر دارایی‌ها',
        shortLabel: 'سایر',
        icon: Wallet,
        color: 'text-slate-500',
        badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      };
  }
};

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const {
    accounts,
    assets,
    currency,
    addTransaction,
    updateAsset,
    sellAsset,
  } = useFinance();

  // ID format: 'acc-{id}' or 'ast-{id}'
  const [fromSourceId, setFromSourceId] = useState<string>(
    accounts[0] ? `acc-${accounts[0].id}` : ''
  );
  const [toTargetId, setToTargetId] = useState<string>(
    accounts[1]
      ? `acc-${accounts[1].id}`
      : assets[0]
      ? `ast-${assets[0].id}`
      : accounts[0]
      ? `acc-${accounts[0].id}`
      : ''
  );

  const [amount, setAmount] = useState('');
  const [assetUnits, setAssetUnits] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  // Resolve source
  const isFromAsset = fromSourceId.startsWith('ast-');
  const fromAcc = !isFromAsset
    ? accounts.find(a => `acc-${a.id}` === fromSourceId)
    : null;
  const fromAst = isFromAsset
    ? assets.find(a => `ast-${a.id}` === fromSourceId)
    : null;

  // Resolve destination
  const isToAsset = toTargetId.startsWith('ast-');
  const toAcc = !isToAsset
    ? accounts.find(a => `acc-${a.id}` === toTargetId)
    : null;
  const toAst = isToAsset
    ? assets.find(a => `ast-${a.id}` === toTargetId)
    : null;

  const numAmount = parseFloat(amount) || 0;
  const numFee = parseFloat(fee) || 0;

  // Conversion calculations if asset is involved
  const activeAsset = isFromAsset ? fromAst : isToAsset ? toAst : null;
  const assetUnitPrice = activeAsset ? activeAsset.currentPrice || activeAsset.buyPrice : 1;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const n = parseFloat(val);
    if (!isNaN(n) && activeAsset && assetUnitPrice > 0) {
      const units = n / assetUnitPrice;
      setAssetUnits(Number(units.toFixed(4)).toString());
    } else {
      setAssetUnits('');
    }
  };

  const handleUnitsChange = (val: string) => {
    setAssetUnits(val);
    const u = parseFloat(val);
    if (!isNaN(u) && activeAsset && assetUnitPrice > 0) {
      const money = Math.round(u * assetUnitPrice);
      setAmount(money.toString());
    } else {
      setAmount('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مبلغ یا مقدار انتقال را به درستی وارد کنید.');
      return;
    }
    if (fromSourceId === toTargetId) {
      alert('مبدأ و مقصد انتقال نمی‌توانند یکسان باشند.');
      return;
    }

    // 1. Asset -> Bank Account (Selling / Withdrawing from specific asset to cash)
    if (isFromAsset && fromAst && toAcc) {
      const unitsToSell = parseFloat(assetUnits) || numAmount / assetUnitPrice;
      if (unitsToSell > fromAst.amount) {
        alert(
          `موجودی ${fromAst.name} (${toPersianDigits(fromAst.amount)} ${fromAst.unitName}) کمتر از مقدار برداشتی است.`
        );
        return;
      }
      sellAsset({
        assetId: fromAst.id,
        amountToSell: unitsToSell,
        pricePerUnit: assetUnitPrice,
        depositToAccountId: toAcc.id,
        description:
          description.trim() ||
          `برداشت و تسویه ${toPersianDigits(unitsToSell)} ${fromAst.unitName} ${fromAst.name} به ${toAcc.name}`,
        date,
      });
      onClose();
      return;
    }

    // 2. Bank Account -> Asset (Buying / Depositing cash into specific asset)
    if (fromAcc && isToAsset && toAst) {
      if (fromAcc.balance < numAmount + numFee) {
        if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ و کارمزد است. آیا مایل به ادامه هستید؟')) {
          return;
        }
      }
      const unitsToAdd = parseFloat(assetUnits) || numAmount / assetUnitPrice;

      // Update asset holdings
      updateAsset({
        ...toAst,
        amount: toAst.amount + unitsToAdd,
      });

      // Record transaction
      addTransaction({
        type: 'expense',
        amount: numAmount,
        date,
        description:
          description.trim() ||
          `خرید و واریز به ${toAst.name} (${toPersianDigits(unitsToAdd)} ${toAst.unitName}) از حساب ${fromAcc.name}`,
        categoryId: 'cat-invest',
        accountId: fromAcc.id,
        fee: numFee,
        tags: ['صندوق طلا و ارز', toAst.name],
      });
      onClose();
      return;
    }

    // 3. Normal Bank -> Bank Transfer
    if (fromAcc && toAcc) {
      if (fromAcc.balance < numAmount + numFee) {
        if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ است. آیا مایل به ادامه هستید؟')) {
          return;
        }
      }
      addTransaction({
        type: 'transfer',
        amount: numAmount,
        date,
        description:
          description.trim() ||
          `انتقال از ${fromAcc.name} به ${toAcc.name}`,
        categoryId: 'cat-other-exp',
        accountId: fromAcc.id,
        toAccountId: toAcc.id,
        fee: numFee,
      });
      onClose();
      return;
    }

    alert('انتقال بین دو دارایی از جنس طلا در حال حاضر به صورت مستقیم امکان‌پذیر نیست. ابتدا به ریال تبدیل کنید.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                انتقال و جابه‌جایی دارایی
              </h3>
              <p className="text-xs text-slate-400">
                انتقال بین کارت‌های بانکی، یا واریز/برداشت مستقیم از موجودی‌های طلا و ارز
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* 1. Source Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              مبدأ (برداشت / کسر از موجودی)
            </label>
            <select
              value={fromSourceId}
              onChange={e => setFromSourceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              <optgroup label="💳 کارت‌ها و حساب‌های بانکی">
                {accounts.map(acc => (
                  <option key={acc.id} value={`acc-${acc.id}`}>
                    {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                    {formatCurrency(acc.balance, currency)}
                  </option>
                ))}
              </optgroup>

              {assets.length > 0 && (
                <optgroup label="🪙 موجودی‌های صندوق طلا، سکه و ارز">
                  {assets.map(ast => (
                    <option key={ast.id} value={`ast-${ast.id}`}>
                      {ast.name} • موجودی: {toPersianDigits(ast.amount)} {ast.unitName} (ارزش روز:{' '}
                      {formatCurrency(ast.amount * ast.currentPrice, currency)})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Source Visual Preview Card */}
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isFromAsset ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'
                  }`}
                >
                  {isFromAsset ? <Coins className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {isFromAsset && fromAst ? fromAst.name : fromAcc?.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isFromAsset && fromAst
                      ? `نرخ روز: ${formatCurrency(fromAst.currentPrice, currency)} / هر ${fromAst.unitName}`
                      : fromAcc?.bankName
                      ? `بانک ${fromAcc.bankName}`
                      : 'حساب نقدی'}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                  {isFromAsset && fromAst
                    ? `${toPersianDigits(fromAst.amount)} ${fromAst.unitName}`
                    : formatCurrency(fromAcc?.balance || 0, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Direction Arrow */}
          <div className="flex items-center justify-center my-0.5">
            <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 shadow-xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* 2. Destination Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              مقصد (واریز / افزایش موجودی)
            </label>
            <select
              value={toTargetId}
              onChange={e => setToTargetId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              <optgroup label="💳 کارت‌ها و حساب‌های بانکی">
                {accounts
                  .filter(a => `acc-${a.id}` !== fromSourceId)
                  .map(acc => (
                    <option key={acc.id} value={`acc-${acc.id}`}>
                      {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                      {formatCurrency(acc.balance, currency)}
                    </option>
                  ))}
              </optgroup>

              {assets.length > 0 && (
                <optgroup label="🪙 موجودی‌های صندوق طلا، سکه و ارز">
                  {assets
                    .filter(a => `ast-${a.id}` !== fromSourceId)
                    .map(ast => (
                      <option key={ast.id} value={`ast-${ast.id}`}>
                        {ast.name} • موجودی: {toPersianDigits(ast.amount)} {ast.unitName} (ارزش روز:{' '}
                        {formatCurrency(ast.amount * ast.currentPrice, currency)})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>

            {/* Destination Visual Preview Card */}
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isToAsset ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-500/15 text-emerald-600'
                  }`}
                >
                  {isToAsset ? <Coins className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {isToAsset && toAst ? toAst.name : toAcc?.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isToAsset && toAst
                      ? `نرخ روز: ${formatCurrency(toAst.currentPrice, currency)} / هر ${toAst.unitName}`
                      : toAcc?.bankName
                      ? `بانک ${toAcc.bankName}`
                      : 'حساب نقدی'}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                  {isToAsset && toAst
                    ? `${toPersianDigits(toAst.amount)} ${toAst.unitName}`
                    : formatCurrency(toAcc?.balance || 0, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Conversion Info Notice */}
          {activeAsset && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-500/30 text-xs space-y-1 text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>تبدیل خودکار با نرخ روز دارایی:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                هر ۱ {activeAsset.unitName} <strong>{activeAsset.name}</strong> برابر با{' '}
                <strong className="font-mono">{formatCurrency(assetUnitPrice, currency)}</strong> است.
                می‌توانید مبلغ به تومان یا مقدار واحد را وارد کنید.
              </p>
            </div>
          )}

          {/* Amount Inputs: Money & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مبلغ نقدی ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="مثلاً: 10000000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-indigo-500 transition"
              />
            </div>

            {activeAsset ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مقدار معادل ({activeAsset.unitName})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  value={assetUnits}
                  onChange={e => handleUnitsChange(e.target.value)}
                  placeholder={`مقدار به ${activeAsset.unitName}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-amber-500 transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کارمزد پایا / کارت به کارت
                </label>
                <input
                  type="number"
                  min="0"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono outline-none"
                />
              </div>
            )}
          </div>

          {numAmount > 0 && (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
              معادل: {numberToWordsPersian(numAmount, currency)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاریخ شمسی
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بابت / یادداشت
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="توضیحات انتقال..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ثبت نهایی انتقال و جابه‌جایی</span>
          </button>
        </form>
      </div>
    </div>
  );
};
