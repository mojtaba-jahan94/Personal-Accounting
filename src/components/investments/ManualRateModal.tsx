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

  const [inputUnit, setInputUnit] = useState<'toman' | 'rial'>(currency);
  const [customPrice, setCustomPrice] = useState<string>(
    currency === 'rial' ? (rate.priceToman * 10).toString() : rate.priceToman.toString()
  );

  const handleUnitChange = (newUnit: 'toman' | 'rial') => {
    if (newUnit === inputUnit) return;
    const parsed = parseInt(customPrice.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (newUnit === 'rial') {
        setCustomPrice((parsed * 10).toString());
      } else {
        setCustomPrice(Math.round(parsed / 10).toString());
      }
    }
    setInputUnit(newUnit);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customPrice.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      const finalToman = inputUnit === 'rial' ? Math.round(parsed / 10) : parsed;
      onSave(rate.id, finalToman);
      onClose();
    }
  };

  const handleResetToAuto = () => {
    onSave(rate.id, null);
    onClose();
  };

  const rawParsed = parseInt(customPrice.replace(/[^0-9]/g, ''), 10) || 0;
  const calculatedToman = inputUnit === 'rial' ? Math.round(rawParsed / 10) : rawParsed;

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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                قیمت مد نظر شما:
              </label>
              <div className="flex items-center p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleUnitChange('toman')}
                  className={`px-2.5 py-0.5 rounded-md transition ${
                    inputUnit === 'toman'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  تومان
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitChange('rial')}
                  className={`px-2.5 py-0.5 rounded-md transition ${
                    inputUnit === 'rial'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  ریال
                </button>
              </div>
            </div>

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
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                {inputUnit === 'toman' ? 'تومان' : 'ریال'}
              </span>
            </div>

            {rawParsed > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-200 font-bold">
                  <span>معادل ذخیره در سبد دارایی:</span>
                  <span className="font-mono text-xs">{formatCurrency(calculatedToman, 'toman')}</span>
                </div>
                {inputUnit === 'toman' && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                    <span>معادل به ریال:</span>
                    <span className="font-mono">{formatCurrency(rawParsed * 10, 'rial')}</span>
                  </div>
                )}
              </div>
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
