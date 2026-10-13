import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BackgroundStyle } from '../../types';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const style: BackgroundStyle = themeConfig.backgroundStyle || 'clean_minimal';

  // Nordic Warm Wood default spotlights
  const spotlight1 = themeConfig.spotlight1Color || '#A68A64'; // Warm Wood
  const spotlight2 = themeConfig.spotlight2Color || '#6B7280'; // Fjord Gray

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Base Layer: Snow Cream in Light Mode, Nordic Charcoal in Dark Mode */}
      <div className="absolute inset-0 bg-[#F7F7F2] dark:bg-[#1F2933] amoled:bg-[#141B22] transition-colors duration-500" />

      {/* 2. Dual Ambient Nordic Radial Glows */}
      {style !== 'pure_solid' && (
        <>
          {/* Spotlight 1 (Upper Ambient Beam: Warm Wood) */}
          <div
            className="absolute -top-32 right-[5%] sm:right-[15%] w-[620px] h-[620px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 opacity-10 dark:opacity-12"
            style={{ backgroundColor: spotlight1 }}
          />

          {/* Spotlight 2 (Lower Ambient Beam: Fjord / Cloud Gray) */}
          <div
            className="absolute top-[45%] -left-[5%] sm:left-[10%] w-[580px] h-[580px] rounded-full blur-[145px] pointer-events-none transition-all duration-500 opacity-35 dark:opacity-14"
            style={{ backgroundColor: spotlight2 }}
          />
        </>
      )}

      {/* 3. Style Specific Overlays */}
      {style === 'clean_minimal' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F2]/60 via-transparent to-[#D1D5DB]/25 dark:from-[#1F2933]/50 dark:via-transparent dark:to-[#141B22]/70" />
      )}

      {style === 'dot_matrix' && (
        <svg
          className="absolute inset-0 w-full h-full opacity-25 dark:opacity-15 transition-opacity duration-500"
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
                className="fill-[#6B7280] dark:fill-[#D1D5DB]"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#minimal-dot-pattern)" />
        </svg>
      )}

      {style === 'soft_aurora' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#A68A64]/10 via-[#6B7280]/8 to-[#D1D5DB]/15 dark:from-[#A68A64]/15 dark:via-transparent dark:to-[#6B7280]/15" />
      )}
    </div>
  );
};

export default MinimalBackground;

