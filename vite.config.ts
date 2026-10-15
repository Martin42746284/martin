import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Injection de balises dans <head>, selon les variables d'environnement :
 * - VITE_SUPABASE_URL : préconnexion vers le projet (le navigateur ouvre DNS + TLS
 *   pendant que le JavaScript se télécharge). Deux variantes car les requêtes CORS
 *   du client Supabase et les images du bucket n'utilisent pas le même pool de connexions.
 * - VITE_SITE_URL : og:image et carte Twitter avec l'image de partage, plus canonical.
 * Sans variable correspondante, rien n'est injecté.
 * Dans tous les cas : preload du portrait (élément LCP) et fichiers pour les robots.
 */
function injectHeadTags(supabaseUrl?: string, siteUrl?: string) {
  const supabaseOrigin = supabaseUrl?.match(/^https:\/\/[^/]+/)?.[0];
  const origin = siteUrl?.replace(/\/+$/, '');
  return {
    name: 'inject-head-tags',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        // Le portrait est l'élément LCP : on le précharge dès le HTML. En production
        // il vient du bucket (nom de fichier standardisé), sinon on précharge le repli local.
        const photoHref = supabaseOrigin
          ? `${supabaseOrigin}/storage/v1/object/public/portfolio/photo-martin.webp`
          : '/photo-martin.webp';
        const tags: string[] = [
          `    <link rel="preload" as="image" href="${photoHref}" fetchpriority="high" />`,
        ];
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
        return html.replace('    <title>', `${tags.join('\n')}\n    <title>`);
      },
    },
  };
}

/**
 * Fichiers pour les robots et les agents IA : robots.txt (toujours) et sitemap.xml
 * (quand VITE_SITE_URL est connu, car le sitemap exige des URL absolues).
 */
function emitAgentFiles(siteUrl?: string) {
  const origin = siteUrl?.replace(/\/+$/, '');
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    ...(origin ? ['', `Sitemap: ${origin}/sitemap.xml`] : []),
    '',
  ].join('\n');
  const sitemap = origin
    ? [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        `  <url><loc>${origin}/</loc><changefreq>monthly</changefreq></url>`,
        '</urlset>',
        '',
      ].join('\n')
    : null;
  return {
    name: 'emit-agent-files',
    apply: 'build' as const,
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      if (sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  } satisfies Plugin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.');
  return {
    plugins: [react(), injectHeadTags(env.VITE_SUPABASE_URL, env.VITE_SITE_URL), emitAgentFiles(env.VITE_SITE_URL)],
  };
});
