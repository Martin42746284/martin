import { useEffect, useState } from 'react';
import { prefersReducedMotion, useInView } from '../hooks/useInView';

interface Props {
  value: number;
  suffix?: string;
  duration?: number;
}

/** Compte de 0 à `value` quand l'élément devient visible. */
export function CountUp({ value, suffix = '', duration = 1600 }: Props) {
  const [ref, shown] = useInView<HTMLSpanElement>(0.6);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!shown) return;
    if (prefersReducedMotion()) {
      setCurrent(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCurrent(value * (1 - Math.pow(1 - t, 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown, value, duration]);

  return (
    <span ref={ref}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        {Math.round(current)}
        {suffix}
      </span>
    </span>
  );
}
