import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  subtitle,
  animated = false,
}) => {
  const sizeMap: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 60,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 40;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-Precision Luxury Scandinavian Vector Emblem */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-md ${animated ? 'hover:scale-105 active:scale-95 transition-transform duration-200' : ''}`}
      >
        <defs>
          <radialGradient id="bl-bg-charcoal" cx="40%" cy="30%" r="85%">
            <stop offset="0%" stop-color="#283542" />
            <stop offset="50%" stop-color="#1F2933" />
            <stop offset="100%" stop-color="#141B22" />
          </radialGradient>

          <linearGradient id="bl-rim-specular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D1D5DB" stop-opacity="0.35" />
            <stop offset="35%" stop-color="#6B7280" stop-opacity="0.15" />
            <stop offset="70%" stop-color="#A68A64" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#C2A882" stop-opacity="0.25" />
          </linearGradient>

          <radialGradient id="bl-glow-ambient" cx="50%" cy="48%" r="48%">
            <stop offset="0%" stop-color="#A68A64" stop-opacity="0.28" />
            <stop offset="45%" stop-color="#6B7280" stop-opacity="0.16" />
            <stop offset="80%" stop-color="#A68A64" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#1F2933" stop-opacity="0" />
          </radialGradient>

          <linearGradient id="bl-wood-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C2A882" />
            <stop offset="45%" stop-color="#A68A64" />
            <stop offset="100%" stop-color="#8A704C" />
          </linearGradient>

          <linearGradient id="bl-wood-pocket" x1="0%" y1="10%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#8A704C" />
            <stop offset="18%" stop-color="#9C805A" />
            <stop offset="100%" stop-color="#735A3B" />
          </linearGradient>

          <linearGradient id="bl-bar-cloud-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#D1D5DB" />
            <stop offset="100%" stop-color="#6B7280" />
          </linearGradient>

          <linearGradient id="bl-bar-cream-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="60%" stop-color="#F7F7F2" />
            <stop offset="100%" stop-color="#D1D5DB" />
          </linearGradient>

          <linearGradient id="bl-bar-apex-3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#EADBCE" />
            <stop offset="30%" stop-color="#C2A882" />
            <stop offset="100%" stop-color="#A68A64" />
          </linearGradient>

          <linearGradient id="bl-clasp-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E5D6C3" />
            <stop offset="50%" stop-color="#C2A882" />
            <stop offset="100%" stop-color="#8A704C" />
          </linearGradient>
        </defs>

        {/* 1. SQUIRCLE CANVAS */}
        <rect x="0" y="0" width="512" height="512" rx="116" fill="url(#bl-bg-charcoal)" />

        {/* 2. SPECULAR RIM */}
        <rect x="3" y="3" width="506" height="506" rx="113" fill="none" stroke="url(#bl-rim-specular)" stroke-width="3" />

        {/* 3. AMBIENT GLOW */}
        <circle cx="256" cy="256" r="195" fill="url(#bl-glow-ambient)" />

        {/* 4. CONCENTRIC RINGS */}
        <circle cx="256" cy="256" r="168" fill="none" stroke="#D1D5DB" stroke-opacity="0.06" stroke-width="1.5" stroke-dasharray="4 6" />
        <circle cx="256" cy="256" r="132" fill="none" stroke="#A68A64" stroke-opacity="0.08" stroke-width="1.5" />

        {/* 5. ASCENDING WEALTH PILLARS */}
        <rect x="166" y="168" width="46" height="110" rx="14" fill="url(#bl-bar-cloud-1)" />
        <path d="M 172 174 L 206 174" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round" />

        <rect x="233" y="128" width="46" height="150" rx="14" fill="url(#bl-bar-cream-2)" />
        <path d="M 239 134 L 273 134" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="2.5" stroke-linecap="round" />

        <rect x="300" y="90" width="46" height="188" rx="14" fill="url(#bl-bar-apex-3)" />
        <path d="M 306 96 L 340 96" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="2.5" stroke-linecap="round" />

        {/* Growth Trendline */}
        <path d="M 189 156 L 256 116 L 323 78" fill="none" stroke="#F7F7F2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="189" cy="156" r="4.5" fill="#6B7280" stroke="#F7F7F2" stroke-width="2" />
        <circle cx="256" cy="116" r="5" fill="#A68A64" stroke="#F7F7F2" stroke-width="2.5" />
        <circle cx="323" cy="78" r="6" fill="#C2A882" stroke="#FFFFFF" stroke-width="3" />

        {/* Sparkle */}
        <g transform="translate(352, 68)">
          <path d="M 0 -12 Q 1 -1 12 0 Q 1 1 0 12 Q -1 1 -12 0 Q -1 -1 0 -12 Z" fill="#F7F7F2" />
          <circle cx="0" cy="0" r="2.5" fill="#C2A882" />
        </g>

        {/* 6. LEDGER WALLET BODY */}
        <rect x="100" y="214" width="312" height="198" rx="36" fill="url(#bl-wood-body)" />
        <path d="M 124 216 L 388 216" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2.5" stroke-linecap="round" />
        <rect x="101" y="215" width="310" height="196" rx="35" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />

        {/* Pocket Fold */}
        <path d="M 100 286 C 180 312, 332 312, 412 286 L 412 376 C 412 396, 396 412, 376 412 L 136 412 C 116 412, 100 396, 100 376 Z" fill="url(#bl-wood-pocket)" />
        <path d="M 101 286 C 180 312, 332 312, 411 286" fill="none" stroke="#C2A882" stroke-width="3" stroke-linecap="round" />

        {/* Nordic Ribbon */}
        <path d="M 100 252 L 142 214" stroke="#D1D5DB" stroke-opacity="0.4" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 100 266 L 156 214" stroke="#F7F7F2" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />

        {/* 7. HARDWARE CLASP & SMART CHIP */}
        <g transform="translate(256, 332)">
          <rect x="-32" y="-24" width="64" height="48" rx="14" fill="#1F2933" stroke="url(#bl-clasp-metal)" stroke-width="2.5" />
          <rect x="-24" y="-17" width="48" height="34" rx="9" fill="#141B22" />
          <rect x="-16" y="-11" width="32" height="22" rx="5" fill="none" stroke="url(#bl-clasp-metal)" stroke-width="1.5" />
          <line x1="-16" y1="0" x2="-4" y2="0" stroke="url(#bl-clasp-metal)" stroke-width="1.5" />
          <line x1="4" y1="0" x2="16" y2="0" stroke="url(#bl-clasp-metal)" stroke-width="1.5" />
          <line x1="0" y1="-11" x2="0" y2="-3" stroke="url(#bl-clasp-metal)" stroke-width="1.5" />
          <line x1="0" y1="3" x2="0" y2="11" stroke="url(#bl-clasp-metal)" stroke-width="1.5" />
          <circle cx="0" cy="0" r="3.5" fill="url(#bl-clasp-metal)" />
        </g>

        {/* Handcrafted Stitching */}
        <rect x="110" y="224" width="292" height="178" rx="28" fill="none" stroke="#D1D5DB" stroke-opacity="0.18" stroke-width="1.5" stroke-dasharray="5 5" />
      </svg>

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col text-right">
          <span className="text-sm font-black text-[#1F2933] dark:text-[#F7F7F2] tracking-tight leading-tight">
            {typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'juniper_coral'
              ? 'حسابداری ارس'
              : 'حسابداری نوردیک'}
          </span>
          <span className="text-[10px] font-semibold text-[#A68A64] tracking-wide mt-0.5">
            {subtitle || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'juniper_coral'
              ? 'پالت ارس و مرجان'
              : 'مدیریت هوشمند دارایی')}
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
