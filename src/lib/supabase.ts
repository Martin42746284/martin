import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** null tant que les variables d'environnement ne sont pas renseignées : le site utilise alors le contenu local. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export const BUCKET = 'portfolio';

/**
 * Transforme un chemin du bucket Supabase en URL publique.
 * Les URLs complètes et les chemins locaux (/photo.jpg) sont renvoyés tels quels.
 */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  if (!supabase) return undefined;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
