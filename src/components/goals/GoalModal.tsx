import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';
import { numberToWordsPersian, parseAmount, sanitizeAmountInput, formatAmountInput } from '../../utils/formatters';
import { X, Check, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: Goal | null;
}

const PRESET_GOAL_ICONS = ['Laptop', 'Compass', 'ShieldCheck', 'Home', 'Car', 'Gift', 'GraduationCap'];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  initialGoal,
}) => {
  const { addGoal, updateGoal, currency } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(PRESET_GOAL_ICONS[0]);
  const [color, setColor] = useState('#4f46e5');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      const displayTarget = currency === 'rial' ? initialGoal.targetAmount * 10 : initialGoal.targetAmount;
      const displayCurrent = currency === 'rial' ? initialGoal.currentAmount * 10 : initialGoal.currentAmount;
      setTargetAmount(formatAmountInput(displayTarget.toString()));
      setCurrentAmount(formatAmountInput(displayCurrent.toString()));
      setDeadline(initialGoal.deadline || '');
      setCategory(initialGoal.category || '');
      setIcon(initialGoal.icon || PRESET_GOAL_ICONS[0]);
      setColor(initialGoal.color || '#4f46e5');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setCategory('');
      setIcon(PRESET_GOAL_ICONS[0]);
      setColor('#4f46e5');
    }
  }, [initialGoal, isOpen, currency]);

  if (!isOpen) return null;

  const numTarget = parseAmount(targetAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numTarget <= 0) {
      alert('لطفاً عنوان و مبلغ هدف معتبری وارد کنید.');
      return;
    }

    const savedTarget = currency === 'rial' ? Math.round(numTarget / 10) : numTarget;
    const rawCurrent = parseAmount(currentAmount);
    const savedCurrent = currency === 'rial' ? Math.round(rawCurrent / 10) : rawCurrent;

    const goalData = {
      title: title.trim(),
      targetAmount: savedTarget,
      currentAmount: savedCurrent,
      deadline: deadline.trim() || undefined,
      category: category.trim() || undefined,
      icon,
      color,
    };

    if (initialGoal) {
      updateGoal({ ...goalData, id: initialGoal.id });
    } else {
      addGoal(goalData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialGoal ? 'ویرایش هدف مالی' : 'ایجاد هدف مالی جدید'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              عنوان هدف
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: پس‌انداز خرید خودرو یا لپ‌تاپ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                مبلغ هدف ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="50,000,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                موجودی فعلی پس‌انداز ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>
          </div>

          {numTarget > 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              معادل مبلغ هدف: {numberToWordsPersian(numTarget, currency)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                مهلت دستیابی (شمسی)
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="1403/12/29"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                دسته‌بندی (اختیاری)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="سفر، سرمایه..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialGoal ? 'ذخیره تغییرات' : 'ایجاد هدف مالی'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
