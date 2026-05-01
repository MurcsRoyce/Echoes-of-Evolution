/**
 * POLICE OFFICER — Full occupation design for Echoes of Evolution
 * Theme: Enforce and protect. Control, arrest, order.
 * Portrait images: public/images/police/male/ and public/images/police/female/
 * Same layout: police_common_m.png, police_common_w.png, etc.
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

export const POLICE_OFFICER_DESIGN = {
  id: 'police-officer',
  name: 'Police Officer',
  icon: '🚓',

  theme: 'Enforce and protect. Control, arrest, order.',
  strengths: 'Damage prevention, lockdown, sturdy defenders',
  weakness: 'Slower pacing, easily outmaneuvered',
  riskAxis: 'Public safety vs. authoritarian control',
  quote: 'The rules only matter if someone is there to enforce them.',

  baseCharacters: [
    character(
      'rookie',
      'Rookie',
      RARITY.BASIC,
      2,
      1,
      1,
      3,
      'Patrol',
      'When this character defends, it gains +1 health.',
      null,
      '/images/police/male/police_common_m.png'
    ),
    character(
      'beat-cop',
      'Beat Cop',
      RARITY.BASIC,
      2,
      1,
      1,
      1,
      'Backup',
      'When you play another Police Officer, this character gains +1 power this turn.',
      null,
      '/images/police/female/police_common_w.png'
    ),
    character(
      'detective',
      'Detective',
      RARITY.ADVANCED,
      2,
      3,
      4,
      3,
      'Investigate',
      'When this character enters play, look at the top 3 cards of your deck. Put them back in any order.',
      null,
      '/images/police/male/police_uncommon_m.png'
    ),
    character(
      'sergeant-police',
      'Sergeant',
      RARITY.ADVANCED,
      2,
      3,
      2,
      4,
      'Barricade',
      'Opponent characters cannot attack your other characters with lower health than this one.',
      null,
      '/images/police/female/police_uncommon_w.png'
    ),
    character(
      'swat',
      'SWAT Specialist',
      RARITY.RARE,
      2,
      4,
      7,
      6,
      'Breach',
      'When this character attacks, ignore the target\'s abilities until end of turn.',
      null,
      '/images/police/male/police_rare_m.png'
    ),
    character(
      'police-chief',
      'Police Chief',
      RARITY.RARE,
      2,
      5,
      7,
      4,
      'Lockdown',
      'Once per turn, you may pay 2 evolution points to prevent target character from attacking next turn.',
      null,
      '/images/police/female/police_rare_w.png'
    ),
  ],
};


