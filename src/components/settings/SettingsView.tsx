import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccentColor, BorderRadius, LightStyle, BackgroundStyle } from '../../types';
import {
  Moon,
  Sun,
  Palette,
  Sparkles,
  Check,
  Smartphone,
  MessageSquareText,
  Gauge,
  Layers,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Maximize2,
  Users,
} from 'lucide-react';
import { SMSAssistantModal } from '../transactions/SMSAssistantModal';
import { PersonManagerModal } from '../contacts/PersonManagerModal';

const ACCENT_COLORS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'indigo', name: 'نیلی کلاسیک', hex: '#6366f1' },
  { id: 'emerald', name: 'زمردی ثروت', hex: '#10b981' },
  { id: 'rose', name: 'یاقوتی لوکس', hex: '#f43f5e' },
  { id: 'amber', name: 'کهربایی طلا', hex: '#f59e0b' },
  { id: 'cyan', name: 'فیروزه‌ای مدرن', hex: '#06b6d4' },
  { id: 'purple', name: 'بنفش امیتیست', hex: '#a855f7' },
];

const LIGHT_STYLES: { id: LightStyle; name: string; desc: string; color: string }[] = [
  { id: 'pure_white', name: 'سفید کریستالی', desc: 'سفید مینیمال و بسیار تمیز', color: '#ffffff' },
  { id: 'frost', name: 'شیشه‌ای یخی', desc: 'استایل مات آبی-یخی با بلور', color: '#ecf3fc' },
  { id: 'warm_cream', name: 'کرم کاغذی گرم', desc: 'بسیار ملایم برای چشم در روز', color: '#f7f3e6' },
  { id: 'soft_slate', name: 'خاکستری مدرن', desc: 'استایل برنامه‌های مالی فین‌تک', color: '#e2e8f0' },
];

