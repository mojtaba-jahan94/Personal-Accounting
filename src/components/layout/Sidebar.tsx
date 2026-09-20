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
  ShieldCheck,
  Sparkles,
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
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'transactions', label: 'تراکنش‌ها و اسناد', icon: ReceiptText },
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
    { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'reports', label: 'گزارش‌ها و نمودارها', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و استودیو', icon: Settings },
  ];

  return (
    <aside
      data-glass
      className="hidden lg:flex flex-col w-64 shrink-0 p-3.5 m-4 mr-0 rounded-3xl glass-dock border border-white/40 dark:border-white/10 shadow-2xl self-start sticky top-20 min-h-[calc(100vh-6.5rem)] transition-all"
    >
      {/* iOS 27 App Status Capsule */}
      <div className="px-3.5 py-2.5 mb-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">مدیریت مالی شخصی</span>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          iOS 27
        </span>
      </div>

      {/* Navigation Items with Spatial Tactile Feedback */}
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-[0.97] relative group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02] ring-1 ring-white/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                <Icon className="w-4 h-4 drop-shadow-xs" />
              </div>
              <span className="truncate font-black">{item.label}</span>

              {isActive && (
                <div className="mr-auto w-1.5 h-4 rounded-full bg-white/80 shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Privacy Badge at Bottom */}
      <div className="mt-auto p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 space-y-1.5 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>حریم خصوصی کامل</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          تمامی داده‌های مالی، تراکنش‌ها و چک‌ها به‌صورت ۱۰۰٪ آفلاین در دستگاه خودتان ذخیره می‌شوند.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
