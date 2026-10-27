import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Mobile "More" Bottom Sheet Drawer */}
      <AnimatePresence>
        {moreMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMoreMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed bottom-24 inset-x-3 max-w-md mx-auto z-50 rounded-[2.5rem] p-5 bg-[#120F1A]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3.5 select-none"
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-1" />

              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-xs font-semibold text-fintech-text-main">سایر بخش‌های سیستم</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-1.5 rounded-full text-fintech-text-muted hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
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
                      className={`rounded-2xl p-3 flex items-center gap-2.5 transition-all text-right active:scale-95 text-xs font-medium border ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-glow-violet border-violet-500/50'
                          : 'bg-white/[0.03] border-white/[0.06] text-fintech-text-muted hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-xl ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-violet-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Capsule Glass Dock on Mobile */}
      <nav
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="lg:hidden fixed bottom-4 inset-x-0 mx-auto w-[calc(100%-1.75rem)] max-w-md z-40 rounded-full px-5 py-2.5 shadow-2xl backdrop-blur-2xl border transition-all duration-300 bg-[#120F1A]/85 border-white/10 text-fintech-text-main select-none"
      >
        <div className="flex items-center justify-between relative">
          
          {/* Tab 1: داشبورد */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'dashboard'
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-white'
            }`}
            title="داشبورد"
          >
            {currentTab === 'dashboard' && (
              <motion.div
                layoutId="bottomNavActive"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/10"
              />
            )}
            <LayoutDashboard className="w-5 h-5 relative z-10" />
            <span className="text-[10px] tracking-wider mt-0.5 font-mono relative z-10">داشبورد</span>
          </button>

          {/* Tab 2: تراکنش‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'transactions'
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-white'
            }`}
            title="تراکنش‌ها"
          >
            {currentTab === 'transactions' && (
              <motion.div
                layoutId="bottomNavActive"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/10"
              />
            )}
            <ReceiptText className="w-5 h-5 relative z-10" />
            <span className="text-[10px] tracking-wider mt-0.5 font-mono relative z-10">تراکنش</span>
          </button>

          {/* Center Prominent Action Button (+) */}
          <button
            type="button"
            onClick={onOpenTransactionModal}
            className="rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white p-3.5 shadow-glow-violet hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-[#120F1A]"
            title="ثبت سریع تراکنش جدید"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Tab 3: دارایی‌ها */}
          <button
            type="button"
            onClick={() => onSelectTab('assets')}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              currentTab === 'assets'
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-white'
            }`}
            title="دارایی‌ها"
          >
            {currentTab === 'assets' && (
              <motion.div
                layoutId="bottomNavActive"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/10"
              />
            )}
            <Coins className="w-5 h-5 relative z-10" />
            <span className="text-[10px] tracking-wider mt-0.5 font-mono relative z-10">دارایی</span>
          </button>

          {/* Tab 4: بیشتر (More) */}
          <button
            type="button"
            onClick={() => setMoreMenuOpen(true)}
            className={`transition-all duration-200 active:scale-95 flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative ${
              isMoreActive || moreMenuOpen
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-white'
            }`}
            title="سایر بخش‌ها"
          >
            {(isMoreActive || moreMenuOpen) && (
              <motion.div
                layoutId="bottomNavActive"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/10"
              />
            )}
            <Menu className="w-5 h-5 relative z-10" />
            <span className="text-[10px] tracking-wider mt-0.5 font-mono relative z-10">{moreLabel}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
