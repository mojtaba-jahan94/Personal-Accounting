import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { X, Check, CreditCard, Scale, CheckCircle2 } from 'lucide-react';
import {
  formatCardNumber,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  formatCurrency,
  toPersianDigits,
  numberToPersianWords,
} from '../../utils/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount?: Account | null;
}

const PRESET_COLORS = [
  '#1F2933', // Nordic Charcoal / Carbon
  '#A68A64', // Warm Wood
  '#2E7D5B', // Sage Emerald
  '#4A6FA5', // Fjord Blue
  '#C0564B', // Terracotta Rose
  '#dc2626', // Mellat Red
  '#2563eb', // BluBank Blue
  '#d97706', // Gold Amber
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
  const canonicalEntered = currency === 'rial' ? (parsedEnteredAmount / 10) : parsedEnteredAmount;

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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {initialAccount ? 'ویرایش حساب بانکی' : 'افزودن حساب یا کارت جدید'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                تنظیم موجودی، مشخصات کارت و شماره شبا
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
        <form id="account-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              عنوان حساب / کارت <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: کارت اصلی بانک سامان"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-medium outline-none focus:border-[#A68A64] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                نوع حساب
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs outline-none focus:border-[#A68A64] transition"
              >
                <option value="bank" className="dark:bg-[#1F2933]">کارت بانکی</option>
                <option value="cash" className="dark:bg-[#1F2933]">کیف پول نقدی</option>
                <option value="savings" className="dark:bg-[#1F2933]">سپرده پس‌انداز</option>
                <option value="other" className="dark:bg-[#1F2933]">سایر حساب‌ها</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                نام بانک (اختیاری)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="سامان، ملت، بلو..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs outline-none focus:border-[#A68A64] transition"
              />
            </div>
          </div>

          {/* Account Balance & Reconciliation Section */}
          <div className="space-y-2 pt-1">
            {initialAccount && (
              <div className="p-3.5 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>تراز و گردش حساب</span>
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]">
                    {toPersianDigits(breakdown.txCount)} تراکنش ثبت‌شده
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-[#1F2933]/60">
                    <span className="text-[#6B7280] dark:text-[#D1D5DB]">گردش خالص:</span>
                    <span className={`font-mono font-bold ${breakdown.netDelta >= 0 ? 'text-[#2E7D5B] dark:text-[#4ADE80]' : 'text-[#C0564B] dark:text-[#F87171]'}`}>
                      {breakdown.netDelta >= 0 ? '+' : ''}{formatCurrency(breakdown.netDelta, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-[#1F2933]/60">
                    <span className="text-[#6B7280] dark:text-[#D1D5DB]">موجودی فعلی:</span>
                    <span className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
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
                      const display = currency === 'rial' ? Math.round(startingBal * 10) : startingBal;
                      setBalance(formatAmountInput(display.toString()));
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      !isReconcileMode
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                        : 'bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
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
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      isReconcileMode
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                        : 'bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
                    }`}
                  >
                    تراز با مانده فعلی بانک
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  {isReconcileMode
                    ? `مانده حساب واقعی فعلی (${currency === 'toman' ? 'تومان' : 'ریال'})`
                    : `موجودی اولیه (${currency === 'toman' ? 'تومان' : 'ریال'})`}
                </label>
                <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
                  {isReconcileMode
                    ? 'مانده فعلی گزارش‌شده توسط پیامک یا اپلیکیشن'
                    : 'مانده حساب در زمان شروع'}
                </span>
              </div>

              <input
                type="text"
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold font-mono outline-none focus:border-[#A68A64] transition text-center"
              />

              {/* Live Persian Words Preview */}
              {parsedEnteredAmount > 0 && (
                <div className="mt-1.5 p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                  {numberToPersianWords(parsedEnteredAmount, currency)}
                </div>
              )}

              {/* Live Projected Calculation Preview */}
              {initialAccount && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280] dark:text-[#D1D5DB]">موجودی محاسبه‌شده پس از ذخیره:</span>
                  <span className="font-mono font-black text-[#A68A64]">
                    {formatCurrency(projectedBalance, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {type === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  شماره کارت (۱۶ رقم)
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="6037-xxxx-xxxx-xxxx"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-mono outline-none focus:border-[#A68A64] transition text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  شماره شبا (اختیاری)
                </label>
                <input
                  type="text"
                  maxLength={26}
                  value={shaba}
                  onChange={(e) => setShaba(e.target.value.toUpperCase())}
                  placeholder="IR..."
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-mono outline-none focus:border-[#A68A64] transition text-center"
                />
              </div>
            </div>
          )}

          {/* Card Color Theme */}
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-2">
              تم رنگ کارت
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform border border-white/20 ${
                    color === c ? 'scale-125 ring-2 ring-[#A68A64] ring-offset-2 dark:ring-offset-[#1F2933]' : 'hover:scale-110'
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
              className="w-4 h-4 rounded text-[#A68A64] focus:ring-[#A68A64]"
            />
            <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
              به عنوان کارت پیش‌فرض انتخاب شود
            </span>
          </label>
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
            form="account-form"
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialAccount ? 'ذخیره تغییرات' : 'ایجاد حساب'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
