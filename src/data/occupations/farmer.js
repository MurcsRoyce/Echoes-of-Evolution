/**
 * FARMER — Full occupation design for Echoes of Evolution
 * Theme: Food, land, and long-term sustainability.
 * Portrait images: public/images/farmer/male/ and public/images/farmer/female/
 * Same layout as Doctor: male/ 1.jpg,2.jpg,3.jpg = common,uncommon,rare; female/ same.
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

export const FARMER_DESIGN = {
  id: 'farmer',
  name: 'Farmer',
  icon: '🌾',

  theme: 'Food, land, and long-term sustainability',
  strengths: 'Resource generation, resilience, steady scaling over time',
  weakness: 'Slow start, vulnerable to fast aggressive strategies',
  riskAxis: 'Short-term exploitation vs. long-term stewardship',
  quote: 'Farmers win the games that go long — one harvest at a time.',

  baseCharacters: [
    character(
      'village-farmhand',
      'Village Farmhand',
      RARITY.BASIC,
      1,
      1,
      1,
      3,
      'Early Harvest',
      'When this character enters play, gain 1 evolution point.',
      'Represents the first hands in the soil.',
      '/images/farmer/male/farmer_common_m.png'
    ),
    character(
      'community-gardener',
      'Community Gardener',
      RARITY.BASIC,
      1,
      1,
      1,
      2,
      'Share the Yield',
      'At the end of your turn, you may heal 1 HP to another friendly character.',
      'Spreads small benefits to everyone nearby.',
      '/images/farmer/female/farmer_common_w.png'
    ),
    character(
      'irrigation-planner',
      'Irrigation Planner',
      RARITY.ADVANCED,
      1,
      4,
      3,
      4,
      'Channel Resources',
      'Once per turn, you may pay 1 evolution point: another friendly character gains +1 Energy this turn.',
      'Directs resources where they matter most.',
      '/images/farmer/male/farmer_uncommon_m.png'
    ),
    character(
      'soil-conservationist',
      'Soil Conservationist',
      RARITY.ADVANCED,
      1,
      3,
      3,
      2,
      'Protect the Ground',
      'Whenever a friendly character would take 2 or more damage at once, prevent 1 of that damage.',
      'Prevents your board from eroding too quickly.',
      '/images/farmer/female/farmer_uncommon_w.png'
    ),
    character(
      'agro-innovator',
      'Agro Innovator',
      RARITY.RARE,
      1,
      7,
      4,
      4,
      'Expanded Fields',
      'When this character enters play, gain 2 evolution points if you control another Farmer character.',
      'Turns a healthy board into an economic spike.',
      '/images/farmer/male/farmer_rare_m.png'
    ),
    character(
      'regional-steward',
      'Regional Steward',
      RARITY.RARE,
      1,
      6,
      5,
      5,
      'Secure the Harvest',
      'At the end of your turn, if you gained evolution points this turn, heal 2 HP to your leader.',
      'Rewards you for steady, ethical growth.',
      '/images/farmer/female/farmer_rare_w.png'
    ),
  ],
};



