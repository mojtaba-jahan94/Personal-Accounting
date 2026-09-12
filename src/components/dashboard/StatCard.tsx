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
    <div className="glass-card p-5 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {amount}
          </h3>
          {subtext && (
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
              {subtext}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl ${colorClass} text-white shadow-sm shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">وضعیت</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-lg text-[11px] ${
              badge.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
