import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { MarketPriceItem } from '../../types';
import {
  sanitizeAmountInput,
  formatAmountInput,
  parseAmount,
  numberToPersianWords,
} from '../../utils/formatters';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیم دستی نرخ بازار"
      subtitle={`تعیین نرخ دلخواه برای ${item.name}`}
      size="md"
    >
      <form id="edit-market-price-form" onSubmit={handleSave} className="space-y-4">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between items-center text-xs">
          <span className="text-fintech-text-muted">واحد سنجش:</span>
          <span className="font-bold text-white">{item.unit}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-fintech-text-primary">
            قیمت به تومان: <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={enteredPrice}
              onChange={(e) => setEnteredPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-mono font-bold text-white outline-none focus:border-violet-500/50 transition text-center"
              placeholder="مثلاً 4,450,000"
            />
          </div>
          {parsedVal > 0 && (
            <div className="mt-2 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
              {numberToPersianWords(parsedVal, 'toman')}
            </div>
          )}
        </div>

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
            type="submit"
            variant="primary"
            disabled={parsedVal <= 0}
            icon={<Check className="w-4 h-4" />}
          >
            ذخیره نرخ
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
