import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    const { error: failure } = await supabase.auth.signInWithPassword({
      email: String(data.get('email') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    });
    setBusy(false);
    if (failure) {
      setError(
        failure.message.toLowerCase().includes('invalid login')
          ? 'E-mail ou mot de passe incorrect.'
          : `Connexion impossible : ${failure.message}`,
      );
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Administration</h1>
        <p className="muted">Connectez-vous pour modifier le contenu de votre portfolio.</p>
        <div className="field">
          <label htmlFor="login-email">Adresse e-mail</label>
          <input id="login-email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="login-password">Mot de passe</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary login__submit" type="submit" disabled={busy}>
          {busy ? 'Connexion' : 'Se connecter'}
        </button>
        <p className="login__back">
          <a href="/">Retour au site</a>
        </p>
      </form>
    </main>
  );
}
