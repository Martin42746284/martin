import type { CSSProperties, PointerEvent } from 'react';
import { useI18n } from '../lib/i18n';
import type { Service, ServiceIcon } from '../lib/types';
import { AiIcon, ApiIcon, BusinessIcon, MobileIcon, SpeedIcon, WebIcon } from './icons';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

const ICONS: Record<ServiceIcon, typeof WebIcon> = {
  web: WebIcon,
  mobile: MobileIcon,
  api: ApiIcon,
  business: BusinessIcon,
  ai: AiIcon,
  speed: SpeedIcon,
};

function spotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

export function Services({ services }: { services: Service[] }) {
  const { t } = useI18n();
  if (services.length === 0) return null;

  return (
    <section className="section section--band" aria-labelledby="services">
      <div className="container">
        <SectionHead id="services" title={t('services.title')} lead={t('services.lead')} />

        <ul className="services">
          {services.map((service, index) => {
            const Icon = ICONS[service.icon] ?? WebIcon;
            return (
              <Reveal
                as="li"
                variant="scale"
                delay={(index % 3) * 110 + Math.floor(index / 3) * 80}
                className={`service${index === 0 ? ' service--lead' : ''}`}
                key={service.title}
              >
                <article className="service__card" onPointerMove={spotlight} style={{ ['--k' as string]: index } as CSSProperties}>
                  <span className="service__icon">
                    <Icon />
                  </span>
                  <h3 className="service__title">{service.title}</h3>
                  <p className="service__text">{service.description}</p>
                  <ul className="service__tags" aria-label={t('services.tags')}>
                    {service.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="services__cta" delay={150}>
          <p>{t('services.cta')}</p>
          <a className="btn btn--primary" href="#contact">
            {t('services.ctaButton')}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
