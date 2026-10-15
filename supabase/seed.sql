-- Portfolio de Martin Manampisoa : schéma Supabase (version avec administration)
-- Schéma et sécurité du portfolio Supabase.
-- Sûr à relancer : aucune donnée n'est supprimée.
-- =====================================================================

-- ---------- Tables ----------

create table if not exists public.profile (
  id           int primary key default 1 check (id = 1),   -- une seule ligne
  full_name    text not null,
  title        text not null,
  tagline      text not null,
  hero_words   text[] not null default '{}',               -- mots qui défilent après « Je construis »
  bio          text not null,                              -- paragraphes séparés par une ligne vide
  location     text,
  languages    text,
  education    text,
  email        text,
  phone        text,                                       -- laissez vide pour ne pas l'afficher
  github_url   text,
  linkedin_url text,                                       -- laissez vide pour ne pas l'afficher
  photo_path   text,                                       -- chemin dans le bucket "portfolio"
  cv_path      text,                                       -- chemin dans le bucket "portfolio"
  available    boolean not null default true,
  updated_at   timestamptz not null default now()
);
-- Pour les bases créées avec la première version du schéma :
alter table public.profile add column if not exists hero_words text[] not null default '{}';
alter table public.profile add column if not exists education text;

create table if not exists public.skills (
  id         bigint generated always as identity primary key,
  category   text not null,
  name       text not null,
  is_core    boolean not null default false,               -- affiché en gras
  sort_order int not null default 0
);

create table if not exists public.services (
  id          bigint generated always as identity primary key,
  icon        text not null default 'web' check (icon in ('web', 'mobile', 'api', 'business', 'ai', 'speed')),
  title       text not null,
  description text not null,
  tags        text[] not null default '{}',
  sort_order  int not null default 0
);

create table if not exists public.stats (
  id         bigint generated always as identity primary key,
  value      numeric not null,
  suffix     text not null default '',
  label      text not null,
  sort_order int not null default 0
);

create table if not exists public.projects (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  title      text not null,
  subtitle   text,
  category   text not null check (category in ('Web', 'Mobile', 'API')),
  summary    text not null,
  highlights text[] not null default '{}',
  stack      text[] not null default '{}',
  github_url text,
  live_url   text,
  image_path text,                                         -- ex. projects/skill2study.png dans le bucket
  year       int,
  featured   boolean not null default false,               -- ouvert par défaut sur le site
  sort_order int not null default 0
);

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 5 and 200),
  subject    text not null default '' check (char_length(subject) <= 150),
  message    text not null check (char_length(message) between 10 and 3000),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages add column if not exists read boolean not null default false;
alter table public.messages add column if not exists subject text not null default '' check (char_length(subject) <= 150);

-- ---------- Traductions anglaises ----------
-- Chaque texte traduisible a une colonne « _en ». Si elle est vide, le site affiche le texte français.

alter table public.profile  add column if not exists title_en       text;
alter table public.profile  add column if not exists tagline_en     text;
alter table public.profile  add column if not exists hero_words_en  text[] not null default '{}';
alter table public.profile  add column if not exists bio_en         text;
alter table public.profile  add column if not exists languages_en   text;
alter table public.profile  add column if not exists education_en   text;
alter table public.profile  add column if not exists cv_path_en     text;   -- CV en anglais dans le bucket

alter table public.skills   add column if not exists category_en    text;

alter table public.services add column if not exists title_en       text;
alter table public.services add column if not exists description_en text;
alter table public.services add column if not exists tags_en        text[] not null default '{}';

alter table public.stats    add column if not exists label_en       text;

alter table public.projects add column if not exists subtitle_en    text;
alter table public.projects add column if not exists summary_en     text;
alter table public.projects add column if not exists highlights_en  text[] not null default '{}';

-- Comptes autorisés à utiliser l'administration (voir make-admin.sql).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------- Fonction : l'utilisateur connecté est-il administrateur ? ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Sécurité (Row Level Security) ----------

alter table public.profile  enable row level security;
alter table public.skills   enable row level security;
alter table public.services enable row level security;
alter table public.stats    enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.admins   enable row level security;   -- aucune règle : table invisible depuis l'API

