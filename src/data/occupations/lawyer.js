/**
 * LAWYER — Full occupation design for Echoes of Evolution
 * Theme: Argue and defend. Rules, evidence, persuasion.
 * Portrait images: public/images/lawyer/male/ and public/images/lawyer/female/
 * Same layout as Doctor: lawyer_common_m.png, lawyer_common_w.png, etc.
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

export const LAWYER_DESIGN = {
  id: 'lawyer',
  name: 'Lawyer',
  icon: '⚖️',

  theme: 'Argue and defend. Rules, evidence, persuasion',
  strengths: 'Disruption, card advantage, control',
  weakness: 'Reactive, needs targets',
  riskAxis: 'Justice vs. winning at any cost',
  quote: 'Lawyers win by changing the rules of the fight.',

  baseCharacters: [
    character(
      'paralegal',
      'Paralegal',
      RARITY.BASIC,
      2,
      2,
      3,
      2,
      'Research',
      'When this character enters play, look at the top 2 cards of your deck. Put one into your hand.',
      null,
      '/images/lawyer/male/lawyer_common_m.png'
    ),
    character(
      'public-defender',
      'Public Defender',
      RARITY.BASIC,
      2,
      3,
      3,
      1,
      'Defense',
      'When a friendly character would be defeated, you may discard 1 card to prevent it once.',
      null,
      '/images/lawyer/female/lawyer_common_w.png'
    ),
    character(
      'prosecutor',
      'Prosecutor',
      RARITY.ADVANCED,
      2,
      5,
      2,
      3,
      'Cross-Examine',
      'When this character enters play, deal 1 damage to target opponent character.',
      null,
      '/images/lawyer/male/lawyer_uncommon_m.png'
    ),
    character(
      'corporate-lawyer',
      'Corporate Lawyer',
      RARITY.ADVANCED,
      2,
      5,
      3,
      2,
      'Contract',
      'At the end of your turn, gain 1 evolution point if you control another Lawyer.',
      null,
      '/images/lawyer/female/lawyer_uncommon_w.png'
    ),
    character(
      'trial-attorney',
      'Trial Attorney',
      RARITY.RARE,
      2,
      5,
      7,
      6,
      'Closing Argument',
      'When this character attacks or is used to deal damage, deal 1 additional damage.',
      null,
      '/images/lawyer/male/lawyer_rare_m.png'
    ),
    character(
      'judge',
      'Judge',
      RARITY.RARE,
      2,
      7,
      5,
      5,
      'Ruling',
      'Once per turn, you may pay 2 evolution points: draw 2 cards.',
      null,
      '/images/lawyer/female/lawyer_rare_w.png'
    ),
  ],
};


