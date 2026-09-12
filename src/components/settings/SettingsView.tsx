import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccentColor, GlassIntensity, AnimationSpeed } from '../../types';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Moon,
  Sun,
  Coins,
  CheckCircle2,
  Palette,
  Sparkles,
  Sliders,
  Zap,
  Eye,
  Check,
} from 'lucide-react';

const ACCENT_COLORS: { id: AccentColor; name: string; hex: string; desc: string }[] = [
  { id: 'indigo', name: 'نیلی رویایی', hex: '#6366f1', desc: 'کلاسیک و متوازن' },
  { id: 'emerald', name: 'زمردی سایبر', hex: '#10b981', desc: 'انرژی مثبت و ثروت' },
  { id: 'rose', name: 'یاقوتی لوکس', hex: '#f43f5e', desc: 'جذاب و پرحرارت' },
  { id: 'amber', name: 'کهربایی طلایی', hex: '#f59e0b', desc: 'طلایی و سلطنتی' },
  { id: 'cyan', name: 'اقیانوس نئونی', hex: '#06b6d4', desc: 'آینده‌نگر و شفاف' },
  { id: 'purple', name: 'بنفش امیتیست', hex: '#a855f7', desc: 'عمیق و رازآلود' },
];

const GLASS_INTENSITIES: { id: GlassIntensity; name: string; desc: string }[] = [
  { id: 'low', name: 'ملایم و پرسرعت', desc: 'بلور سبک، حداکثر نرخ فریم (مناسب گوشی‌های ضعیف‌تر)' },
  { id: 'medium', name: 'متعادل (استاندارد)', desc: 'شیشه مات استاندارد و متعادل' },
  { id: 'high', name: 'کریستالی و عمیق', desc: 'بلور عمیق ۲۸ پیکسلی با اشباع و بازتاب نوری قوی' },
];

const ANIM_SPEEDS: { id: AnimationSpeed; name: string; desc: string }[] = [
  { id: 'fast', name: 'برق‌آسا و سریع (۱۲۰ms)', desc: 'اسنپی و آنی بدون معطلی (پیشنهادی)' },
  { id: 'normal', name: 'نرم و روان (۲۵۰ms)', desc: 'انیمیشن‌های ملایم و ملایم‌تر' },
  { id: 'none', name: 'حذف انیمیشن‌ها (۰ms)', desc: 'عملکرد خالص بدون هیچ انیمیشنی' },
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
      reader.onload = (event) => {
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
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          تنظیمات و استودیوی تم
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تنظیمات حرفه‌ای لیکویید گلس، رنگ‌ها، سرعت انیمیشن و پشتیبان‌گیری
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Pro Theme Studio Box */}
      <div className="liquid-glass-card p-6 space-y-6 border border-indigo-500/30">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                استودیوی اختصاصی تم و لیکویید گلس (Theme Studio)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                شخصی‌سازی آنی ظاهر برنامه با بالاترین استاندارد بصری
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            PRO UI
          </span>
        </div>

        {/* 1. Accent Colors */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>پالت رنگی اصلی (Accent Color)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ACCENT_COLORS.map(c => {
              const isSelected = themeConfig.accent === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => updateThemeConfig({ accent: c.id })}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full shadow-sm shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <div>
                      <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Glass Intensity Slider / Presets */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200/50 dark:border-white/10">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>شدت افکت لیکویید گلس (Frosted Glass Depth)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {GLASS_INTENSITIES.map(g => {
              const isSelected = themeConfig.glassIntensity === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => updateThemeConfig({ glassIntensity: g.id })}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {g.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {g.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Animation Speed & Performance */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200/50 dark:border-white/10">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>سرعت و روانی انیمیشن‌ها (Performance & Speed)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ANIM_SPEEDS.map(a => {
              const isSelected = themeConfig.animationSpeed === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => updateThemeConfig({ animationSpeed: a.id })}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {a.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {a.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Ambient Orbs Toggle & Mode */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              گوی‌های نوری شناور در پس‌زمینه (Ambient Glow)
            </span>
            <span className="text-[11px] text-slate-400">
              خاموش کردن برای بهینه‌سازی حداکثری مصرف باتری و کارت گرافیک
            </span>
          </div>

          <button
            onClick={() => updateThemeConfig({ ambientOrbs: !themeConfig.ambientOrbs })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              themeConfig.ambientOrbs
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>{themeConfig.ambientOrbs ? 'روشن (فعال)' : 'خاموش (صرفه‌جویی)'}</span>
          </button>
        </div>
      </div>

      {/* General Settings: Currency & Mode */}
      <div className="liquid-glass-card p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">تنظیمات پایه سیستم</h3>

        <div className="divide-y divide-slate-200/50 dark:divide-white/10">
          {/* Currency */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-indigo-500" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  واحد پولی سیستم
                </span>
                <span className="text-[11px] text-slate-400">نمایش مبالغ بر حسب تومان یا ریال</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCurrency('toman')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currency === 'toman'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                تومان
              </button>
              <button
                onClick={() => setCurrency('rial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currency === 'rial'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                ریال
              </button>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  حالت شب و روز (Dark / Light)
                </span>
                <span className="text-[11px] text-slate-400">تغییر تم تاریک و روشن</span>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold hover:bg-white/40 dark:hover:bg-slate-800"
            >
              {darkMode ? 'سوئیچ به تم روشن' : 'سوئیچ به تم تاریک'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="liquid-glass-card p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">پشتیبان‌گیری و بازیابی داده‌ها</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-right transition flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                تهیه فایل پشتیبان (JSON)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                دانلود تمام تراکنش‌ها، بودجه‌ها، حساب‌ها و تنظیمات تم
              </p>
            </div>
          </button>

          <label className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-right transition flex items-start gap-3 cursor-pointer">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                بازیابی نسخه پشتیبان
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                بارگذاری فایل JSON پشتیبان قبلی و بازیابی آنی
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>
          </label>
        </div>

        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            <span>بارگذاری مجدد داده‌های تستی</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>پاکسازی کامل همه داده‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
};
