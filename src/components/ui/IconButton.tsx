import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'glass' | 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  label?: string;
  badge?: number | string | boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'glass',
      size = 'md',
      shape = 'circle',
      label,
      badge,
      disabled,
      className,
      icon,
      children,
      title,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center relative select-none transition-[transform,background-color,border-color,color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

    const sizeStyles = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-2xl',
    };

    const variantStyles = {
      glass:
        'bg-white/[0.05] dark:bg-[#1A1726] hover:bg-white/[0.1] dark:hover:bg-[#231F33] text-fintech-text-main border border-white/10 hover:border-white/20',
      ghost:
        'bg-transparent text-fintech-text-muted hover:text-fintech-text-main hover:bg-white/[0.06]',
      primary:
        'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-violet hover:brightness-110 border border-white/20',
      danger:
        'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={!disabled ? { scale: 0.92 } : undefined}
        aria-label={label || title || 'icon button'}
        title={title || label}
        disabled={disabled}
        className={twMerge(
          clsx(
            baseStyles,
            sizeStyles[size],
            shapeStyles[shape],
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {icon || children}
        {badge !== undefined && badge !== false && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-fintech-bg shadow-sm">
            {typeof badge === 'boolean' ? '' : badge}
          </span>
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
