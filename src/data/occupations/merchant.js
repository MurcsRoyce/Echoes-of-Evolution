/**
 * MERCHANT — Full occupation design for Echoes of Evolution
 * Theme: Trade and connect. Deals, value, networks.
 * No portrait images yet.
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

export const MERCHANT_DESIGN = {
  id: 'merchant',
  name: 'Merchant',
  icon: '🏪',

  theme: 'Trade and connect. Deals, value, networks.',
  strengths: 'Card draw, evolution point generation, flexibility',
  weakness: 'Fragile, needs setup',
  riskAxis: 'Fair trade vs. exploitation',
  quote: 'Merchants don\'t fight. They make fighting expensive.',

  baseCharacters: [
    character('peddler', 'Peddler', RARITY.BASIC, 3, 2, 2, 1, 'Haggle', 'When this character enters play, draw 1 card.', null, null),
    character('trader', 'Trader', RARITY.BASIC, 3, 1, 3, 2, 'Barter', 'When you play an economy card, gain 1 evolution point.', null, null),
    character('shopkeeper', 'Shopkeeper', RARITY.ADVANCED, 3, 5, 2, 2, 'Inventory', 'Once per turn, you may pay 1 evolution point to draw 1 card.', null, null),
    character('caravan-leader', 'Caravan Leader', RARITY.ADVANCED, 3, 4, 4, 3, 'Trade Route', 'At the start of your turn, if you have 2+ Merchants, gain 1 evolution point.', null, null),
    character('guild-master', 'Guild Master', RARITY.RARE, 3, 7, 7, 7, 'Monopoly', 'When you play a card, you may refund 1 of its evolution cost.', null, null),
    character('merchant-prince', 'Merchant Prince', RARITY.RARE, 3, 4, 4, 6, 'Wealth', 'At the end of your turn, gain 1 evolution point for each economy card you control.', null, null),
  ],
};


