import { supabase } from './supabaseClient';

const MAX_EMAIL = 254;
const MAX_BODY = 8000;

/**
 * Save feedback row to Supabase (requires `player_feedback` table + insert RLS).
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export async function submitPlayerFeedback({ email, description }) {
  if (!supabase) {
    return { ok: false, error: 'Feedback is unavailable (server not configured).' };
  }
  const em = (email ?? '').trim().slice(0, MAX_EMAIL);
  const body = (description ?? '').trim().slice(0, MAX_BODY);
  if (!em) return { ok: false, error: 'Please enter your email.' };
  if (!body) return { ok: false, error: 'Please enter your feedback.' };

  const { error } = await supabase.from('player_feedback').insert({
    email: em,
    body,
  });
  if (error) {
    return { ok: false, error: error.message || 'Could not send feedback.' };
  }
  return { ok: true };
}
