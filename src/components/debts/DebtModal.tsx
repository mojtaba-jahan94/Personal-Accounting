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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { Users, UserPlus, Phone, CheckCircle2 } from 'lucide-react';

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
    const found = persons.find((p) => p.id === pid);
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
    const savedAmount = currency === 'rial' ? numAmount / 10 : numAmount;
    const savedPaid = currency === 'rial' ? rawPaid / 10 : rawPaid;

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
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span>{initialDebt ? 'ویرایش بدهی / طلب' : 'ثبت بدهی، طلب یا وام جدید'}</span>
          </div>
        }
        subtitle="مدیریت مطالبات، بدهکاری‌ها و تعهدات مالی"
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 dark:bg-white/[0.04] rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'credit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              <span>طلب من از دیگران (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('debt')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'debt'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              <span>بدهی من به دیگران / وام (-)</span>
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              دسته‌بندی موضوع
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'personal', label: 'قرض شخصی' },
                { id: 'loan', label: 'وام بانکی' },
                { id: 'installment', label: 'خرید اقساطی' },
                { id: 'other', label: 'سایر' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    category === cat.id
                      ? 'border-violet-500 bg-violet-600 text-white'
                      : 'border-white/10 bg-white/5 text-fintech-text-muted hover:border-violet-500/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Person Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-fintech-text-primary">
                طرف‌حساب (شخص، بانک یا نهاد) <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPersonModalOpen(true)}
                className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>مدیریت مخاطبین</span>
              </button>
            </div>

            {persons.length > 0 && (
              <div className="mb-2">
                <select
                  value={personId || ''}
                  onChange={(e) => handleSelectPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold outline-none text-white focus:border-violet-500 transition"
                >
                  <option value="" className="bg-[#18181b] text-white">-- انتخاب از میان مخاطبین ثبت‌شده --</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#18181b] text-white">
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
              onChange={(e) => {
                setPersonName(e.target.value);
                setPersonId(undefined);
              }}
              placeholder="نام شخص، دوست، بانک، کاسب..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
              شماره تماس (اختیاری جهت یادآوری)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3.5 top-3 text-fintech-text-muted" />
              <input
                type="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912..."
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono text-left outline-none focus:border-violet-500 text-white transition"
              />
            </div>
          </div>

          {/* Amount and Paid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
                کل مبلغ ({currency === 'toman' ? 'تومان' : 'ریال'}) <span className="text-rose-400">*</span>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
                مبلغ تسویه‌شده ({currency === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={paidAmount}
                onChange={(e) => setPaidAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500 text-center"
              />
            </div>
          </div>

          {/* Live Words Preview */}
          {numAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
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
              <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
                توضیحات و بابت (اختیاری)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثلاً: قسط ماه ۱۲، قرض بدون بهره..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth={true}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {initialDebt ? 'ذخیره تغییرات' : 'ثبت سند بدهی / طلب'}
            </Button>
          </div>
        </form>
      </ModalShell>

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSelectPerson={(person) => {
          setPersonId(person.id);
          setPersonName(person.name);
          if (person.phoneNumber) setPhoneNumber(person.phoneNumber);
          setIsPersonModalOpen(false);
        }}
      />
    </>
  );
};

export default DebtModal;
