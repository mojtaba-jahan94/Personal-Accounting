import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { AccentColor, BorderRadius, LightStyle, BackgroundStyle } from '../../types';
import {
  Moon,
  Sun,
  Palette,
  Sparkles,
  Check,
  Gauge,
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
} from 'lucide-react';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { TursoConfigModal } from './TursoConfigModal';
import { UserProfileModal } from '../auth/UserProfileModal';

const ACCENT_COLORS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'amber', name: 'چوب گرم و سدر', hex: '#A68A64' },
  { id: 'emerald', name: 'زمرد قطبی', hex: '#2E7D5B' },
  { id: 'rose', name: 'سرخ تراکوتا', hex: '#C0564B' },
  { id: 'cyan', name: 'آبی فیورد', hex: '#4A6FA5' },
  { id: 'indigo', name: 'خاکستری صخره', hex: '#6B7280' },
  { id: 'purple', name: 'ذغال نوردیک', hex: '#1F2933' },
];

const LIGHT_STYLES: { id: LightStyle; name: string; desc: string; color: string }[] = [
  { id: 'warm_cream', name: 'برف کرمی (نوردیک)', desc: 'گرم و ملایم برای چشم در طول روز', color: '#F7F7F2' },
  { id: 'pure_white', name: 'سفید کریستالی', desc: 'سفید مینیمال و بسیار تمیز', color: '#FFFFFF' },
  { id: 'frost', name: 'شیشه‌ای یخی', desc: 'استایل مات با بازتاب ملایم ابر', color: '#ECEEF2' },
  { id: 'soft_slate', name: 'خاکستری ابری', desc: 'استایل فین‌تک ملایم اسکلت', color: '#E5E7EB' },
];

