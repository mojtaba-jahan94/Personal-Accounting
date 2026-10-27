import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  formatCurrency,
} from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
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
  Wallet,
  AlertTriangle,
  Receipt,
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
  const { categories, accounts, currency, debts, persons, addTransaction, updateTransaction } =
    useFinance();

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
      const rawAmt = isRial ? Math.round(initialTransaction.amount * 10) : initialTransaction.amount;
      setAmount(formatAmountInput(rawAmt.toString()));
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description);
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      const txFee = initialTransaction.fee || 0;
      setFee(txFee ? formatAmountInput((isRial ? Math.round(txFee * 10) : txFee).toString()) : '0');
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
      const defaultExpCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultExpCat ? defaultExpCat.id : '');
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
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
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    } else if (newType === 'income') {
      const firstCat = categories.find((c) => c.type === 'income');
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
    setTags(tags.filter((t) => t !== tagToRemove));
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
    const val = parseAmount(amount);
    if (val > 0) {
      if (newUnit === 'rial') {
        setAmount(formatAmountInput(Math.round(val * 10).toString()));
      } else {
        setAmount(formatAmountInput((val / 10).toString()));
      }
    }
    if (type === 'transfer') {
      const feeVal = parseAmount(fee);
      if (feeVal > 0) {
        if (newUnit === 'rial') {
          setFee(formatAmountInput(Math.round(feeVal * 10).toString()));
        } else {
          setFee(formatAmountInput((feeVal / 10).toString()));
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseAmount(amount);
    if (numAmount <= 0) {
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
    const rawFee = parseAmount(fee);
    const canonicalFee = type === 'transfer' && inputUnit === 'rial' ? Math.round(rawFee / 10) : rawFee;

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
      debtId: type !== 'transfer' && linkToDebt && selectedDebtId ? selectedDebtId : undefined,
    };

    if (initialTransaction) {
      updateTransaction({ ...txData, id: initialTransaction.id });
    } else {
      addTransaction(txData);
    }

    onClose();
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (type === 'income' ? 'income' : 'expense')
  );
  const numAmount = parseAmount(amount);

  const selectedAcc = accounts.find((a) => a.id === accountId);
  const selectedToAcc = accounts.find((a) => a.id === toAccountId);

  const numCanonical = inputUnit === 'rial' ? numAmount / 10 : numAmount;
  const rawFee = parseAmount(fee);
  const feeCanonical = type === 'transfer' && inputUnit === 'rial' ? rawFee / 10 : rawFee;

  let baseFromBal = selectedAcc ? selectedAcc.balance : 0;
  let baseToBal = selectedToAcc ? selectedToAcc.balance : 0;

  if (initialTransaction && selectedAcc) {
    if (initialTransaction.accountId === selectedAcc.id) {
      if (initialTransaction.type === 'expense') {
        baseFromBal += initialTransaction.amount + (initialTransaction.fee || 0);
      } else if (initialTransaction.type === 'income') {
        baseFromBal -= initialTransaction.amount;
      } else if (initialTransaction.type === 'transfer') {
        baseFromBal += initialTransaction.amount + (initialTransaction.fee || 0);
      }
    } else if (
      initialTransaction.type === 'transfer' &&
      initialTransaction.toAccountId === selectedAcc.id
    ) {
      baseFromBal -= initialTransaction.amount;
    }
  }

  if (initialTransaction && selectedToAcc) {
    if (initialTransaction.accountId === selectedToAcc.id) {
      if (initialTransaction.type === 'expense') {
        baseToBal += initialTransaction.amount + (initialTransaction.fee || 0);
      } else if (initialTransaction.type === 'income') {
        baseToBal -= initialTransaction.amount;
      } else if (initialTransaction.type === 'transfer') {
        baseToBal += initialTransaction.amount + (initialTransaction.fee || 0);
      }
    } else if (
      initialTransaction.type === 'transfer' &&
      initialTransaction.toAccountId === selectedToAcc.id
    ) {
      baseToBal -= initialTransaction.amount;
    }
  }

  const postFromBal =
    type === 'expense'
      ? baseFromBal - numCanonical
      : type === 'income'
      ? baseFromBal + numCanonical
      : baseFromBal - (numCanonical + feeCanonical);

  const postToBal = baseToBal + numCanonical;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Mobile drag handle */}
          <div className="pt-2 sm:hidden flex justify-center">
            <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
          </div>

          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                  {initialTransaction ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                  ثبت دقیق دخل و خرج با اتصال به حساب و تسویه تعهدات
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#6B7280]/15 text-[#6B7280] dark:text-[#D1D5DB] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
              {/* Type Selector Pills */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#6B7280]/15 dark:bg-[#D1D5DB]/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    type === 'expense'
                      ? 'bg-[#C0564B] text-white shadow-sm'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>برداشت / هزینه</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    type === 'income'
                      ? 'bg-[#2E7D5B] text-white shadow-sm'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>واریز / درآمد</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('transfer')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    type === 'transfer'
                      ? 'bg-[#4A6FA5] text-white shadow-sm'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>انتقال وجه</span>
                </button>
              </div>

              {/* Amount input + Persian Word Conversion + Unit Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                    مبلغ تراکنش
                  </label>
                  <div className="flex items-center gap-1 bg-[#6B7280]/15 dark:bg-[#D1D5DB]/10 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('toman')}
                      className={`px-2.5 py-0.5 rounded-lg transition ${
                        inputUnit === 'toman'
                          ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                          : 'text-[#6B7280] dark:text-[#D1D5DB]'
                      }`}
                    >
                      تومان
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('rial')}
                      className={`px-2.5 py-0.5 rounded-lg transition ${
                        inputUnit === 'rial'
                          ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                          : 'text-[#6B7280] dark:text-[#D1D5DB]'
                      }`}
                    >
                      ریال
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={amount}
                    onChange={(e) =>
                      setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))
                    }
                    placeholder={inputUnit === 'toman' ? 'مثلاً: 250,000' : 'مثلاً: 2,500,000'}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-lg font-black text-[#1F2933] dark:text-[#F7F7F2] outline-none font-mono tabular-nums dir-ltr text-right focus:border-[#A68A64] transition"
                  />
                  <span className="absolute left-3.5 top-3.5 text-xs text-[#6B7280] font-bold">
                    {inputUnit === 'toman' ? 'تومان' : 'ریال'}
                  </span>
                </div>

                {numAmount > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#A68A64]/10 border border-[#A68A64]/20 space-y-1">
                    <p className="text-xs text-[#A68A64] font-bold leading-relaxed">
                      به حروف:{' '}
                      <span className="font-extrabold">
                        {numberToPersianWords(numAmount, inputUnit)}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 font-mono tabular-nums">
                      {inputUnit === 'rial'
                        ? `معادل تومانی در حساب‌ها: ${(numAmount / 10).toLocaleString('fa-IR', {
                            maximumFractionDigits: 1,
                          })} تومان`
                        : `معادل ریالی: ${(Math.round(numAmount * 10)).toLocaleString('fa-IR')} ریال`}
                    </p>
                  </div>
                )}
              </div>

              {/* Transfer Fee input if transfer */}
              {type === 'transfer' && (
                <div>
                  <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
                    کارمزد انتقال (اختیاری)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={fee}
                      onChange={(e) =>
                        setFee(formatAmountInput(sanitizeAmountInput(e.target.value)))
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-mono tabular-nums dir-ltr text-right outline-none focus:border-[#A68A64] transition"
                    />
                    <span className="absolute left-3.5 top-2.5 text-xs text-[#6B7280] font-bold">
                      {inputUnit === 'toman' ? 'تومان' : 'ریال'}
                    </span>
                  </div>
                </div>
              )}

              {/* Category Selector with Quick Manage button */}
              {type !== 'transfer' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                      دسته‌بندی
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-[#A68A64] font-bold hover:underline flex items-center gap-1"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>مدیریت دسته‌ها</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 rounded-2xl">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                          categoryId === cat.id
                            ? 'border-[#A68A64] bg-[#A68A64]/15 text-[#A68A64] font-bold shadow-xs'
                            : 'border-transparent hover:bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
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
                  <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
                    {type === 'transfer' ? 'از حساب (مبدأ)' : 'حساب / کارت بانکی'}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.bankName || 'کیف پول'}) • موجودی:{' '}
                        {formatCurrency(acc.balance, currency)}
                      </option>
                    ))}
                  </select>
                </div>

                {type === 'transfer' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
                      به حساب (مقصد)
                    </label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                    >
                      {accounts
                        .filter((a) => a.id !== accountId)
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.bankName || 'کیف پول'}) • موجودی:{' '}
                            {formatCurrency(acc.balance, currency)}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <JalaliDatePicker
                    value={date}
                    onChange={setDate}
                    label="تاریخ تراکنش"
                    required
                  />
                )}
              </div>

              {type === 'transfer' && (
                <JalaliDatePicker
                  value={date}
                  onChange={setDate}
                  label="تاریخ انتقال وجه"
                  required
                />
              )}

              {/* Live Balance Change Preview */}
              {selectedAcc && numCanonical > 0 && (
                <div className="p-3 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1F2933] dark:text-[#D1D5DB] flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-[#A68A64]" />
                      <span>تغییر موجودی {type === 'transfer' ? 'حساب مبدأ' : 'حساب'}:</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums">
                      <span className="text-[#6B7280] line-through text-[11px]">
                        {formatCurrency(baseFromBal, currency)}
                      </span>
                      <span className="text-[#6B7280] font-sans">⭢</span>
                      <span
                        className={`font-bold ${
                          postFromBal < 0
                            ? 'text-[#C0564B] dark:text-[#F87171]'
                            : 'text-[#2E7D5B] dark:text-[#4ADE80]'
                        }`}
                      >
                        {formatCurrency(postFromBal, currency)}
                      </span>
                    </div>
                  </div>

                  {type === 'transfer' && selectedToAcc && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#A68A64]/15">
                      <span className="font-semibold text-[#1F2933] dark:text-[#D1D5DB]">
                        تغییر موجودی حساب مقصد:
                      </span>
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <span className="text-[#6B7280] line-through text-[11px]">
                          {formatCurrency(baseToBal, currency)}
                        </span>
                        <span className="text-[#6B7280] font-sans">⭢</span>
                        <span className="font-bold text-[#2E7D5B] dark:text-[#4ADE80]">
                          {formatCurrency(postToBal, currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {postFromBal < 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#C0564B] dark:text-[#F87171] pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>توجه: پس از ثبت این تراکنش، موجودی حساب منفی خواهد شد.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1">
                  شرح یا یادداشت تراکنش
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثلاً: خرید اقلام مصرفی ماهانه"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
                />
              </div>

              {/* Person / Contact selector */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#A68A64]" />
                    طرف‌حساب یا شخص مرتبط (اختیاری)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPersonModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-[#A68A64] font-bold hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    افزودن مخاطب جدید
                  </button>
                </div>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                >
                  <option value="">-- بدون انتخاب شخص (عمومی) --</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phoneNumber ? `(${p.phoneNumber})` : ''}{' '}
                      {p.relation ? `• ${p.relation}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to Debt/Loan (for expense or income) */}
              {type !== 'transfer' && (
                <div className="p-3 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/20 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={linkToDebt}
                      onChange={(e) => {
                        setLinkToDebt(e.target.checked);
                        if (!e.target.checked) setSelectedDebtId('');
                      }}
                      className="w-4 h-4 rounded text-[#A68A64] focus:ring-[#A68A64] accent-[#A68A64]"
                    />
                    <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#A68A64]" />
                      {type === 'expense'
                        ? 'اتصال این پرداخت به بدهی یا قسط وام (تسویه خودکار)'
                        : 'اتصال این دریافتی به طلب من از دیگری (وصول خودکار)'}
                    </span>
                  </label>

                  {linkToDebt && (
                    <div className="pt-2 border-t border-[#A68A64]/15 space-y-1.5">
                      <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB]">
                        انتخاب پرونده {type === 'expense' ? 'بدهی یا وام' : 'طلب'}:
                      </label>
                      <select
                        value={selectedDebtId}
                        onChange={(e) => {
                          const dId = e.target.value;
                          setSelectedDebtId(dId);
                          const d = debts.find((x) => x.id === dId);
                          if (d) {
                            const rem = Math.max(0, d.amount - d.paidAmount);
                            if (!amount || amount === '0') {
                              setAmount(formatAmountInput(rem.toString()));
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
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                      >
                        <option value="">-- لطفاً پرونده مربوطه را انتخاب کنید --</option>
                        {debts
                          .filter(
                            (d) =>
                              (type === 'expense' ? d.type === 'debt' : d.type === 'credit') &&
                              !d.isSettled
                          )
                          .map((d) => {
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
                                {d.personName} ({typeLabel}) - مانده:{' '}
                                {rem.toLocaleString('fa-IR')}
                              </option>
                            );
                          })}
                      </select>
                      <p className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70">
                        با ثبت تراکنش، مانده پرونده کاهش یافته و در صورت تسویه کامل علامت‌گذاری می‌شود.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags and Receipt */}
              <div className="space-y-2 pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1 font-bold">
                    <Tag className="w-3.5 h-3.5 text-[#A68A64]" /> برچسب‌ها
                  </span>
                  <label className="flex items-center gap-1 text-[#A68A64] font-bold cursor-pointer hover:underline">
                    <Image className="w-3.5 h-3.5" />
                    <span>{receiptUrl ? 'تغییر تصویر فاکتور' : 'پیوست رسید / فاکتور'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
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
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs text-[#1F2933] dark:text-[#F7F7F2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-[#6B7280]/15 hover:bg-[#6B7280]/25 rounded-xl text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] transition"
                  >
                    افزودن
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#A68A64]/15 text-[#A68A64] text-[11px] font-bold"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-[#C0564B]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 transition font-bold text-xs"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{initialTransaction ? 'ذخیره تغییرات' : 'ثبت قطعی تراکنش'}</span>
              </button>
            </div>
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
