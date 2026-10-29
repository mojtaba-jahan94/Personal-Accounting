import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  /** Primary styling color variant */
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'gold' | 'emerald' | 'amber' | 'violet';
  /** Backwards compatible alias for variant */
  colorVariant?: 'primary' | 'success' | 'danger' | 'warning' | 'gold' | 'emerald' | 'amber' | 'violet';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  glow?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  colorVariant,
  size = 'sm',
  animated = true,
  className,
  glow = false,
}) => {
  const activeVariant = colorVariant || variant || 'primary';
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    xs: 'h-[2px]',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const variantGradients: Record<string, string> = {
    primary: 'bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500',
    violet: 'bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    danger: 'bg-gradient-to-r from-rose-500 to-red-400',
    warning: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    gold: 'bg-gradient-to-r from-[#DFC296] to-[#CBB084]',
  };

  const glowStyles: Record<string, string> = {
    primary: 'shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    violet: 'shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    success: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    emerald: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    danger: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
    warning: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    amber: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    gold: 'shadow-[0_0_12px_rgba(223,194,150,0.6)]',
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={twMerge(
        clsx(
          'w-full bg-white/[0.08] rounded-full overflow-hidden p-0 relative',
          sizeStyles[size],
          className
        )
      )}
    >
      {animated ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={clsx(
            'h-full rounded-full',
            variantGradients[activeVariant] || variantGradients.primary,
            glow && (glowStyles[activeVariant] || glowStyles.primary)
          )}
        />
      ) : (
        <div
          style={{ width: `${percentage}%` }}
          className={clsx(
            'h-full rounded-full transition-[width] duration-300',
            variantGradients[activeVariant] || variantGradients.primary,
            glow && (glowStyles[activeVariant] || glowStyles.primary)
          )}
        />
      )}
    </div>
  );
};

export default ProgressBar;
