import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from './localize';

const fr = {
  'page.title': 'Martin Manampisoa – Développeur fullstack web et mobile',
  'page.description':
    'Portfolio de Martin Manampisoa, développeur fullstack web et mobile à Antananarivo : React, TypeScript, Node.js, React Native et Supabase.',

  'skip': 'Aller au contenu',
  'nav.a-propos': 'À propos',
  'nav.services': 'Services',
  'nav.competences': 'Compétences',
  'nav.projets': 'Projets',
  'nav.contact': 'Contact',
  'header.mainNav': 'Navigation principale',
  'header.themeLight': 'Passer au thème clair',
  'header.themeDark': 'Passer au thème sombre',
  'header.menuOpen': 'Ouvrir le menu',
  'header.menuClose': 'Fermer le menu',
  'header.lang': 'Langue',

  'hero.status': 'Disponible pour un poste ou un stage',
  'hero.contact': 'Me contacter',
  'hero.cv': 'Télécharger mon CV',
  'hero.profiles': 'Mes profils',
  'hero.portrait': 'Portrait de {name}',
  'rotator.prefix': 'Je construis',
  'marquee.label': 'Technologies que j’utilise',

  'about.title': 'À propos',
  'about.place': 'Lieu',
  'about.education': 'Formation',
  'about.languages': 'Langues',
  'about.availability': 'Disponibilité',
  'about.availYes': 'Poste ou stage, dès maintenant',
  'about.availNo': 'Pas pour le moment',

  'services.title': 'Services',
  'services.lead': 'Ce que je peux construire pour vous, de l’idée à la mise en ligne.',
  'services.tags': 'Technologies',
  'services.cta': 'Un projet en tête ? Parlons-en.',
  'services.ctaButton': 'Demander un devis',

  'skills.title': 'Compétences',
  'skills.lead': 'Les technologies en gras sont celles que j’utilise le plus.',

  'projects.title': 'Projets',
  'projects.lead': 'Une sélection de {n} projets. Ouvrez-en un pour voir les détails.',
  'projects.filter': 'Filtrer les projets par type',
  'projects.all': 'Tous',
  'projects.tech': 'Technologies utilisées',
  'projects.show': 'Voir les détails',
  'projects.hide': 'Masquer les détails',
  'projects.source': 'Code source',
  'projects.site': 'Voir le site',
  'projects.newTab': ' de {title} (nouvel onglet)',
  'projects.empty': 'Aucun projet dans cette catégorie pour le moment.',
  'projects.screenshot': 'Capture d’écran de {title}',
  'projects.kind.Web': 'Application web',
  'projects.kind.Mobile': 'Application mobile',
  'projects.kind.API': 'API REST',

  'contact.title': 'Contact',
  'contact.lead': 'Une offre, un stage, un projet ? Écrivez-moi, je vous réponds par e-mail.',
  'contact.name': 'Nom',
  'contact.email': 'Adresse e-mail',
  'contact.subject': 'Sujet',
  'contact.subjectPlaceholder': 'Offre d’emploi, stage, projet…',
  'contact.message': 'Message',
  'contact.send': 'Envoyer le message',
  'contact.sending': 'Envoi en cours',
  'contact.sent': 'Message envoyé. Je vous réponds par e-mail.',
  'contact.mailto': 'Votre application de messagerie s’ouvre avec le message prêt à envoyer.',
  'contact.mailSubject': 'Message de {name} via votre portfolio',
  'contact.cooldown': 'Vous venez d’envoyer un message. Patientez quelques secondes avant d’en envoyer un autre.',
  'contact.error': 'Le message n’a pas été envoyé. Vérifiez votre connexion et réessayez.',
  'contact.errorEmail': 'Le message n’a pas été envoyé. Vérifiez votre connexion et réessayez, ou écrivez-moi à {email}.',

  'footer.built': 'Conçu avec React, TypeScript et Supabase.',
  'footer.admin': 'Espace admin',
} as const;

export type Key = keyof typeof fr;

