import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { transactions, categories, currency, totalIncome, totalExpense } = useFinance();

  const [dateRange, setDateRange] = useState<'all' | 'month' | 'threeMonths'>('all');

  // Filter transactions by date range
  const filtered = transactions.filter(t => {
    if (dateRange === 'all') return true;
    return true; // all in demo dataset
  });

  const expenses = filtered.filter(t => t.type === 'expense');
  const incomes = filtered.filter(t => t.type === 'income');

  const currentExpenseTotal = expenses.reduce((s, t) => s + t.amount, 0);
  const currentIncomeTotal = incomes.reduce((s, t) => s + t.amount, 0);
  const netBalance = currentIncomeTotal - currentExpenseTotal;

  // Expense by category
  const expenseByCat = expenses.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryRanking = Object.entries(expenseByCat)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      const percent = currentExpenseTotal > 0 ? Math.round((amount / currentExpenseTotal) * 100) : 0;
      return {
        id: catId,
        name: cat ? cat.name : 'متفرقه',
        color: cat ? cat.color : '#64748b',
        icon: cat ? cat.icon : 'MoreHorizontal',
        amount,
        percent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export excel
  const handleExport = () => {
    const data = categoryRanking.map(c => ({
      'دسته‌بندی': c.name,
      'مبلغ کل': c.amount,
      'واحد': currency === 'toman' ? 'تومان' : 'ریال',
      'درصد از کل مخارج': `${c.percent}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تحلیل مخارج');
    XLSX.writeFile(wb, `تحلیل_هزینه‌ها_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            گزارش‌های تحلیلی و آماری
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            بررسی جامع رفتار مالی، جریان وجوه و برترین هزینه‌تراش‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>چاپ / ذخیره PDF</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (visible on print) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">گزارش مالی جامع شخص</h1>
        <p className="text-xs text-gray-500 mt-1">تولید شده توسط نرم‌افزار حسابداری هوشمند</p>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-1 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>کل ورودی (درآمدها)</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {formatCurrency(currentIncomeTotal, currency)}
          </div>
          <span className="text-[11px] text-slate-400">
            تعداد {toPersianDigits(incomes.length)} تراکنش درآمدی
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-rose-600 mb-1 text-xs font-semibold">
            <TrendingDown className="w-4 h-4" />
            <span>کل خروجی (مخارج)</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {formatCurrency(currentExpenseTotal, currency)}
          </div>
          <span className="text-[11px] text-slate-400">
            تعداد {toPersianDigits(expenses.length)} تراکنش هزینه
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-indigo-600 mb-1 text-xs font-semibold">
            <Percent className="w-4 h-4" />
            <span>نرخ ذخیره و پس‌انداز</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(
              currentIncomeTotal > 0
                ? Math.max(0, Math.round((netBalance / currentIncomeTotal) * 100))
                : 0
            )}
            ٪
          </div>
          <span className="text-[11px] text-slate-400">
            تراز خالص: {formatCurrency(netBalance, currency)}
          </span>
        </div>
      </div>

      {/* Detailed Category Ranking Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            رتبه‌بندی مخارج بر اساس دسته‌بندی
          </h3>
          <span className="text-xs text-slate-400">
            مرتب‌شده از بیشترین به کمترین
          </span>
        </div>

        <div className="space-y-4">
          {categoryRanking.map(item => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: item.color }}
                  >
                    {getCategoryIcon(item.icon, 'w-3.5 h-3.5')}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 w-10 text-left">
                    {toPersianDigits(item.percent)}٪
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: item.color,
                    width: `${item.percent}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
