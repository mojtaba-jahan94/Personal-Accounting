import React from 'react';

export const SilkWaveBackground: React.FC = () => {
  return (
    <div
      data-dynamic
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Base Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#bde0fe] via-[#d0e8fc] to-[#e8f4fe] dark:from-[#050b18] dark:via-[#09152e] dark:to-[#040813] transition-colors duration-500" />

      {/* 2. Fluid 3D Satin / Silk Wave Layer (Direct visual match to reference image) */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity duration-500"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Royal Azure Ribbon Gradient */}
          <linearGradient id="silkRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="25%" stopColor="#1d4ed8" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Deep Shadow Fold */}
          <linearGradient id="silkShadow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f2b69" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#1e40af" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
          </linearGradient>

          {/* Cyan High-Light Edge */}
          <linearGradient id="silkHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#7dd3fc" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>

          {/* Secondary Soft Ambient Wave */}
          <linearGradient id="silkSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </linearGradient>

          {/* Soft Blur Filter for Silk Folds */}
          <filter id="silkBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="silkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
        </defs>

        {/* Deep ambient glow underneath */}
        <circle cx="950" cy="550" r="420" fill="#2563eb" filter="url(#silkGlow)" opacity="0.35" />
        <circle cx="350" cy="750" r="380" fill="#0284c7" filter="url(#silkGlow)" opacity="0.3" />

        {/* Secondary Back Wave Ribbon */}
        <path
          d="M-100,550 C200,420 500,680 850,520 C1200,360 1400,600 1600,450 L1600,1050 L-100,1050 Z"
          fill="url(#silkSecondary)"
          className="animate-float-alt"
          style={{ transformOrigin: 'center', animationDuration: '14s' }}
        />

        {/* Primary 3D Silk Ribbon Wave (Deep Fold) */}
        <path
          d="M-50,680 C250,520 480,760 880,560 C1250,380 1380,480 1550,320 L1550,1000 L-50,1000 Z"
          fill="url(#silkShadow)"
        />

        {/* Primary 3D Silk Ribbon Body (Vivid Royal Azure) */}
        <path
          d="M-80,620 C220,460 520,720 900,500 C1220,320 1380,360 1550,220 C1450,420 1280,620 950,750 C620,880 200,850 -80,820 Z"
          fill="url(#silkRibbon1)"
          className="animate-float-optimized"
          style={{ transformOrigin: '70% 50%', animationDuration: '10s' }}
        />

        {/* Specular Silk Ridge Highlight */}
        <path
          d="M-80,622 C220,462 520,722 900,502 C1220,322 1380,362 1550,222"
          stroke="url(#silkHighlight)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          filter="url(#silkBlur)"
        />
        <path
          d="M-80,622 C220,462 520,722 900,502 C1220,322 1380,362 1550,222"
          stroke="#ffffff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Crest Arc in Foreground (Matches the exact curve behind the music widget) */}
        <path
          d="M320,800 C600,680 880,420 1320,360 C1450,340 1520,370 1600,420 C1480,620 1150,780 750,860 C520,910 380,880 320,800 Z"
          fill="url(#silkRibbon1)"
          opacity="0.9"
        />
        <path
          d="M320,800 C600,680 880,420 1320,360"
          stroke="url(#silkHighlight)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
export default SilkWaveBackground;
