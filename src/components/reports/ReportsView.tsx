import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { isDateInJalaliRange, formatJalaliLong } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { DateFilterBar, DatePreset } from '../common/DateFilterBar';
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
  Scale,
  ListOrdered,
  FileSpreadsheet,
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
  const { transactions, categories, currency } = useFinance();

  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions by date range
  const filtered = transactions.filter(t => {
    if (startDate || endDate) {
      return isDateInJalaliRange(t.date, startDate, endDate);
    }
    return true;
  });

  const expenses = filtered.filter(t => t.type === 'expense');
  const incomes = filtered.filter(t => t.type === 'income');

  const currentExpenseTotal = expenses.reduce((s, t) => s + t.amount, 0);
  const currentIncomeTotal = incomes.reduce((s, t) => s + t.amount, 0);
  const netBalance = currentIncomeTotal - currentExpenseTotal;
  const savingsRate =
    currentIncomeTotal > 0
      ? Math.max(0, Math.round((netBalance / currentIncomeTotal) * 100))
      : 0;

  // Expense by category
  const expenseByCat = expenses.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryRanking = Object.entries(expenseByCat)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      const percent =
        currentExpenseTotal > 0 ? Math.round((amount / currentExpenseTotal) * 100) : 0;
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

  // Data for Donut Chart
  const pieData = categoryRanking.slice(0, 6).map(c => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export excel
  const handleExport = () => {
    const data = categoryRanking.map(c => ({
      'دسته‌بندی': c.name,
      'مبلغ کل': currency === 'rial' ? c.amount * 10 : c.amount,
      'واحد': currency === 'toman' ? 'تومان' : 'ریال',
      'درصد از کل مخارج': `${c.percent}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تحلیل مخارج');
    const dateTag =
      startDate && endDate
        ? `_${startDate.replace(/\//g, '-')}_تا_${endDate.replace(/\//g, '-')}`
        : '';
    XLSX.writeFile(wb, `گزارش_تحلیلی_مخارج${dateTag}_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            گزارش‌های تحلیلی و آماری
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            بررسی جامع رفتار مالی، جریان وجوه و برترین هزینه‌تراش‌ها بر اساس بازه زمانی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass hover:bg-slate-200/50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>چاپ / PDF</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
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
        {startDate && endDate && (
          <p className="text-xs font-mono mt-1">
            بازه گزارش: {startDate} تا {endDate}
          </p>
        )}
      </div>

      {/* 1. Date Filter Section (Collapsible) */}
      <CollapsibleSection
        storageKey="reports_date_filter"
        title="بازه زمانی گزارش"
        subtitle={
          startDate && endDate
            ? `گزارش از تاریخ ${startDate} تا ${endDate}`
            : 'انتخاب دوره گزارش‌گیری'
        }
        icon={<Calendar className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
        className="liquid-glass-card p-5"
      >
        <DateFilterBar
          selectedPreset={datePreset}
          startDate={startDate}
          endDate={endDate}
          onFilterChange={(preset, start, end) => {
            setDatePreset(preset);
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </CollapsibleSection>

      {/* 2. Summary KPI Cards (Collapsible) */}
      <CollapsibleSection
        storageKey="reports_kpi"
        title="شاخص‌های عملکرد مالی در این بازه"
        subtitle={`مجموع درآمدها، مخارج و پس‌انداز برای ${toPersianDigits(filtered.length)} تراکنش`}
        icon={<Scale className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
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

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30">
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

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 text-indigo-600 mb-1 text-xs font-semibold">
              <Percent className="w-4 h-4" />
              <span>نرخ پس‌انداز و تراز</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {toPersianDigits(savingsRate)}٪
            </div>
            <span className="text-[11px] text-slate-400">
              تراز خالص: {formatCurrency(netBalance, currency)}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* 3. Visual Charts (Collapsible) */}
      <CollapsibleSection
        storageKey="reports_charts"
        title="نمودار تحلیل مخارج دوره"
        subtitle="بررسی هندسی توزیع هزینه‌ها بین دسته‌بندی‌ها"
        icon={<PieIcon className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          {/* Donut Chart */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              نمودار سهم مخارج در این بازه
            </h4>
            {pieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                هزینه‌ای در این بازه ثبت نشده است
              </div>
            ) : (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={230} minHeight={210}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val), currency), 'مبلغ']}
                      contentStyle={{
                        borderRadius: '16px',
                        direction: 'rtl',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Income vs Expense Bar */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              مقایسه ورودی و خروجی دوره
            </h4>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={230} minHeight={210}>
                <BarChart
                  data={[
                    { name: 'درآمدها', amount: currentIncomeTotal, fill: '#10b981' },
                    { name: 'مخارج', amount: currentExpenseTotal, fill: '#f43f5e' },
                  ]}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'مبلغ']}
                    contentStyle={{
                      borderRadius: '16px',
                      direction: 'rtl',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Detailed Category Ranking Table (Collapsible) */}
      <CollapsibleSection
        storageKey="reports_ranking_table"
        title="رتبه‌بندی مخارج بر اساس دسته‌بندی"
        subtitle="مرتب‌شده از بیشترین به کمترین هزینه در این بازه"
        icon={<ListOrdered className="w-5 h-5 text-indigo-500" />}
        defaultExpanded={true}
      >
        <div className="space-y-4 pt-1">
          {categoryRanking.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              هیچ هزینه‌ای برای رتبه‌بندی در این بازه یافت نشد.
            </p>
          ) : (
            categoryRanking.map(item => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {getCategoryIcon(item.icon, 'w-3.5 h-3.5')}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
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
            ))
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