-- Contenu : lecture publique, écriture réservée aux administrateurs.
do $$
declare t text;
begin
  foreach t in array array['profile', 'skills', 'services', 'stats', 'projects'] loop
    execute format('drop policy if exists "Lecture publique" on public.%I', t);
    execute format('drop policy if exists "Écriture admin" on public.%I', t);
    execute format('create policy "Lecture publique" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "Écriture admin" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Anciennes règles de la première version (noms différents), supprimées pour éviter les doublons.
drop policy if exists "Lecture publique du profil"       on public.profile;
drop policy if exists "Lecture publique des compétences" on public.skills;
drop policy if exists "Lecture publique des projets"     on public.projects;

-- Messages : les visiteurs peuvent écrire, jamais lire. Seuls les administrateurs lisent et gèrent.
drop policy if exists "Envoi de messages" on public.messages;
drop policy if exists "Gestion admin des messages" on public.messages;
create policy "Envoi de messages" on public.messages
  for insert to anon, authenticated
  with check (true);
create policy "Gestion admin des messages" on public.messages
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Droits d'accès à l'API.
grant select on public.profile, public.skills, public.services, public.stats, public.projects to anon, authenticated;
grant insert, update, delete on public.profile, public.skills, public.services, public.stats, public.projects to authenticated;
grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;

-- ---------- Stockage (photo, CV, captures d'écran) ----------

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

drop policy if exists "Lecture publique du bucket portfolio" on storage.objects;
drop policy if exists "Admin : envoi de fichiers" on storage.objects;
drop policy if exists "Admin : modification de fichiers" on storage.objects;
drop policy if exists "Admin : suppression de fichiers" on storage.objects;

create policy "Lecture publique du bucket portfolio" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'portfolio');
create policy "Admin : envoi de fichiers" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "Admin : modification de fichiers" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "Admin : suppression de fichiers" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());


-- ============================================================
-- Données initiales du profil (ne remplace pas les valeurs existantes)
-- ============================================================
insert into public.profile (
  id, full_name, title, title_en, tagline, tagline_en,
  hero_words, hero_words_en, bio, bio_en, location,
  languages, languages_en, education, education_en,
  email, phone, github_url, linkedin_url, photo_path,
  cv_path, cv_path_en, available
)
values (
  1,
  'Martin Manampisoa',
  'Développeur web et mobile fullstack',
  'Fullstack web and mobile developer',
  'Jeune diplômé en informatique, je cherche une équipe où progresser sur des projets concrets, du back-end jusqu’à l’interface.',
  'Recent computer science graduate looking for a team where I can grow on real projects, from the back end to the interface.',
  array['des applications web rapides', 'des applications mobiles React Native', 'des API REST sécurisées', 'des outils de gestion sur mesure', 'des fonctionnalités d’IA']::text[],
  array['fast web applications', 'React Native mobile apps', 'secure REST APIs', 'custom management tools', 'AI-powered features']::text[],
  'Diplômé d’une licence en informatique (mention Bien) à l’Université Adventiste Zurcher, à Antsirabe, je construis des applications complètes avec React, TypeScript et Node.js, sur le web comme sur mobile avec React Native.

Pendant mon stage chez Connect Talent, j’ai développé une application de gestion d’hôtel et réduit de 30 % le temps de chargement des pages en optimisant les requêtes et le bundle. Mon projet de fin d’études, Skill2Study, aide les bacheliers à choisir leur filière grâce à un moteur de recommandation.

J’aime les projets où le code résout un problème concret, et je travaille volontiers en équipe Agile : sprints, revues de code, livraisons fréquentes.',
  'I hold a bachelor’s degree in computer science (mention Bien) from Université Adventiste Zurcher in Antsirabe. I build complete applications with React, TypeScript and Node.js, on the web and on mobile with React Native.

During my internship at Connect Talent, I developed a hotel management application and cut page load time by 30% by optimising queries and the bundle. My final-year project, Skill2Study, helps high-school graduates choose a degree programme thanks to a recommendation engine.

I enjoy projects where code solves a real problem, and I like working in Agile teams: sprints, code reviews and frequent releases.',
  'Antananarivo, Madagascar',
  'Malgache (langue maternelle), français (courant), anglais (intermédiaire)',
  'Malagasy (native), French (fluent), English (intermediate)',
  'Licence en informatique, Université Adventiste Zurcher, 2023 – 2026 (mention Bien)',
  'Bachelor’s degree in computer science, Université Adventiste Zurcher, 2023 – 2026 (mention Bien)',
  'martinmanampisoa5@gmail.com',
  null,
  'https://github.com/Martin42746284',
  null,
  'photo-martin.webp',
  'cv.pdf',
  'cv-en.pdf',
  true
)
on conflict (id) do update set
  title_en = coalesce(public.profile.title_en, excluded.title_en),
  tagline_en = coalesce(public.profile.tagline_en, excluded.tagline_en),
  bio_en = coalesce(public.profile.bio_en, excluded.bio_en),
  languages_en = coalesce(public.profile.languages_en, excluded.languages_en),
  education_en = coalesce(public.profile.education_en, excluded.education_en),
  cv_path_en = coalesce(public.profile.cv_path_en, excluded.cv_path_en),
  education = coalesce(public.profile.education, excluded.education),
  hero_words = case when cardinality(public.profile.hero_words) = 0 then excluded.hero_words else public.profile.hero_words end,
  hero_words_en = case when cardinality(public.profile.hero_words_en) = 0 then excluded.hero_words_en else public.profile.hero_words_en end;

