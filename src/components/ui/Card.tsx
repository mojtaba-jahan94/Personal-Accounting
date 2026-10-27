import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'elevated' | 'gradient' | 'titanium';
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
      'rounded-3xl relative overflow-hidden transition-[transform,opacity,border-color,background-color,box-shadow] duration-300 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]';

    const variantStyles = {
      glass:
        'bg-white/85 dark:bg-[#120F1D]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.09] hover:dark:border-white/[0.18]',
      solid:
        'bg-white dark:bg-[#120F1D] border border-black/[0.06] dark:border-white/[0.08]',
      elevated:
        'bg-[#F0EDF5] dark:bg-[#181427]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/10',
      gradient:
        'bg-gradient-to-br from-violet-950/40 via-[#120F1D] to-[#181427] border border-violet-500/25',
      titanium:
        'card-titanium-holo',
    };

    const hoverStyles = hoverLift
      ? 'hover:-translate-y-1 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] active:scale-[0.99] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            hoverStyles,
            glow && 'border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.3)]',
            className
          )
        )}
        {...props}
      >
        {/* Subtle Top Specular Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* Optional Header Ambient Glow Bar */}
        {headerGlow && (
          <div className="absolute -top-12 inset-x-0 h-24 bg-gradient-to-b from-violet-500/20 to-transparent pointer-events-none" />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
