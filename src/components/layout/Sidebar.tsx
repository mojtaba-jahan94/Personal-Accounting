import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../auth/UserProfileModal';
import { BrandLogo } from '../common/BrandLogo';
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
  Cloud,
  CloudOff,
  RefreshCw,
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

interface NavGroup {
  groupTitle: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, tursoStatus } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'میز کار',
      items: [
        { id: 'dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
        { id: 'reports', label: 'گزارش‌ها و تحلیل', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'عملیات مالی',
      items: [
        { id: 'transactions', label: 'تراکنش‌ها و اسناد', icon: ReceiptText },
        { id: 'accounts', label: 'حساب‌ها و کارت‌ها', icon: CreditCard },
        { id: 'budgets', label: 'بودجه‌بندی ماهانه', icon: PieChart },
      ],
    },
    {
      groupTitle: 'سرمایه و تعهدات',
      items: [
        { id: 'assets', label: 'مدیریت دارایی و طلا', icon: Coins, badge: 'زنده' },
        { id: 'debts', label: 'بدهی، طلب و چک', icon: FileCheck2 },
        { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
      ],
    },
    {
      groupTitle: 'سیستم',
      items: [
        { id: 'settings', label: 'تنظیمات و ظاهر', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-72 shrink-0 p-4 m-4 mr-0 rounded-3xl bg-[#F7F7F2]/90 dark:bg-[#121215]/90 backdrop-blur-2xl border border-[#6B7280]/15 dark:border-white/[0.07] shadow-xl dark:shadow-[0_24px_50px_rgba(0,0,0,0.85)] self-start sticky top-20 min-h-[calc(100vh-6rem)] transition-all select-none"
    >
      {/* Brand Header */}
      <div className="px-2 py-1 mb-3.5 flex items-center justify-between border-b border-[#6B7280]/15 dark:border-white/[0.07] pb-3">
        <BrandLogo size="md" showText={true} animated={true} />
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DFC296]/10 text-[#DFC296] border border-[#DFC296]/25 tracking-widest">
          AURUM
        </span>
      </div>

      {/* App & Cloud Sync Status Pill */}
      <div
        className="w-full px-3.5 py-2.5 mb-3 rounded-2xl bg-[#1F2933]/5 dark:bg-white/[0.03] border border-[#6B7280]/15 dark:border-white/[0.07] flex items-center justify-between text-right select-none cursor-default"
        title="وضعیت همگام‌سازی ابری"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${
                tursoStatus === 'connected'
                  ? 'bg-[#2E7D5B] dark:bg-[#7A9A95] shadow-sm shadow-[#7A9A95]/50'
                  : tursoStatus === 'connecting'
                  ? 'bg-[#DFC296] animate-pulse'
                  : tursoStatus === 'error'
                  ? 'bg-[#C0564B] dark:bg-[#C98A82]'
                  : 'bg-[#6B7280]'
              }`}
            />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#1F2933] dark:text-[#F4F0EA] truncate font-mono">
              {tursoStatus === 'connected'
                ? 'متصل به سرور ابری Turso'
                : tursoStatus === 'connecting'
                ? 'در حال اتصال...'
                : tursoStatus === 'error'
                ? 'خطا در ارتباط ابری'
                : 'پایگاه داده محلی'}
            </span>
          </div>
        </div>
        <Cloud className="w-4 h-4 text-[#DFC296] shrink-0 opacity-90" />
      </div>

      {/* Logical Navigation Groups */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="text-[10px] font-bold text-[#8E8B82] px-3 py-1 uppercase tracking-widest font-mono">
              {group.groupTitle}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all duration-200 relative border ${
                    isActive
                      ? 'bg-[#DFC296]/15 border-[#DFC296]/35 text-[#DFC296] shadow-sm shadow-[#DFC296]/10 font-bold'
                      : 'border-transparent text-[#8E8B82] hover:bg-[#1F2933]/5 hover:text-[#1F2933] dark:text-[#8E8B82] dark:hover:bg-white/[0.04] dark:hover:text-[#F4F0EA] font-medium'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#DFC296]/20 text-[#DFC296]'
                        : 'bg-black/5 dark:bg-white/[0.04] text-[#8E8B82]'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.6]" />
                  </div>
                  <span className="truncate tracking-tight">{item.label}</span>

                  {item.badge && (
                    <span
                      className={`mr-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-[#DFC296]/30 text-[#DFC296]'
                          : 'bg-[#DFC296]/15 text-[#DFC296]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Mini Card at Bottom */}
      {user && (
        <div className="mt-3 pt-3 border-t border-[#6B7280]/15 dark:border-white/[0.07]">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-[#6B7280]/15 dark:border-white/[0.07] flex items-center justify-between gap-2.5 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#DFC296] text-[#0A0A0C] flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#1F2933] dark:text-[#F4F0EA] truncate">
                  {user.displayName}
                </span>
                <span className="block text-[10px] text-[#8E8B82] font-mono truncate" dir="ltr">
                  @{user.username}
                </span>
              </div>
            </div>

            <div className="p-1 text-[#DFC296]">
              <Database className="w-4 h-4 stroke-[1.6]" />
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

