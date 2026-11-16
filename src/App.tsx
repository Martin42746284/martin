import { useEffect, useMemo } from 'react';
import { useI18n } from './lib/i18n';
import { localizeData } from './lib/localize';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Services } from './components/Services';
import { Skills } from './components/Skills';
import { usePortfolio } from './hooks/usePortfolio';
import { useTheme } from './hooks/useTheme';

function ScrollEffects() {
  useEffect(() => {
    const progress = document.querySelector<HTMLElement>('.progress');
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        progress?.style.setProperty('--p', String(distance > 0 ? window.scrollY / distance : 0));
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const containers = Array.from(document.querySelectorAll<HTMLElement>('main > section > .container'));
    let observer: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -10% 0px' },
      );
      containers.forEach((container) => {
        container.dataset.reveal = 'true';
        observer?.observe(container);
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      observer?.disconnect();
    };
  }, []);

  return <div className="progress" aria-hidden="true" />;
}

export default function App() {
  const { data: raw } = usePortfolio();
  const { t, lang } = useI18n();
  const data = useMemo(() => localizeData(raw, lang), [raw, lang]);
  const { theme, toggle } = useTheme();

  return (
    <>
      <a className="skip-link" href="#contenu">
        {t('skip')}
      </a>
      <ScrollEffects />
      <Header name={data.profile.full_name} theme={theme} onToggleTheme={toggle} />
      <main id="contenu" tabIndex={-1} role="main">
        <Hero profile={data.profile} />
        <About profile={data.profile} stats={data.stats} />
        <Services services={data.services} />
        <Skills skills={data.skills} />
        <Projects projects={data.projects} />
        <Contact profile={data.profile} />
      </main>
      <Footer name={data.profile.full_name} />
    </>
  );
}