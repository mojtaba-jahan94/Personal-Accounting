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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { PieChart, Check } from 'lucide-react';

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

  const expenseCategories = categories.filter((c) => c.type === 'expense');

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

    const savedAmount = currency === 'rial' ? numAmount / 10 : numAmount;

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <span>{initialBudget ? 'ویرایش سقف بودجه' : 'تعیین بودجه جدید'}</span>
        </div>
      }
      subtitle="کنترل هزینه‌ها و تعیین سقف مصرف ماهانه"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            دسته‌بندی هزینه <span className="text-rose-400">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none focus:border-violet-500 text-white transition"
          >
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#18181b] text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            سقف بودجه ماهانه ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
            placeholder="مثلاً: ۳,۰۰۰,۰۰۰"
            className="w-full px-3.5 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-base font-bold outline-none font-mono focus:border-violet-500 text-white text-center transition"
          />
          {numAmount > 0 && (
            <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
              {numberToPersianWords(numAmount, currency)}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            ماه مربوطه (سال/ماه شمسی)
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="1403/08"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold outline-none focus:border-violet-500 text-white text-center transition"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            icon={<Check className="w-4 h-4 stroke-[2.5]" />}
          >
            {initialBudget ? 'ذخیره تغییرات' : 'ثبت سقف بودجه'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default BudgetModal;
