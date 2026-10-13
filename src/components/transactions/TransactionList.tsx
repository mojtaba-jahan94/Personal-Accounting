import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { formatJalaliLong, isDateInJalaliRange } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { DateFilterBar, DatePreset } from '../common/DateFilterBar';
import * as XLSX from 'xlsx';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Eye,
  Plus,
  Settings2,
  TrendingUp,
  TrendingDown,
  Scale,
  ListOrdered,
  Calendar,
  RotateCcw,
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

  // Filter transactions
  const filtered = transactions.filter((tx) => {
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

  // Calculate filtered statistics
  const filteredIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Main Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2]">
            اسناد و تراکنش‌ها
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/80">
            نمایش {toPersianDigits(filtered.length)} از مجموع {toPersianDigits(transactions.length)} تراکنش ثبت‌شده
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition active:scale-95"
          >
            <Settings2 className="w-4 h-4 text-[#A68A64]" />
            <span>دسته‌بندی‌ها</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold hover:border-[#2E7D5B]/50 transition active:scale-95"
            title="دانلود فایل اکسل از تراکنش‌های فیلترشده"
          >
            <Download className="w-4 h-4 text-[#2E7D5B] dark:text-[#4ADE80]" />
            <span>خروجی اکسل</span>
          </button>

          <button
            onClick={() => onOpenTransactionModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-black shadow-md shadow-[#A68A64]/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>ثبت تراکنش جدید</span>
          </button>
        </div>
      </div>

      {/* 2. Transaction Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'همه تراکنش‌ها', count: transactions.length },
          {
            id: 'income',
            label: 'واریز و درآمد',
            count: transactions.filter((t) => t.type === 'income').length,
          },
          {
            id: 'expense',
            label: 'برداشت و هزینه',
            count: transactions.filter((t) => t.type === 'expense').length,
          },
          {
            id: 'transfer',
            label: 'انتقال وجه',
            count: transactions.filter((t) => t.type === 'transfer').length,
          },
        ].map((tab) => {
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/25'
                  : 'bg-black/5 dark:bg-white/5 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  isActive
                    ? 'bg-white/20 text-[#F7F7F2]'
                    : 'bg-black/10 dark:bg-white/10 text-[#6B7280] dark:text-[#D1D5DB]'
                }`}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Filter & Search Drawer (Collapsible) */}
      <CollapsibleSection
        storageKey="tx_filters"
        title="فیلترها و جستجوی پیشرفته"
        subtitle={
          hasActiveFilters ? (
            <span className="text-[#A68A64] font-bold">فیلترهای فعال اعمال شده است</span>
          ) : (
            'فیلتر بر اساس تاریخ، نوع، دسته‌بندی و حساب'
          )
        }
        icon={<Filter className="w-5 h-5 text-[#A68A64]" />}
        defaultExpanded={true}
        headerAction={
          hasActiveFilters ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetFilters();
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-[#C0564B] dark:text-[#F87171] px-2.5 py-1 rounded-xl hover:bg-[#C0564B]/10 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌کردن فیلترها</span>
            </button>
          ) : null
        }
      >
        <div className="space-y-4 pt-1">
          {/* Date Filter Bar */}
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

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-[#6B7280] dark:text-[#D1D5DB]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در شرح، برچسب، مبلغ..."
                className="w-full pr-10 pl-3 py-2.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-xs text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:ring-1 focus:ring-[#A68A64] transition"
              />
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:ring-1 focus:ring-[#A68A64] transition"
              >
                <option value="all">همه انواع تراکنش</option>
                <option value="expense">فقط هزینه‌ها</option>
                <option value="income">فقط درآمدها</option>
                <option value="transfer">فقط انتقال وجه</option>
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:ring-1 focus:ring-[#A68A64] transition"
              >
                <option value="all">همه دسته‌بندی‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'expense' ? 'هزینه' : 'درآمد'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:ring-1 focus:ring-[#A68A64] transition"
              >
                <option value="all">همه حساب‌ها و کارت‌ها</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Filtered Summary Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-[#2E7D5B]/10 border border-[#2E7D5B]/25 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] dark:text-[#4ADE80] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>مجموع واریزی‌ها:</span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-[#2E7D5B] dark:text-[#4ADE80]">
              +{formatCurrency(filteredIncome, currency)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#C0564B]/10 border border-[#C0564B]/25 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C0564B] dark:text-[#F87171] mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>مجموع هزینه‌ها:</span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-[#C0564B] dark:text-[#F87171]">
              -{formatCurrency(filteredExpense, currency)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#A68A64]/10 border border-[#A68A64]/25 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#A68A64] mb-1">
              <Scale className="w-4 h-4" />
              <span>تراز خالص بازه:</span>
            </div>
            <div
              className={`text-base sm:text-lg font-black font-mono ${
                filteredNet >= 0
                  ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                  : 'text-[#C0564B] dark:text-[#F87171]'
              }`}
            >
              {filteredNet >= 0 ? '+' : ''}
              {formatCurrency(filteredNet, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Transactions List (Tier 3 60fps Lightweight Translucent Items) */}
      <CollapsibleSection
        storageKey="tx_list_body"
        title="فهرست تراکنش‌ها"
        subtitle={`${toPersianDigits(filtered.length)} سند ثبت‌شده`}
        icon={<ListOrdered className="w-5 h-5 text-[#A68A64]" />}
        defaultExpanded={true}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Filter className="w-12 h-12 text-[#6B7280]/40 dark:text-[#D1D5DB]/30 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              هیچ تراکنشی در این بازه یا با این فیلترها یافت نشد
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 mt-1">
              فیلترهای تاریخ یا جستجو را تغییر دهید یا تراکنش جدیدی ثبت نمایید.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#A68A64]/15 text-[#A68A64] text-xs font-bold hover:bg-[#A68A64] hover:text-[#F7F7F2] transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>حذف همه فیلترها</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#6B7280]/15 dark:divide-[#D1D5DB]/10">
            {filtered.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const acc = accounts.find((a) => a.id === tx.accountId);
              const toAcc = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : null;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: cat?.color ? `${cat.color}20` : '#A68A6420',
                        color: cat?.color || '#A68A64',
                      }}
                    >
                      {getCategoryIcon(cat?.icon || 'Folder', 'w-5 h-5')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2] truncate">
                          {tx.description}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80]'
                              : tx.type === 'expense'
                              ? 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171]'
                              : 'bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA]'
                          }`}
                        >
                          {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 mt-1">
                        <span className="font-mono">{formatJalaliLong(tx.date)}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#1F2933] dark:text-[#D1D5DB]">
                          {acc ? acc.name : ''}
                          {toAcc ? ` ← ${toAcc.name}` : ''}
                        </span>
                        {cat && tx.type !== 'transfer' && (
                          <>
                            <span>•</span>
                            <span>{cat.name}</span>
                          </>
                        )}
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex gap-1 mr-1">
                            {tx.tags.map((t) => (
                              <span key={t} className="text-[10px] text-[#A68A64] font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                    <div className="text-right sm:text-left">
                      <div
                        className={`text-sm sm:text-base font-black font-mono ${
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
                      {tx.fee ? (
                        <div className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/60 font-mono">
                          کارمزد: {formatCurrency(tx.fee, currency)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 text-[#6B7280] dark:text-[#D1D5DB]">
                      {tx.receiptUrl && (
                        <button
                          onClick={() => setViewingReceipt(tx.receiptUrl!)}
                          title="مشاهده تصویر رسید"
                          className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#A68A64] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenTransactionModal(tx)}
                        title="ویرایش"
                        className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#A68A64] transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="حذف"
                        className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#C0564B] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Receipt Image Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="relative max-w-lg w-full bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 rounded-3xl p-5 shadow-2xl overflow-hidden space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
              <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">تصویر فاکتور / رسید</span>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-xs px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl font-bold text-[#1F2933] dark:text-[#F7F7F2] transition"
              >
                بستن
              </button>
            </div>
            <img src={viewingReceipt} alt="رسید" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
