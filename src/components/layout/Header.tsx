import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Sun, Moon, Plus, Wallet, ArrowLeftRight, Smartphone, Download, MessageSquareText } from 'lucide-react';

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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#17212b]/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#2481cc] flex items-center justify-center text-white shadow-lg shadow-[#2481cc]/25 ring-2 ring-white/50 dark:ring-white/10 tg-tap-active">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              مدیر مالی هوشمند
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              حسابداری شخصی آفلاین
            </p>
          </div>
        </div>

        {/* Center Balance Capsule */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-[#242f3d]/80 border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">موجودی کل:</span>
          <span className="text-sm font-black text-[#2481cc] dark:text-[#42a5f5] tracking-tight">
            {formatCurrency(totalBalance, currency)}
          </span>
        </div>

        {/* Controls & Actions (Telegram Bubbly Pills) */}
        <div className="flex items-center gap-2">
          {/* Install PWA Guide Button */}
          <button
            onClick={() => setShowPwaTip(!showPwaTip)}
            title="نصب اپلیکیشن روی گوشی (PWA)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2481cc] bg-[#2481cc]/10 hover:bg-[#2481cc]/20 rounded-full transition tg-tap-active"
          >
            <Smartphone className="w-4 h-4 text-[#2481cc]" />
            <span className="hidden md:inline">نصب برنامه</span>
          </button>

          {/* SMS Assistant button */}
          <button
            onClick={onOpenSmsModal}
            title="دستیار هوشمند پیامک بانکی"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-full transition tg-tap-active"
          >
            <MessageSquareText className="w-4 h-4 text-sky-500" />
            <span className="hidden md:inline">پیامک بانک</span>
          </button>

          {/* Transfer button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#242f3d] rounded-full transition tg-tap-active"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#2481cc]" />
            <span>انتقال</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-black text-white bg-[#2481cc] hover:bg-[#168acd] rounded-full shadow-md shadow-[#2481cc]/30 transition tg-tap-active"
            title="ثبت تراکنش جدید"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">ثبت تراکنش</span>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="px-3 py-2 text-xs font-bold rounded-full bg-slate-100/90 dark:bg-[#242f3d] border border-slate-200/60 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-[#242f3d]/90 transition text-slate-700 dark:text-slate-200 tg-tap-active"
            title="تغییر واحد پولی"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-100/90 dark:bg-[#242f3d] border border-slate-200/60 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-[#242f3d]/90 transition text-slate-600 dark:text-slate-300 tg-tap-active"
            title="تغییر تم تاریک / روشن"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2481cc]" />}
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
