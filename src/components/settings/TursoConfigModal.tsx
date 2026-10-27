import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTursoConfig, testTursoConnection } from '../../services/tursoClient';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Info,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیمات پایگاه داده Turso"
      subtitle="همگام‌سازی ابری امن میان تمام دستگاه‌ها"
      size="lg"
    >
      <form id="turso-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Current status indicator */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
          <span className="font-bold text-fintech-text-muted">وضعیت اتصال:</span>
          {tursoStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              متصل به سرور ابری
            </span>
          ) : tursoStatus === 'connecting' ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              در حال بررسی و اتصال...
            </span>
          ) : tursoStatus === 'error' ? (
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              خطا در اتصال
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-fintech-text-muted font-bold">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              محلی (آفلاین)
            </span>
          )}
        </div>

        {/* Show tursoError if exists */}
        {tursoError && !feedback && (
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-start gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{tursoError}</span>
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
          <Wifi className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <b>نکته مهم شبکه:</b> دیتابیس Turso بر بستر ابری جهانی اجرا می‌شود. در صورت مواجهه با خطای ارتباطی (Fetch Failed یا Timeout)، از اتصال اینترنت یا DNS معتبر اطمینان حاصل کنید.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            آدرس پایگاه داده (Database URL)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="مثال: libsql://my-db-org.turso.io"
            dir="ltr"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500/50 transition"
          />
          <p className="text-[11px] text-fintech-text-muted mt-1">
            آدرس با پیشوند <code className="text-violet-300 font-mono">libsql://</code> یا <code className="text-violet-300 font-mono">https://</code>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
            توکن دسترسی (Auth Token)
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="توکن احراز هویت Turso"
            dir="ltr"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white outline-none focus:border-violet-500/50 transition"
          />
          <p className="text-[11px] text-fintech-text-muted mt-1">
            توکن صادر شده از دستور <code className="text-violet-300 font-mono">turso db tokens create [نام دیتابیس]</code>
          </p>
        </div>

        {/* Guide toggle button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-violet-400 hover:underline flex items-center gap-1 font-bold"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showGuide ? 'بستن راهنمای ساخت دیتابیس' : 'چگونه دیتابیس Turso بسازم و توکن بگیرم؟'}</span>
          </button>

          {showGuide && (
            <div className="mt-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-2 text-fintech-text-primary leading-relaxed">
              <p className="font-bold">مراحل ۳ گانه ساخت دیتابیس در Turso:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-fintech-text-muted">
                <li>ورود یا ثبت‌نام رایگان در سایت <a href="https://turso.tech" target="_blank" rel="noreferrer" className="text-violet-400 underline inline-flex items-center gap-0.5">turso.tech <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>اجرای دستور ساخت دیتابیس در ترمینال:
                  <div className="mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[10px] select-all" dir="ltr">
                    turso db create personal-accounting
                  </div>
                </li>
                <li>دریافت آدرس و ایجاد توکن دائمی:
                  <div className="mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[10px] select-all" dir="ltr">
                    turso db show personal-accounting --url<br/>
                    turso db tokens create personal-accounting -e none
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestOnly}
              disabled={isTesting}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
            >
              تست اتصال
            </Button>

            {currentConfig.url && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleClear}
                disabled={isTesting}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                حذف
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isTesting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              ذخیره و اتصال
            </Button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};
