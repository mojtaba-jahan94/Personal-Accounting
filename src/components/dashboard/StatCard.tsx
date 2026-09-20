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
      data-glass
      className="liquid-glass-ios27 specular-sheen p-5 sm:p-6 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200"
    >
      {/* Top rim specular highlight line */}
      <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 dark:via-white/25 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 whitespace-nowrap truncate">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap truncate font-mono">
            {amount}
          </h3>
          {subtext && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap truncate font-medium">
              {subtext}
            </p>
          )}
        </div>

        {/* Floating Spatial Icon Pod */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl ${colorClass} text-white shadow-lg shadow-indigo-500/20 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ring-1 ring-white/30`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">وضعیت تراز:</span>
          <span
            className={`font-black px-2.5 py-0.5 rounded-full text-[11px] backdrop-blur-md ${
              badge.isPositive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-xs'
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
