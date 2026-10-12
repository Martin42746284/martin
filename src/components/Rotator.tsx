import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useInView';
import { useI18n } from '../lib/i18n';

/** « Je construis » suivi d'un groupe de mots qui défilent. */
export function Rotator({ words }: { words: string[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 2800);
    return () => window.clearInterval(timer);
  }, [words.length]);

  if (words.length === 0) return null;

  return (
    <p className="rotator">
      <span className="rotator__prefix">{t('rotator.prefix')}</span>
      <span className="rotator__window" aria-hidden="true">
        <span className="rotator__word" key={index}>
          {words[index % words.length]}
        </span>
      </span>
      <span className="sr-only">{words.join(', ')}</span>
    </p>
  );
}
