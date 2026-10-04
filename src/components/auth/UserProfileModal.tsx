import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  X,
  User,
  Database,
  RefreshCw,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  CloudCheck,
  Cloud,
} from 'lucide-react';
import { TursoConfigModal } from '../settings/TursoConfigModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile, tursoStatus } = useAuth();
  const { cloudSyncStatus, syncAllToTurso } = useFinance();

  const [isTursoModalOpen, setIsTursoModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncAllToTurso();
    setIsSyncing(false);
    setStatusMessage({ type: 'success', text: 'داده‌ها با موفقیت با سرور ابری همگام‌سازی شدند.' });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const res = await updateProfile(
      displayName,
      showPasswordSection ? currentPassword : undefined,
      showPasswordSection ? newPassword : undefined
    );
    setIsSaving(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'اطلاعات کاربری با موفقیت بروزرسانی شد.' });
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'خطا در ویرایش اطلاعات کاربری.' });
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-5" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {user.displayName}
                </h3>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  @{user.username}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Turso Cloud Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>وضعیت اتصال ابری:</span>
              </span>
              {tursoStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                  خطا در اتصال به سرور
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  تنظیم نشده (حالت محلی)
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                وضعیت همگام‌سازی:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {cloudSyncStatus === 'synced'
                  ? 'تمامی داده‌ها روی سرور ذخیره هستند'
                  : cloudSyncStatus === 'syncing'
                  ? 'در حال ذخیره‌سازی روی سرور...'
                  : cloudSyncStatus === 'error'
                  ? 'خطا در ارسال به سرور'
                  : 'آفلاین'}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing || tursoStatus !== 'connected'}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>همگام‌سازی دستی با سرور</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTursoModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                تنظیمات سرور
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام نمایشی
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Toggle Change Password */}
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPasswordSection ? 'انصراف از تغییر کلمه عبور' : 'تغییر کلمه عبور'}</span>
              </button>
            </div>

            {showPasswordSection && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    کلمه عبور فعلی
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    کلمه عبور جدید (حداقل ۶ کاراکتر)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition disabled:opacity-50"
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج از حساب</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <TursoConfigModal
        isOpen={isTursoModalOpen}
        onClose={() => setIsTursoModalOpen(false)}
      />
    </>
  );
};
