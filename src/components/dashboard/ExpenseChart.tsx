import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

interface ExpenseChartProps {
  type: 'pie' | 'bar';
}

const NORDIC_CHART_COLORS = [
  '#A68A64', // Warm Wood
  '#2E7D5B', // Nordic Sage
  '#4A6FA5', // Fjord Blue
  '#C0564B', // Terracotta
  '#8A704C', // Dark Wood
  '#6B7280', // Fjord Gray
  '#C2A882', // Light Wood
  '#9CA3AF', // Muted Gray
];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ type }) => {
  const { transactions, categories, currency, darkMode } = useFinance();

  // Aggregate expenses by category
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalExpenseAmount = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);

  const pieData = Object.entries(expenseByCategory)
    .map(([catId, amount], idx) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0;
      return {
        name: cat ? cat.name : 'متفرقه',
        value: amount,
        percentage,
        color: NORDIC_CHART_COLORS[idx % NORDIC_CHART_COLORS.length],
      };
    })
    .sort((a, b) => b.value - a.value);

  // Monthly trend aggregation
  const monthDataMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    const month = t.date ? t.date.substring(5, 7) : '01'; // MM
    if (!monthDataMap[month]) {
      monthDataMap[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') monthDataMap[month].income += t.amount;
    if (t.type === 'expense') monthDataMap[month].expense += t.amount;
  });

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ];

  const barData = Object.keys(monthDataMap)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((mKey) => {
      const idx = parseInt(mKey, 10) - 1;
      return {
        name: monthNames[idx] || `ماه ${mKey}`,
        درآمد: monthDataMap[mKey].income,
        هزینه: monthDataMap[mKey].expense,
      };
    });

  const textColor = darkMode ? '#D1D5DB' : '#6B7280';
  const gridColor = darkMode ? 'rgba(209, 213, 219, 0.1)' : 'rgba(107, 114, 128, 0.12)';

  if (type === 'pie') {
    if (pieData.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-[#6B7280] dark:text-[#D1D5DB]/60 text-xs">
          هنوز هزینه‌ای برای رسم نمودار ثبت نشده است
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center">
        {/* Donut Chart with Centered Total */}
        <div className="relative w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={92}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), 'مبلغ']}
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2933' : '#F7F7F2',
                  borderColor: darkMode ? 'rgba(209, 213, 219, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  borderRadius: '1rem',
                  fontFamily: 'Vazirmatn',
                  direction: 'rtl',
                  textAlign: 'right',
                  color: darkMode ? '#F7F7F2' : '#1F2933',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Overlay inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#D1D5DB]/70">کل هزینه‌ها</span>
            <span className="text-xs sm:text-sm font-black font-mono text-[#1F2933] dark:text-[#F7F7F2]">
              {formatCurrency(totalExpenseAmount, currency)}
            </span>
          </div>
        </div>

        {/* Legend with Percentage Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          {pieData.slice(0, 6).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#1F2933] dark:text-[#F7F7F2] font-semibold truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <span className="font-mono font-bold text-[10px] text-[#A68A64] shrink-0">
                {toPersianDigits(item.percentage)}٪
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar Chart (Income vs Expense)
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={260} minHeight={240}>
        <BarChart data={barData.length > 0 ? barData : [{ name: 'ماه جاری', درآمد: 0, هزینه: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} />
          <YAxis
            tick={{ fill: textColor, fontSize: 10 }}
            tickFormatter={(val: number) => {
              if (val === 0) return '۰';
              const displayVal = currency === 'rial' ? val * 10 : val;
              if (Math.abs(displayVal) >= 1000000) {
                return toPersianDigits(`${(displayVal / 1000000).toFixed(1).replace('.0', '')}M`);
              }
              if (Math.abs(displayVal) >= 1000) {
                return toPersianDigits(`${Math.round(displayVal / 1000)}K`);
              }
              return toPersianDigits(displayVal.toString());
            }}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
            contentStyle={{
              backgroundColor: darkMode ? '#1F2933' : '#F7F7F2',
              borderColor: darkMode ? 'rgba(209, 213, 219, 0.2)' : 'rgba(107, 114, 128, 0.2)',
              borderRadius: '1rem',
              fontFamily: 'Vazirmatn',
              direction: 'rtl',
              textAlign: 'right',
              color: darkMode ? '#F7F7F2' : '#1F2933',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
          />
          <Bar dataKey="درآمد" fill="#2E7D5B" radius={[6, 6, 0, 0]} />
          <Bar dataKey="هزینه" fill="#C0564B" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;

