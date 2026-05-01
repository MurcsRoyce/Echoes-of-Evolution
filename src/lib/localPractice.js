/**
 * Offline practice modes: sandbox (test) and guided tutorial.
 * These do not sync to Supabase match state.
 */
export function isLocalPracticeMatch(matchId) {
  return matchId === 'test' || matchId === 'tutorial';
}
