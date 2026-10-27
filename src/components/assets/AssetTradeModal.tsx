import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={`معامله: ${asset.name}`}
      subtitle={`موجودی فعلی: ${formatNumber(asset.quantity)} ${asset.unit}`}
      size="md"
    >
      <form id="trade-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Trade Type Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/30 border border-white/5">
          <button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tradeType === 'buy'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-fintech-text-muted hover:text-white'
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
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-fintech-text-muted hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>فروش دارایی (-)</span>
          </button>
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-fintech-text-primary">
              مقدار معامله ({asset.unit}): <span className="text-rose-400">*</span>
            </label>
            {tradeType === 'sell' && (
              <button
                type="button"
                onClick={() => setQuantity(String(asset.quantity))}
                className="text-[10px] font-bold text-violet-400 hover:underline"
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/50 transition text-center"
          />
        </div>

        {/* Unit Price */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-fintech-text-primary">
            قیمت هر {asset.unit} در معامله (تومان): <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            value={unitPrice}
            onChange={(e) => setUnitPrice(formatAmountInput(sanitizeAmountInput(e.target.value)))}
            placeholder="قیمت واحد به تومان"
            dir="ltr"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/50 transition text-center"
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
            <label className="text-xs font-bold text-fintech-text-primary">
              توضیحات:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="صرافی، شخص، دلیل..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none focus:border-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Trade Summary Pill */}
        {parsedQty > 0 && parsedUnitPrice > 0 && (
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
              tradeType === 'buy'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex justify-between items-center font-bold">
              <span>مبلغ کل معامله:</span>
              <span className="font-mono font-black text-sm">
                {formatNumber(totalAmount)} تومان
              </span>
            </div>

            {totalAmount > 0 && (
              <div className="text-[11px] font-bold pt-1.5 border-t border-white/5 text-center">
                {numberToPersianWords(totalAmount, 'toman')}
              </div>
            )}

            {tradeType === 'sell' && (
              <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[11px]">
                <span>سود محقق شده این فروش:</span>
                <span
                  className={`font-mono font-bold ${
                    realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-fintech-text-primary">
              <input
                type="checkbox"
                checked={linkToAccount}
                onChange={(e) => setLinkToAccount(e.target.checked)}
                className="rounded text-violet-500 accent-violet-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold outline-none focus:border-violet-500/50 text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-[#121215]">
                      {acc.name} — موجودی: {formatNumber(acc.balance)} تومان
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

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
            variant={tradeType === 'buy' ? 'primary' : 'danger'}
            disabled={parsedQty <= 0 || parsedUnitPrice <= 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {tradeType === 'buy' ? 'ثبت خرید دارایی' : 'ثبت فروش دارایی'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
