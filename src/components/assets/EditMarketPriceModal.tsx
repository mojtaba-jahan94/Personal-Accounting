import React, { useState } from 'react';
import { X, Check, Edit3, DollarSign, Coins } from 'lucide-react';
import { MarketPriceItem } from '../../types';
import { formatNumber, sanitizeAmountInput, parseAmount } from '../../utils/formatters';

interface EditMarketPriceModalProps {
  isOpen: boolean;
  item: MarketPriceItem | null;
  onClose: () => void;
  onSave: (symbol: string, newPriceToman: number) => void;
}

export const EditMarketPriceModal: React.FC<EditMarketPriceModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [enteredPrice, setEnteredPrice] = useState<string>(String(item.priceToman));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAmount(enteredPrice);
    if (parsed > 0) {
      onSave(item.symbol, parsed);
      onClose();
    }
  };

  const parsedVal = parseAmount(enteredPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">تنظیم دستی نرخ بازار</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تعیین نرخ دلخواه برای {item.name}
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

        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">واحد سنجش:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{item.unit}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              قیمت به تومان:
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={enteredPrice}
                onChange={(e) => setEnteredPrice(sanitizeAmountInput(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr pl-14"
                placeholder="مثلاً 4450000"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                تومان
              </span>
            </div>
            {parsedVal > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold pr-1 pt-1">
                معادل: {formatNumber(parsedVal)} تومان
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={parsedVal <= 0}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره نرخ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