const en: Record<Key, string> = {
  'page.title': 'Martin Manampisoa – Fullstack web and mobile developer',
  'page.description':
    'Portfolio of Martin Manampisoa, a fullstack web and mobile developer based in Antananarivo: React, TypeScript, Node.js, React Native and Supabase.',

  'skip': 'Skip to content',
  'nav.a-propos': 'About',
  'nav.services': 'Services',
  'nav.competences': 'Skills',
  'nav.projets': 'Projects',
  'nav.contact': 'Contact',
  'header.mainNav': 'Main navigation',
  'header.themeLight': 'Switch to light theme',
  'header.themeDark': 'Switch to dark theme',
  'header.menuOpen': 'Open menu',
  'header.menuClose': 'Close menu',
  'header.lang': 'Language',

  'hero.status': 'Available for a job or an internship',
  'hero.contact': 'Contact me',
  'hero.cv': 'Download my CV',
  'hero.profiles': 'My profiles',
  'hero.portrait': 'Portrait of {name}',
  'rotator.prefix': 'I build',
  'marquee.label': 'Technologies I use',

  'about.title': 'About',
  'about.place': 'Location',
  'about.education': 'Education',
  'about.languages': 'Languages',
  'about.availability': 'Availability',
  'about.availYes': 'Job or internship, available now',
  'about.availNo': 'Not at the moment',

  'services.title': 'Services',
  'services.lead': 'What I can build for you, from the idea to going live.',
  'services.tags': 'Technologies',
  'services.cta': 'Have a project in mind? Let’s talk.',
  'services.ctaButton': 'Request a quote',

  'skills.title': 'Skills',
  'skills.lead': 'Technologies in bold are the ones I use the most.',

  'projects.title': 'Projects',
  'projects.lead': 'A selection of {n} projects. Open one to see the details.',
  'projects.filter': 'Filter projects by type',
  'projects.all': 'All',
  'projects.tech': 'Technologies used',
  'projects.show': 'Show details',
  'projects.hide': 'Hide details',
  'projects.source': 'Source code',
  'projects.site': 'View site',
  'projects.newTab': ' for {title} (opens in a new tab)',
  'projects.empty': 'No projects in this category yet.',
  'projects.screenshot': 'Screenshot of {title}',
  'projects.kind.Web': 'Web application',
  'projects.kind.Mobile': 'Mobile application',
  'projects.kind.API': 'REST API',

  'contact.title': 'Contact',
  'contact.lead': 'A job offer, an internship, a project? Write to me and I will reply by email.',
  'contact.name': 'Name',
  'contact.email': 'Email address',
  'contact.subject': 'Subject',
  'contact.subjectPlaceholder': 'Job offer, internship, project…',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'contact.sending': 'Sending',
  'contact.sent': 'Message sent. I will reply by email.',
  'contact.mailto': 'Your email app is opening with the message ready to send.',
  'contact.mailSubject': 'Message from {name} via your portfolio',
  'contact.cooldown': 'You just sent a message. Please wait a few seconds before sending another one.',
  'contact.error': 'The message was not sent. Check your connection and try again.',
  'contact.errorEmail': 'The message was not sent. Check your connection and try again, or write to me at {email}.',

  'footer.built': 'Built with React, TypeScript and Supabase.',
  'footer.admin': 'Admin area',
};

const dictionaries: Record<Lang, Record<Key, string>> = { fr, en };

type Vars = Record<string, string | number>;

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Key, vars?: Vars) => string;
}

function detectLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'fr' || fromUrl === 'en') return fromUrl;
    const saved = localStorage.getItem('lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    /* stockage indisponible : on se base sur le navigateur */
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : navigator.language ? 'en' : 'fr';
}

const I18nContext = createContext<I18n>({ lang: 'fr', setLang: () => undefined, t: (key) => fr[key] });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      /* le choix vaut pour cette visite seulement */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = dictionaries[lang]['page.title'];
    document.querySelector('meta[name="description"]')?.setAttribute('content', dictionaries[lang]['page.description']);
  }, [lang]);

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let text = dictionaries[lang][key];
        if (vars) for (const [name, replacement] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(replacement));
        return text;
      },
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
