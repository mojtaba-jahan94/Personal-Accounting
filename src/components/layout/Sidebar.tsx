import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../auth/UserProfileModal';
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  PieChart,
  Target,
  FileCheck2,
  BarChart3,
  Settings,
  Database,
  Coins,
  LogOut,
  User,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'assets'
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
  const { user, tursoStatus } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'transactions', label: 'تراکنش‌ها و اسناد', icon: ReceiptText },
    { id: 'assets', label: 'مدیریت دارایی و طلا', icon: Coins, badge: 'زنده' },
    { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
    { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
    { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
    { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
    { id: 'reports', label: 'گزارش‌ها و تحلیل', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات و ظاهر', icon: Settings },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 p-3 m-3 mr-0 rounded-2xl glass-dock border border-slate-200/80 dark:border-slate-800 shadow-xs self-start sticky top-16 min-h-[calc(100vh-5rem)] transition-all"
    >
      {/* App Status Indicator */}
      <div className="px-3 py-2 mb-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              tursoStatus === 'connected'
                ? 'bg-emerald-500 shadow-xs shadow-emerald-500/40'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {tursoStatus === 'connected' ? 'متصل به سرور Turso' : 'پایگاه داده Turso'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400">v1.2</span>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 relative ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate tracking-tight">{item.label}</span>

              {item.badge && (
                <span className="mr-auto px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
                  {item.badge}
                </span>
              )}

              {isActive && !item.badge && (
                <div className="mr-auto w-1 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Mini Card at Bottom */}
      {user && (
        <div className="mt-auto pt-2 border-t border-slate-200/60 dark:border-white/5">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2 cursor-pointer transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.displayName}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                  @{user.username}
                </span>
              </div>
            </div>

            <div className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              <Database className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
        </div>
      )}

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
