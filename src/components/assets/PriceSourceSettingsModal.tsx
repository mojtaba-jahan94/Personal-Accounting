import React, { useState } from 'react';
import {
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
  DollarSign,
  Gem,
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
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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

  // 1. Dedicated Dollar Source settings
  const [dollarSourceType, setDollarSourceType] = useState<'telegram' | 'website' | 'auto'>(
    config.dollarSourceType || config.goldDollarSourceType || 'telegram'
  );
  const [dollarChannel, setDollarChannel] = useState(
    config.dollarTelegramChannel || config.goldDollarTelegramChannel || '@tgju_org'
  );
  const [dollarWebsiteUrl, setDollarWebsiteUrl] = useState(
    config.dollarWebsiteUrl || config.goldDollarWebsiteUrl || 'https://www.tgju.org'
  );
  const [dollarSourceUnit, setDollarSourceUnit] = useState<SourceCurrencyUnit>(
    config.dollarSourceUnit || config.goldDollarSourceUnit || 'toman'
  );
  const [dollarDisplayUnit, setDollarDisplayUnit] = useState<DisplayCurrencyUnit>(
    config.dollarDisplayUnit || config.goldDollarDisplayUnit || 'toman'
  );

  // 2. Dedicated Gold 18K Source settings
  const [goldSourceType, setGoldSourceType] = useState<'telegram' | 'website' | 'auto'>(
    config.goldSourceType || config.goldDollarSourceType || 'telegram'
  );
  const [goldChannel, setGoldChannel] = useState(
    config.goldTelegramChannel || config.goldDollarTelegramChannel || '@tgju_org'
  );
  const [goldWebsiteUrl, setGoldWebsiteUrl] = useState(
    config.goldWebsiteUrl || config.goldDollarWebsiteUrl || 'https://www.tgju.org'
  );
  const [goldSourceUnit, setGoldSourceUnit] = useState<SourceCurrencyUnit>(
    config.goldSourceUnit || config.goldDollarSourceUnit || 'toman'
  );
  const [goldDisplayUnit, setGoldDisplayUnit] = useState<DisplayCurrencyUnit>(
    config.goldDisplayUnit || config.goldDollarDisplayUnit || 'toman'
  );

  // 3. General source settings for other prices (default: tgju.org)
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
      // Dollar
      dollarSourceType,
      dollarTelegramChannel: dollarChannel.trim(),
      dollarWebsiteUrl: dollarWebsiteUrl.trim(),
      dollarSourceUnit,
      dollarDisplayUnit,

      // Gold
      goldSourceType,
      goldTelegramChannel: goldChannel.trim(),
      goldWebsiteUrl: goldWebsiteUrl.trim(),
      goldSourceUnit,
      goldDisplayUnit,

      // Legacy compatibility
      goldDollarSourceType: dollarSourceType,
      goldDollarTelegramChannel: dollarChannel.trim(),
      goldDollarWebsiteUrl: dollarWebsiteUrl.trim(),
      goldDollarSourceUnit: dollarSourceUnit,
      goldDollarDisplayUnit: dollarDisplayUnit,

      // General market
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
      dollarSourceType,
      dollarTelegramChannel: dollarChannel.trim(),
      dollarWebsiteUrl: dollarWebsiteUrl.trim(),
      dollarSourceUnit,
      dollarDisplayUnit,

      goldSourceType,
      goldTelegramChannel: goldChannel.trim(),
      goldWebsiteUrl: goldWebsiteUrl.trim(),
      goldSourceUnit,
      goldDisplayUnit,

      generalMarketSourceUrl: generalMarketSourceUrl.trim() || 'https://www.tgju.org',
      generalSourceUnit,
    };

    try {
      const result = await fetchLiveMarketRates(tempConfig, marketPrices);
      if (result.success && result.updatedPrices.length > 0) {
        setTestResult({
          tested: true,
          success: true,
          message: `ارتباط با موفقیت انجام شد! (${result.sourceLabel}): ${result.message}`,
        });
      } else {
        setTestResult({
          tested: true,
          success: false,
          message: result.message || 'خطا در برقراری ارتباط با منابع تعیین‌شده.',
        });
      }
    } catch {
      setTestResult({
        tested: true,
        success: false,
        message: 'خطای غیرمنتظره در ارتباط با منبع داده.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیمات منابع قیمت بازار"
      subtitle="تعیین کانال‌های مجزای طلا و دلار، تبدیل واحد تومان/ریال و شخصی‌سازی اقلام"
      size="xl"
    >
      <form id="price-source-form" onSubmit={handleSave} className="space-y-4">
        {/* SECTION 1: DEDICATED DOLLAR SOURCE */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <DollarSign className="w-4 h-4" />
              <span>۱. منبع اختصاصی دلار آمریکا (USD)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              کانال دلار
            </span>
          </div>

          {/* Source Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDollarSourceType('telegram')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                dollarSourceType === 'telegram'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>کانال تلگرام</span>
            </button>

            <button
              type="button"
              onClick={() => setDollarSourceType('website')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                dollarSourceType === 'website'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>آدرس سایت</span>
            </button>

            <button
              type="button"
              onClick={() => setDollarSourceType('auto')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                dollarSourceType === 'auto'
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>صرافی و بازار</span>
            </button>
          </div>

          {/* Telegram Channel Input */}
          {dollarSourceType === 'telegram' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-fintech-text-primary">
                آیدی یا لینک کانال تلگرام برای قیمت دلار:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dollarChannel}
                  onChange={(e) => setDollarChannel(e.target.value)}
                  placeholder="مثلاً @dollar_live یا @bonbast"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white text-left pl-8 outline-none focus:border-blue-500/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-text-muted text-xs">
                  @
                </span>
              </div>
            </div>
          )}

          {/* Website URL Input */}
          {dollarSourceType === 'website' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-fintech-text-primary">
                آدرس اینترنتی سایت برای استعلام نرخ دلار:
              </label>
              <input
                type="url"
                value={dollarWebsiteUrl}
                onChange={(e) => setDollarWebsiteUrl(e.target.value)}
                placeholder="https://www.tgju.org"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white text-left outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          {/* Currency Conversion for Dollar */}
          <div className="p-3 rounded-xl bg-black/20 border border-emerald-500/20 space-y-2">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>واحد پولی کانال دلار و نحوه نمایش در برنامه:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-fintech-text-muted block">واحد اعلامی در کانال دلار:</span>
                <select
                  value={dollarSourceUnit}
                  onChange={(e) => setDollarSourceUnit(e.target.value as SourceCurrencyUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121215] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="toman">تومان (مثلاً 62,500)</option>
                  <option value="rial">ریال (مثلاً 625,000)</option>
                  <option value="k_toman">هزار تومان / کا (مثلاً 62.5)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-fintech-text-muted block">واحد ذخیره در سیستم:</span>
                <select
                  value={dollarDisplayUnit}
                  onChange={(e) => setDollarDisplayUnit(e.target.value as DisplayCurrencyUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121215] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="toman">تومان (استاندارد برنامه)</option>
                  <option value="rial">ریال (تومان × ۱۰)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DEDICATED GOLD 18K SOURCE */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Gem className="w-4 h-4" />
              <span>۲. منبع اختصاصی طلای ۱۸ عیار</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              کانال طلا
            </span>
          </div>

          {/* Source Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setGoldSourceType('telegram')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                goldSourceType === 'telegram'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>کانال تلگرام</span>
            </button>

            <button
              type="button"
              onClick={() => setGoldSourceType('website')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                goldSourceType === 'website'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>آدرس سایت</span>
            </button>

            <button
              type="button"
              onClick={() => setGoldSourceType('auto')}
              className={`p-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                goldSourceType === 'auto'
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-white/[0.04] text-fintech-text-muted border-white/10 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>نرخ عمومی بازار</span>
            </button>
          </div>

          {/* Telegram Channel Input */}
          {goldSourceType === 'telegram' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-fintech-text-primary">
                آیدی یا لینک کانال تلگرام برای قیمت طلای ۱۸ عیار:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={goldChannel}
                  onChange={(e) => setGoldChannel(e.target.value)}
                  placeholder="مثلاً @tala_live یا @talanews"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white text-left pl-8 outline-none focus:border-amber-500/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-text-muted text-xs">
                  @
                </span>
              </div>
            </div>
          )}

          {/* Website URL Input */}
          {goldSourceType === 'website' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-fintech-text-primary">
                آدرس اینترنتی سایت برای استعلام قیمت طلا:
              </label>
              <input
                type="url"
                value={goldWebsiteUrl}
                onChange={(e) => setGoldWebsiteUrl(e.target.value)}
                placeholder="https://www.tgju.org"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white text-left outline-none focus:border-amber-500/50"
              />
            </div>
          )}

          {/* Currency Conversion for Gold */}
          <div className="p-3 rounded-xl bg-black/20 border border-amber-500/20 space-y-2">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>واحد پولی کانال طلا و نحوه ذخیره:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-fintech-text-muted block">واحد اعلامی در کانال طلا:</span>
                <select
                  value={goldSourceUnit}
                  onChange={(e) => setGoldSourceUnit(e.target.value as SourceCurrencyUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121215] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="toman">تومان (مثلاً 4,450,000)</option>
                  <option value="rial">ریال (مثلاً 44,500,000)</option>
                  <option value="k_toman">هزار تومان (مثلاً 4,450)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-fintech-text-muted block">واحد ذخیره در سیستم:</span>
                <select
                  value={goldDisplayUnit}
                  onChange={(e) => setGoldDisplayUnit(e.target.value as DisplayCurrencyUnit)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121215] border border-white/10 text-xs font-bold text-white outline-none"
                >
                  <option value="toman">تومان (استاندارد برنامه)</option>
                  <option value="rial">ریال (تومان × ۱۰)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: GENERAL MARKET SOURCE */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Globe className="w-4 h-4 text-violet-400" />
              <span>۳. منبع سایر قیمت‌ها (سکه، انس، ارزهای دیگر)</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-fintech-text-primary">
                آدرس سایت برای سایر نرخ‌ها:
              </label>
              <button
                type="button"
                onClick={() => setGeneralMarketSourceUrl('https://www.tgju.org')}
                className="text-[10px] font-bold text-violet-400 hover:underline flex items-center gap-1"
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
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white text-left outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* SECTION 4: TOGGLE ITEMS ON / OFF */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <span className="text-xs font-bold text-white block">
                ۴. شخصی‌سازی اقلام نرخ‌ها (روشن / خاموش)
              </span>
              <span className="text-[10px] text-fintech-text-muted">
                اقلام مورد نظر برای نمایش و بروزرسانی خودکار را انتخاب نمایید.
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
                  className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between ${
                    isEnabled
                      ? 'bg-violet-500/10 border-violet-500/30 text-white shadow-xs'
                      : 'bg-white/[0.02] border-white/5 text-fintech-text-muted opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="font-bold text-xs block truncate">{item.name}</span>
                    <span className="text-[9px] font-mono uppercase text-fintech-text-muted">
                      {item.symbol} {isPrimary && '⭐'}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isEnabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-fintech-text-muted" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: AUTO REFRESH & LIVE TEST */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">
                ۵. بازه به‌روزرسانی خودکار نرخ‌ها
              </span>
              <span className="text-[10px] text-fintech-text-muted">
                در صورت باز بودن برنامه، نرخ‌ها در پس‌زمینه دریافت می‌شوند
              </span>
            </div>

            <select
              value={autoRefreshMins}
              onChange={(e) => setAutoRefreshMins(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-[#121215] border border-white/10 text-xs font-bold text-white outline-none"
            >
              <option value={0}>دستی (فقط با کلیک روی رفرش)</option>
              <option value={1}>هر ۱ دقیقه</option>
              <option value={5}>هر ۵ دقیقه (پیشنهادی)</option>
              <option value={15}>هر ۱۵ دقیقه</option>
              <option value={30}>هر ۳۰ دقیقه</option>
            </select>
          </div>

          {/* Test result alert */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
          >
            {isTesting ? 'در حال تست...' : 'تست اتصال به منابع'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              ذخیره تنظیمات
            </Button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};
