import React, { useState } from 'react';
import { TabType } from './Sidebar';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Coins,
  Menu,
  X,
  CreditCard,
  PieChart,
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

  // Secondary views displayed inside the "More" bottom sheet drawer
  const moreItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
    { id: 'goals', label: 'اهداف مالی و پس‌انداز', icon: Target },
    { id: 'reports', label: 'گزارش‌ها و تحلیل', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و ظاهر', icon: Settings },
  ];

  const activeMoreItem = moreItems.find((item) => item.id === currentTab);
  const isMoreActive = !!activeMoreItem;
  const moreLabel = activeMoreItem ? activeMoreItem.label.split(' ')[0] : 'بیشتر';

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

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        onSwipeNext?.();
      } else {
        onSwipePrev?.();
      }
    }
  };

  return (
    <>
      {/* Mobile Drawer Bottom Sheet for Secondary Navigation Views */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md mx-auto rounded-t-3xl bg-[#F7F7F2] dark:bg-[#1F2933] p-5 shadow-2xl border-t border-[#6B7280]/20 dark:border-[#D1D5DB]/15 space-y-4 animate-in slide-in-from-bottom duration-250 select-none pb-8"
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1 rounded-full bg-[#6B7280]/30 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
              <span className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">سایر بخش‌های برنامه</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all text-right active:scale-95 ${
                      isActive
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/25'
                        : 'bg-black/5 dark:bg-white/5 text-[#1F2933] dark:text-[#D1D5DB] hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isActive ? 'bg-white/20 text-[#F7F7F2]' : 'bg-[#A68A64]/15 text-[#A68A64]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5-Slot Ergonomic Bottom Dock on Mobile */}
      <nav
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-xl border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/15 px-3 py-1.5 pb-safe shadow-2xl transition-all select-none"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Primary Tab 1: داشبورد */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-95 ${
              currentTab === 'dashboard'
                ? 'text-[#A68A64] font-bold'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                currentTab === 'dashboard' ? 'bg-[#A68A64]/15' : ''
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">داشبورد</span>
          </button>

          {/* Primary Tab 2: تراکنش‌ها */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-95 ${
              currentTab === 'transactions'
                ? 'text-[#A68A64] font-bold'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                currentTab === 'transactions' ? 'bg-[#A68A64]/15' : ''
              }`}
            >
              <ReceiptText className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">تراکنش‌ها</span>
          </button>

          {/* Center Prominent Action Button (+) */}
          <div className="flex flex-col items-center justify-center -mt-5">
            <button
              onClick={onOpenTransactionModal}
              className="w-12 h-12 rounded-full bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] shadow-lg shadow-[#A68A64]/35 flex items-center justify-center active:scale-90 transition-all border-3 border-[#F7F7F2] dark:border-[#1F2933]"
              title="ثبت سریع تراکنش جدید"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-[#A68A64] mt-0.5">تراکنش جدید</span>
          </div>

          {/* Primary Tab 3: دارایی‌ها */}
          <button
            onClick={() => onSelectTab('assets')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-95 ${
              currentTab === 'assets'
                ? 'text-[#A68A64] font-bold'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                currentTab === 'assets' ? 'bg-[#A68A64]/15' : ''
              }`}
            >
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">دارایی‌ها</span>
          </button>

          {/* 5. بیشتر (More) Tab */}
          <button
            onClick={() => setMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-95 ${
              isMoreActive || moreMenuOpen
                ? 'text-[#A68A64] font-bold'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all relative ${
                isMoreActive ? 'bg-[#A68A64]/15' : ''
              }`}
            >
              <Menu className="w-5 h-5" />
              {isMoreActive && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A68A64]" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">{moreLabel}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

