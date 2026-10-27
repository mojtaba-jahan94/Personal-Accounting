import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Cheque, ChequeType, ChequeStatus } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import { X, FileCheck2, CheckCircle2 } from 'lucide-react';

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
  const { addCheque, updateCheque, currency, accounts } = useFinance();

  const [type, setType] = useState<ChequeType>('payable');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayJalali());
  const [bankName, setBankName] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [sayadNumber, setSayadNumber] = useState('');
  const [partyName, setPartyName] = useState('');
  const [status, setStatus] = useState<ChequeStatus>('pending');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCheque) {
      setType(initialCheque.type);
      const displayAmount = currency === 'rial' ? Math.round(initialCheque.amount * 10) : initialCheque.amount;
      setAmount(formatAmountInput(displayAmount.toString()));
      setDueDate(initialCheque.dueDate);
      setBankName(initialCheque.bankName);
      setChequeNumber(initialCheque.chequeNumber);
      setSayadNumber(initialCheque.sayadNumber || '');
      setPartyName(initialCheque.partyName);
      setStatus(initialCheque.status);
      setAccountId(initialCheque.accountId || (accounts[0]?.id || ''));
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
      setAccountId(accounts[0]?.id || '');
      setNotes('');
    }
  }, [initialCheque, isOpen, currency, accounts]);

  if (!isOpen) return null;

  const numAmount = parseAmount(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || numAmount <= 0) {
      alert('لطفاً مشخصات طرف حساب و مبلغ معتبر را وارد کنید.');
      return;
    }

    const isClearedStatus = status === 'passed' || status === 'cleared';
    if (isClearedStatus && !accountId) {
      alert('برای چک پاس‌شده / وصول‌شده، انتخاب حساب بانکی الزامی است.');
      return;
    }

    const savedAmount = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;

    const chequeData = {
      type,
      amount: savedAmount,
      dueDate,
      bankName: bankName.trim() || 'نامشخص',
      chequeNumber: chequeNumber.trim() || '0',
      sayadNumber: sayadNumber.trim() || undefined,
      partyName: partyName.trim(),
      status,
      accountId: accountId || undefined,
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
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {initialCheque ? 'ویرایش چک صیادی' : 'ثبت چک صیادی جدید'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                مدیریت چک‌های دریافتی، پرداختی و استعلام صیاد
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
        <form id="cheque-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#6B7280]/10 dark:bg-[#182028]/60 rounded-2xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
            <button
              type="button"
              onClick={() => setType('payable')}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                type === 'payable'
                  ? 'bg-[#C0564B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              <span>چک پرداختی (صادره من)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                type === 'receivable'
                  ? 'bg-[#2E7D5B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              <span>چک دریافتی (نزد من)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              {type === 'payable' ? 'دریافت‌کننده (در وجه)' : 'صادرکننده چک'} <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="نام و نام خانوادگی شخص یا شرکت"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                مبلغ چک ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center"
              />
            </div>

            <div>
              <JalaliDatePicker
                value={dueDate}
                onChange={setDueDate}
                label="تاریخ سررسید چک"
                required
              />
            </div>
          </div>

          {/* Live Words Preview */}
          {numAmount > 0 && (
            <div className="p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
              {numberToPersianWords(numAmount, currency)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                بانک عامل
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="بانک ملت، صادرات..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                وضعیت فعلی چک
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChequeStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
              >
                <option value="pending" className="dark:bg-[#1F2933]">در جریان (نزد صندوق / بانک)</option>
                <option value="passed" className="dark:bg-[#1F2933]">پاس شده (وصول شده)</option>
                <option value="bounced" className="dark:bg-[#1F2933]">برگشت خورده</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              حساب بانکی مرتبط (جهت تسویه خودکار پس از وصول){' '}
              {(status === 'passed' || status === 'cleared') && <span className="text-[#C0564B]">*</span>}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required={status === 'passed' || status === 'cleared'}
              className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
            >
              <option value="" className="dark:bg-[#1F2933]">
                {(status === 'passed' || status === 'cleared') ? 'انتخاب حساب بانکی الزامی است...' : 'انتخاب حساب (اختیاری)...'}
              </option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="dark:bg-[#1F2933]">
                  {acc.name} ({acc.bankName || 'حساب'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                شماره سریال چک
              </label>
              <input
                type="text"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="مثلاً 784102"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                شناسه ۱۶ رقمی صیاد
              </label>
              <input
                type="text"
                maxLength={16}
                value={sayadNumber}
                onChange={(e) => setSayadNumber(e.target.value)}
                placeholder="16 رقم صیادی..."
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] text-center transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
              یادداشت / بابت
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: بابت فاز اول قرارداد"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] transition"
            />
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
            form="cheque-form"
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialCheque ? 'ذخیره تغییرات' : 'ثبت چک'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
