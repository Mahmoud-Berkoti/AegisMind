/**
 * Performance utilities for optimizing rendering and data processing
 */

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (timeout === null) {
      timeout = window.setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}

/**
 * Downsample data points for efficient rendering
 */
export function downsample(
  points: Array<[number, number]>,
  targetCount: number
): Array<[number, number]> {
  if (points.length <= targetCount) {
    return points;
  }

  const bucketSize = Math.floor(points.length / targetCount);
  const result: Array<[number, number]> = [];

  for (let i = 0; i < points.length; i += bucketSize) {
    const bucket = points.slice(i, i + bucketSize);
    if (bucket.length === 0) continue;

    // Use max value in bucket for visibility
    const maxPoint = bucket.reduce((max, point) => (point[1] > max[1] ? point : max));
    result.push(maxPoint);
  }

  return result;
}

/**
 * Measure render performance
 */
export function measureRender(componentName: string, callback: () => void): void {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) {
    console.warn(`${componentName} render took ${duration.toFixed(2)}ms (>16ms)`);
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

