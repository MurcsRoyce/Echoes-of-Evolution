/**
 * Match chat: send and subscribe to in-game messages per match.
 */

import { supabase } from './supabaseClient';

const MAX_MESSAGES = 100;

/**
 * Fetch recent messages for a match (newest first, then we reverse for display).
 */
export async function getMatchChat(matchId) {
  if (!supabase || !matchId) return [];
  const { data, error } = await supabase
    .from('match_chat')
    .select('id, match_id, player_slot, display_name, body, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(MAX_MESSAGES);
  if (error) return [];
  return (data ?? []).reverse();
}

/**
 * Send a message. displayName optional (e.g. from profile).
 */
export async function sendMatchMessage(matchId, playerSlot, body, displayName = null) {
  if (!supabase || !matchId || playerSlot == null || !body?.trim()) return { ok: false };
  const { error } = await supabase.from('match_chat').insert({
    match_id: matchId,
    player_slot: playerSlot,
    display_name: displayName || null,
    body: body.trim().slice(0, 500),
  });
  return { ok: !error };
}

/**
 * Subscribe to new messages for a match. onMessage(messages) is called with full list when new message arrives.
 */
export function subscribeMatchChat(matchId, onMessage) {
  if (!supabase || !matchId || !onMessage) return () => {};

  let messages = [];

  const load = async () => {
    const list = await getMatchChat(matchId);
    messages = list;
    onMessage([...messages]);
  };

  load();

  const channel = supabase
    .channel(`match-chat-${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'match_chat', filter: `match_id=eq.${matchId}` },
      async () => {
        const list = await getMatchChat(matchId);
        messages = list;
        onMessage([...messages]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
