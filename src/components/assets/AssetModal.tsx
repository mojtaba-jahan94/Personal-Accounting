import React, { useState, useEffect } from 'react';
import {
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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
    name: 'تتر (USDT)',
    category: 'crypto' as AssetCategory,
    symbol: 'usdt',
    unit: 'USDT',
    defaultQty: '500',
  },
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  assetToEdit,
  marketPrices,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('gold');
  const [symbol, setSymbol] = useState<string>('gold_18k');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('گرم');
  const [buyPrice, setBuyPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayJalali());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setCategory(assetToEdit.category);
      setSymbol(assetToEdit.symbol || '');
      setQuantity(assetToEdit.quantity.toString());
      setUnit(assetToEdit.unit);
      setBuyPrice(formatAmountInput(assetToEdit.buyPriceAverage.toString()));
      setPurchaseDate(assetToEdit.purchaseDate || getTodayJalali());
      setNotes(assetToEdit.notes || '');
    } else {
      setName('طلای ۱۸ عیار');
      setCategory('gold');
      setSymbol('gold_18k');
      setQuantity('');
      setUnit('گرم');
      setBuyPrice('');
      setPurchaseDate(getTodayJalali());
      setNotes('');
    }
  }, [assetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTemplateSelect = (tmpl: typeof PRESET_ASSET_TEMPLATES[0]) => {
    setName(tmpl.name);
    setCategory(tmpl.category);
    setSymbol(tmpl.symbol);
    setUnit(tmpl.unit);
    if (!quantity) setQuantity(tmpl.defaultQty);

    const priceMatch = marketPrices.find((p) => p.symbol === tmpl.symbol);
    if (priceMatch && !buyPrice) {
      setBuyPrice(formatAmountInput(priceMatch.priceToman.toString()));
    }
  };

  const parsedQty = parseFloat(quantity) || 0;
  const parsedBuyPrice = parseAmount(buyPrice);
  const totalCost = parsedQty * parsedBuyPrice;

  const currentPriceItem = marketPrices.find((p) => p.symbol === symbol);
  const currentUnitMarketPrice = currentPriceItem ? currentPriceItem.priceToman : parsedBuyPrice;
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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'ویرایش دارایی سرمایه‌ای' : 'افزودن دارایی جدید به سبد'}
      subtitle="طلا، مسکوکات، ارزهای کاغذی یا دیجیتال در پرتفوی سرمایه‌گذاری"
      size="xl"
    >
      <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Template Chips (Only for new assets) */}
        {!assetToEdit && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-fintech-text-muted">
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
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-fintech-text-muted hover:bg-violet-500/10 hover:text-white'
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
          <label className="text-xs font-bold text-fintech-text-primary">
            عنوان دارایی: <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً طلای ۱۸ عیار، سکه امامی، دلار نقدی..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition"
          />
        </div>

        {/* Category & Unit in grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-fintech-text-primary">
              دسته‌بندی:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition"
            >
              <option value="gold" className="bg-[#121215]">طلا و مسکوکات طلا</option>
              <option value="coin" className="bg-[#121215]">انواع سکه بهار آزادی</option>
              <option value="currency" className="bg-[#121215]">ارزهای خارجی (دلار، یورو...)</option>
              <option value="crypto" className="bg-[#121215]">ارز دیجیتال (تتر، بیت‌کوین...)</option>
              <option value="custom" className="bg-[#121215]">سایر دارایی‌ها / سفارشی</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-fintech-text-primary">
              واحد سنجش:
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="گرم، عدد، دلار، تتر..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Quantity & Unit Buy Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-fintech-text-primary">
              مقدار / وزن ({unit}): <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={quantity}
              onChange={(e) => setQuantity(sanitizeAmountInput(e.target.value))}
              placeholder="مثلاً 15.5 یا 2"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/50 transition text-center"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-fintech-text-primary">
              میانگین قیمت خرید (تومان):
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={buyPrice}
              onChange={(e) => setBuyPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="نرخ خرید هر واحد"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/50 transition text-center"
            />
          </div>
        </div>

        {/* Live Words Helper Badge */}
        {parsedBuyPrice > 0 && (
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 text-center">
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
            <label className="text-xs font-bold text-fintech-text-primary">
              یادداشت یا محل نگهداری:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="صندوق امانات، کیف پول، گاوصندوق..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Live Valuation Capsule Preview */}
        {parsedQty > 0 && (
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="text-[11px] font-bold text-violet-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                محاسبه آنی ارزش بر اساس نرخ زنده بازار:
              </span>
              <span className="text-[10px] text-fintech-text-muted">
                نرخ روز: {formatNumber(currentUnitMarketPrice)} تومان
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[10px] text-fintech-text-muted block">کل هزینه خرید:</span>
                <span className="text-xs font-mono font-bold text-white">
                  {formatNumber(totalCost)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[10px] text-fintech-text-muted block">ارزش روز کل:</span>
                <span className="text-xs font-mono font-bold text-violet-300">
                  {formatNumber(currentTotalValue)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[10px] text-fintech-text-muted block">سود / زیان:</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    profitLoss >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
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

        {/* Sticky Footer */}
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
            disabled={!name.trim() || parsedQty <= 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {assetToEdit ? 'بروزرسانی دارایی' : 'ذخیره در سبد دارایی'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
