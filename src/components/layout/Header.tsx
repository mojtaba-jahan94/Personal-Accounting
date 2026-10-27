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
      <div className="bg-[#F7F7F2]/90 dark:bg-[#121215]/90 backdrop-blur-2xl border border-[#6B7280]/15 dark:border-white/[0.08] rounded-3xl px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6 shadow-xl dark:shadow-[0_24px_50px_rgba(0,0,0,0.85)]">
        {/* Left / Start: Active View Title, AURUM Badge & Jalali Date */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <BrandLogo size="md" animated={true} />

          <div className="min-w-0">
            {/* Top Micro-Badge & Date */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] tracking-[0.22em] text-[#A68A64] dark:text-[#DFC296] uppercase font-mono font-bold flex items-center gap-1">
                <span>✦ AURUM PRIVATE</span>
              </span>
              <span className="text-[#8E8B82] text-[9px] hidden sm:inline">•</span>
              {/* Date Micro-Label */}
              <span className="text-[11px] tracking-widest text-[#8E8B82] font-mono hidden sm:inline">
                {todayDayName} {todayJalali}
              </span>
            </div>

            {/* Editorial View Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-[#1F2933] dark:text-[#F4F0EA] truncate font-serif leading-none">
              {activeTitle}
            </h1>

            {/* Date on Mobile */}
            <span className="text-[10px] tracking-widest text-[#8E8B82] font-mono sm:hidden block mt-0.5">
              {todayDayName} {todayJalali}
            </span>
          </div>
        </div>

        {/* Center: Balance Capsule with Privacy Mode Mask */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#1F2933]/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] transition">
          <div className="w-2 h-2 rounded-full bg-[#2E7D5B] dark:bg-[#7A9A95] shadow-xs shadow-[#7A9A95]/50" />
          <span className="text-[11px] text-[#6B7280] dark:text-[#8E8B82] font-medium font-mono tracking-wider">موجودی کل:</span>
          <span className="text-sm sm:text-base font-semibold text-[#1F2933] dark:text-[#F4F0EA] tracking-tight font-mono">
            {isPrivacyMode ? '••••••••' : formatCurrency(totalBalance, currency)}
          </span>
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'نمایش موجودی' : 'مخفی‌سازی موجودی (حالت حریم خصوصی)'}
            className="p-1 rounded-lg text-[#6B7280] hover:text-[#1F2933] dark:text-[#8E8B82] dark:hover:text-[#DFC296] hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-[#DFC296]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right / Controls: Turso Sync Pill, Quick Actions, Theme Toggle, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Turso Cloud Sync Status Pill */}
          <div
            title="وضعیت همگام‌سازی ابری Turso"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-xs font-bold select-none cursor-default"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tursoStatus === 'connected'
                  ? 'bg-[#2E7D5B] dark:bg-[#7A9A95] shadow-xs shadow-[#7A9A95]/60'
                  : tursoStatus === 'connecting'
                  ? 'bg-[#DFC296] animate-pulse'
                  : tursoStatus === 'error'
                  ? 'bg-[#C0564B] dark:bg-[#C98A82]'
                  : 'bg-[#6B7280]'
              }`}
            />
            <Cloud className="w-3.5 h-3.5 text-[#DFC296]" />
            <span className="hidden xl:inline text-[11px] text-[#1F2933] dark:text-[#8E8B82] font-mono">
              {tursoStatus === 'connected' ? 'ابری متصل' : tursoStatus === 'connecting' ? 'اتصال...' : tursoStatus === 'error' ? 'خطا' : 'محلی'}
            </span>
          </div>

          {/* Privacy Toggle (Mobile / Tablet) */}
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'نمایش موجودی' : 'مخفی‌سازی موجودی'}
            className="lg:hidden p-2 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-[#6B7280] dark:text-[#8E8B82]"
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-[#DFC296]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* SMS Bank Assistant */}
          <button
            onClick={onOpenSmsModal}
            title="دستیار هوشمند پیامک بانکی"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-xs font-bold text-[#1F2933] dark:text-[#F4F0EA] hover:bg-[#DFC296]/10 hover:text-[#DFC296] transition"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-[#DFC296]" />
            <span className="hidden md:inline">پیامک بانک</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها و حساب‌ها"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-xs font-bold text-[#1F2933] dark:text-[#F4F0EA] hover:bg-[#DFC296]/10 hover:text-[#DFC296] transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#DFC296]" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button (AURUM Champagne Gold) */}
          <button
            onClick={onOpenTransactionModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-[#0A0A0C] bg-[#DFC296] hover:bg-[#CBB084] rounded-xl shadow-lg shadow-[#DFC296]/20 active:scale-95 transition-all"
            title="ثبت تراکنش جدید"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ثبت تراکنش</span>
          </button>

          {/* Currency Toggle Pill */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-xs font-bold text-[#1F2933] dark:text-[#8E8B82] hover:text-[#F4F0EA] hover:bg-black/10 dark:hover:bg-white/[0.08] transition font-mono"
            title="تغییر واحد پول (تومان / ریال)"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-[#6B7280] dark:text-[#8E8B82] hover:bg-black/10 dark:hover:bg-white/[0.08] transition flex items-center justify-center"
            title="تغییر تم روز / شب"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#DFC296]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1F2933]" />
            )}
          </button>

          {/* User Profile Capsule */}
          {user && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title={`حساب کاربری: ${user.displayName}`}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-[#6B7280]/15 dark:border-white/[0.08] text-xs font-bold text-[#1F2933] dark:text-[#F4F0EA] hover:bg-black/10 dark:hover:bg-white/[0.08] transition"
            >
              <div className="w-6 h-6 rounded-lg bg-[#DFC296] text-[#0A0A0C] flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden xl:inline truncate max-w-[80px] text-[11px] font-bold text-[#F4F0EA]">
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

