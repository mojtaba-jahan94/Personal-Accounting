import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatCurrency,
  numberToPersianWords,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  toPersianDigits,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';
import {
  X,
  CreditCard,
  Check,
  ChevronDown,
  Delete,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFromAccountId?: string;
}

interface ReceiptData {
  fromName: string;
  fromBank?: string;
  toName: string;
  toBank?: string;
  amount: number;
  fee: number;
  date: string;
  refNumber: string;
}

const DESTINATION_ACCENT_COLORS = [
  '#DFC296', // Champagne Gold
  '#A390B8', // Muted Lilac
  '#C98A82', // Dusty Rose
  '#7A9A95', // Sage Teal
  '#6E7582', // Warm Slate
  '#D4AF37', // Classic Gold
];

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  initialFromAccountId,
}) => {
  const { accounts, currency, addTransaction } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(getTodayJalali());
  const [description, setDescription] = useState('');
  const [showFeeAndDate, setShowFeeAndDate] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Slide to confirm drag state
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0) {
        const startFrom =
          initialFromAccountId && accounts.some((a) => a.id === initialFromAccountId)
            ? initialFromAccountId
            : accounts[0].id;
        setFromAccountId(startFrom);
        const startTo = accounts.find((a) => a.id !== startFrom)?.id || accounts[0].id;
        setToAccountId(startTo);
      }
      setAmount('');
      setFee('0');
      setDate(getTodayJalali());
      setDescription('');
      setShowFeeAndDate(false);
      setReceiptData(null);
      setDragProgress(0);
      setIsDragging(false);
    }
  }, [isOpen, accounts, initialFromAccountId]);

  if (!isOpen) return null;

  const fromAcc = accounts.find((a) => a.id === fromAccountId);
  const toAcc = accounts.find((a) => a.id === toAccountId);

  const numAmount = parseAmount(amount);
  const numFee = parseAmount(fee);

  // Keypad Actions
  const handleKeypadPress = (val: string) => {
    if (val === '000') {
      if (!amount || amount === '0') return;
      const next = `${amount.replace(/,/g, '')}000`;
      setAmount(formatAmountInput(next));
    } else {
      const clean = amount.replace(/,/g, '');
      if (clean === '0') {
        setAmount(val);
      } else if (clean.length < 12) {
        setAmount(formatAmountInput(`${clean}${val}`));
      }
    }
  };

  const handleBackspace = () => {
    const clean = amount.replace(/,/g, '');
    if (clean.length <= 1) {
      setAmount('');
    } else {
      setAmount(formatAmountInput(clean.slice(0, -1)));
    }
  };

  const executeTransfer = () => {
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

    const savedAmount = currency === 'rial' ? Math.round(numAmount / 10) : numAmount;
    const savedFee = currency === 'rial' ? Math.round(numFee / 10) : numFee;

    if (fromAcc.balance < savedAmount + savedFee) {
      if (
        !window.confirm(
          'موجودی حساب مبدأ کمتر از این مبلغ و کارمزد است. آیا مایل به ادامه هستید؟'
        )
      ) {
        return;
      }
    }

    const refNum = `TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;

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

    // Show Luxury Receipt View
    setReceiptData({
      fromName: fromAcc.name,
      fromBank: fromAcc.bankName,
      toName: toAcc.name,
      toBank: toAcc.bankName,
      amount: savedAmount,
      fee: savedFee,
      date,
      refNumber: refNum,
    });
  };

  // Slide Drag Handlers (RTL aware: dragging leftward)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const trackWidth = trackRef.current.clientWidth - 56; // 44px thumb + 12px padding
    // In RTL, moving left means clientX < startX -> delta = startX - clientX
    const delta = dragStartX.current - clientX;
    const progress = Math.max(0, Math.min(1, delta / Math.max(1, trackWidth)));
    setDragProgress(progress);

    if (progress >= 0.88) {
      setIsDragging(false);
      setDragProgress(1);
      executeTransfer();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragProgress < 0.88) {
      setDragProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C]/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md max-h-[95dvh] flex flex-col rounded-t-[32px] sm:rounded-[32px] border border-white/[0.08] bg-[#121215] text-[#F4F0EA] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <div>
            <span className="text-[10px] tracking-[0.22em] text-[#8E8B82] uppercase font-mono block">
              ✦ AURUM TRANSFER
            </span>
            <h3 className="text-lg font-serif font-light text-[#F4F0EA]">
              {receiptData ? 'رسید تراکنش بانکی' : 'انتقال وجه بین‌حسابی'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#8E8B82] hover:text-[#F4F0EA] hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        {receiptData ? (
          /* ==============================================
             LUXURY RECEIPT VIEW (POST-SUBMIT STATE)
             ============================================== */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            {/* Circular Checkmark Badge */}
            <div className="w-14 h-14 rounded-full border border-[#DFC296]/40 bg-[#DFC296]/10 text-[#DFC296] flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(223,194,150,0.25)]">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <span className="text-[10px] tracking-[0.2em] text-[#8E8B82] uppercase font-mono mb-1">
              انتقال موفق به {receiptData.toName}
            </span>

            {/* Hero Amount */}
            <div className="text-3xl sm:text-4xl font-serif text-[#F4F0EA] tabular-nums font-light mt-1 mb-6">
              {formatCurrency(receiptData.amount, currency)}
            </div>

            {/* Metadata Table */}
            <div className="w-full rounded-2xl bg-[#1A191E] border border-white/[0.08] divide-y divide-white/[0.06] text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[11px]">از حساب / FROM</span>
                <span className="text-[#F4F0EA] font-medium">
                  {receiptData.fromName} {receiptData.fromBank ? `(${receiptData.fromBank})` : ''}
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[11px]">به حساب / TO</span>
                <span className="text-[#F4F0EA] font-medium">
                  {receiptData.toName} {receiptData.toBank ? `(${receiptData.toBank})` : ''}
                </span>
              </div>

              {receiptData.fee > 0 && (
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-[#8E8B82] font-mono text-[11px]">کارمزد / FEE</span>
                  <span className="text-[#F4F0EA] font-mono tabular-nums">
                    {formatCurrency(receiptData.fee, currency)}
                  </span>
                </div>
              )}

              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[11px]">زمان / TIME</span>
                <span className="text-[#F4F0EA] font-mono tabular-nums">{receiptData.date}</span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[11px]">کد پیگیری / REF</span>
                <span className="text-[#DFC296] font-mono tracking-wider tabular-nums font-medium">
                  {receiptData.refNumber}
                </span>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 rounded-full bg-[#DFC296] text-[#0A0A0C] font-semibold text-sm hover:bg-[#c9ab81] transition shadow-[0_0_20px_rgba(223,194,150,0.3)] active:scale-95"
            >
              تایید و بستن (DONE)
            </button>
          </div>
        ) : (
          /* ==============================================
             TRANSFER FORM (KEYPAD + SLIDE-TO-CONFIRM)
             ============================================== */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* 1. Horizontal Destination Account Avatar Strip */}
            <div>
              <div className="text-[10px] tracking-[0.2em] text-[#8E8B82] uppercase font-mono mb-2 flex items-center justify-between">
                <span>انتخاب حساب مقصد (TO ACCOUNT)</span>
                <span className="text-[#DFC296] text-[10px] font-mono">
                  {toAcc?.name || 'انتخاب کنید'}
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scrollbar-none pb-2 pt-1">
                {accounts
                  .filter((acc) => acc.id !== fromAccountId)
                  .map((acc, idx) => {
                    const isSelected = acc.id === toAccountId;
                    const accentColor =
                      DESTINATION_ACCENT_COLORS[idx % DESTINATION_ACCENT_COLORS.length];

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setToAccountId(acc.id)}
                        className={`flex flex-col items-center shrink-0 transition-all duration-300 ${
                          isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-2 border-[#DFC296] shadow-[0_0_15px_rgba(223,194,150,0.35)] bg-[#DFC296]/15 text-[#DFC296]'
                              : 'border border-white/10 bg-[#1A191E] text-[#8E8B82]'
                          }`}
                          style={{
                            borderColor: isSelected ? '#DFC296' : `${accentColor}30`,
                          }}
                        >
                          <CreditCard className="w-5 h-5" style={{ color: isSelected ? '#DFC296' : accentColor }} />
                        </div>
                        <span className="text-[11px] font-medium text-[#F4F0EA] mt-1 truncate max-w-[75px] text-center">
                          {acc.name}
                        </span>
                        <span className="text-[9px] text-[#8E8B82] font-mono">
                          {acc.bankName || 'کیف‌پول'}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 2. Sleek Source Account ("FROM / از حساب") Selector Pill */}
            <div className="bg-[#1A191E] border border-white/[0.08] rounded-2xl px-4 py-3 relative group hover:border-white/20 transition">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] tracking-widest text-[#8E8B82] uppercase font-mono block">
                    از مبدأ / FROM
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-medium text-[#F4F0EA]">
                      {fromAcc ? fromAcc.name : 'انتخاب حساب'}
                    </span>
                    {fromAcc?.bankName && (
                      <span className="text-[10px] text-[#8E8B82] font-mono">
                        ({fromAcc.bankName})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left flex items-center gap-2">
                  <div>
                    <span className="text-[9px] text-[#8E8B82] block font-mono">موجودی:</span>
                    <span className="text-xs font-mono tabular-nums text-[#DFC296]">
                      {fromAcc ? formatCurrency(fromAcc.balance, currency) : '۰'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#8E8B82]" />
                </div>
              </div>

              {/* Seamless Native Select overlay */}
              <select
                value={fromAccountId}
                onChange={(e) => {
                  setFromAccountId(e.target.value);
                  if (toAccountId === e.target.value) {
                    const fallbackTo = accounts.find((a) => a.id !== e.target.value)?.id || '';
                    setToAccountId(fallbackTo);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-[#121215] text-[#F4F0EA]">
                    {acc.name} ({acc.bankName || 'نقدی'}) • موجودی:{' '}
                    {formatCurrency(acc.balance, currency)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Editorial Hero Amount Display + Live Persian Words */}
            <div className="py-2 flex flex-col items-center justify-center text-center">
              <div className="flex items-baseline justify-center gap-2">
                <input
                  type="text"
                  inputMode="none"
                  value={amount}
                  onChange={(e) =>
                    setAmount(formatAmountInput(sanitizeAmountInput(e.target.value)))
                  }
                  placeholder="0"
                  className="bg-transparent text-center text-4xl sm:text-5xl font-serif font-light text-[#F4F0EA] tabular-nums tracking-tight outline-none w-full max-w-[280px]"
                />
                <span className="text-xs font-mono text-[#8E8B82]">
                  {currency === 'toman' ? 'تومان' : 'ریال'}
                </span>
              </div>

              {/* Live Persian Words Preview */}
              <div className="min-h-[22px] mt-1 flex items-center justify-center">
                {numAmount > 0 ? (
                  <span className="text-xs text-[#DFC296]/90 font-sans tracking-wide animate-in fade-in">
                    {numberToPersianWords(numAmount, currency)}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#8E8B82]/60 font-mono">
                    مبلغ انتقال را وارد کنید
                  </span>
                )}
              </div>
            </div>

            {/* Quick Fee & Date Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowFeeAndDate((p) => !p)}
                className="text-[11px] text-[#8E8B82] hover:text-[#DFC296] font-mono flex items-center gap-1 transition"
              >
                <span>{showFeeAndDate ? '– بستن جزئیات کارمزد و تاریخ' : '+ کارمزد و تاریخ انتقال'}</span>
              </button>
              {numFee > 0 && (
                <span className="text-[11px] font-mono text-[#8E8B82] tabular-nums">
                  کارمزد: {formatCurrency(numFee, currency)}
                </span>
              )}
            </div>

            {showFeeAndDate && (
              <div className="p-3.5 rounded-2xl bg-[#1A191E] border border-white/[0.08] space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8E8B82] font-mono block mb-1">
                      کارمزد ({currency === 'toman' ? 'تومان' : 'ریال'})
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={fee}
                      onChange={(e) =>
                        setFee(formatAmountInput(sanitizeAmountInput(e.target.value)))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#121215] border border-white/10 text-xs font-mono text-center text-[#F4F0EA] outline-none focus:border-[#DFC296]"
                    />
                  </div>
                  <div>
                    <JalaliDatePicker
                      value={date}
                      onChange={setDate}
                      label="تاریخ انتقال"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="شرح انتقال (اختیاری)..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#121215] border border-white/10 text-xs text-[#F4F0EA] outline-none focus:border-[#DFC296]"
                  />
                </div>
              </div>
            )}

            {/* 4. Borderless Luxury Numeric Keypad */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="h-12 sm:h-13 rounded-2xl text-xl font-mono text-[#F4F0EA] hover:bg-white/[0.04] active:scale-95 transition-all flex items-center justify-center select-none"
                >
                  {key}
                </button>
              ))}

              {/* Backspace Key */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 sm:h-13 rounded-2xl text-[#8E8B82] hover:text-[#C98A82] hover:bg-white/[0.04] active:scale-95 transition-all flex items-center justify-center select-none"
                title="حذف رقم"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* 5. Interactive "Slide to Send / Confirm" Track */}
            <div className="pt-2">
              <div
                ref={trackRef}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="h-14 rounded-full bg-[#1A191E] border border-white/[0.1] p-1.5 relative flex items-center select-none overflow-hidden cursor-pointer group"
                onClick={() => {
                  if (!isDragging && dragProgress < 0.1) {
                    executeTransfer();
                  }
                }}
              >
                {/* Shimmering Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
                  <span className="text-[11px] font-mono tracking-wider text-[#8E8B82] group-hover:text-[#F4F0EA] transition-colors truncate">
                    بکشید یا کلیک کنید • انتقال به {toAcc?.name || 'مقصد'}
                  </span>
                </div>

                {/* Draggable Champagne Gold Thumb */}
                <div
                  style={{
                    transform: `translateX(-${dragProgress * (trackRef.current ? trackRef.current.clientWidth - 56 : 240)}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                  }}
                  className="w-11 h-11 rounded-full bg-[#DFC296] text-[#0A0A0C] shadow-[0_0_20px_rgba(223,194,150,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 z-10"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
