import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, DebtType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { numberToWordsPersian } from '../../utils/formatters';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { X, Check, Users, UserPlus, Phone, Calendar, Tag } from 'lucide-react';

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
      const displayAmount = currency === 'rial' ? initialDebt.amount * 10 : initialDebt.amount;
      const displayPaid = currency === 'rial' ? initialDebt.paidAmount * 10 : initialDebt.paidAmount;
      setAmount(displayAmount.toString());
      setPaidAmount(displayPaid.toString());
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

  const numAmount = parseFloat(amount) || 0;

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

    const rawPaid = parseFloat(paidAmount) || 0;
    const savedAmount = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;
    const savedPaid = currency === 'rial' ? Math.round(rawPaid / 10) : rawPaid;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {initialDebt ? 'ویرایش بدهی / طلب' : 'ثبت بدهی، طلب یا وام جدید'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'credit'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                طلب من از دیگران
              </button>
              <button
                type="button"
                onClick={() => setType('debt')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'debt'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                بدهی من به دیگران / وام
              </button>
            </div>

            {/* Category / Nature of debt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  طرف‌حساب (شخص یا بانک/نهاد) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsPersonModalOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                  >
                    <option value="">-- انتخاب از میان مخاطبین ثبت‌شده --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره تماس (اختیاری جهت یادآوری و تماس)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="0912..."
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-left outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Amount and Paid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کل مبلغ ({currency === 'toman' ? 'تومان' : 'ریال'}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مبلغ تسویه‌شده تا الان ({currency === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {numAmount > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                معادل: {numberToWordsPersian(numAmount, currency)}
              </p>
            )}

            {/* Due Date & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاریخ موعد / سررسید
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات و بابت (اختیاری)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="مثلاً: قسط ماه ۱۲، قرض بدون بهره..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{initialDebt ? 'ذخیره تغییرات' : 'ثبت سند بدهی / طلب'}</span>
              </button>
            </div>
          </form>
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
