import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, DebtType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import { X, Check, Users, UserPlus, Phone, CheckCircle2 } from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDebt?: Debt | null;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  initialDebt,
}) => {
  const { addDebt, updateDebt, currency, persons } = useFinance();

  const [type, setType] = useState<DebtType>('credit');
  const [personId, setPersonId] = useState<string | undefined>(undefined);
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState<'personal' | 'loan' | 'installment' | 'other'>('personal');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [dueDate, setDueDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  useEffect(() => {
    if (initialDebt) {
      setType(initialDebt.type);
      setPersonId(initialDebt.personId);
      setPersonName(initialDebt.personName);
      setPhoneNumber(initialDebt.phoneNumber || '');
      setCategory(initialDebt.category || 'personal');
      const displayAmount = currency === 'rial' ? Math.round(initialDebt.amount * 10) : initialDebt.amount;
      const displayPaid = currency === 'rial' ? Math.round(initialDebt.paidAmount * 10) : initialDebt.paidAmount;
      setAmount(formatAmountInput(displayAmount.toString()));
      setPaidAmount(formatAmountInput(displayPaid.toString()));
      setDueDate(initialDebt.dueDate);
      setDescription(initialDebt.description || '');
    } else {
      setType('credit');
      setPersonId(undefined);
      setPersonName('');
      setPhoneNumber('');
      setCategory('personal');
      setAmount('');
      setPaidAmount('0');
      setDueDate(getTodayJalali());
      setDescription('');
    }
  }, [initialDebt, isOpen, currency]);

  if (!isOpen) return null;

  const numAmount = parseAmount(amount);

  const handleSelectPerson = (pid: string) => {
    if (pid === 'new') {
      setIsPersonModalOpen(true);
      return;
    }
    const found = persons.find(p => p.id === pid);
    if (found) {
      setPersonId(found.id);
      setPersonName(found.name);
      if (found.phoneNumber) setPhoneNumber(found.phoneNumber);
    } else {
      setPersonId(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || numAmount <= 0) {
      alert('لطفاً نام شخص و مبلغ معتبری وارد کنید.');
      return;
    }

    const rawPaid = parseAmount(paidAmount);
    const savedAmount = currency === 'rial' ? (numAmount / 10) : numAmount;
    const savedPaid = currency === 'rial' ? (rawPaid / 10) : rawPaid;

    const debtData = {
      type,
      personId,
      personName: personName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      category,
      amount: savedAmount,
      paidAmount: savedPaid,
      dueDate,
      description: description.trim() || undefined,
      isSettled: savedPaid >= savedAmount,
      payments: initialDebt?.payments || [],
    };

    if (initialDebt) {
      updateDebt({ ...debtData, id: initialDebt.id });
    } else {
      addDebt(debtData);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Mobile drag handle */}
          <div className="pt-2 sm:hidden flex justify-center">
            <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
          </div>

          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                  {initialDebt ? 'ویرایش بدهی / طلب' : 'ثبت بدهی، طلب یا وام جدید'}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                  مدیریت مطالبات، بدهکاری‌ها و تعهدات مالی
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <form id="debt-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#6B7280]/10 dark:bg-[#182028]/60 rounded-2xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  type === 'credit'
                    ? 'bg-[#2E7D5B] text-[#F7F7F2] shadow-sm'
                    : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                }`}
              >
                <span>طلب من از دیگران (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('debt')}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  type === 'debt'
                    ? 'bg-[#C0564B] text-[#F7F7F2] shadow-sm'
                    : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                }`}
              >
                <span>بدهی من به دیگران / وام (-)</span>
              </button>
            </div>

            {/* Category / Nature of debt */}
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                دسته‌بندی موضوع
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'personal', label: 'قرض شخصی' },
                  { id: 'loan', label: 'وام بانکی' },
                  { id: 'installment', label: 'خرید قسطی' },
                  { id: 'other', label: 'سایر' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                      category === cat.id
                        ? 'border-[#A68A64] bg-[#A68A64] text-[#F7F7F2]'
                        : 'border-[#6B7280]/20 bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#A68A64]/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Person Selector & Custom Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  طرف‌حساب (شخص، بانک یا نهاد) <span className="text-[#C0564B]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(true)}
                  className="text-[11px] font-bold text-[#A68A64] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>مدیریت مخاطبین</span>
                </button>
              </div>

              {persons.length > 0 && (
                <div className="mb-2">
                  <select
                    value={personId || ''}
                    onChange={e => handleSelectPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none text-[#1F2933] dark:text-[#F7F7F2]"
                  >
                    <option value="" className="dark:bg-[#1F2933]">-- انتخاب از میان مخاطبین ثبت‌شده --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id} className="dark:bg-[#1F2933]">
                        {p.name} {p.relation ? `(${p.relation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                type="text"
                required
                value={personName}
                onChange={e => {
                  setPersonName(e.target.value);
                  setPersonId(undefined);
                }}
                placeholder="نام شخص، دوست، بانک، کاسب..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                شماره تماس (اختیاری جهت یادآوری)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-3 text-[#6B7280]" />
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="0912..."
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono text-left outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
                />
              </div>
            </div>

            {/* Amount and Paid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  کل مبلغ ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={amount}
                  onChange={e => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  مبلغ تسویه‌شده ({currency === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paidAmount}
                  onChange={e => setPaidAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
                />
              </div>
            </div>

            {/* Live Words Preview */}
            {numAmount > 0 && (
              <div className="p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                {numberToPersianWords(numAmount, currency)}
              </div>
            )}

            {/* Due Date & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <JalaliDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  label="تاریخ موعد / سررسید"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  توضیحات و بابت (اختیاری)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="مثلاً: قسط ماه ۱۲، قرض بدون بهره..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
                />
              </div>
            </div>
          </form>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 font-bold text-xs transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              form="debt-form"
              className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialDebt ? 'ذخیره تغییرات' : 'ثبت سند بدهی / طلب'}</span>
            </button>
          </div>
        </div>
      </div>

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSelectPerson={person => {
          setPersonId(person.id);
          setPersonName(person.name);
          if (person.phoneNumber) setPhoneNumber(person.phoneNumber);
          setIsPersonModalOpen(false);
        }}
      />
    </>
  );
};
