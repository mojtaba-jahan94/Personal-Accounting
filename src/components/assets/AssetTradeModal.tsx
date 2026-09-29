import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Coins,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Asset, AssetTransaction, AssetTransactionType, MarketPriceItem } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatNumber,
  parseAmount,
  sanitizeAmountInput,
} from '../../utils/formatters';

interface AssetTradeModalProps {
  isOpen: boolean;
  asset: Asset | null;
  marketPrices: MarketPriceItem[];
  onClose: () => void;
  onExecuteTrade: (trade: Omit<AssetTransaction, 'id'>) => void;
}

export const AssetTradeModal: React.FC<AssetTradeModalProps> = ({
  isOpen,
  asset,
  marketPrices,
  onClose,
  onExecuteTrade,
}) => {
  if (!isOpen || !asset) return null;

  const [tradeType, setTradeType] = useState<AssetTransactionType>('buy');
  const [quantity, setQuantity] = useState('');

  // Default unit price to current market price
  const matchedMarketItem = marketPrices.find((p) => p.symbol === asset.symbol);
  const defaultUnitPrice = matchedMarketItem ? matchedMarketItem.priceToman : asset.buyPriceAverage;
  const [unitPrice, setUnitPrice] = useState(String(defaultUnitPrice));
  const [date, setDate] = useState(getTodayJalali());
  const [notes, setNotes] = useState('');

  const parsedQty = parseAmount(quantity);
  const parsedUnitPrice = parseAmount(unitPrice);
  const totalAmount = parsedQty * parsedUnitPrice;

  // Realized profit calculation for selling
  const costBasisPerUnit = asset.buyPriceAverage || 0;
  const realizedPnl = tradeType === 'sell' ? (parsedUnitPrice - costBasisPerUnit) * parsedQty : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedQty <= 0 || parsedUnitPrice <= 0) return;

    if (tradeType === 'sell' && parsedQty > asset.quantity) {
      alert(`موجودی شما (${asset.quantity} ${asset.unit}) کمتر از مقدار فروش است.`);
      return;
    }

    onExecuteTrade({
      assetId: asset.id,
      assetName: asset.name,
      type: tradeType,
      quantity: parsedQty,
      unitPrice: parsedUnitPrice,
      totalAmount,
      date,
      notes: notes.trim(),
      realizedPnl: tradeType === 'sell' ? realizedPnl : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              معامله دارایی: {asset.name}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              موجودی فعلی: {formatNumber(asset.quantity)} {asset.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Type Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tradeType === 'buy'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>خرید جدید (+)</span>
          </button>

          <button
            type="button"
            onClick={() => setTradeType('sell')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tradeType === 'sell'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>فروش (-)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quantity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مقدار معامله ({asset.unit}):
              </label>
              {tradeType === 'sell' && (
                <button
                  type="button"
                  onClick={() => setQuantity(String(asset.quantity))}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  فروش کل موجودی ({asset.quantity})
                </button>
              )}
            </div>
            <input
              type="text"
              inputMode="decimal"
              required
              autoFocus
              value={quantity}
              onChange={(e) => setQuantity(sanitizeAmountInput(e.target.value))}
              placeholder="مثلاً 2 یا 5.5"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr"
            />
          </div>

          {/* Unit Price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              قیمت هر {asset.unit} در زمان معامله (تومان):
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(sanitizeAmountInput(e.target.value))}
              placeholder="قیمت واحد به تومان"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr"
            />
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                تاریخ معامله:
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center dir-ltr text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                توضیحات:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="صرافی، شخص، دلیل..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Trade Summary Pill */}
          {parsedQty > 0 && parsedUnitPrice > 0 && (
            <div
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                tradeType === 'buy'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>مبلغ کل معامله:</span>
                <span className="font-mono font-black text-sm">
                  {formatNumber(totalAmount)} تومان
                </span>
              </div>

              {tradeType === 'sell' && (
                <div className="flex justify-between items-center pt-1 border-t border-rose-200/50 dark:border-rose-900/50 text-[11px]">
                  <span>سود محقق شده این فروش:</span>
                  <span
                    className={`font-mono font-bold ${
                      realizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    {realizedPnl >= 0 ? '+' : ''}
                    {formatNumber(realizedPnl)} تومان
                  </span>
                </div>
              )}
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
              disabled={parsedQty <= 0 || parsedUnitPrice <= 0}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                tradeType === 'buy'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{tradeType === 'buy' ? 'ثبت خرید دارایی' : 'ثبت فروش دارایی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
