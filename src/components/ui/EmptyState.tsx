import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="w-7 h-7" />;
    }
    return icon;
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]',
          className
        )
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/10 border border-violet-500/25 text-violet-400 flex items-center justify-center mb-4 shadow-glow-violet">
        {renderIcon()}
      </div>
      <h4 className="text-base font-semibold text-fintech-text-main mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-fintech-text-muted max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action ? (
        <div className="mt-1">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-1">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
