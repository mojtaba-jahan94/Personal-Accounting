import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'elevated' | 'gradient';
  glow?: boolean;
  hoverLift?: boolean;
  headerGlow?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      glow = false,
      hoverLift = false,
      headerGlow = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'rounded-3xl relative overflow-hidden transition-[transform,opacity,border-color,background-color] duration-150 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.08)]';

    const variantStyles = {
      glass:
        'bg-white/95 dark:bg-[#13101C]/95 border border-black/[0.06] dark:border-white/[0.08] hover:border-white/20',
      solid:
        'bg-white dark:bg-[#13101C] border border-black/[0.06] dark:border-white/[0.08]',
      elevated:
        'bg-[#F0EDF5] dark:bg-[#1A1626] border border-black/[0.08] dark:border-white/10',
      gradient:
        'bg-gradient-to-br from-violet-950/30 via-[#13101C] to-[#171424] border border-violet-500/20',
    };

    const hoverStyles = hoverLift
      ? 'hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            hoverStyles,
            glow && 'border-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.25)]',
            className
          )
        )}
        {...props}
      >
        {/* Subtle Inner Top Specular Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* Optional Header Ambient Glow Bar */}
        {headerGlow && (
          <div className="absolute -top-12 inset-x-0 h-20 bg-gradient-to-b from-violet-500/15 to-transparent pointer-events-none" />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
