import { useI18n } from '../lib/i18n';
import type { Profile, Stat } from '../lib/types';
import { CountUp } from './CountUp';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

interface Props {
  profile: Profile;
  stats: Stat[];
}

export function About({ profile, stats }: Props) {
  const { t } = useI18n();
  const paragraphs = profile.bio.split(/\n\s*\n/).filter(Boolean);

  const facts: Array<[string, string]> = [];
  if (profile.location) facts.push([t('about.place'), profile.location]);
  if (profile.education) facts.push([t('about.education'), profile.education]);
  if (profile.languages) facts.push([t('about.languages'), profile.languages]);
  facts.push([t('about.availability'), profile.available ? t('about.availYes') : t('about.availNo')]);

  return (
    <section className="section" aria-labelledby="a-propos">
      <div className="container">
        <SectionHead id="a-propos" title={t('about.title')} />
        <div className="about">
          <div className="about__text">
            {paragraphs.map((text, index) => (
              <Reveal as="p" key={text.slice(0, 32)} delay={index * 90}>
                {text}
              </Reveal>
            ))}
          </div>
          <Reveal as="div" variant="right" delay={120} className="about__facts">
            <dl className="facts">
              {facts.map(([term, value]) => (
                <div className="facts__row" key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {stats.length > 0 && (
          <ul className="stats">
            {stats.map((stat, index) => (
              <Reveal as="li" className="stats__item" key={stat.label} delay={index * 120}>
                <p className="stats__value">
                  <CountUp value={Number(stat.value)} suffix={stat.suffix} />
                </p>
                <p className="stats__label">{stat.label}</p>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
