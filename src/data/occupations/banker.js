/**
 * BANKER — Full occupation design for Echoes of Evolution
 * Theme: Finance and grow. Capital, interest, leverage.
 * Portrait images: public/images/banker/male/ and public/images/banker/female/
 * (banker_common_*.png, banker_uncommon_*.png, banker_rare_*.png)
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

export const BANKER_DESIGN = {
  id: 'banker',
  name: 'Banker',
  icon: '🏦',

  theme: 'Finance and grow. Capital, interest, leverage.',
  strengths: 'Evolution point acceleration, late-game scaling',
  weakness: 'Slow start, needs economy',
  riskAxis: 'Stability vs. speculation',
  quote: 'Bankers win when the game goes long.',

  baseCharacters: [
    character(
      'teller',
      'Teller',
      RARITY.BASIC,
      3,
      1,
      1,
      3,
      'Overdraft',
      'When this character enters play, deal 3 damage to target opponent character.',
      null,
      '/images/banker/male/banker_common_m.png'
    ),
    character(
      'analyst',
      'Analyst',
      RARITY.BASIC,
      3,
      2,
      2,
      2,
      'Forecast',
      'At the start of your turn, if you have 5+ evolution points, draw 1 card.',
      null,
      '/images/banker/female/banker_common_w.png'
    ),
    character(
      'loan-officer',
      'Loan Officer',
      RARITY.ADVANCED,
      3,
      3,
      3,
      3,
      'Credit',
      'Once per turn, you may spend 2 evolution points to draw 2 cards.',
      null,
      '/images/banker/male/banker_uncommon_m.png'
    ),
    character(
      'investment-banker',
      'Investment Banker',
      RARITY.ADVANCED,
      3,
      5,
      5,
      4,
      'Leverage',
      'When you gain evolution points (except start of turn), gain 1 more.',
      null,
      '/images/banker/female/banker_uncommon_w.png'
    ),
    character(
      'branch-manager',
      'Branch Manager',
      RARITY.RARE,
      3,
      5,
      6,
      5,
      'Interest',
      'At the end of your turn, if you have 10+ evolution points, gain 2.',
      null,
      '/images/banker/male/banker_rare_m.png'
    ),
    character(
      'chief-financial-officer',
      'Chief Financial Officer',
      RARITY.RARE,
      3,
      5,
      4,
      7,
      'Capital',
      'Your evolution point maximum is 25. When you would gain EP at max, draw 1 card instead.',
      null,
      '/images/banker/female/banker_rare_w.png'
    ),
  ],
};


