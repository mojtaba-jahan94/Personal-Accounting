import React, { useState } from 'react';
import {
  X,
  Globe,
  Send,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ArrowRightLeft,
  Coins,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
} from 'lucide-react';
import {
  PriceSourceConfig,
  MarketPriceItem,
  SourceCurrencyUnit,
  DisplayCurrencyUnit,
} from '../../types';
import { fetchLiveMarketRates } from '../../services/marketPriceService';

interface PriceSourceSettingsModalProps {
  isOpen: boolean;
  config: PriceSourceConfig;
  marketPrices: MarketPriceItem[];
  onClose: () => void;
  onSaveConfig: (cfg: Partial<PriceSourceConfig>) => void;
  onToggleItem: (symbol: string) => void;
  onRefreshNow: () => Promise<{ success: boolean; message: string }>;
}

export const PriceSourceSettingsModal: React.FC<PriceSourceSettingsModalProps> = ({
  isOpen,
  config,
  marketPrices,
  onClose,
  onSaveConfig,
  onToggleItem,
  onRefreshNow,
}) => {
  if (!isOpen) return null;

  // Dedicated Dollar & Gold Source settings
  const [goldDollarSourceType, setGoldDollarSourceType] = useState<'telegram' | 'website' | 'auto'>(
    config.goldDollarSourceType || 'telegram'
  );
  const [goldDollarChannel, setGoldDollarChannel] = useState(
    config.goldDollarTelegramChannel || '@tgju_org'
  );
  const [goldDollarWebsiteUrl, setGoldDollarWebsiteUrl] = useState(
    config.goldDollarWebsiteUrl || 'https://www.tgju.org'
  );
  const [goldDollarSourceUnit, setGoldDollarSourceUnit] = useState<SourceCurrencyUnit>(
    config.goldDollarSourceUnit || 'toman'
  );
  const [goldDollarDisplayUnit, setGoldDollarDisplayUnit] = useState<DisplayCurrencyUnit>(
    config.goldDollarDisplayUnit || 'toman'
  );

  // General source settings for other prices (default: tgju.org)
  const [generalMarketSourceUrl, setGeneralMarketSourceUrl] = useState(
    config.generalMarketSourceUrl || 'https://www.tgju.org'
  );
  const [generalSourceUnit, setGeneralSourceUnit] = useState<SourceCurrencyUnit>(
    config.generalSourceUnit || 'toman'
  );

  const [autoRefreshMins, setAutoRefreshMins] = useState(config.autoRefreshMinutes ?? 5);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      goldDollarSourceType,
      goldDollarTelegramChannel: goldDollarChannel.trim(),
      goldDollarWebsiteUrl: goldDollarWebsiteUrl.trim(),
      goldDollarSourceUnit,
      goldDollarDisplayUnit,
      generalMarketSourceUrl: generalMarketSourceUrl.trim() || 'https://www.tgju.org',
      generalSourceUnit,
      autoRefreshMinutes: Number(autoRefreshMins),
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const tempConfig: PriceSourceConfig = {
      ...config,
      goldDollarSourceType,
      goldDollarTelegramChannel: goldDollarChannel.trim(),
      goldDollarWebsiteUrl: goldDollarWebsiteUrl.trim(),
      goldDollarSourceUnit,
      goldDollarDisplayUnit,
      generalMarketSourceUrl: generalMarketSourceUrl.trim() || 'https://www.tgju.org',
      generalSourceUnit,
    };

    const res = await fetchLiveMarketRates(tempConfig, marketPrices);
    setIsTesting(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                تنظیمات منابع قیمت (دلار، طلا و سایت tgju.org)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                شخصی‌سازی منبع اعلامی، تبدیل تومان/ریال و فعال/غیرفعال‌سازی اقلام بازار
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

        <form onSubmit={handleSave} className="space-y-5">
          {/* SECTION 1: DEDICATED DOLLAR & GOLD SOURCE */}
          <div className="p-4 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-900/50 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span>۱. سورس اختصاصی به‌روزرسانی دلار آمریکا و طلای ۱۸ عیار</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                اولویت اصلی
              </span>
            </div>

            {/* Source Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGoldDollarSourceType('telegram')}
                className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldDollarSourceType === 'telegram'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>کانال تلگرام</span>
              </button>

              <button
                type="button"
                onClick={() => setGoldDollarSourceType('website')}
                className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldDollarSourceType === 'website'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>آدرس سایت</span>
              </button>

              <button
                type="button"
                onClick={() => setGoldDollarSourceType('auto')}
                className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldDollarSourceType === 'auto'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>صرافی و بازار آزاد</span>
              </button>
            </div>

            {/* Telegram Channel Input */}
            {goldDollarSourceType === 'telegram' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  آیدی یا لینک کانال تلگرام برای قیمت دلار و طلا:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={goldDollarChannel}
                    onChange={(e) => setGoldDollarChannel(e.target.value)}
                    placeholder="مثلاً @tgju_org یا @bonbast"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white text-left dir-ltr pl-8 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    @
                  </span>
                </div>
              </div>
            )}

            {/* Website URL Input */}
            {goldDollarSourceType === 'website' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  آدرس اینترنتی سایت برای استعلام نرخ طلا و دلار:
                </label>
                <input
                  type="url"
                  value={goldDollarWebsiteUrl}
                  onChange={(e) => setGoldDollarWebsiteUrl(e.target.value)}
                  placeholder="https://www.tgju.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white text-left dir-ltr focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            )}

            {/* CURRENCY CONVERSION (تومان اعلامی ولی به ریال نشون بده یا برعکس) */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>تنظیم واحد پولی سورس و نحوه نمایش در برنامه:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Source Unit */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">واحد قیمت در کانال/سایت:</span>
                  <select
                    value={goldDollarSourceUnit}
                    onChange={(e) => setGoldDollarSourceUnit(e.target.value as SourceCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="toman">تومان (مثلاً ۹۳,۴۰۰ اعلام می‌کند)</option>
                    <option value="rial">ریال (مثلاً ۹۳۴,۰۰۰ اعلام می‌کند)</option>
                    <option value="auto">تشخیص خودکار بر اساس بازه عددی</option>
                  </select>
                </div>

                {/* Display Unit */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">واحد نمایش در این برنامه:</span>
                  <select
                    value={goldDollarDisplayUnit}
                    onChange={(e) => setGoldDollarDisplayUnit(e.target.value as DisplayCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="toman">نمایش به تومان (تومان)</option>
                    <option value="rial">نمایش به ریال (ریال - ۱۰ برابر)</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-amber-500/5 p-2 rounded-lg">
                💡 <span className="font-bold">مثال:</span> اگر کانال قیمت را به{' '}
                <span className="text-amber-600 dark:text-amber-400 font-bold">تومان</span> اعلام کند،
                شما می‌توانید انتخاب کنید که در برنامه به{' '}
                <span className="text-amber-600 dark:text-amber-400 font-bold">ریال</span> نمایش داده شود
                یا برعکس.
              </div>
            </div>
          </div>

          {/* SECTION 2: GENERAL MARKET SOURCE (tgju.org editable) */}
          <div className="p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>۲. سورس برای بقیه قیمت‌ها (پیش‌فرض: سایت tgju.org با قابلیت تغییر)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  آدرس سایت برای سایر نرخ‌ها (سکه، انس، یورو، درهم و...):
                </label>
                <button
                  type="button"
                  onClick={() => setGeneralMarketSourceUrl('https://www.tgju.org')}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  بازنشانی به tgju.org
                </button>
              </div>
              <input
                type="url"
                value={generalMarketSourceUrl}
                onChange={(e) => setGeneralMarketSourceUrl(e.target.value)}
                placeholder="https://www.tgju.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white text-left dir-ltr focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* SECTION 3: TOGGLE ITEMS ON / OFF (شخصی سازی اقلام) */}
          <div className="p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  ۳. شخصی‌سازی اقلام نرخ‌ها (روشن / خاموش)
                </span>
                <span className="text-[10px] text-slate-400">
                  دلار و طلای ۱۸ عیار فعال هستند؛ بقیه گزینه‌ها خاموش هستند و به دلخواه قابل روشن شدن می‌باشند.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {marketPrices.map((item) => {
                const isEnabled = item.isEnabled !== false;
                const isPrimary = item.symbol === 'usd' || item.symbol === 'gold_18k';

                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => onToggleItem(item.symbol)}
                    className={`p-2.5 rounded-2xl border text-right transition flex items-center justify-between ${
                      isEnabled
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 text-slate-900 dark:text-white shadow-2xs'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-400 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="font-bold text-xs block truncate">{item.name}</span>
                      <span className="text-[9px] font-mono uppercase text-slate-400">
                        {item.symbol} {isPrimary && '⭐'}
                      </span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isEnabled
                          ? 'bg-amber-500 border-amber-600 text-slate-950'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isEnabled && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: AUTO REFRESH INTERVAL */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                بازه زمانی به‌روزرسانی خودکار:
              </span>
              <span className="text-[10px] text-slate-400">استعلام خودکار سورس در پس‌زمینه</span>
            </div>
            <select
              value={autoRefreshMins}
              onChange={(e) => setAutoRefreshMins(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value={0}>دستی (فقط با کلیک)</option>
              <option value={1}>هر ۱ دقیقه</option>
              <option value={5}>هر ۵ دقیقه (پیش‌فرض)</option>
              <option value={15}>هر ۱۵ دقیقه</option>
              <option value={30}>هر ۳۰ دقیقه</option>
            </select>
          </div>

          {/* SECTION 5: LIVE TEST BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'در حال استعلام نرخ‌ها از سورس...' : 'تست استعلام نرخ از سورس انتخابی'}</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ذخیره تنظیمات سورس و شخصی‌سازی</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
