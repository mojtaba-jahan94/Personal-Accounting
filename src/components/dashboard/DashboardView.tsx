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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-widest text-violet-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              AETHERIUM FINTECH INTELLIGENCE
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono">
              دید کلی ۳۶۰ درجه
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            میز کار مالی
            <span className="text-gradient-cyan-violet text-lg sm:text-xl font-normal font-mono">
              / OVERVIEW
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            icon={<SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />}
            onClick={() => setIsCustomizeOpen(true)}
          >
            <span>شخصی‌سازی ویجت‌ها</span>
          </Button>
        </div>
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
                variant="titanium"
                className="p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden"
              >
                {/* Top Hologram Specular Line */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 via-violet-400/60 to-transparent pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="primary" dot pulse size="sm">
                        تراز کل نقدینگی و حساب‌ها
                      </Badge>
                      <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{toPersianDigits(incomeDelta)}٪ رشد این دوره</span>
                      </span>
                    </div>

                    <div className="text-3xl sm:text-5xl lg:text-6xl font-mono tabular-nums font-bold text-white tracking-tight drop-shadow-md">
                      <AnimatedNumber value={totalBalance} currency={currency} showCurrency />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
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
                        <span>انتقال وجه</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                        onClick={onOpenTransactionModal}
                      >
                        <span>ثبت سند جدید</span>
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
                <Card variant="glass" hoverLift className="p-5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider">ورودی ماه جاری</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-white relative z-10">
                    <AnimatedNumber value={totalIncome} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08] text-[11px] relative z-10">
                    <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                      <span>+{toPersianDigits(incomeDelta)}٪</span>
                      <span className="text-zinc-500 text-[10px]">vs ماه قبل</span>
                    </span>
                    <Sparkline data={[10, 15, 12, 18, 24, totalIncome]} width={56} height={18} color="#10B981" />
                  </div>
                </Card>

                {/* Expense */}
                <Card variant="glass" hoverLift className="p-5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-300" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider">خروجی ماه جاری</span>
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.25)] group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-white relative z-10">
                    <AnimatedNumber value={totalExpense} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08] text-[11px] relative z-10">
                    <span className="text-rose-400 font-mono font-medium flex items-center gap-1">
                      <span>+{toPersianDigits(expenseDelta)}٪</span>
                      <span className="text-zinc-500 text-[10px]">vs ماه قبل</span>
                    </span>
                    <Sparkline data={[20, 18, 22, 19, 15, totalExpense]} width={56} height={18} color="#F43F5E" />
                  </div>
                </Card>

                {/* Net Savings */}
                <Card variant="glass" hoverLift className="p-5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/20 transition-all duration-300" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider">پس‌انداز خالص</span>
                    <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-glow-violet group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-mono tabular-nums font-bold relative z-10 ${
                      netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <AnimatedNumber value={netSavings} currency={currency} showCurrency />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.08] text-[11px] relative z-10">
                    <span className="text-zinc-400 font-mono">تراز منابع و مصارف</span>
                    <Sparkline data={[5, 8, 4, 12, 10, netSavings]} width={56} height={18} color="#8B5CF6" />
                  </div>
                </Card>

                {/* Savings Rate % */}
                <Card variant="glass" hoverLift className="p-5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-300" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider">شاخص سلامت پس‌انداز</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-white relative z-10">
                    {toPersianDigits(savingsRate)}٪
                  </div>
                  <div className="mt-3 relative z-10">
                    <ProgressBar value={savingsRate} variant="primary" size="sm" glow />
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
                <Card variant="glass" className="lg:col-span-8 p-6 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase">
                          DIGITAL WALLET & CARDS
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        کارت‌های بانکی و حساب‌ها
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        روی هر کارت کلیک کنید تا به جلو بیاید و عملیات سریع انجام شود
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CreditCard className="w-3.5 h-3.5 text-violet-400" />}
                      onClick={() => onSelectTab('accounts')}
                    >
                      <span>مدیریت همه کارت‌ها</span>
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
                    <div className="relative h-64 sm:h-72 flex items-center justify-center select-none perspective-[1000px]">
                      {accounts.slice(0, 5).map((acc, idx) => {
                        const isSelected = idx === selectedAccountIndex;
                        const offset = idx - selectedAccountIndex;

                        return (
                          <motion.div
                            key={acc.id}
                            onClick={() => setSelectedAccountIndex(idx)}
                            animate={{
                              x: offset * -28,
                              y: Math.abs(offset) * 14,
                              scale: isSelected ? 1 : 1 - Math.abs(offset) * 0.07,
                              zIndex: 10 - Math.abs(offset),
                              opacity: Math.abs(offset) > 2 ? 0.3 : 1,
                              rotateY: offset * 3,
                            }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`absolute w-80 sm:w-96 h-52 rounded-[2rem] p-6 border cursor-pointer transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden ${
                              isSelected
                                ? 'border-violet-500/50 shadow-glow-violet bg-gradient-to-br from-[#241B3D] via-[#161224] to-[#0E0C15] ring-1 ring-white/20'
                                : 'border-white/10 bg-[#141120]/90 hover:border-white/20'
                            }`}
                          >
                            {/* Card Decorative Sheen */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none" />

                            {/* Header: Bank Name & Chip */}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-violet-300">
                                  {acc.bankName || 'شتاب'}
                                </span>
                                <span className="text-sm font-bold text-white tracking-wide">
                                  {acc.name}
                                </span>
                              </div>

                              {/* Metallic EMV Chip graphic */}
                              <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1 flex items-center justify-center shadow-inner opacity-90 border border-amber-300/40">
                                <div className="w-full h-full border border-black/20 rounded-md grid grid-cols-2 gap-0.5 opacity-60">
                                  <div className="border-r border-black/20" />
                                  <div className="border-l border-black/20" />
                                </div>
                              </div>
                            </div>

                            {/* Middle: Card Number Formatted in Blocks */}
                            <div className="relative z-10 py-1">
                              <div className="text-base sm:text-lg font-mono tracking-[0.25em] text-zinc-300 font-semibold drop-shadow-sm" dir="ltr">
                                {acc.cardNumber ? formatCardNumber(acc.cardNumber) : '•••• •••• •••• ••••'}
                              </div>
                            </div>

                            {/* Footer: Balance & Currency */}
                            <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-2.5">
                              <div>
                                <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">
                                  موجودی در دسترس
                                </span>
                                <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-white tracking-tight">
                                  {formatCurrency(acc.balance, currency)}
                                </div>
                              </div>
                              <span className="text-xs font-mono font-medium text-violet-400">
                                شتاب IR
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions underneath card */}
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/[0.08]">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />}
                      onClick={onOpenTransferModal}
                    >
                      انتقال بین‌حسابی
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                      onClick={onOpenTransactionModal}
                    >
                      تراکنش به این حساب
                    </Button>
                  </div>
                </Card>

                {/* Net Worth Summary Breakdown (4 cols) */}
                <Card variant="glass" className="lg:col-span-4 p-6 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400 flex items-center gap-1.5 mb-2 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                      خالص کل دارایی (NET WORTH)
                    </span>
                    <div className="text-3xl sm:text-4xl font-mono tabular-nums font-extrabold text-white mt-1 drop-shadow-sm">
                      <AnimatedNumber value={totalNetWorth} currency={currency} showCurrency />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      تراز یکپارچه کل نقدینگی، پورتفوی طلا و ارز، منهای تعهدات و بدهی‌های جاری.
                    </p>

                    {/* Breakdown bar */}
                    <div className="space-y-3.5 mt-6">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-zinc-300 font-medium">موجودی نقد حساب‌ها</span>
                          <span className="font-mono tabular-nums text-white font-semibold">{formatCurrency(totalBalance, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalBalance / totalNetWorth) * 100 : 0} variant="primary" size="sm" glow />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-zinc-300 font-medium">سبد طلا، ارز و کریپتو</span>
                          <span className="font-mono tabular-nums text-amber-400 font-semibold">+{formatCurrency(totalPortfolioValueToman, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalPortfolioValueToman / totalNetWorth) * 100 : 0} variant="warning" size="sm" glow />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-zinc-300 font-medium">مجموع مطالبات (طلب)</span>
                          <span className="font-mono tabular-nums text-emerald-400 font-semibold">+{formatCurrency(totalReceivables, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalReceivables / totalNetWorth) * 100 : 0} variant="success" size="sm" glow />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-zinc-300 font-medium">تعهدات و بدهی‌ها</span>
                          <span className="font-mono tabular-nums text-rose-400 font-semibold">-{formatCurrency(totalPayableDebts, currency)}</span>
                        </div>
                        <ProgressBar value={totalNetWorth > 0 ? (totalPayableDebts / totalNetWorth) * 100 : 0} variant="danger" size="sm" glow />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="mt-6 border border-white/10 hover:border-violet-500/30"
                    onClick={() => onSelectTab('reports')}
                  >
                    <span>مشاهده گزارش تحلیلی ترازنامه</span>
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
                <Card variant="glass" className="lg:col-span-8 p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                          LIVE LEDGER & LOGS
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        آخرین تراکنش‌ها و اسناد
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        فهرست جدیدترین اسناد ثبت‌شده با دسته‌بندی و جزئیات
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-white/10 hover:border-violet-500/30"
                      onClick={() => onSelectTab('transactions')}
                    >
                      <span>مشاهده همه اسناد</span>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>

                  {transactions.length === 0 ? (
                    <EmptyState
                      icon={<ReceiptText className="w-6 h-6 text-violet-400" />}
                      title="هنوز تراکنشی ثبت نشده است"
                      description="اولین تراکنش خود را ثبت کنید تا تاریخچه مالی شکل بگیرد."
                      action={
                        <Button variant="primary" size="sm" onClick={onOpenTransactionModal}>
                          ثبت اولین تراکنش
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
                            className="py-3 px-3 flex items-center justify-between hover:bg-white/[0.04] rounded-2xl transition duration-150 group cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                                  isIncome
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                    : isTransfer
                                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 shadow-glow-violet'
                                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                                }`}
                              >
                                {getCategoryIcon(cat?.icon || 'ReceiptText', 'w-5 h-5')}
                              </div>

                              <div>
                                <span className="text-xs sm:text-sm font-semibold text-white block group-hover:text-violet-300 transition-colors">
                                  {tx.description || cat?.name || 'بدون شرح'}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                                  <span>{tx.date}</span>
                                  {cat && <span className="text-zinc-500">• {cat.name}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="text-left font-mono tabular-nums text-sm sm:text-base font-bold">
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
                    <Card variant="gradient" glow className="p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center mb-3.5 shadow-glow-violet group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-6 h-6 text-amber-300" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 block mb-1">
                        AI SMART INSIGHT
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                        {smartInsight.title}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mb-5">
                        {smartInsight.desc}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 border-white/20"
                        onClick={() => onSelectTab(smartInsight.tab)}
                      >
                        {smartInsight.actionText}
                      </Button>
                    </Card>
                  )}

                  {/* Nearest Goal Card */}
                  {nearestGoal && (
                    <Card variant="glass" className="p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono uppercase text-violet-400 flex items-center gap-1.5 font-bold tracking-wider">
                          <Target className="w-4 h-4 text-emerald-400" />
                          نزدیک‌ترین هدف پس‌انداز
                        </span>
                        <Badge variant="primary" size="sm" pulse>
                          {toPersianDigits(
                            Math.round((nearestGoal.currentAmount / nearestGoal.targetAmount) * 100)
                          )}
                          ٪
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1.5">
                        {nearestGoal.title}
                      </h4>

                      <div className="flex items-baseline justify-between font-mono tabular-nums text-xs text-zinc-400 mt-2 mb-2.5">
                        <span>ذخیره‌شده: {formatCurrency(nearestGoal.currentAmount, currency)}</span>
                        <span>هدف: {formatCurrency(nearestGoal.targetAmount, currency)}</span>
                      </div>

                      <ProgressBar
                        value={(nearestGoal.currentAmount / nearestGoal.targetAmount) * 100}
                        variant="primary"
                        size="sm"
                        glow
                      />

                      <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400 font-mono">
                          باقیمانده: {formatCurrency(Math.max(0, nearestGoal.targetAmount - nearestGoal.currentAmount), currency)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-white/10 hover:border-violet-500/30 text-xs"
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
                <Card variant="glass" className="lg:col-span-7 p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase">
                          CASHFLOW MOMENTUM
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        مقایسه ۶ ماهه درآمد و مخارج
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        بهترین ماه پس‌انداز با رنگ نئون سبز مشخص شده است
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" className="border border-white/10 hover:border-violet-500/30 text-xs" onClick={() => onSelectTab('reports')}>
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
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '18px',
                            color: '#F7F5FA',
                            fontFamily: 'JetBrains Mono',
                            direction: 'rtl',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                          }}
                        />
                        <Bar
                          dataKey="income"
                          name="درآمد"
                          radius={[8, 8, 0, 0]}
                          isAnimationActive={!hasChartAnimatedRef.current}
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          {sixMonthBarData.map((entry, index) => (
                            <Cell
                              key={`cell-inc-${index}`}
                              fill={entry.isBest ? '#10B981' : '#10B98199'}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="expense"
                          name="مخارج"
                          radius={[8, 8, 0, 0]}
                          isAnimationActive={!hasChartAnimatedRef.current}
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          {sixMonthBarData.map((entry, index) => (
                            <Cell
                              key={`cell-exp-${index}`}
                              fill={entry.isBest ? '#F43F5E' : '#F43F5E99'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Spending by Category Donut (5 cols) */}
                <Card variant="glass" className="lg:col-span-5 p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                          CATEGORY RADAR
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        سهم مخارج بر اساس دسته‌بندی
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        پایش سهم هزینه‌ها در دوره جاری
                      </p>
                    </div>
                  </div>

                  {categoryDonutData.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-xs text-zinc-500 font-medium">
                      هزینه‌ای برای تحلیل در این بازه ثبت نشده است
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="divide-y divide-white/[0.06]">
                        {categoryDonutData.slice(0, 5).map((cat) => (
                          <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs group hover:bg-white/[0.02] px-2 rounded-xl transition">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: cat.color, color: cat.color }}
                              />
                              <span className="font-semibold text-white group-hover:text-violet-300 transition-colors">{cat.name}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono tabular-nums text-zinc-400 font-medium">
                                {toPersianDigits(cat.percent)}٪
                              </span>
                              <span className="font-mono tabular-nums font-bold text-white">
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
              <Card key="budgets-section" variant="glass" className="p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                        BUDGET THRESHOLDS
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      وضعیت سقف بودجه‌های ماهانه
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      کنترل هوشمند سقف تعیین‌شده در دسته‌بندی‌های فعال
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" className="border-white/10" onClick={() => onSelectTab('budgets')}>
                    مدیریت بودجه‌ها
                  </Button>
                </div>

                {topBudgets.length === 0 ? (
                  <EmptyState
                    icon={<PieIcon className="w-6 h-6 text-violet-400" />}
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
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {b.catName}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-full ${
                              b.isOver
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : b.isNear
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {toPersianDigits(b.percent)}٪
                          </span>
                        </div>

                        <ProgressBar
                          value={b.percent}
                          variant={b.isOver ? 'danger' : b.isNear ? 'warning' : 'success'}
                          size="sm"
                          glow
                        />

                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/[0.06]">
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
              <Card key="cheques-section" variant="glass" className="p-6 sm:p-7 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase">
                        LIABILITIES & COMMITMENTS
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      یادآور سررسید چک‌ها و تعهدات نقدی
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      اقلام در انتظار پاس‌شدن و مطالبات نزدیک به موعد سررسید
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" className="border-white/10" onClick={() => onSelectTab('debts')}>
                    مشاهده دفتر تعهدات
                  </Button>
                </div>

                {upcomingItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-medium">
                    هیچ چک یا پرونده بدهی نزدیک به سررسید وجود ندارد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={item.isPayable ? 'danger' : 'success'}
                              size="sm"
                            >
                              {item.isPayable ? 'پرداختنی' : 'دریافتنی'}
                            </Badge>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {item.dueDate}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white truncate mt-1">
                            {item.title}
                          </h5>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 font-mono">مبلغ سند:</span>
                          <span
                            className={`font-mono tabular-nums font-bold text-xs ${
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
