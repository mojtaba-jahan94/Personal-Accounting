import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquareText,
  Clipboard,
  CheckCircle2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { parseBankSMS } from '../../utils/smsParser';
import { ParsedBankSMS } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

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
  const { accounts, categories, currency, addTransaction } = useFinance();

  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedBankSMS | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawText.trim()) {
      setParsed(null);
      return;
    }
    const result = parseBankSMS(rawText);
    setParsed(result);

    if (result) {
      setDescription(result.description);

      // Auto match account by bank name or card last 4 digits
      let matchedAcc = accounts.find(
        a =>
          (result.cardLast4 && a.cardNumber?.endsWith(result.cardLast4)) ||
          a.bankName?.includes(result.bankName.replace(/بانک\s*/, '')) ||
          a.name.includes(result.bankName.replace(/بانک\s*/, ''))
      );

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
  }, [rawText, accounts, categories]);

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

    const todayJalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date())
      .replace(/\//g, '/');

    addTransaction({
      type: parsed.type,
      amount: parsed.amountToman,
      date: parsed.date || todayJalali,
      time: parsed.time || new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      description: description.trim() || parsed.description,
      categoryId: catId,
      accountId: accId,
    });

    if (onSuccess) {
      onSuccess(`تراکنش ${formatCurrency(parsed.amountToman, currency)} با موفقیت ثبت شد.`);
    }

    // Reset and close
    setRawText('');
    setParsed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>دستیار هوشمند پیامک بانکی</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  هوشمند
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تشخیص آنی مبلغ، نام بانک، شماره کارت و ثبت خودکار تراکنش
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button & Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              متن پیامک بانک را وارد یا الصاق کنید:
            </label>

            <button
              type="button"
              onClick={handleReadClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 text-xs font-bold transition border border-sky-500/30"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>خواندن از کلیپ‌بورد گوشی</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="متن پیامک واریز یا برداشت بانک (مثلاً: بانک ملت، برداشت ۵۰۰،۰۰۰ ریال از کارت ۱۲۳۴...)"
            className="w-full px-3.5 py-2.5 rounded-2xl text-xs liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white leading-relaxed resize-none"
          />

          {clipboardError && (
            <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clipboardError}</span>
            </div>
          )}

          {/* Sample Buttons for quick testing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold">تست سریع:</span>
            {SAMPLE_SMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawText(sample.text)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-sky-500/10 hover:text-sky-600 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Result Preview */}
        {parsed ? (
          <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-2 border-t border-slate-200/50 dark:border-white/10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900/60 dark:to-indigo-950/20 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>اطلاعات استخراج‌شده از پیامک:</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    parsed.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : parsed.type === 'transfer'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {parsed.type === 'income' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {parsed.type === 'income'
                      ? 'واریز'
                      : parsed.type === 'transfer'
                      ? 'انتقال وجه'
                      : 'برداشت / خرید'}
                  </span>
                </span>
              </div>

              {/* Amount Highlight */}
              <div className="p-3 rounded-xl liquid-glass flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">مبلغ تراکنش:</span>
                <div className="text-left">
                  <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatCurrency(parsed.amountToman, currency)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (معادل {toPersianDigits((parsed.amountToman * 10).toLocaleString())} ریال)
                  </span>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">بانک صادرکننده:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {parsed.bankName}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">کارت / حساب:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {parsed.cardLast4 ? `**** ${parsed.cardLast4}` : 'نامشخص'}
                  </span>
                </div>

                {parsed.balanceToman !== undefined && (
                  <div className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 space-y-0.5 col-span-2">
                    <span className="text-[10px] text-slate-400 block">مانده حساب اعلامی:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {formatCurrency(parsed.balanceToman, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account & Category Selection Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>حساب بانکی مقصد/مبدا:</span>
                </label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="dark:bg-slate-900">
                      {a.name} ({formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>دسته‌بندی:</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                >
                  {categories
                    .filter(c => c.type === (parsed.type === 'income' ? 'income' : 'expense'))
                    .map(c => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Description edit */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                توضیحات تراکنش:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
              >
                انصراف
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأیید و ثبت آنی تراکنش</span>
              </button>
            </div>
          </form>
        ) : rawText.trim().length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              متن وارد شده به عنوان پیامک بانکی استاندارد شناسایی نشد. لطفاً متن کامل پیامک را کپی کنید.
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 text-slate-400 text-xs text-center space-y-1">
            <HelpCircle className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
            <p className="font-bold">نحوه استفاده بسیار آسان در موبایل:</p>
            <p className="text-[11px] leading-relaxed">
              هر زمان پیامک برداشت یا واریز از بانک آمد، متن آن را کپی کرده و دکمه «خواندن از کلیپ‌بورد» بالا را بزنید تا برنامه بلافاصله تراکنش را با حساب بانکی شما تطبیق دهد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
