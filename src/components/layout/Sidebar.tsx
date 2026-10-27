import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { UserProfileModal } from '../auth/UserProfileModal';
import { BrandLogo } from '../common/BrandLogo';
import { Sparkline } from '../ui/Sparkline';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  PieChart,
  Target,
  FileCheck2,
  BarChart3,
  Settings,
  Coins,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
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
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

interface NavGroup {
  groupTitle: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    getBadge?: () => string | number | undefined;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
}) => {
  const { user } = useAuth();
  const {
    totalBalance,
    totalPortfolioValueToman,
    debts = [],
    cheques = [],
    transactions = [],
    currency,
  } = useFinance();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Compute Net Worth
  const totalReceivables = debts
    .filter((d) => d.type === 'credit')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const totalPayableDebts = debts
    .filter((d) => d.type === 'debt')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const totalNetWorth =
    totalBalance + totalPortfolioValueToman + totalReceivables - totalPayableDebts;

  // Real 6-point trendline backwards from current net worth based on monthly transaction flow
  const netWorthTrend = useMemo(() => {
    const points = [totalNetWorth];
    let running = totalNetWorth;
    // Walk back 5 steps using recent transactions
    for (let i = 0; i < 5; i++) {
      const stepTxs = transactions.slice(i * 4, (i + 1) * 4);
      const stepDelta = stepTxs.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);
      running -= stepDelta;
      points.unshift(Math.max(0, running));
    }
    return points;
  }, [totalNetWorth, transactions]);

  // Counts for badges
  const pendingChequesCount = cheques.filter((c) => c.status === 'pending').length;
  const activeDebtsCount = debts.filter((d) => !d.isSettled).length;

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
        { id: 'assets', label: 'مدیریت دارایی و طلا', icon: Coins, getBadge: () => 'زنده' },
        {
          id: 'debts',
          label: 'بدهی، طلب و چک',
          icon: FileCheck2,
          getBadge: () =>
            pendingChequesCount + activeDebtsCount > 0
              ? toPersianDigits(pendingChequesCount + activeDebtsCount)
              : undefined,
        },
        { id: 'goals', label: 'اهداف و پس‌انداز', icon: Target },
      ],
    },
    {
      groupTitle: 'سیستم',
      items: [{ id: 'settings', label: 'تنظیمات و ظاهر', icon: Settings }],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="px-2 py-1 mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
          <BrandLogo size="md" showText={!isCollapsed} animated={true} />
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              FINTECH
            </span>
          )}
          {onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="lg:hidden p-1.5 rounded-full bg-white/5 text-fintech-text-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4 overflow-y-auto pr-0.5 no-scrollbar max-h-[calc(100vh-22rem)]">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-mono text-fintech-text-sub px-3 py-1 uppercase tracking-widest">
                  {group.groupTitle}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const badge = item.getBadge?.();

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobileDrawer) onCloseMobileDrawer();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-[color,background-color] duration-150 relative group cursor-pointer ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-fintech-text-muted hover:text-fintech-text-main hover:bg-white/[0.04]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    {/* Sliding active pill indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 shadow-glow-violet -z-0"
                      />
                    )}

                    <div
                      className={`relative z-10 w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-fintech-text-muted group-hover:text-violet-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <span className="relative z-10 truncate tracking-tight">{item.label}</span>
                    )}

                    {!isCollapsed && badge && (
                      <span
                        className={`relative z-10 mr-auto px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Net Worth Mini Card + User Card */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-3">
        {/* Net Worth Mini-Card with Sparkline (Only on full width) */}
        {!isCollapsed && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-900/25 via-white/[0.03] to-indigo-900/15 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-violet-300 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                خالص ثروت (Net Worth)
              </span>
              <Sparkline data={netWorthTrend} width={64} height={20} color="#8B5CF6" />
            </div>
            <div className="text-base font-semibold font-mono tabular-nums text-fintech-text-main">
              {formatCurrency(totalNetWorth, currency)}
            </div>
          </div>
        )}

        {/* User Card */}
        {user && (
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className={`p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between cursor-pointer transition ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                {user.displayName.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-fintech-text-main truncate">
                    {user.displayName}
                  </span>
                  <span className="block text-[10px] text-fintech-text-muted font-mono truncate" dir="ltr">
                    @{user.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-end pt-1">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-fintech-text-muted hover:text-white transition"
            title={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 p-4 m-4 mr-0 rounded-3xl bg-[#120F1A]/85 backdrop-blur-2xl border border-white/10 shadow-2xl self-start sticky top-20 min-h-[calc(100vh-6rem)] transition-[width] duration-200 select-none z-30 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileDrawer}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-80 max-w-[85vw] h-full p-5 bg-[#120F1A] border-l border-white/10 shadow-2xl z-10 overflow-y-auto"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
