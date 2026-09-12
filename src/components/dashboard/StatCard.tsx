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
    <div className="liquid-glass-card p-5 relative overflow-hidden group">
      {/* Specular sheen reflection gradient */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent" />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pl-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap truncate font-mono">
            {amount}
          </h3>
          {subtext && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap truncate">
              {subtext}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl ${colorClass} text-white shadow-md shadow-indigo-500/20 shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {badge && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">وضعیت تراز:</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-xl text-[11px] ${
              badge.isPositive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
