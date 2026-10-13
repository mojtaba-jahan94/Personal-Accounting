import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';
import {
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import { X, Target, CheckCircle2 } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: Goal | null;
}

const PRESET_GOAL_ICONS = ['Laptop', 'Compass', 'ShieldCheck', 'Home', 'Car', 'Gift', 'GraduationCap'];
const PRESET_GOAL_COLORS = [
  '#A68A64', // Warm Wood
  '#2E7D5B', // Sage Emerald
  '#4A6FA5', // Fjord Blue
  '#C0564B', // Terracotta Rose
  '#d97706', // Gold Amber
  '#1F2933', // Charcoal
];

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
  const [color, setColor] = useState(PRESET_GOAL_COLORS[0]);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      const displayTarget = currency === 'rial' ? Math.round(initialGoal.targetAmount * 10) : initialGoal.targetAmount;
      const displayCurrent = currency === 'rial' ? Math.round(initialGoal.currentAmount * 10) : initialGoal.currentAmount;
      setTargetAmount(formatAmountInput(displayTarget.toString()));
      setCurrentAmount(formatAmountInput(displayCurrent.toString()));
      setDeadline(initialGoal.deadline || '');
      setCategory(initialGoal.category || '');
      setIcon(initialGoal.icon || PRESET_GOAL_ICONS[0]);
      setColor(initialGoal.color || PRESET_GOAL_COLORS[0]);
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setCategory('');
      setIcon(PRESET_GOAL_ICONS[0]);
      setColor(PRESET_GOAL_COLORS[0]);
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

    const savedTarget = currency === 'rial' ? (numTarget / 10) : numTarget;
    const rawCurrent = parseAmount(currentAmount);
    const savedCurrent = currency === 'rial' ? (rawCurrent / 10) : rawCurrent;

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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {initialGoal ? 'ویرایش هدف مالی' : 'ایجاد هدف مالی جدید'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                تعیین مقصد پس‌انداز و پایش خودکار پیشرفت
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
        <form id="goal-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              عنوان هدف <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: پس‌انداز خرید خودرو یا لپ‌تاپ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                مبلغ هدف ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="50,000,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                موجودی فعلی ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
              />
            </div>
          </div>

          {/* Live Words Preview */}
          {numTarget > 0 && (
            <div className="p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
              مبلغ هدف: {numberToPersianWords(numTarget, currency)}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <JalaliDatePicker
                value={deadline}
                onChange={setDeadline}
                label="مهلت دستیابی (سررسید)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                دسته‌بندی (اختیاری)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="سفر، سرمایه، تجهیزات..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
              />
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-2">
              رنگ شاخص هدف
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_GOAL_COLORS.map(c => (
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
            form="goal-form"
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialGoal ? 'ذخیره تغییرات' : 'ایجاد هدف مالی'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
