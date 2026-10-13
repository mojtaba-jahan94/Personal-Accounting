import React from 'react';
import { X, SlidersHorizontal, Check, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                شخصی‌سازی چیدمان داشبورد
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                ترتیب و نمایش بخش‌های صفحه اصلی ({activeCount} بخش فعال)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Section List with Reorder and Visibility Controls */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-2.5 overscroll-contain">
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
                    ? 'border-[#A68A64]/40 bg-white/70 dark:bg-[#182028]/70 shadow-xs'
                    : 'border-[#6B7280]/20 dark:border-[#D1D5DB]/10 opacity-60 bg-[#6B7280]/5 dark:bg-[#182028]/30'
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
                        ? 'opacity-25 cursor-not-allowed text-[#6B7280]'
                        : 'hover:bg-[#A68A64]/15 text-[#1F2933] dark:text-[#F7F7F2] active:scale-90'
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
                        ? 'opacity-25 cursor-not-allowed text-[#6B7280]'
                        : 'hover:bg-[#A68A64]/15 text-[#1F2933] dark:text-[#F7F7F2] active:scale-90'
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
                  <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-1.5 truncate">
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-[#A68A64] shrink-0" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                    )}
                    <span className="truncate">{def.title}</span>
                  </span>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB] line-clamp-1 mt-0.5">
                    {def.desc}
                  </p>
                </div>

                {/* Toggle Checkbox Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isVisible
                      ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                      : 'border border-[#6B7280]/30 text-transparent hover:border-[#A68A64]'
                  }`}
                  title={isVisible ? 'مخفی کردن' : 'نمایش دادن'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی چیدمان</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ذخیره و بستن</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomizeModal;
