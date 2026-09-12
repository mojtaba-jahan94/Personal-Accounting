import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { Sun, Moon, Plus, Wallet, ArrowLeftRight } from 'lucide-react';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenTransferModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTransactionModal,
  onOpenTransferModal,
}) => {
  const { totalBalance, currency, setCurrency, darkMode, toggleDarkMode } = useFinance();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              مدیر مالی هوشمند
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              حسابداری شخصی و هوش مالی روزمره
            </p>
          </div>
        </div>

        {/* Center / Balance Badge for quick glance */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-xs text-slate-500 dark:text-slate-400">موجودی کل:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalBalance, currency)}
          </span>
        </div>

        {/* Action buttons & controls */}
        <div className="flex items-center gap-2">
          {/* Transfer button */}
          <button
            onClick={onOpenTransferModal}
            title="انتقال وجه بین کارت‌ها"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
            <span>انتقال وجه</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-600/30 transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline font-semibold">ثبت تراکنش</span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'rial' : 'toman')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            title="تغییر واحد پولی بین تومان و ریال"
          >
            {currency === 'toman' ? 'تومان' : 'ریال'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
            title="تغییر تم تاریک / روشن"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
