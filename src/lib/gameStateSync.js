/**
 * Sync shared game meta: turn, health, EP, gameOver, and each player's field and economy.
 * Hand/deck stay local; field and economyField are synced so both players see opponent's board.
 */

import { supabase } from './supabaseClient';

const INITIAL_HEALTH = 100;
const INITIAL_EP = 20;

export function createInitialGameState() {
  return {
    turn: 1,
    gameOver: null,
    player1: {
      health: INITIAL_HEALTH,
      shield: 0,
      evolutionPoints: INITIAL_EP,
      field: [],
      economyField: [],
      usedEmergencyHealthcareActThisTurn: false,
    },
    player2: {
      health: INITIAL_HEALTH,
      shield: 0,
      evolutionPoints: INITIAL_EP,
      field: [],
      economyField: [],
      usedEmergencyHealthcareActThisTurn: false,
    },
  };
}

export async function getGameState(matchId) {
  if (!supabase || !matchId) return null;
  const { data, error } = await supabase
    .from('match_game_state')
    .select('state')
    .eq('match_id', matchId)
    .maybeSingle();
  if (error || !data) return null;
  return data.state;
}

export async function setGameState(matchId, state) {
  if (!supabase || !matchId) return;
  const { error } = await supabase
    .from('match_game_state')
    .upsert({ match_id: matchId, state, updated_at: new Date().toISOString() }, { onConflict: 'match_id' });
  if (error && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('[gameStateSync] setGameState failed:', error.message);
  }
}

/**
 * Load latest server state, merge synchronously, write back.
 * Prevents stale metaState from overwriting the opponent's recent moves.
 */
export async function mergeGameState(matchId, mergeFn) {
  if (!supabase || !matchId) return null;
  const latest = await getGameState(matchId);
  if (!latest) return null;
  const draft = JSON.parse(JSON.stringify(latest));
  const next = mergeFn(draft);
  if (next == null) return null;
  await setGameState(matchId, next);
  return next;
}

export function subscribeGameState(matchId, onUpdate) {
  if (!supabase || !matchId) return () => {};
  const filter = `match_id=eq.${matchId}`;
  const opts = { schema: 'public', table: 'match_game_state', filter };
  const handler = (payload) => {
    if (payload.new?.state) onUpdate(payload.new.state);
  };

  const channel = supabase
    .channel(`game-state-${matchId}`)
    .on('postgres_changes', { event: 'UPDATE', ...opts }, handler)
    // First upsert is often INSERT — UPDATE-only subscriptions miss it.
    .on('postgres_changes', { event: 'INSERT', ...opts }, handler)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