insert into public.skills (category, category_en, name, is_core, sort_order)
select * from (values
    ('Langages', 'Languages', 'JavaScript', true, 1),
    ('Langages', 'Languages', 'TypeScript', true, 2),
    ('Langages', 'Languages', 'Python', false, 3),
    ('Langages', 'Languages', 'PHP', false, 4),
    ('Langages', 'Languages', 'Java', false, 5),
    ('Langages', 'Languages', 'C', false, 6),
    ('Langages', 'Languages', 'C++', false, 7),
    ('Langages', 'Languages', 'C#', false, 8),
    ('Front-end', 'Front end', 'React', true, 9),
    ('Front-end', 'Front end', 'Next.js', false, 10),
    ('Front-end', 'Front end', 'Vue.js', false, 11),
    ('Front-end', 'Front end', 'Tailwind CSS', false, 12),
    ('Front-end', 'Front end', 'HTML5', false, 13),
    ('Front-end', 'Front end', 'CSS3', false, 14),
    ('Back-end', 'Back end', 'Node.js', true, 15),
    ('Back-end', 'Back end', 'Express', false, 16),
    ('Back-end', 'Back end', 'Laravel', false, 17),
    ('Back-end', 'Back end', 'Flask', false, 18),
    ('Back-end', 'Back end', 'API REST', true, 19),
    ('Back-end', 'Back end', 'GraphQL', false, 20),
    ('Mobile', 'Mobile', 'React Native', true, 21),
    ('Mobile', 'Mobile', 'Expo', false, 22),
    ('Mobile', 'Mobile', 'Flutter', false, 23),
    ('Bases de données', 'Databases', 'PostgreSQL', true, 24),
    ('Bases de données', 'Databases', 'MySQL', false, 25),
    ('Bases de données', 'Databases', 'MongoDB', false, 26),
    ('Bases de données', 'Databases', 'Firebase', false, 27),
    ('Bases de données', 'Databases', 'Supabase', true, 28),
    ('IA et données', 'AI and data', 'scikit-learn', false, 29),
    ('IA et données', 'AI and data', 'API OpenAI', false, 30),
    ('Outils et méthodes', 'Tools and methods', 'Git/GitHub', true, 31),
    ('Outils et méthodes', 'Tools and methods', 'Docker', false, 32),
    ('Outils et méthodes', 'Tools and methods', 'CI/CD', false, 33),
    ('Outils et méthodes', 'Tools and methods', 'Postman', false, 34),
    ('Outils et méthodes', 'Tools and methods', 'Agile/Scrum', false, 35)
) as v(category, category_en, name, is_core, sort_order)
where not exists (select 1 from public.skills);

