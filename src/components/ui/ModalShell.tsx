import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  maxWidth,
  size,
  children,
  footer,
  className,
  hideCloseButton = false,
}) => {
  const activeMaxWidth = size || maxWidth || 'md';
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const maxWidthStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={twMerge(
              clsx(
                'relative w-full max-h-[92dvh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#120F1A] border border-white/[0.1] text-fintech-text-main shadow-2xl overflow-hidden z-10',
                maxWidthStyles[activeMaxWidth],
                className
              )
            )}
          >
            {/* Mobile Drag Indicator */}
            <div className="pt-2 sm:hidden flex justify-center shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            {(title || badge) && (
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
                <div className="space-y-0.5">
                  {badge && (
                    <span className="text-[10px] tracking-[0.2em] font-mono text-violet-400 uppercase block">
                      {badge}
                    </span>
                  )}
                  {title && (
                    <h3 className="text-lg font-semibold text-fintech-text-main">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-fintech-text-muted">{subtitle}</p>
                  )}
                </div>

                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-fintech-text-muted hover:text-white hover:bg-white/[0.08] transition"
                    aria-label="بستن"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-white/[0.08] bg-black/20 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalShell;
