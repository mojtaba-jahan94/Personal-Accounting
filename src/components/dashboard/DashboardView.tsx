import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from './StatCard';
import { ExpenseChart } from './ExpenseChart';
import { DashboardCustomizeModal } from './DashboardCustomizeModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { formatCurrency, formatCardNumber, toPersianDigits, formatNumber } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { formatJalaliLong } from '../../utils/jalali';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowLeftRight,
  AlertTriangle,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  CreditCard,
  PieChart as PieIcon,
  ListOrdered,
  Layers,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  Landmark,
  Scale,
} from 'lucide-react';
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
    debts = [],
    cheques = [],
    currency,
    dashboardConfig,
    totalPortfolioValueToman,
    totalPortfolioPnlToman,
    totalPortfolioPnlPercent,
  } = useFinance();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Cash flow net savings
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const recentTransactions = transactions.slice(0, 5);
  const pendingCheques = cheques.filter((c) => c.status === 'pending');

  // Receivables (credits) and Debts totals
  const totalReceivables = debts
    .filter((d) => d.type === 'credit')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const totalPayableDebts = debts
    .filter((d) => d.type === 'debt')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  // Total Net Worth: Liquid cash + Portfolio Assets + Receivables - Debts
  const totalNetWorth =
    totalBalance + totalPortfolioValueToman + totalReceivables - totalPayableDebts;

  const sectionOrder: DashboardSectionKey[] =
    dashboardConfig.sectionOrder && dashboardConfig.sectionOrder.length > 0
      ? dashboardConfig.sectionOrder
      : DEFAULT_ORDER;

  const renderSection = (key: DashboardSectionKey) => {
    switch (key) {
      case 'showHero':
        if (!dashboardConfig.showHero) return null;
        return (
          <div key="hero" className="space-y-4">
            {/* 1. Luxury Nordic Net Worth Hero Banner */}
            <div className="rounded-3xl p-6 sm:p-7 bg-[#1F2933] text-[#F7F7F2] border border-[#6B7280]/20 shadow-2xl relative overflow-hidden select-none">
              {/* Subtle Warm Wood Radial Ambient Glow */}
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#A68A64]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#6B7280]/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A68A64] shadow-xs shadow-[#A68A64]/50" />
                    <span className="text-xs font-bold text-[#A68A64] uppercase tracking-wider">
                      ثروت و خالص دارایی (Net Worth)
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-[#F7F7F2]">
                    {formatCurrency(totalNetWorth, currency)}
                  </h2>

                  <p className="text-xs text-[#D1D5DB]/80 mt-1.5 flex items-center gap-2">
                    <span>موجودی نقد + ارزش پورتفوی طلا و ارز + طلب‌ها − بدهی‌ها</span>
                  </p>
                </div>

                {/* Wealth Breakdown Capsules */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
                  {/* Liquid Cash */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] text-[#D1D5DB]/70 block font-medium">موجودی نقد</span>
                    <span className="font-bold font-mono text-xs sm:text-sm text-[#F7F7F2] block mt-0.5 truncate">
                      {formatCurrency(totalBalance, currency)}
                    </span>
                  </div>

                  {/* Portfolio Assets */}
                  <div className="p-3 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 backdrop-blur-md">
                    <span className="text-[10px] text-[#A68A64] block font-bold">سبد دارایی و طلا</span>
                    <span className="font-bold font-mono text-xs sm:text-sm text-[#F7F7F2] block mt-0.5 truncate">
                      {formatCurrency(totalPortfolioValueToman, currency)}
                    </span>
                  </div>

                  {/* Receivables */}
                  <div className="p-3 rounded-2xl bg-[#2E7D5B]/15 border border-[#2E7D5B]/30 backdrop-blur-md">
                    <span className="text-[10px] text-[#4ADE80] block font-bold">طلب‌ها</span>
                    <span className="font-bold font-mono text-xs sm:text-sm text-[#4ADE80] block mt-0.5 truncate">
                      +{formatCurrency(totalReceivables, currency)}
                    </span>
                  </div>

                  {/* Debts */}
                  <div className="p-3 rounded-2xl bg-[#C0564B]/15 border border-[#C0564B]/30 backdrop-blur-md">
                    <span className="text-[10px] text-[#F87171] block font-bold">بدهی‌ها</span>
                    <span className="font-bold font-mono text-xs sm:text-sm text-[#F87171] block mt-0.5 truncate">
                      -{formatCurrency(totalPayableDebts, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenTransactionModal}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-bold text-xs shadow-md shadow-[#A68A64]/25 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>ثبت تراکنش</span>
                  </button>

                  <button
                    onClick={onOpenTransferModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F7F7F2] font-bold text-xs transition active:scale-95"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>انتقال وجه</span>
                  </button>
                </div>

                <button
                  onClick={() => onSelectTab('assets')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#A68A64] hover:text-[#C2A882] transition"
                >
                  <span>مدیریت سبد طلا، سکه و ارز</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'showKpiCards':
        if (!dashboardConfig.showKpiCards) return null;
        return (
          <div key="kpi" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="مجموع موجودی حساب‌ها"
              amount={formatCurrency(totalBalance, currency)}
              subtext={`${toPersianDigits(accounts.length)} حساب و کارت بانکی فعال`}
              icon={Wallet}
              colorClass="bg-[#A68A64]/15 text-[#A68A64]"
            />
            <StatCard
              title="کل درآمد ثبت شده"
              amount={formatCurrency(totalIncome, currency)}
              subtext="مجموع واریزی‌ها"
              icon={TrendingUp}
              colorClass="bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80]"
              badge={{ text: 'درآمد فعال', isPositive: true }}
            />
            <StatCard
              title="کل هزینه‌های انجام شده"
              amount={formatCurrency(totalExpense, currency)}
              subtext="مجموع مصارف"
              icon={TrendingDown}
              colorClass="bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171]"
              badge={{ text: 'مخارج', isPositive: false }}
            />
            <StatCard
              title="پس‌انداز خالص (تراز نقدی)"
              amount={formatCurrency(netSavings, currency)}
              subtext={`نرخ پس‌انداز: ${toPersianDigits(Math.max(0, savingsRate))}٪`}
              icon={PiggyBank}
              colorClass="bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA]"
              badge={{
                text: netSavings >= 0 ? 'تراز مثبت' : 'تراز منفی',
                isPositive: netSavings >= 0,
              }}
            />
          </div>
        );

      case 'showAccounts':
        if (!dashboardConfig.showAccounts) return null;
        return (
          <CollapsibleSection
            key="accounts"
            storageKey="accounts"
            title="کارت‌های بانکی و کیف‌پول‌ها"
            subtitle="موجودی لحظه‌ای حساب‌های شما"
            icon={<CreditCard className="w-5 h-5 text-[#A68A64]" />}
            headerAction={
              <button
                onClick={() => onSelectTab('accounts')}
                className="flex items-center gap-1 text-xs font-bold text-[#A68A64] hover:underline px-2 py-1"
              >
                <span>مدیریت همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            }
          >
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#6B7280] dark:text-[#D1D5DB]/60">
                هنوز حسابی تعریف نکرده‌اید
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-3xl p-5 text-[#F7F7F2] bg-[#1F2933] border border-[#6B7280]/20 relative overflow-hidden shadow-md flex flex-col justify-between h-40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
                  >
                    {/* Nordic warm ambient corner shine */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#A68A64]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#A68A64]/25 transition" />

                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <span className="text-[11px] font-medium text-[#D1D5DB]/70">{acc.bankName || 'حساب بانکی'}</span>
                        <h4 className="text-sm font-black truncate mt-0.5">{acc.name}</h4>
                      </div>
                      <span className="p-2 rounded-2xl bg-white/10 backdrop-blur-md text-[#A68A64]">
                        <Landmark className="w-4 h-4" />
                      </span>
                    </div>

                    {acc.cardNumber && (
                      <div className="font-mono text-xs tracking-widest text-[#D1D5DB] dir-ltr text-center font-bold relative z-10">
                        {formatCardNumber(acc.cardNumber)}
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between relative z-10">
                      <span className="text-[11px] text-[#D1D5DB]/70">موجودی:</span>
                      <span className="font-black font-mono text-sm text-[#F7F7F2]">
                        {formatCurrency(acc.balance, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        );

      case 'showExpenseChart':
        if (!dashboardConfig.showExpenseChart) return null;
        return (
          <CollapsibleSection
            key="charts"
            storageKey="charts"
            title="تحلیل نموداری مخارج و دخل و خرج"
            subtitle="بررسی بصری هزینه‌ها و نمودار ستونی روند مالی"
            icon={<PieIcon className="w-5 h-5 text-[#A68A64]" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-[#F7F7F2]/90 dark:bg-[#1F2933]/70 backdrop-blur-xl rounded-3xl p-5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="text-sm font-black text-[#1F2933] dark:text-[#F7F7F2]">تفکیک مخارج بر اساس دسته‌بندی</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">پرتکرارترین هزینه‌های ثبت شده</p>
                  </div>
                </div>
                <ExpenseChart type="pie" />
              </div>

              <div className="bg-[#F7F7F2]/90 dark:bg-[#1F2933]/70 backdrop-blur-xl rounded-3xl p-5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="text-sm font-black text-[#1F2933] dark:text-[#F7F7F2]">روند درآمد و هزینه</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">مقایسه دوره‌ای دخل و خرج</p>
                  </div>
                </div>
                <ExpenseChart type="bar" />
              </div>
            </div>
          </CollapsibleSection>
        );

      case 'showRecentTransactions':
        if (!dashboardConfig.showRecentTransactions) return null;
        return (
          <CollapsibleSection
            key="recent_tx"
            storageKey="recent_tx"
            title="آخرین تراکنش‌ها"
            subtitle="۵ فعالیت مالی اخیر شما"
            icon={<ListOrdered className="w-5 h-5 text-[#A68A64]" />}
            headerAction={
              <button
                onClick={() => onSelectTab('transactions')}
                className="flex items-center gap-1 text-xs font-bold text-[#A68A64] hover:underline px-2 py-1"
              >
                <span>مشاهده همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            }
          >
            <div className="divide-y divide-[#6B7280]/15 dark:divide-[#D1D5DB]/10">
              {recentTransactions.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#6B7280] dark:text-[#D1D5DB]/60">تراکنشی ثبت نشده است</p>
              ) : (
                recentTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <div
                      key={tx.id}
                      className="py-3 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pl-2">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{
                            backgroundColor: cat?.color ? `${cat.color}20` : '#A68A6420',
                            color: cat?.color || '#A68A64',
                          }}
                        >
                          {cat ? getCategoryIcon(cat.icon) : <Wallet className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2] truncate">
                            {tx.description || (cat ? cat.name : 'تراکنش')}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 mt-0.5 truncate">
                            <span className="whitespace-nowrap font-mono">{formatJalaliLong(tx.date)}</span>
                            <span>•</span>
                            <span className="truncate">{acc ? acc.name : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div
                          className={`text-xs sm:text-sm font-black font-mono whitespace-nowrap ${
                            tx.type === 'income'
                              ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                              : tx.type === 'expense'
                              ? 'text-[#C0564B] dark:text-[#F87171]'
                              : 'text-[#4A6FA5] dark:text-[#60A5FA]'
                          }`}
                        >
                          {tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : '↔ '}
                          {formatCurrency(tx.amount, currency)}
                        </div>
                        <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/60 block whitespace-nowrap">
                          {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleSection>
        );

      case 'showBudgetProgress':
        if (!dashboardConfig.showBudgetProgress) return null;
        return (
          <CollapsibleSection
            key="budgets"
            storageKey="budgets"
            title="وضعیت بودجه این ماه"
            subtitle="سقف هزینه‌ها و هشدار مصرف"
            icon={<Layers className="w-5 h-5 text-[#A68A64]" />}
            headerAction={
              <button
                onClick={() => onSelectTab('budgets')}
                className="text-xs text-[#A68A64] hover:underline font-bold px-2 py-1"
              >
                جزئیات
              </button>
            }
          >
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <p className="text-center py-4 text-xs text-[#6B7280] dark:text-[#D1D5DB]/60">بودجه‌ای ثبت نشده است</p>
              ) : (
                budgets.slice(0, 3).map((b) => {
                  const cat = categories.find((c) => c.id === b.categoryId);
                  const normalizedMonth = b.month ? b.month.replace(/-/g, '/') : '';
                  const spent = transactions
                    .filter((t) => {
                      if (t.type !== 'expense' || t.categoryId !== b.categoryId) return false;
                      if (!normalizedMonth) return true;
                      return t.date.replace(/-/g, '/').startsWith(normalizedMonth);
                    })
                    .reduce((sum, t) => sum + t.amount, 0);

                  const percent = Math.min(100, Math.round((spent / b.amount) * 100));
                  const isDanger = percent >= 90;

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#1F2933] dark:text-[#F7F7F2]">{cat ? cat.name : 'بودجه'}</span>
                        <span className={isDanger ? 'text-[#C0564B] font-bold' : 'text-[#6B7280] dark:text-[#D1D5DB]'}>
                          {toPersianDigits(percent)}٪
                        </span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDanger
                              ? 'bg-[#C0564B]'
                              : percent > 70
                              ? 'bg-[#A68A64]'
                              : 'bg-[#2E7D5B]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 font-mono">
                        <span>مصرف: {formatCurrency(spent, currency)}</span>
                        <span>سقف: {formatCurrency(b.amount, currency)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleSection>
        );

      case 'showCheques':
        if (!dashboardConfig.showCheques || pendingCheques.length === 0) return null;
        return (
          <div
            key="cheques"
            className="p-5 border border-[#A68A64]/30 bg-[#A68A64]/10 rounded-3xl shadow-sm space-y-2 select-none"
          >
            <div className="flex items-center gap-2 text-[#A68A64] font-black text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>یادآور چک‌های سررسید نزدیک</span>
            </div>
            <p className="text-xs text-[#1F2933] dark:text-[#D1D5DB] leading-relaxed">
              تعداد {toPersianDigits(pendingCheques.length)} فقره چک در جریان با مجموع مبلغ{' '}
              <span className="font-bold font-mono">
                {formatCurrency(
                  pendingCheques.reduce((s, c) => s + c.amount, 0),
                  currency
                )}
              </span>{' '}
              دارید.
            </p>
            <button
              onClick={() => onSelectTab('debts')}
              className="text-xs font-bold text-[#A68A64] hover:underline"
            >
              بررسی در بخش چک و اقساط →
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Header & Customization Toolbar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight">
            داشبورد مالی
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/80">
            نمای کلی ثروت، حساب‌ها، کارت‌ها و جریان نقدی
          </p>
        </div>
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs sm:text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2] hover:bg-black/10 dark:hover:bg-white/10 transition"
          title="شخصی‌سازی و چیدمان بخش‌های پیشخوان"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#A68A64]" />
          <span>شخصی‌سازی چیدمان</span>
        </button>
      </div>

      {/* Dynamic Ordered Bento Sections */}
      {sectionOrder.map((key) => (
        <React.Fragment key={key}>{renderSection(key)}</React.Fragment>
      ))}

      {/* Dashboard Customization Modal */}
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
};

export default DashboardView;
