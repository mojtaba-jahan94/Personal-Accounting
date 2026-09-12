import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, DebtType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { numberToWordsPersian } from '../../utils/formatters';
import { X, Check, Users } from 'lucide-react';

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
  const { addDebt, updateDebt, currency } = useFinance();

  const [type, setType] = useState<DebtType>('credit');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [dueDate, setDueDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialDebt) {
      setType(initialDebt.type);
      setPersonName(initialDebt.personName);
      setPhoneNumber(initialDebt.phoneNumber || '');
      setAmount(initialDebt.amount.toString());
      setPaidAmount(initialDebt.paidAmount.toString());
      setDueDate(initialDebt.dueDate);
      setDescription(initialDebt.description || '');
    } else {
      setType('credit');
      setPersonName('');
      setPhoneNumber('');
      setAmount('');
      setPaidAmount('0');
      setDueDate(getTodayJalali());
      setDescription('');
    }
  }, [initialDebt, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || numAmount <= 0) {
      alert('لطفاً نام شخص و مبلغ معتبری وارد کنید.');
      return;
    }

    const numPaid = parseFloat(paidAmount) || 0;
    const debtData = {
      type,
      personName: personName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      amount: numAmount,
      paidAmount: numPaid,
      dueDate,
      description: description.trim() || undefined,
      isSettled: numPaid >= numAmount,
    };

    if (initialDebt) {
      updateDebt({ ...debtData, id: initialDebt.id });
    } else {
      addDebt(debtData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialDebt ? 'ویرایش بدهی / طلب' : 'ثبت بدهی یا طلب جدید'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              نام شخص یا نهاد طرف حساب
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="مثلاً: علی صادقی یا بانک مسکن"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                کل مبلغ ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                مبلغ تسویه شده
              </label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>
          </div>

          {numAmount > 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              معادل: {numberToWordsPersian(numAmount, currency)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                تاریخ موعد / سررسید
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="1403/07/01"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                شماره تماس (اختیاری)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              توضیحات و بابت
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: بابت فروش گوشی یا قسط ماهانه"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialDebt ? 'ذخیره تغییرات' : 'ثبت سند'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
