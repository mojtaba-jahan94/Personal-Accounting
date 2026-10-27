import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { CreditCard, Scale, CheckCircle2 } from 'lucide-react';
import {
  formatCardNumber,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  formatCurrency,
  toPersianDigits,
  numberToPersianWords,
} from '../../utils/formatters';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount?: Account | null;
}

const PRESET_COLORS = [
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#dc2626', // Red
  '#2563eb', // Blue
  '#3f3f46', // Zinc
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  initialAccount,
}) => {
  const { addAccount, updateAccount, currency, getAccountTransactionsDelta, reconcileAccountBalance } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [shaba, setShaba] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isDefault, setIsDefault] = useState(false);
  const [isReconcileMode, setIsReconcileMode] = useState(false);

  useEffect(() => {
    if (initialAccount) {
      setName(initialAccount.name);
      setType(initialAccount.type);
      const startingBal = initialAccount.initialBalance ?? initialAccount.balance ?? 0;
      const displayBalance = currency === 'rial' ? Math.round(startingBal * 10) : startingBal;
      setBalance(formatAmountInput(displayBalance.toString()));
      setBankName(initialAccount.bankName || '');
      setCardNumber(initialAccount.cardNumber ? formatCardNumber(initialAccount.cardNumber) : '');
      setShaba(initialAccount.shaba || '');
      setColor(initialAccount.color || PRESET_COLORS[0]);
      setIsDefault(!!initialAccount.isDefault);
      setIsReconcileMode(false);
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setBankName('');
      setCardNumber('');
      setShaba('');
      setColor(PRESET_COLORS[0]);
      setIsDefault(false);
      setIsReconcileMode(false);
    }
  }, [initialAccount, isOpen, currency]);

  if (!isOpen) return null;

  const breakdown = initialAccount
    ? getAccountTransactionsDelta(initialAccount.id)
    : { income: 0, expense: 0, netDelta: 0, txCount: 0 };

  const parsedEnteredAmount = parseAmount(balance);
  const canonicalEntered = currency === 'rial' ? parsedEnteredAmount / 10 : parsedEnteredAmount;

  // Projected current balance based on edit mode
  const projectedBalance = isReconcileMode
    ? canonicalEntered
    : canonicalEntered + breakdown.netDelta;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً عنوان حساب را وارد نمایید.');
      return;
    }

    const savedAmount = canonicalEntered;

    if (initialAccount) {
      if (isReconcileMode) {
        reconcileAccountBalance(initialAccount.id, savedAmount);
      }

      updateAccount({
        id: initialAccount.id,
        name: name.trim(),
        type,
        balance: projectedBalance,
        initialBalance: isReconcileMode ? savedAmount - breakdown.netDelta : savedAmount,
        bankName: bankName.trim() || undefined,
        cardNumber: cardNumber.replace(/\D/g, '') || undefined,
        shaba: shaba.trim() || undefined,
        color,
        isDefault,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        initialBalance: savedAmount,
        balance: savedAmount,
        bankName: bankName.trim() || undefined,
        cardNumber: cardNumber.replace(/\D/g, '') || undefined,
        shaba: shaba.trim() || undefined,
        color,
        isDefault,
      });
    }

    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <span>{initialAccount ? 'ویرایش حساب بانکی' : 'افزودن حساب یا کارت جدید'}</span>
        </div>
      }
      subtitle="تنظیم موجودی، مشخصات کارت و شماره شبا"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            عنوان حساب / کارت <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: کارت اصلی بانک سامان"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs font-medium outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              نوع حساب
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-violet-500 transition"
            >
              <option value="bank" className="bg-[#18181b] text-white">کارت بانکی</option>
              <option value="cash" className="bg-[#18181b] text-white">کیف پول نقدی</option>
              <option value="savings" className="bg-[#18181b] text-white">سپرده پس‌انداز</option>
              <option value="other" className="bg-[#18181b] text-white">سایر حساب‌ها</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              نام بانک (اختیاری)
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="سامان، ملت، بلو..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        {/* Account Balance & Reconciliation Section */}
        <div className="space-y-2 pt-1">
          {initialAccount && (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-violet-400" />
                  <span>تراز و گردش حساب</span>
                </span>
                <span className="text-[11px] text-fintech-text-muted">
                  {toPersianDigits(breakdown.txCount)} تراکنش ثبت‌شده
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 dark:bg-white/[0.02]">
                  <span className="text-fintech-text-muted">گردش خالص:</span>
                  <span className={`font-mono font-bold ${breakdown.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {breakdown.netDelta >= 0 ? '+' : ''}{formatCurrency(breakdown.netDelta, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 dark:bg-white/[0.02]">
                  <span className="text-fintech-text-muted">موجودی فعلی:</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(initialAccount.balance, currency)}
                  </span>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsReconcileMode(false);
                    const startingBal = initialAccount.initialBalance ?? initialAccount.balance ?? 0;
                    const display = currency === 'rial' ? Math.round(startingBal * 10) : startingBal;
                    setBalance(formatAmountInput(display.toString()));
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    !isReconcileMode
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white/5 text-fintech-text-muted hover:text-white'
                  }`}
                >
                  ویرایش موجودی اولیه
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReconcileMode(true);
                    const display = currency === 'rial' ? Math.round(initialAccount.balance * 10) : initialAccount.balance;
                    setBalance(formatAmountInput(display.toString()));
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    isReconcileMode
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white/5 text-fintech-text-muted hover:text-white'
                  }`}
                >
                  تراز با مانده فعلی بانک
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-fintech-text-primary">
                {isReconcileMode
                  ? `مانده حساب واقعی فعلی (${currency === 'toman' ? 'تومان' : 'ریال'})`
                  : `موجودی اولیه (${currency === 'toman' ? 'تومان' : 'ریال'})`}
              </label>
              <span className="text-[10px] text-fintech-text-muted">
                {isReconcileMode ? 'مانده فعلی گزارش‌شده' : 'مانده در زمان شروع'}
              </span>
            </div>

            <input
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs font-bold font-mono outline-none focus:border-violet-500 transition text-center"
            />

            {parsedEnteredAmount > 0 && (
              <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
                {numberToPersianWords(parsedEnteredAmount, currency)}
              </div>
            )}

            {initialAccount && (
              <div className="mt-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-fintech-text-muted">موجودی محاسبه‌شده پس از ذخیره:</span>
                <span className="font-mono font-bold text-violet-400">
                  {formatCurrency(projectedBalance, currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {type === 'bank' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                شماره کارت (۱۶ رقم)
              </label>
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="6037-xxxx-xxxx-xxxx"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs font-mono outline-none focus:border-violet-500 transition text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                شماره شبا (اختیاری)
              </label>
              <input
                type="text"
                maxLength={26}
                value={shaba}
                onChange={(e) => setShaba(e.target.value.toUpperCase())}
                placeholder="IR..."
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-white text-xs font-mono outline-none focus:border-violet-500 transition text-center"
              />
            </div>
          </div>
        )}

        {/* Card Color Theme */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-2">
            تم رنگ کارت
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform border border-white/20 ${
                  color === c ? 'scale-125 ring-2 ring-violet-400 ring-offset-2 ring-offset-black' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Default Account checkbox */}
        <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 accent-violet-600"
          />
          <span className="text-xs text-fintech-text-muted">
            به عنوان کارت پیش‌فرض انتخاب شود
          </span>
        </label>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {initialAccount ? 'ذخیره تغییرات' : 'ایجاد حساب'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default AccountModal;
