import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Injection de balises dans <head>, selon les variables d'environnement :
 * - VITE_SUPABASE_URL : préconnexion vers le projet (le navigateur ouvre DNS + TLS
 *   pendant que le JavaScript se télécharge). Deux variantes car les requêtes CORS
 *   du client Supabase et les images du bucket n'utilisent pas le même pool de connexions.
 * - VITE_SITE_URL : og:image et carte Twitter avec l'image de partage, plus canonical.
 * Sans variable correspondante, rien n'est injecté.
 */
function injectHeadTags(supabaseUrl?: string, siteUrl?: string) {
  const supabaseOrigin = supabaseUrl?.match(/^https:\/\/[^/]+/)?.[0];
  const origin = siteUrl?.replace(/\/+$/, '');
  return {
    name: 'inject-head-tags',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        const tags: string[] = [];
        if (supabaseOrigin) {
          tags.push(`    <link rel="preconnect" href="${supabaseOrigin}" />`);
          tags.push(`    <link rel="preconnect" href="${supabaseOrigin}" crossorigin />`);
        }
        if (origin) {
          tags.push(`    <meta property="og:image" content="${origin}/og-image.png" />`);
          tags.push(`    <meta name="twitter:card" content="summary_large_image" />`);
          tags.push(`    <meta name="twitter:image" content="${origin}/og-image.png" />`);
          tags.push(`    <link rel="canonical" href="${origin}/" />`);
        }
        if (tags.length === 0) return html;
        return html.replace('    <title>', `${tags.join('\n')}\n    <title>`);
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.');
  return {
    plugins: [react(), injectHeadTags(env.VITE_SUPABASE_URL, env.VITE_SITE_URL)],
  };
});
