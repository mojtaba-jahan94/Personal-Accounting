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
    { id: 'goals', label: 'اهداف و قلک', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'reports', label: 'گزارش و تحلیل', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و پشتیبان', icon: Settings },
  ];

  return (
    <>
      {/* More Menu Drawer for Mobile */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div className="fixed bottom-20 inset-x-3 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">سایر بخش‌های مالی</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
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
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-medium transition text-right ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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

      {/* Main Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 pb-safe">
        <div className="flex items-center justify-around relative max-w-md mx-auto">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              currentTab === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>پیشخوان</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              currentTab === 'transactions'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ReceiptText className="w-5 h-5" />
            <span>تراکنش‌ها</span>
          </button>

          {/* Center Floating Plus Button */}
          <div className="relative -top-5">
            <button
              onClick={onOpenTransactionModal}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center p-3.5 hover:scale-105 active:scale-95 transition-all ring-4 ring-white dark:ring-slate-900"
              title="ثبت سریع تراکنش"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Budgets */}
          <button
            onClick={() => onSelectTab('budgets')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              currentTab === 'budgets'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span>بودجه</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              moreMenuOpen || ['accounts', 'goals', 'debts', 'reports', 'settings'].includes(currentTab)
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span>سایر</span>
          </button>
        </div>
      </nav>
    </>
  );
};
