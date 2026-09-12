import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt } from '../../types';
import { formatCurrency, numberToWordsPersian, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { getAccountTypeMeta } from '../accounts/TransferModal';
import {
  X,
  CreditCard,
  Building2,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  Check,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';

interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({ isOpen, onClose, debt }) => {
  const { accounts, currency, payDebtWithAccount } = useFinance();

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (debt) {
      const remaining = Math.max(0, debt.amount - debt.paidAmount);
      setAmount(remaining > 0 ? remaining.toString() : '');
      setDate(getTodayJalali());
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      setDescription(
        debt.type === 'debt'
          ? `پرداخت بدهی / قسط به ${debt.personName}`
          : `دریافت و وصول طلب از ${debt.personName}`
      );
    }
  }, [debt, accounts, isOpen]);

  if (!isOpen || !debt) return null;

  const isDebt = debt.type === 'debt'; // بدهی ما به دیگران
  const remainingAmount = Math.max(0, debt.amount - debt.paidAmount);
  const numAmount = parseFloat(amount) || 0;
  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleQuickPercent = (pct: number) => {
    const val = Math.round((remainingAmount * pct) / 100);
    setAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مبلغ معتبری برای پرداخت وارد کنید.');
      return;
    }
    if (!accountId) {
      alert('لطفاً حساب بانکی یا کیف‌پول را انتخاب کنید.');
      return;
    }

    if (isDebt && selectedAccount && selectedAccount.balance < numAmount) {
      if (
        !window.confirm(
          `موجودی حساب انتخابی (${formatCurrency(selectedAccount.balance, currency)}) کمتر از مبلغ پرداختی است. آیا مایل به ادامه هستید؟`
        )
      ) {
        return;
      }
    }

    payDebtWithAccount({
      debtId: debt.id,
      amount: numAmount,
      accountId,
      date,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-lg overflow-hidden border border-white/30 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl ${
                isDebt
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isDebt ? 'پرداخت بدهی / قسط' : 'وصول و دریافت طلب'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت سند مالی، کسر/واریز به حساب و ثبت در تاریخچه اقساط
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Overview Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              isDebt
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/30'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  طرف‌حساب: {debt.personName}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  isDebt
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isDebt ? 'بدهی من به دیگران' : 'طلب من از دیگران'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/40 dark:border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">کل مبلغ:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(debt.amount, currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">پرداخت‌شده:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(debt.paidAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مانده تسویه:</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(remainingAmount, currency)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} id="pay-debt-form" className="space-y-4">
            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  مبلغ پرداختی ({currency === 'toman' ? 'تومان' : 'ریال'}) *
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(50)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                  >
                    ۵۰٪ مانده
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(100)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 transition"
                  >
                    تسویه کامل مانده
                  </button>
                </div>
              </div>

              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="مبلغ مورد نظر را وارد کنید"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold outline-none focus:border-indigo-500"
              />

              {numAmount > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  معادل: {numberToWordsPersian(numAmount)} {currency === 'toman' ? 'تومان' : 'ریال'}
                </p>
              )}
            </div>

            {/* Source / Destination Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isDebt
                  ? 'حساب بانکی یا کیف‌پول مبدا (کسر از موجودی) *'
                  : 'حساب بانکی یا کیف‌پول مقصد (واریز به موجودی) *'}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500"
              >
                {accounts.map(acc => {
                  const meta = getAccountTypeMeta(acc.type);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {meta.label} {acc.name} — موجودی: {formatCurrency(acc.balance, currency)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Date & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاریخ پرداخت (شمسی)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شرح و توضیحات تراکنش
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="بابت قسط..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Financial Impact Note */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/40 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isDebt
                  ? `با ثبت این پرداخت، مبلغ ${formatCurrency(
                      numAmount,
                      currency
                    )} از موجودی ${selectedAccount?.name || 'حساب'} کسر شده و وضعیت بدهی شما به‌روزرسانی می‌شود.`
                  : `با ثبت این وصول، مبلغ ${formatCurrency(
                      numAmount,
                      currency
                    )} به موجودی ${selectedAccount?.name || 'حساب'} افزوده شده و طلب شما به‌روزرسانی می‌شود.`}
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            form="pay-debt-form"
            className={`px-5 py-2 rounded-xl text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5 ${
              isDebt
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-rose-500/25'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/25'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isDebt ? 'ثبت پرداخت و کسر از حساب' : 'ثبت وصول و افزایش حساب'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
