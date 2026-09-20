import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Sun, Moon, Plus, Wallet, ArrowLeftRight, Smartphone, MessageSquareText, Sparkles } from 'lucide-react';

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
        data-glass
        className="glass-dynamic-island specular-sheen px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 transition-all"
      >
        {/* Brand / Logo with Spatial Liquid Glass Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/60 dark:ring-white/20 active:scale-95 transition-transform">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xs opacity-0 group-hover:opacity-60 transition duration-300 pointer-events-none" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                مدیر مالی هوشمند
              </h1>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                iOS 27
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              حسابداری شخصی آفلاین و مدرن
            </p>
          </div>
        </div>

        {/* Center Dynamic Island Balance Capsule */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-xs backdrop-blur-md hover:border-indigo-500/30 transition">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">موجودی کل:</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-tight font-mono">
            {formatCurrency(totalBalance, currency)}
          </span>
        </div>

        {/* Action Controls & Glass Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Guide */}
          <button
            onClick={() => setShowPwaTip(!showPwaTip)}
            title="راهنمای نصب برنامه روی گوشی (PWA)"
            className="glass-pill flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400"
          >
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xl:inline">نصب PWA</span>
          </button>

          {/* SMS Bank Assistant */}
          <button
            onClick={onOpenSmsModal}
            title="دستیار هوشمند پیامک بانکی"
            className="glass-pill flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500"
          >
            <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
            <span className="hidden md:inline">پیامک بانک</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها و حساب‌ها"
            className="glass-pill hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button (Vibrant Glow Pill) */}
          <button
            onClick={onOpenTransactionModal}
            className="relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full shadow-lg shadow-indigo-600/35 active:scale-95 transition-all ring-1 ring-white/30 group"
            title="ثبت تراکنش جدید"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">ثبت تراکنش</span>
          </button>

          {/* Currency Toggle Pill */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="glass-pill px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
            title="تغییر واحد پول (تومان / ریال)"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="glass-pill p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 flex items-center justify-center"
            title="تغییر تم روز / شب"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* Floating PWA Tip Banner */}
      {showPwaTip && (
        <div className="mt-2 p-3 sm:p-4 rounded-2xl glass-dynamic-island text-slate-900 dark:text-white text-xs flex items-center justify-between gap-3 shadow-xl border border-indigo-500/30 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="leading-relaxed">
              💡 <b>نصب برنامه وب روی موبایل (PWA):</b> در مرورگر کروم یا سامسونگ، از منوی سه‌نقطه دکمه <b>«Add to Home screen» یا «Install app»</b> را بزنید تا برنامه بدون نوار مرورگر به صورت تمام‌صفحه باز شود.
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
