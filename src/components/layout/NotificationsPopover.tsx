import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Calendar, Target, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { TabType } from './Sidebar';

export interface NotificationsPopoverProps {
  onSelectTab: (tab: TabType) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onSelectTab }) => {
  const { cheques = [], debts = [], budgets = [], transactions = [], categories, currency } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute real alerts
  const alerts = [];

  // 1. Pending Cheques
  const pendingCheques = cheques.filter((c) => c.status === 'pending');
  if (pendingCheques.length > 0) {
    alerts.push({
      id: 'cheques',
      type: 'warning' as const,
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      title: `${toPersianDigits(pendingCheques.length)} فقره چک در انتظار سررسید`,
      subtitle: 'برای بررسی و تغییر وضعیت چک‌ها مراجعه کنید',
      tab: 'debts' as TabType,
    });
  }

  // 2. Unsettled Debts
  const pendingDebts = debts.filter((d) => !d.isSettled);
  if (pendingDebts.length > 0) {
    alerts.push({
      id: 'debts',
      type: 'info' as const,
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      title: `${toPersianDigits(pendingDebts.length)} پرونده بدهی یا طلب جاری`,
      subtitle: 'بررسی وضعیت اقساط و تسویه‌حساب‌ها',
      tab: 'debts' as TabType,
    });
  }

  // 3. Budgets near or exceeded limit
  const exceededBudgets = budgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    return spent >= b.amount * 0.85;
  });

  if (exceededBudgets.length > 0) {
    alerts.push({
      id: 'budgets',
      type: 'danger' as const,
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      title: `${toPersianDigits(exceededBudgets.length)} بودجه در آستانه تکمیل یا عبور از سقف`,
      subtitle: 'مدیریت مخارج دسته‌بندی‌شده برای کنترل هزینه‌ها',
      tab: 'budgets' as TabType,
    });
  }

  const alertCount = alerts.length;

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-fintech-text-muted hover:text-white transition cursor-pointer"
        aria-label="اعلان‌ها"
        title="مرکز اعلان‌ها و هشدارها"
      >
        <Bell className="w-4 h-4" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-fintech-bg animate-pulse">
            {toPersianDigits(alertCount)}
          </span>
        )}
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#141120] border border-white/10 shadow-2xl p-4 z-50 text-right"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <span className="text-xs font-semibold text-fintech-text-main">
                مرکز اعلان‌ها و هشدارها
              </span>
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/30">
                {toPersianDigits(alertCount)} مورد
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
              {alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-fintech-text-muted">
                  هیچ هشدار یا سررسیدی برای نمایش وجود ندارد.
                </div>
              ) : (
                alerts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.tab);
                      setIsOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-fintech-text-main block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-fintech-text-muted block mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-fintech-text-sub group-hover:text-white transition" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPopover;
