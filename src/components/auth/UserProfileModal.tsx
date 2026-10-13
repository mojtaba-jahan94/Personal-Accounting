import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  X,
  Database,
  RefreshCw,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
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
      <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="w-full sm:max-w-md max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Mobile drag handle */}
          <div className="pt-2 sm:hidden flex justify-center">
            <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
          </div>

          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center font-black text-base shadow-sm">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-[#1F2933] dark:text-[#F7F7F2] text-base">
                  {user.displayName}
                </h3>
                <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB] font-mono" dir="ltr">
                  @{user.username}
                </span>
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
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
            {/* Turso Cloud Status Card */}
            <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#6B7280] dark:text-[#D1D5DB] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#A68A64]" />
                  <span>اتصال ابری Turso:</span>
                </span>
                {tursoStatus === 'connected' ? (
                  <span className="flex items-center gap-1.5 text-[#2E7D5B] dark:text-[#4ADE80] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />
                    متصل به سرور ابری
                  </span>
                ) : tursoStatus === 'connecting' ? (
                  <span className="flex items-center gap-1.5 text-[#A68A64] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#A68A64] animate-pulse" />
                    در حال اتصال...
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

              <div className="flex items-center justify-between pt-2 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs">
                <span className="text-[#6B7280] dark:text-[#D1D5DB]">
                  وضعیت همگام‌سازی:
                </span>
                <span className="font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  {cloudSyncStatus === 'synced'
                    ? 'داده‌ها ذخیره و همگام هستند'
                    : cloudSyncStatus === 'syncing'
                    ? 'در حال ذخیره‌سازی ابری...'
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
                  className="flex-1 py-2 px-3 rounded-xl bg-[#A68A64]/15 hover:bg-[#A68A64]/25 text-[#A68A64] text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#A68A64]/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>همگام‌سازی دستی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTursoModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-[#6B7280]/10 hover:bg-[#6B7280]/20 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold transition border border-[#6B7280]/15"
                >
                  تنظیمات دیتابیس
                </button>
              </div>
            </div>

            {/* Feedback message */}
            {statusMessage && (
              <div
                className={`p-3 rounded-2xl flex items-start gap-2 text-xs font-bold ${
                  statusMessage.type === 'success'
                    ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/30'
                    : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/30'
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
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                  نام نمایشی
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#182028]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] transition"
                />
              </div>

              {/* Toggle Change Password */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-xs text-[#A68A64] font-bold hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showPasswordSection ? 'انصراف از تغییر کلمه عبور' : 'تغییر کلمه عبور'}</span>
                </button>
              </div>

              {showPasswordSection && (
                <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB] mb-1">
                      کلمه عبور فعلی
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB] mb-1">
                      کلمه عبور جدید (حداقل ۶ کاراکتر)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono outline-none focus:border-[#A68A64]"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-[#C0564B]/15 hover:bg-[#C0564B]/25 text-[#C0564B] text-xs font-bold transition flex items-center gap-1.5 border border-[#C0564B]/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از حساب</span>
            </button>

            <button
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>
      </div>

      <TursoConfigModal
        isOpen={isTursoModalOpen}
        onClose={() => setIsTursoModalOpen(false)}
      />
    </>
  );
};
