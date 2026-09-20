import React, { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';
import type { GlassConfig } from '@ybouane/liquidglass';
import { LIQUID_GLASS_PRESETS } from '../../utils/liquidGlassPresets';

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  defaultConfig?: Partial<GlassConfig>;
  enabled?: boolean;
}

export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  className = '',
  defaultConfig = LIQUID_GLASS_PRESETS.ios27Card,
  enabled = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!rootRef.current || !enabled) return;

    let instance: LiquidGlass | null = null;
    let isMounted = true;

    // Small delay to ensure children DOM nodes and fonts are mounted & sized
    const timer = setTimeout(() => {
      if (!rootRef.current || !isMounted) return;

      const glassElements = rootRef.current.querySelectorAll<HTMLElement>('[data-glass]');
      if (glassElements.length === 0) return;

      LiquidGlass.init({
        root: rootRef.current,
        glassElements: Array.from(glassElements),
        defaults: defaultConfig,
      })
        .then((inst) => {
          if (isMounted) {
            instance = inst;
          } else {
            inst.destroy();
          }
        })
        .catch((err) => {
          console.warn('[LiquidGlass] WebGL initialization skipped or unsupported, falling back to CSS glassmorphism:', err);
          setIsSupported(false);
        });
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (instance) {
        try {
          instance.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [defaultConfig, enabled]);

  return (
    <div
      ref={rootRef}
      className={`relative ${className} ${!isSupported ? 'liquid-glass-css-fallback' : ''}`}
    >
      {children}
    </div>
  );
};
