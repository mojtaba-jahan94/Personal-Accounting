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
} from 'lucide-react';
import { LIQUID_GLASS_PRESETS } from '../../utils/liquidGlassPresets';

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
      className="hidden lg:flex flex-col w-64 shrink-0 p-4 m-4 mr-0 rounded-3xl glass-dock border border-white/50 dark:border-white/10 shadow-2xl self-start sticky top-20 min-h-[calc(100vh-6.5rem)] transition-all"
    >
      {/* iOS 27 App Status Capsule */}
      <div className="px-3.5 py-2 mb-3.5 rounded-full liquid-glass-pill-lens flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          </div>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">مدیریت مالی هوشمند</span>
        </div>
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          iOS 27
        </span>
      </div>

      {/* Navigation Liquid Glass Lens Pills */}
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              data-glass
              data-config={JSON.stringify(LIQUID_GLASS_PRESETS.ios27LiquidPill)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-black transition-all duration-200 liquid-glass-pill-lens ${
                isActive
                  ? 'active text-slate-950 dark:text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm ring-1 ring-white/50'
                    : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 drop-shadow-xs" />
              </div>
              <span className="truncate tracking-tight">{item.label}</span>

              {isActive && (
                <div className="mr-auto w-1.5 h-3.5 rounded-full bg-indigo-600 dark:bg-white shadow-xs animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Privacy Capsule at Bottom */}
      <div className="mt-auto p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 space-y-1 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>حریم خصوصی کامل</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          تمامی اطلاعات شما به صورت کاملاً امن فقط در دستگاه خودتان ذخیره می‌شود.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
