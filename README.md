# Portfolio de Martin Manampisoa

Site one-page **bilingue (français et anglais)** en **React + TypeScript** (Vite) avec un **espace d'administration** (`/admin`). Le contenu (profil, services, compétences, projets, chiffres), la photo, le CV et les messages du formulaire de contact passent par **Supabase**.

Si Supabase n'est pas configuré ou ne répond pas, le site s'affiche quand même avec le contenu de `src/data/fallback.ts`.

## 1. Créer la base Supabase (10 min)

1. Créez un projet sur <https://supabase.com>.
2. Ouvrez **SQL Editor**, collez le contenu de `supabase/schema.sql`, puis **Run**. Cela crée les tables, les règles de sécurité (RLS) et le bucket de stockage `portfolio`.
3. Collez ensuite `supabase/seed.sql` et **Run** : votre profil, vos services, compétences, projets et chiffres sont insérés. Ce fichier ne remplit que ce qui est vide : il n'écrase jamais ce que vous modifiez ensuite dans l'administration.
4. Ouvrez **Storage > portfolio** et envoyez les trois fichiers du dossier `supabase/storage-assets/` :
   - `photo.jpg` (votre portrait)
   - `cv.pdf` (votre CV en français)
   - `cv-en.pdf` (votre CV en anglais)
5. Ouvrez **Project Settings > API** et copiez l'**URL du projet** et la clé **anon / publishable**.

## 1 bis. Créer votre compte administrateur (5 min)

