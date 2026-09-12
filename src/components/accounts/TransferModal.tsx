import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayJalali } from '../../utils/jalali';
import { formatCurrency, numberToWordsPersian } from '../../utils/formatters';
import { X, ArrowLeftRight, Check } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    if (fromAcc && fromAcc.balance < numAmount) {
      if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ است. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }

    addTransaction({
      type: 'transfer',
      amount: numAmount,
      date,
      description: description.trim() || `انتقال از ${fromAcc?.name} به ${toAcc?.name}`,
      categoryId: 'cat-other-exp',
      accountId: fromAccountId,
      toAccountId,
      fee: parseFloat(fee) || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              انتقال وجه بین حساب‌ها
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              حساب مبدأ (کسر از)
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (موجودی: {formatCurrency(acc.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              حساب مقصد (واریز به)
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
            >
              {accounts
                .filter(a => a.id !== fromAccountId)
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (موجودی: {formatCurrency(acc.balance, currency)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              مبلغ انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثلاً: 500000"
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black outline-none font-mono"
            />
            {numAmount > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 leading-relaxed">
                معادل: {numberToWordsPersian(numAmount, currency)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                کارمزد پایا / کارت به کارت
              </label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                تاریخ شمسی
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              شرح یا بابت
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: انتقال به کارت خرید روزمره"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>ثبت و انجام انتقال وجه</span>
          </button>
        </form>
      </div>
    </div>
  );
};
