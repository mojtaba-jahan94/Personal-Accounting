import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'gold';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  className,
}) => {
  const variantStyles = {
    neutral: 'bg-white/[0.06] text-fintech-text-muted border-white/10',
    primary: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    gold: 'bg-[#DFC296]/15 text-[#DFC296] border-[#DFC296]/30',
  };

  const dotColors = {
    neutral: 'bg-fintech-text-muted',
    primary: 'bg-violet-400',
    success: 'bg-emerald-400',
    danger: 'bg-rose-400',
    warning: 'bg-amber-400',
    gold: 'bg-[#DFC296]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium border rounded-full font-mono select-none',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
          variantStyles[variant],
          className
        )
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
