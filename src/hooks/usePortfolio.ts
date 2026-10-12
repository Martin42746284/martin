import { useEffect, useState } from 'react';
import { fallback } from '../data/fallback';
import { supabase } from '../lib/supabase';
import type { PortfolioData, Profile, Project, Service, Skill, Stat } from '../lib/types';

export type DataSource = 'local' | 'supabase';

/**
 * Affiche tout de suite le contenu local, puis le remplace par les données Supabase
 * dès qu'elles sont arrivées. Si Supabase est absent ou en erreur, le site reste complet.
 */
export function usePortfolio(): { data: PortfolioData; source: DataSource } {
  const [data, setData] = useState<PortfolioData>(fallback);
  const [source, setSource] = useState<DataSource>('local');

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let cancelled = false;

    (async () => {
      const [profile, skills, projects, services, stats] = await Promise.all([
        client.from('profile').select('*').eq('id', 1).maybeSingle(),
        client.from('skills').select('*').order('sort_order'),
        client.from('projects').select('*').order('sort_order'),
        client.from('services').select('*').order('sort_order'),
        client.from('stats').select('*').order('sort_order'),
      ]);

      const error = profile.error ?? skills.error ?? projects.error ?? services.error ?? stats.error;
      if (error) {
        console.warn('[portfolio] Supabase indisponible, contenu local affiché :', error.message);
        return;
      }
      if (cancelled) return;

      // Pas de ligne de profil : la base n'a pas été remplie (seed.sql), on garde le contenu local.
      if (!profile.data) {
        console.warn('[portfolio] Table profile vide : exécutez supabase/seed.sql. Contenu local affiché.');
        return;
      }

      // Ensuite, une table vide est un choix (vous avez tout supprimé) : on l'affiche telle quelle.
      setData({
        profile: profile.data as Profile,
        skills: (skills.data as Skill[] | null) ?? [],
        projects: (projects.data as Project[] | null) ?? [],
        services: (services.data as Service[] | null) ?? [],
        stats: (stats.data as Stat[] | null) ?? [],
      });
      setSource('supabase');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, source };
}
