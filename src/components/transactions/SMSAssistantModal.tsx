import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquareText,
  Clipboard,
  CheckCircle2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { parseBankSMS } from '../../utils/smsParser';
import { ParsedBankSMS } from '../../types';
import { formatCurrency, toPersianDigits, numberToPersianWords } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';

interface SMSAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

const SAMPLE_SMS = [
  {
    title: 'بانک ملت (برداشت)',
    text: `بانک ملت\nبرداشت: 650,000 ریال\nاز حساب: 1234\nمانده: 14,250,000 ریال\n1403/06/22-18:30`,
  },
  {
    title: 'بلوبانک (خرید)',
    text: `خرید\nمبلغ: ۱,۸۵۰,۰۰۰ ریال\nاز: بلوکارت *5678\nمانده: ۱۲,۳۰۰,۰۰۰ ریال\n۲۲/۰۶/۱۴۰۳ ۱۶:۴۵`,
  },
  {
    title: 'بانک ملی (واریز)',
    text: `بانک ملی ایران\nواریز به کارت: 603799***9999\nمبلغ: 15,000,000 ریال\nمانده: 28,500,000 ریال\n1403/06/21 10:15`,
  },
];

export const SMSAssistantModal: React.FC<SMSAssistantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { accounts, categories, currency, addTransaction, addTransactionAndReconcile } = useFinance();

  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedBankSMS | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [forceCurrencyUnit, setForceCurrencyUnit] = useState<'auto' | 'rial' | 'toman'>('auto');
  const [syncBalanceWithBank, setSyncBalanceWithBank] = useState<boolean>(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  const lastParsedRawTextRef = useRef<string>('');

  useEffect(() => {
    if (!rawText.trim()) {
      setParsed(null);
      lastParsedRawTextRef.current = '';
      return;
    }
    const result = parseBankSMS(rawText, forceCurrencyUnit);
    setParsed(result);

    const isNewRawText = rawText !== lastParsedRawTextRef.current;

    if (result && isNewRawText) {
      lastParsedRawTextRef.current = rawText;
      setDescription(result.description);

      // Match in stages:
      // 1) exact match on the card's last 4 digits
      let matchedAcc = result.cardLast4
        ? accounts.find(a => a.cardNumber?.endsWith(result.cardLast4!))
        : undefined;

      // 2) bank name match (use ^بانک\s* anchored)
      if (!matchedAcc) {
        const cleanBankName = result.bankName.replace(/^بانک\s*/, '').trim();
        if (cleanBankName) {
          matchedAcc = accounts.find(
            a =>
              (a.bankName && a.bankName.replace(/^بانک\s*/, '').includes(cleanBankName)) ||
              a.name.replace(/^بانک\s*/, '').includes(cleanBankName)
          );
        }
      }

      // 3) default account
      if (!matchedAcc && accounts.length > 0) {
        matchedAcc = accounts.find(a => a.isDefault) || accounts[0];
      }

      if (matchedAcc) {
        setSelectedAccountId(matchedAcc.id);
      }

      // Auto match category by type
      const suitableCategories = categories.filter(
        c => c.type === (result.type === 'income' ? 'income' : 'expense')
      );
      if (suitableCategories.length > 0) {
        setSelectedCategoryId(suitableCategories[0].id);
      }
    }
  }, [rawText, forceCurrencyUnit, accounts, categories]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    if (!parsed) return;
    setParsed({ ...parsed, type: newType, isUncertainType: false });

    // Auto match category by new type
    const suitableCategories = categories.filter(c => c.type === newType);
    if (suitableCategories.length > 0) {
      setSelectedCategoryId(suitableCategories[0].id);
    }
  };

  const handleModalClose = () => {
    setRawText('');
    setParsed(null);
    setSelectedAccountId('');
    setSelectedCategoryId('');
    setDescription('');
    lastParsedRawTextRef.current = '';
    setSyncBalanceWithBank(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleReadClipboard = async () => {
    setClipboardError(null);
    try {
      if (!navigator.clipboard?.readText) {
        setClipboardError('مرورگر شما دسترسی به خواندن کلیپ‌بورد را مجاز نمی‌داند. متن را پیست کنید.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
      } else {
        setClipboardError('کلیپ‌بورد شما خالی است. ابتدا پیامک را کپی کنید.');
      }
    } catch {
      setClipboardError('مجوز دسترسی به کلیپ‌بورد داده نشد. لطفاً متن را دستی پیست کنید.');
    }
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || parsed.amountToman <= 0) return;

    const accId = selectedAccountId || (accounts[0] ? accounts[0].id : '');
    const catId = selectedCategoryId || (categories[0] ? categories[0].id : '');

    const todayJalali = getTodayJalali();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const txData = {
      type: parsed.type,
      amount: parsed.amountToman,
      date: parsed.date || todayJalali,
      time: parsed.time || nowTime,
      description: description.trim() || parsed.description,
      categoryId: catId,
      accountId: accId,
      fee: parsed.feeToman,
    };

    if (syncBalanceWithBank && parsed.balanceToman !== undefined) {
      addTransactionAndReconcile(txData, parsed.balanceToman);
    } else {
      addTransaction(txData);
    }

    if (onSuccess) {
      onSuccess(`تراکنش ${formatCurrency(parsed.amountToman, currency)} با موفقیت ثبت شد.`);
    }

    handleModalClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle indicator */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-2">
                <span>دستیار هوشمند پیامک بانکی</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A68A64]/15 text-[#A68A64] border border-[#A68A64]/30">
                  Nordic AI
                </span>
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                تشخیص خودکار مبلغ، نام بانک، شماره کارت و تسویه مانده
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Action Button & Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                متن پیامک بانک را وارد یا الصاق کنید:
              </label>

              <button
                type="button"
                onClick={handleReadClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A68A64]/15 hover:bg-[#A68A64]/25 text-[#A68A64] text-xs font-bold transition border border-[#A68A64]/30"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>خواندن از کلیپ‌بورد</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="متن پیامک واریز یا برداشت بانک (مثلاً: بانک ملت، برداشت ۵۰۰،۰۰۰ ریال از کارت ۱۲۳۴...)"
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 focus:outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2] leading-relaxed resize-none transition"
            />

            {clipboardError && (
              <div className="text-[11px] text-[#C0564B] flex items-center gap-1.5 bg-[#C0564B]/10 p-2.5 rounded-xl border border-[#C0564B]/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{clipboardError}</span>
              </div>
            )}

            {/* Sample Buttons for quick testing */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-[#6B7280] font-bold">تست سریع:</span>
              {SAMPLE_SMS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(sample.text)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#A68A64]/15 hover:text-[#A68A64] transition"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            {/* Currency Unit Selection Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/40 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs">
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB]">
                واحد پول پیامک:
              </span>
              <div className="flex items-center gap-1 bg-[#6B7280]/10 dark:bg-[#1F2933] p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setForceCurrencyUnit('auto')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    forceCurrencyUnit === 'auto'
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  تشخیص خودکار
                </button>
                <button
                  type="button"
                  onClick={() => setForceCurrencyUnit('rial')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    forceCurrencyUnit === 'rial'
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  ریال (تبدیل به تومان ÷۱۰)
                </button>
                <button
                  type="button"
                  onClick={() => setForceCurrencyUnit('toman')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    forceCurrencyUnit === 'toman'
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  تومان (بدون تبدیل)
                </button>
              </div>
            </div>
          </div>

          {/* Parsed Result Preview */}
          {parsed ? (
            <div className="space-y-4 pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#182028]/80 border border-[#A68A64]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#A68A64]" />
                    <span>اطلاعات استخراج‌شده از پیامک:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#6B7280]/10 dark:bg-[#1F2933] p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                        parsed.type === 'income'
                          ? 'bg-[#2E7D5B] text-white shadow-xs font-bold'
                          : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                      }`}
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>واریز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                        parsed.type === 'expense'
                          ? 'bg-[#C0564B] text-white shadow-xs font-bold'
                          : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                      }`}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>برداشت / خرید</span>
                    </button>
                  </div>
                </div>

                {parsed.isUncertainType && (
                  <div className="text-[11px] text-[#A68A64] bg-[#A68A64]/10 p-2.5 rounded-xl border border-[#A68A64]/20 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>جهت انتقال در پیامک نامشخص بود و برداشت در نظر گرفته شد. در صورت نیاز نوع تراکنش را تغییر دهید.</span>
                  </div>
                )}

                {/* Amount Highlight & Live Words Preview */}
                <div className="p-3.5 rounded-xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">مبلغ تراکنش:</span>
                    <div className="text-left">
                      <span className="text-base sm:text-lg font-black text-[#A68A64] font-mono">
                        {formatCurrency(parsed.amountToman, currency)}
                      </span>
                      <span className="text-[10px] text-[#6B7280] block">
                        (معادل {toPersianDigits((parsed.amountToman * 10).toLocaleString())} ریال)
                      </span>
                    </div>
                  </div>
                  {/* Live Persian Words helper */}
                  <div className="text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] bg-[#A68A64]/10 dark:bg-[#A68A64]/15 px-2.5 py-1 rounded-lg border border-[#A68A64]/20 text-center">
                    {numberToPersianWords(parsed.amountToman, currency)}
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 space-y-0.5 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                    <span className="text-[10px] text-[#6B7280] block">بانک صادرکننده:</span>
                    <span className="font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                      {parsed.bankName}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 space-y-0.5 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                    <span className="text-[10px] text-[#6B7280] block">کارت / حساب:</span>
                    <span className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                      {parsed.cardLast4 ? `**** ${parsed.cardLast4}` : 'نامشخص'}
                    </span>
                  </div>

                  {parsed.feeToman !== undefined && parsed.feeToman > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 space-y-0.5 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                      <span className="text-[10px] text-[#6B7280] block">کارمزد پیامک:</span>
                      <span className="font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                        {formatCurrency(parsed.feeToman, currency)}
                      </span>
                    </div>
                  )}

                  {parsed.balanceToman !== undefined && (
                    <div className="p-3 rounded-xl bg-[#6B7280]/5 dark:bg-[#182028]/60 space-y-2 col-span-2 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">مانده حساب اعلامی در پیامک:</span>
                        <span className="font-bold text-[#1F2933] dark:text-[#F7F7F2] font-mono">
                          {formatCurrency(parsed.balanceToman, currency)}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none pt-1 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                        <input
                          type="checkbox"
                          checked={syncBalanceWithBank}
                          onChange={e => setSyncBalanceWithBank(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#A68A64] focus:ring-[#A68A64]"
                        />
                        <span className="text-[11px] text-[#1F2933] dark:text-[#F7F7F2] font-medium">
                          تراز کردن مانده این حساب در سیستم با مانده اعلامی بانک
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Account & Category Selection Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>حساب بانکی مقصد/مبدا:</span>
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 focus:outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="dark:bg-[#1F2933]">
                        {a.name} ({formatCurrency(a.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>دسته‌بندی:</span>
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 focus:outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                  >
                    {categories
                      .filter(c => c.type === (parsed.type === 'income' ? 'income' : 'expense'))
                      .map(c => (
                        <option key={c.id} value={c.id} className="dark:bg-[#1F2933]">
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description edit */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
                  توضیحات تراکنش:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 focus:outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                />
              </div>
            </div>
          ) : rawText.trim().length > 0 ? (
            <div className="p-4 rounded-2xl bg-[#C0564B]/10 border border-[#C0564B]/20 text-xs text-[#C0564B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                متن وارد شده به عنوان پیامک بانکی استاندارد شناسایی نشد. لطفاً متن کامل پیامک را کپی کنید.
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/40 text-[#6B7280] dark:text-[#D1D5DB] text-xs text-center space-y-1 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
              <HelpCircle className="w-5 h-5 mx-auto text-[#A68A64] mb-1" />
              <p className="font-bold text-[#1F2933] dark:text-[#F7F7F2]">نحوه استفاده در موبایل و دسکتاپ:</p>
              <p className="text-[11px] leading-relaxed">
                هر زمان پیامک برداشت یا واریز از بانک دریافت کردید، متن آن را کپی کرده و دکمه «خواندن از کلیپ‌بورد» را بزنید تا برنامه بلافاصله تراکنش را با حساب بانکی شما تطبیق دهد.
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 font-bold text-xs transition"
          >
            انصراف
          </button>
          {parsed && (
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#2E7D5B] hover:bg-[#25664a] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#2E7D5B]/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأیید و ثبت آنی تراکنش</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
