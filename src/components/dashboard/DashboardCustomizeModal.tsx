import React from 'react';
import { X, SlidersHorizontal, Check, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DEFAULT_DASHBOARD_CONFIG } from '../../context/FinanceContext';

interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SectionItem {
  key: keyof typeof DEFAULT_DASHBOARD_CONFIG;
  title: string;
  desc: string;
}

const DASHBOARD_SECTIONS: SectionItem[] = [
  {
    key: 'showHero',
    title: 'بنر اصلی و تراز کل مالی',
    desc: 'نمایش خلاصه وضعیت رشد تراز مالی و دکمه‌های ثبت سریع',
  },
  {
    key: 'showKpiCards',
    title: 'کارت‌های ۴ گانه آمار و شاخص‌ها',
    desc: 'موجودی کل، مجموع درآمد، مخارج و نرخ پس‌انداز',
  },
  {
    key: 'showAccounts',
    title: 'کارت‌های بانکی و کیف‌پول‌ها',
    desc: 'اسلایدر کارت‌های بانکی و موجودی تک‌تک حساب‌ها',
  },
  {
    key: 'showExpenseChart',
    title: 'نمودار تحلیل مخارج و هزینه‌ها',
    desc: 'نمودار ستونی مقایسه‌ای درآمدها و مصارف مالی',
  },
  {
    key: 'showRecentTransactions',
    title: 'فهرست آخرین تراکنش‌ها',
    desc: '۵ تراکنش اخیر با جزئیات و دسته‌بندی',
  },
  {
    key: 'showBudgetProgress',
    title: 'سقف بودجه‌های ماهانه',
    desc: 'پیشرفت و درصد مصرف بودجه‌های تعریف‌شده',
  },
  {
    key: 'showCheques',
    title: 'یادآور چک‌های صیادی و اقساط',
    desc: 'چک‌های پاس‌نشده و نزدیک به تاریخ سررسید',
  },
];

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dashboardConfig, updateDashboardConfig } = useFinance();

  if (!isOpen) return null;

  const toggleSection = (key: keyof typeof DEFAULT_DASHBOARD_CONFIG) => {
    updateDashboardConfig({ [key]: !dashboardConfig[key] });
  };

  const handleReset = () => {
    updateDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto space-y-5 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                شخصی‌سازی چیدمان داشبورد
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بخش‌های دلخواه را برای نمایش در صفحه اصلی انتخاب یا مخفی کنید
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

        {/* Section List */}
        <div className="space-y-2.5">
          {DASHBOARD_SECTIONS.map(sec => {
            const isVisible = dashboardConfig[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  isVisible
                    ? 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                    : 'border-slate-200/60 dark:border-white/5 opacity-60 bg-slate-100/40 dark:bg-white/5'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{sec.title}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sec.desc}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center transition ${
                    isVisible
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-300 dark:border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
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
            <span>بازنشانی به حالت پیش‌فرض</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition"
          >
            بستن و ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};
