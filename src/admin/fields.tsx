import { useState, type ChangeEvent } from 'react';
import { assetUrl } from '../lib/supabase';
import { uploadDocument, uploadImage } from './upload';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'url' | 'email' | 'textarea' | 'number' | 'boolean' | 'select' | 'lines' | 'csv' | 'image' | 'file';
  required?: boolean;
  /** Champ facultatif en base : une saisie vide est enregistrée comme « null ». */
  nullable?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
  /** image, file : dossier du bucket */
  folder?: string;
  /** image, file : nom de base du fichier (sinon la valeur du champ indiqué par nameFrom) */
  baseName?: string;
  nameFrom?: string;
  accept?: string;
  maxSide?: number;
  /** Occupe toute la largeur du formulaire. */
  wide?: boolean;
}

interface Props {
  def: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Valeurs actuelles du formulaire (pour nommer les fichiers). */
  values: Record<string, unknown>;
  id: string;
}

function ListInput({ def, value, onChange, id }: Pick<Props, 'def' | 'value' | 'onChange' | 'id'>) {
  const separator = def.type === 'lines' ? '\n' : ', ';
  const [text, setText] = useState(Array.isArray(value) ? (value as string[]).join(separator) : '');

  function handle(event: ChangeEvent<HTMLTextAreaElement>) {
    const raw = event.target.value;
    setText(raw);
    const parts = def.type === 'lines' ? raw.split('\n') : raw.split(',');
    onChange(parts.map((part) => part.trim()).filter(Boolean));
  }

  return (
    <textarea
      id={id}
      rows={def.rows ?? (def.type === 'lines' ? 5 : 2)}
      value={text}
      onChange={handle}
      placeholder={def.placeholder}
    />
  );
}

function FileInput({ def, value, onChange, values, id }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const path = typeof value === 'string' && value ? value : null;
  const url = assetUrl(path);
  const isImage = def.type === 'image';

  async function handle(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setState('sending');
    setMessage('');
    try {
      const base = def.baseName ?? String(values[def.nameFrom ?? ''] ?? def.key);
      const folder = def.folder ?? '';
      const uploaded = isImage
        ? await uploadImage(folder, base, file, def.maxSide ?? 1600)
        : await uploadDocument(folder, base, file);
      onChange(uploaded);
      setState('idle');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Envoi impossible.');
    }
  }

  return (
    <div className="upload">
      {isImage && url && <img className="upload__preview" src={url} alt="" />}
      {!isImage && path && (
        <a className="upload__file" href={url} target="_blank" rel="noopener noreferrer">
          {path}
        </a>
      )}
      <div className="upload__actions">
        <label className="btn btn--ghost btn--small" htmlFor={id}>
          {state === 'sending' ? 'Envoi en cours' : path ? 'Remplacer' : 'Choisir un fichier'}
        </label>
        <input
          id={id}
          className="sr-only"
          type="file"
          accept={def.accept ?? (isImage ? 'image/png,image/jpeg,image/webp' : 'application/pdf')}
          onChange={handle}
          disabled={state === 'sending'}
        />
        {path && (
          <button type="button" className="btn btn--text btn--small" onClick={() => onChange(null)}>
            Retirer
          </button>
        )}
      </div>
      {state === 'error' && (
        <p className="field__error" role="alert">
          {message}
        </p>
      )}
      <p className="field__hint">
        {path ? 'Enregistrez le formulaire pour appliquer ce fichier.' : 'Aucun fichier choisi.'}
      </p>
    </div>
  );
}

export function Field(props: Props) {
  const { def, value, onChange, id } = props;
  const text = typeof value === 'string' ? value : '';

  let control;
  switch (def.type) {
    case 'textarea':
      control = (
        <textarea
          id={id}
          rows={def.rows ?? 4}
          value={text}
          required={def.required}
          maxLength={def.maxLength}
          placeholder={def.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case 'number':
      control = (
        <input
          id={id}
          type="number"
          step="any"
          value={value === null || value === undefined ? '' : String(value)}
          required={def.required}
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        />
      );
      break;
    case 'boolean':
      control = (
        <label className="switch" htmlFor={id}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          <span>{value ? 'Oui' : 'Non'}</span>
        </label>
      );
      break;
    case 'select':
      control = (
        <select id={id} value={text} required={def.required} onChange={(event) => onChange(event.target.value)}>
          {def.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'lines':
    case 'csv':
      control = <ListInput def={def} value={value} onChange={onChange} id={id} />;
      break;
    case 'image':
    case 'file':
      control = <FileInput {...props} />;
      break;
    default:
      control = (
        <input
          id={id}
          type={def.type}
          value={text}
          required={def.required}
          maxLength={def.maxLength}
          placeholder={def.placeholder}
          onChange={(event) => onChange(event.target.value === '' && def.nullable ? null : event.target.value)}
        />
      );
  }

  return (
    <div className={`field${def.wide ? ' field--wide' : ''}`}>
      <label htmlFor={id}>
        {def.label}
        {def.required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {def.hint && def.type !== 'image' && def.type !== 'file' && <p className="field__hint">{def.hint}</p>}
    </div>
  );
}
