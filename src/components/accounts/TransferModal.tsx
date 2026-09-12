import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types';
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
        label: 'وجه نقد / اسکناس (ارز یا ریال)',
        shortLabel: 'نقد / اسکناس',
        icon: Wallet,
        color: 'text-emerald-500',
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      };
    case 'gold_crypto':
      return {
        label: 'صندوق طلا، سکه یا ارز دیجیتال',
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
  const { accounts, currency, addTransaction } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const fromAcc = accounts.find(a => a.id === fromAccountId);
  const toAcc = accounts.find(a => a.id === toAccountId);
  const numAmount = parseFloat(amount) || 0;
  const numFee = parseFloat(fee) || 0;

  const fromMeta = fromAcc ? getAccountTypeMeta(fromAcc.type) : null;
  const toMeta = toAcc ? getAccountTypeMeta(toAcc.type) : null;
  const FromIcon = fromMeta?.icon || Wallet;
  const ToIcon = toMeta?.icon || Wallet;

  const isCrossTypeTransfer = fromAcc && toAcc && fromAcc.type !== toAcc.type;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مبلغ انتقال را به درستی وارد کنید.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('حساب مبدأ و مقصد نمی‌توانند یکسان باشند.');
      return;
    }
    if (fromAcc && fromAcc.balance < numAmount + numFee) {
      if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ و کارمزد است. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }

    addTransaction({
      type: 'transfer',
      amount: numAmount,
      date,
      description:
        description.trim() ||
        `انتقال از ${fromAcc?.name} (${fromMeta?.shortLabel}) به ${toAcc?.name} (${toMeta?.shortLabel})`,
      categoryId: 'cat-other-exp',
      accountId: fromAccountId,
      toAccountId,
      fee: numFee,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                انتقال و جابه‌جایی بین حساب‌ها
              </h3>
              <p className="text-[11px] text-slate-400">
                انتقال بین حساب‌های بانکی، صندوق طلا، ارز نقد و پس‌انداز
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
          {/* Source Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              حساب مبدأ (کسر از دارایی)
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              {accounts.map(acc => {
                const meta = getAccountTypeMeta(acc.type);
                return (
                  <option key={acc.id} value={acc.id}>
                    [{meta.shortLabel}] {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                    {formatCurrency(acc.balance, currency)}
                  </option>
                );
              })}
            </select>

            {/* Source Account Info Preview Card */}
            {fromAcc && fromMeta && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-white dark:bg-slate-700 ${fromMeta.color}`}>
                    <FromIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{fromAcc.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${fromMeta.badgeClass}`}
                      >
                        {fromMeta.label}
                      </span>
                    </div>
                    {fromAcc.bankName && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        بانک {fromAcc.bankName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {formatCurrency(fromAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direction Indicator */}
          <div className="flex items-center justify-center my-1">
            <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Destination Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              حساب مقصد (واریز به دارایی)
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              {accounts
                .filter(a => a.id !== fromAccountId)
                .map(acc => {
                  const meta = getAccountTypeMeta(acc.type);
                  return (
                    <option key={acc.id} value={acc.id}>
                      [{meta.shortLabel}] {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                      {formatCurrency(acc.balance, currency)}
                    </option>
                  );
                })}
            </select>

            {/* Destination Account Info Preview Card */}
            {toAcc && toMeta && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-white dark:bg-slate-700 ${toMeta.color}`}>
                    <ToIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{toAcc.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${toMeta.badgeClass}`}
                      >
                        {toMeta.label}
                      </span>
                    </div>
                    {toAcc.bankName && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        بانک {toAcc.bankName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {formatCurrency(toAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cross-type Asset Transfer Notice */}
          {isCrossTypeTransfer && fromMeta && toMeta && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">انتقال بین دو نوع دارایی مختلف:</span>
                <span>
                  شما در حال انتقال از <strong>{fromMeta.shortLabel}</strong> به{' '}
                  <strong>{toMeta.shortLabel}</strong> هستید. مبالغ متناسباً از مبدأ کسر و به مقصد
                  افزوده می‌شود.
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              مبلغ انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="مثلاً: 500000"
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black outline-none font-mono focus:border-indigo-500 transition"
            />
            {numAmount > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 leading-relaxed">
                معادل: {numberToWordsPersian(numAmount, currency)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                کارمزد انتقال
              </label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={e => setFee(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاریخ شمسی
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شرح یا بابت انتقال
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="مثلاً: واریز به حساب خرید طلا یا خرید روزمره"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          {/* After Transfer Preview */}
          {numAmount > 0 && fromAcc && toAcc && (
            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 text-xs space-y-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                پیش‌نمایش موجودی پس از انتقال:
              </span>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{fromAcc.name} (مبدأ):</span>
                <span className="font-mono font-bold">
                  {formatCurrency(fromAcc.balance - numAmount - numFee, currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{toAcc.name} (مقصد):</span>
                <span className="font-mono font-bold">
                  {formatCurrency(toAcc.balance + numAmount, currency)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>ثبت و انجام انتقال وجه</span>
          </button>
        </form>
      </div>
    </div>
  );
};
