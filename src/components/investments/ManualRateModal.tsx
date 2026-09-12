import React, { useState } from 'react';
import { X, Check, RotateCcw, DollarSign } from 'lucide-react';
import { MarketRate, Currency } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';

interface ManualRateModalProps {
  rate: MarketRate | null;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, priceToman: number | null) => void;
}

export const ManualRateModal: React.FC<ManualRateModalProps> = ({
  rate,
  currency,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !rate) return null;

  const [customPrice, setCustomPrice] = useState<string>(rate.priceToman.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customPrice.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      onSave(rate.id, parsed);
      onClose();
    }
  };

  const handleResetToAuto = () => {
    onSave(rate.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-md p-6 relative space-y-4 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                تنظیم دستی قیمت {rate.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                منبع فعلی: {rate.source || 'خودکار'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              قیمت مد نظر شما (به تومان):
            </label>
            <div className="relative">
              <input
                type="number"
                dir="ltr"
                required
                min={1}
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold font-mono liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">تومان</span>
            </div>
            {customPrice && !isNaN(parseInt(customPrice, 10)) && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
                معادل: {formatCurrency(parseInt(customPrice, 10), currency)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/10">
            {rate.isManual ? (
              <button
                type="button"
                onClick={handleResetToAuto}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازگشت به نرخ خودکار</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">نرخ فعلی خودکار است</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ذخیره قیمت</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
