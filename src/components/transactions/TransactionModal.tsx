import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { numberToWordsPersian } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Tag,
  Image,
  Check,
  Settings2,
  Users,
  Link2,
  Plus,
} from 'lucide-react';

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
  const { categories, accounts, currency, debts, persons, addTransaction, updateTransaction } = useFinance();

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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  // Persons and Debt linkage
  const [personId, setPersonId] = useState<string>('');
  const [linkToDebt, setLinkToDebt] = useState<boolean>(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<'toman' | 'rial'>(currency);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      const isRial = currency === 'rial';
      setInputUnit(currency);
      setAmount(isRial ? (initialTransaction.amount * 10).toString() : initialTransaction.amount.toString());
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      const txFee = initialTransaction.fee || 0;
      setFee(txFee ? (isRial ? (txFee * 10).toString() : txFee.toString()) : '0');
      setTags(initialTransaction.tags || []);
      setReceiptUrl(initialTransaction.receiptUrl);
      setPersonId(initialTransaction.personId || '');
      setLinkToDebt(!!initialTransaction.debtId);
      setSelectedDebtId(initialTransaction.debtId || '');
    } else {
      setType('expense');
      setInputUnit(currency);
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
      setPersonId('');
      setLinkToDebt(false);
      setSelectedDebtId('');
    }
  }, [initialTransaction, isOpen, categories, accounts, currency]);

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

  const handleUnitToggle = (newUnit: 'toman' | 'rial') => {
    if (newUnit === inputUnit) return;
    setInputUnit(newUnit);
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      if (newUnit === 'rial') {
        setAmount(Math.round(val * 10).toString());
      } else {
        setAmount(Math.round(val / 10).toString());
      }
    }
    if (type === 'transfer') {
      const feeVal = parseFloat(fee);
      if (!isNaN(feeVal) && feeVal > 0) {
        if (newUnit === 'rial') {
          setFee(Math.round(feeVal * 10).toString());
        } else {
          setFee(Math.round(feeVal / 10).toString());
        }
      }
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

    const canonicalAmount = inputUnit === 'rial' ? Math.round(numAmount / 10) : numAmount;
    const rawFee = parseFloat(fee) || 0;
    const canonicalFee = (type === 'transfer' && inputUnit === 'rial') ? Math.round(rawFee / 10) : rawFee;

    const txData = {
      type,
      amount: canonicalAmount,
      date,
      description: description.trim() || (type === 'transfer' ? 'انتقال بین حسابی' : 'بدون شرح'),
      categoryId: type === 'transfer' ? 'cat-other-exp' : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      fee: type === 'transfer' ? canonicalFee : undefined,
      receiptUrl,
      tags,
      personId: personId || undefined,
      debtId: (type !== 'transfer' && linkToDebt && selectedDebtId) ? selectedDebtId : undefined,
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

        <div className="relative w-full max-w-lg liquid-glass-card p-5 sm:p-6 my-8 z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {initialTransaction ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/40 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector Pills */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md'
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
                    ? 'bg-emerald-600 text-white shadow-md'
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
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>انتقال وجه</span>
              </button>
            </div>

            {/* Amount input + Persian Word Conversion + Unit Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  مبلغ تراکنش
                </label>
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('toman')}
                    className={`px-2.5 py-0.5 rounded-lg transition ${
                      inputUnit === 'toman'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    تومان
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('rial')}
                    className={`px-2.5 py-0.5 rounded-lg transition ${
                      inputUnit === 'rial'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    ریال
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={inputUnit === 'toman' ? 'مثلاً: 250000 تومان' : 'مثلاً: 2500000 ریال'}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white outline-none font-mono"
                />
                <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-bold">
                  {inputUnit === 'toman' ? 'تومان' : 'ریال'}
                </span>
              </div>
              {numAmount > 0 && (
                <div className="mt-1.5 px-1 space-y-0.5">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                    به حروف: {numberToWordsPersian(numAmount, inputUnit)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inputUnit === 'rial'
                      ? `معادل ذخیره در سیستم: ${(Math.round(numAmount / 10)).toLocaleString('fa-IR')} تومان`
                      : `معادل ریالی: ${(Math.round(numAmount * 10)).toLocaleString('fa-IR')} ریال`}
                  </p>
                </div>
              )}
            </div>

            {/* Category Selector with Quick Manage button */}
            {type !== 'transfer' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    دسته‌بندی
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>ویرایش و مدیریت دسته‌ها</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200/50 dark:border-white/10 rounded-2xl">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        categoryId === cat.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'border-transparent hover:bg-white/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'transfer' ? 'از حساب (مبدأ)' : 'حساب / کارت بانکی'}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    به حساب (مقصد)
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ شمسی
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="1403/06/15"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDate(getTodayJalali())}
                      className="absolute left-2 top-2 px-2 py-0.5 text-[10px] rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold"
                    >
                      امروز
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شرح یا یادداشت تراکنش
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثلاً: خرید مایحتاج هفتگی سوپرمارکت"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>

            {/* Person / Contact selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  طرف‌حساب یا شخص مرتبط (اختیاری)
                </span>
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  افزودن مخاطب جدید
                </button>
              </div>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              >
                <option value="">-- بدون انتخاب شخص (عمومی) --</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.phoneNumber ? `(${p.phoneNumber})` : ''} {p.relation ? `• ${p.relation}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Link to Debt/Loan (for expense or income) */}
            {type !== 'transfer' && (
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkToDebt}
                    onChange={(e) => {
                      setLinkToDebt(e.target.checked);
                      if (!e.target.checked) setSelectedDebtId('');
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 rounded-md"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {type === 'expense'
                      ? 'اتصال این پرداخت به بدهی یا قسط وام (تسویه خودکار)'
                      : 'اتصال این دریافتی به طلب من از دیگری (وصول خودکار)'}
                  </span>
                </label>

                {linkToDebt && (
                  <div className="pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      انتخاب پرونده {type === 'expense' ? 'بدهی یا وام' : 'طلب'}:
                    </label>
                    <select
                      value={selectedDebtId}
                      onChange={(e) => {
                        const dId = e.target.value;
                        setSelectedDebtId(dId);
                        const d = debts.find(x => x.id === dId);
                        if (d) {
                          const rem = Math.max(0, d.amount - d.paidAmount);
                          if (!amount || amount === '0') {
                            setAmount(rem.toString());
                          }
                          if (!description) {
                            setDescription(
                              d.type === 'debt'
                                ? `پرداخت بدهی / قسط به ${d.personName}`
                                : `دریافت طلب از ${d.personName}`
                            );
                          }
                          if (d.personId) {
                            setPersonId(d.personId);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    >
                      <option value="">-- لطفاً پرونده مربوطه را انتخاب کنید --</option>
                      {debts
                        .filter(d => (type === 'expense' ? d.type === 'debt' : d.type === 'credit') && !d.isSettled)
                        .map(d => {
                          const rem = Math.max(0, d.amount - d.paidAmount);
                          const typeLabel =
                            d.category === 'loan'
                              ? 'وام بانکی'
                              : d.category === 'installment'
                              ? 'خرید قسطی'
                              : d.type === 'debt'
                              ? 'بدهی من'
                              : 'طلب من';
                          return (
                            <option key={d.id} value={d.id}>
                              {d.personName} ({typeLabel}) - مانده: {rem.toLocaleString('fa-IR')}
                            </option>
                          );
                        })}
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      با ثبت تراکنش، مانده پرونده کاهش یافته و در صورت تسویه کامل علامت‌گذاری می‌شود.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tags and Receipt */}
            <div className="space-y-2 pt-1 border-t border-slate-200/50 dark:border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-bold">
                  <Tag className="w-3.5 h-3.5" /> برچسب‌ها
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
                  placeholder="افزودن برچسب..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold"
                >
                  افزودن
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold"
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
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialTransaction ? 'ذخیره تغییرات' : 'ثبت قطعی تراکنش'}</span>
            </button>
          </form>
        </div>
      </div>

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />
    </>
  );
};
