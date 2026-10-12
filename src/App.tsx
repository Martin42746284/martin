import { useMemo } from 'react';
import { useI18n } from './lib/i18n';
import { localizeData } from './lib/localize';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header, NAV_LINKS } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Projects } from './components/Projects';
import { ScrollProgress } from './components/ScrollProgress';
import { Services } from './components/Services';
import { Skills } from './components/Skills';
import { useActiveSection } from './hooks/useActiveSection';
import { usePortfolio } from './hooks/usePortfolio';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { data: raw } = usePortfolio();
  const { t, lang } = useI18n();
  const data = useMemo(() => localizeData(raw, lang), [raw, lang]);
  const { theme, toggle } = useTheme();
  const active = useActiveSection(NAV_LINKS.map((link) => link.id));

  const skillNames = useMemo(
    () => [...new Set([...data.skills].sort((a, b) => a.sort_order - b.sort_order).map((skill) => skill.name))],
    [data.skills],
  );
  const chips = useMemo(
    () => data.skills.filter((skill) => skill.is_core).slice(0, 3).map((skill) => skill.name),
    [data.skills],
  );

  return (
    <>
      <a className="skip-link" href="#a-propos">
        {t('skip')}
      </a>
      <ScrollProgress />
      <Header name={data.profile.full_name} active={active} theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero profile={data.profile} chips={chips} />
        <Marquee items={skillNames} />
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
