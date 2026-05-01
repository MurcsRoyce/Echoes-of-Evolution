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
    },
    player2: {
      health: INITIAL_HEALTH,
      shield: 0,
      evolutionPoints: INITIAL_EP,
      field: [],
      economyField: [],
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
  await supabase
    .from('match_game_state')
    .upsert({ match_id: matchId, state, updated_at: new Date().toISOString() }, { onConflict: 'match_id' });
}

export function subscribeGameState(matchId, onUpdate) {
  if (!supabase || !matchId) return () => {};
  const channel = supabase
    .channel(`game-state-${matchId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'match_game_state', filter: `match_id=eq.${matchId}` },
      (payload) => {
        if (payload.new?.state) onUpdate(payload.new.state);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
