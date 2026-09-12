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

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ type }) => {
  const { transactions, categories, currency, darkMode } = useFinance();

  // Aggregate expenses by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([catId, amount]) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat ? cat.name : 'متفرقه',
      value: amount,
      color: cat ? cat.color : '#94a3b8',
    };
  }).sort((a, b) => b.value - a.value);

  // Monthly trend mock / aggregation
  const monthDataMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = t.date ? t.date.substring(5, 7) : '01'; // MM
    if (!monthDataMap[month]) {
      monthDataMap[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') monthDataMap[month].income += t.amount;
    if (t.type === 'expense') monthDataMap[month].expense += t.amount;
  });

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const barData = Object.keys(monthDataMap).map(mKey => {
    const idx = parseInt(mKey, 10) - 1;
    return {
      name: monthNames[idx] || `ماه ${mKey}`,
      درآمد: monthDataMap[mKey].income,
      هزینه: monthDataMap[mKey].expense,
    };
  });

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#f1f5f9';

  if (type === 'pie') {
    if (pieData.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
          هنوز هزینه‌ای برای رسم نمودار ثبت نشده است
        </div>
      );
    }

    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), 'مبلغ']}
              contentStyle={{
                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                borderColor: darkMode ? '#1e293b' : '#e2e8f0',
                borderRadius: '1rem',
                fontFamily: 'Vazirmatn',
                direction: 'rtl',
                textAlign: 'right',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          {pieData.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar Chart
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData.length > 0 ? barData : [{ name: 'ماه جاری', درآمد: 0, هزینه: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} />
          <YAxis
            tick={{ fill: textColor, fontSize: 10 }}
            tickFormatter={(val) => toPersianDigits(val > 1000000 ? `${Math.round(val / 1000000)}M` : `${Math.round(val / 1000)}K`)}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
            contentStyle={{
              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
              borderColor: darkMode ? '#1e293b' : '#e2e8f0',
              borderRadius: '1rem',
              fontFamily: 'Vazirmatn',
              direction: 'rtl',
              textAlign: 'right',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
          />
          <Bar dataKey="درآمد" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="هزینه" fill="#f43f5e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
