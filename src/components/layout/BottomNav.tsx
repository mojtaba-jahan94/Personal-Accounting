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
      {/* More Menu Drawer for Mobile */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-3 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">سایر امکانات مالی</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
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
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition text-right active:scale-95 ${
                      isActive
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clean Floating Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-30 rounded-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 p-1.5 shadow-2xl">
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-full px-3.5 py-2 gap-1.5 font-bold text-xs shadow-md shadow-indigo-600/35 scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {currentTab === 'dashboard' && <span className="text-[11px] whitespace-nowrap">پیشخوان</span>}
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center ${
              currentTab === 'transactions'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-full px-3.5 py-2 gap-1.5 font-bold text-xs shadow-md shadow-indigo-600/35 scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <ReceiptText className="w-5 h-5 shrink-0" />
            {currentTab === 'transactions' && <span className="text-[11px] whitespace-nowrap">تراکنش‌ها</span>}
          </button>

          {/* Center Floating Plus Action Button */}
          <button
            onClick={onOpenTransactionModal}
            className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center shrink-0 hover:scale-105 active:scale-90 transition-all ring-2 ring-white dark:ring-slate-900"
            title="ثبت سریع تراکنش"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Budgets */}
          <button
            onClick={() => onSelectTab('budgets')}
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center ${
              currentTab === 'budgets'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-full px-3.5 py-2 gap-1.5 font-bold text-xs shadow-md shadow-indigo-600/35 scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <PieChart className="w-5 h-5 shrink-0" />
            {currentTab === 'budgets' && <span className="text-[11px] whitespace-nowrap">بودجه</span>}
          </button>

          {/* More Menu */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`transition-all duration-200 active:scale-95 flex items-center justify-center ${
              moreMenuOpen || ['accounts', 'goals', 'debts', 'reports', 'settings'].includes(currentTab)
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-full px-3.5 py-2 gap-1.5 font-bold text-xs shadow-md shadow-indigo-600/35 scale-105'
                : 'p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            {(moreMenuOpen || ['accounts', 'goals', 'debts', 'reports', 'settings'].includes(currentTab)) && (
              <span className="text-[11px] whitespace-nowrap">امکانات</span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
