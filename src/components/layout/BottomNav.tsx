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
import { LIQUID_GLASS_PRESETS } from '../../utils/liquidGlassPresets';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenTransactionModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenTransactionModal,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'reports', label: 'گزارش و تحلیل', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و استودیو', icon: Settings },
  ];

  return (
    <>
      {/* iOS 27 Glass Sheet Menu Drawer for Mobile */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div
            data-glass
            className="relative z-10 mx-3 mb-20 sm:mx-auto sm:w-[440px] rounded-3xl liquid-glass-ios27 p-4 shadow-2xl border border-white/60 dark:border-white/15 space-y-3 animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/50 dark:border-white/10">
              <span className="text-xs font-black text-slate-900 dark:text-white">سایر امکانات و ماژول‌ها</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="liquid-glass-pill-lens p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
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
                    data-glass
                    data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
                    className={`flex items-center gap-2.5 p-3 rounded-full text-xs font-bold transition-all text-right liquid-glass-pill-lens active:scale-95 ${
                      isActive
                        ? 'active text-slate-950 dark:text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-black">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating iOS 27 Convex Liquid Glass Bottom Dock */}
      <nav
        data-glass
        className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 rounded-full glass-dock border border-white/60 dark:border-white/15 p-1.5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            data-glass
            data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
            className={`transition-all duration-200 active:scale-90 flex items-center justify-center ${
              currentTab === 'dashboard'
                ? 'liquid-glass-pill-lens active px-3.5 py-2 gap-1.5 font-black text-xs text-slate-950 dark:text-white scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {currentTab === 'dashboard' && <span className="text-[11px] whitespace-nowrap font-black">پیشخوان</span>}
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectTab('transactions')}
            data-glass
            data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
            className={`transition-all duration-200 active:scale-90 flex items-center justify-center ${
              currentTab === 'transactions'
                ? 'liquid-glass-pill-lens active px-3.5 py-2 gap-1.5 font-black text-xs text-slate-950 dark:text-white scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <ReceiptText className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {currentTab === 'transactions' && <span className="text-[11px] whitespace-nowrap font-black">تراکنش‌ها</span>}
          </button>

          {/* Center Luminous Plus Action Button */}
          <button
            onClick={onOpenTransactionModal}
            className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center shrink-0 hover:scale-105 active:scale-90 transition-all ring-2 ring-white/90 dark:ring-white/30 group"
            title="ثبت سریع تراکنش"
          >
            <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Budgets */}
          <button
            onClick={() => onSelectTab('budgets')}
            data-glass
            data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
            className={`transition-all duration-200 active:scale-90 flex items-center justify-center ${
              currentTab === 'budgets'
                ? 'liquid-glass-pill-lens active px-3.5 py-2 gap-1.5 font-black text-xs text-slate-950 dark:text-white scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <PieChart className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {currentTab === 'budgets' && <span className="text-[11px] whitespace-nowrap font-black">بودجه</span>}
          </button>

          {/* More Menu */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            data-glass
            data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
            className={`transition-all duration-200 active:scale-90 flex items-center justify-center ${
              moreMenuOpen || ['accounts', 'goals', 'debts', 'reports', 'settings'].includes(currentTab)
                ? 'liquid-glass-pill-lens active px-3.5 py-2 gap-1.5 font-black text-xs text-slate-950 dark:text-white scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <Menu className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {(moreMenuOpen || ['accounts', 'goals', 'debts', 'reports', 'settings'].includes(currentTab)) && (
              <span className="text-[11px] whitespace-nowrap font-black">امکانات</span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
export default BottomNav;
