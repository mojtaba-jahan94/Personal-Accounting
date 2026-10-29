import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { BudgetModal } from './BudgetModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  PieChart,
  PiggyBank,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { budgets, transactions, categories, currency, deleteBudget } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Compute total budgeted and total spent in budgeted categories
  let totalBudgetAmount = 0;
  let totalSpentAmount = 0;

  const budgetItemsWithStats = budgets.map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const currentMonthPrefix = getTodayJalali().split('/').slice(0, 2).join('/');
    const targetMonth = b.month ? b.month.replace(/-/g, '/') : currentMonthPrefix;
    const spent = transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.categoryId !== b.categoryId) return false;
        return t.date.replace(/-/g, '/').startsWith(targetMonth);
      })
      .reduce((sum, t) => sum + t.amount, 0);

    totalBudgetAmount += b.amount;
    totalSpentAmount += spent;

    const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    const remaining = b.amount - spent;

    return {
      ...b,
      category: cat,
      spent,
      percent,
      remaining,
      isExceeded: spent > b.amount,
      isNearLimit: percent >= 80 && percent <= 100,
    };
  });

  const overallPercent =
    totalBudgetAmount > 0 ? Math.round((totalSpentAmount / totalBudgetAmount) * 100) : 0;

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این بودجه اطمینان دارید؟')) {
      deleteBudget(id);
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
              BUDGETING & EXPENSE LIMITS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fintech-text-primary tracking-tight">
            بودجه‌بندی هوشمند
          </h1>
          <p className="text-xs text-fintech-text-muted mt-1">
            تعیین سقف مخارج ماهانه برای دسته‌بندی‌ها و جلوگیری از هزینه‌های ناخواسته
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          تعریف بودجه جدید
        </Button>
      </div>

      {/* 2. Overview Hero Card */}
      <Card variant="gradient" className="p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-mono text-violet-300 font-bold block mb-1">
              مجموع مصارف در برابر سقف کل
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono flex items-baseline gap-2 flex-wrap">
              <AnimatedNumber value={totalSpentAmount} currency={currency} />
              <span className="text-xs font-sans text-white/60">
                از مجموع <AnimatedNumber value={totalBudgetAmount} currency={currency} />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <div className="text-left">
              <span className="text-[10px] text-white/60 block font-mono">باقیمانده آزاد:</span>
              <span
                className={`text-lg font-bold font-mono ${
                  totalBudgetAmount - totalSpentAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <AnimatedNumber value={Math.abs(totalBudgetAmount - totalSpentAmount)} currency={currency} />
              </span>
            </div>
            <Badge
              variant={overallPercent > 100 ? 'danger' : overallPercent > 80 ? 'warning' : 'success'}
              size="md"
            >
              {toPersianDigits(overallPercent)}٪ مصرف
            </Badge>
          </div>
        </div>

        {/* Global Progress Bar */}
        <ProgressBar
          value={overallPercent}
          variant={overallPercent > 100 ? 'danger' : overallPercent > 80 ? 'amber' : 'emerald'}
          size="md"
          animated={true}
        />
      </Card>

      {/* 3. Budget Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-fintech-text-primary">
              سقف بودجه‌های فعال
            </h2>
            <p className="text-xs text-fintech-text-muted mt-0.5">
              {toPersianDigits(budgetItemsWithStats.length)} دسته‌بندی با سقف بودجه تعیین شده
            </p>
          </div>
        </div>

        {budgetItemsWithStats.length === 0 ? (
          <Card variant="glass" className="py-12">
            <EmptyState
              icon={PiggyBank}
              title="هنوز بودجه‌ای تعریف نکرده‌اید"
              description="با تعیین سقف بودجه برای دسته‌بندی‌های پرتکرار، مخارج خود را کنترل کنید."
              actionLabel="تعریف اولین بودجه"
              onAction={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetItemsWithStats.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card variant="glass" hoverLift={true} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/10"
                        style={{
                          backgroundColor: `${item.category?.color || '#8b5cf6'}20`,
                          color: item.category?.color || '#a78bfa',
                        }}
                      >
                        {item.category ? (
                          getCategoryIcon(item.category.icon, 'w-5 h-5')
                        ) : (
                          <PieChart className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-fintech-text-primary">
                          {item.category?.name || 'دسته‌بندی'}
                        </h3>
                        <span className="text-[10px] text-fintech-text-muted font-mono">
                          دوره: {toPersianDigits(item.month)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingBudget(item);
                          setIsModalOpen(true);
                        }}
                        title="ویرایش بودجه"
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                        onClick={() => handleDelete(item.id)}
                        title="حذف بودجه"
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-fintech-text-muted font-mono text-[11px]">
                        مصرف: {formatCurrency(item.spent, currency)}
                      </span>
                      <span
                        className={`font-bold font-mono text-xs ${
                          item.isExceeded
                            ? 'text-rose-400'
                            : item.isNearLimit
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {toPersianDigits(item.percent)}٪
                      </span>
                    </div>

                    <ProgressBar
                      value={item.percent}
                      variant={item.isExceeded ? 'danger' : item.isNearLimit ? 'amber' : 'emerald'}
                      size="sm"
                      animated={true}
                    />
                  </div>

                  {/* Status Message Footer */}
                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    {item.isExceeded ? (
                      <div className="flex items-center gap-1.5 text-rose-400 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          عبور از سقف به مقدار {formatCurrency(Math.abs(item.remaining), currency)}
                        </span>
                      </div>
                    ) : item.isNearLimit ? (
                      <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>نزدیک به سقف (مانده: {formatCurrency(item.remaining, currency)})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>مناسب (مانده: {formatCurrency(item.remaining, currency)})</span>
                      </div>
                    )}
                    <span className="text-[11px] text-fintech-text-muted font-mono">
                      سقف: {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        initialBudget={editingBudget}
      />
    </div>
  );
};

export default BudgetView;
