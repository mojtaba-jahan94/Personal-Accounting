import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { formatJalaliLong, isDateInJalaliRange } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { DateFilterBar, DatePreset } from '../common/DateFilterBar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import * as XLSX from 'xlsx';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  Plus,
  Settings2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  RotateCcw,
  Receipt,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TransactionListProps {
  onOpenTransactionModal: (tx?: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenTransactionModal }) => {
  const {
    transactions,
    categories,
    accounts,
    currency,
    deleteTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Date Range filter
      if (startDate || endDate) {
        if (!isDateInJalaliRange(tx.date, startDate, endDate)) {
          return false;
        }
      }

      // 2. Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchTag = tx.tags?.some((t) => t.toLowerCase().includes(q));
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchDesc && !matchTag && !matchAmount) return false;
      }

      // 3. Type, Category, Account
      if (selectedType !== 'all' && tx.type !== selectedType) return false;
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;
      if (
        selectedAccount !== 'all' &&
        tx.accountId !== selectedAccount &&
        tx.toAccountId !== selectedAccount
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, datePreset, searchTerm, selectedType, selectedCategory, selectedAccount]);

  // Windowed Pagination: render first 30 rows, load more on scroll
  const [visibleCount, setVisibleCount] = useState(30);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination count on filter change
  useEffect(() => {
    setVisibleCount(30);
  }, [startDate, endDate, datePreset, searchTerm, selectedType, selectedCategory, selectedAccount]);

  // Infinite scroll sentinel observer
  useEffect(() => {
    if (visibleCount >= filtered.length) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 30, filtered.length));
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const visibleTransactions = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  // Group visible filtered transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    for (const tx of visibleTransactions) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => {
        const items = groups[date];
        const dayIncome = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const dayNet = dayIncome - dayExpense;
        return {
          date,
          items,
          dayIncome,
          dayExpense,
          dayNet,
        };
      });
  }, [visibleTransactions]);

  // Statistics
  const filteredIncome = useMemo(
    () => filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );
  const filteredExpense = useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );
  const filteredNet = filteredIncome - filteredExpense;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedAccount !== 'all' ||
    datePreset !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  const handleExportExcel = () => {
    const data = filtered.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const acc = accounts.find((a) => a.id === t.accountId);
      const toAcc = t.toAccountId ? accounts.find((a) => a.id === t.toAccountId) : null;

      return {
        'شناسه': t.id,
        'نوع': t.type === 'income' ? 'درآمد' : t.type === 'expense' ? 'هزینه' : 'انتقال وجه',
        'مبلغ': currency === 'rial' ? t.amount * 10 : t.amount,
        'واحد': currency === 'toman' ? 'تومان' : 'ریال',
        'تاریخ': t.date,
        'شرح': t.description,
        'دسته‌بندی': cat ? cat.name : '-',
        'حساب مبدا': acc ? acc.name : '-',
        'حساب مقصد': toAcc ? toAcc.name : '-',
        'کارمزد': t.fee ? (currency === 'rial' ? t.fee * 10 : t.fee) : 0,
        'برچسب‌ها': t.tags?.join('، ') || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تراکنش‌ها');
    const dateTag =
      startDate && endDate ? `_${startDate.replace(/\//g, '-')}_تا_${endDate.replace(/\//g, '-')}` : '';
    XLSX.writeFile(workbook, `گزارش_تراکنش_ها${dateTag}_${Date.now()}.xlsx`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟ موجودی حساب به وضعیت قبل بازمی‌گردد.')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-fintech-accent animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-fintech-accent uppercase">
              TRANSACTIONS & LEDGER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fintech-text-primary tracking-tight">
            اسناد و تراکنش‌ها
          </h1>
          <p className="text-xs text-fintech-text-muted mt-1">
            نمایش <span className="font-bold text-fintech-text-primary">{toPersianDigits(filtered.length)}</span> از مجموع {toPersianDigits(transactions.length)} سند مالی ثبت‌شده
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={<Settings2 className="w-4 h-4 text-fintech-accent" />}
          >
            دسته‌بندی‌ها
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            icon={<Download className="w-4 h-4 text-emerald-400" />}
            title="دانلود اکسل تراکنش‌های فیلترشده"
          >
            خروجی اکسل
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenTransactionModal()}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            ثبت تراکنش جدید
          </Button>
        </div>
      </div>

      {/* 2. Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card variant="glass" className="p-4 relative overflow-hidden border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              مجموع واریزی‌ها
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {toPersianDigits(filtered.filter((t) => t.type === 'income').length)} مورد
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
            +<AnimatedNumber value={filteredIncome} currency={currency} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden border-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              مجموع هزینه‌ها
            </span>
            <span className="text-[10px] font-mono text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {toPersianDigits(filtered.filter((t) => t.type === 'expense').length)} مورد
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
            -<AnimatedNumber value={filteredExpense} currency={currency} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 relative overflow-hidden border-fintech-accent/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-fintech-accent flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              تراز خالص بازه
            </span>
            <span className="text-[10px] font-mono text-fintech-text-muted">
              {filteredNet >= 0 ? 'مازاد' : 'کسری'}
            </span>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono ${
              filteredNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {filteredNet >= 0 ? '+' : ''}
            <AnimatedNumber value={filteredNet} currency={currency} />
          </div>
        </Card>
      </div>

      {/* 3. Sticky Filter Bar & Search */}
      <Card variant="elevated" className="sticky top-20 z-20 border-white/10 shadow-xl bg-[#13101C]/95">
        <div className="p-4 space-y-3">
          {/* Top Filter Controls: Type Tabs & Toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/5">
              {[
                { id: 'all', label: 'همه', count: transactions.length },
                { id: 'income', label: 'درآمد', count: transactions.filter((t) => t.type === 'income').length },
                { id: 'expense', label: 'هزینه', count: transactions.filter((t) => t.type === 'expense').length },
                { id: 'transfer', label: 'انتقال', count: transactions.filter((t) => t.type === 'transfer').length },
              ].map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id as any)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-fintech-text-muted hover:text-fintech-text-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="txListTypePill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25 -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="flex items-center gap-1.5">
                      <span>{tab.label}</span>
                      <span className="text-[10px] opacity-70 font-mono">({toPersianDigits(tab.count)})</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>حذف فیلترها</span>
                </button>
              )}
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-1 text-xs text-fintech-text-muted hover:text-fintech-text-primary px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <Filter className="w-3.5 h-3.5 text-fintech-accent" />
                <span>فیلترهای پیشرفته</span>
                {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Search and Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-fintech-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در شرح، برچسب، مبلغ..."
                className="w-full pr-10 pl-3 py-2 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-fintech-text-primary placeholder:text-fintech-text-muted focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-2.5 text-fintech-text-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold text-fintech-text-primary focus:outline-none focus:border-violet-500/60 transition"
            >
              <option value="all" className="bg-[#18181b] text-white">همه دسته‌بندی‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#18181b] text-white">
                  {c.name} ({c.type === 'expense' ? 'هزینه' : 'درآمد'})
                </option>
              ))}
            </select>

            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold text-fintech-text-primary focus:outline-none focus:border-violet-500/60 transition"
            >
              <option value="all" className="bg-[#18181b] text-white">همه حساب‌ها و کارت‌ها</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#18181b] text-white">
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex items-center text-xs text-fintech-text-muted justify-between px-3 py-2 rounded-xl bg-black/10 dark:bg-white/[0.02] border border-white/5">
              <span>تعداد نتایج:</span>
              <span className="font-mono font-bold text-fintech-text-primary">
                {toPersianDigits(filtered.length)} تراکنش
              </span>
            </div>
          </div>

          {/* Expandable DateFilterBar */}
          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-2 border-t border-white/5"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* 4. Transactions List Grouped by Date */}
      {groupedTransactions.length === 0 ? (
        <Card variant="glass" className="py-16">
          <EmptyState
            icon={Filter}
            title="هیچ تراکنشی یافت نشد"
            description="با فیلترهای انتخابی یا در این بازه زمانی هیچ سندی ثبت نشده است."
            actionLabel={hasActiveFilters ? 'پاک‌کردن فیلترها' : 'ثبت اولین تراکنش'}
            onAction={hasActiveFilters ? handleResetFilters : () => onOpenTransactionModal()}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {(() => {
            let globalRowIndex = 0;
            return groupedTransactions.map((group) => (
              <div key={group.date} className="space-y-2.5 cv-list-item contain-paint">
                {/* Date Header with Daily Balance */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-fintech-accent" />
                    <span className="font-extrabold text-fintech-text-primary text-sm">
                      {formatJalaliLong(group.date)}
                    </span>
                    <span className="text-[10px] text-fintech-text-muted font-mono">
                      ({toPersianDigits(group.items.length)} تراکنش)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-fintech-text-muted hidden sm:inline">تراز روز:</span>
                    <span
                      className={`font-bold ${
                        group.dayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {group.dayNet >= 0 ? '+' : ''}
                      {formatCurrency(group.dayNet, currency)}
                    </span>
                  </div>
                </div>

                {/* Transactions in Date Group */}
                <Card variant="glass" className="divide-y divide-white/5 overflow-hidden">
                  {group.items.map((tx) => {
                    const rowIdx = globalRowIndex++;
                    const shouldAnimate = rowIdx < 12;
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const acc = accounts.find((a) => a.id === tx.accountId);
                    const toAcc = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : null;

                    return (
                      <motion.div
                        key={tx.id}
                        initial={shouldAnimate ? { opacity: 0, y: 6 } : false}
                        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                        transition={shouldAnimate ? { duration: 0.15, delay: rowIdx * 0.025 } : undefined}
                        className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.04] transition group"
                      >
                        {/* Left side: Icon + Title + Meta */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm"
                          style={{
                            backgroundColor: cat?.color ? `${cat.color}20` : '#8b5cf620',
                            color: cat?.color || '#a78bfa',
                          }}
                        >
                          {getCategoryIcon(cat?.icon || 'Folder', 'w-5 h-5')}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-fintech-text-primary truncate">
                              {tx.description}
                            </span>
                            <Badge
                              variant={
                                tx.type === 'income'
                                  ? 'success'
                                  : tx.type === 'expense'
                                  ? 'danger'
                                  : 'primary'
                              }
                              size="sm"
                            >
                              {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-fintech-text-muted mt-1 font-mono">
                            <span className="text-fintech-text-secondary font-sans font-semibold">
                              {acc ? acc.name : ''}
                              {toAcc ? ` ← ${toAcc.name}` : ''}
                            </span>
                            {cat && tx.type !== 'transfer' && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="font-sans">{cat.name}</span>
                              </>
                            )}
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex gap-1">
                                {tx.tags.map((t) => (
                                  <span key={t} className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-md">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Amount + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                        <div className="text-right sm:text-left">
                          <div
                            className={`text-sm sm:text-base font-extrabold font-mono ${
                              tx.type === 'income'
                                ? 'text-emerald-400'
                                : tx.type === 'expense'
                                ? 'text-rose-400'
                                : 'text-violet-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+ ' : tx.type === 'expense' ? '- ' : '↔ '}
                            {formatCurrency(tx.amount, currency)}
                          </div>
                          {tx.fee ? (
                            <div className="text-[10px] text-fintech-text-muted font-mono">
                              کارمزد: {formatCurrency(tx.fee, currency)}
                            </div>
                          ) : null}
                        </div>

                        {/* Action buttons with hover glow */}
                        <div className="flex items-center gap-1 opacity-90 sm:opacity-80 group-hover:opacity-100 transition">
                          {tx.receiptUrl && (
                            <IconButton
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4 text-violet-400" />}
                              onClick={() => setViewingReceipt(tx.receiptUrl!)}
                              title="مشاهده تصویر رسید"
                            />
                          )}
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-4 h-4 text-fintech-text-muted hover:text-white" />}
                            onClick={() => onOpenTransactionModal(tx)}
                            title="ویرایش"
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4 text-rose-400/80 hover:text-rose-400" />}
                            onClick={() => handleDelete(tx.id)}
                            title="حذف"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </Card>
            </div>
            ));
          })()}

          {/* Infinite scroll sentinel */}
          {visibleCount < filtered.length && (
            <div
              ref={sentinelRef}
              className="py-4 text-center text-xs text-fintech-text-muted flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-fintech-accent animate-pulse" />
              <span>بارگذاری تراکنش‌های بیشتر ({toPersianDigits(filtered.length - visibleCount)} تراکنش دیگر)...</span>
            </div>
          )}
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Receipt Image Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full bg-fintech-card border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">تصویر فاکتور / رسید</span>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={() => setViewingReceipt(null)}
                />
              </div>
              <img src={viewingReceipt} alt="رسید" className="w-full max-h-[75vh] object-contain rounded-2xl border border-white/5" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionList;
