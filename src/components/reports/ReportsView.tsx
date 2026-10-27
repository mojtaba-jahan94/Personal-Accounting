import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import {
  isDateInJalaliRange,
  getTodayJalali,
  getJalaliDaysAgo,
  getJalaliThisMonthRange,
  getJalaliLastMonthRange,
  getJalaliThreeMonthsRange,
  getJalaliThisYearRange,
  PERSIAN_MONTHS,
} from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import * as XLSX from 'xlsx';
import {
  Printer,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Percent,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export type DatePreset =
  | 'this_month'
  | 'last_month'
  | 'three_months'
  | 'this_year'
  | 'all'
  | 'custom';

const AURUM_PALETTE = [
  '#DFC296', // Champagne Gold
  '#A390B8', // Muted Lilac
  '#C98A82', // Dusty Rose
  '#7A9A95', // Sage Teal
  '#6E7582', // Warm Slate
  '#D4AF37', // Classic Gold
  '#8E9AAF', // Steel Mist
  '#B8977E', // Warm Bronze
  '#9A8C98', // Heather Taupe
  '#5B8266', // Deep Sage
];

export const ReportsView: React.FC = () => {
  const { transactions, categories, currency } = useFinance();

  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [startDate, setStartDate] = useState(() => getJalaliThisMonthRange().start);
  const [endDate, setEndDate] = useState(() => getJalaliThisMonthRange().end);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Compute Current Jalali Month Label for Micro-Header
  const currentMonthLabel = useMemo(() => {
    const today = getTodayJalali();
    const parts = today.split('/');
    if (parts.length === 3) {
      const jy = parts[0];
      const jm = parseInt(parts[1], 10);
      const monthName = PERSIAN_MONTHS[(jm || 1) - 1] || 'جاری';
      return `${monthName} ${toPersianDigits(jy)}`;
    }
    return 'دوره انتخابی';
  }, []);

  // Handle Preset Switching
  const handlePresetSelect = (preset: DatePreset) => {
    setDatePreset(preset);
    setSelectedCategory(null);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const range = getJalaliThisMonthRange();
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === 'last_month') {
      const range = getJalaliLastMonthRange();
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === 'three_months') {
      const range = getJalaliThreeMonthsRange();
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === 'this_year') {
      const range = getJalaliThisYearRange();
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === 'custom') {
      const start = customStart || getJalaliDaysAgo(30);
      const end = customEnd || getTodayJalali();
      setCustomStart(start);
      setCustomEnd(end);
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handleApplyCustom = () => {
    setStartDate(customStart);
    setEndDate(customEnd);
  };

  // Filter transactions by date range
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (startDate || endDate) {
        return isDateInJalaliRange(t.date, startDate, endDate);
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  const expenses = useMemo(() => filtered.filter((t) => t.type === 'expense'), [filtered]);
  const incomes = useMemo(() => filtered.filter((t) => t.type === 'income'), [filtered]);

  const currentExpenseTotal = useMemo(() => expenses.reduce((s, t) => s + t.amount, 0), [expenses]);
  const currentIncomeTotal = useMemo(() => incomes.reduce((s, t) => s + t.amount, 0), [incomes]);
  const netBalance = currentIncomeTotal - currentExpenseTotal;
  const savingsRate =
    currentIncomeTotal > 0
      ? Math.max(0, Math.round((netBalance / currentIncomeTotal) * 100))
      : 0;

  // Expense by category breakdown
  const categoryRanking = useMemo(() => {
    const expenseByCat = expenses.reduce((acc, t) => {
      if (!acc[t.categoryId]) {
        acc[t.categoryId] = { amount: 0, count: 0 };
      }
      acc[t.categoryId].amount += t.amount;
      acc[t.categoryId].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return Object.entries(expenseByCat)
      .map(([catId, data], idx) => {
        const cat = categories.find((c) => c.id === catId);
        const percent =
          currentExpenseTotal > 0 ? Math.round((data.amount / currentExpenseTotal) * 100) : 0;
        return {
          id: catId,
          name: cat ? cat.name : 'متفرقه',
          color: AURUM_PALETTE[idx % AURUM_PALETTE.length],
          icon: cat ? cat.icon : 'MoreHorizontal',
          amount: data.amount,
          count: data.count,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, categories, currentExpenseTotal]);

  // SVG Donut Calculations
  const donutSize = 250;
  const strokeWidth = 22;
  const radius = (donutSize - strokeWidth - 10) / 2; // radius ~ 107
  const circumference = 2 * Math.PI * radius;

  const donutArcs = useMemo(() => {
    if (currentExpenseTotal <= 0 || categoryRanking.length === 0) return [];
    let accumulatedOffset = 0;
    const gap = categoryRanking.length > 1 ? 5 : 0; // hairline dark gap between arcs

    return categoryRanking.map((item) => {
      const proportion = item.amount / currentExpenseTotal;
      const rawArcLength = proportion * circumference;
      const arcLength = Math.max(1, rawArcLength - gap);
      const dashArray = `${arcLength} ${circumference - arcLength}`;
      const dashOffset = -accumulatedOffset;
      accumulatedOffset += rawArcLength;

      return {
        ...item,
        dashArray,
        dashOffset,
        proportion,
      };
    });
  }, [categoryRanking, currentExpenseTotal, circumference]);

  const activeFocusItem = categoryRanking.find((c) => c.id === selectedCategory);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export excel
  const handleExport = () => {
    const data = categoryRanking.map((c) => ({
      'دسته‌بندی': c.name,
      'مبلغ کل': currency === 'rial' ? c.amount * 10 : c.amount,
      'واحد': currency === 'toman' ? 'تومان' : 'ریال',
      'درصد از کل مخارج': `${c.percent}%`,
      'تعداد تراکنش': c.count,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تحلیل مخارج');
    const dateTag =
      startDate && endDate
        ? `_${startDate.replace(/\//g, '-')}_تا_${endDate.replace(/\//g, '-')}`
        : '';
    XLSX.writeFile(wb, `گزارش_تحلیلی_AURUM${dateTag}_${Date.now()}.xlsx`);
  };

  const PERIOD_TABS: { id: DatePreset; label: string }[] = [
    { id: 'this_month', label: 'این ماه' },
    { id: 'last_month', label: 'ماه گذشته' },
    { id: 'three_months', label: '۳ ماه اخیر' },
    { id: 'this_year', label: 'امسال' },
    { id: 'all', label: 'همه زمان‌ها' },
    { id: 'custom', label: 'بازه دلخواه' },
  ];

  return (
    <div className="space-y-7 pb-16 print:p-0">
      {/* 1. Insights Header */}
      <div className="print:hidden">
        <div className="text-[10px] tracking-[0.22em] text-[#8E8B82] uppercase font-mono">
          تحلیل مخارج • {currentMonthLabel}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1.5">
          <div>
            <h1 className="text-3xl font-serif font-light text-[#F4F0EA] tracking-tight">
              گزارش‌ها و تحلیل (Insights)
            </h1>
            <p className="text-xs text-[#8E8B82] mt-1 font-light">
              پایش جریان وجوه، توزیع هندسی هزینه‌ها و نرخ پس‌انداز
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handlePrint}
              className="border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] tracking-widest text-[#8E8B82] hover:text-[#F4F0EA] hover:bg-white/5 transition flex items-center gap-1.5 font-mono"
              title="چاپ یا ذخیره PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#DFC296]" />
              <span>PRINT</span>
            </button>
            <button
              onClick={handleExport}
              className="border border-white/10 rounded-full px-4 py-1.5 text-[11px] tracking-widest text-[#DFC296] hover:bg-white/5 transition flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(223,194,150,0.15)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی / EXPORT</span>
            </button>
          </div>
        </div>

        {/* Horizontal Month/Period Selector Strip with Gold Underline */}
        <div className="mt-6 border-b border-white/[0.08] relative">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar scrollbar-none py-1">
            {PERIOD_TABS.map((tab) => {
              const isActive = datePreset === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handlePresetSelect(tab.id)}
                  className={`relative py-3 px-3 text-xs tracking-wider transition-colors shrink-0 font-medium ${
                    isActive ? 'text-[#DFC296] font-bold' : 'text-[#8E8B82] hover:text-[#F4F0EA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#DFC296] rounded-full shadow-[0_0_10px_rgba(223,194,150,0.6)] transition-all duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Range Drawer (only when 'custom' is active) */}
        {datePreset === 'custom' && (
          <div className="mt-3 p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-[#8E8B82] font-mono text-[11px]">از تاریخ:</span>
              <input
                type="text"
                placeholder="1403/01/01"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#1A191E] border border-white/10 text-xs font-mono text-[#F4F0EA] outline-none w-28 text-center focus:border-[#DFC296]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8E8B82] font-mono text-[11px]">تا تاریخ:</span>
              <input
                type="text"
                placeholder="1403/12/29"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#1A191E] border border-white/10 text-xs font-mono text-[#F4F0EA] outline-none w-28 text-center focus:border-[#DFC296]"
              />
            </div>
            <button
              onClick={handleApplyCustom}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#DFC296] text-[#0A0A0C] font-semibold text-xs transition active:scale-95 shadow-[0_0_12px_rgba(223,194,150,0.3)]"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>اعمال بازه</span>
            </button>
          </div>
        )}
      </div>

      {/* Printable Report Header (visible on print) */}
      <div className="hidden print:block text-center border-b border-gray-400 pb-4 mb-4">
        <h1 className="text-2xl font-bold">گزارش مالی جامع (AURUM Private)</h1>
        <p className="text-xs text-gray-500 mt-1">تولید شده توسط سامانه مدیریت مالی شخصی</p>
        {startDate && endDate && (
          <p className="text-xs font-mono mt-1">
            بازه گزارش: {startDate} تا {endDate}
          </p>
        )}
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-white/[0.08] relative overflow-hidden group hover:border-[#7A9A95]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8E8B82]">
              کل ورودی / INFLOW
            </span>
            <div className="w-7 h-7 rounded-full bg-[#7A9A95]/15 text-[#7A9A95] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-serif text-[#F4F0EA] tabular-nums font-light">
            {formatCurrency(currentIncomeTotal, currency)}
          </div>
          <div className="text-[11px] font-mono text-[#8E8B82] mt-1 tabular-nums">
            {toPersianDigits(incomes.length)} تراکنش درآمدی
          </div>
        </div>

        {/* Expense Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-white/[0.08] relative overflow-hidden group hover:border-[#C98A82]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8E8B82]">
              کل خروجی / OUTFLOW
            </span>
            <div className="w-7 h-7 rounded-full bg-[#C98A82]/15 text-[#C98A82] flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-serif text-[#F4F0EA] tabular-nums font-light">
            {formatCurrency(currentExpenseTotal, currency)}
          </div>
          <div className="text-[11px] font-mono text-[#8E8B82] mt-1 tabular-nums">
            {toPersianDigits(expenses.length)} تراکنش هزینه
          </div>
        </div>

        {/* Savings & Net Balance Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-white/[0.08] relative overflow-hidden group hover:border-[#DFC296]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8E8B82]">
              نرخ پس‌انداز / SAVINGS
            </span>
            <div className="w-7 h-7 rounded-full bg-[#DFC296]/15 text-[#DFC296] flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif text-[#DFC296] tabular-nums font-light">
              {toPersianDigits(savingsRate)}٪
            </span>
            <span className="text-xs text-[#8E8B82] font-mono">پس‌انداز</span>
          </div>
          <div className="text-[11px] font-mono text-[#8E8B82] mt-1 tabular-nums">
            تراز خالص: {formatCurrency(netBalance, currency)}
          </div>
        </div>
      </div>

      {/* 3. Main Insights Section: Interactive Donut Chart + Category Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-white/[0.08] shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.06]">
          <div>
            <h3 className="text-lg font-serif font-light text-[#F4F0EA]">
              توزیع هندسی مخارج (Expense Distribution)
            </h3>
            <p className="text-xs text-[#8E8B82] mt-0.5">
              برای بررسی و فیلتر دقیق‌تر، روی هر کمان از نمودار یا سطر دسته‌بندی کلیک کنید
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 text-xs text-[#DFC296] hover:bg-white/5 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>نمایش همه هزینه‌ها</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Padded SVG Donut Chart (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
            {categoryRanking.length === 0 ? (
              <div className="w-[250px] h-[250px] rounded-full border border-dashed border-white/10 flex items-center justify-center text-xs text-[#8E8B82]">
                هزینه‌ای در این بازه ثبت نشده است
              </div>
            ) : (
              <div className="relative w-[250px] h-[250px] flex items-center justify-center">
                <svg
                  width={donutSize}
                  height={donutSize}
                  viewBox={`0 0 ${donutSize} ${donutSize}`}
                  className="overflow-visible"
                >
                  {/* Subtle dark track ring */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#1A191E"
                    strokeWidth={strokeWidth}
                  />

                  {/* Arcs group rotated by -90deg so first arc starts at 12 o'clock */}
                  <g transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}>
                    {donutArcs.map((arc) => {
                      const isFocused = selectedCategory === arc.id;
                      const isDimmed = selectedCategory !== null && !isFocused;
                      const currentStrokeWidth = isFocused ? strokeWidth + 6 : strokeWidth;

                      return (
                        <circle
                          key={arc.id}
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          fill="none"
                          stroke={arc.color}
                          strokeWidth={currentStrokeWidth}
                          strokeDasharray={arc.dashArray}
                          strokeDashoffset={arc.dashOffset}
                          strokeLinecap="round"
                          className="cursor-pointer transition-all duration-500 ease-out"
                          style={{
                            opacity: isDimmed ? 0.2 : 1,
                            filter: isFocused ? `drop-shadow(0 0 10px ${arc.color}60)` : 'none',
                          }}
                          onClick={() =>
                            setSelectedCategory((prev) => (prev === arc.id ? null : arc.id))
                          }
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Center Ring Display (Click to reset) */}
                <div
                  onClick={() => setSelectedCategory(null)}
                  className="absolute inset-0 m-auto w-[130px] h-[130px] rounded-full flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform select-none"
                  title="کلیک برای بازنشانی به کل مخارج"
                >
                  <span className="text-[10px] tracking-[0.2em] text-[#8E8B82] uppercase font-mono max-w-[110px] truncate mb-0.5">
                    {activeFocusItem ? activeFocusItem.name : 'مجموع هزینه‌ها'}
                  </span>
                  <span className="text-xl sm:text-2xl font-serif text-[#F4F0EA] tabular-nums font-light tracking-tight">
                    {formatCurrency(
                      activeFocusItem ? activeFocusItem.amount : currentExpenseTotal,
                      currency
                    )}
                  </span>
                  <span className="text-[10px] text-[#DFC296]/80 font-mono mt-0.5">
                    {activeFocusItem
                      ? `${toPersianDigits(activeFocusItem.percent)}٪ از کل`
                      : 'TOTAL SPENT'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hairline Category Breakdown List with Inline Progress Bars (7 cols) */}
          <div className="lg:col-span-7">
            {categoryRanking.length === 0 ? (
              <p className="text-center py-10 text-xs text-[#8E8B82]">
                هیچ تراکنش هزینه‌ای در این بازه زمانی یافت نشد.
              </p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {categoryRanking.map((item) => {
                  const isFocused = selectedCategory === item.id;
                  const isDimmed = selectedCategory !== null && !isFocused;

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === item.id ? null : item.id))
                      }
                      className={`py-3.5 px-3 flex items-center justify-between cursor-pointer rounded-xl transition-all duration-300 ${
                        isFocused ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      } ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
                    >
                      {/* Right Group: dot, category icon/title, percent, inline progress bar */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: item.color }}
                        />

                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                            style={{ backgroundColor: `${item.color}25`, color: item.color }}
                          >
                            {getCategoryIcon(item.icon, 'w-3.5 h-3.5')}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#F4F0EA] block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#8E8B82] font-mono tabular-nums">
                              {toPersianDigits(item.count || 1)} تراکنش
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono text-[#8E8B82] tabular-nums mr-2">
                          {toPersianDigits(item.percent)}٪
                        </span>

                        <div className="hidden sm:block w-16 sm:w-24 h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: item.color,
                              width: `${Math.min(100, item.percent)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Left Group: exact formatted amount */}
                      <div className="text-left font-mono text-sm text-[#F4F0EA] tabular-nums font-medium">
                        {formatCurrency(item.amount, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Income vs Expense Comparison Bar Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-white/[0.08] shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-serif font-light text-[#F4F0EA]">
            مقایسه کل ورودی و خروجی دوره
          </h3>
          <p className="text-xs text-[#8E8B82] mt-0.5">
            تراز نسبی بین منابع درآمدی و مصارف جاری در بازه انتخابی
          </p>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={230} minHeight={200}>
            <BarChart
              data={[
                { name: 'درآمدها', amount: currentIncomeTotal, fill: '#7A9A95' },
                { name: 'مخارج', amount: currentExpenseTotal, fill: '#C98A82' },
              ]}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.06} stroke="#F4F0EA" />
              <XAxis dataKey="name" stroke="#8E8B82" tick={{ fontSize: 12, fill: '#8E8B82' }} />
              <YAxis stroke="#8E8B82" tick={{ fontSize: 10, fill: '#8E8B82' }} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val), currency), 'مبلغ']}
                contentStyle={{
                  borderRadius: '16px',
                  direction: 'rtl',
                  backgroundColor: '#121215',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#F4F0EA',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
