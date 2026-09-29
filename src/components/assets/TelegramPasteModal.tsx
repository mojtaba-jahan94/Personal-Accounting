import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles, Copy, ArrowRight } from 'lucide-react';
import { parseTelegramMarketText, ParsedItemResult } from '../../services/marketPriceService';
import { formatNumber } from '../../utils/formatters';

interface TelegramPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRates: (text: string) => { count: number; symbols: string[]; message: string };
}

export const TelegramPasteModal: React.FC<TelegramPasteModalProps> = ({
  isOpen,
  onClose,
  onApplyRates,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const parsed = parseTelegramMarketText(rawText);

  const sampleDemoText = `نرخ لحظه‌ای طلا و ارز در بازار تهران:
دلار نقدی بازار: ۹۳,۴۰۰ تومان
تتر دیجیتال: ۹۳,۶۵۰
طلای ۱۸ عیار: ۴,۴۵۰,۰۰۰
سکه تمام طرح جدید (امامی): ۵۳,۲۰۰,۰۰۰
نیم سکه بهار آزادی: ۲۸,۴۰۰,۰۰۰
ربع سکه: ۱۸,۵۰۰,۰۰۰
سکه گرمی: ۸,۷۰۰,۰۰۰
یورو: ۱۰۱,۸۰۰
درهم امارات: ۲۵,۴۰۰
انس جهانی: ۲۶۸۴ دلار`;

  const handleApply = () => {
    if (!rawText.trim()) return;
    const res = onApplyRates(rawText);
    setFeedback(res.message);
    if (res.count > 0) {
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  const handleInsertSample = () => {
    setRawText(sampleDemoText);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <Send className="w-5 h-5 -rotate-45 ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                به‌روزرسانی با پیست پیام تلگرام
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  هوشمند و سریع
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                متن مظنه کانال یا گروه تلگرامی را اینجا پیست کنید؛ سیستم تمام قیمت‌ها را استخراج می‌کند.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              متن پیام کانال تلگرام:
            </label>
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              درج متن نمونه بازار
            </button>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setFeedback(null);
            }}
            placeholder="مثال: دلار: ۹۳,۴۰۰ / طلا ۱۸ عیار: ۴,۴۵۰,۰۰۰ / سکه امامی: ۵۳,۲۰۰,۰۰۰ ..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-none"
          />
        </div>

        {/* Parsed Results Live Preview */}
        {parsed.matchedItems.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40">
            <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{parsed.matchedItems.length} نرخ شناسایی شد:</span>
              </span>
              <span className="text-[10px] text-slate-500">آماده اعمال</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
              {parsed.matchedItems.map((item: ParsedItemResult) => (
                <div
                  key={item.symbol}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-sky-100 dark:border-slate-800 text-[11px] space-y-0.5 shadow-2xs"
                >
                  <div className="font-bold text-slate-700 dark:text-slate-300 truncate">
                    {item.name}
                  </div>
                  <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 dir-ltr text-left">
                    {formatNumber(item.priceToman)} <span className="text-[9px]">تومان</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rawText.trim() && parsed.matchedItems.length === 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>هیچ قیمت معتبری در متن وارد شده یافت نشد. لطفاً از ذکر نام ارز یا طلا در کنار عدد اطمینان حاصل کنید.</span>
          </div>
        )}

        {feedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsed.matchedItems.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-md shadow-sky-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعمال {parsed.matchedItems.length} نرخ به سبد دارایی</span>
          </button>
        </div>
      </div>
    </div>
  );
};
