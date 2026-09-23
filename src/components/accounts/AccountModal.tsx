import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { X, Check, CreditCard } from 'lucide-react';
import { formatCardNumber, parseAmount, sanitizeAmountInput, formatAmountInput } from '../../utils/formatters';

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
  const { addAccount, updateAccount, currency } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [shaba, setShaba] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialAccount) {
      setName(initialAccount.name);
      setType(initialAccount.type);
      const displayBalance = currency === 'rial' ? initialAccount.balance * 10 : initialAccount.balance;
      setBalance(formatAmountInput(displayBalance.toString()));
      setBankName(initialAccount.bankName || '');
      setCardNumber(initialAccount.cardNumber || '');
      setShaba(initialAccount.shaba || '');
      setColor(initialAccount.color || PRESET_COLORS[0]);
      setIsDefault(!!initialAccount.isDefault);
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setBankName('');
      setCardNumber('');
      setShaba('');
      setColor(PRESET_COLORS[0]);
      setIsDefault(false);
    }
  }, [initialAccount, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً عنوان حساب را وارد نمایید.');
      return;
    }

    const rawBalance = parseAmount(balance);
    const savedBalance = currency === 'rial' ? Math.round(rawBalance / 10) : rawBalance;

    const accData = {
      name: name.trim(),
      type,
      balance: savedBalance,
      bankName: bankName.trim() || undefined,
      cardNumber: cardNumber.trim() || undefined,
      shaba: shaba.trim() || undefined,
      color,
      isDefault,
    };

    if (initialAccount) {
      updateAccount({ ...accData, id: initialAccount.id });
    } else {
      addAccount(accData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialAccount ? 'ویرایش حساب' : 'افزودن حساب / کارت جدید'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              موجودی اولیه ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono outline-none"
            />
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
          <label className="flex items-center gap-2 pt-1 cursor-pointer">
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
