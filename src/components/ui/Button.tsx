import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      isLoading = false,
      icon,
      iconPosition = 'start',
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-2xl select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white shadow-glow-violet hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-white/15',
      secondary:
        'bg-white/[0.05] hover:bg-white/[0.09] text-fintech-text-main border border-white/10 shadow-sm backdrop-blur-md',
      ghost:
        'bg-transparent text-fintech-text-muted hover:text-fintech-text-main hover:bg-white/[0.05]',
      danger:
        'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 shadow-glow-rose',
      gold:
        'bg-[#DFC296] text-[#0A0A0C] font-semibold hover:bg-[#cbb084] shadow-[0_0_20px_rgba(223,194,150,0.3)]',
    };

    const isSpinning = loading || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={!disabled && !isSpinning ? { scale: 0.96 } : undefined}
        disabled={disabled || isSpinning}
        className={twMerge(
          clsx(
            baseStyles,
            sizeStyles[size],
            variantStyles[variant],
            fullWidth && 'w-full',
            className
          )
        )}
        {...props}
      >
        {isSpinning ? (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'start' && <span className="shrink-0">{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'end' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
