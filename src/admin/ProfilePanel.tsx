import { useEffect, useState } from 'react';
import { fallback } from '../data/fallback';
import { getSupabase } from '../lib/supabase';
import type { FieldDef } from './fields';
import { RecordForm, type Values } from './RecordForm';
import { useToast } from './toast';
import { removeFile } from './upload';

const FIELDS: FieldDef[] = [
  { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
  { key: 'title', label: 'Titre', type: 'text', required: true, hint: 'Affiché sous votre nom.' },
  { key: 'title_en', label: 'Titre (anglais)', type: 'text', nullable: true, hint: 'Si vide, le texte français est affiché en anglais.' },
  {
    key: 'hero_words',
    label: 'Mots qui défilent',
    type: 'lines',
    wide: true,
    hint: 'Un par ligne. Ils s’affichent après « Je construis », par exemple « des API REST sécurisées ».',
  },
  {
    key: 'hero_words_en',
    label: 'Mots qui défilent (anglais)',
    type: 'lines',
    wide: true,
    hint: 'Affichés après « I build », par exemple « secure REST APIs ».',
  },
  { key: 'tagline', label: 'Phrase d’accroche', type: 'textarea', rows: 3, required: true, wide: true },
  { key: 'tagline_en', label: 'Phrase d’accroche (anglais)', type: 'textarea', rows: 3, nullable: true, wide: true },
  { key: 'bio', label: 'Présentation', type: 'textarea', rows: 10, required: true, wide: true, hint: 'Séparez les paragraphes par une ligne vide.' },
  { key: 'bio_en', label: 'Présentation (anglais)', type: 'textarea', rows: 10, nullable: true, wide: true },
  { key: 'location', nullable: true, label: 'Lieu', type: 'text' },
  { key: 'languages', nullable: true, label: 'Langues', type: 'text' },
  { key: 'languages_en', label: 'Langues (anglais)', type: 'text', nullable: true },
  { key: 'education', nullable: true, label: 'Formation', type: 'text', wide: true },
  { key: 'education_en', label: 'Formation (anglais)', type: 'text', nullable: true, wide: true },
  { key: 'email', nullable: true, label: 'E-mail public', type: 'email' },
  { key: 'phone', nullable: true, label: 'Téléphone', type: 'text', hint: 'Laissez vide pour ne pas l’afficher sur le site.' },
  { key: 'github_url', nullable: true, label: 'Lien GitHub', type: 'url', placeholder: 'https://github.com/…' },
  { key: 'linkedin_url', nullable: true, label: 'Lien LinkedIn', type: 'url', placeholder: 'https://www.linkedin.com/in/…', hint: 'Laissez vide pour ne pas l’afficher.' },
  { key: 'photo_path', label: 'Photo de profil', type: 'image', baseName: 'photo', maxSide: 1000 },
  { key: 'cv_path', label: 'CV en français (PDF)', type: 'file', baseName: 'cv' },
  { key: 'cv_path_en', label: 'CV en anglais (PDF)', type: 'file', baseName: 'cv-en', hint: 'Si vide, le CV français est proposé en anglais.' },
  { key: 'available', label: 'Disponible pour un poste ou un stage', type: 'boolean', wide: true },
];

export function ProfilePanel() {
  const notify = useToast();
  const [initial, setInitial] = useState<Values | null>(null);

  useEffect(() => {
    let active = true;
    void getSupabase().then((client) => {
      if (!client || !active) return;
      client
        .from('profile')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) notify(`Chargement impossible : ${error.message}`, 'error');
          // Base pas encore remplie : on propose le contenu d'origine, qui sera créé à l'enregistrement.
          setInitial((data as Values | null) ?? { ...fallback.profile });
        });
    });
    return () => {
      active = false;
    };
  }, [notify]);

  async function save(values: Values) {
    const client = await getSupabase();
    if (!client || !initial) return;
    const { error } = await client.from('profile').upsert({ ...values, id: 1, updated_at: new Date().toISOString() });
    if (error) return notify(`Enregistrement impossible : ${error.message}`, 'error');

    await Promise.all(
      (['photo_path', 'cv_path', 'cv_path_en'] as const)
        .filter((key) => initial[key] && initial[key] !== values[key])
        .map((key) => removeFile(initial[key] as string)),
    );
    setInitial({ ...values, id: 1 });
    notify('Profil enregistré.');
  }

  return (
    <div className="panel">
      <header className="panel__head">
        <div>
          <h2>Profil</h2>
          <p>Ces informations apparaissent en haut du site, dans « À propos » et dans « Contact ».</p>
        </div>
      </header>
      {initial ? <RecordForm key={`${String(initial.photo_path)}|${String(initial.cv_path)}|${String(initial.cv_path_en)}`} fields={FIELDS} initial={initial} onSubmit={save} /> : <p className="muted">Chargement…</p>}
    </div>
  );
}
