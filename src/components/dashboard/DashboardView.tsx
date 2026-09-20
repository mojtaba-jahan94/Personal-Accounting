import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from './StatCard';
import { ExpenseChart } from './ExpenseChart';
import { DashboardCustomizeModal } from './DashboardCustomizeModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
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
} from 'lucide-react';
import { TabType } from '../layout/Sidebar';
import { LiquidGlassContainer } from '../common/LiquidGlassContainer';
import { LIQUID_GLASS_PRESETS } from '../../utils/liquidGlassPresets';

interface DashboardViewProps {
  onSelectTab: (tab: TabType) => void;
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
}

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
    cheques,
    currency,
    dashboardConfig,
  } = useFinance();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const recentTransactions = transactions.slice(0, 5);
  const pendingCheques = cheques.filter(c => c.status === 'pending');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Customization Toolbar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">داشبورد مالی</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">نمای کلی حساب‌ها، کارت‌ها و جریان نقدی</p>
        </div>
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="glass-pill flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200"
          title="شخصی‌سازی و چیدمان بخش‌های پیشخوان"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>شخصی‌سازی چیدمان</span>
        </button>
      </div>

      {/* 1. iOS 27 Liquid Glass Hero Banner */}
      {dashboardConfig.showHero && (
        <div
          data-glass
          data-config={JSON.stringify(LIQUID_GLASS_PRESETS.crystalWidget)}
          className="relative z-10 overflow-hidden rounded-[36px] liquid-glass-crystal specular-sheen border border-white/70 dark:border-white/20 p-6 sm:p-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black mb-3.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>پیشخوان مالی هوشمند • کریستال شیشه‌ای iOS 27</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2.5 tracking-tight leading-snug">
                وضعیت تراز مالی شما {netSavings >= 0 ? 'مطلوب و رو به رشد 📈' : 'نیازمند بهینه‌سازی ⚠️'} است
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 max-w-xl leading-relaxed font-medium">
                مدیریت فوق‌هوشمند هزینه‌ها، رصد لحظه‌ای سقف بودجه ماهانه و هشدار چک‌های صیادی با بالاترین استاندارد امنیت و طراحی شیشه‌ای.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={onOpenTransactionModal}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/35 active:scale-95 transition-all ring-2 ring-white/60"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ثبت تراکنش جدید</span>
              </button>
              <button
                onClick={onOpenTransferModal}
                className="liquid-glass-pill-lens flex items-center gap-2 px-4 py-3 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm"
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>انتقال وجه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 4 Stat Cards */}
      {dashboardConfig.showKpiCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="مجموع موجودی حساب‌ها"
            amount={formatCurrency(totalBalance, currency)}
            subtext={`${toPersianDigits(accounts.length)} حساب و کارت فعال`}
            icon={Wallet}
            colorClass="bg-indigo-600"
          />

          <StatCard
            title="کل درآمد ثبت شده"
            amount={formatCurrency(totalIncome, currency)}
            subtext="مجموع واریزها"
            icon={TrendingUp}
            colorClass="bg-emerald-600"
            badge={{ text: 'درآمد فعال', isPositive: true }}
          />

          <StatCard
            title="کل هزینه‌های انجام شده"
            amount={formatCurrency(totalExpense, currency)}
            subtext="مجموع مصارف"
            icon={TrendingDown}
            colorClass="bg-rose-600"
            badge={{ text: 'مخارج', isPositive: false }}
          />

          <StatCard
            title="پس‌انداز خالص (تراز)"
            amount={formatCurrency(netSavings, currency)}
            subtext={`نرخ پس‌انداز: ${toPersianDigits(Math.max(0, savingsRate))}٪`}
            icon={PiggyBank}
            colorClass="bg-amber-500"
            badge={{
              text: netSavings >= 0 ? 'تراز مثبت' : 'تراز منفی',
              isPositive: netSavings >= 0,
            }}
          />
        </div>
      )}

      {/* 3. Accounts & Cards (Collapsible) */}
      {dashboardConfig.showAccounts && (
        <CollapsibleSection
          storageKey="accounts"
          title="کارت‌های بانکی و کیف‌پول‌ها"
          subtitle="موجودی لحظه‌ای حساب‌های شما"
          icon={<CreditCard className="w-5 h-5 text-indigo-500" />}
          headerAction={
            <button
              onClick={() => onSelectTab('accounts')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
            >
              <span>مدیریت همه</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          }
        >
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              هنوز حسابی تعریف نکرده‌اید
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg flex flex-col justify-between h-40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: acc.color || '#4f46e5',
                    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.25) 0%, transparent 70%)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-medium opacity-85">{acc.bankName || 'حساب من'}</span>
                      <h4 className="text-sm font-black truncate mt-0.5">{acc.name}</h4>
                    </div>
                    <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
                      <Wallet className="w-4 h-4" />
                    </span>
                  </div>

                  {acc.cardNumber && (
                    <div className="font-mono text-xs tracking-widest opacity-95 dir-ltr text-center font-bold">
                      {formatCardNumber(acc.cardNumber)}
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-white/25 flex items-center justify-between">
                    <span className="text-[11px] opacity-80">موجودی:</span>
                    <span className="font-black text-sm">{formatCurrency(acc.balance, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* 4. Analytics: Donut + Bar (Collapsible) */}
      {dashboardConfig.showExpenseChart && (
        <CollapsibleSection
          storageKey="charts"
          title="تحلیل نموداری مخارج و دخل و خرج"
          subtitle="بررسی بصری هزینه‌ها و نمودار ستونی روند مالی"
          icon={<PieIcon className="w-5 h-5 text-indigo-500" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="liquid-glass-crystal rounded-3xl p-5 border border-white/60 dark:border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">تفکیک مخارج بر اساس دسته‌بندی</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">پرتکرارترین هزینه‌های ثبت شده</p>
                </div>
              </div>
              <ExpenseChart type="pie" />
            </div>

            <div className="liquid-glass-crystal rounded-3xl p-5 border border-white/60 dark:border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">روند درآمد و هزینه</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">مقایسه دوره‌ای دخل و خرج</p>
                </div>
              </div>
              <ExpenseChart type="bar" />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 5, 6, 7. Budgets & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions (2 cols if budgets visible, else 3) */}
        {dashboardConfig.showRecentTransactions && (
          <div className={dashboardConfig.showBudgetProgress || (dashboardConfig.showCheques && pendingCheques.length > 0) ? "lg:col-span-2" : "lg:col-span-3"}>
            <CollapsibleSection
              storageKey="recent_tx"
              title="آخرین تراکنش‌ها"
              subtitle="۵ فعالیت مالی اخیر شما"
              icon={<ListOrdered className="w-5 h-5 text-indigo-500" />}
              headerAction={
                <button
                  onClick={() => onSelectTab('transactions')}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                >
                  <span>مشاهده همه</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              }
            >
              <div className="divide-y divide-slate-200/40 dark:divide-white/5">
                {recentTransactions.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">تراکنشی ثبت نشده است</p>
                ) : (
                  recentTransactions.map(tx => {
                    const cat = categories.find(c => c.id === tx.categoryId);
                    const acc = accounts.find(a => a.id === tx.accountId);
                    return (
                      <div key={tx.id} className="py-3 px-1 sm:px-2 flex items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition">
                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-2">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs"
                            style={{ backgroundColor: cat ? cat.color : '#64748b' }}
                          >
                            {cat ? getCategoryIcon(cat.icon) : <Wallet className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {tx.description || (cat ? cat.name : 'تراکنش')}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                              <span className="whitespace-nowrap">{formatJalaliLong(tx.date)}</span>
                              <span>•</span>
                              <span className="truncate">{acc ? acc.name : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <div
                            className={`text-xs sm:text-sm font-black font-mono whitespace-nowrap ${
                              tx.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : tx.type === 'expense'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : '↔ '}
                            {formatCurrency(tx.amount, currency)}
                          </div>
                          <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                            {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Budgets & Cheques Alerts (1 col) */}
        {(dashboardConfig.showBudgetProgress || (dashboardConfig.showCheques && pendingCheques.length > 0)) && (
          <div className={dashboardConfig.showRecentTransactions ? "space-y-5" : "lg:col-span-3 space-y-5"}>
            {dashboardConfig.showBudgetProgress && (
              <CollapsibleSection
                storageKey="budgets"
                title="وضعیت بودجه این ماه"
                subtitle="سقف هزینه‌ها و هشدار مصرف"
                icon={<Layers className="w-5 h-5 text-indigo-500" />}
                headerAction={
                  <button
                    onClick={() => onSelectTab('budgets')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold px-2 py-1"
                  >
                    جزئیات
                  </button>
                }
              >
                <div className="space-y-4">
                  {budgets.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">بودجه‌ای ثبت نشده است</p>
                  ) : (
                    budgets.slice(0, 3).map(b => {
                      const cat = categories.find(c => c.id === b.categoryId);
                      const normalizedMonth = b.month ? b.month.replace(/-/g, '/') : '';
                      const spent = transactions
                        .filter(t => {
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
                            <span className="text-slate-700 dark:text-slate-300">{cat ? cat.name : 'بودجه'}</span>
                            <span className={isDanger ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                              {toPersianDigits(percent)}٪
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/50 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isDanger ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>مصرف: {formatCurrency(spent, currency)}</span>
                            <span>سقف: {formatCurrency(b.amount, currency)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Pending Cheques Alert */}
            {dashboardConfig.showCheques && pendingCheques.length > 0 && (
              <div className="liquid-glass-card p-5 border-amber-300/50 dark:border-amber-500/30 bg-amber-500/10 rounded-3xl">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>یادآور چک‌های سررسید نزدیک</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                  تعداد {toPersianDigits(pendingCheques.length)} فقره چک در جریان با مجموع مبلغ{' '}
                  {formatCurrency(pendingCheques.reduce((s, c) => s + c.amount, 0), currency)} دارید.
                </p>
                <button
                  onClick={() => onSelectTab('debts')}
                  className="text-xs font-bold text-amber-800 dark:text-amber-300 underline"
                >
                  بررسی در بخش چک و اقساط →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Customization Modal */}
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
};
