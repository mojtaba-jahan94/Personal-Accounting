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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { Target, CheckCircle2 } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: Goal | null;
}

const PRESET_GOAL_ICONS = ['Laptop', 'Compass', 'ShieldCheck', 'Home', 'Car', 'Gift', 'GraduationCap'];
const PRESET_GOAL_COLORS = [
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#a855f7', // Purple
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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <span>{initialGoal ? 'ویرایش هدف مالی' : 'ایجاد هدف مالی جدید'}</span>
        </div>
      }
      subtitle="تعیین مقصد پس‌انداز و پایش خودکار پیشرفت"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            عنوان هدف <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: پس‌انداز خرید خودرو یا لپ‌تاپ"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              مبلغ هدف ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="50,000,000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500 text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              موجودی فعلی ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500 text-center"
            />
          </div>
        </div>

        {/* Live Words Preview */}
        {numTarget > 0 && (
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
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
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              دسته‌بندی (اختیاری)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="سفر، سرمایه، تجهیزات..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-2">
            رنگ شاخص هدف
          </label>
          <div className="flex items-center gap-2.5">
            {PRESET_GOAL_COLORS.map((c) => (
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {initialGoal ? 'ذخیره تغییرات' : 'ایجاد هدف مالی'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default GoalModal;
