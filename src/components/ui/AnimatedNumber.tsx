import React, { useEffect, useRef, useState } from 'react';
import { toPersianDigits } from '../../utils/formatters';
import { getAnimationLevel } from '../../utils/motionSettings';

export interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  currency?: 'toman' | 'rial' | string;
  showCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 600,
  currency,
  showCurrency = false,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(() => {
    // If animations are off/lite on first render, start directly at target
    if (typeof window !== 'undefined') {
      const animLevel = getAnimationLevel();
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (animLevel === 'lite' || animLevel === 'off' || isReduced) {
        return value;
      }
    }
    return 0;
  });

  const prevValueRef = useRef<number>(displayValue);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    const animLevel = getAnimationLevel();
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fast-path: bypass rAF completely when animations are lite/off or reduced motion
    if (animLevel === 'lite' || animLevel === 'off' || isReducedMotion || duration <= 0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      isFirstMountRef.current = false;
      return;
    }

    const prevVal = prevValueRef.current;
    const isFirstMount = isFirstMountRef.current;
    isFirstMountRef.current = false;

    // Check if delta > 0.5% when not first mount
    if (!isFirstMount) {
      const absPrev = Math.abs(prevVal);
      const delta = Math.abs(value - prevVal);
      if (absPrev > 0 && delta / absPrev < 0.005) {
        // Less than 0.5% change: skip rAF
        setDisplayValue(value);
        prevValueRef.current = value;
        return;
      }
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const startValue = prevVal;
    const targetValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic (0.22, 1, 0.36, 1) approximation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = targetValue;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formattedNumber = toPersianDigits(Math.round(displayValue).toLocaleString('fa-IR'));

  return (
    <span className={`font-mono tabular-nums inline-flex items-baseline gap-1 ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span>{formattedNumber}</span>
      {suffix && <span>{suffix}</span>}
      {showCurrency && currency && (
        <span className="text-[0.65em] font-sans opacity-70">
          {currency === 'toman' ? 'تومان' : currency === 'rial' ? 'ریال' : currency}
        </span>
      )}
    </span>
  );
};

export default AnimatedNumber;
