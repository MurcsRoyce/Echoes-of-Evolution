/**
 * POLITICIAN — Full occupation design for Echoes of Evolution
 * Theme: Lead and decide. Influence, laws, and control.
 * Portrait images: public/images/politician/male/ and public/images/politician/female/
 * Naming: politician_common_{m|w}.png, politician_uncommon_{m|w}.png, politician_rare_{m|w}.png
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

export const POLITICIAN_DESIGN = {
  id: 'politician',
  name: 'Politician',
  icon: '🏛️',

  theme: 'Lead and decide. Influence, laws, and control.',
  strengths: 'Board manipulation, opponent taxation, synergistic scaling',
  weakness: 'Low combat stats, relies on having other characters',
  riskAxis: 'Public service vs. corrupt power',
  quote: 'Power is just the ability to write the rules.',

  baseCharacters: [
    character(
      'campaign-staff',
      'Campaign Staff',
      RARITY.BASIC,
      2,
      2,
      3,
      1,
      'Canvass',
      'When this character enters play, look at the top 2 cards of your deck. Put one in your hand and discard the other.',
      null,
      '/images/politician/male/politician_common_m.png'
    ),
    character(
      'local-representative',
      'Local Representative',
      RARITY.BASIC,
      2,
      2,
      1,
      3,
      'Filibuster',
      "While this character is in play, your opponent's characters cost 1 more evolution point to play.",
      null,
      '/images/politician/female/politician_common_w.png'
    ),
    character(
      'mayor',
      'Mayor',
      RARITY.ADVANCED,
      2,
      2,
      5,
      2,
      'Legislation',
      'Once per turn, you may pay 1 evolution point. If you do, choose a character; it cannot attack next turn.',
      null,
      '/images/politician/male/politician_uncommon_m.png'
    ),
    character(
      'senator',
      'Senator',
      RARITY.ADVANCED,
      2,
      4,
      2,
      2,
      'Veto',
      'When your opponent plays a card, you may discard 1 card to counter its "enter play" ability.',
      null,
      '/images/politician/female/politician_uncommon_w.png'
    ),
    character(
      'governor',
      'Governor',
      RARITY.RARE,
      2,
      6,
      6,
      7,
      'Executive Order',
      'At the start of your turn, gain 1 evolution point for each character you control.',
      null,
      '/images/politician/male/politician_rare_m.png'
    ),
    character(
      'president',
      'President',
      RARITY.RARE,
      2,
      7,
      7,
      5,
      'State of the Union',
      'When this character evolves, all your other characters gain +1 power and +1 health.',
      null,
      '/images/politician/female/politician_rare_w.png'
    ),
  ],
};


