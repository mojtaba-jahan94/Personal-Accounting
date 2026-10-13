import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtext?: string;
  icon: LucideIcon;
  colorClass?: string;
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
  // If colorClass is not provided, default to warm-wood accent
  const badgeColor =
    badge?.isPositive !== undefined
      ? badge.isPositive
        ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border-[#2E7D5B]/25'
        : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border-[#C0564B]/25'
      : 'bg-[#A68A64]/15 text-[#A68A64] border-[#A68A64]/25';

  return (
    <div className="p-5 rounded-3xl bg-white/85 dark:bg-[#1F2933]/70 backdrop-blur-xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 shadow-sm hover:shadow-md hover:border-[#A68A64]/40 transition-all duration-200 relative overflow-hidden select-none group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#6B7280] dark:text-[#D1D5DB]/80 mb-1.5 whitespace-nowrap truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight whitespace-nowrap truncate font-mono">
            {amount}
          </h3>
          {subtext && (
            <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/60 mt-1 whitespace-nowrap truncate font-medium">
              {subtext}
            </p>
          )}
        </div>

        {/* Clean Minimal Icon Pod */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 duration-200 ${
            colorClass || 'bg-[#A68A64]/15 text-[#A68A64]'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-[#6B7280]/10 dark:border-[#D1D5DB]/10 flex items-center justify-between text-xs">
          <span className="text-[#6B7280] dark:text-[#D1D5DB]/60 text-[11px]">وضعیت تراز:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${badgeColor}`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

