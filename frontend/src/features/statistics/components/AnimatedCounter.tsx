import React, { useEffect, useState, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  animKey?: number | string;
  formatter?: (val: number) => string | number;
}

// Curva de desaceleração suave (easeOutExpo)
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  delay = 0,
  className = '',
  onComplete,
  animKey,
  formatter = (v) => Math.round(v),
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Respeito à acessibilidade de redução de movimento
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      onComplete?.();
      return;
    }

    const startValue = 0;
    const targetValue = value;
    const delta = targetValue - startValue;

    if (delta === 0) {
      setDisplayValue(targetValue);
      onComplete?.();
      return;
    }

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startValue + delta * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        onComplete?.();
      }
    };

    timeoutRef.current = window.setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, delay, animKey]);

  return <span className={className}>{formatter(displayValue)}</span>;
};
