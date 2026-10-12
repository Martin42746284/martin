import { useEffect, useState } from 'react';
import type { Theme } from '../hooks/useTheme';
import { useI18n } from '../lib/i18n';
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from './icons';

export const NAV_LINKS = [{ id: 'a-propos' }, { id: 'services' }, { id: 'competences' }, { id: 'projets' }, { id: 'contact' }] as const;

interface Props {
  name: string;
  active: string;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ name, active, theme, onToggleTheme }: Props) {
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="header" data-scrolled={scrolled} data-open={menuOpen}>
      <div className="container header__bar">
        <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="Logo" className="brand__logo" />
          </span>
          <span className="brand__name">{name}</span>
        </a>

        <nav className="nav" id="menu" aria-label={t('header.mainNav')}>
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  className="nav__link"
                  href={`#${link.id}`}
                  aria-current={active === link.id ? 'true' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(`nav.${link.id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__tools">
          <div className="lang" role="group" aria-label={t('header.lang')}>
            {(['fr', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                className="lang__btn"
                aria-pressed={lang === code}
                lang={code}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="icon-btn header__burger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label={menuOpen ? t('header.menuClose') : t('header.menuOpen')}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
