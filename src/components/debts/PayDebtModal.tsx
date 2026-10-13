import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt } from '../../types';
import {
  formatCurrency,
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import {
  X,
  Scale,
  CheckCircle2,
  AlertCircle,
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
      const remainingToman = Math.max(0, debt.amount - debt.paidAmount);
      const remainingDisplay = currency === 'rial' ? Math.round(remainingToman * 10) : remainingToman;
      setAmount(remainingDisplay > 0 ? formatAmountInput(remainingDisplay.toString()) : '');
      setDate(getTodayJalali());
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      setDescription(
        debt.type === 'debt'
          ? `پرداخت بدهی / قسط به ${debt.personName}`
          : `دریافت و وصول طلب از ${debt.personName}`
      );
    }
  }, [debt, accounts, isOpen, currency]);

  if (!isOpen || !debt) return null;

  const isDebt = debt.type === 'debt';
  const remainingAmount = Math.max(0, debt.amount - debt.paidAmount);
  const numAmount = parseAmount(amount);
  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleQuickPercent = (pct: number) => {
    const remainingDisplay = currency === 'rial' ? Math.round(remainingAmount * 10) : remainingAmount;
    const val = Math.round((remainingDisplay * pct) / 100);
    setAmount(formatAmountInput(val.toString()));
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

    const savedAmount = currency === 'rial' ? (numAmount / 10) : numAmount;

    if (isDebt && selectedAccount && selectedAccount.balance < savedAmount) {
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
      amount: savedAmount,
      accountId,
      date,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${
                isDebt
                  ? 'bg-[#C0564B]/15 text-[#C0564B] border-[#C0564B]/30'
                  : 'bg-[#2E7D5B]/15 text-[#2E7D5B] border-[#2E7D5B]/30'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {isDebt ? 'پرداخت بدهی / قسط' : 'وصول و دریافت طلب'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                ثبت سند مالی، تسویه و ثبت در گردش حساب بانکی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form id="pay-debt-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Debt Overview Card */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              isDebt
                ? 'bg-[#C0564B]/5 border-[#C0564B]/20'
                : 'bg-[#2E7D5B]/5 border-[#2E7D5B]/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#6B7280]" />
                <span className="text-xs sm:text-sm font-black text-[#1F2933] dark:text-[#F7F7F2]">
                  طرف‌حساب: {debt.personName}
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  isDebt
                    ? 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171]'
                    : 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80]'
                }`}
              >
                {isDebt ? 'بدهی من به دیگران' : 'طلب من از دیگران'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs">
              <div>
                <span className="text-[#6B7280] dark:text-[#D1D5DB] block text-[10px] mb-0.5">کل مبلغ:</span>
                <span className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  {formatCurrency(debt.amount, currency)}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#D1D5DB] block text-[10px] mb-0.5">پرداخت‌شده:</span>
                <span className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  {formatCurrency(debt.paidAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#D1D5DB] block text-[10px] mb-0.5">مانده تسویه:</span>
                <span className="font-mono font-black text-[#A68A64]">
                  {formatCurrency(remainingAmount, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                مبلغ پرداختی ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPercent(50)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6B7280]/10 hover:bg-[#6B7280]/20 text-[#6B7280] dark:text-[#D1D5DB] transition"
                >
                  ۵۰٪ مانده
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(100)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A68A64]/15 hover:bg-[#A68A64]/25 text-[#A68A64] border border-[#A68A64]/30 transition"
                >
                  تسویه کامل مانده
                </button>
              </div>
            </div>

            <input
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={e => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="مبلغ مورد نظر را وارد کنید"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-mono font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
            />

            {numAmount > 0 && (
              <div className="mt-1.5 p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                {numberToPersianWords(numAmount, currency)}
              </div>
            )}
          </div>

          {/* Source / Destination Account */}
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              {isDebt
                ? 'حساب بانکی مبدا (کسر از موجودی) *'
                : 'حساب بانکی مقصد (واریز به موجودی) *'}
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="dark:bg-[#1F2933]">
                  {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} — موجودی: {formatCurrency(acc.balance, currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <JalaliDatePicker
                value={date}
                onChange={setDate}
                label="تاریخ پرداخت"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                شرح و توضیحات تراکنش
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="بابت قسط..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
              />
            </div>
          </div>

          {/* Financial Impact Note */}
          <div className="p-3 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-start gap-2.5 text-xs text-[#6B7280] dark:text-[#D1D5DB]">
            <AlertCircle className="w-4 h-4 text-[#A68A64] shrink-0 mt-0.5" />
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

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 font-bold text-xs transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            form="pay-debt-form"
            className={`px-5 py-2.5 rounded-xl text-[#F7F7F2] font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5 ${
              isDebt
                ? 'bg-[#C0564B] hover:bg-[#a6473d] shadow-[#C0564B]/25'
                : 'bg-[#2E7D5B] hover:bg-[#25664a] shadow-[#2E7D5B]/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isDebt ? 'ثبت پرداخت و کسر از حساب' : 'ثبت وصول و افزایش حساب'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
