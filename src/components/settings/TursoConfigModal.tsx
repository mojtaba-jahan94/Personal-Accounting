import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTursoConfig } from '../../services/tursoClient';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface TursoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TursoConfigModal: React.FC<TursoConfigModalProps> = ({ isOpen, onClose }) => {
  const { configureTurso, tursoStatus, tursoError } = useAuth();
  const currentConfig = getTursoConfig();

  const [url, setUrl] = useState(currentConfig.url);
  const [token, setToken] = useState(currentConfig.authToken);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setFeedback(null);

    const res = await configureTurso(url, token);
    setIsTesting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'اتصال به پایگاه داده با موفقیت برقرار شد و تنظیمات ذخیره گردید.' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.error || 'خطا در برقراری اتصال به سرور Turso.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-5">
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
          <span className="font-bold text-slate-600 dark:text-slate-400">وضعیت اتصال فعلی:</span>
          {tursoStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متصل به سرور
            </span>
          ) : tursoStatus === 'connecting' ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              در حال بررسی
            </span>
          ) : tursoStatus === 'error' ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              خطا در اتصال
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              تنظیم نشده
            </span>
          )}
        </div>

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
            <span>{feedback.message}</span>
          </div>
        )}

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
              می‌توانید از آدرس‌های با پیشوند <code className="text-indigo-600 dark:text-indigo-400 font-mono">libsql://</code> یا <code className="text-indigo-600 dark:text-indigo-400 font-mono">https://</code> استفاده نمایید.
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
              توکن صادر شده از دستور <code className="text-indigo-600 dark:text-indigo-400 font-mono">turso db tokens create</code>
            </p>
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی اتصال...</span>
                </>
              ) : (
                <span>بررسی اتصال و ذخیره</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
