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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { FileCheck2, CheckCircle2 } from 'lucide-react';

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <span>{initialCheque ? 'ویرایش چک صیادی' : 'ثبت چک صیادی جدید'}</span>
        </div>
      }
      subtitle="مدیریت چک‌های دریافتی، پرداختی و موعد سررسید"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 dark:bg-white/[0.04] rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setType('payable')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              type === 'payable'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-fintech-text-muted hover:text-white'
            }`}
          >
            <span>چک پرداختی (صادره من)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('receivable')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              type === 'receivable'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-fintech-text-muted hover:text-white'
            }`}
          >
            <span>چک دریافتی (از دیگران)</span>
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            مبلغ چک ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
            placeholder="0"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500 text-center"
          />
          {numAmount > 0 && (
            <div className="mt-1.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
              {numberToPersianWords(numAmount, currency)}
            </div>
          )}
        </div>

        {/* Due Date & Bank Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <JalaliDatePicker
              value={dueDate}
              onChange={setDueDate}
              label="تاریخ سررسید چک"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              بانک صادرکننده
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="سامان، ملت، پاسارگاد..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        {/* Party Name */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            طرف حساب (دریافت‌کننده یا صادرکننده) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="نام و نام خانوادگی طرف معامله"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Cheque Number & Sayad ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              سریال چک
            </label>
            <input
              type="text"
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              placeholder="مثلاً: 123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500 text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              شناسه ۱۶ رقمی صیاد (اختیاری)
            </label>
            <input
              type="text"
              maxLength={16}
              value={sayadNumber}
              onChange={(e) => setSayadNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890123456"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500 text-center"
            />
          </div>
        </div>

        {/* Account and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              حساب متصل
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none text-white focus:border-violet-500 transition"
            >
              <option value="" className="bg-[#18181b] text-white">-- بدون اتصال به حساب --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-[#18181b] text-white">
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              وضعیت چک
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ChequeStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none text-white focus:border-violet-500 transition"
            >
              <option value="pending" className="bg-[#18181b] text-white">در انتظار سررسید</option>
              <option value="passed" className="bg-[#18181b] text-white">پاس شده (وصول)</option>
              <option value="bounced" className="bg-[#18181b] text-white">برگشت خورده</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            یادداشت و بابت (اختیاری)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثلاً: بابت خرید ملک، پیش‌پرداخت..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {initialCheque ? 'ذخیره تغییرات' : 'ثبت چک صیادی'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default ChequeModal;
