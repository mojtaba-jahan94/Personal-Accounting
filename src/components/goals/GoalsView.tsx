import React, { useState } from 'react';
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
import { CollapsibleSection } from '../common/CollapsibleSection';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  Sparkles,
  X,
  Check,
  Calendar,
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

    const savedDeposit = currency === 'rial' ? num / 10 : num;
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2]">
            قلک و اهداف مالی
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
            برنامه‌ریزی برای خرید‌های بزرگ، پس‌اندازهای مهم و تحقق اهداف زندگی
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-black shadow-md shadow-[#A68A64]/20 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>هدف جدید</span>
        </button>
      </div>

      {/* Goals Grid (Collapsible) */}
      <CollapsibleSection
        storageKey="goals_grid"
        title="اهداف مالی و قلک‌های پس‌انداز"
        subtitle={`${toPersianDigits(goals.length)} هدف تعریف‌شده`}
        icon={<Target className="w-5 h-5 text-[#A68A64]" />}
        defaultExpanded={true}
        headerAction={
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="text-xs font-bold text-[#A68A64] hover:underline flex items-center gap-1 px-2 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>هدف جدید</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          {goals.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-[#6B7280] text-xs">
              هنوز هدفی ثبت نشده است. با دکمه بالا هدف جدید اضافه کنید.
            </div>
          ) : (
            goals.map((goal) => {
              const percent = Math.min(
                100,
                Math.round((goal.currentAmount / goal.targetAmount) * 100)
              );
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const advice = getMonthlySavingsAdvice(goal, remaining);

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 relative overflow-hidden transition hover:border-[#A68A64]/30 shadow-xs ${
                    isCompleted ? 'border-[#2E7D5B]/40 dark:border-[#2E7D5B]/50' : ''
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-[#2E7D5B] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>هدف محقق شد!</span>
                    </div>
                  )}

                  {/* Goal Title & Actions */}
                  <div className="flex items-start justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: goal.color || '#A68A64' }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                          {goal.title}
                        </h3>
                        {goal.category && (
                          <span className="text-[11px] text-[#A68A64] font-medium">
                            {goal.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A68A64] hover:bg-[#6B7280]/10 transition"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0564B] hover:bg-[#C0564B]/10 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">پس‌انداز شده:</span>
                    <span className="font-bold text-[#1F2933] dark:text-[#F7F7F2] font-mono tabular-nums">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[#2E7D5B]' : 'bg-[#A68A64]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span>پیشرفت: {toPersianDigits(percent)}٪</span>
                      <span className="font-mono tabular-nums">
                        هدف: {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Smart Advice Pill if available */}
                  {advice && !isCompleted && (
                    <div className="p-2 rounded-xl bg-[#A68A64]/10 border border-[#A68A64]/20 text-[11px] text-[#A68A64] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>پس‌انداز پیشنهادی:</span>
                      </span>
                      <span className="font-bold font-mono tabular-nums">
                        ماهانه {formatCurrency(advice.monthlyAmount, currency)}
                      </span>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#6B7280]">
                      {isCompleted
                        ? 'تبریک! هدف محقق شد'
                        : `مانده: ${formatCurrency(remaining, currency)}`}
                    </span>
                    {!isCompleted && (
                      <button
                        onClick={() => setDepositGoal(goal)}
                        className="px-3 py-1.5 rounded-xl bg-[#A68A64]/15 hover:bg-[#A68A64]/25 text-[#A68A64] text-xs font-bold transition flex items-center gap-1 active:scale-95"
                      >
                        <PiggyBank className="w-3.5 h-3.5" />
                        <span>واریز به قلک</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CollapsibleSection>

      {/* Deposit to Goal Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2933]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#F7F7F2] dark:bg-[#1F2933] rounded-3xl p-5 shadow-2xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-[#A68A64]" />
                <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  واریز به «{depositGoal.title}»
                </h4>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 text-[#6B7280] hover:bg-[#6B7280]/10 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
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
                  placeholder="مبلغ واریز..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-bold outline-none text-[#1F2933] dark:text-[#F7F7F2] font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
                  کسر از حساب (اختیاری)
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                >
                  <option value="">بدون کسر از موجودی کارت‌ها</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (موجودی: {formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>تایید و واریز به قلک</span>
              </button>
            </form>
          </div>
        </div>
      )}

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
