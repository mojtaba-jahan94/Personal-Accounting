import React from 'react';
import { useFinance } from '../../context/FinanceContext';

export const MinimalBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isDark = themeConfig.mode === 'dark';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Deep Void Base */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor: 'var(--bg-app, #08070C)' }}
      />

      {/* 2. Cyber Matrix Grid */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-20 dark:opacity-15" />

      {/* 3. Top-Right Soft Radial Glow */}
      <div
        className="absolute -top-32 right-[-10%] sm:right-[5%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, var(--aurora-1, rgba(139,92,246,0.18)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.05) 50%, transparent 70%)'
            : 'radial-gradient(circle, var(--aurora-1, rgba(139,92,246,0.12)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.03) 50%, transparent 70%)',
        }}
      />

      {/* 4. Bottom-Left Soft Radial Glow */}
      <div
        className="absolute top-[40%] sm:top-[30%] -left-[15%] sm:-left-[5%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle, var(--aurora-2, rgba(16,185,129,0.12)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.03) 50%, transparent 70%)'
            : 'radial-gradient(circle, var(--aurora-2, rgba(16,185,129,0.08)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.02) 50%, transparent 70%)',
        }}
      />

      {/* 5. Center Subtle Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50 dark:opacity-70" />
    </div>
  );
};

export default MinimalBackground;
