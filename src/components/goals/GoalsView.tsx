import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { GoalModal } from './GoalModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  CheckCircle,
  Calendar,
  Sparkles,
  X,
  Check,
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
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) {
      alert('لطفاً مبلغ معتبری وارد کنید.');
      return;
    }

    contributeToGoal(depositGoal.id, num, depositAccountId || undefined);

    // If this contribution completes or reaches 100%, trigger confetti!
    if (depositGoal.currentAmount + num >= depositGoal.targetAmount) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setDepositGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">قلک و اهداف مالی</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            برنامه‌ریزی برای خرید‌های بزرگ، سفرها و پس‌اندازهای مهم
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>هدف جدید</span>
        </button>
      </div>

      {/* Goals Grid (Collapsible) */}
      <CollapsibleSection
        storageKey="goals_grid"
        title="اهداف مالی و قلک‌های پس‌انداز"
        subtitle={`${toPersianDigits(goals.length)} هدف تعریف‌شده`}
        icon={<Target className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
        headerAction={
          <button
            onClick={e => {
              e.stopPropagation();
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 px-2 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>هدف جدید</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          {goals.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
              هنوز هدفی ثبت نشده است. با دکمه بالا هدف جدید اضافه کنید.
            </div>
          ) : (
            goals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 space-y-4 relative overflow-hidden transition hover:-translate-y-0.5 ${
                    isCompleted ? 'border-emerald-300 dark:border-emerald-800' : ''
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>هدف تکمیل شد!</span>
                    </div>
                  )}

                  {/* Goal Title & Actions */}
                  <div className="flex items-start justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: goal.color || '#4f46e5' }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{goal.title}</h3>
                        {goal.category && (
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">پس‌انداز شده:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>پیشرفت: {toPersianDigits(percent)}٪</span>
                      <span className="font-mono">هدف: {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      {isCompleted ? 'تبریک! هدف محقق شد' : `مانده: ${formatCurrency(remaining, currency)}`}
                    </span>
                    {!isCompleted && (
                      <button
                        onClick={() => setDepositGoal(goal)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  واریز به «{depositGoal.title}»
                </h4>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  مبلغ واریزی ({currency === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="مبلغ واریز..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  کسر از حساب (اختیاری)
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                >
                  <option value="">بدون کسر از موجودی کارت‌ها</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (موجودی: {formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
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