1. **Authentication > Users > Add user > Create new user** : votre e-mail et un mot de passe solide, avec **Auto Confirm User** coché.
2. **SQL Editor** : exécutez `supabase/make-admin.sql` (adaptez l'adresse e-mail si besoin). La requête finale doit afficher une ligne avec votre e-mail.
3. Recommandé : **Authentication > Sign In / Providers > Email**, désactivez **Allow new users to sign up**. Même sans cela, seul un compte listé dans la table `admins` peut modifier quoi que ce soit.
4. Ouvrez `https://votre-site/admin` (ou `http://localhost:5173/admin`) et connectez-vous.

## 2. Lancer le site en local

```bash
npm install
cp .env.example .env     # puis renseignez les deux variables
npm run dev              # http://localhost:5173
```

Sans fichier `.env`, le site fonctionne avec le contenu local. Pour vérifier le code : `npm run typecheck` ; pour produire la version en ligne : `npm run build`.

## 3. Mettre le site en ligne

Poussez le dossier sur GitHub, puis importez le dépôt dans l'un de ces services gratuits :

| Service | Réglages |
|---|---|
| **Vercel** | Framework : Vite (détecté automatiquement) |
| **Netlify** | Build : `npm run build`, dossier : `dist` |
| **Cloudflare Pages** | Build : `npm run build`, dossier : `dist` |

Dans les réglages du projet, ajoutez les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` **avant** de déployer : elles sont lues au moment de la compilation. Si vous les ajoutez après coup, relancez un déploiement. Chaque `git push` met le site à jour.

La page `/admin` fonctionne sans réglage supplémentaire : `vercel.json` (Vercel) et `public/_redirects` (Netlify, Cloudflare Pages) sont déjà fournis.

## 4. Modifier le contenu avec l'administration

Sur `/admin`, après connexion :

| Section | Ce que vous pouvez faire |
|---|---|
| **Messages** | Lire les messages du formulaire, répondre par e-mail, marquer lu ou non lu, supprimer. Un badge indique les messages non lus. |
| **Profil** | Nom, titre, phrase d'accroche, mots qui défilent, présentation, coordonnées, liens, disponibilité, en français et en anglais. Remplacer la photo et les CV (PDF). |
| **Projets** | Ajouter, modifier, supprimer, réordonner. Technologies, points clés, liens GitHub et site en ligne, capture d'écran (réduite automatiquement avant l'envoi). |
| **Services** | Les prestations de la section « Services ». La première est mise en valeur. |
| **Compétences** | Les technologies par catégorie. Elles alimentent aussi le bandeau défilant. |
| **Chiffres** | Les nombres animés de la section « À propos ». |

Chaque texte a son champ « (anglais) ». Les changements apparaissent au prochain chargement du site, sans redéploiement.

**Afficher LinkedIn ou votre téléphone :** renseignez-les dans **Profil**. Les champs vides ne sont pas affichés. Ne mettez votre numéro que si vous acceptez qu'il soit public.

> Le contenu de `src/data/fallback.ts` s'affiche seulement si Supabase est absent ou injoignable. Il n'a pas besoin d'être modifié pour les mises à jour courantes.

## 5. Français et anglais

- Un sélecteur **FR | EN** se trouve dans l'en-tête. La langue est choisie dans cet ordre : paramètre d'adresse (`?lang=en`, pratique pour partager un lien en anglais), dernier choix du visiteur, puis langue du navigateur (français si elle est française, anglais sinon).
- **Les textes de l'interface** (menus, boutons, formulaire) sont dans `src/lib/i18n.tsx`.
- **Les contenus** (profil, services, compétences, projets, chiffres) ont une colonne « anglais » à côté de la version française. Remplissez-les dans l'administration, champs « (anglais) ». **Si un texte anglais est vide, le texte français s'affiche à la place** : rien ne casse si une traduction manque.
- **Le CV** : le bouton « Download my CV » propose le CV anglais (`cv-en.pdf`, déjà fourni). S'il n'est pas renseigné, le CV français est proposé.
- Pour une troisième langue, il faut ajouter un dictionnaire dans `i18n.tsx` et des colonnes dans la base.

> Base déjà créée avec la version précédente ? Exécutez de nouveau `schema.sql` (il ajoute les colonnes anglaises), puis `seed.sql` : il remplit uniquement les traductions manquantes, sans toucher à ce que vous avez modifié. Envoyez aussi `cv-en.pdf` dans le bucket.

## 6. Sécurité

- Le site n'utilise que la clé **anon / publishable**, faite pour être publique. N'ajoutez **jamais** la clé `service_role` dans ce projet ni dans les variables Vercel/Netlify.
- Les protections sont dans la base, pas dans le site : les règles RLS autorisent les visiteurs à **lire** le contenu et à **écrire** dans `messages`, rien d'autre. Seuls les comptes de la table `admins` peuvent modifier le contenu, gérer les messages et envoyer des fichiers dans le bucket. Masquer ou deviner l'adresse `/admin` n'a donc aucun effet sur la sécurité.
- Utilisez un mot de passe solide et unique pour votre compte. En cas d'oubli, réinitialisez-le depuis **Authentication > Users** dans Supabase.
- Le formulaire a un champ piège et un délai de 30 s entre deux envois. Si vous recevez du spam, ajoutez un captcha (Cloudflare Turnstile, hCaptcha) ou une Edge Function.
- Les projets du plan gratuit Supabase peuvent être mis en pause après une période d'inactivité : vérifiez la politique actuelle. Pendant ce temps, le site reste visible grâce au contenu de repli.

## Structure

```
src/
  components/   Header, Hero, Marquee, About, Services, Skills, Projects, Contact, Footer
  admin/        Espace d'administration (chargé seulement sur /admin)
  hooks/        usePortfolio (Supabase + repli), useTheme, useInView, useParallax
  lib/          client Supabase, types, i18n (textes FR/EN), localize (contenu EN)
  data/         contenu de repli
  styles/       global.css (couleurs et typographie en variables CSS)
supabase/       schema.sql, seed.sql, make-admin.sql, storage-assets/
public/         photo et CV de repli, favicon
```

Les couleurs se changent dans les variables en tête de `src/styles/global.css`.

Les animations respectent le réglage « réduire les animations » du système de l'utilisateur.
