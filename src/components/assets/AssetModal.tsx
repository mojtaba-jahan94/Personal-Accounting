import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Coins,
  DollarSign,
  TrendingUp,
  Gem,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Asset, AssetCategory, MarketPriceItem } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatNumber,
  parseAmount,
  sanitizeAmountInput,
} from '../../utils/formatters';

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
    name: 'دارایی دلخواه (ملک، خودرو، سهام و...)',
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
      setBuyPrice(String(assetToEdit.buyPriceAverage));
      setPurchaseDate(assetToEdit.purchaseDate || getTodayJalali());
      setNotes(assetToEdit.notes || '');
    } else {
      // Default to gold 18k
      const template = PRESET_ASSET_TEMPLATES[0];
      setName(template.name);
      setCategory(template.category);
      setSymbol(template.symbol);
      setUnit(template.unit);
      setQuantity(template.defaultQty);
      const mPrice = marketPrices.find((p) => p.symbol === template.symbol);
      setBuyPrice(mPrice ? String(mPrice.priceToman) : '4450000');
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
      setBuyPrice(String(mPrice.priceToman));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {assetToEdit ? 'ویرایش دارایی' : 'ثبت دارایی جدید در سبد سرمایه‌گذاری'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                طلا، مسکوکات، ارزهای کاغذی یا دیجیتال را به پرتفوی خود اضافه کنید
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

        {/* Quick Template Chips (Only for new assets) */}
        {!assetToEdit && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span>{tmpl.name.split(' ')[0]} {tmpl.name.split(' ')[1] || ''}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Asset Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              عنوان دارایی:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً طلای ۱۸ عیار، سکه امامی، دلار نقدی..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Category & Unit in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                دسته‌بندی:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="gold">طلا و مسکوکات طلا</option>
                <option value="coin">انواع سکه بهار آزادی</option>
                <option value="currency">ارزهای خارجی (دلار، یورو...)</option>
                <option value="crypto">ارز دیجیتال (تتر، بیت‌کوین...)</option>
                <option value="custom">سایر دارایی‌ها / سفارشی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                واحد سنجش:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="گرم، عدد، دلار، تتر..."
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Quantity & Unit Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مقدار / وزن ({unit}):
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={quantity}
                onChange={(e) => setQuantity(sanitizeAmountInput(e.target.value))}
                placeholder="مثلاً 15.5 یا 2"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                میانگین قیمت خرید (تومان):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={buyPrice}
                onChange={(e) => setBuyPrice(sanitizeAmountInput(e.target.value))}
                placeholder="نرخ خرید هر واحد"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr"
              />
            </div>
          </div>

          {/* Purchase Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                تاریخ خرید (شمسی):
              </label>
              <input
                type="text"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                placeholder="1403/06/15"
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden text-center dir-ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                یادداشت یا محل نگهداری:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="صندوق امانات، کیف پول، گاوصندوق..."
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Live Valuation Capsule Preview */}
          {parsedQty > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  محاسبه آنی ارزش بر اساس نرخ زنده بازار:
                </span>
                <span className="text-[10px] text-slate-500">
                  نرخ روز: {formatNumber(currentUnitMarketPrice)} تومان
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">کل هزینه خرید:</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatNumber(totalCost)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ارزش روز کل:</span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatNumber(currentTotalValue)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">سود / زیان:</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      profitLoss >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
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

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!name.trim() || parsedQty <= 0}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{assetToEdit ? 'بروزرسانی دارایی' : 'ذخیره در سبد دارایی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
