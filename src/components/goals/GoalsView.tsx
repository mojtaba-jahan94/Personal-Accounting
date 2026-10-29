import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';
import {
  formatCurrency,
  toPersianDigits,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { getTodayJalali, jalaliToGregorian, normalizeJalaliDate } from '../../utils/jalali';
import { GoalModal } from './GoalModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ModalShell } from '../ui/ModalShell';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  Sparkles,
  Check,
  Clock,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, accounts, currency, deleteGoal, contributeToGoal } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Deposit modal state
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccountId, setDepositAccountId] = useState(accounts[0]?.id || '');

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این هدف اطمینان دارید؟')) {
      deleteGoal(id);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const num = parseAmount(depositAmount);
    if (num <= 0) {
      alert('لطفاً مبلغ معتبری وارد کنید.');
      return;
    }

    const savedDeposit = currency === 'rial' ? Math.round(num / 10) : num;
    contributeToGoal(depositGoal.id, savedDeposit, depositAccountId || undefined);

    // If this contribution completes or reaches 100%, trigger confetti!
    if (depositGoal.currentAmount + savedDeposit >= depositGoal.targetAmount) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setDepositGoal(null);
    setDepositAmount('');
  };

  // Helper for smart monthly savings advice
  const getMonthlySavingsAdvice = (goal: Goal, remaining: number) => {
    if (remaining <= 0 || !goal.deadline) return null;
    const cleanTarget = normalizeJalaliDate(goal.deadline);
    const today = getTodayJalali();
    if (cleanTarget <= today) return null;

    try {
      const parts = cleanTarget.split('/');
      const [gy, gm, gd] = jalaliToGregorian(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        parseInt(parts[2], 10)
      );
      const targetDate = new Date(gy, gm - 1, gd);
      const now = new Date();
      const diffMonths = Math.max(
        1,
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
          (targetDate.getMonth() - now.getMonth())
      );
      const monthlyAmount = Math.round(remaining / diffMonths);
      return {
        months: diffMonths,
        monthlyAmount,
      };
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-violet-400 uppercase">
              SAVINGS & FINANCIAL GOALS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fintech-text-primary tracking-tight">
            قلک و اهداف مالی
          </h1>
          <p className="text-xs text-fintech-text-muted mt-1">
            برنامه‌ریزی برای خریدهای مهم، پس‌انداز هدفمند و رویاهای آینده
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          تعریف هدف جدید
        </Button>
      </div>

      {/* 2. Goals Grid */}
      {goals.length === 0 ? (
        <Card variant="glass" className="py-14">
          <EmptyState
            icon={Target}
            title="هنوز هدفی ثبت نشده است"
            description="برای خود یک هدف مالی مثل خرید خودرو، مسافرت یا پس‌انداز اضطراری تعریف کنید."
            actionLabel="تعریف اولین هدف"
            onAction={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal, idx) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const advice = getMonthlySavingsAdvice(goal, remaining);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card
                  variant={isCompleted ? 'gradient' : 'glass'}
                  hoverLift={true}
                  className={`p-5 space-y-4 relative overflow-hidden ${
                    isCompleted ? 'border-emerald-500/30' : ''
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-0 left-0 bg-emerald-500/20 text-emerald-300 border-b border-r border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-br-2xl flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>هدف محقق شد!</span>
                    </div>
                  )}

                  {/* Goal Title & Actions */}
                  <div className="flex items-start justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/10 shadow-sm"
                        style={{ backgroundColor: `${goal.color || '#8b5cf6'}25`, color: goal.color || '#a78bfa' }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-fintech-text-primary">
                          {goal.title}
                        </h3>
                        {goal.category && (
                          <span className="text-[11px] text-violet-400 font-medium">
                            {goal.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        title="ویرایش"
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                        onClick={() => handleDelete(goal.id)}
                        title="حذف"
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fintech-text-muted">پس‌انداز شده:</span>
                    <span className="font-extrabold text-white font-mono tabular-nums">
                      <AnimatedNumber value={goal.currentAmount} currency={currency} />
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <ProgressBar
                      value={percent}
                      colorVariant={isCompleted ? 'emerald' : 'violet'}
                      size="md"
                      animated={true}
                    />
                    <div className="flex items-center justify-between text-[11px] text-fintech-text-muted">
                      <span>پیشرفت: {toPersianDigits(percent)}٪</span>
                      <span className="font-mono tabular-nums">
                        هدف: {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Smart Advice Pill */}
                  {advice && !isCompleted && (
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>پس‌انداز پیشنهادی:</span>
                      </span>
                      <span className="font-bold font-mono tabular-nums">
                        ماهانه {formatCurrency(advice.monthlyAmount, currency)}
                      </span>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-fintech-text-muted">
                      {isCompleted ? (
                        <Badge variant="success" size="sm">تکمیل شده</Badge>
                      ) : (
                        `مانده: ${formatCurrency(remaining, currency)}`
                      )}
                    </span>
                    {!isCompleted && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDepositGoal(goal)}
                        icon={<PiggyBank className="w-3.5 h-3.5 text-violet-400" />}
                      >
                        واریز به قلک
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deposit to Goal Modal */}
      <ModalShell
        isOpen={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        title={`واریز به «${depositGoal?.title || ''}»`}
        subtitle="مبلغ موردنظر را برای اضافه شدن به این هدف وارد کنید"
        size="sm"
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1">
              مبلغ واریزی ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={depositAmount}
              onChange={(e) =>
                setDepositAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))
              }
              placeholder="مثلاً ۱,۰۰۰,۰۰۰"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-sm font-bold outline-none text-white font-mono tabular-nums focus:border-violet-500/60 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1">
              کسر از حساب (اختیاری)
            </label>
            <select
              value={depositAccountId}
              onChange={(e) => setDepositAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none text-white focus:border-violet-500/60 transition"
            >
              <option value="" className="bg-[#18181b] text-white">بدون کسر از موجودی حساب‌ها</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#18181b] text-white">
                  {a.name} (موجودی: {formatCurrency(a.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            icon={<Check className="w-4 h-4 stroke-[2.5]" />}
          >
            تایید و واریز به قلک
          </Button>
        </form>
      </ModalShell>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        initialGoal={editingGoal}
      />
    </div>
  );
};

export default GoalsView;
