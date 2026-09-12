import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { formatJalaliLong } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
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
} from 'lucide-react';

interface TransactionListProps {
  onOpenTransactionModal: (tx?: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenTransactionModal }) => {
  const { transactions, categories, accounts, currency, deleteTransaction } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filter transactions
  const filtered = transactions.filter(tx => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchTag = tx.tags?.some(t => t.toLowerCase().includes(q));
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchDesc && !matchTag && !matchAmount) return false;
    }

    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;
    if (selectedAccount !== 'all' && tx.accountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
      return false;
    }

    return true;
  });

  const handleExportExcel = () => {
    const data = filtered.map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const acc = accounts.find(a => a.id === t.accountId);
      const toAcc = t.toAccountId ? accounts.find(a => a.id === t.toAccountId) : null;

      return {
        'شناسه': t.id,
        'نوع': t.type === 'income' ? 'درآمد' : t.type === 'expense' ? 'هزینه' : 'انتقال وجه',
        'مبلغ': t.amount,
        'واحد': currency === 'toman' ? 'تومان' : 'ریال',
        'تاریخ': t.date,
        'شرح': t.description,
        'دسته‌بندی': cat ? cat.name : '-',
        'حساب مبدا': acc ? acc.name : '-',
        'حساب مقصد': toAcc ? toAcc.name : '-',
        'کارمزد': t.fee || 0,
        'برچسب‌ها': t.tags?.join('، ') || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تراکنش‌ها');
    XLSX.writeFile(workbook, `گزارش_تراکنش_ها_${Date.now()}.xlsx`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟ موجودی حساب به وضعیت قبل بازمی‌گردد.')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">اسناد و تراکنش‌ها</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تعداد کل: {toPersianDigits(filtered.length)} تراکنش مطابق فیلتر
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-400 transition"
          >
            <Settings2 className="w-4 h-4 text-indigo-500" />
            <span>مدیریت دسته‌ها</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-emerald-400 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>خروجی اکسل</span>
          </button>

          <button
            onClick={() => onOpenTransactionModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ثبت تراکنش</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="liquid-glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در شرح، برچسب، مبلغ..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="all">همه انواع تراکنش</option>
              <option value="expense">فقط هزینه‌ها</option>
              <option value="income">فقط درآمدها</option>
              <option value="transfer">فقط انتقالی‌ها</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {categories.map(c => (
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
              className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="all">همه حساب‌ها و کارت‌ها</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="liquid-glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">هیچ تراکنشی یافت نشد</h4>
            <p className="text-xs text-slate-400 mt-1">تراکنش جدیدی اضافه کنید یا فیلترهای جستجو را پاک نمایید.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/40 dark:divide-white/5">
            {filtered.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const acc = accounts.find(a => a.id === tx.accountId);
              const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs"
                      style={{
                        backgroundColor:
                          tx.type === 'transfer' ? '#6366f1' : cat ? cat.color : '#64748b',
                      }}
                    >
                      {tx.type === 'transfer' ? (
                        <ArrowLeftRight className="w-5 h-5" />
                      ) : cat ? (
                        getCategoryIcon(cat.icon)
                      ) : (
                        <Tag className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.description}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : tx.type === 'expense'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {tx.type === 'income' ? 'درآمد' : tx.type === 'expense' ? 'هزینه' : 'انتقال'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formatJalaliLong(tx.date)}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
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
                            {tx.tags.map(t => (
                              <span key={t} className="text-[10px] text-indigo-500 font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right sm:text-left">
                      <div
                        className={`text-sm sm:text-base font-black ${
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
                      {tx.fee ? (
                        <div className="text-[10px] text-slate-400">
                          کارمزد: {formatCurrency(tx.fee, currency)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      {tx.receiptUrl && (
                        <button
                          onClick={() => setViewingReceipt(tx.receiptUrl!)}
                          title="مشاهده تصویر رسید"
                          className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenTransactionModal(tx)}
                        title="ویرایش"
                        className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="حذف"
                        className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800 hover:text-rose-600 transition"
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
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Receipt Image Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full liquid-glass-card p-4 overflow-hidden">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تصویر فاکتور / رسید</span>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-xs px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold"
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
