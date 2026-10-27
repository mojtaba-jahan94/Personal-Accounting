import React, { useEffect, useState } from 'react';
import { toPersianDigits } from '../../utils/formatters';

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
  duration = 900,
  currency,
  showCurrency = false,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const targetValue = value;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion || duration <= 0) {
      setDisplayValue(targetValue);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formattedNumber = toPersianDigits(displayValue.toLocaleString('fa-IR'));

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
