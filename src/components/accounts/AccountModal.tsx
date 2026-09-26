import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { X, Check, CreditCard, Scale, Info, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import {
  formatCardNumber,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  formatCurrency,
  toPersianDigits,
} from '../../utils/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount?: Account | null;
}

const PRESET_COLORS = [
  '#dc2626', // Mellat Red
  '#2563eb', // BluBank Blue
  '#059669', // Cash Green
  '#d97706', // Pasargad / Gold Amber
  '#7c3aed', // Purple
  '#0f172a', // Black / Carbon
  '#0284c7', // Sky Blue
  '#db2777', // Pink
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
      const displayBalance = currency === 'rial' ? startingBal * 10 : startingBal;
      setBalance(formatAmountInput(displayBalance.toString()));
      setBankName(initialAccount.bankName || '');
      setCardNumber(initialAccount.cardNumber || '');
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
  const canonicalEntered = currency === 'rial' ? Math.round(parsedEnteredAmount / 10) : parsedEnteredAmount;

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
        // Reconcile mode: adjust initialBalance so that calculated current balance equals savedAmount
        reconcileAccountBalance(initialAccount.id, savedAmount);
      }

      updateAccount({
        id: initialAccount.id,
        name: name.trim(),
        type,
        balance: projectedBalance,
        initialBalance: isReconcileMode ? savedAmount - breakdown.netDelta : savedAmount,
        bankName: bankName.trim() || undefined,
        cardNumber: cardNumber.trim() || undefined,
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
        cardNumber: cardNumber.trim() || undefined,
        shaba: shaba.trim() || undefined,
        color,
        isDefault,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialAccount ? 'ویرایش حساب' : 'افزودن حساب / کارت جدید'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              عنوان حساب / کارت
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: کارت اصلی بانک سامان"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                نوع حساب
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              >
                <option value="bank">کارت بانکی</option>
                <option value="cash">کیف پول نقدی</option>
                <option value="savings">سپرده پس‌انداز</option>
                <option value="other">سایر حساب‌ها</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                نام بانک (اختیاری)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="ملت، ملی، بلو..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          {/* Account Balance & Reconciliation Section */}
          <div className="space-y-2 pt-1">
            {initialAccount && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                    <span>تراز و گردش حساب</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {toPersianDigits(breakdown.txCount)} تراکنش ثبت‌شده
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-900/50">
                    <span className="text-slate-500 dark:text-slate-400">گردش خالص:</span>
                    <span className={`font-mono font-bold ${breakdown.netDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {breakdown.netDelta >= 0 ? '+' : ''}{formatCurrency(breakdown.netDelta, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-900/50">
                    <span className="text-slate-500 dark:text-slate-400">موجودی فعلی:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(initialAccount.balance, currency)}
                    </span>
                  </div>
                </div>

                {/* Mode Selector for existing account */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReconcileMode(false);
                      const startingBal = initialAccount.initialBalance ?? initialAccount.balance ?? 0;
                      const display = currency === 'rial' ? startingBal * 10 : startingBal;
                      setBalance(formatAmountInput(display.toString()));
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      !isReconcileMode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ویرایش موجودی اولیه
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReconcileMode(true);
                      const display = currency === 'rial' ? initialAccount.balance * 10 : initialAccount.balance;
                      setBalance(formatAmountInput(display.toString()));
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      isReconcileMode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    تراز با مانده فعلی بانک
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {isReconcileMode
                    ? `مانده حساب واقعی فعلی (${currency === 'toman' ? 'تومان' : 'ریال'})`
                    : `موجودی اولیه (${currency === 'toman' ? 'تومان' : 'ریال'})`}
                </label>
                <span className="text-[10px] text-slate-400">
                  {isReconcileMode
                    ? 'مانده فعلی گزارش‌شده توسط پیامک یا اپلیکیشن بانک'
                    : 'مانده حساب در زمان شروع استفاده از برنامه'}
                </span>
              </div>

              <input
                type="text"
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono outline-none"
              />

              {/* Live Preview Box */}
              {initialAccount && (
                <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">موجودی محاسبه‌شده پس از ذخیره:</span>
                  <span className="font-mono font-black text-indigo-700 dark:text-indigo-300">
                    {formatCurrency(projectedBalance, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {type === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  شماره کارت (۱۶ رقم)
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="6037-xxxx-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none dir-ltr text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  شماره شبا (اختیاری)
                </label>
                <input
                  type="text"
                  value={shaba}
                  onChange={(e) => setShaba(e.target.value)}
                  placeholder="IR..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none dir-ltr text-center"
                />
              </div>
            </div>
          )}

          {/* Card Color Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              رنگ کارت
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
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
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              به عنوان کارت پیش‌فرض انتخاب شود
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialAccount ? 'ذخیره تغییرات' : 'ایجاد حساب'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
