-- À exécuter UNE FOIS après le déploiement de la fonction Edge « contact »
-- (supabase/functions/contact). Sûr à relancer : aucune donnée n'est supprimée.
--
-- Le formulaire du portfolio envoie désormais les messages via la fonction,
-- qui vérifie le jeton Turnstile avec la clé secrète avant d'insérer.
-- Ce script ferme l'ancienne voie d'insertion publique, sans laquelle un bot
-- pouvait écrire directement via l'API avec la clé anon.
--
-- Rappel de la procédure côté Supabase :
--   1. Cloudflare Turnstile : créer un widget, récupérer la paire de clés.
--   2. supabase secrets set TURNSTILE_SECRET_KEY=<clé secrète>
--   3. supabase functions deploy contact --no-verify-jwt
--   4. Exécuter ce fichier dans le SQL Editor.
--   5. Site : renseigner VITE_TURNSTILE_SITE_KEY (clé publique du widget) au build.

drop policy if exists "Envoi de messages" on public.messages;
revoke insert on public.messages from anon;
