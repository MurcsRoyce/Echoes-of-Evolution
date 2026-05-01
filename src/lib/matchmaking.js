/**
 * Matchmaking: join queue, subscribe for match (2 players).
 * Uses Supabase matchmaking_queue + matches tables and Realtime.
 */

import { supabase } from './supabaseClient';

const USER_REF_KEY = 'echoes-matchmaking-user-ref';

export function getOrCreateUserRef() {
  let ref = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_REF_KEY) : null;
  if (!ref) {
    ref = `anon-${crypto.randomUUID()}`;
    if (typeof localStorage !== 'undefined') localStorage.setItem(USER_REF_KEY, ref);
  }
  return ref;
}

/**
 * Join the matchmaking queue. Returns { ok: true } or { ok: false, error }.
 */
export async function joinQueue(displayName = null) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const userRef = getOrCreateUserRef();
  const { error } = await supabase.from('matchmaking_queue').insert({
    user_ref: userRef,
    display_name: displayName || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Leave the matchmaking queue (remove my row). Call if user cancels.
 */
export async function leaveQueue() {
  if (!supabase) return;
  const userRef = getOrCreateUserRef();
  await supabase.from('matchmaking_queue').delete().eq('user_ref', userRef);
}

/**
 * Subscribe to matches where I am player1 or player2.
 * Calls onMatch({ matchId, playerSlot: 1 | 2 }) when a match row appears.
 * Returns an unsubscribe function.
 */
export function subscribeToMatch(onMatch) {
  if (!supabase) return () => {};
  const userRef = getOrCreateUserRef();

  const channel = supabase
    .channel('my-matches')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'matches' },
      (payload) => {
        const row = payload.new;
        if (!row || (row.player1_ref !== userRef && row.player2_ref !== userRef)) return;
        const matchId = row.id;
        const playerSlot = row.player1_ref === userRef ? 1 : 2;
        onMatch({ matchId, playerSlot });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get current number of players in the matchmaking queue.
 */
export async function getQueueCount() {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}

/**
 * Leave the current match (mark as abandoned). Call then redirect to lobby.
 */
export async function leaveMatch(matchId) {
  if (!supabase || !matchId) return;
  await supabase.from('matches').update({ status: 'abandoned' }).eq('id', matchId);
}

/**
 * Check once if I'm already in a match (e.g. after page load).
 * Returns { matchId, playerSlot } or null.
 */
export async function getCurrentMatch() {
  if (!supabase) return null;
  const userRef = getOrCreateUserRef();
  const { data, error } = await supabase
    .from('matches')
    .select('id, player1_ref, player2_ref')
    .or(`player1_ref.eq.${userRef},player2_ref.eq.${userRef}`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    matchId: data.id,
    playerSlot: data.player1_ref === userRef ? 1 : 2,
  };
}
