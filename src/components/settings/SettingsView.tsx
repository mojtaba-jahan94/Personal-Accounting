import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
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
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currency,
    setCurrency,
    darkMode,
    toggleDarkMode,
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

  // Download Backup JSON
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

  // Import Backup JSON
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">تنظیمات و پشتیبان‌گیری</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          شخصی‌سازی، خروجی پشتیبان و مدیریت داده‌های محلی
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="glass-card p-5 border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              امنیت و حریم خصوصی ۱۰۰٪ (Local-First)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              تمام اطلاعات مالی، حساب‌ها، چک‌ها و تراکنش‌های شما صرفاً روی حافظه محلی مرورگر خودتان
              ذخیره می‌شود. هیچ داده‌ای به هیچ سرور خارجی منتقل نمی‌شود و برنامه کاملاً به صورت آفلاین
              کار می‌کند. توصیه می‌شود مرتباً فایل پشتیبان دانلود نمایید.
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">تنظیمات کاربری</h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Currency */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-indigo-500" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  واحد پولی پیش‌فرض
                </span>
                <span className="text-[11px] text-slate-400">تومان یا ریال در کل سیستم</span>
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

          {/* Theme */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  حالت نمایش (تم)
                </span>
                <span className="text-[11px] text-slate-400">سوئیچ بین تم روشن و تاریک</span>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? 'تغییر به تم روشن' : 'تغییر به تم دارک'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">پشتیبان‌گیری و بازیابی داده‌ها</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Download Backup */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-right transition flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                تهیه فایل پشتیبان (JSON)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                دانلود تمام تراکنش‌ها، بودجه‌ها، حساب‌ها و چک‌ها در یک فایل
              </p>
            </div>
          </button>

          {/* Import Backup */}
          <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-right transition flex items-start gap-3 cursor-pointer">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                بازیابی نسخه پشتیبان
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                بارگذاری فایل JSON پشتیبان قبلی و بازیابی داده‌ها
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

        {/* Load Demo & Reset */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            <span>بارگذاری داده‌های نمونه تستی</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>پاکسازی کامل همه داده‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
};
