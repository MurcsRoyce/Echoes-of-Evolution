/**
 * SCIENTIST — Full occupation design for Echoes of Evolution
 * Theme: Discover and prove. Research, experimentation, truth.
 * Portrait images: public/images/scientist/male/ and public/images/scientist/female/
 * Naming: scientist_common_{m|w}.png, scientist_uncommon_{m|w}.png, scientist_rare_{m|w}.png
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

export const SCIENTIST_DESIGN = {
  id: 'scientist',
  name: 'Scientist',
  icon: '🔬',

  theme: 'Discover and prove. Research, experimentation, truth.',
  strengths: 'Card advantage, evolution synergy, control',
  weakness: 'Requires setup, fragile early',
  riskAxis: 'Ethics of research vs. progress at any cost',
  quote: 'Scientists change what\'s possible.',

  baseCharacters: [
    character(
      'lab-assistant',
      'Lab Assistant',
      RARITY.BASIC,
      3,
      3,
      1,
      1,
      'Notebook',
      'When this character enters play, draw 1 card.',
      null,
      '/images/scientist/male/scientist_common_m.png'
    ),
    character(
      'researcher',
      'Researcher',
      RARITY.BASIC,
      3,
      1,
      2,
      1,
      'Hypothesis',
      'When you evolve, draw 1 card.',
      null,
      '/images/scientist/female/scientist_common_w.png'
    ),
    character(
      'postdoc',
      'Postdoc',
      RARITY.ADVANCED,
      3,
      2,
      3,
      4,
      'Experiment',
      'Once per turn, you may discard 1 card to draw 1 card.',
      null,
      '/images/scientist/male/scientist_uncommon_m.png'
    ),
    character(
      'principal-investigator',
      'Principal Investigator',
      RARITY.ADVANCED,
      3,
      3,
      3,
      3,
      'Grant',
      'The first time you evolve each turn, it costs 1 less evolution point.',
      null,
      '/images/scientist/female/scientist_uncommon_w.png'
    ),
    character(
      'professor',
      'Professor',
      RARITY.RARE,
      3,
      5,
      4,
      7,
      'Peer Review',
      'When a character you control evolves, draw 2 cards.',
      null,
      '/images/scientist/male/scientist_rare_m.png'
    ),
    character(
      'nobel-laureate',
      'Nobel Laureate',
      RARITY.RARE,
      3,
      7,
      5,
      7,
      'Breakthrough',
      'When this character enters play or evolves, draw 3 cards.',
      null,
      '/images/scientist/female/scientist_rare_w.png'
    ),
  ],
};


