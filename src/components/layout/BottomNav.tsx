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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div
            className="fixed bottom-24 inset-x-3 max-w-md mx-auto z-50 rounded-[2.5rem] p-5 bg-[#121215]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.95)] space-y-3.5 animate-in slide-in-from-bottom duration-250 select-none"
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFC296]" />
                <span className="text-xs font-bold font-mono tracking-wider text-[#F4F0EA]">سایر بخش‌های سیستم</span>
              </div>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-full text-[#8E8B82] hover:text-[#F4F0EA] hover:bg-white/[0.08] transition"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
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
                    className={`rounded-2xl px-4 py-3 flex items-center gap-3 transition-all text-right active:scale-95 text-xs font-bold border ${
                      isActive
                        ? 'bg-[#DFC296]/15 border-[#DFC296]/40 text-[#DFC296] shadow-md shadow-[#DFC296]/10'
                        : 'bg-white/[0.03] border-white/[0.06] text-[#8E8B82] hover:text-[#F4F0EA] hover:bg-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl transition-all ${
                        isActive ? 'bg-[#DFC296]/20 text-[#DFC296]' : 'bg-white/[0.05] text-[#8E8B82]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 stroke-[1.5]" />
                    </div>
                    <span className="truncate tracking-tight">{item.label}</span>
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
        className="lg:hidden fixed bottom-4 inset-x-0 mx-auto w-[calc(100%-1.75rem)] max-w-md z-40 rounded-full px-5 py-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl border transition-all duration-300 bg-[#121215]/90 border-white/[0.08] text-[#F4F0EA] select-none"
      >
        <div className="flex items-center justify-between relative">
          {/* Primary Tab 1: داشبورد */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'dashboard'
                ? 'text-[#DFC296] bg-[#DFC296]/10 border border-[#DFC296]/20 shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F4F0EA]'
            }`}
            title="داشبورد"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 stroke-[1.5]" />
            <span className="text-[10px] tracking-wider mt-1 font-mono font-medium">داشبورد</span>
            {currentTab === 'dashboard' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#DFC296] shadow-[0_0_6px_#DFC296]" />
            )}
          </button>

          {/* Primary Tab 2: تراکنش‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'transactions'
                ? 'text-[#DFC296] bg-[#DFC296]/10 border border-[#DFC296]/20 shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F4F0EA]'
            }`}
            title="تراکنش‌ها"
          >
            <ReceiptText className="w-5 h-5 shrink-0 stroke-[1.5]" />
            <span className="text-[10px] tracking-wider mt-1 font-mono font-medium">تراکنش</span>
            {currentTab === 'transactions' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#DFC296] shadow-[0_0_6px_#DFC296]" />
            )}
          </button>

          {/* Center Prominent Action Button (+) */}
          <button
            type="button"
            onClick={onOpenTransactionModal}
            className="rounded-full bg-[#DFC296] hover:bg-[#CBB084] text-[#0A0A0C] p-3.5 shadow-[0_0_24px_rgba(223,194,150,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-[#121215]"
            title="ثبت سریع تراکنش جدید"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Primary Tab 3: دارایی‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('assets')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'assets'
                ? 'text-[#DFC296] bg-[#DFC296]/10 border border-[#DFC296]/20 shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F4F0EA]'
            }`}
            title="دارایی‌ها"
          >
            <Coins className="w-5 h-5 shrink-0 stroke-[1.5]" />
            <span className="text-[10px] tracking-wider mt-1 font-mono font-medium">دارایی</span>
            {currentTab === 'assets' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#DFC296] shadow-[0_0_6px_#DFC296]" />
            )}
          </button>

          {/* 5. بیشتر (More) Tab */}
          <button
            type="button"
            onClick={() => setMoreMenuOpen(true)}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              isMoreActive || moreMenuOpen
                ? 'text-[#DFC296] bg-[#DFC296]/10 border border-[#DFC296]/20 shadow-xs'
                : 'text-[#8E8B82] hover:text-[#F4F0EA]'
            }`}
            title="سایر بخش‌ها"
          >
            <Menu className="w-5 h-5 shrink-0 stroke-[1.5]" />
            <span className="text-[10px] tracking-wider mt-1 font-mono font-medium">{moreLabel}</span>
            {isMoreActive && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#DFC296] shadow-[0_0_6px_#DFC296]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

