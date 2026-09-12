import React, { useState } from 'react';
import { Calendar, X, Check, Clock, ChevronDown } from 'lucide-react';
import {
  getTodayJalali,
  getJalaliDaysAgo,
  getJalaliThisMonthRange,
  getJalaliLastMonthRange,
  getJalaliThreeMonthsRange,
  getJalaliThisYearRange,
} from '../../utils/jalali';

export type DatePreset =
  | 'all'
  | 'today'
  | 'week'
  | 'this_month'
  | 'last_month'
  | 'three_months'
  | 'this_year'
  | 'custom';

interface DateFilterBarProps {
  selectedPreset: DatePreset;
  startDate: string;
  endDate: string;
  onFilterChange: (preset: DatePreset, start: string, end: string) => void;
  className?: string;
  compact?: boolean;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  selectedPreset,
  startDate,
  endDate,
  onFilterChange,
  className = '',
  compact = false,
}) => {
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'all', label: 'همه زمان‌ها' },
    { id: 'today', label: 'امروز' },
    { id: 'week', label: '۷ روز اخیر' },
    { id: 'this_month', label: 'این ماه' },
    { id: 'last_month', label: 'ماه گذشته' },
    { id: 'three_months', label: '۳ ماه اخیر' },
    { id: 'this_year', label: 'امسال' },
    { id: 'custom', label: 'بازه دلخواه...' },
  ];

  const handlePresetSelect = (id: DatePreset) => {
    if (id === 'all') {
      onFilterChange('all', '', '');
    } else if (id === 'today') {
      const today = getTodayJalali();
      onFilterChange('today', today, today);
    } else if (id === 'week') {
      const today = getTodayJalali();
      const start = getJalaliDaysAgo(7);
      onFilterChange('week', start, today);
    } else if (id === 'this_month') {
      const { start, end } = getJalaliThisMonthRange();
      onFilterChange('this_month', start, end);
    } else if (id === 'last_month') {
      const { start, end } = getJalaliLastMonthRange();
      onFilterChange('last_month', start, end);
    } else if (id === 'three_months') {
      const { start, end } = getJalaliThreeMonthsRange();
      onFilterChange('three_months', start, end);
    } else if (id === 'this_year') {
      const { start, end } = getJalaliThisYearRange();
      onFilterChange('this_year', start, end);
    } else if (id === 'custom') {
      const start = customStart || getJalaliDaysAgo(30);
      const end = customEnd || getTodayJalali();
      setCustomStart(start);
      setCustomEnd(end);
      onFilterChange('custom', start, end);
    }
  };

  const handleApplyCustom = () => {
    onFilterChange('custom', customStart, customEnd);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0 pl-1">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-bold text-[11px] hidden sm:inline">فیلتر تاریخ:</span>
        </div>

        {presets.map(p => {
          const isActive = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                  : 'liquid-glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/50 dark:border-white/10'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker Inputs (shown when 'custom' is active) */}
      {selectedPreset === 'custom' && (
        <div className="p-3.5 rounded-2xl liquid-glass border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">از تاریخ:</span>
            <input
              type="text"
              placeholder="مثال: 1403/01/01"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none w-32 text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">تا تاریخ:</span>
            <input
              type="text"
              placeholder="مثال: 1403/12/29"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none w-32 text-center"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyCustom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>اعمال بازه</span>
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect('all')}
            className="text-slate-400 hover:text-rose-500 transition mr-auto text-[11px] font-bold"
          >
            حذف فیلتر
          </button>
        </div>
      )}
    </div>
  );
};
