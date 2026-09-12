import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  PieChart,
  Target,
  FileCheck2,
  BarChart3,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budgets'
  | 'goals'
  | 'debts'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'transactions', label: 'تراکنش‌ها و اسناد', icon: ReceiptText },
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
    { id: 'goals', label: 'اهداف و قلک پس‌انداز', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'reports', label: 'گزارش‌ها و نمودارها', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و پشتیبان', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 p-4 border-l border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md min-h-[calc(100vh-5rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          مدیریت مالی
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tip Card at bottom of sidebar */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-slate-800/40 border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-1">
          💡 نکته مالی روز
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          قانون ۵۰/۳۰/۲۰ را به یاد داشته باشید: ۵۰٪ نیازها، ۳۰٪ خواسته‌ها، و ۲۰٪ پس‌انداز و سرمایه‌گذاری.
        </p>
      </div>
    </aside>
  );
};
