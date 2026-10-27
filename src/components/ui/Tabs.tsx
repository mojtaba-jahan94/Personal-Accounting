import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill' | 'chip';
  className?: string;
  layoutId?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'pill',
  className,
  layoutId = 'tabs-active-indicator',
}) => {
  return (
    <div
      role="tablist"
      className={twMerge(
        clsx(
          'flex items-center gap-1.5 p-1 rounded-2xl select-none',
          variant === 'pill' && 'bg-white/[0.04] border border-white/[0.08] backdrop-blur-md',
          variant === 'underline' && 'border-b border-white/[0.08]',
          className
        )
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
              isActive
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-fintech-text-main'
            )}
          >
            {/* Sliding Active Indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={clsx(
                  'absolute inset-0 rounded-xl pointer-events-none',
                  variant === 'pill' &&
                    'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-glow-violet',
                  variant === 'underline' &&
                    'bottom-0 top-auto h-0.5 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]',
                  variant === 'chip' &&
                    'bg-white/10 border border-white/15 backdrop-blur-md'
                )}
              />
            )}

            {/* Tab Content */}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-fintech-text-muted'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
