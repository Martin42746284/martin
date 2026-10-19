import { useI18n } from '../lib/i18n';
import { Reveal } from './Reveal';

/** Bandeau de technologies qui défile en continu. */
export function Marquee({ items }: { items: string[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  const list = (hidden: boolean) => (
    <ul className="marquee__list" aria-hidden={hidden || undefined}>
      {items.map((name) => (
        <li key={`${hidden}-${name}`}>
          {name}
          <svg className="marquee__sep" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" />
          </svg>
        </li>
      ))}
    </ul>
  );

  return (
    <Reveal>
      <section className="marquee" aria-label={t('marquee.label')}>
        <div className="marquee__track">
          {list(false)}
          {list(true)}
        </div>
      </section>
    </Reveal>
  );
}
