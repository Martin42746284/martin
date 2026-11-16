import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from './localize';

const fr = {
  'page.title': 'Martin Manampisoa – Développeur fullstack web et mobile',
  'page.description':
    'Martin Manampisoa, développeur web et mobile à Antananarivo. React, TypeScript, Node.js, React Native — et le code de mes projets est sur GitHub.',

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

  'about.title': 'À propos',
  'about.place': 'Lieu',
  'about.education': 'Formation',
  'about.languages': 'Langues',
  'about.availability': 'Disponibilité',
  'about.availYes': 'Poste ou stage, dès maintenant',
  'about.availNo': 'Remote ou collaboration ponctuelle pour le moment',

  'services.title': 'Services',
  'services.lead': 'Ce que je peux faire pour vous.',
  'services.tags': 'Technologies',
  'services.cta': 'Un projet en tête ? Écrivez-moi.',
  'services.ctaButton': 'Écrire à ce sujet',

  'skills.title': 'Compétences',
  'skills.lead': 'Les technologies en gras sont celles que j’utilise le plus.',

  'projects.title': 'Projets',
  'projects.lead': '{n} projets, tous avec le code sur GitHub. Ouvrez-en un pour voir ce qu’il y a dedans.',
  'projects.filter': 'Filtrer les projets par type',
  'projects.all': 'Tous',
  'projects.showAll': 'Tous les projets',
  'projects.tech': 'Technologies utilisées',
  'projects.show': 'Voir les détails',
  'projects.hide': 'Masquer les détails',
  'projects.source': 'Code source',
  'projects.site': 'Voir le site',
  'projects.newTab': ' de {title} (nouvel onglet)',
  'projects.empty': 'Aucun projet dans cette catégorie pour le moment.',
  'projects.count': '{n} projets affichés',
  'projects.closed': 'Fermer',
  'projects.screenshot': 'Capture d’écran de {title}',
  'projects.kind.Web': 'Application web',
  'projects.kind.Mobile': 'Application mobile',
  'projects.kind.API': 'API REST',

  'contact.title': 'Contact',
  'contact.lead': 'Une offre, un stage, un projet ? Écrivez-moi, je vous réponds par e-mail.',
  'contact.name': 'Nom',
  'contact.labelEmail': 'E-mail',
  'contact.labelPhone': 'Téléphone',
  'contact.labelPlace': 'Lieu',
  'contact.cardText': 'Envie d’en savoir plus avant de m’écrire ? Mon CV résume mon parcours et mes projets.',
  'contact.email': 'Adresse e-mail',
  'contact.subject': 'Sujet',
  'contact.subjectPlaceholder': 'Offre d’emploi, stage, projet…',
  'contact.message': 'Message',
  'contact.send': 'Envoyer le message',
  'contact.sending': 'Envoi en cours',
  'contact.sent': 'Message envoyé. Je vous réponds par e-mail.',
  'contact.sentNoArchive': 'Message envoyé. Je vous répondrai par e-mail, mais il n’a pas pu être archivé dans le portfolio.',
  'contact.notConfigured': 'L’envoi par e-mail n’est pas encore configuré. Réessayez plus tard.',
  'contact.cooldown': 'Vous venez d’envoyer un message. Patientez quelques secondes avant d’en envoyer un autre.',
  'contact.error': 'Le message n’a pas été envoyé. Vérifiez votre connexion et réessayez.',
  'contact.errorEmail': 'Le message n’a pas été envoyé. Vérifiez votre connexion et réessayez, ou écrivez-moi à {email}.',

  'footer.admin': 'Espace admin',
} as const;

export type Key = keyof typeof fr;

const en: Record<Key, string> = {
  'page.title': 'Martin Manampisoa – Fullstack web and mobile developer',
  'page.description':
    'Martin Manampisoa, web and mobile developer in Antananarivo. React, TypeScript, Node.js, React Native — and the code for my projects is on GitHub.',

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

  'about.title': 'About',
  'about.place': 'Location',
  'about.education': 'Education',
  'about.languages': 'Languages',
  'about.availability': 'Availability',
  'about.availYes': 'Job or internship, available now',
  'about.availNo': 'Remote or occasional collaboration for now',

  'services.title': 'Services',
  'services.lead': 'What I can do for you.',
  'services.tags': 'Technologies',
  'services.cta': 'A project in mind? Write to me.',
  'services.ctaButton': 'Write to me about it',

  'skills.title': 'Skills',
  'skills.lead': 'Technologies in bold are the ones I use the most.',

  'projects.title': 'Projects',
  'projects.lead': '{n} projects, all with the code on GitHub. Open one to see what is inside.',
  'projects.filter': 'Filter projects by type',
  'projects.all': 'All',
  'projects.showAll': 'All projects',
  'projects.tech': 'Technologies used',
  'projects.show': 'Show details',
  'projects.hide': 'Hide details',
  'projects.source': 'Source code',
  'projects.site': 'View site',
  'projects.newTab': ' for {title} (opens in a new tab)',
  'projects.empty': 'No projects in this category yet.',
  'projects.count': 'Showing {n} projects',
  'projects.closed': 'Close',
  'projects.screenshot': 'Screenshot of {title}',
  'projects.kind.Web': 'Web application',
  'projects.kind.Mobile': 'Mobile application',
  'projects.kind.API': 'REST API',

  'contact.title': 'Contact',
  'contact.lead': 'A job offer, an internship, a project? Write to me and I will reply by email.',
  'contact.name': 'Name',
  'contact.labelEmail': 'Email',
  'contact.labelPhone': 'Phone',
  'contact.labelPlace': 'Location',
  'contact.cardText': 'Want to know more before writing? My CV sums up my background and projects.',
  'contact.email': 'Email address',
  'contact.subject': 'Subject',
  'contact.subjectPlaceholder': 'Job offer, internship, project…',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'contact.sending': 'Sending',
  'contact.sent': 'Message sent. I will reply by email.',
  'contact.sentNoArchive': 'Message sent. I will reply by email, but it could not be saved in the portfolio.',
  'contact.notConfigured': 'Email delivery is not configured yet. Please try again later.',
  'contact.cooldown': 'You just sent a message. Please wait a few seconds before sending another one.',
  'contact.error': 'The message was not sent. Check your connection and try again.',
  'contact.errorEmail': 'The message was not sent. Check your connection and try again, or write to me at {email}.',

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
