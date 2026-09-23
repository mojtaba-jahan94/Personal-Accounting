import React from 'react';
import { X, SlidersHorizontal, Check, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DEFAULT_DASHBOARD_CONFIG } from '../../context/FinanceContext';
import { DashboardSectionKey } from '../../types';

interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_DEFINITIONS: Record<DashboardSectionKey, { title: string; desc: string }> = {
  showHero: {
    title: 'خلاصه هوشمند وضعیت مالی',
    desc: 'نمایش خلاصه وضعیت رشد تراز مالی و دکمه‌های ثبت سریع',
  },
  showKpiCards: {
    title: 'کارت‌های ۴ گانه آمار و شاخص‌ها',
    desc: 'موجودی کل، مجموع درآمد، مخارج و نرخ پس‌انداز',
  },
  showAccounts: {
    title: 'کارت‌های بانکی و کیف‌پول‌ها',
    desc: 'اسلایدر کارت‌های بانکی و موجودی تک‌تک حساب‌ها',
  },
  showExpenseChart: {
    title: 'نمودار تحلیل مخارج و هزینه‌ها',
    desc: 'نمودار ستونی و دایره‌ای مقایسه‌ای دخل و خرج',
  },
  showRecentTransactions: {
    title: 'فهرست آخرین تراکنش‌ها',
    desc: '۵ تراکنش اخیر با جزئیات و دسته‌بندی',
  },
  showBudgetProgress: {
    title: 'سقف بودجه‌های ماهانه',
    desc: 'پیشرفت و درصد مصرف بودجه‌های تعریف‌شده',
  },
  showCheques: {
    title: 'یادآور چک‌های صیادی و اقساط',
    desc: 'چک‌های پاس‌نشده و نزدیک به تاریخ سررسید',
  },
};

const DEFAULT_ORDER: DashboardSectionKey[] = [
  'showHero',
  'showKpiCards',
  'showAccounts',
  'showExpenseChart',
  'showRecentTransactions',
  'showBudgetProgress',
  'showCheques',
];

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dashboardConfig, updateDashboardConfig } = useFinance();

  if (!isOpen) return null;

  const currentOrder: DashboardSectionKey[] =
    dashboardConfig.sectionOrder && dashboardConfig.sectionOrder.length > 0
      ? dashboardConfig.sectionOrder
      : DEFAULT_ORDER;

  const toggleSection = (key: DashboardSectionKey) => {
    updateDashboardConfig({ [key]: !dashboardConfig[key] });
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    updateDashboardConfig({ sectionOrder: newOrder });
  };

  const moveDown = (index: number) => {
    if (index >= currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    updateDashboardConfig({ sectionOrder: newOrder });
  };

  const handleReset = () => {
    updateDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
  };

  const activeCount = currentOrder.filter(k => dashboardConfig[k]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="liquid-glass-card w-full max-w-lg p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto space-y-4 border border-white/20 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                شخصی‌سازی چیدمان داشبورد
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ترتیب و نمایش بخش‌های صفحه اصلی را بر اساس نیاز خود تنظیم کنید ({activeCount} بخش فعال)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section List with Reorder and Visibility Controls */}
        <div className="space-y-2">
          {currentOrder.map((key, index) => {
            const def = SECTION_DEFINITIONS[key] || { title: key, desc: '' };
            const isVisible = !!dashboardConfig[key];
            const isFirst = index === 0;
            const isLast = index === currentOrder.length - 1;

            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                  isVisible
                    ? 'border-indigo-500/35 bg-indigo-50/50 dark:bg-indigo-950/25 shadow-xs'
                    : 'border-slate-200/60 dark:border-white/5 opacity-60 bg-slate-100/40 dark:bg-white/5'
                }`}
              >
                {/* Reorder Buttons (Move Up / Down) */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={isFirst}
                    className={`p-1 rounded-lg transition ${
                      isFirst
                        ? 'opacity-25 cursor-not-allowed text-slate-400'
                        : 'hover:bg-indigo-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 active:scale-90'
                    }`}
                    title="انتقال به بالا"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={isLast}
                    className={`p-1 rounded-lg transition ${
                      isLast
                        ? 'opacity-25 cursor-not-allowed text-slate-400'
                        : 'hover:bg-indigo-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 active:scale-90'
                    }`}
                    title="انتقال به پایین"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section Title & Desc */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => toggleSection(key)}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{def.title}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {def.desc}
                  </p>
                </div>

                {/* Toggle Checkbox Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isVisible
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-300 dark:border-white/20 text-transparent hover:border-slate-400'
                  }`}
                  title={isVisible ? 'مخفی کردن' : 'نمایش دادن'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی چیدمان</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
          >
            ذخیره و بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomizeModal;
