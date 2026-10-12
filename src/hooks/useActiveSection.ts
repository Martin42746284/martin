import { useEffect, useState } from 'react';

/**
 * Renvoie l'id (titre h2) de la section actuellement au centre de l'écran,
 * pour surligner l'entrée correspondante du menu.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const targets = new Map<Element, string>();
    key.split('|').forEach((id) => {
      const heading = document.getElementById(id);
      const section = heading?.closest('section');
      if (section) targets.set(section, id);
    });
    if (targets.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const id = targets.get(visible[0].target);
          if (id) setActive(id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    targets.forEach((_id, section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
