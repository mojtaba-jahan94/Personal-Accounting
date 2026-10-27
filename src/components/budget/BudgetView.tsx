import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { BudgetModal } from './BudgetModal';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  PieChart,
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
    const normalizedMonth = b.month ? b.month.replace(/-/g, '/') : '';
    const spent = transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.categoryId !== b.categoryId) return false;
        if (!normalizedMonth) return true;
        return t.date.replace(/-/g, '/').startsWith(normalizedMonth);
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
    <div className="space-y-7 pb-16">
      {/* Top Header */}
      <div>
        <div className="text-[10px] tracking-[0.22em] text-[#8E8B82] uppercase font-mono">
          کنترل مخارج ماهانه • سقف بودجه
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1.5">
          <div>
            <h1 className="text-3xl font-serif font-light text-[#F4F0EA] tracking-tight">
              بودجه‌بندی هوشمند (Budgets)
            </h1>
            <p className="text-xs text-[#8E8B82] mt-1 font-light">
              تعیین سقف مصرف برای دسته‌بندی‌ها و جلوگیری از هزینه‌های مازاد
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DFC296] text-[#0A0A0C] text-xs font-semibold shadow-[0_0_15px_rgba(223,194,150,0.3)] transition active:scale-95 self-start sm:self-auto hover:bg-[#c9ab81]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>تعریف بودجه جدید</span>
          </button>
        </div>
      </div>

      {/* 1. Overview Stat Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-white/[0.08] shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8E8B82] block mb-1">
              مجموع مصارف در برابر سقف کل
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-light text-[#F4F0EA] font-mono tabular-nums">
              {formatCurrency(totalSpentAmount, currency)}
              <span className="text-sm font-sans font-light text-[#8E8B82] mr-3">
                از مجموع {formatCurrency(totalBudgetAmount, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <div className="text-left">
              <span className="text-[10px] text-[#8E8B82] block font-mono">باقیمانده آزاد:</span>
              <span
                className={`text-lg font-serif font-light tabular-nums ${
                  totalBudgetAmount - totalSpentAmount >= 0
                    ? 'text-[#7A9A95]'
                    : 'text-[#C98A82]'
                }`}
              >
                {formatCurrency(totalBudgetAmount - totalSpentAmount, currency)}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#DFC296]/15 border border-[#DFC296]/30 text-[#DFC296] text-xs font-mono tabular-nums font-semibold">
              {toPersianDigits(overallPercent)}٪ مصرف
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              overallPercent > 100
                ? 'bg-[#C98A82]'
                : overallPercent > 80
                ? 'bg-[#DFC296]'
                : 'bg-[#7A9A95]'
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* 2. Budget Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-light text-[#F4F0EA]">
              سقف بودجه‌های دسته‌بندی‌شده
            </h3>
            <p className="text-xs text-[#8E8B82]">
              {toPersianDigits(budgetItemsWithStats.length)} دسته‌بندی با سقف بودجه معین
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetItemsWithStats.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-xs text-[#8E8B82] rounded-3xl bg-[#121215] border border-dashed border-white/10">
              هنوز بودجه‌ای تعریف نکرده‌اید. با دکمه بالا بودجه جدید تعریف کنید.
            </div>
          ) : (
            budgetItemsWithStats.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#121215] border border-white/[0.08] hover:border-white/20 transition-all space-y-4 shadow-lg group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: `${item.category?.color || '#DFC296'}25`, color: item.category?.color || '#DFC296' }}
                    >
                      {item.category ? (
                        getCategoryIcon(item.category.icon, 'w-5 h-5')
                      ) : (
                        <PieChart className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#F4F0EA]">
                        {item.category?.name || 'دسته‌بندی'}
                      </h4>
                      <span className="text-[10px] text-[#8E8B82] font-mono">
                        دوره: {toPersianDigits(item.month)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingBudget(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#8E8B82] hover:text-[#DFC296] hover:bg-white/5 transition"
                      title="ویرایش بودجه"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#8E8B82] hover:text-[#C98A82] hover:bg-white/5 transition"
                      title="حذف بودجه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E8B82] font-mono tabular-nums text-[11px]">
                      مصرف: {formatCurrency(item.spent, currency)}
                    </span>
                    <span
                      className={`font-semibold font-mono tabular-nums text-xs ${
                        item.isExceeded
                          ? 'text-[#C98A82]'
                          : item.isNearLimit
                          ? 'text-[#DFC296]'
                          : 'text-[#7A9A95]'
                      }`}
                    >
                      {toPersianDigits(item.percent)}٪
                    </span>
                  </div>

                  <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isExceeded
                          ? 'bg-[#C98A82]'
                          : item.isNearLimit
                          ? 'bg-[#DFC296]'
                          : 'bg-[#7A9A95]'
                      }`}
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>
                </div>

                {/* Status Message Footer */}
                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  {item.isExceeded ? (
                    <div className="flex items-center gap-1.5 text-[#C98A82] text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        عبور از سقف به مقدار {formatCurrency(Math.abs(item.remaining), currency)}
                      </span>
                    </div>
                  ) : item.isNearLimit ? (
                    <div className="flex items-center gap-1.5 text-[#DFC296] text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>نزدیک به سقف (مانده: {formatCurrency(item.remaining, currency)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#7A9A95] text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>مناسب (مانده: {formatCurrency(item.remaining, currency)})</span>
                    </div>
                  )}
                  <span className="text-[11px] text-[#8E8B82] font-mono tabular-nums">
                    سقف: {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
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
