/**
 * Réception du formulaire de contact du portfolio.
 *
 * Le navigateur envoie les champs + le jeton Turnstile ; la fonction vérifie le jeton
 * auprès de Cloudflare (clé secrète jamais exposée au client), puis insère le message
 * avec le rôle service_role. L'INSERT public direct sur la table messages est fermé
 * (voir supabase/close-messages-insert.sql) : sans jeton valide, plus rien n'écrit.
 *
 * Déploiement (Supabase CLI) :
 *   supabase secrets set TURNSTILE_SECRET_KEY=<clé secrète du widget Turnstile>
 *   supabase functions deploy contact --no-verify-jwt
 */
// @ts-types="https://esm.sh/@supabase/supabase-js@2.117.3/module/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
};

const json = (body: Record<string, unknown>, status: number) =>
  Response.json(body, { status, headers: CORS });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'json' }, 400);
  }
  const { name, email, subject, message, token } = (input ?? {}) as Record<string, unknown>;
  const payload = {
    name: String(name ?? '').trim(),
    email: String(email ?? '').trim(),
    subject: String(subject ?? '').trim(),
    message: String(message ?? '').trim(),
  };

  // Mêmes limites que les contraintes de la table public.messages.
  if (payload.name.length < 1 || payload.name.length > 100) return json({ error: 'champs' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 200) return json({ error: 'champs' }, 400);
  if (payload.subject.length > 150) return json({ error: 'champs' }, 400);
  if (payload.message.length < 10 || payload.message.length > 3000) return json({ error: 'champs' }, 400);

  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) return json({ error: 'config' }, 500);

  let verdict: { success?: boolean } | null = null;
  try {
    verdict = await fetch(TURNSTILE_VERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: String(token ?? '') }),
    }).then((res) => res.json());
  } catch {
    verdict = null;
  }
  if (!verdict?.success) return json({ error: 'captcha' }, 403);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.from('messages').insert(payload);
  if (error) return json({ error: 'insert' }, 500);

  return json({ ok: true }, 200);
});
