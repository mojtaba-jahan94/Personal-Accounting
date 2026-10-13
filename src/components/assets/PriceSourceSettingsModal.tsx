import React, { useState } from 'react';
import {
  X,
  Globe,
  Send,
  Sliders,
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

    const res = await fetchLiveMarketRates(tempConfig, marketPrices);
    setIsTesting(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-2">
                تنظیمات منابع قیمت بازار
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                تعیین کانال‌های مجزای طلا و دلار، تبدیل واحد تومان/ریال و شخصی‌سازی اقلام
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
        <form id="price-source-form" onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* SECTION 1: DEDICATED DOLLAR SOURCE */}
          <div className="p-4 rounded-3xl bg-[#2E7D5B]/5 dark:bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2E7D5B]/15 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#2E7D5B] dark:text-[#4ADE80]">
                <DollarSign className="w-4 h-4" />
                <span>۱. منبع اختصاصی دلار آمریکا (USD)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/25">
                کانال دلار
              </span>
            </div>

            {/* Source Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDollarSourceType('telegram')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dollarSourceType === 'telegram'
                    ? 'bg-[#4A6FA5] text-[#F7F7F2] border-[#4A6FA5] shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>کانال تلگرام</span>
              </button>

              <button
                type="button"
                onClick={() => setDollarSourceType('website')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dollarSourceType === 'website'
                    ? 'bg-[#2E7D5B] text-[#F7F7F2] border-[#2E7D5B] shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>آدرس سایت</span>
              </button>

              <button
                type="button"
                onClick={() => setDollarSourceType('auto')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dollarSourceType === 'auto'
                    ? 'bg-[#A68A64] text-[#F7F7F2] border-[#A68A64] shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>صرافی و بازار</span>
              </button>
            </div>

            {/* Telegram Channel Input */}
            {dollarSourceType === 'telegram' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  آیدی یا لینک کانال تلگرام برای قیمت دلار:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dollarChannel}
                    onChange={(e) => setDollarChannel(e.target.value)}
                    placeholder="مثلاً @dollar_live یا @bonbast"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-left pl-8 outline-none focus:border-[#4A6FA5]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">
                    @
                  </span>
                </div>
              </div>
            )}

            {/* Website URL Input */}
            {dollarSourceType === 'website' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  آدرس اینترنتی سایت برای استعلام نرخ دلار:
                </label>
                <input
                  type="url"
                  value={dollarWebsiteUrl}
                  onChange={(e) => setDollarWebsiteUrl(e.target.value)}
                  placeholder="https://www.tgju.org"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-left outline-none focus:border-[#2E7D5B]"
                />
              </div>
            )}

            {/* Currency Conversion for Dollar */}
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#2E7D5B]/20 space-y-2">
              <div className="text-[11px] font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span>واحد پولی کانال دلار و نحوه نمایش در برنامه:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">واحد اعلامی در کانال دلار:</span>
                  <select
                    value={dollarSourceUnit}
                    onChange={(e) => setDollarSourceUnit(e.target.value as SourceCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none"
                  >
                    <option value="toman">تومان (مثلاً ۹۳,۴۰۰ اعلام می‌کند)</option>
                    <option value="rial">ریال (مثلاً ۹۳۴,۰۰۰ اعلام می‌کند)</option>
                    <option value="auto">تشخیص خودکار بر اساس بازه عددی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">واحد نمایش دلار در برنامه:</span>
                  <select
                    value={dollarDisplayUnit}
                    onChange={(e) => setDollarDisplayUnit(e.target.value as DisplayCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none"
                  >
                    <option value="toman">نمایش به تومان (تومان)</option>
                    <option value="rial">نمایش به ریال (ریال - ۱۰ برابر)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DEDICATED GOLD 18K SOURCE */}
          <div className="p-4 rounded-3xl bg-[#A68A64]/5 dark:bg-[#A68A64]/10 border border-[#A68A64]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#A68A64]/15 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#A68A64] dark:text-[#C2A882]">
                <Gem className="w-4 h-4" />
                <span>۲. منبع اختصاصی طلای ۱۸ عیار (Gold 18k)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A68A64]/15 text-[#A68A64] dark:text-[#C2A882] border border-[#A68A64]/25">
                کانال طلا
              </span>
            </div>

            {/* Source Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGoldSourceType('telegram')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldSourceType === 'telegram'
                    ? 'bg-[#4A6FA5] text-[#F7F7F2] border-[#4A6FA5] shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>کانال تلگرام</span>
              </button>

              <button
                type="button"
                onClick={() => setGoldSourceType('website')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldSourceType === 'website'
                    ? 'bg-[#A68A64] text-[#F7F7F2] border-[#A68A64] shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>آدرس سایت</span>
              </button>

              <button
                type="button"
                onClick={() => setGoldSourceType('auto')}
                className={`p-2 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  goldSourceType === 'auto'
                    ? 'bg-[#1F2933] dark:bg-[#6B7280] text-[#F7F7F2] border-transparent shadow-sm'
                    : 'bg-white/60 dark:bg-[#182028]/60 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>مظنه بازار</span>
              </button>
            </div>

            {/* Telegram Channel Input */}
            {goldSourceType === 'telegram' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  آیدی یا لینک کانال تلگرام برای قیمت طلای ۱۸ عیار:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={goldChannel}
                    onChange={(e) => setGoldChannel(e.target.value)}
                    placeholder="مثلاً @tala_tehran یا @tala_channel"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-left pl-8 outline-none focus:border-[#4A6FA5]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">
                    @
                  </span>
                </div>
              </div>
            )}

            {/* Website URL Input */}
            {goldSourceType === 'website' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  آدرس اینترنتی سایت برای استعلام نرخ طلا:
                </label>
                <input
                  type="url"
                  value={goldWebsiteUrl}
                  onChange={(e) => setGoldWebsiteUrl(e.target.value)}
                  placeholder="https://www.tgju.org"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-left outline-none focus:border-[#A68A64]"
                />
              </div>
            )}

            {/* Currency Conversion for Gold */}
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#A68A64]/20 space-y-2">
              <div className="text-[11px] font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#A68A64]" />
                <span>واحد پولی کانال طلا و نحوه نمایش در برنامه:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">واحد اعلامی در کانال طلا:</span>
                  <select
                    value={goldSourceUnit}
                    onChange={(e) => setGoldSourceUnit(e.target.value as SourceCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none"
                  >
                    <option value="toman">تومان (مثلاً ۴,۵۰۰,۰۰۰ اعلام می‌کند)</option>
                    <option value="rial">ریال (مثلاً ۴۵,۰۰۰,۰۰۰ اعلام می‌کند)</option>
                    <option value="auto">تشخیص خودکار بر اساس بازه عددی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB] block">واحد نمایش طلا در برنامه:</span>
                  <select
                    value={goldDisplayUnit}
                    onChange={(e) => setGoldDisplayUnit(e.target.value as DisplayCurrencyUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none"
                  >
                    <option value="toman">نمایش به تومان (تومان)</option>
                    <option value="rial">نمایش به ریال (ریال - ۱۰ برابر)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: GENERAL MARKET SOURCE */}
          <div className="p-4 rounded-3xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-3">
            <div className="flex items-center justify-between border-b border-[#6B7280]/15 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F2933] dark:text-[#F7F7F2]">
                <Globe className="w-4 h-4 text-[#4A6FA5]" />
                <span>۳. منبع سایر قیمت‌ها (سکه، انس، ارزهای دیگر)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  آدرس سایت برای سایر نرخ‌ها:
                </label>
                <button
                  type="button"
                  onClick={() => setGeneralMarketSourceUrl('https://www.tgju.org')}
                  className="text-[10px] font-bold text-[#4A6FA5] hover:underline flex items-center gap-1"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] text-left outline-none focus:border-[#4A6FA5]"
              />
            </div>
          </div>

          {/* SECTION 4: TOGGLE ITEMS ON / OFF */}
          <div className="p-4 rounded-3xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-3">
            <div className="flex items-center justify-between border-b border-[#6B7280]/15 pb-2">
              <div>
                <span className="text-xs font-black text-[#1F2933] dark:text-[#F7F7F2] block">
                  ۴. شخصی‌سازی اقلام نرخ‌ها (روشن / خاموش)
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
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
                    className={`p-2.5 rounded-2xl border text-right transition flex items-center justify-between ${
                      isEnabled
                        ? 'bg-[#A68A64]/10 dark:bg-[#A68A64]/20 border-[#A68A64]/40 text-[#1F2933] dark:text-[#F7F7F2] shadow-xs'
                        : 'bg-white/40 dark:bg-[#182028]/40 border-[#6B7280]/15 text-[#6B7280] dark:text-[#D1D5DB] opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="font-bold text-xs block truncate">{item.name}</span>
                      <span className="text-[9px] font-mono uppercase text-[#6B7280] dark:text-[#D1D5DB]">
                        {item.symbol} {isPrimary && '⭐'}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isEnabled ? (
                        <ToggleRight className="w-5 h-5 text-[#2E7D5B]" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-[#6B7280]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: AUTO REFRESH & LIVE TEST */}
          <div className="p-4 rounded-3xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
                  ۵. بازه به‌روزرسانی خودکار نرخ‌ها
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]">
                  در صورت باز بودن برنامه، نرخ‌ها در پس‌زمینه دریافت می‌شوند
                </span>
              </div>

              <select
                value={autoRefreshMins}
                onChange={(e) => setAutoRefreshMins(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none"
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
                    ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/30'
                    : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/30'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#C0564B] shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'در حال تست...' : 'تست اتصال به منابع'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 font-bold text-xs transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              form="price-source-form"
              className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ذخیره تنظیمات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
