import type { PortfolioData } from './types';

export type Lang = 'fr' | 'en';

const hasValue = (value: unknown): boolean =>
  typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : false;

/** Remplace chaque champ par sa version anglaise (colonne « _en ») quand elle existe. */
function pick<T extends object>(row: T, keys: string[]): T {
  const source = row as Record<string, unknown>;
  const result: Record<string, unknown> = { ...source };
  for (const key of keys) {
    const english = source[`${key}_en`];
    if (hasValue(english)) result[key] = english;
  }
  return result as T;
}

/** Renvoie le contenu dans la langue demandée ; le français sert de repli pour tout texte non traduit. */
export function localizeData(data: PortfolioData, lang: Lang): PortfolioData {
  if (lang === 'fr') return data;
  return {
    profile: pick(data.profile, ['title', 'tagline', 'hero_words', 'bio', 'languages', 'education', 'cv_path']),
    skills: data.skills.map((row) => pick(row, ['category'])),
    projects: data.projects.map((row) => pick(row, ['subtitle', 'summary', 'highlights'])),
    services: data.services.map((row) => pick(row, ['title', 'description', 'tags'])),
    stats: data.stats.map((row) => pick(row, ['label'])),
  };
}