const BACKGROUND_STYLES: { id: BackgroundStyle; name: string; desc: string; previewClass: string }[] = [
  { id: 'clean_minimal', name: 'مینیمال تمیز (پیش‌فرض)', desc: 'یکدست و بسیار آرامش‌بخش بدون شلوغی', previewClass: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900' },
  { id: 'subtle_mesh', name: 'مش گرادینت لطیف', desc: 'هاله‌های نوری ملایم در گوشه‌ها', previewClass: 'from-indigo-100 via-sky-100 to-slate-100 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900' },
  { id: 'dot_matrix', name: 'میکروگرید نقطه‌ای', desc: 'طرح نقاط منظم و مهندسی‌شده', previewClass: 'from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-800' },
  { id: 'soft_aurora', name: 'شفق قطبی پاستلی', desc: 'امواج لطیف و رویایی رنگین‌کمان محو', previewClass: 'from-purple-100 via-indigo-100 to-emerald-100 dark:from-purple-950 dark:via-indigo-950 dark:to-emerald-950' },
  { id: 'pure_solid', name: 'فلت ساده (تک‌رنگ)', desc: 'بدون هیچ افکت یا محوشدگی نوری', previewClass: 'from-slate-200 to-slate-200 dark:from-slate-900 dark:to-slate-900' },
];

export const SettingsView: React.FC = () => {
  const {
    currency,
    setCurrency,
    darkMode,
    toggleDarkMode,
    themeConfig,
    updateThemeConfig,
    loadDemoData,
    exportDataJSON,
    importDataJSON,
    clearAllData,
  } = useFinance();

  const [message, setMessage] = useState<string | null>(null);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hesabdari_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('فایل پشتیبان با موفقیت دانلود شد.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        const success = importDataJSON(content);
        if (success) {
          showNotification('نسخه پشتیبان با موفقیت بازیابی شد.');
        } else {
          alert('خطا در خواندن فایل پشتیبان. لطفاً فایل معتبری انتخاب کنید.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '⚠️ هشدار: آیا مطمئنید که می‌خواهید تمام داده‌ها، تراکنش‌ها، حساب‌ها و چک‌ها را پاک کنید؟ این عملیات قابل بازگشت نیست.'
      )
    ) {
      clearAllData();
      showNotification('تمام داده‌های ثبت شده پاکسازی شدند.');
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('آیا مایلید داده‌های نمونه جهت تست و بررسی برنامه بارگذاری شوند؟')) {
      loadDemoData();
      showNotification('داده‌های نمونه تستی با موفقیت بارگذاری شدند.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          تنظیمات ظاهر و سیستم
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          شخصی‌سازی ساده و قدرتمند تم، رنگ‌ها، افکت‌های بصری و مدیریت داده‌ها
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Appearance & Base Mode Card */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              حالت نمایش و تم اصلی
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              انتخاب حالت روز، شب و استایل اختصاصی
            </p>
          </div>
        </div>

        {/* Day / Night Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm ${
              !darkMode
                ? 'bg-white text-slate-900 border-indigo-500 shadow-md shadow-indigo-500/15 ring-2 ring-indigo-500/20'
                : 'liquid-glass text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:border-slate-300'
            }`}
          >
            <Sun className={`w-5 h-5 ${!darkMode ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>حالت روشن (روز)</span>
          </button>

          <button
            onClick={() => {
              if (!darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm ${
              darkMode
                ? 'bg-slate-900 text-white border-indigo-500 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                : 'liquid-glass text-slate-600 border-slate-200/60 hover:border-slate-300'
            }`}
          >
            <Moon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>حالت تاریک (شب)</span>
          </button>
        </div>

        {/* Sub-options for Light Mode */}
        {!darkMode && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-slate-700 block">
              سبک بصری تم روشن:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LIGHT_STYLES.map(style => {
                const isSelected = (themeConfig.lightStyle || 'frost') === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => updateThemeConfig({ lightStyle: style.id })}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-md shadow-indigo-500/15 ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 bg-white/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: style.color }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{style.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{style.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-options for Dark Mode */}
        {darkMode && (
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-black ring-2 ring-white/30" />
              <div>
                <span className="text-xs font-bold text-white block">حالت مشکی مطلق (AMOLED Pure Black)</span>
                <span className="text-[11px] text-slate-400">
                  صرفه‌جویی باتری در نمایشگرهای اولد با رنگ مشکی ۱۰۰٪ خالص
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.amoledMode || false}
                onChange={e => updateThemeConfig({ amoledMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        )}
      </div>

      {/* 2. Background Style Customization Card */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              سبک و طرح پس‌زمینه
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              انتخاب طرح و افکت دلخواه برای پس‌زمینه برنامه با پیش‌نمایش آنی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BACKGROUND_STYLES.map(bg => {
            const isSelected = (themeConfig.backgroundStyle || 'clean_minimal') === bg.id;
            return (
              <button
                key={bg.id}
                onClick={() => updateThemeConfig({ backgroundStyle: bg.id })}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-white/95 dark:bg-slate-800 shadow-sm ring-2 ring-indigo-500/20'
                    : 'liquid-glass border-slate-200/60 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${bg.previewClass} border border-slate-300 dark:border-slate-600 shrink-0 shadow-2xs`} />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{bg.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{bg.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Dual Spotlights Controls */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-white/10 space-y-3.5">
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>اسپات‌لایت‌های نوری پس‌زمینه (Dual Ambient Spotlights)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              تنظیم مستقل رنگ نورافکن‌های نوری پس‌زمینه در بالا و پایین صفحه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spotlight 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs"
                    style={{ backgroundColor: themeConfig.spotlight1Color || '#6366f1' }}
                  />
                  <span>نورافکن ۱ (بالای صفحه)</span>
                </span>
                <label className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer">
                  <span>انتخاب دقیق</span>
                  <input
                    type="color"
                    value={themeConfig.spotlight1Color || '#6366f1'}
                    onChange={e => updateThemeConfig({ spotlight1Color: e.target.value })}
                    className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#3b82f6', '#ffffff'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateThemeConfig({ spotlight1Color: color })}
                    className={`w-7 h-7 rounded-xl border transition-transform hover:scale-110 flex items-center justify-center ${
                      (themeConfig.spotlight1Color || '#6366f1') === color
                        ? 'ring-2 ring-indigo-500 scale-105 border-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {(themeConfig.spotlight1Color || '#6366f1') === color && (
                      <Check className={`w-3.5 h-3.5 ${color === '#ffffff' ? 'text-black' : 'text-white'} stroke-[3]`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Spotlight 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs"
                    style={{ backgroundColor: themeConfig.spotlight2Color || '#06b6d4' }}
                  />
                  <span>نورافکن ۲ (پایین صفحه)</span>
                </span>
                <label className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer">
                  <span>انتخاب دقیق</span>
                  <input
                    type="color"
                    value={themeConfig.spotlight2Color || '#06b6d4'}
                    onChange={e => updateThemeConfig({ spotlight2Color: e.target.value })}
                    className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#06b6d4', '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#ec4899', '#64748b'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateThemeConfig({ spotlight2Color: color })}
                    className={`w-7 h-7 rounded-xl border transition-transform hover:scale-110 flex items-center justify-center ${
                      (themeConfig.spotlight2Color || '#06b6d4') === color
                        ? 'ring-2 ring-indigo-500 scale-105 border-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {(themeConfig.spotlight2Color || '#06b6d4') === color && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Accent Color Palette */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              رنگ شاخص و هویت بصری
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              این رنگ به عنوان رنگ اصلی در تمام دکمه‌ها، آیکون‌ها، هدر و نمودارها اعمال می‌شود
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACCENT_COLORS.map(c => {
            const isSelected = themeConfig.accent === c.id;
            return (
              <button
                key={c.id}
                onClick={() => updateThemeConfig({ accent: c.id as any })}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                  isSelected
                    ? 'border-indigo-600 bg-white/90 dark:bg-slate-800 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/25'
                    : 'liquid-glass border-slate-200/60 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Advanced Glassmorphism & Visual Effects */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              تنظیمات شیشه و افکت‌های بصری (Glassmorphism)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              کنترل اختصاصی شفافیت، شکست نور، شدت بلور و اشباع رنگ کارت‌ها
            </p>
          </div>
        </div>

        {/* Sliders for Transparency & Refraction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Glass Transparency */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">شفافیت شیشه (پوشش پس‌زمینه)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((themeConfig.glassOpacity ?? 0.86) * 100)}٪
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.98"
              step="0.02"
              value={themeConfig.glassOpacity ?? 0.86}
              onChange={e => updateThemeConfig({ glassOpacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>بسیار شیشه‌ای (شفاف)</span>
              <span>مات و محکم</span>
            </div>
          </div>

          {/* Light Refraction & Edge Highlight */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">شکست نور و بازتاب لبه‌ها</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((themeConfig.glassRefraction ?? 0.5) * 100)}٪
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={themeConfig.glassRefraction ?? 0.5}
              onChange={e => updateThemeConfig({ glassRefraction: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>بازتاب ملایم</span>
              <span>درخشش لبه کریستالی</span>
            </div>
          </div>
        </div>

        {/* Stepped Pills for Blur & Saturation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Blur Intensity */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              میزان ماتی بلور (Blur):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 8, label: '۸px' },
                { val: 14, label: '۱۴px' },
                { val: 22, label: '۲۲px' },
                { val: 32, label: '۳۲px' },
              ].map(b => {
                const isSelected = (themeConfig.glassBlur ?? 14) === b.val;
                return (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => updateThemeConfig({ glassBlur: b.val })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'liquid-glass text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saturation */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              اشباع رنگ زیر شیشه (Saturation):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 100, label: '۱۰۰٪' },
                { val: 140, label: '۱۴۰٪' },
                { val: 180, label: '۱۸۰٪' },
                { val: 220, label: '۲۲۰٪' },
              ].map(s => {
                const isSelected = (themeConfig.glassSaturation ?? 160) === s.val;
                return (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => updateThemeConfig({ glassSaturation: s.val })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'liquid-glass text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Toggles: Glass On/Off & Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200/50 dark:border-white/10">
          {/* Liquid Glass Toggle */}
          <div className="p-4 rounded-2xl liquid-glass border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                فعال‌بودن افکت شیشه (Glassmorphism)
              </span>
              <span className="text-[11px] text-slate-400">
                خاموش‌کردن برای داشتن سطوح کاملاً سالید و ساده
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.liquidGlass ?? true}
                onChange={e => updateThemeConfig({ liquidGlass: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Performance Mode */}
          <div className="p-4 rounded-2xl liquid-glass border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                حالت پرسرعت (دستگاه‌های میان‌رده)
              </span>
              <span className="text-[11px] text-slate-400">
                حذف سایه‌ها و انیمیشن‌ها جهت اسکرول فوق‌سریع
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.performanceMode ?? false}
                onChange={e => updateThemeConfig({ performanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Border Radius Selectors */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            میزان گردی گوشه‌های کادرها:
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'sharp', label: 'شارپ (۸px)' },
              { id: 'smooth', label: 'استاندارد (۱۶px)' },
              { id: 'round', label: 'کپسولی (۲۴px)' },
            ].map(r => {
              const isSelected = (themeConfig.borderRadius || 'smooth') === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => updateThemeConfig({ borderRadius: r.id as BorderRadius })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'liquid-glass text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Contacts & Persons Management Card */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                دفترچه طرف‌حساب‌ها و اشخاص
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مدیریت نام، شماره تماس و نسبت افراد برای انتساب به بدهی، طلب، چک و تراکنش‌ها
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPersonModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>مدیریت مخاطبین</span>
          </button>
        </div>
      </div>

      {/* 5. General Settings & Backup */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              واحد پولی و مدیریت داده‌ها
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              واحد پیش‌فرض نمایش مبالغ و فایل پشتیبان
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass border border-slate-200/60 dark:border-white/10">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              واحد پولی پیش‌فرض
            </span>
            <span className="text-[11px] text-slate-400">تغییر نمایش بین تومان و ریال</span>
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setCurrency('toman')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'toman'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => setCurrency('rial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'rial'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              ریال
            </button>
          </div>
        </div>

        {/* Backup Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-400 transition"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>دانلود فایل پشتیبان (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-2xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-400 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>بازیابی از فایل پشتیبان</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleLoadDemo}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-amber-400 transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>بارگذاری داده‌های نمونه تستی</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>پاکسازی کامل تمام اطلاعات</span>
          </button>
        </div>
      </div>

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />
    </div>
  );
};
