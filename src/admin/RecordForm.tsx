import { useId, useState, type FormEvent } from 'react';
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

  return (
    <form className="record" onSubmit={submit}>
      <div className="record__grid">
        {fields.map((def) => (
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
