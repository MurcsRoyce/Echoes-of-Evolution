import { supabase } from './supabaseClient';

const PROFILE_ID_KEY = 'echoes-profile-id';

export function getStoredProfileId() {
  return localStorage.getItem(PROFILE_ID_KEY);
}

export function setStoredProfileId(id) {
  if (id) localStorage.setItem(PROFILE_ID_KEY, id);
  else localStorage.removeItem(PROFILE_ID_KEY);
}

/**
 * Get a profile by id (e.g. from localStorage).
 */
export async function fetchProfile(id) {
  if (!id || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, favorite_occupation_id, favorite_color_id, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data;
}

/**
 * Create a new profile. Returns the created row (with id).
 */
export async function createProfile({ display_name, favorite_occupation_id, favorite_color_id }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('profiles')
    .insert({ display_name, favorite_occupation_id, favorite_color_id })
    .select('id, display_name, favorite_occupation_id, favorite_color_id, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing profile.
 */
export async function updateProfile(id, { display_name, favorite_occupation_id, favorite_color_id }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const updates = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (favorite_occupation_id !== undefined) updates.favorite_occupation_id = favorite_occupation_id;
  if (favorite_color_id !== undefined) updates.favorite_color_id = favorite_color_id;

  if (Object.keys(updates).length === 0) return fetchProfile(id);

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, display_name, favorite_occupation_id, favorite_color_id, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or replace a profile row keyed by Supabase Auth user id (must match auth.uid() for RLS).
 */
export async function upsertAuthProfile(userId, { display_name, favorite_occupation_id, favorite_color_id }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const row = {
    id: userId,
    display_name: display_name ?? null,
    favorite_occupation_id: favorite_occupation_id ?? null,
    favorite_color_id: favorite_color_id ?? null,
  };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('id, display_name, favorite_occupation_id, favorite_color_id, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}
