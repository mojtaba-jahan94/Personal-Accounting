import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const SilkWaveBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isJuniper = themeConfig.palette === 'juniper_coral';
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
      {/* 1. Base Static Gradient Surface */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isJuniper
            ? 'bg-[#EFE9D7] dark:bg-[#181A12]'
            : 'bg-[#F8F7FA] dark:bg-[#0A090D]'
        }`}
      />

      {/* 2. Pure CSS Pre-baked Radial Glow Blobs (Animated ONLY with translate3d, NO blur filters) */}
      <div className="ambient-blobs absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1: Top Accent Glow */}
        <div
          className={`silk-wave-blob absolute -top-40 right-[-10%] sm:right-[10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full pointer-events-none animate-blob-float-1 ${
            isJuniper
              ? 'opacity-25 dark:opacity-20'
              : 'opacity-20 dark:opacity-25'
          }`}
          style={{
            background: isJuniper
              ? 'radial-gradient(circle, rgba(125,40,38,0.35) 0%, rgba(137,136,97,0.15) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.18) 45%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />

        {/* Blob 2: Bottom-Left Fluid Glow */}
        <div
          className={`silk-wave-blob absolute top-[45%] -left-[15%] sm:-left-[5%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full pointer-events-none animate-blob-float-2 ${
            isJuniper
              ? 'opacity-20 dark:opacity-15'
              : 'opacity-15 dark:opacity-20'
          }`}
          style={{
            background: isJuniper
              ? 'radial-gradient(circle, rgba(137,136,97,0.3) 0%, rgba(52,55,35,0.15) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.12) 50%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />

        {/* Blob 3: Center Ambient Depth */}
        <div
          className="silk-wave-blob absolute -bottom-32 right-[25%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full pointer-events-none animate-blob-float-3 opacity-15 dark:opacity-15"
          style={{
            background: isJuniper
              ? 'radial-gradient(circle, rgba(223,194,150,0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      {/* 3. Subtle Static Vignette Overlay */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40 dark:opacity-60" />
    </div>
  );
};

export default SilkWaveBackground;
