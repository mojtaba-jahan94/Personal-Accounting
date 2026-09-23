import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtext?: string;
  icon: LucideIcon;
  colorClass: string;
  badge?: {
    text: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtext,
  icon: Icon,
  colorClass,
  badge,
}) => {
  return (
    <div
      className="p-4 sm:p-5 rounded-2xl liquid-glass border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap truncate font-mono">
            {amount}
          </h3>
          {subtext && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap truncate">
              {subtext}
            </p>
          )}
        </div>

        {/* Clean Minimal Icon Pod */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${colorClass} text-white shadow-xs flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">وضعیت تراز:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              badge.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
