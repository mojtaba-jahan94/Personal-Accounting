import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { BackgroundStyle, ThemePaletteId, Currency } from '../../types';
import { THEME_PALETTES } from '../../utils/liquidGlassPresets';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Moon,
  Sun,
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
  Shield,
  Gauge,
  Palette,
  ArrowLeftRight,
  Activity,
  Cloud,
  Zap,
} from 'lucide-react';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { TursoConfigModal } from './TursoConfigModal';
import { AnimationLevel, getAnimationLevel, setAnimationLevel } from '../../utils/motionSettings';

const BACKGROUND_OPTIONS: { id: BackgroundStyle; name: string; desc: string; gradient: string }[] = [
  {
    id: 'silk_wave',
    name: 'امواج زنده آئورا (VisionOS)',
    desc: 'موج‌های نوری پویا، ذرات کریستالی و گرادیان متحرک فضایی',
    gradient: 'from-violet-600/30 via-indigo-600/20 to-cyan-500/20',
  },
  {
    id: 'clean_minimal',
    name: 'مینیمال آرام و متمرکز',
    desc: 'پس‌زمینه آرام بدون حرکت اضافی جهت تمرکز حداکثری و مصرف بهینه باتری',
    gradient: 'from-zinc-800/40 via-zinc-900/40 to-black/60',
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
  const [isTursoModalOpen, setIsTursoModalOpen] = useState(false);
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);
  const [animLevel, setAnimLevel] = useState<AnimationLevel>(() => getAnimationLevel());

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3200);
  };

  const handleAnimationLevelChange = (level: AnimationLevel) => {
    setAnimationLevel(level);
    setAnimLevel(level);
    showNotification(`سطح پویانمایی به «${level === 'full' ? 'کامل و پویا' : level === 'lite' ? 'روان و سبک' : 'خاموش'}» تغییر یافت.`);
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

  const isTursoOnline = tursoStatus === 'connected';

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto select-none dir-rtl">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-violet-400 uppercase">
              CONTROL PANEL & PREFERENCES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            تنظیمات و شخصی‌سازی
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            کنترل هویت دیداری، جلوه‌های فضایی، پایگاه داده ابری و نسخه پشتیبان
          </p>
        </div>

        {/* Live sync quick trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (isTursoOnline) {
                setIsSyncingTurso(true);
                await syncAllToTurso();
                setIsSyncingTurso(false);
                showNotification('همگام‌سازی ابری با موفقیت به پایان رسید.');
              }
            }}
            disabled={isSyncingTurso || !isTursoOnline}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isSyncingTurso ? 'animate-spin' : ''}`} />
            <span>همگام‌سازی ابری</span>
          </button>
        </div>
      </motion.div>

      {/* Floating Alert Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-emerald-500/10 backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento Card: User Account & Cloud Sync Status */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-violet-500/25">
                {user ? user.displayName?.charAt(0) || user.username?.charAt(0).toUpperCase() : '؟'}
              </div>
              <span
                className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-[#0c0a14] ${
                  isTursoOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                title={isTursoOnline ? 'متصل به سرور' : 'حالت محلی'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {user ? user.displayName : 'کاربر مهمان'}
                </h2>
                <Badge variant={isTursoOnline ? 'success' : 'warning'} size="sm">
                  {isTursoOnline ? 'همگام با سرور Turso' : 'حالت محلی (آفلاین)'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5 dir-ltr text-right">
                {user ? `@${user.username}` : '@guest'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTursoModalOpen(true)}
              icon={<Database className="w-3.5 h-3.5 text-indigo-400" />}
            >
              پیکربندی سرور Turso
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPersonModalOpen(true)}
              icon={<Users className="w-3.5 h-3.5 text-cyan-400" />}
            >
              طرف‌حساب‌ها
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              icon={<User className="w-3.5 h-3.5 text-violet-400" />}
            >
              پروفایل و امنیت
            </Button>
          </div>
        </div>

        {/* Sync telemetry bar */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>وضعیت ذخیره‌سازی داده‌ها:</span>
            <span className="font-bold text-white">
              {cloudSyncStatus === 'synced'
                ? 'ذخیره آنی در فضای ابری Turso'
                : cloudSyncStatus === 'syncing'
                ? 'در حال همگام‌سازی با پایگاه داده...'
                : cloudSyncStatus === 'error'
                ? 'خطا در ارتباط با سرور ابری'
                : 'آفلاین (ذخیره روی حافظه محلی مرورگر)'}
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            {isTursoOnline ? 'Turso Cloud LibSQL Engine' : 'Local IndexedDB / Storage'}
          </div>
        </div>
      </Card>

      {/* 3. Bento Card: Appearance & Theme Mode */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                هویت دیداری و حالت روشنایی
              </h2>
              <p className="text-xs text-zinc-400">
                حالت روز/شب، ترکیب رنگ‌های فضایی و پالت اختصاصی نئونی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => {
                if (darkMode) toggleDarkMode();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                !darkMode
                  ? 'bg-amber-400/20 text-amber-300 shadow-sm border border-amber-400/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>روز</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!darkMode) toggleDarkMode();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                darkMode
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-violet-300" />
              <span>شب</span>
            </button>
          </div>
        </div>

        {/* Theme Palette Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 block">
              پالت رنگی تم اصلی (Neo-Fintech Themes):
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              تغییر بلادرنگ پس‌زمینه، دکمه‌ها و نورپردازی
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEME_PALETTES.map((palette) => {
              const isSelected = (themeConfig.palette || 'cyber_violet') === palette.id;
              const accentHex = palette.colors[1]?.hex || '#8B5CF6';

              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => {
                    updateThemeConfig({
                      palette: palette.id,
                      customAccentHex: accentHex,
                    });
                    showNotification(`پالت «${palette.name}» فعال شد و اتمسفر برنامه تغییر یافت.`);
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden group active:scale-[0.98] ${
                    isSelected
                      ? 'border-white/30 bg-white/[0.08] shadow-lg shadow-[0_0_25px_var(--primary-glow)] ring-2 ring-[color:var(--primary-color)]/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${palette.gradient} border border-white/30 shadow-xs ring-2 ring-white/10`} />
                      <span className="text-xs font-extrabold text-white group-hover:text-zinc-200 transition-colors">
                        {palette.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div
                        className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: accentHex }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {palette.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 w-full">
                    <div className="flex items-center gap-1.5">
                      {palette.colors.map((c) => (
                        <div
                          key={c.key}
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name}: ${c.hex}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {palette.enName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Style Switcher */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <span className="text-xs font-bold text-zinc-300 block">
            سبک پس‌زمینه فضایی:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BACKGROUND_OPTIONS.map((bg) => {
              const isSelected = (themeConfig.backgroundStyle || 'silk_wave') === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    updateThemeConfig({ backgroundStyle: bg.id });
                    showNotification(`پس‌زمینه «${bg.name}» فعال شد.`);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-500/15 ring-2 ring-violet-500/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${bg.gradient} border border-white/20 flex items-center justify-center shrink-0 shadow-xs`}>
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{bg.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{bg.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fluid Motion & Turbo 60fps Mode */}
        <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                حالت توربو ۶۰ فریم (بهینه‌سازی عملکرد)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              کاهش بلور سنگین در پس‌زمینه برای افزایش سرعت و روانی اسکرول
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-zinc-400 font-mono">
              {themeConfig.performanceMode ? 'فعال (Ultra Fast)' : 'حداکثر کیفیت بلور'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.performanceMode ?? false}
                onChange={(e) => updateThemeConfig({ performanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        {/* Animation Level */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Gauge className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-white">
                سطح پویانمایی و جلوه‌های حرکتی
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              تنظیم شتاب و میزان پویایی المان‌های رابط کاربری
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 self-start sm:self-auto">
            {(['full', 'lite', 'off'] as const).map((lvl) => {
              const labels = { full: 'کامل و پویا', lite: 'سبک و روان', off: 'خاموش' };
              const isSelected = animLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleAnimationLevelChange(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {labels[lvl]}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 4. Bento Card: Currency Settings */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                واحد پولی و مالی پیش‌فرض
              </h2>
              <p className="text-xs text-zinc-400">
                تغییر نحوه نمایش ارقام مالی بین تومان و ریال در تمام گزارش‌ها
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                setCurrency('toman');
                showNotification('واحد پولی به تومان تغییر یافت.');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === 'toman'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => {
                setCurrency('rial');
                showNotification('واحد پولی به ریال تغییر یافت.');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === 'rial'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ریال
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-zinc-400">پیش‌نمایش تبدیل مقیاس:</span>
          <span className="font-mono text-cyan-400 font-bold dir-ltr">
            {currency === 'toman' ? '100,000 Toman = 1,000,000 Rial' : '1,000,000 Rial = 100,000 Toman'}
          </span>
        </div>
      </Card>

      {/* 5. Bento Card: Data Management Vault & Backup */}
      <Card variant="glass" className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              خزانه داده‌ها و پشتیبان‌گیری
            </h2>
            <p className="text-xs text-zinc-400">
              دریافت نسخه پشتیبان JSON، بازیابی فایل و بارگذاری داده‌های تستی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-right transition flex items-center justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  دانلود فایل پشتیبان (JSON)
                </span>
                <span className="text-[11px] text-zinc-400">
                  خروجی کامل رمزنگاری شده از تمامی تراکنش‌ها
                </span>
              </div>
            </div>
          </button>

          <label className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-right transition flex items-center justify-between group cursor-pointer active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  بازیابی نسخه پشتیبان
                </span>
                <span className="text-[11px] text-zinc-400">
                  فراخوانی مجدد اطلاعات از فایل JSON
                </span>
              </div>
            </div>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-right transition flex items-center justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  بارگذاری داده‌های نمونه تستی
                </span>
                <span className="text-[11px] text-zinc-400">
                  تزریق داده‌های فرضی برای مشاهده قابلیت‌ها
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-right transition flex items-center justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 group-hover:scale-105 transition-transform">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-300 block">
                  منطقه خطر: پاکسازی کامل داده‌ها
                </span>
                <span className="text-[11px] text-rose-400/70">
                  حذف غیرقابل بازگشت تمام اطلاعات محلی
                </span>
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Modals */}
      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <TursoConfigModal
        isOpen={isTursoModalOpen}
        onClose={() => setIsTursoModalOpen(false)}
      />
    </div>
  );
};

export default SettingsView;
