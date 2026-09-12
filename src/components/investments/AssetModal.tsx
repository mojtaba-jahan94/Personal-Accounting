import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AssetHolding, AssetType } from '../../types';
import { getTodayJalali } from '../../utils/jalali';
import { formatCurrency, numberToWordsPersian } from '../../utils/formatters';
import { X, Check, TrendingUp, Sparkles } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAsset?: AssetHolding | null;
}

const PRESET_ASSET_TEMPLATES = [
  { name: 'طلای ۱۸ عیار', type: 'gold_18k' as AssetType, unitName: 'گرم', symbol: 'gold_18k' },
  { name: 'سکه تمام طرح جدید (امامی)', type: 'gold_coin' as AssetType, unitName: 'عدد', symbol: 'coin_emami' },
  { name: 'نیم سکه بهار آزادی', type: 'gold_coin' as AssetType, unitName: 'عدد', symbol: 'coin_half' },
  { name: 'ربع سکه بهار آزادی', type: 'gold_coin' as AssetType, unitName: 'عدد', symbol: 'coin_quarter' },
  { name: 'دلار آمریکا', type: 'currency' as AssetType, unitName: 'دلار', symbol: 'usd' },
  { name: 'تتر دیجیتال (USDT)', type: 'crypto' as AssetType, unitName: 'تتر', symbol: 'tether' },
  { name: 'یورو اروپا', type: 'currency' as AssetType, unitName: 'یورو', symbol: 'eur' },
  { name: 'درهم امارات', type: 'currency' as AssetType, unitName: 'درهم', symbol: 'aed' },
  { name: 'بیت‌کوین (BTC)', type: 'crypto' as AssetType, unitName: 'BTC', symbol: 'btc' },
  { name: 'سایر دارایی‌ها / سهام', type: 'stock_other' as AssetType, unitName: 'واحد', symbol: '' },
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  initialAsset,
}) => {
  const { addAsset, updateAsset, marketRates, currency, accounts } = useFinance();

  const [name, setName] = useState(PRESET_ASSET_TEMPLATES[0].name);
  const [type, setType] = useState<AssetType>('gold_18k');
  const [marketSymbol, setMarketSymbol] = useState<string>('gold_18k');
  const [amount, setAmount] = useState('');
  const [unitName, setUnitName] = useState('گرم');
  const [inputUnit, setInputUnit] = useState<'toman' | 'rial'>(currency);
  const [buyPrice, setBuyPrice] = useState('');
  const [buyFee, setBuyFee] = useState('');
  const [deductFromAccount, setDeductFromAccount] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [buyDate, setBuyDate] = useState(getTodayJalali());
  const [notes, setNotes] = useState('');

  const handleUnitToggle = (newUnit: 'toman' | 'rial') => {
    if (newUnit === inputUnit) return;
    setInputUnit(newUnit);
    const numBuy = parseFloat(buyPrice);
    if (!isNaN(numBuy) && numBuy > 0) {
      setBuyPrice(newUnit === 'rial' ? Math.round(numBuy * 10).toString() : Math.round(numBuy / 10).toString());
    }
    const numCur = parseFloat(currentPrice);
    if (!isNaN(numCur) && numCur > 0) {
      setCurrentPrice(newUnit === 'rial' ? Math.round(numCur * 10).toString() : Math.round(numCur / 10).toString());
    }
    const numFee = parseFloat(buyFee);
    if (!isNaN(numFee) && numFee > 0) {
      setBuyFee(newUnit === 'rial' ? Math.round(numFee * 10).toString() : Math.round(numFee / 10).toString());
    }
  };

  // Handle template selection and auto-fill current market price
  const handleTemplateChange = (templateName: string) => {
    const t = PRESET_ASSET_TEMPLATES.find(x => x.name === templateName);
    if (t) {
      setName(t.name);
      setType(t.type);
      setUnitName(t.unitName);
      setMarketSymbol(t.symbol);

      if (t.symbol) {
        const rate = marketRates.find(r => r.id === t.symbol);
        if (rate) {
          const formatted = inputUnit === 'rial' ? rate.priceToman * 10 : rate.priceToman;
          setCurrentPrice(formatted.toString());
          if (!buyPrice) setBuyPrice(formatted.toString());
        }
      }
    }
  };

  useEffect(() => {
    setInputUnit(currency);
    const isRial = currency === 'rial';
    if (initialAsset) {
      setName(initialAsset.name);
      setType(initialAsset.type);
      setMarketSymbol(initialAsset.marketSymbol || '');
      setAmount(initialAsset.amount.toString());
      setUnitName(initialAsset.unitName);
      setBuyPrice(isRial ? (initialAsset.buyPrice * 10).toString() : initialAsset.buyPrice.toString());
      setBuyFee(initialAsset.buyFee ? (isRial ? (initialAsset.buyFee * 10).toString() : initialAsset.buyFee.toString()) : '');
      setCurrentPrice(isRial ? (initialAsset.currentPrice * 10).toString() : initialAsset.currentPrice.toString());
      setBuyDate(initialAsset.buyDate || getTodayJalali());
      setNotes(initialAsset.notes || '');
      setDeductFromAccount(false);
    } else {
      const defaultT = PRESET_ASSET_TEMPLATES[0];
      setName(defaultT.name);
      setType(defaultT.type);
      setUnitName(defaultT.unitName);
      setMarketSymbol(defaultT.symbol);
      setAmount('');
      setBuyFee('');
      setDeductFromAccount(false);
      const defaultRate = marketRates.find(r => r.id === defaultT.symbol);
      const rawPrice = defaultRate ? defaultRate.priceToman : 4520000;
      const priceStr = (isRial ? rawPrice * 10 : rawPrice).toString();
      setBuyPrice(priceStr);
      setCurrentPrice(priceStr);
      setBuyDate(getTodayJalali());
      setNotes('');
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [initialAsset, isOpen, marketRates, accounts, currency]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const numCurrentPrice = parseFloat(currentPrice) || 0;
  const numBuyPrice = parseFloat(buyPrice) || 0;
  const numBuyFee = parseFloat(buyFee) || 0;
  const totalValue = numAmount * numCurrentPrice;
  const totalCost = numAmount * numBuyPrice + numBuyFee;
  const profitLoss = totalValue - totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || numAmount <= 0) {
      alert('لطفاً نام دارایی و مقدار معتبر را وارد کنید.');
      return;
    }

    const canonicalBuyPrice = inputUnit === 'rial' ? Math.round(numBuyPrice / 10) : numBuyPrice;
    const canonicalCurrentPrice = inputUnit === 'rial' ? Math.round(numCurrentPrice / 10) : numCurrentPrice;
    const canonicalBuyFee = inputUnit === 'rial' ? Math.round(numBuyFee / 10) : numBuyFee;

    const assetData = {
      name: name.trim(),
      type,
      marketSymbol: marketSymbol || undefined,
      amount: numAmount,
      unitName: unitName.trim() || 'واحد',
      buyPrice: canonicalBuyPrice,
      buyFee: canonicalBuyFee > 0 ? canonicalBuyFee : undefined,
      currentPrice: canonicalCurrentPrice > 0 ? canonicalCurrentPrice : canonicalBuyPrice,
      buyDate: buyDate.trim() || getTodayJalali(),
      notes: notes.trim() || undefined,
    };

    if (initialAsset) {
      updateAsset({ ...assetData, id: initialAsset.id });
    } else {
      addAsset(assetData, deductFromAccount ? selectedAccountId : undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md liquid-glass-card p-5 sm:p-6 my-8 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {initialAsset ? 'ویرایش دارایی سرمایه‌گذاری' : 'افزودن دارایی جدید به سبد'}
              </h3>
              <p className="text-[11px] text-slate-500">طلا، سکه، دلار، تتر، بورس یا سایر دارایی‌ها</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Preset Asset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              انتخاب نوع دارایی
            </label>
            <select
              value={name}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              {PRESET_ASSET_TEMPLATES.map(t => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.unitName})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Name (if other) */}
          {type === 'stock_other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                نام دلخواه دارایی
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: سهام فولاد، ملک تجاری..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          )}

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                مقدار / تعداد
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثلاً: 10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                واحد سنجش
              </label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="گرم، عدد، سهم..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          {/* Buy Price and Current Price per unit + Unit Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مبالغ و نرخ‌های دارایی:
              </span>
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleUnitToggle('toman')}
                  className={`px-2.5 py-0.5 rounded-lg transition ${
                    inputUnit === 'toman'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  تومان
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('rial')}
                  className={`px-2.5 py-0.5 rounded-lg transition ${
                    inputUnit === 'rial'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  ریال
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  قیمت خرید هر واحد ({inputUnit === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder={inputUnit === 'toman' ? 'قیمت خرید به تومان...' : 'قیمت خرید به ریال...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>قیمت روز ({inputUnit === 'toman' ? 'تومان' : 'ریال'})</span>
                  {marketSymbol && (
                    <span className="text-[10px] text-amber-500 font-normal">نرخ بازار</span>
                  )}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder={inputUnit === 'toman' ? 'قیمت روز به تومان...' : 'قیمت روز به ریال...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Buy Fee / Commission */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              کارمزد / اجرت / کمیسیون خرید ({inputUnit === 'toman' ? 'تومان' : 'ریال'}) - اختیاری
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={buyFee}
              onChange={(e) => setBuyFee(e.target.value)}
              placeholder={`مثلاً: ${inputUnit === 'toman' ? '۱۵۰,۰۰۰ تومان' : '۱,۵۰۰,۰۰۰ ریال'}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none"
            />
          </div>

          {/* Deduct from Bank/Cash Account (Only for new purchases) */}
          {!initialAsset && accounts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={deductFromAccount}
                  onChange={(e) => setDeductFromAccount(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>کسر بهای خرید و کارمزد از موجودی حساب بانکی / نقدی</span>
              </label>

              {deductFromAccount && (
                <div className="pt-1.5 space-y-1.5">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    حساب پرداخت‌کننده:
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — موجودی: {formatCurrency(acc.balance, currency)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    مبلغ کل {formatCurrency(inputUnit === 'rial' ? Math.round(totalCost / 10) : totalCost, currency)} از این حساب کسر و تراکنش هزینه ثبت خواهد شد.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Live Valuation Capsule */}
          {numAmount > 0 && numCurrentPrice > 0 && (
            <div className="p-3.5 rounded-2xl liquid-glass border border-indigo-200/40 dark:border-indigo-800/40 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ارزش کل روز:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {formatCurrency(inputUnit === 'rial' ? Math.round(totalValue / 10) : totalValue, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">سود / زیان تخمینی:</span>
                <span
                  className={`font-black ${
                    profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {profitLoss >= 0 ? '+ ' : ''}
                  {formatCurrency(inputUnit === 'rial' ? Math.round(profitLoss / 10) : profitLoss, currency)} (
                  {totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(1) : 0}٪)
                </span>
              </div>
            </div>
          )}

          {/* Buy Date and Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                تاریخ خرید شمسی
              </label>
              <input
                type="text"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                placeholder="1403/06/01"
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                یادداشت (اختیاری)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="فاکتور، کد پیگیری..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{initialAsset ? 'ذخیره تغییرات دارایی' : 'ثبت دارایی در سبد'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
