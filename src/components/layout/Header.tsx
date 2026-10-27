import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { getTodayJalali, getPersianDayOfWeek } from '../../utils/jalali';
import {
  Sun,
  Moon,
  Plus,
  ArrowLeftRight,
  MessageSquareText,
  Eye,
  EyeOff,
  Cloud,
  Search,
  Menu,
} from 'lucide-react';
import { UserProfileModal } from '../auth/UserProfileModal';
import { BrandLogo } from '../common/BrandLogo';
import { CommandSearchModal } from './CommandSearchModal';
import { NotificationsPopover } from './NotificationsPopover';
import { TabType } from './Sidebar';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
  onOpenSmsModal: () => void;
  onSelectTab?: (tab: TabType) => void;
  onToggleMobileSidebar?: () => void;
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
  onSelectTab,
  onToggleMobileSidebar,
  currentTab = 'dashboard',
}) => {
  const { totalBalance, currency, setCurrency, darkMode, toggleDarkMode, cloudSyncStatus } = useFinance();
  const { user, tursoStatus } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Privacy Mode / Balance Mask State
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
        // ignore
      }
      return next;
    });
  };

  const todayJalali = getTodayJalali();
  const todayDayName = getPersianDayOfWeek(new Date());
  const activeTitle = TAB_TITLES[currentTab] || 'حسابداری شخصی';

  return (
    <>
      <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300 select-none">
        <div className="glass-vision rounded-[2rem] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6 shadow-2xl relative overflow-hidden">
          {/* Top Edge Specular Shimmer */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Right Group (RTL Start): Mobile Hamburger, Brand, Active Title */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Sidebar Hamburger Button */}
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-fintech-text-muted hover:text-white transition active:scale-95"
                aria-label="منوی ناوبری"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-30 group-hover:opacity-75 blur transition duration-300 pointer-events-none" />
              <div className="relative">
                <BrandLogo size="md" animated={true} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] tracking-[0.2em] font-mono font-bold bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent uppercase">
                  AETHERIUM OS
                </span>
                <span className="text-white/20 text-[9px] hidden sm:inline">•</span>
                <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                  {todayDayName} {todayJalali}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate leading-none">
                {activeTitle}
              </h1>
            </div>
          </div>

          {/* Center Group: Global Search Bar Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/30 text-zinc-400 hover:text-white transition-all duration-200 w-52 lg:w-72 cursor-pointer group shadow-inner"
          >
            <div className="flex items-center gap-2 text-xs">
              <Search className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">جستجوی هوشمند...</span>
            </div>
            <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:border-violet-500/40 group-hover:text-violet-300 transition">
              ⌘K
            </kbd>
          </button>

          {/* Left Controls (RTL End): Notifications, Balance, Currency, Theme, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Search Icon (Mobile / Tablet) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white transition active:scale-95"
              title="جستجو"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Popover */}
            {onSelectTab && <NotificationsPopover onSelectTab={onSelectTab} />}

            {/* Cloud Sync Status Indicator with Neon Beacon */}
            <div
              title={`وضعیت ابری: ${tursoStatus || cloudSyncStatus}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-mono cursor-default"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  tursoStatus === 'connected' || cloudSyncStatus === 'synced'
                    ? 'bg-emerald-400 animate-neon-pulse'
                    : tursoStatus === 'connecting' || cloudSyncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              />
              <Cloud className="w-3.5 h-3.5 text-violet-400" />
            </div>

            {/* Privacy Mode Toggle */}
            <button
              type="button"
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? 'نمایش موجودی' : 'مخفی‌سازی موجودی (حالت حریم خصوصی)'}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white transition active:scale-95"
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4 text-violet-400" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* SMS Bank Assistant */}
            <button
              onClick={onOpenSmsModal}
              title="دستیار هوشمند پیامک بانکی"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-zinc-200 transition active:scale-95 hover:border-violet-500/30"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-violet-400" />
              <span>پیامک</span>
            </button>

            {/* Quick Transfer Button */}
            <button
              onClick={onOpenTransferModal}
              title="انتقال وجه بین‌حسابی"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-zinc-200 transition active:scale-95 hover:border-violet-500/30"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />
              <span>انتقال</span>
            </button>

            {/* New Transaction Button (Gradient Pill with Glow) */}
            <button
              onClick={onOpenTransactionModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:brightness-110 rounded-2xl shadow-glow-violet transition-all duration-200 active:scale-95 border border-white/20"
              title="ثبت تراکنش جدید"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ثبت تراکنش</span>
            </button>

            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
              className="px-2.5 py-1.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition active:scale-95"
              title="تغییر واحد پول (تومان / ریال)"
            >
              {currency === 'toman' ? 'تومان' : 'ریال'}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white transition active:scale-95"
              title="تغییر تم روز / شب"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-violet-400" />}
            </button>

            {/* User Profile Avatar */}
            {user && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title={`پروفایل کاربر: ${user.displayName}`}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition active:scale-95 hover:border-violet-500/30"
              >
                <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-glow-violet">
                  {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline text-xs font-medium text-white truncate max-w-[80px]">
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

        {onSelectTab && (
          <CommandSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectTab={onSelectTab}
          />
        )}
      </header>
    </>
  );
};

export default Header;
