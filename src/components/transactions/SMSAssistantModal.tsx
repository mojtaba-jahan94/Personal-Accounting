import React, { useState, useEffect, useRef } from 'react';
import {
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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
  const [typeOverride, setTypeOverride] = useState<'income' | 'expense' | null>(null);

  const lastParsedRawTextRef = useRef<string>('');

  useEffect(() => {
    if (!rawText.trim()) {
      setParsed(null);
      lastParsedRawTextRef.current = '';
      setTypeOverride(null);
      return;
    }

    const isNewRawText = rawText !== lastParsedRawTextRef.current;
    if (isNewRawText) {
      setTypeOverride(null);
    }

    const result = parseBankSMS(rawText, forceCurrencyUnit);
    const activeTypeOverride = isNewRawText ? null : typeOverride;
    const finalParsed = result
      ? {
          ...result,
          type: activeTypeOverride || result.type,
          isUncertainType: activeTypeOverride ? false : result.isUncertainType,
        }
      : null;

    setParsed(finalParsed);

    if (finalParsed && isNewRawText) {
      lastParsedRawTextRef.current = rawText;
      setDescription(finalParsed.description);

      // Match in stages:
      // 1) exact match on the card's last 4 digits
      let matchedAcc = finalParsed.cardLast4
        ? accounts.find(a => a.cardNumber?.endsWith(finalParsed.cardLast4!))
        : undefined;

      // 2) bank name match (use ^بانک\s* anchored)
      if (!matchedAcc) {
        const cleanBankName = finalParsed.bankName.replace(/^بانک\s*/, '').trim();
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
        c => c.type === (finalParsed.type === 'income' ? 'income' : 'expense')
      );
      if (suitableCategories.length > 0) {
        setSelectedCategoryId(suitableCategories[0].id);
      }
    }
  }, [rawText, forceCurrencyUnit, accounts, categories, typeOverride]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setTypeOverride(newType);
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
    setTypeOverride(null);
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
    <ModalShell
      isOpen={isOpen}
      onClose={handleModalClose}
      title="دستیار هوشمند پیامک بانکی"
      subtitle="تشخیص خودکار مبلغ، نام بانک، شماره کارت و تسویه مانده"
      size="xl"
    >
      <form onSubmit={handleConfirmSubmit} className="space-y-4">
        {/* Action Button & Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-fintech-text-primary">
              متن پیامک بانک را وارد یا الصاق کنید:
            </label>

            <button
              type="button"
              onClick={handleReadClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 text-xs font-bold transition border border-violet-500/30"
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
            className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 text-white leading-relaxed resize-none transition"
          />

          {clipboardError && (
            <div className="text-[11px] text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clipboardError}</span>
            </div>
          )}

          {/* Sample Buttons for quick testing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-fintech-text-muted font-bold">تست سریع:</span>
            {SAMPLE_SMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawText(sample.text)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-fintech-text-muted hover:bg-violet-500/15 hover:text-violet-300 transition border border-white/5"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Currency Unit Selection Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
            <span className="text-[11px] font-bold text-fintech-text-muted">
              واحد پول پیامک:
            </span>
            <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg text-[10px] font-bold border border-white/5">
              <button
                type="button"
                onClick={() => setForceCurrencyUnit('auto')}
                className={`px-2 py-0.5 rounded-md transition ${
                  forceCurrencyUnit === 'auto'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-fintech-text-muted hover:text-white'
                }`}
              >
                تشخیص خودکار
              </button>
              <button
                type="button"
                onClick={() => setForceCurrencyUnit('rial')}
                className={`px-2 py-0.5 rounded-md transition ${
                  forceCurrencyUnit === 'rial'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-fintech-text-muted hover:text-white'
                }`}
              >
                ریال (تبدیل به تومان ÷۱۰)
              </button>
              <button
                type="button"
                onClick={() => setForceCurrencyUnit('toman')}
                className={`px-2 py-0.5 rounded-md transition ${
                  forceCurrencyUnit === 'toman'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-fintech-text-muted hover:text-white'
                }`}
              >
                تومان (بدون تبدیل)
              </button>
            </div>
          </div>
        </div>

        {/* Parsed Result Preview */}
        {parsed ? (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-violet-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>اطلاعات استخراج‌شده از پیامک:</span>
                </span>
                <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg text-[10px] font-bold border border-white/5">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                      parsed.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-fintech-text-muted hover:text-white'
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
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
                        : 'text-fintech-text-muted hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>برداشت / خرید</span>
                  </button>
                </div>
              </div>

              {parsed.isUncertainType && (
                <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>جهت انتقال در پیامک نامشخص بود و برداشت در نظر گرفته شد. در صورت نیاز نوع تراکنش را تغییر دهید.</span>
                </div>
              )}

              {/* Amount Highlight & Live Words Preview */}
              <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-fintech-text-muted">مبلغ تراکنش:</span>
                  <div className="text-left">
                    <span className="text-base sm:text-lg font-black text-violet-300 font-mono">
                      {formatCurrency(parsed.amountToman, currency)}
                    </span>
                    <span className="text-[10px] text-fintech-text-muted block">
                      (معادل {toPersianDigits((parsed.amountToman * 10).toLocaleString())} ریال)
                    </span>
                  </div>
                </div>
                {/* Live Persian Words helper */}
                <div className="text-[11px] font-bold text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20 text-center">
                  {numberToPersianWords(parsed.amountToman, currency)}
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] space-y-0.5 border border-white/5">
                  <span className="text-[10px] text-fintech-text-muted block">بانک صادرکننده:</span>
                  <span className="font-bold text-white">
                    {parsed.bankName}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] space-y-0.5 border border-white/5">
                  <span className="text-[10px] text-fintech-text-muted block">کارت / حساب:</span>
                  <span className="font-mono font-bold text-white">
                    {parsed.cardLast4 ? `**** ${parsed.cardLast4}` : 'نامشخص'}
                  </span>
                </div>

                {parsed.feeToman !== undefined && parsed.feeToman > 0 && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] space-y-0.5 border border-white/5">
                    <span className="text-[10px] text-fintech-text-muted block">کارمزد پیامک:</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(parsed.feeToman, currency)}
                    </span>
                  </div>
                )}

                {parsed.balanceToman !== undefined && (
                  <div className="p-3 rounded-xl bg-white/[0.02] space-y-2 col-span-2 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-fintech-text-muted block">مانده حساب اعلامی در پیامک:</span>
                      <span className="font-bold text-white font-mono">
                        {formatCurrency(parsed.balanceToman, currency)}
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1 border-t border-white/5">
                      <input
                        type="checkbox"
                        checked={syncBalanceWithBank}
                        onChange={e => setSyncBalanceWithBank(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-violet-500 accent-violet-500"
                      />
                      <span className="text-[11px] text-fintech-text-primary font-medium">
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
                <label className="text-xs font-bold text-fintech-text-primary flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                  <span>حساب بانکی مقصد/مبدا:</span>
                </label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#121215] text-white">
                      {a.name} ({formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-fintech-text-primary flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                  <span>دسته‌بندی:</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 text-white"
                >
                  {categories
                    .filter(c => c.type === (parsed.type === 'income' ? 'income' : 'expense'))
                    .map(c => (
                      <option key={c.id} value={c.id} className="bg-[#121215] text-white">
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Description edit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-fintech-text-primary block">
                توضیحات تراکنش:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 text-white"
              />
            </div>
          </div>
        ) : rawText.trim().length > 0 ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              متن وارد شده به عنوان پیامک بانکی استاندارد شناسایی نشد. لطفاً متن کامل پیامک را کپی کنید.
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] text-fintech-text-muted text-xs text-center space-y-1 border border-white/5">
            <HelpCircle className="w-5 h-5 mx-auto text-violet-400 mb-1" />
            <p className="font-bold text-white">نحوه استفاده در موبایل و دسکتاپ:</p>
            <p className="text-[11px] leading-relaxed">
              هر زمان پیامک برداشت یا واریز از بانک دریافت کردید، متن آن را کپی کرده و دکمه «خواندن از کلیپ‌بورد» را بزنید تا برنامه بلافاصله تراکنش را با حساب بانکی شما تطبیق دهد.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleModalClose}
          >
            انصراف
          </Button>
          {parsed && (
            <Button
              type="submit"
              variant="primary"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              تأیید و ثبت آنی تراکنش
            </Button>
          )}
        </div>
      </form>
    </ModalShell>
  );
};
