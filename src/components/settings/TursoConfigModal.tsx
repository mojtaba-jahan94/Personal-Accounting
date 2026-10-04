import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTursoConfig, testTursoConnection } from '../../services/tursoClient';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Info,
  ExternalLink,
  Wifi,
} from 'lucide-react';

interface TursoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TursoConfigModal: React.FC<TursoConfigModalProps> = ({ isOpen, onClose }) => {
  const { configureTurso, resetTursoConfig, tursoStatus, tursoError } = useAuth();
  const currentConfig = getTursoConfig();

  const [url, setUrl] = useState(currentConfig.url);
  const [token, setToken] = useState(currentConfig.authToken);
  const [isTesting, setIsTesting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setFeedback(null);

    const res = await configureTurso(url, token);
    setIsTesting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'اتصال به پایگاه داده با موفقیت برقرار شد و تنظیمات ذخیره گردید.',
      });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'خطا در برقراری اتصال به سرور Turso.',
      });
    }
  };

  const handleTestOnly = async () => {
    if (!url.trim()) {
      setFeedback({ type: 'error', message: 'لطفاً ابتدا آدرس پایگاه داده را وارد کنید.' });
      return;
    }
    setIsTesting(true);
    setFeedback(null);

    const res = await testTursoConnection(url, token);
    setIsTesting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'ارتباط با سرور Turso بدون نقص برقرار است! (می‌توانید ذخیره کنید)',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'خطا در برقراری اتصال به پایگاه داده Turso.',
      });
    }
  };

  const handleClear = async () => {
    if (window.confirm('آیا از قطع ارتباط و حذف تنظیمات پایگاه داده Turso از این مرورگر اطمینان دارید؟ برنامه به حالت محلی سوئیچ خواهد شد.')) {
      await resetTursoConfig();
      setUrl('');
      setToken('');
      setFeedback({
        type: 'success',
        message: 'تنظیمات دیتابیس با موفقیت حذف شد و برنامه به حالت محلی برگشت.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              تنظیمات پایگاه داده Turso
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status indicator */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-400">وضعیت اتصال:</span>
          {tursoStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متصل به سرور ابری
            </span>
          ) : tursoStatus === 'connecting' ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              در حال بررسی و اتصال...
            </span>
          ) : tursoStatus === 'error' ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              خطا در اتصال
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              تنظیم نشده (حالت محلی)
            </span>
          )}
        </div>

        {/* Show tursoError if exists */}
        {tursoError && !feedback && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{tursoError}</span>
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Network & ISP Notice */}
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <Wifi className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="leading-relaxed">
            <b>نکته مهم ارتباطی:</b> دیتابیس Turso بر بستر سرورهای ابری خارجی قرار دارد. در صورت مواجهه با خطای عدم پاسخگویی سرور (Timeout یا Fetch Failed)، از فعال بودن فیلترشکن یا DNS معتبر اطمینان حاصل فرمایید.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              آدرس پایگاه داده (Database URL)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="مثال: libsql://my-db-org.turso.io"
              dir="ltr"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              آدرس با پیشوند <code className="text-indigo-600 dark:text-indigo-400 font-mono">libsql://</code> یا <code className="text-indigo-600 dark:text-indigo-400 font-mono">https://</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              توکن دسترسی (Auth Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="توکن احراز هویت Turso"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              توکن صادر شده از دستور <code className="text-indigo-600 dark:text-indigo-400 font-mono">turso db tokens create [نام دیتابیس]</code>
            </p>
          </div>

          {/* Guide toggle button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showGuide ? 'بستن راهنمای ساخت دیتابیس Turso' : 'چگونه دیتابیس Turso بسازم و توکن بگیرم؟'}</span>
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                <p className="font-bold text-slate-900 dark:text-white">مراحل ۳ گانه ساخت دیتابیس در Turso:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>ورود یا ثبت‌نام رایگان در سایت <a href="https://turso.tech" target="_blank" rel="noreferrer" className="text-indigo-500 underline inline-flex items-center gap-0.5">turso.tech <ExternalLink className="w-2.5 h-2.5" /></a></li>
                  <li>اجرای دستور ساخت دیتابیس در خط فرمان:
                    <div className="mt-1 p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] select-all" dir="ltr">
                      turso db create personal-accounting
                    </div>
                  </li>
                  <li>دریافت آدرس و ایجاد توکن دائمی:
                    <div className="mt-1 p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] select-all" dir="ltr">
                      turso db show personal-accounting --url<br/>
                      turso db tokens create personal-accounting -e none
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>ذخیره و اتصال</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestOnly}
              disabled={isTesting}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فقط آزمایش اتصال</span>
            </button>

            {currentConfig.url && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isTesting}
                title="قطع ارتباط و بازگشت به حالت محلی"
                className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف تنظیمات</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

