import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { formatCurrency, numberToWordsPersian, parseAmount, sanitizeAmountInput, formatAmountInput } from '../../utils/formatters';
import { LIQUID_GLASS_PRESETS } from '../../utils/liquidGlassPresets';
import {
  X,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowDown,
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
        label: 'سایر حساب‌ها',
        shortLabel: 'سایر',
        icon: Wallet,
        color: 'text-slate-500',
        badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      };
  }
};

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, currency, addTransaction } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0) {
        setFromAccountId(accounts[0].id);
        setToAccountId(accounts.length > 1 ? accounts[1].id : accounts[0].id);
      }
      setAmount('');
      setFee('0');
      setDate(getTodayJalali());
      setDescription('');
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const fromAcc = accounts.find(a => a.id === fromAccountId);
  const toAcc = accounts.find(a => a.id === toAccountId);

  const numAmount = parseAmount(amount);
  const numFee = parseAmount(fee);
  const numAmountToman = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مبلغ معتبری برای انتقال وارد کنید.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('حساب مبدأ و مقصد نمی‌توانند یکسان باشند.');
      return;
    }
    if (!fromAcc || !toAcc) {
      alert('حساب مبدأ یا مقصد نامعتبر است.');
      return;
    }

    const savedAmount = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;
    const savedFee = currency === 'rial' ? Math.round(numFee / 10) : numFee;

    if (fromAcc.balance < savedAmount + savedFee) {
      if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ و کارمزد است. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }

    addTransaction({
      type: 'transfer',
      amount: savedAmount,
      date,
      description: description.trim() || `انتقال از ${fromAcc.name} به ${toAcc.name}`,
      categoryId: 'cat-other-exp',
      accountId: fromAcc.id,
      toAccountId: toAcc.id,
      fee: savedFee,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        data-glass
        data-config={JSON.stringify(LIQUID_GLASS_PRESETS.crystalWidget)}
        className="relative w-full max-w-lg liquid-glass-crystal rounded-3xl shadow-2xl p-5 sm:p-6 my-4 sm:my-8 z-10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                انتقال وجه بین حساب‌ها
              </h3>
              <p className="text-xs text-slate-400">
                انتقال موجودی بین کارت‌ها، حساب‌های بانکی و کیف پول نقدی
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
              حساب مبدأ (کسر موجودی)
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                  {formatCurrency(acc.balance, currency)}
                </option>
              ))}
            </select>

            {fromAcc && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {fromAcc.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {fromAcc.bankName ? `بانک ${fromAcc.bankName}` : 'حساب نقدی'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(fromAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
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
              حساب مقصد (افزایش موجودی)
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
            >
              {accounts
                .filter(a => a.id !== fromAccountId)
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                    {formatCurrency(acc.balance, currency)}
                  </option>
                ))}
            </select>

            {toAcc && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {toAcc.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {toAcc.bankName ? `بانک ${toAcc.bankName}` : 'حساب نقدی'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">موجودی فعلی:</span>
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(toAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Amount and Fee Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مبلغ انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={e => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black font-mono outline-none focus:border-indigo-500 transition"
              />
              {numAmount > 0 && (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block mt-1">
                  {numberToWordsPersian(numAmountToman)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                کارمزد انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={fee}
                onChange={e => setFee(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاریخ انتقال
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="1403/01/01"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                توضیحات (اختیاری)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="مثلاً: انتقال به کارت خرید، واریز پس‌انداز..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <span>ثبت انتقال وجه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
