import { useI18n } from '../lib/i18n';
import type { Profile, Stat } from '../lib/types';
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
            {paragraphs.map((text) => (
              <p key={text.slice(0, 32)}>{text}</p>
            ))}
          </div>
          <div className="about__facts">
            <dl className="facts">
              {facts.map(([term, value]) => (
                <div className="facts__row" key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {stats.length > 0 && (
          <ul className="stats">
            {stats.map((stat) => (
              <li className="stats__item" key={stat.label}>
                <p className="stats__value">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="stats__label">{stat.label}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}