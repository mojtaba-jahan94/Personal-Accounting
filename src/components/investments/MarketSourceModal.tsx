import React, { useState } from 'react';
import {
  X,
  Radio,
  Send,
  Globe,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { MarketSourceConfig } from '../../types';
import {
  getMarketSourceConfig,
  saveMarketSourceConfig,
  sanitizeTelegramChannel,
} from '../../services/marketRates';

interface MarketSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

export const MarketSourceModal: React.FC<MarketSourceModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [config, setConfig] = useState<MarketSourceConfig>(() => getMarketSourceConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    const sanitized: MarketSourceConfig = {
      ...config,
      telegramGoldChannel: sanitizeTelegramChannel(config.telegramGoldChannel) || 'Narkuab',
      telegramUsdChannel: sanitizeTelegramChannel(config.telegramUsdChannel) || 'tahran_sabza',
    };
    saveMarketSourceConfig(sanitized);
    setConfig(sanitized);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 400);
  };

  const handleTestRefresh = async () => {
    setIsTesting(true);
    setTestSuccess(false);
    saveMarketSourceConfig(config);
    await onRefresh();
    const updated = getMarketSourceConfig();
    setConfig(updated);
    setIsTesting(false);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تنظیمات منبع قیمت‌های زنده
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اتصال مستقیم به کانال‌های تلگرام و سایت‌های مرجع بازار ایران
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

        {/* Source Selection Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            انتخاب منبع دریافت داده‌ها:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Auto (Smart Hybrid) */}
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, sourceType: 'auto' }))}
              className={`p-3 rounded-2xl text-right transition border text-xs flex flex-col justify-between ${
                config.sourceType === 'auto'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-sm'
                  : 'liquid-glass border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-400/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-black text-sm">ترکیبی هوشمند</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[11px] opacity-80">
                تلگرام طلا و دلار + TGJU سکه و سایر ارزها
              </span>
            </button>

            {/* Telegram Only */}
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, sourceType: 'telegram' }))}
              className={`p-3 rounded-2xl text-right transition border text-xs flex flex-col justify-between ${
                config.sourceType === 'telegram'
                  ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold shadow-sm'
                  : 'liquid-glass border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-sky-400/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-black text-sm">کانال‌های تلگرام</span>
                <Send className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-[11px] opacity-80">
                استخراج زنده فقط از کانال‌های تلگرامی
              </span>
            </button>

            {/* TGJU Only */}
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, sourceType: 'tgju' }))}
              className={`p-3 rounded-2xl text-right transition border text-xs flex flex-col justify-between ${
                config.sourceType === 'tgju'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                  : 'liquid-glass border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-400/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-black text-sm">سایت TGJU</span>
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[11px] opacity-80">
                شبکه اطلاع‌رسانی طلا و ارز (tgju.org)
              </span>
            </button>
          </div>
        </div>

        {/* Telegram Channels Inputs */}
        <div className="p-4 rounded-2xl liquid-glass border border-slate-200/60 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>کانال‌های تلگرامی مبنای قیمت‌گذاری</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-200/40 dark:bg-white/5 px-2 py-0.5 rounded-lg">
              پشتیبانی از پیش‌نمایش وب عمومی
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gold Channel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>کانال طلای ۱۸ عیار و آبشده:</span>
                <a
                  href={`https://t.me/${config.telegramGoldChannel || 'Narkuab'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-500 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                >
                  <span>مشاهده کانال</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={config.telegramGoldChannel}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, telegramGoldChannel: e.target.value }))
                  }
                  placeholder="Narkuab"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                />
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-mono">@</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                استخراج نرخ #طلا_گرمی و #آبشده_نقدی
              </span>
            </div>

            {/* USD Channel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>کانال دلار آزاد و فردایی تهران:</span>
                <a
                  href={`https://t.me/${config.telegramUsdChannel || 'tahran_sabza'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-500 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                >
                  <span>مشاهده کانال</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={config.telegramUsdChannel}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, telegramUsdChannel: e.target.value }))
                  }
                  placeholder="tahran_sabza"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono liquid-glass border border-slate-300/60 dark:border-white/10 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                />
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-mono">@</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                استخراج نرخ دلار فردایی و آخرین معامله
              </span>
            </div>
          </div>
        </div>

        {/* Telegram Messages Preview */}
        {(config.lastTelegramMessageGold || config.lastTelegramMessageUsd) && (
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>آخرین نمونه پیام‌های خوانده شده از تلگرام:</span>
            </span>

            {config.lastTelegramMessageGold && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-800 dark:text-slate-200">
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  طلای ۱۸ عیار (@{config.telegramGoldChannel}):
                </span>
                <p className="font-mono text-[10px] leading-relaxed line-clamp-2">
                  {config.lastTelegramMessageGold}
                </p>
              </div>
            )}

            {config.lastTelegramMessageUsd && (
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-slate-800 dark:text-slate-200">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">
                  دلار تهران (@{config.telegramUsdChannel}):
                </span>
                <p className="font-mono text-[10px] leading-relaxed line-clamp-2">
                  {config.lastTelegramMessageUsd}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={handleTestRefresh}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-400 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'در حال تست استعلام...' : 'تست استعلام زنده اکنون'}</span>
            {testSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
