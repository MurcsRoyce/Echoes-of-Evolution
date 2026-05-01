import { useState, useEffect } from 'react';
import { CARD_LIBRARY } from '../data/cards';
import { EVOLUTION_COLORS } from '../data/colors';
import {
  getStoredProfileId,
  setStoredProfileId,
  fetchProfile,
  createProfile,
  updateProfile,
  upsertAuthProfile,
} from '../lib/profilesDb';
import { supabase } from '../lib/supabaseClient';
import { setCachedDisplayName } from '../lib/profileDisplayName';
import { fetchClientPublicIp } from '../lib/fetchClientPublicIp';
import './ProfilePanel.css';

export default function ProfilePanel({ onAfterSignOut }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [publicIp, setPublicIp] = useState(null);
  const [publicIpLoading, setPublicIpLoading] = useState(false);
  const [publicIpError, setPublicIpError] = useState(false);
  const [hasSupabaseAuthUser, setHasSupabaseAuthUser] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [favoriteOccupationId, setFavoriteOccupationId] = useState('');
  const [favoriteColorId, setFavoriteColorId] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) {
            setHasSupabaseAuthUser(false);
            setProfile(null);
            setDisplayName('');
            setCachedDisplayName('');
            setFavoriteOccupationId('');
            setFavoriteColorId('');
            setAccountEmail('');
            setPublicIp(null);
            setPublicIpError(false);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setHasSupabaseAuthUser(true);
        if (!cancelled) {
          setAccountEmail((user.email ?? '').trim());
          setPublicIp(null);
          setPublicIpError(false);
          setPublicIpLoading(true);
        }
        const ipPromise = fetchClientPublicIp().catch(() => {
          if (!cancelled) setPublicIpError(true);
          return null;
        });
        try {
          const p = await fetchProfile(user.id);
          if (!cancelled && p) {
            setProfile(p);
            setDisplayName(p.display_name ?? '');
            setCachedDisplayName(p.display_name ?? '');
            setFavoriteOccupationId(p.favorite_occupation_id ?? '');
            setFavoriteColorId(p.favorite_color_id ?? '');
          } else if (!cancelled) {
            const metaName = (user.user_metadata?.username ?? '').trim();
            setProfile(null);
            setDisplayName(metaName);
            if (metaName) setCachedDisplayName(metaName);
            setFavoriteOccupationId('');
            setFavoriteColorId('');
          }
        } catch (e) {
          if (!cancelled) setError(e.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
        try {
          const ip = await ipPromise;
          if (!cancelled && ip) setPublicIp(ip);
        } catch {
          if (!cancelled) setPublicIpError(true);
        } finally {
          if (!cancelled) setPublicIpLoading(false);
        }
        return;
      }

      const id = getStoredProfileId();
      if (!id) {
        setHasSupabaseAuthUser(false);
        setProfile(null);
        setDisplayName('');
        setCachedDisplayName('');
        setFavoriteOccupationId('');
        setFavoriteColorId('');
        setAccountEmail('');
        setPublicIp(null);
        setLoading(false);
        return;
      }
      try {
        const p = await fetchProfile(id);
        if (!cancelled && p) {
          setProfile(p);
          setDisplayName(p.display_name ?? '');
          setCachedDisplayName(p.display_name ?? '');
          setFavoriteOccupationId(p.favorite_occupation_id ?? '');
          setFavoriteColorId(p.favorite_color_id ?? '');
        } else if (!cancelled) {
          setStoredProfileId(null);
          setProfile(null);
          setCachedDisplayName('');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You are not signed in.');
        const updated = await upsertAuthProfile(user.id, {
          display_name: displayName || null,
          favorite_occupation_id: favoriteOccupationId || null,
          favorite_color_id: favoriteColorId || null,
        });
        setProfile(updated);
        setCachedDisplayName(displayName || '');
        return;
      }

      if (profile) {
        const updated = await updateProfile(profile.id, {
          display_name: displayName || null,
          favorite_occupation_id: favoriteOccupationId || null,
          favorite_color_id: favoriteColorId || null,
        });
        setProfile(updated);
        setCachedDisplayName(displayName || '');
      } else {
        const created = await createProfile({
          display_name: displayName || null,
          favorite_occupation_id: favoriteOccupationId || null,
          favorite_color_id: favoriteColorId || null,
        });
        setProfile(created);
        setStoredProfileId(created.id);
        setCachedDisplayName(displayName || '');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      if (supabase) await supabase.auth.signOut();
      setProfile(null);
      setDisplayName('');
      setFavoriteOccupationId('');
      setFavoriteColorId('');
      setCachedDisplayName('');
      setStoredProfileId(null);
      setAccountEmail('');
      setPublicIp(null);
      setPublicIpError(false);
      setPublicIpLoading(false);
      setHasSupabaseAuthUser(false);
      await onAfterSignOut?.();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <section className="profile-panel">
        <h2 className="profile-panel__title">Your profile</h2>
        <p className="profile-panel__muted">Loading…</p>
      </section>
    );
  }

  return (
    <section className="profile-panel">
      <h2 className="profile-panel__title">Your profile</h2>
      {supabase && hasSupabaseAuthUser && (
        <div className="profile-panel__account-meta">
          <h3 className="profile-panel__meta-heading">Account</h3>
          <dl className="profile-panel__dl">
            <dt>Email</dt>
            <dd>{accountEmail || '—'}</dd>
            <dt
              title="Your network’s public address as detected now. (Auth services do not expose the exact server-side “login IP” to the browser.)"
            >
              Public IP
            </dt>
            <dd>
              {publicIpLoading && !publicIp && !publicIpError ? 'Detecting…' : null}
              {!publicIpLoading && publicIp ? publicIp : null}
              {publicIpError && !publicIp ? 'Could not detect' : null}
              {!publicIpLoading && !publicIp && !publicIpError ? '—' : null}
            </dd>
          </dl>
        </div>
      )}
      <form className="profile-panel__form" onSubmit={handleSave}>
        <label className="profile-panel__label">
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Player One"
            className="profile-panel__input"
          />
        </label>
        <label className="profile-panel__label">
          Favorite occupation
          <select
            value={favoriteOccupationId}
            onChange={(e) => setFavoriteOccupationId(e.target.value)}
            className="profile-panel__select"
          >
            <option value="">—</option>
            {CARD_LIBRARY.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="profile-panel__label">
          Favorite color
          <select
            value={favoriteColorId}
            onChange={(e) => setFavoriteColorId(e.target.value)}
            className="profile-panel__select"
          >
            <option value="">—</option>
            {EVOLUTION_COLORS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        {error && <p className="profile-panel__error">{error}</p>}
        <button type="submit" className="profile-panel__submit" disabled={saving}>
          {profile || supabase ? 'Save profile' : 'Create profile'}
        </button>
        {supabase && (
          <button
            type="button"
            className="profile-panel__signout"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        )}
      </form>
    </section>
  );
}
