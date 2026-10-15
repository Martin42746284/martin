import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getSupabase, isSupabaseConfigured, signOut } from '../lib/supabase';
import './admin.css';
import { Login } from './Login';
import { MessagesPanel } from './MessagesPanel';
import { ProfilePanel } from './ProfilePanel';
import { TableEditor } from './TableEditor';
import { ToastProvider } from './toast';
import type { FieldDef } from './fields';

type Tab = 'messages' | 'profile' | 'projects' | 'services' | 'skills' | 'stats';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'messages', label: 'Messages' },
  { id: 'profile', label: 'Profil' },
  { id: 'projects', label: 'Projets' },
  { id: 'services', label: 'Services' },
  { id: 'skills', label: 'Compétences' },
  { id: 'stats', label: 'Chiffres' },
];

const PROJECT_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'slug', label: 'Identifiant', type: 'text', required: true, hint: 'Unique, en minuscules et sans espace (ex. skill2study).' },
  { key: 'subtitle', label: 'Sous-titre', type: 'text', nullable: true, wide: true },
  { key: 'subtitle_en', label: 'Sous-titre (anglais)', type: 'text', nullable: true, wide: true, hint: 'Si vide, le texte français est affiché en anglais.' },
  {
    key: 'category',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'Web', label: 'Application web' },
      { value: 'Mobile', label: 'Application mobile' },
      { value: 'API', label: 'API REST' },
    ],
  },
  { key: 'year', label: 'Année', type: 'number' },
  { key: 'summary', label: 'Résumé', type: 'textarea', rows: 3, required: true, wide: true },
  { key: 'summary_en', label: 'Résumé (anglais)', type: 'textarea', rows: 3, nullable: true, wide: true },
  { key: 'highlights', label: 'Points clés', type: 'lines', wide: true, hint: 'Un par ligne. Visibles quand on ouvre le projet.' },
  { key: 'highlights_en', label: 'Points clés (anglais)', type: 'lines', wide: true, hint: 'Un par ligne, dans le même ordre.' },
  { key: 'stack', label: 'Technologies', type: 'csv', wide: true, hint: 'Séparées par des virgules : React, Node.js, PostgreSQL' },
  { key: 'github_url', label: 'Lien GitHub', type: 'url', nullable: true, placeholder: 'https://github.com/…' },
  { key: 'live_url', label: 'Lien du site en ligne', type: 'url', nullable: true, placeholder: 'https://…', hint: 'Ajoute un bouton « Voir le site ».' },
  { key: 'image_path', label: 'Capture d’écran', type: 'image', folder: 'projects', nameFrom: 'slug', maxSide: 1400, wide: true },
  { key: 'featured', label: 'Mise en avant (badge << A la une >>)', type: 'boolean', wide: true },
];

const SERVICE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titre', type: 'text', required: true },
  { key: 'title_en', label: 'Titre (anglais)', type: 'text', nullable: true, hint: 'Si vide, le texte français est affiché en anglais.' },
  {
    key: 'icon',
    label: 'Icône',
    type: 'select',
    required: true,
    options: [
      { value: 'web', label: 'Web' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'api', label: 'API et code' },
      { value: 'business', label: 'Gestion et métier' },
      { value: 'ai', label: 'Intelligence artificielle' },
      { value: 'speed', label: 'Performance' },
    ],
  },
  { key: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, wide: true },
  { key: 'description_en', label: 'Description (anglais)', type: 'textarea', rows: 4, nullable: true, wide: true },
  { key: 'tags', label: 'Mots-clés', type: 'csv', wide: true, hint: 'Séparés par des virgules.' },
  { key: 'tags_en', label: 'Mots-clés (anglais)', type: 'csv', wide: true, hint: 'Séparés par des virgules.' },
];

const SKILL_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Compétence', type: 'text', required: true },
  { key: 'category', label: 'Catégorie', type: 'text', required: true, hint: 'Les compétences de même catégorie sont regroupées.' },
  { key: 'category_en', label: 'Catégorie (anglais)', type: 'text', nullable: true, hint: 'À renseigner pareil pour toutes les compétences de la catégorie.' },
  { key: 'is_core', label: 'À mettre en avant (en gras)', type: 'boolean', wide: true },
];

const STAT_FIELDS: FieldDef[] = [
  { key: 'value', label: 'Nombre', type: 'number', required: true },
  { key: 'suffix', label: 'Symbole après le nombre', type: 'text', hint: 'Par exemple % ou +. Peut rester vide.' },
  { key: 'label', label: 'Légende', type: 'text', required: true, wide: true },
  { key: 'label_en', label: 'Légende (anglais)', type: 'text', nullable: true, wide: true },
];

