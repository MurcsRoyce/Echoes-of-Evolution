/**
 * WORKER — Full occupation design for Echoes of Evolution
 * Theme: Labor and produce. Foundation of economy and industry.
 * Portrait images: public/images/worker/male/ and public/images/worker/female/
 * Same layout as Doctor: worker_common_m.png, worker_common_w.png, etc.
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

export const WORKER_DESIGN = {
  id: 'worker',
  name: 'Worker',
  icon: '👷',

  theme: 'Labor and produce. Foundation of economy and industry.',
  strengths: 'Reliable stats, economy synergy, board presence',
  weakness: 'Low individual impact, needs support',
  riskAxis: 'Exploitation vs. fair labor',
  quote: 'Workers build everything. One at a time.',

  baseCharacters: [
    character(
      'laborer',
      'Laborer',
      RARITY.BASIC,
      1,
      2,
      1,
      3,
      'Overtime',
      'When this character enters play, gain 1 evolution point.',
      null,
      '/images/worker/male/worker_common_m.png'
    ),
    character(
      'craftsperson',
      'Craftsperson',
      RARITY.BASIC,
      1,
      2,
      2,
      1,
      'Craft',
      'When you play another Worker, gain 1 evolution point.',
      null,
      '/images/worker/female/worker_common_w.png'
    ),
    character(
      'foreman',
      'Foreman',
      RARITY.ADVANCED,
      1,
      5,
      5,
      3,
      'Supervise',
      'Other Workers you control have +1 power.',
      null,
      '/images/worker/male/worker_uncommon_m.png'
    ),
    character(
      'mechanic',
      'Mechanic',
      RARITY.ADVANCED,
      1,
      3,
      3,
      2,
      'Repair',
      'When this character survives damage, gain 1 evolution point.',
      null,
      '/images/worker/female/worker_uncommon_w.png'
    ),
    character(
      'foreman-elite',
      'Senior Foreman',
      RARITY.RARE,
      1,
      4,
      6,
      5,
      'Efficiency',
      'At the start of your turn, if you control 2+ Workers, gain 1 evolution point.',
      null,
      '/images/worker/male/worker_rare_m.png'
    ),
    character(
      'master-craftsperson',
      'Master Craftsperson',
      RARITY.RARE,
      1,
      4,
      7,
      6,
      'Legacy',
      'When this character evolves or is used in evolution, draw 1 card.',
      null,
      '/images/worker/female/worker_rare_w.png'
    ),
  ],
};


