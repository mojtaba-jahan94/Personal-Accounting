import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Database,
  RefreshCw,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile, tursoStatus } = useAuth();
  const { cloudSyncStatus, syncAllToTurso } = useFinance();

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={user.displayName}
      subtitle={`@${user.username} • مدیریت حساب کاربری`}
      size="md"
    >
      <div className="space-y-4">
        {/* Turso Cloud Status Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-fintech-text-muted flex items-center gap-1.5">
              <Database className="w-4 h-4 text-violet-400" />
              <span>اتصال ابری Turso:</span>
            </span>
            {tursoStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                متصل به سرور ابری
              </span>
            ) : tursoStatus === 'connecting' ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                در حال اتصال...
              </span>
            ) : tursoStatus === 'error' ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                خطا در اتصال
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-fintech-text-muted font-bold">
                <span className="w-2 h-2 rounded-full bg-white/30" />
                محلی (آفلاین)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-fintech-text-muted">
              وضعیت همگام‌سازی:
            </span>
            <span className="font-bold text-white">
              {cloudSyncStatus === 'synced'
                ? 'داده‌ها ذخیره و همگام هستند'
                : cloudSyncStatus === 'syncing'
                ? 'در حال ذخیره‌سازی ابری...'
                : cloudSyncStatus === 'error'
                ? 'خطا در ارسال به سرور'
                : 'آفلاین'}
            </span>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSyncNow}
              disabled={isSyncing || tursoStatus !== 'connected'}
              className="w-full"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              همگام‌سازی دستی با سرور ابری
            </Button>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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
        <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-fintech-text-primary mb-1">
              نام نمایشی
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white outline-none focus:border-violet-500/50 transition"
            />
          </div>

          {/* Toggle Change Password */}
          <div>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-xs text-violet-400 font-bold hover:underline flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showPasswordSection ? 'انصراف از تغییر کلمه عبور' : 'تغییر کلمه عبور'}</span>
            </button>
          </div>

          {showPasswordSection && (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-fintech-text-muted mb-1">
                  کلمه عبور فعلی
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs font-mono outline-none focus:border-violet-500/50 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-fintech-text-muted mb-1">
                  کلمه عبور جدید (حداقل ۶ کاراکتر)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs font-mono outline-none focus:border-violet-500/50 text-white"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
          >
            خروج از حساب
          </Button>

          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            disabled={isSaving}
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