update public.skills t set category_en = v.category_en
from (values
    ('Langages', 'JavaScript', 'Languages'),
    ('Langages', 'TypeScript', 'Languages'),
    ('Langages', 'Python', 'Languages'),
    ('Langages', 'PHP', 'Languages'),
    ('Langages', 'Java', 'Languages'),
    ('Langages', 'C', 'Languages'),
    ('Langages', 'C++', 'Languages'),
    ('Langages', 'C#', 'Languages'),
    ('Front-end', 'React', 'Front end'),
    ('Front-end', 'Next.js', 'Front end'),
    ('Front-end', 'Vue.js', 'Front end'),
    ('Front-end', 'Tailwind CSS', 'Front end'),
    ('Front-end', 'HTML5', 'Front end'),
    ('Front-end', 'CSS3', 'Front end'),
    ('Back-end', 'Node.js', 'Back end'),
    ('Back-end', 'Express', 'Back end'),
    ('Back-end', 'Laravel', 'Back end'),
    ('Back-end', 'Flask', 'Back end'),
    ('Back-end', 'API REST', 'Back end'),
    ('Back-end', 'GraphQL', 'Back end'),
    ('Mobile', 'React Native', 'Mobile'),
    ('Mobile', 'Expo', 'Mobile'),
    ('Mobile', 'Flutter', 'Mobile'),
    ('Bases de données', 'PostgreSQL', 'Databases'),
    ('Bases de données', 'MySQL', 'Databases'),
    ('Bases de données', 'MongoDB', 'Databases'),
    ('Bases de données', 'Firebase', 'Databases'),
    ('Bases de données', 'Supabase', 'Databases'),
    ('IA et données', 'scikit-learn', 'AI and data'),
    ('IA et données', 'API OpenAI', 'AI and data'),
    ('Outils et méthodes', 'Git/GitHub', 'Tools and methods'),
    ('Outils et méthodes', 'Docker', 'Tools and methods'),
    ('Outils et méthodes', 'CI/CD', 'Tools and methods'),
    ('Outils et méthodes', 'Postman', 'Tools and methods'),
    ('Outils et méthodes', 'Agile/Scrum', 'Tools and methods')
) as v(category, name, category_en)
where t.category = v.category and t.name = v.name and t.category_en is null;

insert into public.services (icon, title, title_en, description, description_en, tags, tags_en, sort_order)
select * from (values
    ('web', 'Sites et applications web', 'Websites and web applications', 'Interfaces rapides et accessibles avec React et TypeScript, connectées à une API Node.js et à une base de données PostgreSQL.', 'Fast, accessible interfaces built with React and TypeScript, connected to a Node.js API and a PostgreSQL database.', array['React', 'TypeScript', 'Next.js', 'Tailwind CSS']::text[], array['React', 'TypeScript', 'Next.js', 'Tailwind CSS']::text[], 1),
    ('mobile', 'Applications mobiles', 'Mobile applications', 'Applications Android et iOS avec React Native et Expo : navigation fluide, synchronisation en temps réel, notifications.', 'Android and iOS apps with React Native and Expo: smooth navigation, real-time sync, notifications.', array['React Native', 'Expo', 'Flutter']::text[], array['React Native', 'Expo', 'Flutter']::text[], 2),
    ('api', 'API et back-end', 'APIs and back end', 'API REST documentées et sécurisées (JWT, Swagger), bases de données relationnelles, webhooks et intégrations tierces.', 'Documented, secure REST APIs (JWT, Swagger), relational databases, webhooks and third-party integrations.', array['Node.js', 'Express', 'PostgreSQL', 'Swagger']::text[], array['Node.js', 'Express', 'PostgreSQL', 'Swagger']::text[], 3),
    ('business', 'Outils de gestion sur mesure', 'Custom management tools', 'Stocks, ventes, réservations, rôles utilisateurs : des applications métier adaptées à votre activité, comme pour un hôtel ou une épicerie.', 'Stock, sales, bookings, user roles: business applications tailored to your activity, as for a hotel or a grocery store.', array['Supabase', 'PostgreSQL', 'Rôles et accès']::text[], array['Supabase', 'PostgreSQL', 'Roles and access']::text[], 4),
    ('ai', 'Fonctionnalités d’IA', 'AI features', 'Recommandation, classification, génération de texte avec l’API OpenAI : ajoutez de l’intelligence à votre produit.', 'Recommendation, classification and text generation with the OpenAI API: add intelligence to your product.', array['Python', 'scikit-learn', 'OpenAI']::text[], array['Python', 'scikit-learn', 'OpenAI']::text[], 5),
    ('speed', 'Optimisation des performances', 'Performance optimisation', 'Requêtes, taille du bundle, temps de chargement : j’ai réduit de 30 % le temps de chargement d’une application lors de mon stage.', 'Queries, bundle size, page load time: I cut an application’s load time by 30% during my internship.', array['Requêtes', 'Bundle', 'Audit']::text[], array['Queries', 'Bundle', 'Audit']::text[], 6)
) as v(icon, title, title_en, description, description_en, tags, tags_en, sort_order)
where not exists (select 1 from public.services);

