import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BackgroundStyle } from '../../types';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const style: BackgroundStyle = themeConfig.backgroundStyle || 'clean_minimal';
  const spotlight1 = themeConfig.spotlight1Color || '#6366f1';
  const spotlight2 = themeConfig.spotlight2Color || '#06b6d4';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Base Layer */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0a0d14] amoled:bg-black transition-colors duration-500" />

      {/* 2. Dual Independent Customizable Spotlights */}
      {style !== 'pure_solid' && (
        <>
          {/* Spotlight 1 (Upper Ambient Beam) */}
          <div
            className="absolute -top-32 right-[5%] sm:right-[18%] w-[600px] h-[600px] rounded-full blur-[135px] pointer-events-none transition-all duration-500 opacity-30 dark:opacity-35"
            style={{ backgroundColor: spotlight1 }}
          />

          {/* Spotlight 2 (Lower Ambient Beam) */}
          <div
            className="absolute top-[48%] -left-[5%] sm:left-[12%] w-[540px] h-[540px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 opacity-25 dark:opacity-30"
            style={{ backgroundColor: spotlight2 }}
          />
        </>
      )}

      {/* 3. Style Specific Optional Overlays */}
      {style === 'clean_minimal' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/40 via-transparent to-slate-100/20 dark:from-slate-900/40 dark:via-transparent dark:to-transparent" />
      )}

      {style === 'dot_matrix' && (
        <svg
          className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20 transition-opacity duration-500"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="minimal-dot-pattern"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                className="fill-slate-400 dark:fill-slate-600"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#minimal-dot-pattern)" />
        </svg>
      )}

      {style === 'soft_aurora' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-indigo-500/5 to-emerald-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-sky-500/10" />
      )}
    </div>
  );
};

export default MinimalBackground;
