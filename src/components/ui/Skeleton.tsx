import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'h-4 w-3/4 rounded-lg',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      style={style}
      className={twMerge(
        clsx(
          'relative overflow-hidden bg-white/[0.05] animate-pulse',
          variantStyles[variant],
          className
        )
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
};

export default Skeleton;
