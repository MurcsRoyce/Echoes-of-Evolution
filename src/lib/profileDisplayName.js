import { fetchProfile, getStoredProfileId, setStoredProfileId } from './profilesDb';
import { supabase } from './supabaseClient';

const CACHE_KEY = 'echoes-display-name-cache';

/** Sync read of last-known display name (set after successful profile load/save). */
export function getCachedDisplayName() {
  try {
    const v = localStorage.getItem(CACHE_KEY);
    return v ? v.trim() : '';
  } catch {
    return '';
  }
}

export function setCachedDisplayName(name) {
  try {
    const t = (name ?? '').trim();
    if (t) localStorage.setItem(CACHE_KEY, t);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Resolve display name for UI: try Supabase profile if id exists, else cache, else empty string.
 */
export async function resolveDisplayNameForUi() {
  const id = getStoredProfileId();
  if (!id) {
    return getCachedDisplayName();
  }
  try {
    const p = await fetchProfile(id);
    const n = (p?.display_name ?? '').trim();
    if (n) setCachedDisplayName(n);
    return n || getCachedDisplayName();
  } catch {
    return getCachedDisplayName();
  }
}

/**
 * After Supabase Auth sign-in: tie localStorage profile id to the user and refresh display name cache.
 */
export async function syncAuthProfileToClient(userId) {
  if (!userId) {
    setStoredProfileId(null);
    setCachedDisplayName('');
    return;
  }
  setStoredProfileId(userId);
  try {
    const p = await fetchProfile(userId);
    const n = (p?.display_name ?? '').trim();
    if (n) {
      setCachedDisplayName(n);
      return;
    }
  } catch {
    /* ignore */
  }
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const u = user?.user_metadata?.username;
      if (u && typeof u === 'string') setCachedDisplayName(u.trim());
    } catch {
      /* ignore */
    }
  }
}
