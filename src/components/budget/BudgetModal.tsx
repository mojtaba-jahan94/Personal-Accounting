import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { getCurrentJalaliMonth } from '../../utils/jalali';
import {
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { X, PieChart, CheckCircle2 } from 'lucide-react';

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
      const displayAmount = currency === 'rial' ? Math.round(initialBudget.amount * 10) : initialBudget.amount;
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

    const savedAmount = currency === 'rial' ? (numAmount / 10) : numAmount;

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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {initialBudget ? 'ویرایش سقف بودجه' : 'تعیین بودجه جدید'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                کنترل هزینه‌ها و تعیین سقف مصرف ماهانه
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
        <form id="budget-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              دسته‌بندی هزینه <span className="text-[#C0564B]">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id} className="dark:bg-[#1F2933]">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              سقف بودجه ماهانه ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="مثلاً: 3,000,000"
              className="w-full px-3.5 py-3 rounded-2xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-base font-black outline-none font-mono focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center transition"
            />
            {numAmount > 0 && (
              <div className="mt-1.5 p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                {numberToPersianWords(numAmount, currency)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              ماه مربوطه (سال/ماه شمسی)
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="1403/06"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center transition"
            />
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
            form="budget-form"
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialBudget ? 'ذخیره تغییرات' : 'ثبت بودجه'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
