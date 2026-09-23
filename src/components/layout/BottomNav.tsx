import React, { useState } from 'react';
import { TabType } from './Sidebar';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  PieChart,
  Menu,
  X,
  CreditCard,
  Target,
  FileCheck2,
  BarChart3,
  Settings,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenTransactionModal: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenTransactionModal,
  onSwipeNext,
  onSwipePrev,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const moreItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
    { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'settings', label: 'تنظیمات و ظاهر', icon: Settings },
  ];

  const activeMoreItem = moreItems.find((item) => item.id === currentTab);
  const isMoreActive = !!activeMoreItem;
  const MoreIcon = activeMoreItem ? activeMoreItem.icon : Menu;
  const moreLabel = activeMoreItem ? activeMoreItem.label.split(' ')[0] : 'سایر';

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onSwipeNext?.();
      } else {
        onSwipePrev?.();
      }
    }
  };

  return (
    <>
      {/* Mobile Drawer Menu for More Tabs */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div
            className="relative z-10 mx-3 mb-24 sm:mx-auto sm:w-[440px] rounded-3xl bg-white/98 dark:bg-slate-900/98 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">سایر بخش‌های برنامه</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all text-right active:scale-95 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Capsule Bottom Navigation Bar (حالت کپسولی مدرن با پشتیبانی از اسلاید) */}
      <nav
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="lg:hidden fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-50 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/90 dark:border-slate-800/90 px-3 py-2 shadow-2xl transition-all select-none touch-pan-y"
      >
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 ${
              currentTab === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {currentTab === 'dashboard' && <span className="text-[11px] whitespace-nowrap">پیشخوان</span>}
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 ${
              currentTab === 'transactions'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ReceiptText className="w-4 h-4 shrink-0" />
            {currentTab === 'transactions' && <span className="text-[11px] whitespace-nowrap">تراکنش‌ها</span>}
          </button>

          {/* Center Capsule Action Button */}
          <button
            onClick={onOpenTransactionModal}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/35 flex items-center justify-center shrink-0 active:scale-90 transition-all ring-2 ring-white/60 dark:ring-slate-800"
            title="ثبت سریع تراکنش"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Reports & Analytics */}
          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 ${
              currentTab === 'reports'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            {currentTab === 'reports' && <span className="text-[11px] whitespace-nowrap">گزارش‌ها</span>}
          </button>

          {/* More Menu */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 ${
              moreMenuOpen || isMoreActive
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MoreIcon className="w-4 h-4 shrink-0 text-indigo-500" />
            {(moreMenuOpen || isMoreActive) && <span className="text-[11px] whitespace-nowrap">{moreLabel}</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
