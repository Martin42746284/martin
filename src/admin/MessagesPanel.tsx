import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './toast';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));

export function MessagesPanel({ onUnread }: { onUnread: (count: number) => void }) {
  const notify = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (error) {
      notify(`Chargement impossible : ${error.message}`, 'error');
    } else {
      const rows = (data ?? []) as Message[];
      setMessages(rows);
      onUnread(rows.filter((row) => !row.read).length);
    }
    setLoading(false);
  }, [notify, onUnread]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setRead(message: Message, read: boolean) {
    if (!supabase) return;
    const { error } = await supabase.from('messages').update({ read }).eq('id', message.id);
    if (error) return notify(`Mise à jour impossible : ${error.message}`, 'error');
    await load();
  }

  async function remove(message: Message) {
    if (!supabase) return;
    if (!window.confirm(`Supprimer le message de ${message.name} ? Cette action est définitive.`)) return;
    const { error } = await supabase.from('messages').delete().eq('id', message.id);
    if (error) return notify(`Suppression impossible : ${error.message}`, 'error');
    notify('Message supprimé.');
    await load();
  }

  const shown = onlyUnread ? messages.filter((message) => !message.read) : messages;
  const unread = messages.filter((message) => !message.read).length;

  return (
    <div className="panel">
      <header className="panel__head">
        <div>
          <h2>Messages</h2>
          <p>
            {messages.length === 0
              ? 'Les messages envoyés depuis le formulaire de contact apparaissent ici.'
              : `${messages.length} message${messages.length > 1 ? 's' : ''}, dont ${unread} non lu${unread > 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="panel__tools">
          <button className="filter" type="button" aria-pressed={onlyUnread} onClick={() => setOnlyUnread((value) => !value)}>
            Non lus seulement
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => void load()}>
            Actualiser
          </button>
        </div>
      </header>

      {loading ? (
        <p className="muted">Chargement…</p>
      ) : shown.length === 0 ? (
        <p className="muted">{onlyUnread ? 'Aucun message non lu.' : 'Aucun message pour le moment.'}</p>
      ) : (
        <ul className="messages">
          {shown.map((message) => (
            <li key={message.id} className="message" data-read={message.read}>
              <header className="message__head">
                <div>
                  <h3>
                    {!message.read && <span className="message__dot" aria-label="Non lu" />}
                    {message.name}
                  </h3>
                  <p>
                    <a href={`mailto:${message.email}`}>{message.email}</a>
                  </p>
                </div>
                <time dateTime={message.created_at}>{formatDate(message.created_at)}</time>
              </header>
              {message.subject && <p className="message__subject">{message.subject}</p>}
              <p className="message__body">{message.message}</p>
              <div className="message__actions">
                <a
                  className="btn btn--primary btn--small"
                  href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject ? `Re : ${message.subject}` : 'Re : votre message sur mon portfolio')}`}
                  onClick={() => !message.read && void setRead(message, true)}
                >
                  Répondre
                </a>
                <button className="btn btn--ghost btn--small" type="button" onClick={() => setRead(message, !message.read)}>
                  {message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                </button>
                <button className="btn btn--danger btn--small" type="button" onClick={() => remove(message)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
