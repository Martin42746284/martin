-- =====================================================================
-- Portfolio de Martin Manampisoa : schéma Supabase (version avec administration)
-- À exécuter dans Supabase > SQL Editor, avant seed.sql.
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
  with check (true);                                       -- les limites de taille sont dans les contraintes de la table
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
