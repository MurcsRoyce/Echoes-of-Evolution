const PREFIX = 'echoes_save_';

export function savePersistedGameState(matchId, playerSlot, state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PREFIX}${matchId}_${playerSlot}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function loadPersistedGameState(matchId, playerSlot) {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(`${PREFIX}${matchId}_${playerSlot}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}

export function clearPersistedGameState(matchId, playerSlot) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${PREFIX}${matchId}_${playerSlot}`);
  } catch (e) {
    console.error('Failed to clear state:', e);
  }
}
