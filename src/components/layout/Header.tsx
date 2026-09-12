import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Sun, Moon, Plus, Wallet, ArrowLeftRight, Smartphone, Download } from 'lucide-react';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTransactionModal,
  onOpenTransferModal,
}) => {
  const { totalBalance, currency, setCurrency, darkMode, toggleDarkMode } = useFinance();
  const [showPwaTip, setShowPwaTip] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full liquid-glass border-b border-white/20 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/40 dark:ring-white/10">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
              مدیر مالی هوشمند
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              لیکویید گلس • حسابداری شخصی آفلاین
            </p>
          </div>
        </div>

        {/* Center Balance Capsule */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">موجودی کل:</span>
          <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalBalance, currency)}
          </span>
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Install PWA Guide Button */}
          <button
            onClick={() => setShowPwaTip(!showPwaTip)}
            title="نصب اپلیکیشن روی گوشی (PWA)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 transition shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">نصب برنامه</span>
          </button>

          {/* Transfer button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 rounded-xl transition border border-transparent hover:border-white/30"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 rounded-2xl shadow-md shadow-indigo-600/30 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">ثبت تراکنش</span>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300/60 dark:border-slate-700 hover:bg-white/40 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            title="تغییر واحد پولی"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-300/60 dark:border-slate-700 hover:bg-white/40 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
            title="تغییر تم تاریک / روشن"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Quick PWA Tooltip Banner */}
      {showPwaTip && (
        <div className="p-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white text-xs flex items-center justify-between px-4 sm:px-8 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>
              💡 <b>قابلیت نصب روی گوشی:</b> در مرورگر Chrome یا Samsung گوشی، از منوی سه نقطه دکمه <b>«Install app» یا «Add to Home screen»</b> را بزنید تا برنامه بدون نوار آدرس مثل اپلیکیشن‌های بازار نصب شود!
            </span>
          </div>
          <button
            onClick={() => setShowPwaTip(false)}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs font-bold shrink-0 mr-2"
          >
            بستن
          </button>
        </div>
      )}
    </header>
  );
};
