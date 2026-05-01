import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { upsertAuthProfile } from '../lib/profilesDb';
import { setCachedDisplayName } from '../lib/profileDisplayName';
import './AuthScreen.css';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const em = email.trim();
    const pw = password;
    const un = username.trim();

    if (!em || !pw) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup') {
      if (!un) {
        setError('Username is required to create an account.');
        return;
      }
      if (pw.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    if (!supabase) {
      setError('Server is not configured.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: em, password: pw });
        if (err) throw err;
        return;
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: { data: { username: un } },
      });
      if (signErr) throw signErr;

      const user = data.user;
      if (user?.id) {
        try {
          await upsertAuthProfile(user.id, {
            display_name: un,
            favorite_occupation_id: null,
            favorite_color_id: null,
          });
          setCachedDisplayName(un);
        } catch (profileErr) {
          throw new Error(
            profileErr.message ||
              'Account created but profile could not be saved. Check that profiles RLS allows your user id.',
          );
        }
      }

      if (!data.session) {
        setInfo('Check your email to confirm your account, then sign in.');
        setPassword('');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__card">
        <h1 className="auth-screen__title">Echoes of Evolution</h1>
        <p className="auth-screen__subtitle">Sign in to play online or try the tutorial</p>

        <div className="auth-screen__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            className={`auth-screen__tab${mode === 'signin' ? ' auth-screen__tab--active' : ''}`}
            onClick={() => {
              setMode('signin');
              setError(null);
              setInfo(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-screen__tab${mode === 'signup' ? ' auth-screen__tab--active' : ''}`}
            onClick={() => {
              setMode('signup');
              setError(null);
              setInfo(null);
            }}
          >
            Create account
          </button>
        </div>

        <form className="auth-screen__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth-screen__label">
              Username
              <input
                type="text"
                className="auth-screen__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Shown on your profile"
              />
            </label>
          )}
          <label className="auth-screen__label">
            Email
            <input
              type="email"
              className="auth-screen__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label className="auth-screen__label">
            Password
            <input
              type="password"
              className="auth-screen__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
            />
          </label>

          {error && <p className="auth-screen__error">{error}</p>}
          {info && <p className="auth-screen__info">{info}</p>}

          <button type="submit" className="auth-screen__submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
