import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { getTodayJalali, formatJalaliLong } from '../../utils/jalali';
import { numberToWordsPersian, toPersianDigits } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Tag, Image, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const { categories, accounts, currency, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayJalali());
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

  // Set defaults or populate when initialTransaction is provided
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      setFee(initialTransaction.fee ? initialTransaction.fee.toString() : '0');
      setTags(initialTransaction.tags || []);
      setReceiptUrl(initialTransaction.receiptUrl);
    } else {
      setType('expense');
      setAmount('');
      setDate(getTodayJalali());
      setDescription('');
      const defaultExpCat = categories.find(c => c.type === 'expense');
      setCategoryId(defaultExpCat ? defaultExpCat.id : '');
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      setToAccountId(accounts.length > 1 ? accounts[1].id : '');
      setFee('0');
      setTags([]);
      setReceiptUrl(undefined);
    }
  }, [initialTransaction, isOpen, categories, accounts]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      const firstCat = categories.find(c => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    } else if (newType === 'income') {
      const firstCat = categories.find(c => c.type === 'income');
      if (firstCat) setCategoryId(firstCat.id);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('لطفاً مبلغ معتبری وارد کنید.');
      return;
    }
    if (!accountId) {
      alert('لطفاً حساب مورد نظر را انتخاب کنید.');
      return;
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      alert('لطفاً حساب مقصد متفاوتی را انتخاب کنید.');
      return;
    }

    const txData = {
      type,
      amount: numAmount,
      date,
      description: description.trim() || (type === 'transfer' ? 'انتقال بین حسابی' : 'بدون شرح'),
      categoryId: type === 'transfer' ? 'cat-other-exp' : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      fee: type === 'transfer' ? parseFloat(fee) || 0 : undefined,
      receiptUrl,
      tags,
    };

    if (initialTransaction) {
      updateTransaction({ ...txData, id: initialTransaction.id });
    } else {
      addTransaction(txData);
    }

    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));
  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {initialTransaction ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type Selector Pills */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>هزینه</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>درآمد</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                type === 'transfer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>انتقال وجه</span>
            </button>
          </div>

          {/* Amount input + Persian Word Conversion */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              مبلغ ({currency === 'toman' ? 'تومان' : 'ریال'})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثلاً: 250000"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="absolute left-3.5 top-3.5 text-xs text-slate-400">
                {currency === 'toman' ? 'تومان' : 'ریال'}
              </span>
            </div>
            {numAmount > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 px-1 leading-relaxed">
                معادل: {numberToWordsPersian(numAmount, currency)}
              </p>
            )}
          </div>

          {/* Category Selector (for Expense and Income) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                دسته‌بندی
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                      categoryId === cat.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white mb-1 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {getCategoryIcon(cat.icon, 'w-4 h-4')}
                    </div>
                    <span className="text-[11px] truncate w-full">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {type === 'transfer' ? 'از حساب (مبدأ)' : 'حساب / کارت بانکی'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bankName || 'کیف پول'})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  به حساب (مقصد)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                >
                  {accounts
                    .filter(a => a.id !== accountId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.bankName || 'کیف پول'})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  تاریخ شمسی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="1403/06/15"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setDate(getTodayJalali())}
                    className="absolute left-2 top-2 px-1.5 py-0.5 text-[10px] rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold"
                  >
                    امروز
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transfer Fee & Date (if transfer) */}
          {type === 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  کارمزد انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  تاریخ شمسی
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              شرح یا یادداشت تراکنش
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: خرید روغن و برنج از افق کوروش"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

          {/* Tags & Receipt Attachment */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold">
                <Tag className="w-3.5 h-3.5" /> برچسب‌ها (اختیاری)
              </span>
              <label className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline">
                <Image className="w-3.5 h-3.5" />
                <span>{receiptUrl ? 'تغییر تصویر فاکتور' : 'پیوست رسید / فاکتور'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="تایپ برچسب و زدن اینتر..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                افزودن
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {receiptUrl && (
              <div className="relative inline-block mt-2">
                <img src={receiptUrl} alt="رسید" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 text-xs shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialTransaction ? 'ذخیره تغییرات' : 'ثبت قطعی تراکنش'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
