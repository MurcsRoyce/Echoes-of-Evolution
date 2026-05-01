/**
 * ENGINEER — Full occupation design for Echoes of Evolution
 * Theme: Building, optimization, and reconfiguration of infrastructure.
 * Portrait images: public/images/engineer/male/ and public/images/engineer/female/
 * Same layout as Doctor: male/ engineer_common_m.png, engineer_uncommon_m.png, engineer_rare_m.png; female/ _w variants.
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

export const ENGINEER_DESIGN = {
  id: 'engineer',
  name: 'Engineer',
  icon: '🛠️',

  theme: 'Building, optimization, and reconfiguration of infrastructure',
  strengths: 'Board control, resource efficiency, combo setups',
  weakness: 'Needs setup time, many effects are delayed or conditional',
  riskAxis: 'Over-engineering vs. cutting corners',
  quote: 'Engineers win by turning small advantages into unbreakable systems.',

  baseCharacters: [
    character(
      'apprentice-engineer',
      'Apprentice Engineer',
      RARITY.BASIC,
      2,
      3,
      1,
      3,
      'Measure Twice',
      'When this character enters play, look at the top 2 cards of your deck. You may put any number of them on the bottom.',
      'Learns how to plan and avoid bad draws.',
      '/images/engineer/male/engineer_common_m.png'
    ),
    character(
      'field-technician',
      'Field Technician',
      RARITY.BASIC,
      2,
      3,
      3,
      3,
      'Patch Job',
      'At the end of your turn, you may heal 1 HP to a structure or machine character.',
      'Keeps your frontline infrastructure standing.',
      '/images/engineer/female/engineer_common_w.png'
    ),
    character(
      'civil-engineer',
      'Civil Engineer',
      RARITY.ADVANCED,
      2,
      4,
      3,
      4,
      'Reinforce',
      'When this character enters play, give another friendly character +2 HP this turn.',
      'Shifts combat math in your favor for a key turn.',
      '/images/engineer/male/engineer_uncommon_m.png'
    ),
    character(
      'mechanical-engineer',
      'Mechanical Engineer',
      RARITY.ADVANCED,
      2,
      5,
      2,
      4,
      'Overclock',
      'Once per turn, you may pay 1 evolution point: a friendly character gains +1 Power this turn.',
      'Trades resources to push damage at the right moment.',
      '/images/engineer/female/engineer_uncommon_w.png'
    ),
    character(
      'systems-architect',
      'Systems Architect',
      RARITY.RARE,
      2,
      5,
      7,
      6,
      'Networked Design',
      'Your other Engineer characters cost 1 less evolution point to play (minimum 1).',
      'Makes your whole Engineer strategy more efficient.',
      '/images/engineer/male/engineer_rare_m.png'
    ),
    character(
      'chief-engineer',
      'Chief Engineer',
      RARITY.RARE,
      2,
      4,
      6,
      6,
      'Redesign the Blueprint',
      'When this character enters play, draw 1 card. Then you may discard 1 card to gain +2 evolution points.',
      'Turns old plans into new resources when it matters most.',
      '/images/engineer/female/engineer_rare_w.png'
    ),
  ],
};



