import { useEffect, useRef, useState } from 'react';
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

const FOCUSABLE = 'a[href], button:not([disabled])';

export function Header({ name, active, theme, onToggleTheme }: Props) {
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // En disposition bureau, le menu replié n'a plus de sens : on le referme.
  useEffect(() => {
    const query = matchMedia('(min-width: 861px)');
    const onChange = () => {
      if (query.matches) setMenuOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Ouverture : focus sur le premier lien et défilement verrouillé.
  // Fermeture : le focus, s'il était dans le menu, revient au bouton burger (mobile uniquement).
  useEffect(() => {
    if (!menuOpen) return;
    navRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    document.documentElement.classList.add('is-locked');
    return () => {
      document.documentElement.classList.remove('is-locked');
      if (matchMedia('(max-width: 860px)').matches && navRef.current?.contains(document.activeElement)) {
        burgerRef.current?.focus();
      }
    };
  }, [menuOpen]);

  // Tant que le menu est ouvert : Échap le ferme, Tab reste dans l'en-tête.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return setMenuOpen(false);
      if (event.key !== 'Tab') return;
      const root = rootRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !root.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="header" data-scrolled={scrolled} data-open={menuOpen} ref={rootRef}>
      <div className="container header__bar">
        <a className="brand" href="#top" onClick={() => setMenuOpen(false)} aria-label={name}>
          <span className="brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" className="brand__logo" />
          </span>
          <span className="brand__name">{name}</span>
        </a>

        <nav className="nav" id="menu" aria-label={t('header.mainNav')} ref={navRef} role="navigation">
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  className="nav__link"
                  href={`#${link.id}`}
                  aria-current={active === link.id ? 'location' : undefined}
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
            ref={burgerRef}
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
