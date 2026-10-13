import React, { useState } from 'react';
import { X, Check, Coins } from 'lucide-react';
import { MarketPriceItem } from '../../types';
import {
  formatNumber,
  sanitizeAmountInput,
  formatAmountInput,
  parseAmount,
  numberToPersianWords,
} from '../../utils/formatters';

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

  const [enteredPrice, setEnteredPrice] = useState<string>(formatAmountInput(String(item.priceToman)));

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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                تنظیم دستی نرخ بازار
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                تعیین نرخ دلخواه برای {item.name}
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
        <form id="edit-market-price-form" onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          <div className="p-3 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex justify-between items-center text-xs">
            <span className="text-[#6B7280] dark:text-[#D1D5DB]">واحد سنجش:</span>
            <span className="font-bold text-[#1F2933] dark:text-[#F7F7F2]">{item.unit}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              قیمت به تومان: <span className="text-[#C0564B]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={enteredPrice}
                onChange={(e) => setEnteredPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-sm font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition text-center"
                placeholder="مثلاً 4,450,000"
              />
            </div>
            {parsedVal > 0 && (
              <div className="mt-2 p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
                {numberToPersianWords(parsedVal, 'toman')}
              </div>
            )}
          </div>
        </form>

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
            type="submit"
            form="edit-market-price-form"
            disabled={parsedVal <= 0}
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره نرخ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
