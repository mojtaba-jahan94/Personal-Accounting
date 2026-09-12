import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  className = 'liquid-glass-card p-5 sm:p-6',
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
    <div className={`${className} transition-all duration-200`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between cursor-pointer select-none ${
          isExpanded ? 'mb-4' : 'mb-0'
        } ${headerClassName}`}
        onClick={toggle}
      >
        <div className="flex items-center gap-2.5">
          {icon && <div className="shrink-0">{icon}</div>}
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
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
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            title={isExpanded ? 'بستن کشویی' : 'باز کردن کشویی'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
};
