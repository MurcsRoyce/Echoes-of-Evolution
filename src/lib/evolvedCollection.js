import { isEconomyCard } from '../data/economyCards';

const STORAGE_KEY = 'echoes_saved_evolved_cards_v1';

/** True if this card can be stored in the saved-evolved collection (from evolution only). */
export function isEvolvedCollectionCard(card) {
  if (!card || typeof card !== 'object') return false;
  if (isEconomyCard(card)) {
    return typeof card.id === 'string' && card.id.startsWith('evolved-econ-');
  }
  return card.isEvolved === true;
}

/** Clone card for storage: strip transient combat flags. */
export function normalizeCardForStorage(card) {
  const raw = JSON.parse(JSON.stringify(card));
  delete raw.regeneratesThisTurn;
  delete raw.currentHealth;
  return raw;
}

/**
 * @returns {Array<{ savedId: string, savedAt: string, card: object }>}
 */
export function getSavedEvolvedCards() {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedEvolvedCards(list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota or private mode — ignore */
  }
}

/**
 * Save or replace an evolved card (same hand/field instanceId updates the entry).
 * @returns {{ ok: true }} | {{ ok: false, message: string }}
 */
export function addSavedEvolvedCard(card) {
  if (!isEvolvedCollectionCard(card)) {
    return { ok: false, message: 'Only evolved cards can be saved to your collection.' };
  }
  const normalized = normalizeCardForStorage(card);
  const instanceKey = normalized.instanceId || normalized.id;
  if (!instanceKey) {
    return { ok: false, message: 'This card has no id and cannot be saved.' };
  }

  const list = getSavedEvolvedCards();
  const nextEntry = {
    savedId: `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    savedAt: new Date().toISOString(),
    card: normalized,
  };

  const idx = list.findIndex((e) => {
    const c = e?.card;
    if (!c) return false;
    const k = c.instanceId || c.id;
    return k === instanceKey;
  });

  if (idx >= 0) {
    nextEntry.savedId = list[idx].savedId;
    list[idx] = nextEntry;
  } else {
    list.push(nextEntry);
  }

  writeSavedEvolvedCards(list);
  return { ok: true };
}
