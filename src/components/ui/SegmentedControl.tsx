import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  activeColor?: string; // Optional custom active background or gradient
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  name = 'segmented-control',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={twMerge(
        clsx(
          'inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md select-none',
          size === 'sm' && 'p-0.5 rounded-xl',
          className
        )
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              'relative flex items-center justify-center gap-1.5 font-medium rounded-xl transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-xs sm:text-sm',
              isSelected
                ? 'text-white font-semibold'
                : 'text-fintech-text-muted hover:text-fintech-text-main'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segment-${name}`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={clsx(
                  'absolute inset-0 rounded-xl pointer-events-none shadow-sm',
                  opt.activeColor ||
                    'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-glow-violet'
                )}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
