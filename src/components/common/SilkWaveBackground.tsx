import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const SilkWaveBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isDark = themeConfig.mode === 'dark';
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${
        isPaused ? 'motion-paused' : ''
      }`}
      aria-hidden="true"
    >
      {/* 1. Base Canvas Void Surface */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor: 'var(--bg-app, #08070C)' }}
      />

      {/* 2. Cyber Matrix Dot Grid */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-30 dark:opacity-20" />

      {/* 3. Dynamic Moving Cosmic Aurora Orbs */}
      <div className="ambient-blobs absolute inset-0 overflow-hidden pointer-events-none">
        {/* Aurora 1: Primary Accent Orb Top-Right */}
        <div
          className="absolute -top-36 right-[-5%] sm:right-[10%] w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] rounded-full pointer-events-none animate-aurora-1 transition-all duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 45% 45%, var(--aurora-1, rgba(139, 92, 246, 0.28)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.12) 40%, transparent 70%)'
              : 'radial-gradient(circle at 45% 45%, var(--aurora-1, rgba(139, 92, 246, 0.18)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.08) 40%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />

        {/* Aurora 2: Secondary Accent Orb Mid-Left */}
        <div
          className="absolute top-[35%] -left-[10%] sm:-left-[5%] w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full pointer-events-none animate-aurora-2 transition-all duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 50% 50%, var(--aurora-2, rgba(16, 185, 129, 0.20)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.08) 45%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, var(--aurora-2, rgba(16, 185, 129, 0.12)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.04) 45%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />

        {/* Aurora 3: Deep Atmospheric Orb Bottom-Center */}
        <div
          className="absolute -bottom-40 right-[20%] w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full pointer-events-none animate-aurora-3 transition-all duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 50% 50%, var(--aurora-3, rgba(244, 63, 94, 0.16)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.06) 50%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, var(--aurora-3, rgba(244, 63, 94, 0.08)) 0%, rgba(var(--primary-rgb, 139, 92, 246), 0.03) 50%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      {/* 4. Fine Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40 dark:opacity-75" />
    </div>
  );
};

export default SilkWaveBackground;
