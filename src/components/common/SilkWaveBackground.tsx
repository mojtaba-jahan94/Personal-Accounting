import React, { useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const SilkWaveBackground: React.FC = () => {
  const { themeConfig } = useFinance();
  const isJuniper = themeConfig.palette === 'juniper_coral';

  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const waveRef1 = useRef<SVGPathElement>(null);
  const waveRef2 = useRef<SVGPathElement>(null);
  const isHiddenRef = useRef<boolean>(typeof document !== 'undefined' ? document.hidden : false);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      // If document is hidden, don't request next frame immediately; wait for visibilitychange
      if (document.hidden) {
        return;
      }

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      phaseRef.current += delta * 0.45; // Gentle smooth movement
      const p = phaseRef.current;

      // Subtle dynamic morphing of silk wave curves
      if (waveRef1.current) {
        const offset1 = Math.sin(p) * 22;
        const offset2 = Math.cos(p * 0.8) * 18;
        waveRef1.current.setAttribute(
          'd',
          `M-80,${620 + offset1} C220,${460 - offset2} 520,${720 + offset1 * 0.7} 900,${500 - offset1} C1220,${320 + offset2} 1380,${360 - offset1} 1550,220 C1450,420 1280,620 950,750 C620,880 200,850 -80,820 Z`
        );
      }

      if (waveRef2.current) {
        const offset3 = Math.cos(p * 0.7) * 20;
        waveRef2.current.setAttribute(
          'd',
          `M-100,${550 + offset3} C200,${420 - offset3} 500,${680 + offset3 * 0.8} 850,${520 - offset3} C1200,${360 + offset3} 1400,${600 - offset3 * 0.5} 1600,450 L1600,1050 L-100,1050 Z`
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden;
      if (!document.hidden) {
        // Document became visible, resume loop
        lastTime = performance.now();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Document hidden, cancel pending rAF
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial start if visible
    if (!document.hidden) {
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      data-dynamic
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 1. Base Layer */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isJuniper
            ? 'bg-[#EFE9D7] dark:bg-[#202316]'
            : 'bg-[#F7F7F2] dark:bg-[#1F2933]'
        }`}
      />

      {/* 2. Fluid 3D Satin / Silk Wave Layer */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-85 dark:opacity-75 transition-opacity duration-500"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Ribbon Gradient */}
          <linearGradient id="nordicSilkRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            {isJuniper ? (
              <>
                <stop offset="0%" stopColor="#A33330" />
                <stop offset="28%" stopColor="#7D2826" />
                <stop offset="65%" stopColor="#631E1D" />
                <stop offset="88%" stopColor="#898861" />
                <stop offset="100%" stopColor="#343723" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#C2A882" />
                <stop offset="28%" stopColor="#A68A64" />
                <stop offset="65%" stopColor="#8A704C" />
                <stop offset="88%" stopColor="#6B7280" />
                <stop offset="100%" stopColor="#D1D5DB" />
              </>
            )}
          </linearGradient>

          {/* Deep Shadow Fold Gradient */}
          <linearGradient id="nordicSilkShadow" x1="0%" y1="100%" x2="100%" y2="0%">
            {isJuniper ? (
              <>
                <stop offset="0%" stopColor="#15170D" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#202316" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#343723" stopOpacity="0.1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#141B22" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#1F2933" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6B7280" stopOpacity="0.1" />
              </>
            )}
          </linearGradient>

          {/* Specular Highlight Edge */}
          <linearGradient id="nordicSilkHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            {isJuniper ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#EFE9D7" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#898861" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7D2826" stopOpacity="0.0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#F7F7F2" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#C2A882" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#A68A64" stopOpacity="0.0" />
              </>
            )}
          </linearGradient>

          {/* Secondary Ambient Wave Gradient */}
          <linearGradient id="nordicSilkSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            {isJuniper ? (
              <>
                <stop offset="0%" stopColor="#7D2826" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#898861" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#343723" stopOpacity="0.12" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#A68A64" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#6B7280" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.12" />
              </>
            )}
          </linearGradient>

          {/* Soft Blur Filter for Silk Folds */}
          <filter id="nordicSilkBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="nordicSilkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Ambient radial glows */}
        <circle
          cx="960"
          cy="520"
          r="440"
          fill={isJuniper ? '#7D2826' : '#A68A64'}
          filter="url(#nordicSilkGlow)"
          className="opacity-10 dark:opacity-12"
        />
        <circle
          cx="340"
          cy="740"
          r="400"
          fill={isJuniper ? '#898861' : '#6B7280'}
          filter="url(#nordicSilkGlow)"
          className="opacity-25 dark:opacity-14"
        />

        {/* Secondary Back Wave Ribbon */}
        <path
          ref={waveRef2}
          d="M-100,550 C200,420 500,680 850,520 C1200,360 1400,600 1600,450 L1600,1050 L-100,1050 Z"
          fill="url(#nordicSilkSecondary)"
        />

        {/* Primary 3D Silk Ribbon Wave (Shadow Underneath) */}
        <path
          d="M-50,680 C250,520 480,760 880,560 C1250,380 1380,480 1550,320 L1550,1000 L-50,1000 Z"
          fill="url(#nordicSilkShadow)"
        />

        {/* Primary 3D Silk Ribbon Body (Warm Wood & Fjord Gray) */}
        <path
          ref={waveRef1}
          d="M-80,620 C220,460 520,720 900,500 C1220,320 1380,360 1550,220 C1450,420 1280,620 950,750 C620,880 200,850 -80,820 Z"
          fill="url(#nordicSilkRibbon)"
        />

        {/* Specular Silk Ridge Highlight */}
        <path
          d="M-80,622 C220,462 520,722 900,502 C1220,322 1380,362 1550,222"
          stroke="url(#nordicSilkHighlight)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          filter="url(#nordicSilkBlur)"
        />
        <path
          d="M-80,622 C220,462 520,722 900,502 C1220,322 1380,362 1550,222"
          stroke="#F7F7F2"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Crest Arc in Foreground */}
        <path
          d="M320,800 C600,680 880,420 1320,360 C1450,340 1520,370 1600,420 C1480,620 1150,780 750,860 C520,910 380,880 320,800 Z"
          fill="url(#nordicSilkRibbon)"
          opacity="0.85"
        />
        <path
          d="M320,800 C600,680 880,420 1320,360"
          stroke="url(#nordicSilkHighlight)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default SilkWaveBackground;

