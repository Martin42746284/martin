import { useState, type CSSProperties } from 'react';
import { useParallax } from '../hooks/useParallax';
import { useI18n } from '../lib/i18n';
import { assetUrl } from '../lib/supabase';
import type { Profile } from '../lib/types';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';
import { Rotator } from './Rotator';

const LOCAL_PHOTO = '/photo-martin.jpg';
const LOCAL_CV: Record<string, string> = { fr: '/CV_Martin_Manampisoa.pdf', en: '/CV_Martin_Manampisoa_EN.pdf' };

const step = (i: number): CSSProperties => ({ ['--i' as string]: i });

interface Props {
  profile: Profile;
  /** Technologies mises en avant autour du portrait. */
  chips: string[];
}

export function Hero({ profile, chips }: Props) {
  const { t, lang } = useI18n();
  const [first, ...rest] = profile.full_name.split(' ');
  const last = rest.join(' ');
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = photoFailed ? LOCAL_PHOTO : (assetUrl(profile.photo_path) ?? LOCAL_PHOTO);
  const cv = assetUrl(profile.cv_path) ?? LOCAL_CV[lang];
  const stage = useParallax<HTMLElement>();

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={stage}>
      <div className="container hero__grid">
        <div className="hero__text">
          {profile.available && (
            <p className="status intro" style={step(0)}>
              <span className="status__dot" aria-hidden="true" />
              {t('hero.status')}
            </p>
          )}

          <h1 className="hero__name" id="hero-title">
            <span className="hero__line">
              <span className="hero__word" style={step(1)}>
                {first}
              </span>
            </span>
            {last && (
              <span className="hero__line">
                <span className="hero__word" style={step(2)}>
                  {last}
                </span>
              </span>
            )}
          </h1>

          <p className="hero__role intro" style={step(3)}>
            {profile.title}
          </p>

          <div className="intro" style={step(4)}>
            <Rotator words={profile.hero_words ?? []} />
          </div>

          <p className="hero__tagline intro" style={step(5)}>
            {profile.tagline}
          </p>

          <div className="hero__actions intro" style={step(6)}>
            <a className="btn btn--primary" href="#contact">
              {t('hero.contact')}
            </a>
            <a className="btn btn--ghost" href={cv} target="_blank" rel="noopener noreferrer">
              {t('hero.cv')}
            </a>
          </div>

          <ul className="hero__links intro" style={step(7)} aria-label={t('hero.profiles')}>
            {profile.github_url && (
              <li>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <GithubIcon /> GitHub
                </a>
              </li>
            )}
            {profile.linkedin_url && (
              <li>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon /> LinkedIn
                </a>
              </li>
            )}
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`}>
                  <MailIcon /> {profile.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <figure className="portrait">
          <span className="portrait__rings" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="portrait__arch" aria-hidden="true" />
          <img
            className="portrait__img"
            src={photo}
            alt={t('hero.portrait', { name: profile.full_name })}
            width={800}
            height={1000}
            fetchPriority="high"
            onError={() => setPhotoFailed(true)}
          />
          {chips.slice(0, 3).map((name, index) => (
            <span className={`chip chip--${index + 1}`} key={name} aria-hidden="true">
              <span className="chip__dot" />
              {name}
            </span>
          ))}
        </figure>
      </div>
    </section>
  );
}
