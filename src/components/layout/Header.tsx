import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { getTodayJalali, getPersianDayOfWeek } from '../../utils/jalali';
import {
  Sun,
  Moon,
  Plus,
  Wallet,
  ArrowLeftRight,
  MessageSquareText,
  Eye,
  EyeOff,
  Cloud,
  Calendar,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { UserProfileModal } from '../auth/UserProfileModal';
import { BrandLogo } from '../common/BrandLogo';
import { TabType } from './Sidebar';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
  onOpenSmsModal: () => void;
  currentTab?: TabType;
}

const TAB_TITLES: Record<TabType, string> = {
  dashboard: 'داشبورد اصلی',
  transactions: 'تراکنش‌ها و اسناد',
  assets: 'مدیریت دارایی و طلا',
  accounts: 'حساب‌ها و کارت‌ها',
  budgets: 'بودجه‌بندی ماهانه',
  goals: 'اهداف مالی و پس‌انداز',
  debts: 'بدهی، طلب و چک',
  reports: 'گزارش‌ها و تحلیل',
  settings: 'تنظیمات و ظاهر',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenTransactionModal,
  onOpenTransferModal,
  onOpenSmsModal,
  currentTab = 'dashboard',
}) => {
  const { totalBalance, currency, setCurrency, darkMode, toggleDarkMode } = useFinance();
  const { user, tursoStatus } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Privacy Mode / Balance Mask State (persisted in localStorage)
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pf_privacy_mode') === 'true';
    } catch {
      return false;
    }
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pf_privacy_mode', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Jalali Today Info
  const todayJalali = getTodayJalali();
  const todayDayName = getPersianDayOfWeek(new Date());

  const activeTitle = TAB_TITLES[currentTab] || 'حسابداری شخصی';

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300 select-none">
      <div className="bg-[#F7F7F2]/90 dark:bg-[#1F2933]/85 backdrop-blur-2xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 rounded-3xl px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-xl">
        {/* Left / Start: Active View Title & Jalali Date Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo size="md" animated={true} />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight truncate flex items-center gap-2">
              <span>{activeTitle}</span>
            </h1>

            {/* Jalali Date Badge */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB]/80 mt-0.5">
              <Calendar className="w-3 h-3 text-[#A68A64]" />
              <span className="font-mono">{todayDayName} {todayJalali}</span>
            </div>
          </div>
        </div>

        {/* Center: Balance Capsule with Privacy Mode Mask */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-[#1F2933]/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 transition">
          <div className="w-2 h-2 rounded-full bg-[#2E7D5B] dark:bg-[#4ADE80] shadow-xs shadow-[#2E7D5B]/50" />
          <span className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/80 font-medium">موجودی کل:</span>
          <span className="text-xs sm:text-sm font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight font-mono">
            {isPrivacyMode ? '••••••••' : formatCurrency(totalBalance, currency)}
          </span>
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'نمایش موجودی' : 'مخفی‌سازی موجودی (حالت حریم خصوصی)'}
            className="p-1 rounded-lg text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-[#F7F7F2] hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-[#A68A64]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right / Controls: Turso Sync Pill, Quick Actions, Theme Toggle, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Turso Cloud Sync Status Pill */}
          <div
            title="وضعیت همگام‌سازی ابری Turso"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs font-bold select-none cursor-default"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tursoStatus === 'connected'
                  ? 'bg-[#2E7D5B] dark:bg-[#4ADE80] shadow-xs shadow-[#2E7D5B]/60'
                  : tursoStatus === 'connecting'
                  ? 'bg-[#A68A64] animate-pulse'
                  : tursoStatus === 'error'
                  ? 'bg-[#C0564B] dark:bg-[#F87171]'
                  : 'bg-[#6B7280]'
              }`}
            />
            <Cloud className="w-3.5 h-3.5 text-[#A68A64]" />
            <span className="hidden lg:inline text-[11px] text-[#1F2933] dark:text-[#F7F7F2]">
              {tursoStatus === 'connected' ? 'ابری متصل' : tursoStatus === 'connecting' ? 'اتصال...' : tursoStatus === 'error' ? 'خطا' : 'محلی'}
            </span>
          </div>

          {/* Privacy Toggle (Mobile) */}
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'نمایش موجودی' : 'مخفی‌سازی موجودی'}
            className="md:hidden p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB]"
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-[#A68A64]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* SMS Bank Assistant */}
          <button
            onClick={onOpenSmsModal}
            title="دستیار هوشمند پیامک بانکی"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] hover:bg-[#A68A64]/10 hover:text-[#A68A64] transition"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-[#A68A64]" />
            <span className="hidden md:inline">پیامک بانک</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها و حساب‌ها"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] hover:bg-[#A68A64]/10 hover:text-[#A68A64] transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#A68A64]" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button (Primary Warm Wood Accent) */}
          <button
            onClick={onOpenTransactionModal}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold text-[#F7F7F2] bg-[#A68A64] hover:bg-[#8A704C] rounded-xl shadow-md shadow-[#A68A64]/25 active:scale-95 transition-all"
            title="ثبت تراکنش جدید"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ثبت تراکنش</span>
          </button>

          {/* Currency Toggle Pill */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] hover:bg-black/10 dark:hover:bg-white/10 transition"
            title="تغییر واحد پول (تومان / ریال)"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-black/10 dark:hover:bg-white/10 transition flex items-center justify-center"
            title="تغییر تم روز / شب"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#A68A64]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1F2933]" />
            )}
          </button>

          {/* User Profile Capsule */}
          {user && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title={`حساب کاربری: ${user.displayName}`}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] hover:bg-black/10 dark:hover:bg-white/10 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden xl:inline truncate max-w-[80px] text-[11px] font-bold">
                {user.displayName}
              </span>
            </button>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

export default Header;

