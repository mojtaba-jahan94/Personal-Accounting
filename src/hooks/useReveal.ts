import { useState, useEffect, useRef } from 'react';
import { getAnimationLevel } from '../utils/motionSettings';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Shared IntersectionObserver hook for reveal-on-scroll that animates once only.
 * Fast-paths to true when animation level is lite/off or prefers-reduced-motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options;
  const ref = useRef<T | null>(null);

  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const animLevel = getAnimationLevel();
    if (animLevel === 'lite' || animLevel === 'off') return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return false;
  });

  useEffect(() => {
    if (isRevealed) return;
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(node);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, isRevealed]);

  return { ref, isRevealed };
}

export default useReveal;
