/**
 * Occupation base rarity uses Tier 1, Tier 2, Tier 3 labels.
 * Accepts legacy labels (Common, Uncommon) for persisted or external data.
 */

export function normalizeDeckRarity(rarity, tierForFallback = null) {
  const x = (rarity ?? '').toLowerCase();
  if (x === 'tier 3' || x === 'tier3' || x === 'rare') return 'rare';
  if (x === 'tier 2' || x === 'tier2' || x === 'advanced' || x === 'uncommon') return 'advanced';
  if (x === 'tier 1' || x === 'tier1' || x === 'basic' || x === 'common') return 'basic';
  if (tierForFallback != null) {
    return tierForFallback <= 1 ? 'basic' : tierForFallback <= 2 ? 'advanced' : 'rare';
  }
  return 'basic';
}

export function deckTierFromNormalizedRarity(normalized) {
  if (normalized === 'rare') return 3;
  if (normalized === 'advanced') return 2;
  return 1;
}