type State =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'ready'; email: string }
  | { status: 'forbidden'; email: string }
  | { status: 'error'; message: string };

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('messages');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    void getSupabase().then((client) => {
      if (!client || !active) return;
      client
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('read', false)
        .then(({ count }) => {
          if (active) setUnread(count ?? 0);
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const onUnread = useCallback((count: number) => setUnread(count), []);

  return (
    <div className="adm">
      <header className="adm__bar">
        <strong className="adm__brand">Administration</strong>
        <div className="adm__user">
          <a href="/">Voir le site</a>
          <span className="adm__email">{email}</span>
          <button className="btn btn--ghost btn--small" type="button" onClick={() => void signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>

      <div className="adm__body">
        <nav className="adm__nav" aria-label="Sections de l’administration">
          {TABS.map(({ id, label }) => (
            <button key={id} type="button" className="adm__tab" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
              {label}
              {id === 'messages' && unread > 0 && (
                <span className="badge" aria-label={`${unread} non lus`}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        <main className="adm__main">
          {tab === 'messages' && <MessagesPanel onUnread={onUnread} />}
          {tab === 'profile' && <ProfilePanel />}
          {tab === 'projects' && (
            <TableEditor
              table="projects"
              title="Projets"
              intro="Les projets affichés sur le site. Utilisez les flèches pour changer leur ordre."
              noun="Projet"
              fields={PROJECT_FIELDS}
              rowLabel={(row) => String(row.title)}
              rowSub={(row) => `${String(row.category)}${row.year ? `, ${String(row.year)}` : ''}`}
              blank={() => ({ title: '', slug: '', subtitle: null, category: 'Web', summary: '', highlights: [], stack: [], github_url: null, live_url: null, image_path: null, year: new Date().getFullYear(), featured: false })}
            />
          )}
          {tab === 'services' && (
            <TableEditor
              table="services"
              title="Services"
              intro="Les prestations proposées. La première est mise en valeur sur le site."
              noun="Service"
              fields={SERVICE_FIELDS}
              rowLabel={(row) => String(row.title)}
              blank={() => ({ icon: 'web', title: '', description: '', tags: [] })}
            />
          )}
          {tab === 'skills' && (
            <TableEditor
              table="skills"
              title="Compétences"
              intro="Les technologies affichées par catégorie, et dans le bandeau défilant sous l’accueil."
              noun="Compétence"
              fields={SKILL_FIELDS}
              rowLabel={(row) => String(row.name)}
              rowSub={(row) => String(row.category)}
              blank={() => ({ name: '', category: '', is_core: false })}
            />
          )}
          {tab === 'stats' && (
            <TableEditor
              table="stats"
              title="Chiffres"
              intro="Les chiffres qui s’animent dans la section « À propos »."
              noun="Chiffre"
              fields={STAT_FIELDS}
              rowLabel={(row) => `${String(row.value)}${String(row.suffix ?? '')}`}
              rowSub={(row) => String(row.label)}
              blank={() => ({ value: 0, suffix: '', label: '' })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="login">
      <div className="login__card">
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    document.title = 'Administration – Martin Manampisoa';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void getSupabase().then((client) => {
      if (!client || !active) return;

      const check = async (session: Session | null) => {
        if (!session) return active && setState({ status: 'out' });
        const { data, error } = await client.rpc('is_admin');
        if (!active) return;
        if (error) return setState({ status: 'error', message: error.message });
        const email = session.user.email ?? '';
        setState(data === true ? { status: 'ready', email } : { status: 'forbidden', email });
      };

      // Déclenché une première fois au chargement avec la session existante, puis à chaque connexion ou déconnexion.
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => void check(session), 0);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Notice title="Supabase n’est pas configuré">
        <p className="muted">
          Renseignez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans le fichier <code>.env</code> (ou dans les variables
          d’environnement de votre hébergeur), puis relancez le site.
        </p>
        <p className="login__back">
          <a href="/">Retour au site</a>
        </p>
      </Notice>
    );
  }

  if (state.status === 'loading') return <Notice title="Chargement…">{null}</Notice>;
  if (state.status === 'out') return <Login />;

  if (state.status === 'error') {
    return (
      <Notice title="Vérification impossible">
        <p className="field__error">{state.message}</p>
        <p className="muted">
          Vérifiez que <code>supabase/schema.sql</code> a bien été exécuté : il crée la fonction <code>is_admin</code>.
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => void signOut()}>
          Se déconnecter
        </button>
      </Notice>
    );
  }

  if (state.status === 'forbidden') {
    return (
      <Notice title="Accès refusé">
        <p className="muted">
          Le compte <strong>{state.email}</strong> est connecté, mais il n’est pas administrateur. Exécutez <code>supabase/make-admin.sql</code> dans
          le SQL Editor de Supabase, puis rechargez cette page.
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => void signOut()}>
          Se déconnecter
        </button>
      </Notice>
    );
  }

  return (
    <ToastProvider>
      <Dashboard email={state.email} />
    </ToastProvider>
  );
}