update public.services t set title_en = v.title_en, description_en = v.description_en, tags_en = v.tags_en
from (values
    ('Sites et applications web', 'Websites and web applications', 'Fast, accessible interfaces built with React and TypeScript, connected to a Node.js API and a PostgreSQL database.', array['React', 'TypeScript', 'Next.js', 'Tailwind CSS']::text[]),
    ('Applications mobiles', 'Mobile applications', 'Android and iOS apps with React Native and Expo: smooth navigation, real-time sync, notifications.', array['React Native', 'Expo', 'Flutter']::text[]),
    ('API et back-end', 'APIs and back end', 'Documented, secure REST APIs (JWT, Swagger), relational databases, webhooks and third-party integrations.', array['Node.js', 'Express', 'PostgreSQL', 'Swagger']::text[]),
    ('Outils de gestion sur mesure', 'Custom management tools', 'Stock, sales, bookings, user roles: business applications tailored to your activity, as for a hotel or a grocery store.', array['Supabase', 'PostgreSQL', 'Roles and access']::text[]),
    ('Fonctionnalités d’IA', 'AI features', 'Recommendation, classification and text generation with the OpenAI API: add intelligence to your product.', array['Python', 'scikit-learn', 'OpenAI']::text[]),
    ('Optimisation des performances', 'Performance optimisation', 'Queries, bundle size, page load time: I cut an application’s load time by 30% during my internship.', array['Queries', 'Bundle', 'Audit']::text[])
) as v(title, title_en, description_en, tags_en)
where t.title = v.title and t.title_en is null;

insert into public.stats (value, suffix, label, label_en, sort_order)
select * from (values
    (30, '%', 'de temps de chargement en moins lors de mon stage', 'less page load time during my internship', 1),
    (85, '%', 'de précision pour le moteur de recommandation de Skill2Study', 'accuracy of the Skill2Study recommendation engine', 2),
    (5, '', 'projets disponibles sur GitHub', 'projects available on GitHub', 3)
) as v(value, suffix, label, label_en, sort_order)
where not exists (select 1 from public.stats);

update public.stats t set label_en = v.label_en
from (values
    ('de temps de chargement en moins lors de mon stage', 'less page load time during my internship'),
    ('de précision pour le moteur de recommandation de Skill2Study', 'accuracy of the Skill2Study recommendation engine'),
    ('projets disponibles sur GitHub', 'projects available on GitHub')
) as v(label, label_en)
where t.label = v.label and t.label_en is null;

