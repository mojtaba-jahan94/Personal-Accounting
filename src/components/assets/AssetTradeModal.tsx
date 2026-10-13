import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Asset, AssetTransaction, AssetTransactionType, MarketPriceItem } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { getTodayJalali } from '../../utils/jalali';
import {
  formatNumber,
  parseAmount,
  sanitizeAmountInput,
  formatAmountInput,
  numberToPersianWords,
} from '../../utils/formatters';
import { JalaliDatePicker } from '../common/JalaliDatePicker';

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
  const { accounts } = useFinance();

  if (!isOpen || !asset) return null;

  const [tradeType, setTradeType] = useState<AssetTransactionType>('buy');
  const [quantity, setQuantity] = useState('');

  // Default unit price to current market price
  const matchedMarketItem = marketPrices.find((p) => p.symbol === asset.symbol);
  const defaultUnitPrice = matchedMarketItem ? matchedMarketItem.priceToman : asset.buyPriceAverage;
  const [unitPrice, setUnitPrice] = useState(formatAmountInput(String(defaultUnitPrice)));
  const [date, setDate] = useState(getTodayJalali());
  const [notes, setNotes] = useState('');
  const [linkToAccount, setLinkToAccount] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

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
      accountId: linkToAccount && selectedAccountId ? selectedAccountId : undefined,
    });

    onClose();
  };

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
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                معامله: {asset.name}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                موجودی فعلی: {formatNumber(asset.quantity)} {asset.unit}
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
        <form id="trade-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Trade Type Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#6B7280]/10 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                tradeType === 'buy'
                  ? 'bg-[#2E7D5B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>خرید جدید (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setTradeType('sell')}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                tradeType === 'sell'
                  ? 'bg-[#C0564B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>فروش دارایی (-)</span>
            </button>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                مقدار معامله ({asset.unit}): <span className="text-[#C0564B]">*</span>
              </label>
              {tradeType === 'sell' && (
                <button
                  type="button"
                  onClick={() => setQuantity(String(asset.quantity))}
                  className="text-[10px] font-bold text-[#A68A64] hover:underline"
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
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition text-center"
            />
          </div>

          {/* Unit Price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              قیمت هر {asset.unit} در معامله (تومان): <span className="text-[#C0564B]">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
              placeholder="قیمت واحد به تومان"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition text-center"
            />
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <JalaliDatePicker
                value={date}
                onChange={setDate}
                label="تاریخ معامله"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                توضیحات:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="صرافی، شخص، دلیل..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
              />
            </div>
          </div>

          {/* Trade Summary Pill */}
          {parsedQty > 0 && parsedUnitPrice > 0 && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                tradeType === 'buy'
                  ? 'bg-[#2E7D5B]/10 border-[#2E7D5B]/30 text-[#2E7D5B] dark:text-[#4ADE80]'
                  : 'bg-[#C0564B]/10 border-[#C0564B]/30 text-[#C0564B] dark:text-[#F87171]'
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span>مبلغ کل معامله:</span>
                <span className="font-mono font-black text-sm">
                  {formatNumber(totalAmount)} تومان
                </span>
              </div>

              {totalAmount > 0 && (
                <div className="text-[11px] font-bold pt-1.5 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-center">
                  {numberToPersianWords(totalAmount, 'toman')}
                </div>
              )}

              {tradeType === 'sell' && (
                <div className="flex justify-between items-center pt-1.5 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[11px]">
                  <span>سود محقق شده این فروش:</span>
                  <span
                    className={`font-mono font-bold ${
                      realizedPnl >= 0 ? 'text-[#2E7D5B] dark:text-[#4ADE80]' : 'text-[#C0564B] dark:text-[#F87171]'
                    }`}
                  >
                    {realizedPnl >= 0 ? '+' : ''}
                    {formatNumber(realizedPnl)} تومان
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Optional Bank Account Linking */}
          {accounts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                <input
                  type="checkbox"
                  checked={linkToAccount}
                  onChange={(e) => setLinkToAccount(e.target.checked)}
                  className="rounded text-[#A68A64] focus:ring-[#A68A64]"
                />
                <span>
                  {tradeType === 'buy'
                    ? 'کسر خودکار مبلغ از حساب بانکی (ثبت تراکنش هزینه سرمایه‌گذاری)'
                    : 'واریز خودکار مبلغ به حساب بانکی (ثبت تراکنش درآمد فروش)'}
                </span>
              </label>

              {linkToAccount && (
                <div className="pt-2">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="dark:bg-[#1F2933]">
                        {acc.name} — موجودی: {formatNumber(acc.balance)} تومان
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
            form="trade-form"
            disabled={parsedQty <= 0 || parsedUnitPrice <= 0}
            className={`px-5 py-2.5 rounded-xl text-[#F7F7F2] font-black text-xs shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
              tradeType === 'buy'
                ? 'bg-[#2E7D5B] hover:bg-[#25664a] shadow-[#2E7D5B]/25'
                : 'bg-[#C0564B] hover:bg-[#a6473d] shadow-[#C0564B]/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{tradeType === 'buy' ? 'ثبت خرید دارایی' : 'ثبت فروش دارایی'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
