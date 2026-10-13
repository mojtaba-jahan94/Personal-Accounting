import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatCurrency,
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import {
  X,
  ArrowLeftRight,
  CreditCard,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, currency, addTransaction } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0) {
        setFromAccountId(accounts[0].id);
        setToAccountId(accounts.length > 1 ? accounts[1].id : accounts[0].id);
      }
      setAmount('');
      setFee('0');
      setDate(getTodayJalali());
      setDescription('');
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const fromAcc = accounts.find(a => a.id === fromAccountId);
  const toAcc = accounts.find(a => a.id === toAccountId);

  const numAmount = parseAmount(amount);
  const numFee = parseAmount(fee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('لطفاً مبلغ معتبری برای انتقال وارد کنید.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('حساب مبدأ و مقصد نمی‌توانند یکسان باشند.');
      return;
    }
    if (!fromAcc || !toAcc) {
      alert('حساب مبدأ یا مقصد نامعتبر است.');
      return;
    }

    const savedAmount = currency === 'rial' ? (numAmount / 10) : numAmount;
    const savedFee = currency === 'rial' ? (numFee / 10) : numFee;

    if (fromAcc.balance < savedAmount + savedFee) {
      if (!window.confirm('موجودی حساب مبدأ کمتر از این مبلغ و کارمزد است. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }

    addTransaction({
      type: 'transfer',
      amount: savedAmount,
      date,
      description: description.trim() || `انتقال از ${fromAcc.name} به ${toAcc.name}`,
      categoryId: 'cat-other-exp',
      accountId: fromAcc.id,
      toAccountId: toAcc.id,
      fee: savedFee,
    });

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
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                انتقال وجه بین حساب‌ها
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                انتقال موجودی بین کارت‌ها، حساب‌های بانکی و کیف پول
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
        <form id="transfer-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* 1. Source Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1.5">
              حساب مبدأ (کسر موجودی)
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64] transition text-[#1F2933] dark:text-[#F7F7F2]"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="dark:bg-[#1F2933]">
                  {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                  {formatCurrency(acc.balance, currency)}
                </option>
              ))}
            </select>

            {fromAcc && (
              <div className="mt-2 p-3 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#4A6FA5]/15 text-[#4A6FA5]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1F2933] dark:text-[#F7F7F2] block">
                      {fromAcc.name}
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
                      {fromAcc.bankName ? `بانک ${fromAcc.bankName}` : 'حساب نقدی'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">موجودی فعلی:</span>
                  <span className="text-xs font-black font-mono text-[#1F2933] dark:text-[#F7F7F2]">
                    {formatCurrency(fromAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direction Arrow */}
          <div className="flex items-center justify-center my-0.5">
            <div className="p-1.5 rounded-full bg-[#A68A64]/10 dark:bg-[#A68A64]/20 text-[#A68A64] border border-[#A68A64]/30 shadow-xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* 2. Destination Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1.5">
              حساب مقصد (افزایش موجودی)
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64] transition text-[#1F2933] dark:text-[#F7F7F2]"
            >
              {accounts
                .filter(a => a.id !== fromAccountId)
                .map(acc => (
                  <option key={acc.id} value={acc.id} className="dark:bg-[#1F2933]">
                    {acc.name} {acc.bankName ? `(${acc.bankName})` : ''} • موجودی:{' '}
                    {formatCurrency(acc.balance, currency)}
                  </option>
                ))}
            </select>

            {toAcc && (
              <div className="mt-2 p-3 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1F2933] dark:text-[#F7F7F2] block">
                      {toAcc.name}
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
                      {toAcc.bankName ? `بانک ${toAcc.bankName}` : 'حساب نقدی'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">موجودی فعلی:</span>
                  <span className="text-xs font-black font-mono text-[#1F2933] dark:text-[#F7F7F2]">
                    {formatCurrency(toAcc.balance, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Amount and Fee Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                مبلغ انتقال ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-[#C0564B]">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={e => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-black font-mono outline-none focus:border-[#A68A64] transition text-[#1F2933] dark:text-[#F7F7F2] text-center"
              />
              {numAmount > 0 && (
                <div className="mt-1.5 p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                  {numberToPersianWords(numAmount, currency)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                کارمزد انتقال ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={fee}
                onChange={e => setFee(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-bold font-mono outline-none focus:border-[#A68A64] transition text-[#1F2933] dark:text-[#F7F7F2] text-center"
              />
            </div>
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <JalaliDatePicker
                value={date}
                onChange={setDate}
                label="تاریخ انتقال"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                توضیحات (اختیاری)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="مثلاً: انتقال به کارت خرید، واریز پس‌انداز..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] transition text-[#1F2933] dark:text-[#F7F7F2]"
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
            form="transfer-form"
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ثبت انتقال وجه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
