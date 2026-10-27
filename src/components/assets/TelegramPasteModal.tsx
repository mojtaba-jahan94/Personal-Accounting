import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseTelegramMarketText, ParsedItemResult } from '../../services/marketPriceService';
import { formatNumber } from '../../utils/formatters';
import { SourceCurrencyUnit } from '../../types';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="به‌روزرسانی با پیست تلگرام"
      subtitle="متن مظنه کانال تلگرام را پیست کنید تا سیستم تمام قیمت‌ها را استخراج کند"
      size="xl"
    >
      <div className="space-y-4">
        {/* Currency Unit Selection for pasted text */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
          <span className="font-bold text-fintech-text-muted">واحد قیمت‌ها در متن پیام:</span>
          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-xl border border-white/5">
            {(['auto', 'toman', 'rial'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setSourceUnit(u)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  sourceUnit === u
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-fintech-text-muted hover:text-white'
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
            <label className="text-xs font-bold text-fintech-text-primary">
              متن پیام کانال تلگرام:
            </label>
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-[11px] font-bold text-violet-400 hover:underline flex items-center gap-1"
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
            className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500/50 leading-relaxed resize-none transition"
          />
        </div>

        {/* Parsed Results Live Preview */}
        {parsed.matchedItems.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{parsed.matchedItems.length} نرخ شناسایی شد:</span>
              </span>
              <span className="text-[10px] text-fintech-text-muted">آماده اعمال</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
              {parsed.matchedItems.map((item: ParsedItemResult) => (
                <div
                  key={item.symbol}
                  className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20 text-[11px] space-y-0.5"
                >
                  <div className="font-bold text-white truncate">
                    {item.name}
                  </div>
                  <div className="font-mono font-black text-emerald-400 text-left dir-ltr">
                    {formatNumber(item.priceToman)} <span className="text-[9px]">تومان</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rawText.trim() && parsed.matchedItems.length === 0 && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>هیچ قیمت معتبری در متن وارد شده یافت نشد. لطفاً از ذکر نام ارز یا طلا در کنار عدد اطمینان حاصل کنید.</span>
          </div>
        )}

        {feedback && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            disabled={parsed.matchedItems.length === 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            اعمال {parsed.matchedItems.length} نرخ به سبد دارایی
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
