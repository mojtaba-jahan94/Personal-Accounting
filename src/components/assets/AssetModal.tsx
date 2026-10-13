import React, { useState, useEffect } from 'react';
import {
  X,
  Gem,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Asset, AssetCategory, MarketPriceItem } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatNumber,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  numberToPersianWords,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';

interface AssetModalProps {
  isOpen: boolean;
  assetToEdit?: Asset | null;
  marketPrices: MarketPriceItem[];
  onClose: () => void;
  onSave: (assetData: Omit<Asset, 'id' | 'createdAt'>) => void;
}

const PRESET_ASSET_TEMPLATES = [
  {
    name: 'طلای ۱۸ عیار (آبشده / زینتی)',
    category: 'gold' as AssetCategory,
    symbol: 'gold_18k',
    unit: 'گرم',
    defaultQty: '10',
  },
  {
    name: 'سکه تمام طرح جدید (امامی)',
    category: 'coin' as AssetCategory,
    symbol: 'coin_emami',
    unit: 'عدد',
    defaultQty: '1',
  },
  {
    name: 'نیم سکه بهار آزادی',
    category: 'coin' as AssetCategory,
    symbol: 'coin_half',
    unit: 'عدد',
    defaultQty: '1',
  },
  {
    name: 'ربع سکه بهار آزادی',
    category: 'coin' as AssetCategory,
    symbol: 'coin_quarter',
    unit: 'عدد',
    defaultQty: '1',
  },
  {
    name: 'دلار کاغذی آمریکا',
    category: 'currency' as AssetCategory,
    symbol: 'usd',
    unit: 'دلار',
    defaultQty: '1000',
  },
  {
    name: 'تتر دیجیتال (USDT)',
    category: 'crypto' as AssetCategory,
    symbol: 'usdt',
    unit: 'تتر',
    defaultQty: '500',
  },
  {
    name: 'یورو اروپا',
    category: 'currency' as AssetCategory,
    symbol: 'eur',
    unit: 'یورو',
    defaultQty: '500',
  },
  {
    name: 'درهم امارات',
    category: 'currency' as AssetCategory,
    symbol: 'aed',
    unit: 'درهم',
    defaultQty: '1000',
  },
  {
    name: 'دارایی دلخواه (ملک، سهام و...)',
    category: 'custom' as AssetCategory,
    symbol: 'custom',
    unit: 'واحد',
    defaultQty: '1',
  },
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  assetToEdit,
  marketPrices,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('gold');
  const [symbol, setSymbol] = useState('gold_18k');
  const [unit, setUnit] = useState('گرم');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayJalali());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setCategory(assetToEdit.category);
      setSymbol(assetToEdit.symbol);
      setUnit(assetToEdit.unit);
      setQuantity(String(assetToEdit.quantity));
      setBuyPrice(formatAmountInput(String(assetToEdit.buyPriceAverage)));
      setPurchaseDate(assetToEdit.purchaseDate || getTodayJalali());
      setNotes(assetToEdit.notes || '');
    } else {
      const template = PRESET_ASSET_TEMPLATES[0];
      setName(template.name);
      setCategory(template.category);
      setSymbol(template.symbol);
      setUnit(template.unit);
      setQuantity(template.defaultQty);
      const mPrice = marketPrices.find((p) => p.symbol === template.symbol);
      setBuyPrice(mPrice ? formatAmountInput(String(mPrice.priceToman)) : '4,450,000');
      setPurchaseDate(getTodayJalali());
      setNotes('');
    }
  }, [assetToEdit, isOpen, marketPrices]);

  const handleTemplateSelect = (tmpl: typeof PRESET_ASSET_TEMPLATES[0]) => {
    setName(tmpl.name);
    setCategory(tmpl.category);
    setSymbol(tmpl.symbol);
    setUnit(tmpl.unit);
    if (!quantity || quantity === '0') {
      setQuantity(tmpl.defaultQty);
    }
    const mPrice = marketPrices.find((p) => p.symbol === tmpl.symbol);
    if (mPrice) {
      setBuyPrice(formatAmountInput(String(mPrice.priceToman)));
    }
  };

  const parsedQty = parseAmount(quantity);
  const parsedBuyPrice = parseAmount(buyPrice);
  const totalCost = parsedQty * parsedBuyPrice;

  const matchedMarketItem = marketPrices.find((p) => p.symbol === symbol);
  const currentUnitMarketPrice = matchedMarketItem ? matchedMarketItem.priceToman : parsedBuyPrice;
  const currentTotalValue = parsedQty * currentUnitMarketPrice;
  const profitLoss = currentTotalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || parsedQty <= 0) return;

    onSave({
      name: name.trim(),
      category,
      symbol,
      quantity: parsedQty,
      unit: unit.trim() || 'واحد',
      buyPriceAverage: parsedBuyPrice,
      totalCost,
      purchaseDate,
      notes: notes.trim(),
    });

    onClose();
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
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                {assetToEdit ? 'ویرایش دارایی سرمایه‌ای' : 'افزودن دارایی جدید به سبد'}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                طلا، مسکوکات، ارزهای کاغذی یا دیجیتال در پرتفوی سرمایه‌گذاری
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
        <form id="asset-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Quick Template Chips (Only for new assets) */}
          {!assetToEdit && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB]">
                انتخاب سریع نوع دارایی:
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_ASSET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.symbol + tmpl.name}
                    type="button"
                    onClick={() => handleTemplateSelect(tmpl)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition flex items-center gap-1 border ${
                      symbol === tmpl.symbol
                        ? 'bg-[#A68A64] border-[#A68A64] text-[#F7F7F2]'
                        : 'bg-white/60 dark:bg-[#182028]/60 border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#A68A64]/10'
                    }`}
                  >
                    <span>{tmpl.name.split(' ')[0]} {tmpl.name.split(' ')[1] || ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Asset Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              عنوان دارایی: <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً طلای ۱۸ عیار، سکه امامی، دلار نقدی..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
            />
          </div>

          {/* Category & Unit in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                دسته‌بندی:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
              >
                <option value="gold" className="dark:bg-[#1F2933]">طلا و مسکوکات طلا</option>
                <option value="coin" className="dark:bg-[#1F2933]">انواع سکه بهار آزادی</option>
                <option value="currency" className="dark:bg-[#1F2933]">ارزهای خارجی (دلار، یورو...)</option>
                <option value="crypto" className="dark:bg-[#1F2933]">ارز دیجیتال (تتر، بیت‌کوین...)</option>
                <option value="custom" className="dark:bg-[#1F2933]">سایر دارایی‌ها / سفارشی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                واحد سنجش:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="گرم، عدد، دلار، تتر..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
              />
            </div>
          </div>

          {/* Quantity & Unit Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                مقدار / وزن ({unit}): <span className="text-[#C0564B]">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={quantity}
                onChange={(e) => setQuantity(sanitizeAmountInput(e.target.value))}
                placeholder="مثلاً 15.5 یا 2"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                میانگین قیمت خرید (تومان):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={buyPrice}
                onChange={(e) => setBuyPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
                placeholder="نرخ خرید هر واحد"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition text-center"
              />
            </div>
          </div>

          {/* Live Words Helper Badge */}
          {parsedBuyPrice > 0 && (
            <div className="p-2 rounded-xl bg-[#A68A64]/10 dark:bg-[#A68A64]/15 border border-[#A68A64]/20 text-[11px] font-bold text-[#A68A64] dark:text-[#C2A882] text-center">
              نرخ واحد: {numberToPersianWords(parsedBuyPrice, 'toman')}
            </div>
          )}

          {/* Purchase Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <JalaliDatePicker
                value={purchaseDate}
                onChange={setPurchaseDate}
                label="تاریخ خرید"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                یادداشت یا محل نگهداری:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="صندوق امانات، کیف پول، گاوصندوق..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
              />
            </div>
          </div>

          {/* Live Valuation Capsule Preview */}
          {parsedQty > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
              <div className="text-[11px] font-bold text-[#A68A64] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  محاسبه آنی ارزش بر اساس نرخ زنده بازار:
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
                  نرخ روز: {formatNumber(currentUnitMarketPrice)} تومان
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#1F2933]/60 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">کل هزینه خرید:</span>
                  <span className="text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                    {formatNumber(totalCost)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#1F2933]/60 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">ارزش روز کل:</span>
                  <span className="text-xs font-mono font-bold text-[#A68A64]">
                    {formatNumber(currentTotalValue)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/60 dark:bg-[#1F2933]/60 border border-[#6B7280]/10 dark:border-[#D1D5DB]/5">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">سود / زیان:</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      profitLoss >= 0
                        ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                        : 'text-[#C0564B] dark:text-[#F87171]'
                    }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {formatNumber(profitLoss)} ({pnlPercent >= 0 ? '+' : ''}
                    {pnlPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
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
            form="asset-form"
            disabled={!name.trim() || parsedQty <= 0}
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{assetToEdit ? 'بروزرسانی دارایی' : 'ذخیره در سبد دارایی'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