const BACKGROUND_STYLES: { id: BackgroundStyle; name: string; desc: string; previewClass: string }[] = [
  { id: 'clean_minimal', name: 'مینیمال سدر نوردیک', desc: 'آرامش‌بخش و متمرکز بر محتوا', previewClass: 'from-[#F7F7F2] to-[#ECEEF2] dark:from-[#1F2933] dark:to-[#141B22]' },
  { id: 'subtle_mesh', name: 'مش گرادینت گرم', desc: 'هاله‌های نوری ملایم چوب و صخره', previewClass: 'from-[#A68A64]/20 via-[#4A6FA5]/15 to-[#F7F7F2] dark:from-[#A68A64]/20 dark:via-[#141B22] dark:to-[#1F2933]' },
  { id: 'dot_matrix', name: 'میکروگرید نقطه‌ای', desc: 'طرح نقاط منظم و مهندسی‌شده', previewClass: 'from-[#D1D5DB] to-[#F7F7F2] dark:from-[#141B22] dark:to-[#1F2933]' },
  { id: 'soft_aurora', name: 'نورهای شفق زمردی', desc: 'امواج لطیف و رویایی زمرد و فیورد', previewClass: 'from-[#2E7D5B]/20 via-[#4A6FA5]/15 to-[#A68A64]/10 dark:from-[#2E7D5B]/20 dark:via-[#141B22] dark:to-[#1F2933]' },
  { id: 'pure_solid', name: 'فلت ساده (تک‌رنگ)', desc: 'بدون هیچ افکت یا محوشدگی نوری', previewClass: 'from-[#F7F7F2] to-[#F7F7F2] dark:from-[#1F2933] dark:to-[#1F2933]' },
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
  const [isTursoModalOpen, setIsTursoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);

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
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2]">
          تنظیمات ظاهر و سامانه
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
          شخصی‌سازی پالت نوردیک چوب گرم، افکت‌های بصری، پشتیبان‌گیری و اتصال ابری
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-[#2E7D5B]/15 border border-[#2E7D5B]/30 text-[#2E7D5B] dark:text-[#4ADE80] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* 1. Appearance & Base Mode Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              حالت نمایش و تم اصلی
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              انتخاب حالت روز، شب و سبک پس‌زمینه
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
                ? 'bg-white text-[#1F2933] border-[#A68A64] shadow-md shadow-[#A68A64]/15 ring-2 ring-[#A68A64]/20'
                : 'bg-[#F7F7F2]/50 dark:bg-[#141B22]/50 text-[#6B7280] border-[#6B7280]/20 hover:border-[#A68A64]/30'
            }`}
          >
            <Sun className={`w-5 h-5 ${!darkMode ? 'text-[#A68A64]' : 'text-[#6B7280]'}`} />
            <span>حالت روشن (برف کرمی)</span>
          </button>

          <button
            onClick={() => {
              if (!darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm ${
              darkMode
                ? 'bg-[#141B22] text-[#F7F7F2] border-[#A68A64] shadow-md shadow-[#A68A64]/25 ring-2 ring-[#A68A64]/20'
                : 'bg-[#F7F7F2]/50 dark:bg-[#141B22]/50 text-[#6B7280] border-[#6B7280]/20 hover:border-[#A68A64]/30'
            }`}
          >
            <Moon className={`w-5 h-5 ${darkMode ? 'text-[#C2A882]' : 'text-[#6B7280]'}`} />
            <span>حالت تاریک (ذغال نوردیک)</span>
          </button>
        </div>

        {/* Sub-options for Light Mode */}
        {!darkMode && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-[#1F2933] block">
              سبک بصری تم روشن:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LIGHT_STYLES.map((style) => {
                const isSelected = (themeConfig.lightStyle || 'warm_cream') === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => updateThemeConfig({ lightStyle: style.id })}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-[#A68A64] bg-white shadow-md shadow-[#A68A64]/15 ring-2 ring-[#A68A64]/20'
                        : 'border-[#6B7280]/20 bg-white/70 hover:border-[#A68A64]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-4 h-4 rounded-full border border-[#D1D5DB]"
                        style={{ backgroundColor: style.color }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-[#A68A64]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1F2933]">{style.name}</h4>
                      <p className="text-[10px] text-[#6B7280] leading-tight mt-0.5">{style.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-options for Dark Mode */}
        {darkMode && (
          <div className="p-3.5 rounded-2xl bg-[#141B22]/70 border border-[#D1D5DB]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-black ring-2 ring-white/30" />
              <div>
                <span className="text-xs font-bold text-white block">حالت مشکی عمیق (OLED Deep)</span>
                <span className="text-[11px] text-[#6B7280]">
                  صرفه‌جویی باتری در نمایشگرهای اولد با رنگ مشکی خالص
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.amoledMode || false}
                onChange={(e) => updateThemeConfig({ amoledMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#6B7280]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A68A64]"></div>
            </label>
          </div>
        )}
      </div>

      {/* 2. Background Style Customization Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              سبک و طرح پس‌زمینه
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              انتخاب طرح و افکت دلخواه برای پس‌زمینه برنامه با پیش‌نمایش آنی
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BACKGROUND_STYLES.map((bg) => {
            const isSelected = (themeConfig.backgroundStyle || 'clean_minimal') === bg.id;
            return (
              <button
                key={bg.id}
                onClick={() => updateThemeConfig({ backgroundStyle: bg.id })}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#A68A64] bg-white/95 dark:bg-[#141B22] shadow-xs ring-2 ring-[#A68A64]/20'
                    : 'bg-[#F7F7F2] dark:bg-[#141B22]/60 border-[#6B7280]/15 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${bg.previewClass} border border-[#D1D5DB] shrink-0`} />
                    <h4 className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] truncate">{bg.name}</h4>
                  </div>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 mt-1 truncate">{bg.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Accent Color Palette */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              رنگ شاخص و هویت بصری
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              این رنگ به عنوان رنگ اصلی در تمام دکمه‌ها، آیکون‌ها، هدر و نشانگرها اعمال می‌شود
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACCENT_COLORS.map((c) => {
            const isSelected = (themeConfig.accent || 'amber') === c.id;
            return (
              <button
                key={c.id}
                onClick={() => updateThemeConfig({ accent: c.id as any })}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                  isSelected
                    ? 'border-[#A68A64] bg-white/90 dark:bg-[#141B22] shadow-md shadow-[#A68A64]/20 ring-2 ring-[#A68A64]/25'
                    : 'bg-[#F7F7F2] dark:bg-[#141B22]/60 border-[#6B7280]/15 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Advanced Glassmorphism Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              تنظیمات شیشه و افکت‌های بصری (Spatial Glass)
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              کنترل اختصاصی شفافیت، شکست نور و میزان گردی گوشه‌های کادرها
            </p>
          </div>
        </div>

        {/* Sliders for Transparency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">شفافیت شیشه (پوشش پس‌زمینه)</span>
              <span className="font-mono font-bold text-[#A68A64]">
                {Math.round((themeConfig.glassOpacity ?? 0.86) * 100)}٪
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.98"
              step="0.02"
              value={themeConfig.glassOpacity ?? 0.86}
              onChange={(e) => updateThemeConfig({ glassOpacity: parseFloat(e.target.value) })}
              className="w-full accent-[#A68A64] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6B7280]">
              <span>بسیار شیشه‌ای (شفاف)</span>
              <span>مات و محکم</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">شکست نور و بازتاب لبه‌ها</span>
              <span className="font-mono font-bold text-[#A68A64]">
                {Math.round((themeConfig.glassRefraction ?? 0.5) * 100)}٪
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={themeConfig.glassRefraction ?? 0.5}
              onChange={(e) => updateThemeConfig({ glassRefraction: parseFloat(e.target.value) })}
              className="w-full accent-[#A68A64] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6B7280]">
              <span>بازتاب ملایم</span>
              <span>درخشش لبه کریستالی</span>
            </div>
          </div>
        </div>

        {/* Toggles: Performance Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
                حالت پرسرعت (اسکرول ۶۰ فریم)
              </span>
              <span className="text-[11px] text-[#6B7280]">
                حذف سایه‌ها و انیمیشن‌های سنگین جهت پیمایش فوق‌سریع
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.performanceMode ?? false}
                onChange={(e) => updateThemeConfig({ performanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#6B7280]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A68A64]"></div>
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
                فعال‌بودن افکت شیشه مایع
              </span>
              <span className="text-[11px] text-[#6B7280]">
                افکت شیشه روی پنل‌های اصلی و کارت‌های مهم
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={themeConfig.liquidGlass ?? true}
                onChange={(e) => updateThemeConfig({ liquidGlass: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#6B7280]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A68A64]"></div>
            </label>
          </div>
        </div>

        {/* Border Radius */}
        <div className="pt-2">
          <span className="text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] block mb-2">
            میزان گردی گوشه‌های کادرها:
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'sharp', label: 'شارپ (۸px)' },
              { id: 'smooth', label: 'استاندارد (۱۶px)' },
              { id: 'round', label: 'کپسولی (۲۴px)' },
            ].map((r) => {
              const isSelected = (themeConfig.borderRadius || 'smooth') === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => updateThemeConfig({ borderRadius: r.id as BorderRadius })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-[#A68A64] text-[#F7F7F2] border-[#A68A64] shadow-xs'
                      : 'bg-[#F7F7F2] dark:bg-[#141B22]/60 text-[#1F2933] dark:text-[#D1D5DB] border-[#6B7280]/15 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Contacts & Persons Management Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
                دفترچه طرف‌حساب‌ها و اشخاص
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                مدیریت نام، شماره تماس و طرف‌حساب‌های بدهی، طلب، چک و تراکنش‌ها
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPersonModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>مدیریت مخاطبین</span>
          </button>
        </div>
      </div>

      {/* 6. Cloud Database & User Account */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
                پایگاه داده سرور Turso و حساب کاربری
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                ذخیره‌سازی اطلاعات روی سرور و همگام‌سازی ابری امن
              </p>
            </div>
          </div>

          <div>
            {tursoStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B] dark:bg-[#4ADE80] animate-pulse" />
                متصل به سرور Turso
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A68A64]/15 text-[#A68A64] border border-[#A68A64]/30 text-xs font-bold">
                در انتظار اتصال
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center font-black text-sm shadow-xs">
              {user ? user.displayName.charAt(0) || user.username.charAt(0).toUpperCase() : '؟'}
            </div>
            <div>
              <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
                {user ? user.displayName : 'کاربر مهمان'}
              </span>
              <span className="text-[11px] text-[#6B7280] font-mono dir-ltr">
                {user ? `@${user.username}` : '@guest'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#6B7280]/15 hover:bg-[#6B7280]/25 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>پروفایل و امنیت</span>
            </button>

            <button
              onClick={() => setIsTursoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>تنظیمات پایگاه داده Turso</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#6B7280]">
            وضعیت ذخیره‌سازی داده‌ها:
          </span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#1F2933] dark:text-[#D1D5DB]">
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
              className="text-[#A68A64] font-bold hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTurso ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی دستی</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Currency & Data Management */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              واحد پولی و مدیریت داده‌ها
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              واحد پیش‌فرض نمایش مبالغ، پشتیبان‌گیری و بازنشانی
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div>
            <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
              واحد پولی پیش‌فرض
            </span>
            <span className="text-[11px] text-[#6B7280]">تغییر نمایش بین تومان و ریال در تمام بخش‌ها</span>
          </div>
          <div className="flex gap-1.5 p-1 bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 rounded-xl">
            <button
              onClick={() => setCurrency('toman')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'toman'
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB]'
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => setCurrency('rial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === 'rial'
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB]'
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
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-[#A68A64]" />
            <span>دانلود فایل پشتیبان (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs cursor-pointer">
            <Upload className="w-4 h-4 text-[#2E7D5B] dark:text-[#4ADE80]" />
            <span>بازیابی از فایل پشتیبان</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleLoadDemo}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#F7F7F2] dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#A68A64]" />
            <span>بارگذاری داده‌های نمونه تستی</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#C0564B]/10 hover:bg-[#C0564B] text-[#C0564B] hover:text-white border border-[#C0564B]/30 text-xs font-bold transition shadow-xs"
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

      <TursoConfigModal
        isOpen={isTursoModalOpen}
        onClose={() => setIsTursoModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default SettingsView;
