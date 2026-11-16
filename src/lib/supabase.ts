import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Vrai si les variables d'environnement Supabase sont renseignées. */
export const isSupabaseConfigured = Boolean(url && key);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Renvoie le client Supabase en chargeant @supabase/supabase-js à la demande,
 * pour le garder hors du bundle JavaScript initial du site.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!url || !key) return Promise.resolve(null);
  clientPromise ??= import('@supabase/supabase-js')
    .then(({ createClient }) => createClient(url, key))
    .catch((error: unknown) => {
      // En cas d'échec du téléchargement, on réessaie au prochain appel.
      clientPromise = null;
      throw error;
    });
  return clientPromise;
}

/** Déconnexion (administration). */
export async function signOut(): Promise<void> {
  await (await getSupabase())?.auth.signOut();
}

export const BUCKET = 'portfolio';

/**
 * Transforme un chemin du bucket Supabase en URL publique.
 * Les URLs complètes et les chemins locaux (/photo.jpg) sont renvoyés tels quels.
 * L'URL est construite à la main pour rester utilisable sans le client,
 * qui lui n'est chargé que lorsqu'une requête est nécessaire.
 */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  if (!url) return undefined;
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}
