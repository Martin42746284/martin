import { useState, type FormEvent } from 'react';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import type { ContactMessage, Profile } from '../lib/types';
import { CheckIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon, PinIcon } from './icons';
import { SectionHead } from './SectionHead';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const COOLDOWN_MS = 30_000;

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

    // Champ piège : un humain ne le voit pas, un robot le remplit.
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

    // Sans Supabase configuré, on ouvre la messagerie de l'utilisateur.
    if (!supabase) {
      const subject = encodeURIComponent(payload.subject || t('contact.mailSubject', { name: payload.name }));
      const body = encodeURIComponent(`${payload.message}\n\n${payload.name}\n${payload.email}`);
      window.location.href = `mailto:${profile.email ?? ''}?subject=${subject}&body=${body}`;
      setStatus('sent');
      setFeedback(t('contact.mailto'));
      return;
    }

    setStatus('sending');
    setFeedback('');
    const { error } = await supabase.from('messages').insert(payload);

    if (error) {
      setStatus('error');
      setFeedback(profile.email ? t('contact.errorEmail', { email: profile.email }) : t('contact.error'));
      return;
    }

    markSent();
    setStatus('sent');
    setFeedback(t('contact.sent'));
    form.reset();
  }

  const sending = status === 'sending';

  return (
    <section className="section" aria-labelledby="contact">
      <div className="container">
        <SectionHead id="contact" title={t('contact.title')} lead={t('contact.lead')} />

        <div className="contact">
          <ul className="contact__list">
            {profile.email && (
              <li>
                <MailIcon />
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
            )}
            {profile.phone && (
              <li>
                <PhoneIcon />
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
              </li>
            )}
            {profile.github_url && (
              <li>
                <GithubIcon />
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  {profile.github_url.replace(/^https?:\/\//, '')}
                </a>
              </li>
            )}
            {profile.linkedin_url && (
              <li>
                <LinkedinIcon />
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
            )}
            {profile.location && (
              <li>
                <PinIcon />
                <span>{profile.location}</span>
              </li>
            )}
          </ul>

          <form className="form" onSubmit={onSubmit} noValidate={false}>
            <div className="field">
              <label htmlFor="c-name">{t('contact.name')}</label>
              <input id="c-name" name="name" type="text" autoComplete="name" required maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="c-email">{t('contact.email')}</label>
              <input id="c-email" name="email" type="email" autoComplete="email" required maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="c-subject">{t('contact.subject')}</label>
              <input id="c-subject" name="subject" type="text" required maxLength={150} placeholder={t('contact.subjectPlaceholder')} />
            </div>
            <div className="field">
              <label htmlFor="c-message">{t('contact.message')}</label>
              <textarea id="c-message" name="message" rows={6} required minLength={10} maxLength={3000} />
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
