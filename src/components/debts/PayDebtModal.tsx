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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import {
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
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
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
  const selectedAccount = accounts.find((a) => a.id === accountId);

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

    const savedAmount = currency === 'rial' ? numAmount / 10 : numAmount;

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isDebt
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
          <span>{isDebt ? 'پرداخت بدهی / قسط' : 'وصول و دریافت طلب'}</span>
        </div>
      }
      subtitle="ثبت سند مالی، تسویه و ثبت در گردش حساب بانکی"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Debt Overview Card */}
        <div
          className={`p-4 rounded-2xl border space-y-2.5 ${
            isDebt
              ? 'bg-rose-500/5 border-rose-500/20'
              : 'bg-emerald-500/5 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-fintech-text-muted" />
              <span className="text-xs sm:text-sm font-bold text-white">
                طرف‌حساب: {debt.personName}
              </span>
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                isDebt
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {isDebt ? 'بدهی من به دیگران' : 'طلب من از دیگران'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
            <div>
              <span className="text-fintech-text-muted block text-[10px] mb-0.5">کل مبلغ:</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(debt.amount, currency)}
              </span>
            </div>
            <div>
              <span className="text-fintech-text-muted block text-[10px] mb-0.5">پرداخت‌شده:</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(debt.paidAmount, currency)}
              </span>
            </div>
            <div>
              <span className="text-fintech-text-muted block text-[10px] mb-0.5">مانده تسویه:</span>
              <span className="font-mono font-bold text-violet-400">
                {formatCurrency(remainingAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-fintech-text-primary">
              مبلغ پرداختی ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPercent(50)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-fintech-text-muted transition"
              >
                ۵۰٪ مانده
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(100)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition"
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
            onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
            placeholder="مبلغ مورد نظر را وارد کنید"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-sm font-mono font-bold outline-none focus:border-violet-500 text-white text-center"
          />

          {numAmount > 0 && (
            <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
              {numberToPersianWords(numAmount, currency)}
            </div>
          )}
        </div>

        {/* Source / Destination Account */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            {isDebt
              ? 'حساب بانکی مبدا (کسر از موجودی) *'
              : 'حساب بانکی مقصد (واریز به موجودی) *'}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none focus:border-violet-500 text-white transition"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id} className="bg-[#18181b] text-white">
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
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              شرح و توضیحات تراکنش
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="بابت قسط..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        {/* Financial Impact Note */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-fintech-text-muted">
          <AlertCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
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

        <div className="pt-2">
          <Button
            type="submit"
            variant={isDebt ? 'danger' : 'primary'}
            fullWidth={true}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isDebt ? 'ثبت پرداخت و کسر از حساب' : 'ثبت وصول و افزایش حساب'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PayDebtModal;
