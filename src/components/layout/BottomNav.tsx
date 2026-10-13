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
      {/* Capsule-Styled Mobile "More / Sidebar" Menu */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div
            className="fixed bottom-20 inset-x-3 max-w-md mx-auto z-50 rounded-[2rem] p-4 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-250 select-none"
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1 rounded-full bg-[#6B7280]/30 mx-auto mb-1" />

            <div className="flex items-center justify-between pb-2.5 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
              <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">سایر بخش‌های برنامه</span>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-[60vh] overflow-y-auto no-scrollbar">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`rounded-full px-4 py-3 flex items-center gap-3 transition-all text-right active:scale-95 text-xs font-bold ${
                      isActive
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/25'
                        : 'bg-white/70 dark:bg-white/5 text-[#1F2933] dark:text-[#D1D5DB] hover:bg-white dark:hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-full ${
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

      {/* Floating Capsule (Pill-Shaped) Dock on Mobile */}
      <nav
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="lg:hidden fixed bottom-4 inset-x-0 mx-auto w-[calc(100%-1.5rem)] max-w-md z-40 rounded-full px-2.5 py-2 shadow-2xl backdrop-blur-2xl border transition-all duration-300 bg-[#F7F7F2]/90 border-[#6B7280]/20 text-[#1F2933] shadow-[#1F2933]/10 dark:bg-[#1F2933]/90 dark:border-[#D1D5DB]/15 dark:text-[#F7F7F2] dark:shadow-black/50 select-none"
      >
        <div className="flex items-center justify-between relative px-1">
          {/* Primary Tab 1: داشبورد */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'bg-[#A68A64] text-[#F7F7F2] rounded-full px-3.5 py-2 shadow-md shadow-[#A68A64]/30 font-semibold text-xs'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2] rounded-full p-2.5'
            }`}
            title="داشبورد"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {currentTab === 'dashboard' && <span className="text-xs whitespace-nowrap">داشبورد</span>}
          </button>

          {/* Primary Tab 2: تراکنش‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
              currentTab === 'transactions'
                ? 'bg-[#A68A64] text-[#F7F7F2] rounded-full px-3.5 py-2 shadow-md shadow-[#A68A64]/30 font-semibold text-xs'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2] rounded-full p-2.5'
            }`}
            title="تراکنش‌ها"
          >
            <ReceiptText className="w-5 h-5 shrink-0" />
            {currentTab === 'transactions' && <span className="text-xs whitespace-nowrap">تراکنش‌ها</span>}
          </button>

          {/* Center Prominent Action Button (+) */}
          <button
            type="button"
            onClick={onOpenTransactionModal}
            className="rounded-full bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] p-3 shadow-lg shadow-[#A68A64]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-[#F7F7F2] dark:border-[#1F2933]"
            title="ثبت سریع تراکنش جدید"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Primary Tab 3: دارایی‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('assets')}
            className={`transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
              currentTab === 'assets'
                ? 'bg-[#A68A64] text-[#F7F7F2] rounded-full px-3.5 py-2 shadow-md shadow-[#A68A64]/30 font-semibold text-xs'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2] rounded-full p-2.5'
            }`}
            title="دارایی‌ها"
          >
            <Coins className="w-5 h-5 shrink-0" />
            {currentTab === 'assets' && <span className="text-xs whitespace-nowrap">دارایی‌ها</span>}
          </button>

          {/* 5. بیشتر (More) Tab */}
          <button
            type="button"
            onClick={() => setMoreMenuOpen(true)}
            className={`transition-all duration-200 active:scale-95 flex items-center gap-1.5 relative ${
              isMoreActive || moreMenuOpen
                ? 'bg-[#A68A64] text-[#F7F7F2] rounded-full px-3.5 py-2 shadow-md shadow-[#A68A64]/30 font-semibold text-xs'
                : 'text-[#6B7280] dark:text-[#D1D5DB]/80 hover:text-[#1F2933] dark:hover:text-[#F7F7F2] rounded-full p-2.5'
            }`}
            title="سایر بخش‌ها"
          >
            <Menu className="w-5 h-5 shrink-0" />
            {isMoreActive && !moreMenuOpen ? (
              <span className="text-xs whitespace-nowrap">{moreLabel}</span>
            ) : null}
            {isMoreActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F7F7F2]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

