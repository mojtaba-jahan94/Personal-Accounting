import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  storageKey?: string;
  className?: string;
  headerClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  defaultExpanded = true,
  storageKey,
  className = 'bg-white dark:bg-[#13101C] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm',
  headerClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`pf_collapse_${storageKey}`);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return defaultExpanded;
  });

  const toggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (storageKey) {
        localStorage.setItem(`pf_collapse_${storageKey}`, String(next));
      }
      return next;
    });
  };

  return (
    <div className={`${className} transition-[box-shadow,border-color] duration-150`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between cursor-pointer select-none ${
          isExpanded ? 'mb-4' : 'mb-0'
        } ${headerClassName}`}
        onClick={toggle}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-2">
          {icon && <div className="shrink-0 text-[#A68A64]">{icon}</div>}
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-bold text-[#1F2933] dark:text-[#F7F7F2] flex items-center gap-2 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-[11px] sm:text-xs text-[#6B7280] dark:text-[#D1D5DB]/80 truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {headerAction}
          <button
            type="button"
            onClick={toggle}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white transition"
            title={isExpanded ? 'بستن کشویی' : 'باز کردن کشویی'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && <div className="animate-in fade-in duration-200">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;

