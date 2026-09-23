import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { getCurrentJalaliMonth } from '../../utils/jalali';
import { numberToWordsPersian, parseAmount, sanitizeAmountInput, formatAmountInput } from '../../utils/formatters';
import { X, Check, PieChart } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  initialBudget,
}) => {
  const { categories, addBudget, updateBudget, currency } = useFinance();

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(getCurrentJalaliMonth());

  useEffect(() => {
    if (initialBudget) {
      setCategoryId(initialBudget.categoryId);
      const displayAmount = currency === 'rial' ? initialBudget.amount * 10 : initialBudget.amount;
      setAmount(formatAmountInput(displayAmount.toString()));
      setMonth(initialBudget.month);
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setAmount('');
      setMonth(getCurrentJalaliMonth());
    }
  }, [initialBudget, isOpen, currency]);

  if (!isOpen) return null;

  const numAmount = parseAmount(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً سقف بودجه معتبری وارد کنید.');
      return;
    }

    const savedAmount = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;

    if (initialBudget) {
      updateBudget({
        id: initialBudget.id,
        categoryId,
        amount: savedAmount,
        month,
      });
    } else {
      addBudget({
        categoryId,
        amount: savedAmount,
        month,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialBudget ? 'ویرایش سقف بودجه' : 'تعیین بودجه جدید'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              دسته‌بندی هزینه
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              سقف بودجه ماهانه ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="مثلاً: 3,000,000"
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black outline-none font-mono"
            />
            {numAmount > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 leading-relaxed">
                معادل: {numberToWordsPersian(numAmount, currency)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              ماه مربوطه (سال/ماه شمسی)
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="1403/06"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialBudget ? 'ذخیره سقف بودجه' : 'ثبت بودجه'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
