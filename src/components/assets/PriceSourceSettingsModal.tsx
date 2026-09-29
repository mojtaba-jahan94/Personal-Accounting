import React, { useState } from 'react';
import {
  X,
  Radio,
  Globe,
  Send,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { PriceSourceConfig, PriceSourceMode, MarketPriceItem } from '../../types';
import { fetchLiveMarketRates } from '../../services/marketPriceService';

interface PriceSourceSettingsModalProps {
  isOpen: boolean;
  config: PriceSourceConfig;
  marketPrices: MarketPriceItem[];
  onClose: () => void;
  onSaveConfig: (cfg: Partial<PriceSourceConfig>) => void;
  onRefreshNow: () => Promise<{ success: boolean; message: string }>;
}

export const PriceSourceSettingsModal: React.FC<PriceSourceSettingsModalProps> = ({
  isOpen,
  config,
  marketPrices,
  onClose,
  onSaveConfig,
  onRefreshNow,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<PriceSourceMode>(config.sourceMode);
  const [telegramChannel, setTelegramChannel] = useState(config.telegramChannelOrUrl || '@tgju_org');
  const [telegramBotToken, setTelegramBotToken] = useState(config.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(config.telegramChatId || '');
  const [customApiUrl, setCustomApiUrl] = useState(config.customApiUrl || '');
  const [customApiKey, setCustomApiKey] = useState(config.customApiKey || '');
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
      sourceMode: mode,
      telegramChannelOrUrl: telegramChannel.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
      customApiUrl: customApiUrl.trim(),
      customApiKey: customApiKey.trim(),
      autoRefreshMinutes: Number(autoRefreshMins),
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const tempConfig: PriceSourceConfig = {
      ...config,
      sourceMode: mode,
      telegramChannelOrUrl: telegramChannel.trim(),
      telegramBotToken: telegramBotToken.trim(),
      telegramChatId: telegramChatId.trim(),
      customApiUrl: customApiUrl.trim(),
      customApiKey: customApiKey.trim(),
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
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                تنظیمات منابع قیمت (سورس تلگرام و وب‌سایت)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                مشخص کنید قیمت‌های لحظه‌ای طلا، سکه و دلار از چه مرجعی دریافت و به‌روزرسانی شوند.
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Source Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              منبع فعال به‌روزرسانی نرخ‌ها:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Default Multi-Market */}
              <button
                type="button"
                onClick={() => setMode('default_markets')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  mode === 'default_markets'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">سورس بازار و صرافی</span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      mode === 'default_markets'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-400'
                    }`}
                  >
                    {mode === 'default_markets' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  نوبیتکس و نرخ‌های استاندارد بازار آزاد طلا و ارز
                </p>
              </button>

              {/* Option 2: Telegram Channel */}
              <button
                type="button"
                onClick={() => setMode('telegram')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  mode === 'telegram'
                    ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 text-sky-900 dark:text-sky-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-sky-500 -rotate-45" />
                    سورس تلگرام
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      mode === 'telegram'
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-slate-400'
                    }`}
                  >
                    {mode === 'telegram' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  خواندن آخرین پیام مظنه از کانال یا بات تلگرامی
                </p>
              </button>

              {/* Option 3: Custom API / Website */}
              <button
                type="button"
                onClick={() => setMode('custom_api')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  mode === 'custom_api'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    سورس وب / API
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      mode === 'custom_api'
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-slate-400'
                    }`}
                  >
                    {mode === 'custom_api' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  اندپوینت سفارشی JSON یا سرور شخصی شما
                </p>
              </button>
            </div>
          </div>

          {/* Telegram Settings Fields */}
          {mode === 'telegram' && (
            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  آیدی یا لینک کانال تلگرام:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={telegramChannel}
                    onChange={(e) => setTelegramChannel(e.target.value)}
                    placeholder="مثلاً: @tgju_org یا t.me/s/bonbast"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 text-left dir-ltr pl-8"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    @
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  سیستم پیام‌های مظنه کانال تلگرام را با الگوریتم هوشمند تحلیل و قیمت‌های طلا و ارز را استخراج می‌کند.
                </p>
              </div>

              <div className="pt-2 border-t border-sky-200/40 dark:border-sky-800/40 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-sky-500" />
                  توکن ربات تلگرام (اختیاری - برای کانال‌های خصوصی):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="Bot Token (مثلاً 123456:ABC...)"
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-900 dark:text-white dir-ltr text-left"
                  />
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Chat ID (مثلاً -100123456789)"
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-900 dark:text-white dir-ltr text-left"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Custom API / Website Settings Fields */}
          {mode === 'custom_api' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  آدرس اینترنتی اندپوینت (Custom JSON Endpoint URL):
                </label>
                <input
                  type="url"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://api.myrates.com/live-rates.json"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-left dir-ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  کلید دسترسی (API Key اختیاری):
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Bearer token or API Key"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white dir-ltr text-left"
                />
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                پاسخ JSON باید شامل کلیدهایی مانند <code className="font-mono text-amber-600">usd</code>،{' '}
                <code className="font-mono text-amber-600">usdt</code>،{' '}
                <code className="font-mono text-amber-600">gold_18k</code> یا{' '}
                <code className="font-mono text-amber-600">coin_emami</code> باشد.
              </p>
            </div>
          )}

          {/* Auto Refresh Interval */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                بازه به‌روزرسانی خودکار نرخ‌ها:
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                استعلام دوره‌ای قیمت‌ها در پس‌زمینه
              </p>
            </div>
            <select
              value={autoRefreshMins}
              onChange={(e) => setAutoRefreshMins(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value={0}>دستی (فقط با کلیک)</option>
              <option value={1}>هر ۱ دقیقه</option>
              <option value={5}>هر ۵ دقیقه (پیش‌فرض)</option>
              <option value={15}>هر ۱۵ دقیقه</option>
              <option value={30}>هر ۳۰ دقیقه</option>
            </select>
          </div>

          {/* Test Source Button & Feedback */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'در حال بررسی اتصال به سورس...' : 'تست دریافت نرخ از سورس انتخابی'}</span>
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
          <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ذخیره تنظیمات سورس</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
