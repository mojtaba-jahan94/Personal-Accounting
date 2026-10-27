import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BackgroundStyle } from '../../types';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isJuniper = themeConfig.palette === 'juniper_coral';

  // Default spotlights per palette
  const spotlight1 =
    themeConfig.spotlight1Color || (isJuniper ? '#7D2826' : '#A68A64'); // Coral or Warm Wood
  const spotlight2 =
    themeConfig.spotlight2Color || (isJuniper ? '#898861' : '#6B7280'); // Leaf or Fjord Gray

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Base Layer */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isJuniper
            ? 'bg-[#EFE9D7] dark:bg-[#202316]'
            : 'bg-[#F7F7F2] dark:bg-[#0A0A0C]'
        }`}
      />

      {/* 2. Dual Ambient Radial Glows */}
      {/* Spotlight 1 (Upper Ambient Beam: Coral or Warm Wood) */}
      <div
        className="absolute -top-32 right-[5%] sm:right-[15%] w-[620px] h-[620px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 opacity-12 dark:opacity-16"
        style={{ backgroundColor: spotlight1 }}
      />

      {/* Spotlight 2 (Lower Ambient Beam: Leaf or Fjord Gray) */}
      <div
        className="absolute top-[45%] -left-[5%] sm:left-[10%] w-[580px] h-[580px] rounded-full blur-[145px] pointer-events-none transition-all duration-500 opacity-28 dark:opacity-18"
        style={{ backgroundColor: spotlight2 }}
      />

      {/* 3. Subtle Ambient Gradient Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isJuniper
            ? 'bg-gradient-to-b from-[#EFE9D7]/60 via-transparent to-[#898861]/15 dark:from-[#343723]/50 dark:via-transparent dark:to-[#171910]/75'
            : 'bg-gradient-to-b from-[#F7F7F2]/60 via-transparent to-[#D1D5DB]/25 dark:from-[#121215]/50 dark:via-transparent dark:to-[#0A0A0C]/80'
        }`}
      />
    </div>
  );
};

export default MinimalBackground;

