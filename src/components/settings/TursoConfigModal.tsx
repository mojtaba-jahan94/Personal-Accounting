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
        message: 'اتصال به پایگاه داده ابری با موفقیت برقرار شد و تنظیمات ذخیره گردید.',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
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
    if (window.confirm('آیا از قطع ارتباط و حذف تنظیمات دیتابیس Turso اطمینان دارید؟ برنامه به حالت محلی سوئیچ خواهد شد.')) {
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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                تنظیمات پایگاه داده Turso
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                همگام‌سازی ابری امن میان تمام دستگاه‌ها
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
        <form id="turso-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Current status indicator */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs">
            <span className="font-bold text-[#6B7280] dark:text-[#D1D5DB]">وضعیت اتصال:</span>
            {tursoStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-[#2E7D5B] dark:text-[#4ADE80] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
                متصل به سرور ابری
              </span>
            ) : tursoStatus === 'connecting' ? (
              <span className="flex items-center gap-1.5 text-[#A68A64] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#A68A64] animate-pulse" />
                در حال بررسی و اتصال...
              </span>
            ) : tursoStatus === 'error' ? (
              <span className="flex items-center gap-1.5 text-[#C0564B] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#C0564B]" />
                خطا در اتصال
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#6B7280] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                محلی (آفلاین)
              </span>
            )}
          </div>

          {/* Show tursoError if exists */}
          {tursoError && !feedback && (
            <div className="p-3 rounded-2xl bg-[#C0564B]/10 text-[#C0564B] border border-[#C0564B]/20 flex items-start gap-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tursoError}</span>
            </div>
          )}

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
                feedback.type === 'success'
                  ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/30'
                  : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/30'
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
          <div className="p-3.5 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/25 text-[11px] text-[#A68A64] dark:text-[#C2A882] flex items-start gap-2.5">
            <Wifi className="w-4 h-4 shrink-0 mt-0.5 text-[#A68A64]" />
            <div className="leading-relaxed">
              <b>نکته مهم شبکه:</b> دیتابیس Turso بر بستر ابری جهانی اجرا می‌شود. در صورت مواجهه با خطای ارتباطی (Fetch Failed یا Timeout)، از اتصال اینترنت یا DNS معتبر اطمینان حاصل کنید.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1.5">
              آدرس پایگاه داده (Database URL)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="مثال: libsql://my-db-org.turso.io"
              dir="ltr"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
            />
            <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB] mt-1">
              آدرس با پیشوند <code className="text-[#A68A64] font-mono">libsql://</code> یا <code className="text-[#A68A64] font-mono">https://</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1.5">
              توکن دسترسی (Auth Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="توکن احراز هویت Turso"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
            />
            <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB] mt-1">
              توکن صادر شده از دستور <code className="text-[#A68A64] font-mono">turso db tokens create [نام دیتابیس]</code>
            </p>
          </div>

          {/* Guide toggle button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-[#A68A64] hover:underline flex items-center gap-1 font-bold"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showGuide ? 'بستن راهنمای ساخت دیتابیس' : 'چگونه دیتابیس Turso بسازم و توکن بگیرم؟'}</span>
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3 rounded-2xl bg-[#6B7280]/5 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs space-y-2 text-[#1F2933] dark:text-[#F7F7F2] leading-relaxed">
                <p className="font-bold">مراحل ۳ گانه ساخت دیتابیس در Turso:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#6B7280] dark:text-[#D1D5DB]">
                  <li>ورود یا ثبت‌نام رایگان در سایت <a href="https://turso.tech" target="_blank" rel="noreferrer" className="text-[#A68A64] underline inline-flex items-center gap-0.5">turso.tech <ExternalLink className="w-2.5 h-2.5" /></a></li>
                  <li>اجرای دستور ساخت دیتابیس در ترمینال:
                    <div className="mt-1 p-2 rounded-lg bg-black/5 dark:bg-[#141B22] border border-[#6B7280]/15 dark:border-white/10 text-[#1F2933] dark:text-[#F7F7F2] font-mono text-[10px] select-all" dir="ltr">
                      turso db create personal-accounting
                    </div>
                  </li>
                  <li>دریافت آدرس و ایجاد توکن دائمی:
                    <div className="mt-1 p-2 rounded-lg bg-black/5 dark:bg-[#141B22] border border-[#6B7280]/15 dark:border-white/10 text-[#1F2933] dark:text-[#F7F7F2] font-mono text-[10px] select-all" dir="ltr">
                      turso db show personal-accounting --url<br/>
                      turso db tokens create personal-accounting -e none
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#1F2933]/90 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestOnly}
              disabled={isTesting}
              className="py-2.5 px-3 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>تست اتصال</span>
            </button>

            {currentConfig.url && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isTesting}
                title="قطع ارتباط و بازگشت به حالت محلی"
                className="py-2.5 px-3 rounded-xl bg-[#C0564B]/15 hover:bg-[#C0564B]/25 text-[#C0564B] text-xs font-bold transition flex items-center gap-1.5 border border-[#C0564B]/30 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حذف</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#6B7280]/10 text-xs font-bold transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              form="turso-form"
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ذخیره و اتصال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
