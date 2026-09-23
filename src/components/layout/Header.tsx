import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Sun, Moon, Plus, Wallet, ArrowLeftRight, Smartphone, MessageSquareText } from 'lucide-react';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
  onOpenSmsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTransactionModal,
  onOpenTransferModal,
  onOpenSmsModal,
}) => {
  const { totalBalance, currency, setCurrency, darkMode, toggleDarkMode } = useFinance();
  const [showPwaTip, setShowPwaTip] = useState(false);

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      <div
        className="glass-capsule-bar px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4"
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
              مدیر مالی هوشمند
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              حسابداری شخصی آفلاین
            </p>
          </div>
        </div>

        {/* Center Minimal Balance Capsule */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 transition">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">موجودی کل:</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            {formatCurrency(totalBalance, currency)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Guide */}
          <button
            onClick={() => setShowPwaTip(!showPwaTip)}
            title="راهنمای نصب برنامه روی گوشی (PWA)"
            className="glass-pill flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">نصب</span>
          </button>

          {/* SMS Bank Assistant */}
          <button
            onClick={onOpenSmsModal}
            title="دستیار پیامک بانکی"
            className="glass-pill flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">پیامک بانک</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها و حساب‌ها"
            className="glass-pill hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button (Primary Accent) */}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-full shadow-sm active:scale-95 transition-all"
            title="ثبت تراکنش جدید"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">ثبت تراکنش</span>
          </button>

          {/* Currency Toggle Pill */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="glass-pill px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
            title="تغییر واحد پول (تومان / ریال)"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="glass-pill p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 flex items-center justify-center"
            title="تغییر تم روز / شب"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Floating PWA Tip Banner */}
      {showPwaTip && (
        <div className="mt-2 p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs flex items-center justify-between gap-3 shadow-lg border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="leading-relaxed">
              💡 <b>نصب برنامه وب روی موبایل (PWA):</b> در مرورگر موبایل، از منوی سه‌نقطه دکمه <b>«Add to Home screen» یا «Install app»</b> را بزنید تا برنامه بدون نوار آدرس مرورگر به صورت تمام‌صفحه باز شود.
            </span>
          </div>
          <button
            onClick={() => setShowPwaTip(false)}
            className="glass-pill px-3 py-1 text-xs font-bold shrink-0 text-slate-600 dark:text-slate-300"
          >
            بستن
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
