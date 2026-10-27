import React from 'react';
import { useFinance } from '../../context/FinanceContext';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isJuniper = themeConfig.palette === 'juniper_coral';

  const primaryGlow = isJuniper ? 'rgba(125,40,38,0.22)' : 'rgba(139,92,246,0.22)';
  const secondaryGlow = isJuniper ? 'rgba(137,136,97,0.18)' : 'rgba(99,102,241,0.18)';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-300"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Base */}
      <div className="absolute inset-0 bg-[#F8F7FA] dark:bg-[#0A090D] transition-colors duration-300" />

      {/* 2. Top-Right Soft Radial Glow (Pre-baked radial gradient, zero CSS blur filter) */}
      <div
        className="absolute -top-32 right-[-10%] sm:right-[5%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryGlow} 0%, rgba(139,92,246,0.05) 50%, transparent 70%)`,
        }}
      />

      {/* 3. Bottom-Left Soft Radial Glow */}
      <div
        className="absolute top-[40%] sm:top-[30%] -left-[15%] sm:-left-[5%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${secondaryGlow} 0%, rgba(99,102,241,0.04) 50%, transparent 70%)`,
        }}
      />

      {/* 4. Center Subtle Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.08),transparent)]" />
    </div>
  );
};

export default MinimalBackground;
