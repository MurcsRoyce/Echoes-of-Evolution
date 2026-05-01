import { supabase } from './supabaseClient';

/**
 * Fetch the full card set from Supabase.
 * Returns array of { id, name, tier, flavor, evolution_color_id, created_at, updated_at }.
 * Returns [] if Supabase is not configured or request fails.
 */
export async function fetchCards() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cards')
    .select('id, name, tier, flavor, evolution_color_id, created_at, updated_at')
    .order('tier', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
