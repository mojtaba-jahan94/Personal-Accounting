import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from './StatCard';
import { ExpenseChart } from './ExpenseChart';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { formatJalaliLong } from '../../utils/jalali';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  AlertTriangle,
  Calendar,
  ChevronLeft,
} from 'lucide-react';
import { TabType } from '../layout/Sidebar';

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
    goals,
    cheques,
    currency,
  } = useFinance();

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Pending cheques
  const pendingCheques = cheques.filter(c => c.status === 'pending');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3">
              ✨ پیشخوان هوشمند مدیریت مالی شخصی
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2">
              سلام! تراز مالی شما {netSavings >= 0 ? 'مثبت و مطلوب' : 'نیازمند مدیریت'} است
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              کنترل هزینه‌ها، پس‌انداز برای اهداف و برنامه‌ریزی چک‌ها و اقساط در یک نگاه.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenTransactionModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت تراکنش</span>
            </button>
            <button
              onClick={onOpenTransferModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 backdrop-blur-md text-white font-medium text-xs sm:text-sm border border-white/20 transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>انتقال وجه</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مجموع موجودی و دارایی"
          amount={formatCurrency(totalBalance, currency)}
          subtext={`${toPersianDigits(accounts.length)} حساب فعال`}
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

      {/* Accounts & Cards Preview Carousel */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">کیف‌پول‌ها و کارت‌های بانکی</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">موجودی لحظه‌ای حساب‌های شما</p>
          </div>
          <button
            onClick={() => onSelectTab('accounts')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>مدیریت همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="rounded-2xl p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36"
              style={{ backgroundColor: acc.color || '#4f46e5' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium opacity-80">{acc.bankName || 'حساب من'}</span>
                  <h4 className="text-sm font-bold truncate mt-0.5">{acc.name}</h4>
                </div>
                <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>

              {acc.cardNumber && (
                <div className="font-mono text-xs tracking-wider opacity-90 dir-ltr text-center">
                  {formatCardNumber(acc.cardNumber)}
                </div>
              )}

              <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                <span className="text-[11px] opacity-80">موجودی:</span>
                <span className="font-bold text-sm">{formatCurrency(acc.balance, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Grid: Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">تفکیک مخارج بر اساس دسته‌بندی</h3>
              <p className="text-xs text-slate-500">پرتکرارترین هزینه‌های شما</p>
            </div>
          </div>
          <ExpenseChart type="pie" />
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">روند درآمد و هزینه</h3>
              <p className="text-xs text-slate-500">مقایسه دوره‌ای دخل و خرج</p>
            </div>
          </div>
          <ExpenseChart type="bar" />
        </div>
      </div>

      {/* Budgets & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">آخرین تراکنش‌ها</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">فهرست ۵ فعالیت مالی اخیر</p>
            </div>
            <button
              onClick={() => onSelectTab('transactions')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>مشاهده همه تراکنش‌ها</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">تراکنشی ثبت نشده است</p>
            ) : (
              recentTransactions.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const acc = accounts.find(a => a.id === tx.accountId);
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: cat ? cat.color : '#64748b' }}
                      >
                        {cat ? getCategoryIcon(cat.icon) : <Wallet className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {tx.description || (cat ? cat.name : 'تراکنش')}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatJalaliLong(tx.date)}</span>
                          <span>•</span>
                          <span>{acc ? acc.name : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div
                        className={`text-xs sm:text-sm font-black ${
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
                      <span className="text-[10px] text-slate-400">
                        {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Budgets & Alerts (1 col) */}
        <div className="space-y-5">
          {/* Active Budgets */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">وضعیت بودجه این ماه</h3>
              <button
                onClick={() => onSelectTab('budgets')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                جزئیات
              </button>
            </div>

            <div className="space-y-3.5">
              {budgets.slice(0, 3).map(b => {
                const cat = categories.find(c => c.id === b.categoryId);
                // Calculate spent in this category
                const spent = transactions
                  .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                  .reduce((sum, t) => sum + t.amount, 0);

                const percent = Math.min(100, Math.round((spent / b.amount) * 100));
                const isDanger = percent >= 90;

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{cat ? cat.name : 'بودجه'}</span>
                      <span className={isDanger ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        {toPersianDigits(percent)}٪
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDanger ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>مصرف شده: {formatCurrency(spent, currency)}</span>
                      <span>سقف: {formatCurrency(b.amount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Cheques Alert */}
          {pendingCheques.length > 0 && (
            <div className="glass-card p-4 border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>یادآور چک‌های سررسید نزدیک</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
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
      </div>
    </div>
  );
};
