/**
 * Economy cards – ongoing or once-per-turn effects.
 * Played to an economy zone (not the character field).
 */

/** Reactive Shield Mandate: shield refreshed each turn while this is your economy card. */
export const REACTIVE_SHIELD_MANDATE_ID = 'reactive-shield-mandate';
export const REACTIVE_SHIELD_AMOUNT = 5;

export const ECONOMY_CARD_IDS = [
  'national-infrastructure',
  'black-market-exchange',
  'military-funding-program',
  'universal-education-grant',
  'emergency-healthcare-act',
  'industrial-automation',
  REACTIVE_SHIELD_MANDATE_ID,
];

/** Economy image filenames use e_ prefix, e.g. e_national_infrastructure.png */
function economyImageFilename(id) {
  return `e_${id.replace(/-/g, '_')}.png`;
}

function createEconomyCard(id, name, playCost, effect, designRole, imageFilename = null) {
  return {
    id,
    name,
    playCost,
    effect,
    designRole,
    cardType: 'economy',
    art: `/images/economy/${imageFilename || economyImageFilename(id)}`,
  };
}

export const ECONOMY_CARDS = [
  createEconomyCard(
    'national-infrastructure',
    'National Infrastructure',
    3,
    'At the start of your turn, gain +1 Evolution.',
    'Baseline economy stabilizer. Good in every deck. Forces opponent to respect long games.'
  ),
  createEconomyCard(
    'black-market-exchange',
    'Black Market Exchange',
    1,
    'Once per turn, you may discard 1 card to gain +2 Evolution.',
    'High-risk, high-reward. Synergizes with draw-heavy decks. Very fragile by design.'
  ),
  createEconomyCard(
    'military-funding-program',
    'Military Funding Program',
    5,
    'The first character you play each turn costs 1 less Evolution.',
    'Tempo engine: your first unit each turn is cheaper. Strong in aggressive and wide boards.'
  ),
  createEconomyCard(
    'universal-education-grant',
    'Universal Education Grant',
    2,
    'The first time you evolve each turn, reduce that evolution cost by 1.',
    'Supports Teacher & Engineer decks. Smooths early evolutions. Encourages smart timing.'
  ),
  createEconomyCard(
    'emergency-healthcare-act',
    'Emergency Healthcare Act',
    4,
    'Once per turn, when you would take damage, you may reduce that damage by 1.',
    'Defensive pressure valve. Helps control decks survive aggression. Subtle but very strong over time.'
  ),
  createEconomyCard(
    'industrial-automation',
    'Industrial Automation',
    1,
    'Once per turn, when you play a card, you may refund 1 Evolution.',
    'Late-game engine. Extremely powerful if unanswered. Natural destroy-me target.'
  ),
  createEconomyCard(
    REACTIVE_SHIELD_MANDATE_ID,
    'Reactive Shield Mandate',
    4,
    `At the start of your turn, gain ${REACTIVE_SHIELD_AMOUNT} shield. When you take damage, your shield is depleted first; excess damage hits your health.`,
    'Stabilizes against aggression. Replaces itself in the EP curve as a mid-cost defensive anchor.'
  ),
];

export function getEconomyCardById(id) {
  return ECONOMY_CARDS.find((c) => c.id === id) ?? null;
}

export function isEconomyCard(card) {
  return card && (card.cardType === 'economy' || ECONOMY_CARD_IDS.includes(card.id));
}
