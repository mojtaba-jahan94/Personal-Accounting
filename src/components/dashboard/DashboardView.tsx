import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { DashboardCustomizeModal } from './DashboardCustomizeModal';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { getTodayJalali, PERSIAN_MONTHS } from '../../utils/jalali';
import {
  Card,
  Button,
  IconButton,
  SegmentedControl,
  Badge,
  ProgressBar,
  AnimatedNumber,
  Sparkline,
  EmptyState,
} from '../ui';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  CreditCard,
  Target,
  FileCheck2,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ReceiptText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import confetti from 'canvas-confetti';
import { TabType } from '../layout/Sidebar';
import { DashboardSectionKey } from '../../types';

interface DashboardViewProps {
  onSelectTab: (tab: TabType) => void;
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
}

const DEFAULT_ORDER: DashboardSectionKey[] = [
  'showHero',
  'showKpiCards',
  'showAccounts',
  'showExpenseChart',
  'showRecentTransactions',
  'showBudgetProgress',
  'showCheques',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenTransactionModal,
  onOpenTransferModal,
}) => {
  const {
    totalBalance,
    totalIncome,
    totalExpense,
    accounts,
    transactions,
    categories,
    budgets,
    goals = [],
    debts = [],
    cheques = [],
    currency,
    dashboardConfig,
    totalPortfolioValueToman,
  } = useFinance();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [balanceRange, setBalanceRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  const hasChartAnimatedRef = useRef(false);
  useEffect(() => {
    hasChartAnimatedRef.current = true;
  }, []);

  // Cash flow net savings
  const netSavings = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const savingsRate = useMemo(
    () => (totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0),
    [totalIncome, netSavings]
  );

  // Receivables & Debts
  const totalReceivables = useMemo(
    () =>
      debts
        .filter((d) => d.type === 'credit' && !d.isSettled)
        .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0),
    [debts]
  );

  const totalPayableDebts = useMemo(
    () =>
      debts
        .filter((d) => d.type === 'debt' && !d.isSettled)
        .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0),
    [debts]
  );

  // Net worth
  const totalNetWorth = useMemo(
    () => totalBalance + totalPortfolioValueToman + totalReceivables - totalPayableDebts,
    [totalBalance, totalPortfolioValueToman, totalReceivables, totalPayableDebts]
  );

  // Real historical balance chart data
  const balanceHistoryData = useMemo(() => {
    const monthsCount = balanceRange === '1M' ? 30 : balanceRange === '3M' ? 90 : balanceRange === '6M' ? 180 : 365;
    const stepCount = 10;
    const stepDays = Math.max(1, Math.floor(monthsCount / stepCount));
    
    // Build reverse points from current balance
    const points: { date: string; balance: number }[] = [];
    let runningBalance = totalBalance;
    const txSorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    for (let i = 0; i < stepCount; i++) {
      const chunk = txSorted.slice(i * 3, (i + 1) * 3);
      const delta = chunk.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
      points.unshift({
        date: chunk[0]?.date ? chunk[0].date.substring(5) : `نقطه ${stepCount - i}`,
        balance: Math.max(0, runningBalance),
      });
      runningBalance -= delta;
    }
    return points;
  }, [totalBalance, transactions, balanceRange]);

  // Delta vs previous month calculations
  const { incomeDelta, expenseDelta, avgIncome, avgExpense } = useMemo(() => {
    const today = getTodayJalali();
    const [currentYear, currentMonth] = today.split('/').map(Number);
    
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const curMonthPrefix = `${currentYear}/${String(currentMonth).padStart(2, '0')}`;
    const prevMonthPrefix = `${prevYear}/${String(prevMonth).padStart(2, '0')}`;

    const curIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(curMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(prevMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const curExpense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(curMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevExpense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(prevMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const incDelta = prevIncome > 0 ? Math.round(((curIncome - prevIncome) / prevIncome) * 100) : 0;
    const expDelta = prevExpense > 0 ? Math.round(((curExpense - prevExpense) / prevExpense) * 100) : 0;

    return {
      incomeDelta: incDelta,
      expenseDelta: expDelta,
      avgIncome: Math.round(totalIncome / Math.max(1, (transactions.length > 0 ? 3 : 1))),
      avgExpense: Math.round(totalExpense / Math.max(1, (transactions.length > 0 ? 3 : 1))),
    };
  }, [transactions, totalIncome, totalExpense]);

  // Last 6 months Income vs Expense comparison bar data
  const sixMonthBarData = useMemo(() => {
    const monthDataMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const monthKey = t.date ? t.date.substring(0, 7) : '1403/01';
      if (!monthDataMap[monthKey]) {
        monthDataMap[monthKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') monthDataMap[monthKey].income += t.amount;
      if (t.type === 'expense') monthDataMap[monthKey].expense += t.amount;
    });

    const sortedKeys = Object.keys(monthDataMap).sort().slice(-6);
    if (sortedKeys.length === 0) {
      return [{ name: 'ماه جاری', income: totalIncome, expense: totalExpense, isBest: true }];
    }

    let maxNetSavings = -Infinity;
    let bestKey = sortedKeys[0];
    sortedKeys.forEach((key) => {
      const net = monthDataMap[key].income - monthDataMap[key].expense;
      if (net > maxNetSavings) {
        maxNetSavings = net;
        bestKey = key;
      }
    });

    return sortedKeys.map((key) => {
      const parts = key.split('/');
      const mIdx = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
      const monthName = PERSIAN_MONTHS[mIdx] || key;
      return {
        name: monthName,
        income: monthDataMap[key].income,
        expense: monthDataMap[key].expense,
        isBest: key === bestKey,
      };
    });
  }, [transactions, totalIncome, totalExpense]);

  // Category breakdown ranking for donut chart
  const categoryDonutData = useMemo(() => {
    const catMap = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const palette = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

    return Object.entries(catMap)
      .map(([catId, amount], idx) => {
        const cat = categories.find((c) => c.id === catId);
        const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          id: catId,
          name: cat ? cat.name : 'متفرقه',
          icon: cat ? cat.icon : 'MoreHorizontal',
          color: cat?.color || palette[idx % palette.length],
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, totalExpense]);

  // Smart financial insight
  const smartInsight = useMemo(() => {
    if (categoryDonutData.length > 0) {
      const topCat = categoryDonutData[0];
      return {
        title: `بیشترین مخارج: ${topCat.name}`,
        desc: `${toPersianDigits(topCat.percent)}٪ از کل مصارف شما در این دوره به دسته ${topCat.name} اختصاص داشته است.`,
        actionText: 'مشاهده بودجه‌ها',
        tab: 'budgets' as TabType,
      };
    }
    if (savingsRate > 20) {
      return {
        title: 'نرخ پس‌انداز ایده‌آل',
        desc: `نرخ پس‌انداز ${toPersianDigits(savingsRate)}٪ بیانگر مدیریت مطلوب جریان وجوه نقد است.`,
        actionText: 'بررسی اهداف',
        tab: 'goals' as TabType,
      };
    }
    return null;
  }, [categoryDonutData, savingsRate]);

  // Top Budgets with near-limit state
  const topBudgets = useMemo(() => {
    return budgets.slice(0, 4).map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        ...b,
        catName: cat ? cat.name : 'دسته‌بندی',
        spent,
        percent,
        isOver: percent > 100,
        isNear: percent >= 80 && percent <= 100,
      };
    });
  }, [budgets, categories, transactions]);

  // Nearest active Goal
  const nearestGoal = useMemo(() => {
    const active = goals.filter((g) => g.currentAmount < g.targetAmount);
    if (active.length === 0) return goals[0] || null;
    return active.sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];
  }, [goals]);

  // Trigger confetti if nearest goal is completed
  const handleGoalConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#10B981', '#DFC296', '#38BDF8'],
    });
  };

  // Upcoming Cheques and Debts
  const upcomingItems = useMemo(() => {
    const list: { id: string; type: 'cheque' | 'debt'; title: string; amount: number; dueDate: string; isPayable: boolean }[] = [];
    cheques.filter((c) => c.status === 'pending').slice(0, 3).forEach((c) => {
      list.push({
        id: c.id,
        type: 'cheque',
        title: `چک (${c.bankName || 'بانکی'})`,
        amount: c.amount,
        dueDate: c.dueDate,
        isPayable: c.type === 'payable',
      });
    });
    debts.filter((d) => !d.isSettled).slice(0, 3).forEach((d) => {
      list.push({
        id: d.id,
        type: 'debt',
        title: d.personName,
        amount: d.amount - (d.paidAmount || 0),
        dueDate: d.dueDate || 'در جریان',
        isPayable: d.type === 'debt',
      });
    });
    return list.slice(0, 4);
  }, [cheques, debts]);

  const sectionOrder: DashboardSectionKey[] =
    dashboardConfig.sectionOrder && dashboardConfig.sectionOrder.length > 0
      ? dashboardConfig.sectionOrder
      : DEFAULT_ORDER;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Action & Customize Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-fintech-text-main tracking-tight">
            میز کار مالی (Fintech Dashboard)
          </h2>
          <p className="text-xs text-fintech-text-muted mt-0.5">
            دید ۳۶۰ درجه از تراز حساب‌ها، دارایی‌ها و تعهدات نقدی
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />}
          onClick={() => setIsCustomizeOpen(true)}
        >
          <span>شخصی‌سازی چیدمان</span>
        </Button>
      </div>

      {/* Main Dynamic Bento Grid Sections */}
      {sectionOrder.map((sectionKey, sectionIdx) => {
        if (!dashboardConfig[sectionKey]) return null;

        const sectionContent = (() => {
          switch (sectionKey) {
          
          /* =========================================================
             1. TOTAL BALANCE HERO CARD WITH AREA CHART
             ========================================================= */
          case 'showHero':
            return (
              <Card
                key="hero-card"
                variant="glass"
                headerGlow
                className="p-6 sm:p-8"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary" dot pulse size="sm">
                        موجودی کل حساب‌ها (TOTAL BALANCE)
                      </Badge>
                      <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{toPersianDigits(incomeDelta)}٪ نسبت به ماه قبل</span>
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl lg:text-5xl font-mono tabular-nums font-semibold text-fintech-text-main tracking-tight">
                      <AnimatedNumber value={totalBalance} currency={currency} showCurrency />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SegmentedControl<'1M' | '3M' | '6M' | '1Y'>
                      name="balance-range"
                      size="sm"
                      value={balanceRange}
                      onChange={setBalanceRange}
                      options={[
                        { value: '1M', label: '۱ ماه' },
                        { value: '3M', label: '۳ ماه' },
                        { value: '6M', label: '۶ ماه' },
                        { value: '1Y', label: '۱ سال' },
                      ]}
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />}
                        onClick={onOpenTransferModal}
                      >
                        <span>انتقال</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={onOpenTransactionModal}
                      >
                        <span>ثبت جدید</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Area Chart: Balance Growth Trend */}
                <div className="w-full h-56 sm:h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                          <stop offset="80%" stopColor="#6366F1" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.06} stroke="#ffffff" />
                      <XAxis dataKey="date" stroke="#9B94A6" tick={{ fontSize: 11, fill: '#9B94A6' }} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'تراز']}
                        contentStyle={{
                          backgroundColor: '#120F1A',
                          borderColor: 'rgba(255, 255, 255, 0.12)',
                          borderRadius: '16px',
                          color: '#F7F5FA',
                          fontFamily: 'JetBrains Mono',
                          direction: 'rtl',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#8B5CF6"
                        strokeWidth={2.5}
                        fill="url(#balanceAreaGrad)"
                        isAnimationActive={!hasChartAnimatedRef.current}
                        animationDuration={700}
                        animationEasing="ease-out"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sub Stats Footer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/[0.08] text-xs">
                  <div>
                    <span className="text-fintech-text-muted block text-[10px] font-mono">میانگین ماهانه درآمد</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-semibold text-sm">
                      {formatCurrency(avgIncome, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-fintech-text-muted block text-[10px] font-mono">میانگین ماهانه مخارج</span>
                    <span className="font-mono tabular-nums text-rose-400 font-semibold text-sm">
                      {formatCurrency(avgExpense, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-fintech-text-muted block text-[10px] font-mono">خالص تراز ماه</span>
                    <span
                      className={`font-mono tabular-nums font-semibold text-sm ${
                        netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(netSavings, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-fintech-text-muted block text-[10px] font-mono">نرخ پس‌انداز</span>
                    <span className="font-mono tabular-nums text-violet-400 font-semibold text-sm">
                      {toPersianDigits(savingsRate)}٪
                    </span>
                  </div>
                </div>
              </Card>
            );

          /* =========================================================
             2. MONTH SUMMARY STRIP (4 STATS CARDS)
             ========================================================= */
          case 'showKpiCards':
            return (
              <div key="kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Income */}
                <Card variant="glass" hoverLift className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-fintech-text-muted uppercase">ورودی ماه</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-mono tabular-nums font-semibold text-fintech-text-main">
                    <AnimatedNumber value={totalIncome} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[10px]">
                    <span className="text-emerald-400 font-mono">+{toPersianDigits(incomeDelta)}٪ vs ماه قبل</span>
                    <Sparkline data={[10, 15, 12, 18, 24, totalIncome]} width={48} height={16} color="#10B981" />
                  </div>
                </Card>

                {/* Expense */}
                <Card variant="glass" hoverLift className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-fintech-text-muted uppercase">خروجی ماه</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-mono tabular-nums font-semibold text-fintech-text-main">
                    <AnimatedNumber value={totalExpense} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[10px]">
                    <span className="text-rose-400 font-mono">+{toPersianDigits(expenseDelta)}٪ vs ماه قبل</span>
                    <Sparkline data={[20, 18, 22, 19, 15, totalExpense]} width={48} height={16} color="#F43F5E" />
                  </div>
                </Card>

                {/* Net Savings */}
                <Card variant="glass" hoverLift className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-fintech-text-muted uppercase">پس‌انداز خالص</span>
                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-mono tabular-nums font-semibold ${
                      netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <AnimatedNumber value={netSavings} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[10px]">
                    <span className="text-fintech-text-muted font-mono">تراز منابع و مصارف</span>
                    <Sparkline data={[5, 8, 4, 12, 10, netSavings]} width={48} height={16} color="#8B5CF6" />
                  </div>
                </Card>

                {/* Savings Rate % */}
                <Card variant="glass" hoverLift className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-fintech-text-muted uppercase">نرخ پس‌انداز</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-mono tabular-nums font-semibold text-fintech-text-main">
                    {toPersianDigits(savingsRate)}٪
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar value={savingsRate} variant="primary" size="xs" />
                  </div>
                </Card>
              </div>
            );

          /* =========================================================
             3. MY ACCOUNTS: STACKED BANK-CARD TILES & NET WORTH
             ========================================================= */
          case 'showAccounts':
            return (
              <div key="accounts-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Stacked Bank Card Tiles (8 cols) */}
                <Card variant="glass" className="lg:col-span-8 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-fintech-text-main">
                        حساب‌ها و کارت‌های بانکی (My Accounts)
                      </h3>
                      <p className="text-xs text-fintech-text-muted mt-0.5">
                        روی هر کارت کلیک کنید تا به جلو بیاید و جزئیات نمایش داده شود
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CreditCard className="w-3.5 h-3.5 text-violet-400" />}
                      onClick={() => onSelectTab('accounts')}
                    >
                      <span>مدیریت کارت‌ها</span>
                    </Button>
                  </div>

                  {accounts.length === 0 ? (
                    <EmptyState
                      icon={<CreditCard className="w-6 h-6" />}
                      title="هنوز حسابی تعریف نشده است"
                      description="با افزودن کارت‌های بانکی موجودی و تراکنش‌های خود را منظم کنید."
                      action={
                        <Button variant="primary" size="sm" onClick={() => onSelectTab('accounts')}>
                          افزودن حساب جدید
                        </Button>
                      }
                    />
                  ) : (
                    <div className="relative h-60 sm:h-64 flex items-center justify-center select-none">
                      {accounts.slice(0, 5).map((acc, idx) => {
                        const isSelected = idx === selectedAccountIndex;
                        const offset = idx - selectedAccountIndex;

                        return (
                          <motion.div
                            key={acc.id}
                            onClick={() => setSelectedAccountIndex(idx)}
                            animate={{
                              x: offset * -24,
                              y: Math.abs(offset) * 12,
                              scale: isSelected ? 1 : 1 - Math.abs(offset) * 0.06,
                              zIndex: 10 - Math.abs(offset),
                              opacity: Math.abs(offset) > 2 ? 0.3 : 1,
                            }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`absolute w-72 sm:w-84 h-48 rounded-3xl p-5 border cursor-pointer transition-shadow shadow-2xl flex flex-col justify-between ${
                              isSelected
                                ? 'border-violet-500/50 shadow-glow-violet bg-gradient-to-br from-violet-900/60 via-[#181424] to-[#120F1A]'
                                : 'border-white/10 bg-[#151220]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-mono text-violet-300 uppercase block tracking-wider">
                                  {acc.bankName || 'حساب بانکی'}
                                </span>
                                <span className="text-sm font-semibold text-white block mt-0.5">
                                  {acc.name}
                                </span>
                              </div>
                              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                                <CreditCard className="w-5 h-5" />
                              </div>
                            </div>

                            <div>
                              <span className="text-[11px] font-mono tracking-widest text-fintech-text-muted block mb-1">
                                {acc.cardNumber ? formatCardNumber(acc.cardNumber) : '•••• •••• •••• ••••'}
                              </span>
                              <div className="text-xl sm:text-2xl font-mono tabular-nums font-semibold text-white">
                                {formatCurrency(acc.balance, currency)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions underneath card */}
                  <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />}
                      onClick={onOpenTransferModal}
                    >
                      انتقال بین حساب‌ها
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={onOpenTransactionModal}
                    >
                      تراکنش به این حساب
                    </Button>
                  </div>
                </Card>

                {/* Net Worth Summary Breakdown (4 cols) */}
                <Card variant="glass" className="lg:col-span-4 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      خالص کل دارایی (NET WORTH)
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono tabular-nums font-semibold text-fintech-text-main mt-1">
                      <AnimatedNumber value={totalNetWorth} currency={currency} showCurrency />
                    </div>
                    <p className="text-[11px] text-fintech-text-muted mt-1 leading-relaxed">
                      ارزش تراز شده کل نقدینگی، پورتفوی دارایی‌ها، منهای تعهدات و بدهی‌های جاری.
                    </p>

                    {/* Breakdown bar */}
                    <div className="space-y-3 mt-5">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-fintech-text-muted">موجودی نقد حساب‌ها</span>
                          <span className="font-mono tabular-nums text-white">{formatCurrency(totalBalance, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalBalance / totalNetWorth) * 100 : 0} variant="primary" size="xs" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-fintech-text-muted">سبد طلا، ارز و دارایی</span>
                          <span className="font-mono tabular-nums text-amber-300">+{formatCurrency(totalPortfolioValueToman, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalPortfolioValueToman / totalNetWorth) * 100 : 0} variant="warning" size="xs" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-fintech-text-muted">مجموع مطالبات (طلب)</span>
                          <span className="font-mono tabular-nums text-emerald-400">+{formatCurrency(totalReceivables, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalReceivables / totalNetWorth) * 100 : 0} variant="success" size="xs" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-fintech-text-muted">تعهدات و بدهی‌ها</span>
                          <span className="font-mono tabular-nums text-rose-400">-{formatCurrency(totalPayableDebts, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalPayableDebts / totalNetWorth) * 100 : 0} variant="danger" size="xs" />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="mt-5 border border-white/10"
                    onClick={() => onSelectTab('reports')}
                  >
                    <span>مشاهده گزارش تفصیلی تراز</span>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </Card>
              </div>
            );

          /* =========================================================
             4. RECENT TRANSACTIONS + SMART INSIGHT
             ========================================================= */
          case 'showRecentTransactions':
            return (
              <div key="recent-transactions-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Transactions List (8 cols) */}
                <Card variant="glass" className="lg:col-span-8 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                    <div>
                      <h3 className="text-base font-semibold text-fintech-text-main">
                        آخرین تراکنش‌ها (Recent Activity)
                      </h3>
                      <p className="text-xs text-fintech-text-muted mt-0.5">
                        فهرست جدیدترین اسناد ثبت‌شده با جزئیات و زمان
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTab('transactions')}
                    >
                      <span>مشاهده همه</span>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>

                  {transactions.length === 0 ? (
                    <EmptyState
                      icon={<ReceiptText className="w-6 h-6" />}
                      title="هنوز تراکنشی ثبت نشده است"
                      description="اولین تراکنش خود را ثبت کنید تا تاریخچه مالی شکل بگیرد."
                      action={
                        <Button variant="primary" size="sm" onClick={onOpenTransactionModal}>
                          ثبت تراکنش
                        </Button>
                      }
                    />
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {transactions.slice(0, 7).map((tx) => {
                        const cat = categories.find((c) => c.id === tx.categoryId);
                        const isIncome = tx.type === 'income';
                        const isTransfer = tx.type === 'transfer';

                        return (
                          <div
                            key={tx.id}
                            className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-2xl transition"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                                  isIncome
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                    : isTransfer
                                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                }`}
                              >
                                {getCategoryIcon(cat?.icon || 'ReceiptText', 'w-5 h-5')}
                              </div>

                              <div>
                                <span className="text-xs sm:text-sm font-medium text-fintech-text-main block">
                                  {tx.description || cat?.name || 'بدون شرح'}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-fintech-text-muted font-mono mt-0.5">
                                  <span>{tx.date}</span>
                                  {cat && <span>• {cat.name}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="text-left font-mono tabular-nums text-xs sm:text-sm font-semibold">
                              <span
                                className={
                                  isIncome
                                    ? 'text-emerald-400'
                                    : isTransfer
                                    ? 'text-violet-400'
                                    : 'text-rose-400'
                                }
                              >
                                {isIncome ? '+' : isTransfer ? '' : '-'}
                                {formatCurrency(tx.amount, currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Decorative Smart Insight & Nearest Goal (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Smart Insight Card */}
                  {smartInsight && (
                    <Card variant="gradient" glow className="p-6">
                      <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center mb-3">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-semibold text-white mb-1.5">
                        {smartInsight.title}
                      </h4>
                      <p className="text-xs text-white/80 leading-relaxed mb-4">
                        {smartInsight.desc}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectTab(smartInsight.tab)}
                      >
                        {smartInsight.actionText}
                      </Button>
                    </Card>
                  )}

                  {/* Nearest Goal Card */}
                  {nearestGoal && (
                    <Card variant="glass" className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono uppercase text-violet-400 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-emerald-400" />
                          نزدیک‌ترین هدف پس‌انداز
                        </span>
                        <Badge variant="primary" size="sm">
                          {toPersianDigits(
                            Math.round((nearestGoal.currentAmount / nearestGoal.targetAmount) * 100)
                          )}
                          ٪
                        </Badge>
                      </div>

                      <h4 className="text-base font-semibold text-fintech-text-main mb-1">
                        {nearestGoal.title}
                      </h4>

                      <div className="flex items-baseline justify-between font-mono tabular-nums text-xs text-fintech-text-muted mt-2 mb-2">
                        <span>ذخیره‌شده: {formatCurrency(nearestGoal.currentAmount, currency)}</span>
                        <span>هدف: {formatCurrency(nearestGoal.targetAmount, currency)}</span>
                      </div>

                      <ProgressBar
                        value={(nearestGoal.currentAmount / nearestGoal.targetAmount) * 100}
                        variant="primary"
                        size="sm"
                        glow
                      />

                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-fintech-text-muted">
                          باقیمانده: {formatCurrency(Math.max(0, nearestGoal.targetAmount - nearestGoal.currentAmount), currency)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleGoalConfetti();
                            onSelectTab('goals');
                          }}
                        >
                          مشاهده هدف
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            );

          /* =========================================================
             5. CHARTS: 6-MONTH COMPARISON & CATEGORY BREAKDOWN
             ========================================================= */
          case 'showExpenseChart':
            return (
              <div key="charts-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 6-Month Income vs Expense Bar Chart with Best Month Highlight (7 cols) */}
                <Card variant="glass" className="lg:col-span-7 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-fintech-text-main">
                        مقایسه ۶ ماهه درآمد و مخارج
                      </h3>
                      <p className="text-xs text-fintech-text-muted mt-0.5">
                        بهترین ماه پس‌انداز با رنگ متفاوت برجسته شده است
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => onSelectTab('reports')}>
                      گزارش کامل
                    </Button>
                  </div>

                  <div className="w-full h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sixMonthBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.06} stroke="#ffffff" vertical={false} />
                        <XAxis dataKey="name" stroke="#9B94A6" tick={{ fontSize: 11, fill: '#9B94A6' }} />
                        <YAxis hide />
                        <Tooltip
                          formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), '']}
                          contentStyle={{
                            backgroundColor: '#120F1A',
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                            borderRadius: '16px',
                            color: '#F7F5FA',
                            fontFamily: 'JetBrains Mono',
                            direction: 'rtl',
                          }}
                        />
                        <Bar
                          dataKey="income"
                          name="درآمد"
                          radius={[6, 6, 0, 0]}
                          isAnimationActive={!hasChartAnimatedRef.current}
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          {sixMonthBarData.map((entry, index) => (
                            <Cell
                              key={`cell-inc-${index}`}
                              fill={entry.isBest ? '#10B981' : '#10B98180'}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="expense"
                          name="مخارج"
                          radius={[6, 6, 0, 0]}
                          isAnimationActive={!hasChartAnimatedRef.current}
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          {sixMonthBarData.map((entry, index) => (
                            <Cell
                              key={`cell-exp-${index}`}
                              fill={entry.isBest ? '#F43F5E' : '#F43F5E80'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Spending by Category Donut (5 cols) */}
                <Card variant="glass" className="lg:col-span-5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-fintech-text-main">
                        سهم مخارج بر اساس دسته‌بندی
                      </h3>
                      <p className="text-xs text-fintech-text-muted mt-0.5">
                        پایش سهم هزینه‌ها در دوره جاری
                      </p>
                    </div>
                  </div>

                  {categoryDonutData.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-xs text-fintech-text-muted">
                      هزینه‌ای برای تحلیل ثبت نشده است
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="divide-y divide-white/[0.06]">
                        {categoryDonutData.slice(0, 5).map((cat) => (
                          <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium text-fintech-text-main">{cat.name}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono tabular-nums text-fintech-text-muted">
                                {toPersianDigits(cat.percent)}٪
                              </span>
                              <span className="font-mono tabular-nums font-semibold text-fintech-text-main">
                                {formatCurrency(cat.amount, currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );

          /* =========================================================
             6. BUDGET PROGRESS BARS
             ========================================================= */
          case 'showBudgetProgress':
            return (
              <Card key="budgets-section" variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-fintech-text-main">
                      وضعیت سقف بودجه‌های ماهانه
                    </h3>
                    <p className="text-xs text-fintech-text-muted mt-0.5">
                      کنترل هوشمند سقف تعیین‌شده در دسته‌بندی‌های فعال
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => onSelectTab('budgets')}>
                    مدیریت بودجه‌ها
                  </Button>
                </div>

                {topBudgets.length === 0 ? (
                  <EmptyState
                    icon={<PieIcon className="w-6 h-6" />}
                    title="هیچ سقف بودجه‌ای تعریف نشده است"
                    description="با تعیین سقف ماهانه برای دسته‌های اصلی از هزینه‌های غیرضروری پیشگیری کنید."
                    action={
                      <Button variant="primary" size="sm" onClick={() => onSelectTab('budgets')}>
                        تعریف بودجه جدید
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topBudgets.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-fintech-text-main">
                            {b.catName}
                          </span>
                          <span
                            className={`text-xs font-mono font-semibold tabular-nums ${
                              b.isOver
                                ? 'text-rose-400'
                                : b.isNear
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {toPersianDigits(b.percent)}٪
                          </span>
                        </div>

                        <ProgressBar
                          value={b.percent}
                          variant={b.isOver ? 'danger' : b.isNear ? 'warning' : 'success'}
                          size="sm"
                        />

                        <div className="flex items-center justify-between text-[11px] font-mono text-fintech-text-muted pt-1 border-t border-white/[0.06]">
                          <span>مصرف: {formatCurrency(b.spent, currency)}</span>
                          <span>سقف: {formatCurrency(b.amount, currency)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );

          /* =========================================================
             7. UPCOMING & OVERDUE CHEQUES / DEBTS
             ========================================================= */
          case 'showCheques':
            return (
              <Card key="cheques-section" variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-fintech-text-main">
                      یادآور سررسید چک‌ها و تعهدات نقدی
                    </h3>
                    <p className="text-xs text-fintech-text-muted mt-0.5">
                      اقلام در انتظار پاس‌شدن و مطالبات نزدیک به موعد سررسید
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => onSelectTab('debts')}>
                    مشاهده دفتر تعهدات
                  </Button>
                </div>

                {upcomingItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-fintech-text-muted">
                    هیچ چک یا پرونده بدهی نزدیک به سررسید وجود ندارد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={item.isPayable ? 'danger' : 'success'}
                              size="sm"
                            >
                              {item.isPayable ? 'پرداختنی' : 'دریافتنی'}
                            </Badge>
                            <span className="text-[10px] font-mono text-fintech-text-muted">
                              {item.dueDate}
                            </span>
                          </div>

                          <h5 className="text-xs font-semibold text-fintech-text-main truncate mt-1">
                            {item.title}
                          </h5>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] text-fintech-text-muted">مبلغ:</span>
                          <span
                            className={`font-mono tabular-nums font-semibold text-xs ${
                              item.isPayable ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {formatCurrency(item.amount, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );

          default:
            return null;
        }
      })();

      if (!sectionContent) return null;

      if (sectionIdx > 1) {
        return (
          <div key={sectionKey} className="cv-widget contain-paint">
            {sectionContent}
          </div>
        );
      }

      return <React.Fragment key={sectionKey}>{sectionContent}</React.Fragment>;
    })}

      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
};

export default DashboardView;
