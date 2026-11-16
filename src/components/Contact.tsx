import { useState, type FormEvent } from 'react';
import { useI18n } from '../lib/i18n';
import { getSupabase } from '../lib/supabase';
import type { ContactMessage, Profile } from '../lib/types';
import { CheckIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon, PinIcon } from './icons';
import { SectionHead } from './SectionHead';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const COOLDOWN_MS = 30_000;

interface InfoRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

function recentlySent(): boolean {
  try {
    const last = Number(localStorage.getItem('contact:last') ?? 0);
    return Date.now() - last < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markSent() {
  try {
    localStorage.setItem('contact:last', String(Date.now()));
  } catch {
    /* sans importance */
  }
}

export function Contact({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get('website')) {
      setStatus('sent');
      setFeedback(t('contact.sent'));
      form.reset();
      return;
    }

    const payload: ContactMessage = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      subject: String(data.get('subject') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    };

    if (recentlySent()) {
      setStatus('error');
      setFeedback(t('contact.cooldown'));
      return;
    }

    setStatus('sending');
    setFeedback('');

    let response: Response;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      setStatus('error');
      setFeedback(profile.email ? t('contact.errorEmail', { email: profile.email }) : t('contact.error'));
      return;
    }

    const body: unknown = await response.json().catch(() => null);
    const reason = typeof body === 'object' && body !== null && 'error' in body ? body.error : undefined;
    const sent = typeof body === 'object' && body !== null && 'ok' in body && body.ok === true;
    if (!response.ok || !sent) {
      setStatus('error');
      setFeedback(
        reason === 'rate_limited'
          ? t('contact.cooldown')
          : reason === 'not_configured'
            ? t('contact.notConfigured')
            : profile.email
              ? t('contact.errorEmail', { email: profile.email })
              : t('contact.error'),
      );
      return;
    }

    markSent();
    setStatus('sent');
    let archived = true;
    try {
      const client = await getSupabase();
      if (client) {
        const { error } = await client.from('messages').insert(payload);
        archived = !error;
        if (error) console.error('[contact] E-mail envoyé, mais son archivage a échoué :', error.message);
      } else {
        archived = false;
      }
    } catch (error) {
      archived = false;
      console.error('[contact] E-mail envoyé, mais son archivage a échoué :', error);
    }

    setFeedback(archived ? t('contact.sent') : t('contact.sentNoArchive'));
    form.reset();
  }

  const sending = status === 'sending';

  const rows: InfoRow[] = [];
  if (profile.email) rows.push({ icon: <MailIcon />, label: t('contact.labelEmail'), value: profile.email, href: `mailto:${profile.email}` });
  if (profile.phone) rows.push({ icon: <PhoneIcon />, label: t('contact.labelPhone'), value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` });
  if (profile.github_url) rows.push({ icon: <GithubIcon />, label: 'GitHub', value: profile.github_url.replace(/^https?:\/\//, ''), href: profile.github_url, external: true });
  if (profile.linkedin_url) rows.push({ icon: <LinkedinIcon />, label: 'LinkedIn', value: profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, ''), href: profile.linkedin_url, external: true });
  if (profile.location) rows.push({ icon: <PinIcon />, label: t('contact.labelPlace'), value: profile.location });

  const rowContent = (row: InfoRow) => (
    <>
      <span className="contact__icon">{row.icon}</span>
      <span>
        <span className="contact__label">{row.label}</span>
        <span className="contact__value">{row.value}</span>
      </span>
    </>
  );

  return (
    <section className="section" aria-labelledby="contact">
      <div className="container">
        <SectionHead id="contact" title={t('contact.title')} lead={t('contact.lead')} />
        <div className="contact">
          <div className="contact__side">
            <ul className="contact__list">
              {rows.map((row) => (
                <li key={row.label}>
                  {row.href ? (
                    <a className="contact__row" href={row.href} {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {rowContent(row)}
                    </a>
                  ) : (
                    <div className="contact__row">{rowContent(row)}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <form className="form" onSubmit={onSubmit} noValidate={false}>
            <div className="field">
              <label htmlFor="c-name">{t('contact.name')}</label>
              <input id="c-name" name="name" type="text" autoComplete="name" required maxLength={100} aria-invalid={status === 'error'} />
            </div>
            <div className="field">
              <label htmlFor="c-email">{t('contact.email')}</label>
              <input id="c-email" name="email" type="email" autoComplete="email" required maxLength={200} aria-invalid={status === 'error'} />
            </div>
            <div className="field">
              <label htmlFor="c-subject">{t('contact.subject')}</label>
              <input id="c-subject" name="subject" type="text" required maxLength={150} placeholder={t('contact.subjectPlaceholder')} aria-invalid={status === 'error'} />
            </div>
            <div className="field">
              <label htmlFor="c-message">{t('contact.message')}</label>
              <textarea id="c-message" name="message" rows={2} required minLength={10} maxLength={3000} aria-invalid={status === 'error'} />
            </div>
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="c-website">Ne pas remplir ce champ</label>
              <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="form__footer">
              <button className="btn btn--primary" type="submit" disabled={sending}>
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
              <p className="form__status" role="status" data-status={status}>
                {status === 'sent' && <CheckIcon className="form__check" />}
                {feedback}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}