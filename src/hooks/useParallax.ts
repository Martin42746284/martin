import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './useInView';

/**
 * Expose la position du curseur dans l'élément sous forme de variables CSS --px et --py (de -1 à 1).
 * Désactivé sur écran tactile et quand l'utilisateur préfère moins d'animations.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--px', (((event.clientX - rect.left) / rect.width - 0.5) * 2).toFixed(3));
        el.style.setProperty('--py', (((event.clientY - rect.top) / rect.height - 0.5) * 2).toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return ref;
}
