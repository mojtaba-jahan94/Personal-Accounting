import React from 'react';
import { useFinance } from '../../context/FinanceContext';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isJuniper = themeConfig.palette === 'juniper_coral';

  // Primary ambient glow colors
  const primaryGlow = isJuniper ? '#7D2826' : '#8B5CF6';
  const secondaryGlow = isJuniper ? '#898861' : '#6366F1';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-700"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Base */}
      <div className="absolute inset-0 bg-[#F8F7FA] dark:bg-[#08070B] transition-colors duration-700" />

      {/* 2. Top-Right Soft Violet/Purple Gradient Glow */}
      <div
        className="absolute -top-32 right-[-10%] sm:right-[5%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full blur-[100px] sm:blur-[160px] opacity-15 dark:opacity-25 pointer-events-none transition-all duration-700 animate-[pulse_10s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${primaryGlow} 0%, transparent 70%)`,
        }}
      />

      {/* 3. Bottom-Left Soft Indigo/Fuchsia Gradient Glow */}
      <div
        className="absolute top-[40%] sm:top-[30%] -left-[15%] sm:-left-[5%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-[100px] sm:blur-[170px] opacity-15 dark:opacity-20 pointer-events-none transition-all duration-700 animate-[pulse_14s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${secondaryGlow} 0%, transparent 70%)`,
        }}
      />

      {/* 4. Center Subtle Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.06),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.12),rgba(0,0,0,0))]" />
    </div>
  );
};

export default MinimalBackground;
