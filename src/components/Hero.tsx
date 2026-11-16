import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { assetUrl } from '../lib/supabase';
import type { Profile } from '../lib/types';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';

const LOCAL_PHOTO = '/photo-martin.jpg';
const LOCAL_CV: Record<string, string> = { fr: '/CV_Martin_Manampisoa.pdf', en: '/CV_Martin_Manampisoa_EN.pdf' };

interface Props {
  profile: Profile;
}

export function Hero({ profile }: Props) {
  const { t, lang } = useI18n();
  const [first, ...rest] = profile.full_name.split(' ');
  const last = rest.join(' ');
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = photoFailed ? LOCAL_PHOTO : (assetUrl(profile.photo_path) ?? LOCAL_PHOTO);
  const cv = assetUrl(profile.cv_path) ?? LOCAL_CV[lang];

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__text">
          {profile.available && (
            <p className="status">
              <span className="status__dot" aria-hidden="true" />
              {t('hero.status')}
            </p>
          )}

          <h1 className="hero__name" id="hero-title">
            <span className="hero__line">
              <span className="hero__word">{first}</span>
            </span>
            {last && (
              <span className="hero__line">
                <span className="hero__word">{last}</span>
              </span>
            )}
          </h1>

          <p className="hero__role">{profile.title}</p>

          <p className="hero__tagline">{profile.tagline}</p>

          <div className="hero__actions">
            <a className="btn btn--primary" href="#contact">
              {t('hero.contact')}
            </a>
            <a className="btn btn--ghost" href={cv} target="_blank" rel="noopener noreferrer">
              {t('hero.cv')}
            </a>
          </div>

          <ul className="hero__links" aria-label={t('hero.profiles')}>
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
          <picture>
            {photo === LOCAL_PHOTO && <source srcSet="/photo-martin.webp" type="image/webp" />}
            <img
              className="portrait__img"
              src={photo}
              alt={t('hero.portrait', { name: profile.full_name })}
              width={800}
              height={1000}
              fetchPriority="high"
              onError={() => setPhotoFailed(true)}
            />
          </picture>
        </figure>
      </div>
    </section>
  );
}
