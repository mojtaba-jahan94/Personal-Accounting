import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLMotionProps<'div'> {
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
      'rounded-3xl relative overflow-hidden transition-all duration-300 backdrop-blur-xl';

    const variantStyles = {
      glass:
        'bg-fintech-card border border-fintech-border shadow-glass hover:border-white/15',
      solid:
        'bg-fintech-card-solid border border-fintech-border shadow-lg',
      elevated:
        'bg-fintech-elevated border border-fintech-border shadow-xl',
      gradient:
        'bg-gradient-to-br from-violet-900/30 via-fintech-card to-fintech-elevated border border-violet-500/20 shadow-glow-violet',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverLift
            ? {
                y: -3,
                boxShadow:
                  '0 24px 48px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12) inset',
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              }
            : undefined
        }
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            glow && 'shadow-glow-violet border-violet-500/30',
            className
          )
        )}
        {...props}
      >
        {/* Optional Header Ambient Glow Bar */}
        {headerGlow && (
          <div className="absolute -top-16 inset-x-0 h-24 bg-gradient-to-b from-violet-500/15 to-transparent blur-xl pointer-events-none" />
        )}
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
