import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { BudgetModal } from './BudgetModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Layers,
  Scale,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { budgets, transactions, categories, currency, deleteBudget } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Compute total budgeted and total spent in budgeted categories
  let totalBudgetAmount = 0;
  let totalSpentAmount = 0;

  const budgetItemsWithStats = budgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId);
    const spent = transactions
      .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    totalBudgetAmount += b.amount;
    totalSpentAmount += spent;

    const percent = Math.round((spent / b.amount) * 100);
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
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            بودجه‌بندی هوشمند
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            کنترل مخارج ماهانه و جلوگیری از هزینه‌های غیرضروری
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>تعریف بودجه جدید</span>
        </button>
      </div>

      {/* 1. Overview Stat Box (Collapsible) */}
      <CollapsibleSection
        storageKey="budget_overview_card"
        title="خلاصه کلی وضعیت بودجه ماهانه"
        subtitle={`مصرف ${toPersianDigits(overallPercent)}٪ از کل سقف تعیین‌شده`}
        icon={<Scale className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
      >
        <div className="pt-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                مجموع مصارف در برابر سقف کل
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(totalSpentAmount, currency)}
                <span className="text-xs font-normal text-slate-400 mr-2">
                  از مجموع {formatCurrency(totalBudgetAmount, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left">
                <span className="text-xs text-slate-400 block">باقیمانده آزاد:</span>
                <span
                  className={`text-base font-bold font-mono ${
                    totalBudgetAmount - totalSpentAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(totalBudgetAmount - totalSpentAmount, currency)}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-sm font-black">
                {toPersianDigits(overallPercent)}٪ مصرف شده
              </div>
            </div>
          </div>

          {/* Global Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallPercent > 100
                  ? 'bg-rose-500'
                  : overallPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Budget Items Grid (Collapsible) */}
      <CollapsibleSection
        storageKey="budget_items_grid"
        title="سقف بودجه‌های دسته‌بندی‌شده"
        subtitle={`${toPersianDigits(budgetItemsWithStats.length)} دسته‌بندی با سقف بودجه معین`}
        icon={<Layers className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
        headerAction={
          <button
            onClick={e => {
              e.stopPropagation();
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 px-2 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>بودجه جدید</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {budgetItemsWithStats.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-xs text-slate-400">
              هنوز بودجه‌ای تعریف نکرده‌اید. با دکمه بالا بودجه جدید تعریف کنید.
            </div>
          ) : (
            budgetItemsWithStats.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: item.category?.color || '#6366f1' }}
                    >
                      {item.category ? (
                        getCategoryIcon(item.category.icon)
                      ) : (
                        <PieChart className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.category?.name || 'دسته‌بندی'}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        دوره: {toPersianDigits(item.month)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="ویرایش بودجه"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="حذف بودجه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">
                      مصرف: {formatCurrency(item.spent, currency)}
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        item.isExceeded
                          ? 'text-rose-600'
                          : item.isNearLimit
                          ? 'text-amber-500'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {toPersianDigits(item.percent)}٪
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.isExceeded
                          ? 'bg-rose-500'
                          : item.isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>
                </div>

                {/* Status Message Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  {item.isExceeded ? (
                    <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[11px]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        عبور از سقف به مقدار {formatCurrency(Math.abs(item.remaining), currency)}
                      </span>
                    </div>
                  ) : item.isNearLimit ? (
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>نزدیک به سقف (باقیمانده: {formatCurrency(item.remaining, currency)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>مناسب (باقیمانده: {formatCurrency(item.remaining, currency)})</span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    سقف: {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CollapsibleSection>

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
