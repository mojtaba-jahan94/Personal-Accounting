import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Cheque, ChequeType, ChequeStatus } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { numberToWordsPersian } from '../../utils/formatters';
import { X, Check, FileCheck2 } from 'lucide-react';

interface ChequeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCheque?: Cheque | null;
}

export const ChequeModal: React.FC<ChequeModalProps> = ({
  isOpen,
  onClose,
  initialCheque,
}) => {
  const { addCheque, updateCheque, currency } = useFinance();

  const [type, setType] = useState<ChequeType>('payable');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayJalali());
  const [bankName, setBankName] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [sayadNumber, setSayadNumber] = useState('');
  const [partyName, setPartyName] = useState('');
  const [status, setStatus] = useState<ChequeStatus>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCheque) {
      setType(initialCheque.type);
      setAmount(initialCheque.amount.toString());
      setDueDate(initialCheque.dueDate);
      setBankName(initialCheque.bankName);
      setChequeNumber(initialCheque.chequeNumber);
      setSayadNumber(initialCheque.sayadNumber || '');
      setPartyName(initialCheque.partyName);
      setStatus(initialCheque.status);
      setNotes(initialCheque.notes || '');
    } else {
      setType('payable');
      setAmount('');
      setDueDate(getTodayJalali());
      setBankName('');
      setChequeNumber('');
      setSayadNumber('');
      setPartyName('');
      setStatus('pending');
      setNotes('');
    }
  }, [initialCheque, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || numAmount <= 0) {
      alert('لطفاً مشخصات طرف حساب و مبلغ معتبر را وارد کنید.');
      return;
    }

    const chequeData = {
      type,
      amount: numAmount,
      dueDate,
      bankName: bankName.trim() || 'نامشخص',
      chequeNumber: chequeNumber.trim() || '0',
      sayadNumber: sayadNumber.trim() || undefined,
      partyName: partyName.trim(),
      status,
      notes: notes.trim() || undefined,
    };

    if (initialCheque) {
      updateCheque({ ...chequeData, id: initialCheque.id });
    } else {
      addCheque(chequeData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 my-8 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialCheque ? 'ویرایش چک صیادی' : 'ثبت چک صیادی جدید'}
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
              onClick={() => setType('payable')}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                type === 'payable'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              چک پرداختی (صادره من)
            </button>
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                type === 'receivable'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              چک دریافتی
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {type === 'payable' ? 'دریافت‌کننده (در وجه)' : 'صادرکننده چک'}
            </label>
            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="نام و نام خانوادگی شخص یا شرکت"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                مبلغ چک ({currency === 'toman' ? 'تومان' : 'ریال'})
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
                تاریخ سررسید چک
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="1403/08/15"
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
                بانک عامل
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="بانک ملت، صادرات..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                وضعیت فعلی چک
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChequeStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              >
                <option value="pending">در جریان (نزد صندوق / بانک)</option>
                <option value="passed">پاس شده (وصول شده)</option>
                <option value="bounced">برگشت خورده</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                شماره سریال چک
              </label>
              <input
                type="text"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="مثلاً 784102"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                شناسه ۱۶ رقمی صیاد
              </label>
              <input
                type="text"
                maxLength={16}
                value={sayadNumber}
                onChange={(e) => setSayadNumber(e.target.value)}
                placeholder="16 رقم صیادی..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none dir-ltr text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              یادداشت / بابت
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: بابت فاز اول قرارداد"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialCheque ? 'ذخیره تغییرات' : 'ثبت چک'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
