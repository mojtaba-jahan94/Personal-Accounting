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

const BACKGROUND_STYLES: { id: BackgroundStyle; name: string; desc: string; previewClass: string }[] = [
  {
    id: 'clean_minimal',
    name: 'مینیمال نوردیک',
    desc: 'پس‌زمینه آرام و متمرکز با هاله‌های ملایم چوب گرم و فیورد',
    previewClass: 'from-[#F7F7F2] via-[#EAE6DF] to-[#D1D5DB] dark:from-[#1F2933] dark:via-[#141B22] dark:to-[#1F2933]',
  },
  {
    id: 'silk_wave',
    name: 'موج ابریشمی',
    desc: 'موج سه‌بعدی متحرک و ابریشمی با پالت چوب گرم و صخره',
    previewClass: 'from-[#A68A64]/40 via-[#6B7280]/30 to-[#F7F7F2] dark:from-[#A68A64]/30 dark:via-[#141B22] dark:to-[#1F2933]',
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

      {/* 1. Appearance & Theme Mode Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#A68A64]/15 text-[#A68A64]">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              حالت نمایش و تم اصلی
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              انتخاب حالت روز (برف کرمی) یا شب (ذغال نوردیک)
            </p>
          </div>
        </div>

        {/* Day / Night 2-Option Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              if (darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm ${
              !darkMode
                ? 'bg-white text-[#1F2933] border-[#A68A64] shadow-md shadow-[#A68A64]/15 ring-2 ring-[#A68A64]/20'
                : 'bg-white/50 dark:bg-[#141B22]/50 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
            }`}
          >
            <Sun className={`w-5 h-5 ${!darkMode ? 'text-[#A68A64]' : 'text-[#6B7280]'}`} />
            <span>حالت روشن (برف کرمی - #F7F7F2)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!darkMode) toggleDarkMode();
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm ${
              darkMode
                ? 'bg-[#141B22] text-[#F7F7F2] border-[#A68A64] shadow-md shadow-[#A68A64]/25 ring-2 ring-[#A68A64]/20'
                : 'bg-white/50 dark:bg-[#141B22]/50 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/20 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
            }`}
          >
            <Moon className={`w-5 h-5 ${darkMode ? 'text-[#C2A882]' : 'text-[#6B7280]'}`} />
            <span>حالت تیره (ذغال نوردیک - #1F2933)</span>
          </button>
        </div>

        {/* 60fps Performance Mode */}
        <div className="pt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] block">
              حالت پرسرعت (اسکرول روان ۶۰ فریم)
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
              کاهش بلور و سایه‌های سنگین جهت بهترین عملکرد روی تمام دستگاه‌ها
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={themeConfig.performanceMode ?? false}
              onChange={(e) => updateThemeConfig({ performanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#6B7280]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A68A64]"></div>
          </label>
        </div>
      </div>

      {/* 2. Background Style Card (Nordic Minimal & Silk Wave) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
          <div className="p-2 rounded-xl bg-[#4A6FA5]/15 text-[#4A6FA5] dark:text-[#60A5FA]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1F2933] dark:text-[#F7F7F2]">
              طرح و پس‌زمینه نوردیک
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
              انتخاب بین مینیمال سبک نوردیک و جلوه زنده موج ابریشمی
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
                className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#A68A64] bg-white dark:bg-[#141B22] shadow-md shadow-[#A68A64]/10 ring-2 ring-[#A68A64]/20'
                    : 'bg-white/60 dark:bg-[#141B22]/60 border-[#6B7280]/15 dark:border-[#D1D5DB]/10 hover:border-[#A68A64]/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${bg.previewClass} border border-[#D1D5DB] dark:border-[#6B7280] shrink-0`} />
                    <h4 className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">{bg.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70 mt-1">{bg.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Contacts & Persons Management Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
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

      {/* 4. Cloud Database & User Account */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
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

      {/* 5. Currency & Data Management */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-4 shadow-xs">
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

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/90 dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
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
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-[#A68A64]" />
            <span>دانلود فایل پشتیبان (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs cursor-pointer">
            <Upload className="w-4 h-4 text-[#2E7D5B] dark:text-[#4ADE80]" />
            <span>بازیابی از فایل پشتیبان</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleLoadDemo}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-[#141B22]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs"
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
