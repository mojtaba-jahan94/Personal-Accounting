import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { BackgroundStyle } from '../../types';
import { THEME_PALETTES } from '../../utils/liquidGlassPresets';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Moon,
  Sun,
  Palette,
  Sparkles,
  Check,
  Layers,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Coins,
  Users,
  Database,
  User,
  Zap,
} from 'lucide-react';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { AnimationLevel, getAnimationLevel, setAnimationLevel } from '../../utils/motionSettings';

const BACKGROUND_STYLES: { id: BackgroundStyle; name: string; desc: string; previewClass: string }[] = [
  {
    id: 'clean_minimal',
    name: 'مینیمال آرام',
    desc: 'پس‌زمینه آرام و متمرکز با هاله‌های نوری محو و ملایم پالت فعال',
    previewClass: 'from-[#0b0c10] via-[#1f2833] to-[#0b0c10]',
  },
  {
    id: 'silk_wave',
    name: 'موج ابریشمی سه‌بعدی',
    desc: 'موج زنده و متحرک ابریشم ارگانیک سازگار با پالت انتخابی',
    previewClass: 'from-violet-950 via-indigo-900 to-black',
  },
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
    cloudSyncStatus,
    syncAllToTurso,
  } = useFinance();
  const { user, tursoStatus } = useAuth();

  const [message, setMessage] = useState<string | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);
  const [animLevel, setAnimLevel] = useState<AnimationLevel>(() => getAnimationLevel());

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAnimationLevelChange = (level: AnimationLevel) => {
    setAnimationLevel(level);
    setAnimLevel(level);
    showNotification(`سطح پویانمایی به «${level === 'full' ? 'کامل' : level === 'lite' ? 'سبک و روان' : 'خاموش'}» تغییر یافت.`);
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
    <div className="space-y-6 pb-20 max-w-4xl mx-auto select-none">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-violet-400 uppercase">
            PREFERENCES & SYSTEM
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fintech-text-primary tracking-tight">
          تنظیمات ظاهر و سامانه
        </h1>
        <p className="text-xs text-fintech-text-muted mt-1">
          شخصی‌سازی پالت‌های رنگی، حالت روز و شب، پشتیبان‌گیری و پایگاه داده ابری Turso
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* 2. Theme Palette Selector */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                پالت هویت بصری و تم برنامه
              </h2>
              <p className="text-xs text-fintech-text-muted">
                انتخاب استایل و ترکیب رنگ‌های اصلی رابط کاربری
              </p>
            </div>
          </div>

          <Badge variant="primary" size="sm">
            {(themeConfig.palette || 'nordic') === 'juniper_coral' ? 'ارس و مرجان' : 'نوردیک چوب گرم'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {THEME_PALETTES.map((palette) => {
            const isSelected = (themeConfig.palette || 'nordic') === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => {
                  updateThemeConfig({
                    palette: palette.id,
                    customAccentHex: palette.id === 'juniper_coral' ? '#7D2826' : '#A68A64',
                  });
                  showNotification(`تم «${palette.name}» با موفقیت فعال شد.`);
                }}
                className={`p-4 rounded-2xl border text-right transition-[border-color,background-color,box-shadow] duration-150 flex flex-col justify-between gap-3 relative ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/15 ring-2 ring-violet-500/30'
                    : 'bg-black/20 dark:bg-white/[0.02] border-white/10 hover:border-violet-500/40'
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {palette.name}
                      </h3>
                      {palette.id === 'juniper_coral' && (
                        <Badge variant="danger" size="sm">جدید</Badge>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-fintech-text-muted leading-relaxed">
                    {palette.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center -space-x-1.5 space-x-reverse">
                    {palette.colors.map((c) => (
                      <div
                        key={c.key}
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs relative"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name}: ${c.hex} (${c.role})`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-fintech-text-muted font-mono flex items-center gap-1">
                    {palette.colors.map((c) => (
                      <span key={c.key} className="px-1 py-0.5 rounded bg-white/5 text-[9px]">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Appearance & Day/Night Mode Card */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              حالت روشنایی (روز / شب)
            </h2>
            <p className="text-xs text-fintech-text-muted">
              انتخاب حالت روز یا شب سازگار با پالت انتخابی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              if (darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-[border-color,background-color,box-shadow,color] duration-150 flex items-center justify-center gap-3 font-bold text-sm ${
              !darkMode
                ? 'bg-white text-zinc-900 border-violet-500 shadow-lg shadow-violet-500/15 ring-2 ring-violet-500/20'
                : 'bg-black/20 dark:bg-white/[0.02] text-fintech-text-muted border-white/10 hover:border-violet-500/30'
            }`}
          >
            <Sun className={`w-5 h-5 ${!darkMode ? 'text-amber-500' : 'text-fintech-text-muted'}`} />
            <span>حالت روشن (روز)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-[border-color,background-color,box-shadow,color] duration-150 flex items-center justify-center gap-3 font-bold text-sm ${
              darkMode
                ? 'bg-violet-950/40 text-white border-violet-500 shadow-lg shadow-violet-500/25 ring-2 ring-violet-500/30'
                : 'bg-black/20 dark:bg-white/[0.02] text-fintech-text-muted border-white/10 hover:border-violet-500/30'
            }`}
          >
            <Moon className={`w-5 h-5 ${darkMode ? 'text-violet-400' : 'text-fintech-text-muted'}`} />
            <span>حالت تیره (شب)</span>
          </button>
        </div>

        {/* 60fps Performance Mode */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              حالت بهینه عملکرد (۶۰ فریم فوق‌روان)
            </span>
            <span className="text-[11px] text-fintech-text-muted">
              کاهش بلور سنگین در پس‌زمینه برای افزایش سرعت دستگاه‌های ضعیف‌تر
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={themeConfig.performanceMode ?? false}
              onChange={(e) => updateThemeConfig({ performanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-[transform] after:duration-150 peer-checked:bg-violet-600"></div>
          </label>
        </div>

        {/* Animation Level Setting */}
        <div className="pt-3 border-t border-white/5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                سطح پویانمایی و جلوه‌های حرکتی (Animation Level)
              </span>
              <span className="text-[11px] text-fintech-text-muted">
                سبک: بدون امواج متحرک و شمارش مداوم • خاموش: لغو کامل انیمیشن‌ها
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/5 self-start sm:self-auto">
              {(['full', 'lite', 'off'] as const).map((lvl) => {
                const labels = { full: 'کامل (Full)', lite: 'سبک (Lite)', off: 'خاموش (Off)' };
                const isSelected = animLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleAnimationLevelChange(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-[background-color,border-color,color] duration-150 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-fintech-text-muted hover:text-white'
                    }`}
                  >
                    {labels[lvl]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Background Style Card */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              طرح و پس‌زمینه محیط برنامه
            </h2>
            <p className="text-xs text-fintech-text-muted">
              انتخاب میان پس‌زمینه مینیمال آرام یا امواج ابریشمی متحرک
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {BACKGROUND_STYLES.map((bg) => {
            const isSelected = (themeConfig.backgroundStyle || 'clean_minimal') === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => updateThemeConfig({ backgroundStyle: bg.id })}
                className={`p-4 rounded-2xl border text-right transition-[border-color,background-color,box-shadow] duration-150 flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/20'
                    : 'bg-black/20 dark:bg-white/[0.02] border-white/10 hover:border-violet-500/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${bg.previewClass} border border-white/20 shrink-0`} />
                    <h3 className="text-xs font-bold text-white">{bg.name}</h3>
                  </div>
                  <p className="text-[11px] text-fintech-text-muted mt-1">{bg.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 5. Contacts & Persons Management Card */}
      <Card variant="glass" className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                دفترچه طرف‌حساب‌ها و اشخاص
              </h2>
              <p className="text-xs text-fintech-text-muted">
                مدیریت نام، شماره تماس و طرف‌حساب‌های بدهی، طلب، چک و تراکنش‌ها
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setIsPersonModalOpen(true)}
            icon={<Users className="w-4 h-4 text-violet-400" />}
          >
            مدیریت مخاطبین
          </Button>
        </div>
      </Card>

      {/* 6. Cloud Database & User Account */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                پایگاه داده سرور Turso و حساب کاربری
              </h2>
              <p className="text-xs text-fintech-text-muted">
                ذخیره‌سازی اطلاعات روی سرور و همگام‌سازی ابری امن
              </p>
            </div>
          </div>

          <div>
            {tursoStatus === 'connected' ? (
              <Badge variant="success" size="md">
                متصل به سرور Turso
              </Badge>
            ) : (
              <Badge variant="warning" size="md">
                در انتظار اتصال
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/20 dark:bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user ? user.displayName.charAt(0) || user.username.charAt(0).toUpperCase() : '؟'}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {user ? user.displayName : 'کاربر مهمان'}
              </span>
              <span className="text-[11px] text-fintech-text-muted font-mono dir-ltr">
                {user ? `@${user.username}` : '@guest'}
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsProfileModalOpen(true)}
            icon={<User className="w-3.5 h-3.5" />}
          >
            پروفایل و امنیت
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-fintech-text-muted">
            وضعیت همگام‌سازی داده‌ها:
          </span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">
              {cloudSyncStatus === 'synced'
                ? 'ذخیره شده روی سرور Turso'
                : cloudSyncStatus === 'syncing'
                ? 'در حال ذخیره‌سازی روی سرور...'
                : cloudSyncStatus === 'error'
                ? 'خطا در ارتباط با سرور'
                : 'آفلاین'}
            </span>
            <button
              onClick={async () => {
                setIsSyncingTurso(true);
                await syncAllToTurso();
                setIsSyncingTurso(false);
                showNotification('اطلاعات با سرور Turso همگام‌سازی شدند.');
              }}
              disabled={isSyncingTurso || tursoStatus !== 'connected'}
              className="text-violet-400 font-bold hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTurso ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی دستی</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 7. Currency & Data Management */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              واحد پولی و پشتیبان‌گیری داده‌ها
            </h2>
            <p className="text-xs text-fintech-text-muted">
              واحد پیش‌فرض نمایش مبالغ، دانلود خروجی پشتیبان و بازنشانی کامل
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 dark:bg-white/[0.02] border border-white/5">
          <div>
            <span className="text-xs font-bold text-white block">
              واحد پولی پیش‌فرض
            </span>
            <span className="text-[11px] text-fintech-text-muted">تغییر نمایش بین تومان و ریال در تمام بخش‌ها</span>
          </div>
          <div className="flex gap-1.5 p-1 bg-black/30 dark:bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setCurrency('toman')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'toman'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => setCurrency('rial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'rial'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              ریال
            </button>
          </div>
        </div>

        {/* Backup Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={handleExportBackup}
            icon={<Download className="w-4 h-4 text-violet-400" />}
          >
            دانلود فایل پشتیبان (JSON)
          </Button>

          <label className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer active:scale-95">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>بازیابی از فایل پشتیبان</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <Button
            variant="secondary"
            onClick={handleLoadDemo}
            icon={<RefreshCw className="w-4 h-4 text-violet-400" />}
          >
            بارگذاری داده‌های نمونه تستی
          </Button>

          <Button
            variant="danger"
            onClick={handleResetData}
            icon={<Trash2 className="w-4 h-4" />}
          >
            پاکسازی کامل تمام اطلاعات
          </Button>
        </div>
      </Card>

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default SettingsView;
