/**
 * Race cards — faction identity (planned: max health, max EP, starting shield).
 * Starter deck includes one of each; playing a race from hand replaces your race slot (like economy).
 */

export const RACE_CARD_IDS = ['sintari', 'titan', 'zion'];

function raceArtPath(id) {
  return `/images/race/r_${id}.png`;
}

function createRaceCard(id, name, playCost, effect, designRole) {
  return {
    id,
    name,
    playCost,
    effect,
    designRole,
    cardType: 'race',
    art: raceArtPath(id),
  };
}

export const RACE_CARDS = [
  createRaceCard(
    'sintari',
    'Sintari',
    2,
    'Swift builders and strikers. Planned: higher maximum evolution points; starting shield TBD.',
    'Design target: tempo and EP ceiling — field slot and rules not active yet.'
  ),
  createRaceCard(
    'titan',
    'Titan',
    4,
    'Heavy world-shapers. Planned: higher maximum health; starting shield TBD.',
    'Design target: durability — field slot and rules not active yet.'
  ),
  createRaceCard(
    'zion',
    'Zion',
    2,
    'Guardians of the sacred spark. Planned: higher starting shield; caps TBD.',
    'Design target: shield-first defense — field slot and rules not active yet.'
  ),
];

export function getRaceCardById(id) {
  return RACE_CARDS.find((c) => c.id === id) ?? null;
}

export function isRaceCard(card) {
  return Boolean(card && (card.cardType === 'race' || RACE_CARD_IDS.includes(card.id)));
}
