/**
 * JOURNALIST — Full occupation design for Echoes of Evolution
 * Theme: Expose and inform. Truth, investigation, whistleblowing.
 * Portrait images: public/images/journalist/male/ and public/images/journalist/female/
 * Same layout as Doctor: journalist_common_m.png, journalist_common_w.png, etc.
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

export const JOURNALIST_DESIGN = {
  id: 'journalist',
  name: 'Journalist',
  icon: '📰',

  theme: 'Expose and inform. Truth, investigation, whistleblowing.',
  strengths: 'Information gathering, hand disruption, neutralizing threats',
  weakness: 'Very fragile, low direct damage',
  riskAxis: 'Objective truth vs. sensationalism',
  quote: 'A well-timed question can destroy an empire faster than an army.',

  baseCharacters: [
    character(
      'blogger',
      'Blogger',
      RARITY.BASIC,
      2,
      3,
      1,
      1,
      'Gossip',
      'When this character enters play, look at a random card in your opponent\'s hand.',
      null,
      '/images/journalist/male/journalist_common_m.png'
    ),
    character(
      'reporter',
      'Reporter',
      RARITY.BASIC,
      2,
      3,
      2,
      2,
      'Interview',
      'When this character is defeated, draw 1 card.',
      null,
      '/images/journalist/female/journalist_common_w.png'
    ),
    character(
      'investigator',
      'Investigator',
      RARITY.ADVANCED,
      2,
      2,
      2,
      4,
      'Expose',
      'When this character enters play, reveal target opponent\'s face-down card or hand.',
      null,
      '/images/journalist/male/journalist_uncommon_m.png'
    ),
    character(
      'anchor',
      'News Anchor',
      RARITY.ADVANCED,
      2,
      5,
      2,
      3,
      'Broadcast',
      'At the start of your turn, if you have fewer cards in hand than your opponent, draw 1 card.',
      null,
      '/images/journalist/female/journalist_uncommon_w.png'
    ),
    character(
      'editor-in-chief',
      'Editor-in-Chief',
      RARITY.RARE,
      2,
      5,
      6,
      4,
      'Censorship',
      'Once per turn, you may pay 2 evolution points to negate an opponent\'s ability until end of turn.',
      null,
      '/images/journalist/male/journalist_rare_m.png'
    ),
    character(
      'whistleblower',
      'Whistleblower',
      RARITY.RARE,
      2,
      5,
      6,
      4,
      'Leak',
      'When this character enters play, force the opponent to discard 1 random card. You gain 2 evolution points.',
      null,
      '/images/journalist/female/journalist_rare_w.png'
    ),
  ],
};


