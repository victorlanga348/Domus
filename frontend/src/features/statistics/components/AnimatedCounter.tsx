import React, { useEffect, useState, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  from?: number;
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
  from = 0,
  duration = 1200,
  delay = 0,
  className = '',
  onComplete,
  animKey,
  formatter = (v) => Math.round(v),
}) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeFrom = Number.isFinite(from) ? from : 0;

  const [displayValue, setDisplayValue] = useState(safeFrom);
  const prevAnimKeyRef = useRef<number | string | symbol>(Symbol('initial'));
  const currentDisplayRef = useRef<number>(safeFrom);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Respeito à acessibilidade de redução de movimento
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(safeValue);
      currentDisplayRef.current = safeValue;
      prevAnimKeyRef.current = animKey;
      onCompleteRef.current?.();
      return;
    }

    const animKeyChanged = prevAnimKeyRef.current !== animKey;
    prevAnimKeyRef.current = animKey;

    // Se animKey mudou (ex: refresh ou carga inicial), começamos sempre de `safeFrom` (0)
    // Se animKey for a mesma mas o valor mudou, interpolamos a partir do número atual exibido
    const startValue = animKeyChanged ? safeFrom : currentDisplayRef.current;
    const targetValue = safeValue;
    const delta = targetValue - startValue;

    if (delta === 0) {
      setDisplayValue(targetValue);
      currentDisplayRef.current = targetValue;
      onCompleteRef.current?.();
      return;
    }

    // Inicializa o valor exibido com startValue imediatamente (garante 0 durante delays)
    setDisplayValue(startValue);
    currentDisplayRef.current = startValue;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startValue + delta * easedProgress;

      setDisplayValue(current);
      currentDisplayRef.current = current;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        currentDisplayRef.current = targetValue;
        onCompleteRef.current?.();
      }
    };

    timeoutRef.current = window.setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [safeValue, safeFrom, duration, delay, animKey]);

  return <span className={className}>{formatter(displayValue)}</span>;
};
