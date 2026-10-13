import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseTelegramMarketText, ParsedItemResult } from '../../services/marketPriceService';
import { formatNumber } from '../../utils/formatters';
import { SourceCurrencyUnit } from '../../types';

interface TelegramPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRates: (
    text: string,
    overrideUnit?: SourceCurrencyUnit
  ) => { count: number; symbols: string[]; message: string };
}

export const TelegramPasteModal: React.FC<TelegramPasteModalProps> = ({
  isOpen,
  onClose,
  onApplyRates,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [sourceUnit, setSourceUnit] = useState<SourceCurrencyUnit>('auto');
  const [feedback, setFeedback] = useState<string | null>(null);

  const parsed = parseTelegramMarketText(rawText, sourceUnit);

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
    const res = onApplyRates(rawText, sourceUnit);
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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4A6FA5]/15 border border-[#4A6FA5]/30 text-[#4A6FA5] flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5 -rotate-45 ml-0.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-2">
                به‌روزرسانی با پیست تلگرام
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A68A64]/15 text-[#A68A64] border border-[#A68A64]/30">
                  Nordic Parser
                </span>
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                متن مظنه کانال تلگرام را پیست کنید تا سیستم تمام قیمت‌ها را استخراج کند
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
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Currency Unit Selection for pasted text */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs">
            <span className="font-bold text-[#6B7280] dark:text-[#D1D5DB]">واحد قیمت‌ها در متن پیام:</span>
            <div className="flex items-center gap-1 bg-[#6B7280]/10 dark:bg-[#1F2933] p-0.5 rounded-xl">
              {(['auto', 'toman', 'rial'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setSourceUnit(u)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    sourceUnit === u
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
                  }`}
                >
                  {u === 'auto' ? 'تشخیص هوشمند' : u === 'toman' ? 'اعلام به تومان' : 'اعلام به ریال'}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                متن پیام کانال تلگرام:
              </label>
              <button
                type="button"
                onClick={handleInsertSample}
                className="text-[11px] font-bold text-[#A68A64] hover:underline flex items-center gap-1"
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
              className="w-full p-3.5 rounded-2xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] leading-relaxed resize-none transition"
            />
          </div>

          {/* Parsed Results Live Preview */}
          {parsed.matchedItems.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#2E7D5B]/5 dark:bg-[#2E7D5B]/10 border border-[#2E7D5B]/20">
              <div className="flex items-center justify-between text-xs font-bold text-[#2E7D5B] dark:text-[#4ADE80]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
                  <span>{parsed.matchedItems.length} نرخ شناسایی شد:</span>
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">آماده اعمال</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
                {parsed.matchedItems.map((item: ParsedItemResult) => (
                  <div
                    key={item.symbol}
                    className="p-2.5 rounded-xl bg-white/70 dark:bg-[#1F2933]/70 border border-[#2E7D5B]/20 text-[11px] space-y-0.5 shadow-2xs"
                  >
                    <div className="font-bold text-[#1F2933] dark:text-[#F7F7F2] truncate">
                      {item.name}
                    </div>
                    <div className="font-mono font-black text-[#2E7D5B] dark:text-[#4ADE80] text-left dir-ltr">
                      {formatNumber(item.priceToman)} <span className="text-[9px]">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rawText.trim() && parsed.matchedItems.length === 0 && (
            <div className="p-3 rounded-2xl bg-[#C0564B]/10 border border-[#C0564B]/20 flex items-center gap-2 text-xs text-[#C0564B]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C0564B]" />
              <span>هیچ قیمت معتبری در متن وارد شده یافت نشد. لطفاً از ذکر نام ارز یا طلا در کنار عدد اطمینان حاصل کنید.</span>
            </div>
          )}

          {feedback && (
            <div className="p-3 rounded-2xl bg-[#2E7D5B]/15 border border-[#2E7D5B]/30 text-xs font-bold text-[#2E7D5B] dark:text-[#4ADE80] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D5B]" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

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
            type="button"
            onClick={handleApply}
            disabled={parsed.matchedItems.length === 0}
            className="px-5 py-2.5 rounded-xl bg-[#2E7D5B] hover:bg-[#25664a] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#2E7D5B]/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعمال {parsed.matchedItems.length} نرخ به سبد دارایی</span>
          </button>
        </div>
      </div>
    </div>
  );
};
