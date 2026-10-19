import { createElement, type CSSProperties, type ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

type Variant = 'up' | 'left' | 'right' | 'scale';

interface Props {
  as?: 'div' | 'li' | 'section' | 'article' | 'p' | 'ul' | 'figure' | 'footer';
  variant?: Variant;
  /** Délai en millisecondes avant le début de l'animation. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Fait apparaître son contenu quand il entre dans l'écran. */
export function Reveal({ as = 'div', variant = 'up', delay = 0, className = '', children }: Props) {
  const [ref, shown] = useInView<HTMLElement>();
  return createElement(
    as,
    {
      ref,
      className: `reveal reveal--${variant} ${className}`.trim(),
      'data-shown': shown,
      style: { ['--d' as string]: `${delay}ms` } as CSSProperties,
    },
    children,
  );
}
