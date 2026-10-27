import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, startIcon, endIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-fintech-text-muted select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-fintech-text-muted pointer-events-none">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] dark:bg-[#13101C]/80 border text-sm text-fintech-text-main placeholder-fintech-text-sub outline-none transition-[border-color,box-shadow,background-color] duration-150',
                error
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-white/10 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/25',
                startIcon && 'pr-10',
                endIcon && 'pl-10',
                className
              )
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-fintech-text-muted">
              {endIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={clsx(
              'text-[11px] font-medium leading-none',
              error ? 'text-rose-400' : 'text-fintech-text-sub'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, className, id, children, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-fintech-text-muted select-none"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-2xl bg-fintech-card-solid dark:bg-[#151220] border text-sm text-fintech-text-main outline-none transition-[border-color,box-shadow,background-color] duration-150 cursor-pointer',
              error
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/25',
              className
            )
          )}
          {...props}
        >
          {children}
        </select>
        {(error || helperText) && (
          <p
            className={clsx(
              'text-[11px] font-medium leading-none',
              error ? 'text-rose-400' : 'text-fintech-text-sub'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const areaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={areaId}
            className="block text-xs font-medium text-fintech-text-muted select-none"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] dark:bg-[#13101C]/80 border text-sm text-fintech-text-main placeholder-fintech-text-sub outline-none transition-[border-color,box-shadow,background-color] duration-150 resize-none',
              error
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/25',
              className
            )
          )}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={clsx(
              'text-[11px] font-medium leading-none',
              error ? 'text-rose-400' : 'text-fintech-text-sub'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