insert into public.projects (slug, title, subtitle, subtitle_en, category, summary, summary_en, highlights, highlights_en, stack, github_url, live_url, image_path, year, featured, sort_order) values
    ('skill2study', 'Skill2Study', 'Orientation universitaire assistée par IA (projet de fin d’études)', 'AI-assisted university guidance (final-year project)', 'Web', 'Plateforme web d’aide à la décision qui recommande aux bacheliers les filières adaptées à leur profil académique et personnel, en tenant compte de leur localisation.', 'Decision-support web platform that recommends degree programmes to high-school graduates based on their academic and personal profile, taking their location into account.', array['Test d’orientation adaptatif et score de compatibilité pour chaque filière.', 'Moteur de recommandation Random Forest et KNN : 85 % de précision sur plus de 1 500 exemples d’entraînement.', 'Comparaison de filières côte à côte, universités classées par proximité.', 'Trois services : interface React/TypeScript, API Node.js/Express avec Sequelize, service d’IA Python/Flask, le tout avec PostgreSQL sous Docker.']::text[], array['Adaptive guidance test and a compatibility score for each programme.', 'Random Forest and KNN recommendation engine: 85% accuracy on more than 1,500 training examples.', 'Side-by-side comparison of programmes, universities ranked by proximity.', 'Three services: React/TypeScript interface, Node.js/Express API with Sequelize, Python/Flask AI service, all with PostgreSQL under Docker.']::text[], array['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Python', 'Flask', 'scikit-learn', 'Docker']::text[], 'https://github.com/Martin42746284/Skill2Study', null, null, 2026, true, 1),
    ('plume-relais', 'Plume Relais', 'Application mobile d’écriture collaborative', 'Collaborative writing mobile app', 'Mobile', 'Chacun crée une histoire, écrit la suite, vote pour les meilleures contributions et suit l’évolution du récit en temps réel.', 'Everyone starts a story, writes the next part, votes for the best contributions and follows the story as it evolves in real time.', array['Authentification, histoires, tours d’écriture, votes, commentaires et réactions.', 'Synchronisation en temps réel avec Supabase Realtime.', 'Notifications locales, partage natif et export d’une histoire.', 'État global avec Zustand et navigation par fichiers avec Expo Router.']::text[], array['Authentication, stories, writing turns, votes, comments and reactions.', 'Real-time sync with Supabase Realtime.', 'Local notifications, native sharing and story export.', 'Global state with Zustand and file-based navigation with Expo Router.']::text[], array['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL', 'Zustand']::text[], 'https://github.com/Martin42746284/plume-relais', null, null, 2026, false, 2),
    ('smartepicerie', 'SmartEpicerie', 'Gestion d’épicerie', 'Grocery store management', 'Web', 'Application web pour gérer le catalogue, les ventes et les stocks d’une épicerie, avec un accès adapté à chaque rôle.', 'Web app to manage a grocery store’s catalogue, sales and stock, with role-based access.', array['Produits, catégories, ventes et lignes de vente.', 'Historique des mouvements de stock.', 'Authentification et gestion des rôles avec Supabase.', 'Rendu serveur avec TanStack Start, configuré pour un déploiement sur Cloudflare.']::text[], array['Products, categories, sales and sale lines.', 'Stock movement history.', 'Authentication and role management with Supabase.', 'Server rendering with TanStack Start, set up for deployment on Cloudflare.']::text[], array['TanStack Start', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS']::text[], 'https://github.com/Martin42746284/SmartEpicerie', null, null, 2026, false, 3),
    ('e-learning-api', 'E-learning API', 'Plateforme de formation', 'Training platform', 'API', 'API REST pour gérer les étudiants, les formateurs, les cours et les inscriptions d’une école de formation.', 'REST API to manage students, trainers, courses and enrolments for a training school.', array['Authentification JWT et routes protégées, pagination et filtres.', 'Webhook de paiement vérifié par signature HMAC.', 'Génération de descriptions de cours avec l’API OpenAI.', 'Documentation OpenAPI consultable avec Swagger UI.']::text[], array['JWT authentication and protected routes, pagination and filters.', 'Payment webhook verified with an HMAC signature.', 'Course description generation with the OpenAI API.', 'OpenAPI documentation available through Swagger UI.']::text[], array['Node.js', 'Express', 'PostgreSQL', 'JWT', 'OpenAI', 'Swagger']::text[], 'https://github.com/Martin42746284/E-learning-api', null, null, 2026, false, 4),
    ('library-api', 'Library API', 'Gestion de bibliothèque', 'Library management', 'API', 'API REST pour gérer les livres et les utilisateurs d’une bibliothèque, avec authentification sécurisée.', 'REST API to manage a library’s books and users, with secure authentication.', array['Inscription et connexion sécurisées avec JWT et bcrypt.', 'Gestion complète des livres.', 'Scripts SQL de création de la base et de données de test, documentation Swagger UI.']::text[], array['Secure sign-up and login with JWT and bcrypt.', 'Full book management.', 'SQL scripts to create the database and test data, Swagger UI documentation.']::text[], array['Node.js', 'Express', 'PostgreSQL', 'JWT', 'bcrypt', 'Swagger']::text[], 'https://github.com/Martin42746284/library-api', null, null, 2026, false, 5)
on conflict (slug) do update set
  subtitle_en = coalesce(public.projects.subtitle_en, excluded.subtitle_en),
  summary_en = coalesce(public.projects.summary_en, excluded.summary_en),
  highlights_en = case when cardinality(public.projects.highlights_en) = 0 then excluded.highlights_en else public.projects.highlights_en end;
