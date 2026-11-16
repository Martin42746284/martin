import { useId, useMemo, useState, type FormEvent } from 'react';
import { Field, type FieldDef } from './fields';

export type Values = Record<string, unknown>;

interface Props {
  fields: FieldDef[];
  initial: Values;
  submitLabel?: string;
  onSubmit: (values: Values) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
}

export function RecordForm({ fields, initial, submitLabel = 'Enregistrer', onSubmit, onCancel, onDelete }: Props) {
  const [values, setValues] = useState<Values>(initial);
  const [busy, setBusy] = useState(false);
  const prefix = useId();

  // Regroupe les champs par section, dans l'ordre de leur première apparition.
  const sections = useMemo(() => {
    const ordered: Array<{ title: string; defs: FieldDef[] }> = [];
    const index = new Map<string, number>();
    for (const def of fields) {
      const title = def.section ?? '';
      let at = index.get(title);
      if (at === undefined) {
        at = ordered.length;
        index.set(title, at);
        ordered.push({ title, defs: [] });
      }
      ordered[at].defs.push(def);
    }
    return ordered;
  }, [fields]);

  // À partir de deux catégories nommées, on navigue de page en page, comme pour les projets.
  const navigable = sections.length > 1 && sections.every((section) => section.title !== '');
  const [openCat, setOpenCat] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
    }
  }

  function renderGrid(defs: FieldDef[]) {
    return (
      <div className="record__grid">
        {defs.map((def) => (
          <Field
            key={def.key}
            def={def}
            id={`${prefix}-${def.key}`}
            value={values[def.key]}
            values={values}
            onChange={(next) => setValues((current) => ({ ...current, [def.key]: next }))}
          />
        ))}
      </div>
    );
  }

  const activeSection = openCat === null ? undefined : sections.find((section) => section.title === openCat);

  const body = navigable ? (
    activeSection ? (
      <div className="record__catpage">
        <div className="edit__back">
          <button className="btn btn--ghost btn--small" type="button" onClick={() => setOpenCat(null)}>
            ← Retour aux catégories
          </button>
        </div>
        <h3 className="record__legend">{activeSection.title}</h3>
        {renderGrid(activeSection.defs)}
      </div>
    ) : (
      <ul className="list record__catlist">
        {sections.map((section) => (
          <li key={section.title} className="list__item">
            <button type="button" className="list__main" onClick={() => setOpenCat(section.title)}>
              <span className="list__title">{section.title}</span>
              <span className="list__sub">{section.defs.length} champ{section.defs.length > 1 ? 's' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    )
  ) : (
    sections.map((section, i) => (
      <section className="record__section" key={section.title || `default-${i}`}>
        {section.title && <h3 className="record__legend">{section.title}</h3>}
        {renderGrid(section.defs)}
      </section>
    ))
  );

  return (
    <form className="record" onSubmit={submit}>
      {body}
      <div className="record__actions">
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? 'Enregistrement' : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn--ghost" type="button" onClick={onCancel} disabled={busy}>
            Annuler
          </button>
        )}
        {onDelete && (
          <button className="btn btn--danger" type="button" onClick={remove} disabled={busy}>
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
