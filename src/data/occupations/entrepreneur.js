/**
 * ENTREPRENEUR — Full occupation design for Echoes of Evolution
 * Theme: Risk and build. Innovation, investment, compounding value.
 * No portrait images yet.
 */

import { RARITY } from './doctor';

const PLAY_COST_BY_RARITY = {
  [RARITY.BASIC]: 1,
  [RARITY.ADVANCED]: 3,
  [RARITY.RARE]: 5,
};

const character = (id, name, rarity, tier, energy, power, health, abilityName, abilityText, purpose = null, portrait = null) => ({
  id,
  name,
  rarity,
  tier,
  energy,
  power,
  health,
  abilityName,
  abilityText,
  purpose,
  playCost: PLAY_COST_BY_RARITY[rarity] ?? 1,
  portrait,
});

export const ENTREPRENEUR_DESIGN = {
  id: 'entrepreneur',
  name: 'Entrepreneur',
  icon: '🚀',

  theme: 'Risk and build. Innovation, investment, compounding value.',
  strengths: 'Ramping power, card cycling, economy synergy',
  weakness: 'Vulnerable to early aggression, requires setup time',
  riskAxis: 'Innovation vs. monopoly',
  quote: 'The best way to predict the future is to invent it.',

  baseCharacters: [
    character('founder', 'Founder', RARITY.BASIC, 3, 3, 3, 2, 'Seed Funding', 'When this character enters play, gain 2 evolution points.', null, null),
    character('freelancer', 'Freethinker', RARITY.BASIC, 3, 1, 3, 1, 'Gig Economy', 'When you play an economy card, this character gains +1 power until end of turn.', null, null),
    character('innovator', 'Innovator', RARITY.ADVANCED, 3, 5, 2, 5, 'Pivot', 'Once per turn, you may discard 1 card to gain 1 evolution point and draw 1 card.', null, null),
    character('venture-capitalist', 'Venture Capitalist', RARITY.ADVANCED, 3, 2, 3, 2, 'Series A', 'When a character you control evolves, gain 2 evolution points.', null, null),
    character('ceo', 'CEO', RARITY.RARE, 3, 7, 6, 7, 'Scale Up', 'At the end of your turn, if you have an economy card in play, draw 1 card.', null, null),
    character('industry-titan', 'Industry Titan', RARITY.RARE, 3, 6, 6, 5, 'Acquisition', 'When this character enters play, you may destroy an opponent\'s economy card.', null, null),
  ],
};


