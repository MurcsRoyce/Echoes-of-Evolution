import { supabase } from './supabaseClient';

/**
 * Reduce Supabase presence state to per-slot online flags and display names.
 * @param {Record<string, Array<Record<string, unknown>>>} presenceState
 * @returns {{ slots: Record<1|2, { online: boolean, displayName: string }>, onlineCount: number }}
 */
export function parseMatchPresenceState(presenceState) {
  const slots = {
    1: { online: false, displayName: '' },
    2: { online: false, displayName: '' },
  };
  if (!presenceState || typeof presenceState !== 'object') {
    return { slots, onlineCount: 0 };
  }
  for (const entries of Object.values(presenceState)) {
    if (!Array.isArray(entries)) continue;
    for (const row of entries) {
      const slot = row?.player_slot;
      if (slot !== 1 && slot !== 2) continue;
      slots[slot].online = true;
      const dn = row.display_name;
      if (typeof dn === 'string' && dn.trim()) slots[slot].displayName = dn.trim();
    }
  }
  const onlineCount = (slots[1].online ? 1 : 0) + (slots[2].online ? 1 : 0);
  return { slots, onlineCount };
}

/**
 * Subscribe to match-scoped presence (who has the game open in this match).
 * @param {string} matchId
 * @param {{ playerSlot: 1|2, displayName?: string }} payload
 * @param {(summary: ReturnType<typeof parseMatchPresenceState>) => void} onUpdate
 * @returns {() => void} unsubscribe
 */
export function subscribeMatchPresence(matchId, { playerSlot, displayName = '' }, onUpdate) {
  if (!supabase || !matchId || playerSlot == null) {
    onUpdate(parseMatchPresenceState({}));
    return () => {};
  }

  const presenceKey =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const channel = supabase.channel(`match-presence:${matchId}`, {
    config: { presence: { key: presenceKey } },
  });

  const flush = () => {
    try {
      const state = channel.presenceState();
      onUpdate(parseMatchPresenceState(state));
    } catch {
      onUpdate(parseMatchPresenceState({}));
    }
  };

  channel
    .on('presence', { event: 'sync' }, flush)
    .on('presence', { event: 'join' }, flush)
    .on('presence', { event: 'leave' }, flush)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          player_slot: playerSlot,
          display_name: displayName,
          online_at: new Date().toISOString(),
        });
        flush();
      }
    });

  return () => {
    try {
      void channel.untrack();
    } catch {
      /* ignore */
    }
    supabase.removeChannel(channel);
  };
}
