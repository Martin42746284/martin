import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import type { FieldDef } from './fields';
import { RecordForm, type Values } from './RecordForm';
import { useToast } from './toast';
import { removeFile } from './upload';

type Row = Record<string, unknown> & { id: number; sort_order?: number };

interface Props {
  table: string;
  title: string;
  intro: string;
  noun: string;
  fields: FieldDef[];
  rowLabel: (row: Row) => string;
  rowSub?: (row: Row) => string;
  /** Valeurs d'un nouvel élément. */
  blank: () => Values;
}



export function TableEditor({ table, title, intro, noun, fields, rowLabel, rowSub, blank }: Props) {
  const notify = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    const client = await getSupabase();
    if (!client) return;
    const { data, error } = await client.from(table).select('*').order('sort_order').order('id');
    if (error) notify(`Chargement impossible : ${error.message}`, 'error');
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [table, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const imageKeys = useMemo(() => fields.filter((f) => f.type === 'image' || f.type === 'file').map((f) => f.key), [fields]);
  const current = typeof selected === 'number' ? rows.find((row) => row.id === selected) : undefined;
  const nextOrder = rows.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1;

  const visibleRows = rows.filter((row) =>
    `${rowLabel(row)} ${rowSub?.(row) ?? ''}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  async function save(values: Values) {
    const client = await getSupabase();
    if (!client) return;
    const payload: Values = { ...values };
    delete payload.id;

    if (selected === 'new') {
      const { data, error } = await client.from(table).insert({ ...payload, sort_order: nextOrder }).select().single();
      if (error) return notify(`Ajout impossible : ${error.message}`, 'error');
      notify(`${noun} ajouté.`);
      await load();
      setSelected((data as Row).id);
      return;
    }

    if (!current) return;
    const { error } = await client.from(table).update(payload).eq('id', current.id);
    if (error) return notify(`Enregistrement impossible : ${error.message}`, 'error');

    // Un fichier remplacé ou retiré n'a plus d'utilité : on le supprime du bucket.
    await Promise.all(
      imageKeys
        .filter((key) => current[key] && current[key] !== payload[key])
        .map((key) => removeFile(current[key] as string)),
    );
    notify('Modifications enregistrées.');
    await load();
  }

  async function remove() {
    const client = await getSupabase();
    if (!client || !current) return;
    if (!window.confirm(`Supprimer « ${rowLabel(current)} » ? Cette action est définitive.`)) return;
    const { error } = await client.from(table).delete().eq('id', current.id);
    if (error) return notify(`Suppression impossible : ${error.message}`, 'error');
    await Promise.all(imageKeys.map((key) => removeFile(current[key] as string | null)));
    notify(`${noun} supprimé.`);
    setSelected(null);
    await load();
  }

  async function move(row: Row, direction: -1 | 1) {
    const client = await getSupabase();
    if (!client) return;
    const order = [...rows];
    const from = order.findIndex((item) => item.id === row.id);
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];

    // On renumérote tout de 1 à n : l'ordre reste correct même s'il y avait des doublons.
    const changes = order
      .map((item, index) => ({ id: item.id, sort_order: index + 1, previous: item.sort_order }))
      .filter((item) => item.previous !== item.sort_order);
    const results = await Promise.all(
      changes.map((item) => client.from(table).update({ sort_order: item.sort_order }).eq('id', item.id)),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) notify(`Déplacement impossible : ${failed.error.message}`, 'error');
    await load();
  }

  if (selected !== null) {
    return (
      <div className="panel">
        <div className="edit__back">
          <button className="btn btn--ghost btn--small" type="button" onClick={() => setSelected(null)}>
            ← Retour aux {title.toLowerCase()}
          </button>
        </div>
        <header className="panel__head">
          <div>
            <h2>{current ? rowLabel(current) : `Nouveau ${noun.toLowerCase()}`}</h2>
            <p>{current ? `Modifiez cet élément puis enregistrez.` : `Renseignez les informations puis enregistrez.`}</p>
          </div>
        </header>

        <div className="editor">
          {selected === 'new' && (
            <RecordForm
              key="new"
              fields={fields}
              initial={blank()}
              submitLabel={`Ajouter ce ${noun.toLowerCase()}`}
              onSubmit={save}
              onCancel={() => setSelected(null)}
            />
          )}
          {current && <RecordForm key={current.id} fields={fields} initial={current} onSubmit={save} onDelete={remove} />}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <header className="panel__head">
        <div>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <button className="btn btn--primary" type="button" onClick={() => setSelected('new')}>
          Ajouter
        </button>
      </header>

      <div className="list-wrap">
        {rows.length > 8 && (
          <input
            className="list__filter"
            type="search"
            placeholder="Filtrer la liste"
            aria-label="Filtrer la liste"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        )}
        {loading ? (
          <p className="muted">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="muted">Rien pour le moment. Utilisez « Ajouter » pour créer le premier élément.</p>
        ) : (
          <ul className="list">
            {visibleRows.map((row) => (
              <li key={row.id} className="list__item">
                <button type="button" className="list__main" onClick={() => setSelected(row.id)}>
                  <span className="list__title">{rowLabel(row)}</span>
                  {rowSub && <span className="list__sub">{rowSub(row)}</span>}
                </button>
                {!filter && (
                  <span className="list__move">
                    <button type="button" aria-label={`Monter ${rowLabel(row)}`} onClick={() => move(row, -1)} disabled={rows[0].id === row.id}>
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Descendre ${rowLabel(row)}`}
                      onClick={() => move(row, 1)}
                      disabled={rows[rows.length - 1].id === row.id}
                    >
                      ↓
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
