export type AnimationLevel = 'full' | 'lite' | 'off';

const STORAGE_KEY = 'fintech_animation_level';

/**
 * Determines the optimal default animation level based on device hardware and screen size
 */
export function detectDefaultAnimationLevel(): AnimationLevel {
  if (typeof window === 'undefined') return 'full';

  try {
    // Respect system prefers-reduced-motion as 'off' or 'lite'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'off';
    }

    // Low hardware concurrency (<= 4 cores)
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
      return 'lite';
    }

    // Low device memory (<= 4 GB)
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof deviceMemory === 'number' && deviceMemory <= 4) {
      return 'lite';
    }

    // Mobile screen width
    if (window.matchMedia('(max-width: 768px)').matches) {
      return 'lite';
    }
  } catch {
    // Fallback safely
  }

  return 'full';
}

/**
 * Gets currently saved or auto-detected animation level
 */
export function getAnimationLevel(): AnimationLevel {
  if (typeof window === 'undefined') return 'full';

  const saved = localStorage.getItem(STORAGE_KEY) as AnimationLevel | null;
  if (saved === 'full' || saved === 'lite' || saved === 'off') {
    return saved;
  }

  const detected = detectDefaultAnimationLevel();
  localStorage.setItem(STORAGE_KEY, detected);
  return detected;
}

/**
 * Updates animation level, syncs to localStorage and applies data-anim-level attribute on <html>
 */
export function setAnimationLevel(level: AnimationLevel): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, level);
  applyAnimationLevel(level);

  // Dispatch custom event for reactive components (like AnimatedNumber or SilkWaveBackground)
  window.dispatchEvent(new CustomEvent('animationLevelChanged', { detail: { level } }));
}

/**
 * Applies attribute on documentElement
 */
export function applyAnimationLevel(level: AnimationLevel): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-anim-level', level);
}
