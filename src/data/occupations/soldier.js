/**
 * SOLDIER — Full occupation design for Echoes of Evolution
 * Theme: Serve and fight. Discipline, combat, sacrifice.
 * Portrait images: public/images/soldier/male/ and public/images/soldier/female/
 * (soldier_common_*.png, soldier_uncommon_*.png, soldier_rare_*.png)
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

export const SOLDIER_DESIGN = {
  id: 'soldier',
  name: 'Soldier',
  icon: '🎖️',

  theme: 'Serve and fight. Discipline, combat, sacrifice.',
  strengths: 'High power, attack synergy; Military Funding discounts your first character each turn',
  weakness: 'Vulnerable to removal, needs evolution points',
  riskAxis: 'Duty vs. survival',
  quote: 'Soldiers win battles. The rest is politics.',

  baseCharacters: [
    character(
      'recruit',
      'Recruit',
      RARITY.BASIC,
      3,
      1,
      2,
      3,
      'Drill',
      'When this character attacks, it has +1 power this turn.',
      null,
      '/images/soldier/male/soldier_common_m.png'
    ),
    character(
      'infantry',
      'Infantry',
      RARITY.BASIC,
      3,
      2,
      1,
      2,
      'Advance',
      'When this character enters play, deal 1 damage to the opponent.',
      null,
      '/images/soldier/female/soldier_common_w.png'
    ),
    character(
      'sergeant',
      'Sergeant',
      RARITY.ADVANCED,
      3,
      4,
      2,
      4,
      'Rally',
      'When you attack with 2+ Soldiers, deal 1 additional damage.',
      null,
      '/images/soldier/male/soldier_uncommon_m.png'
    ),
    character(
      'medic',
      'Combat Medic',
      RARITY.ADVANCED,
      3,
      2,
      5,
      2,
      'Triage',
      'When a friendly Soldier would be defeated, you may pay 1 evolution point to prevent it once.',
      null,
      '/images/soldier/female/soldier_uncommon_w.png'
    ),
    character(
      'captain',
      'Captain',
      RARITY.RARE,
      3,
      4,
      5,
      5,
      'Assault',
      'When this character attacks, all friendly Soldiers have +1 power until end of turn.',
      null,
      '/images/soldier/male/soldier_rare_m.png'
    ),
    character(
      'veteran',
      'Veteran',
      RARITY.RARE,
      3,
      7,
      6,
      4,
      'Veterancy',
      'This character can attack twice per turn. (Still only one attack phase.)',
      null,
      '/images/soldier/female/soldier_rare_w.png'
    ),
  ],
};


