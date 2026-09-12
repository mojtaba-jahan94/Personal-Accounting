import React, { useState } from 'react';
import { MarketRate } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import {
  X,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
} from 'lucide-react';

interface MarketRatesCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRates: MarketRate[];
  visibleRateIds: string[];
  rateOrder: string[];
  onSave: (newOrder: string[], newHiddenIds: string[]) => void;
  currency: 'toman' | 'rial';
}

export const MarketRatesCustomizeModal: React.FC<MarketRatesCustomizeModalProps> = ({
  isOpen,
  onClose,
  allRates,
  visibleRateIds,
  rateOrder,
  onSave,
  currency,
}) => {
  const getInitialOrder = () => {
    const existingIds = new Set(allRates.map(r => r.id));
    const ordered = rateOrder.filter(id => existingIds.has(id));
    for (const r of allRates) {
      if (!ordered.includes(r.id)) {
        ordered.push(r.id);
      }
    }
    return ordered;
  };

  const [currentOrder, setCurrentOrder] = useState<string[]>(getInitialOrder);
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(visibleRateIds));

  if (!isOpen) return null;

  const toggleRate = (id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) {
          alert('حداقل یک نماد باید در تابلوی قیمت‌ها فعال باشد.');
          return prev;
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[newIdx];
    newOrder[newIdx] = temp;
    setCurrentOrder(newOrder);
  };

  const handleSelectAll = () => {
    setActiveIds(new Set(allRates.map(r => r.id)));
  };

  const handleSelectOnlyGoldAndUsd = () => {
    const essential = allRates
      .filter(r => r.id === 'gold_18k' || r.id === 'usd' || r.id === 'coin_emami' || r.id === 'tether')
      .map(r => r.id);
    setActiveIds(new Set(essential));
  };

  const handleResetDefaults = () => {
    const defaultIds = allRates.map(r => r.id);
    setCurrentOrder(defaultIds);
    setActiveIds(new Set(defaultIds));
  };

  const handleSaveAndApply = () => {
    const hiddenIds = allRates.filter(r => !activeIds.has(r.id)).map(r => r.id);
    onSave(currentOrder, hiddenIds);
    onClose();
  };

  const rateMap = new Map(allRates.map(r => [r.id, r]));
  const orderedRateObjects = currentOrder
    .map(id => rateMap.get(id))
    .filter((r): r is MarketRate => Boolean(r));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-lg overflow-hidden border border-white/30 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                شخصی‌سازی تابلوی زنده قیمت‌ها
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                انتخاب نمادهای نمایشی و اولویت‌بندی ترتیب چیدمان کارت‌ها
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

        {/* Quick presets toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/40 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {toPersianDigits(activeIds.size)} مورد فعال از {toPersianDigits(allRates.length)} نماد
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSelectOnlyGoldAndUsd}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold transition text-[11px]"
            >
              طلا و دلار اصلی
            </button>
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold transition text-[11px]"
            >
              نمایش همه
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-2 py-1 rounded-lg hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold transition text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>پیش‌فرض</span>
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-white/5">
          {orderedRateObjects.map((rate, index) => {
            const isVisible = activeIds.has(rate.id);
            return (
              <div
                key={rate.id}
                className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-xl transition ${
                  isVisible
                    ? 'bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5'
                    : 'opacity-50 bg-slate-100/40 dark:bg-slate-900/30'
                }`}
              >
                {/* Left (Checkbox + Info) */}
                <div
                  className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                  onClick={() => toggleRate(rate.id)}
                >
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 ${
                      isVisible
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'border border-slate-300 dark:border-slate-600 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        {rate.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {rate.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatCurrency(currency === 'rial' ? rate.priceToman * 10 : rate.priceToman, currency)}
                    </div>
                  </div>
                </div>

                {/* Right (Reorder buttons) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 transition"
                    title="انتقال به بالا"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedRateObjects.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 transition"
                    title="انتقال به پایین"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSaveAndApply}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-black shadow-md shadow-amber-500/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ذخیره و اعمال چیدمان</span>
          </button>
        </div>
      </div>
    </div>
  );
};
