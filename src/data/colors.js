/**
 * Echoes of Evolution – Evolutionary color system
 * 9 full-color variants for evolution paths, card variants, or factions.
 * Each color has a rank (Basic → Echo).
 */

const ZODIAC_BASE = '/images/zodiac_signs';

/** Rank order for display and evolution (low to high). */
export const COLOR_RANKS = [
  'Basic',
  'Advanced',
  'Rare',
  'Epic',
  'Special',
  'Mystic',
  'Supreme',
  'Transcendent',
  'Echo',
];

export const EVOLUTION_COLORS = [
  { id: 'red', name: 'Red', hex: '#E53935', symbol: '♥', rank: 'Basic', zodiacImage: `${ZODIAC_BASE}/Aries.png` },
  { id: 'blue', name: 'Blue', hex: '#1E88E5', symbol: '◆', rank: 'Advanced', zodiacImage: `${ZODIAC_BASE}/Taurus.png` },
  { id: 'yellow', name: 'Yellow', hex: '#FDD835', symbol: '★', rank: 'Rare', zodiacImage: `${ZODIAC_BASE}/Gemini.png` },
  { id: 'green', name: 'Green', hex: '#43A047', symbol: '▲', rank: 'Epic', zodiacImage: `${ZODIAC_BASE}/Cancer.png` },
  { id: 'orange', name: 'Orange', hex: '#FB8C00', symbol: '●', rank: 'Special', zodiacImage: `${ZODIAC_BASE}/Leo.png` },
  { id: 'purple', name: 'Purple', hex: '#8E24AA', symbol: '♦', rank: 'Mystic', zodiacImage: `${ZODIAC_BASE}/Virgo.png` },
  { id: 'amber', name: 'Amber', hex: '#FFB300', symbol: '◇', rank: 'Supreme', zodiacImage: `${ZODIAC_BASE}/Libra.png` },
  { id: 'teal', name: 'Teal', hex: '#00897B', symbol: '▼', rank: 'Transcendent', zodiacImage: `${ZODIAC_BASE}/Scorpio.png` },
  { id: 'magenta', name: 'Magenta', hex: '#D81B60', symbol: '♠', rank: 'Echo', zodiacImage: `${ZODIAC_BASE}/Sagittarius.png` },
];

/**
 * Evolution tier → border color. Tiers 1–6 are the standard track; 7–9 are extended evolution
 * (amber, teal, magenta) after purple.
 */
export const TIER_COLOR_IDS = {
  1: 'red',
  2: 'blue',
  3: 'yellow',
  4: 'green',
  5: 'orange',
  6: 'purple',
  7: 'amber',
  8: 'teal',
  9: 'magenta',
};

/** Reverse map: color id → evolution tier (1–9). */
export const COLOR_ID_TO_TIER = Object.fromEntries(
  Object.entries(TIER_COLOR_IDS).map(([t, id]) => [id, Number(t)])
);

export const EVOLUTION_ONLY_COLOR_IDS = ['amber', 'teal', 'magenta'];

export const getColorById = (id) => EVOLUTION_COLORS.find((c) => c.id === id) ?? null;
export const getColorHex = (id) => getColorById(id)?.hex ?? null;
/** Rank name for a color id (e.g. 'red' → 'Basic', 'green' → 'Epic'). */
export const getRankForColorId = (id) => getColorById(id)?.rank ?? null;

export const getTierColorId = (tier) => TIER_COLOR_IDS[tier] ?? null;
export const getTierColorHex = (tier) => getColorHex(TIER_COLOR_IDS[tier]);
/** Evolution tier (1–9) for a color id; null if unknown. */
export const getTierFromColorId = (id) => COLOR_ID_TO_TIER[id] ?? null;
