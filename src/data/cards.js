/**
 * Echoes of Evolution - Base occupation cards (Top 15)
 * Tiers support moral conflict, power struggles, economy, culture, and ethical evolution paths.
 */

export const TIERS = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

const createCard = (id, name, tier, flavor) => ({
  id,
  name,
  tier,
  flavor,
  playCost: Math.min(tier, 5),
});

export const CARD_LIBRARY = [
  // Tier 1 occupations
  createCard('doctor', 'Doctor', 1, 'Heal and protect.'),
  createCard('teacher', 'Teacher', 1, 'Guide and inspire.'),
  createCard('farmer', 'Farmer', 1, 'Feed and sustain.'),
  createCard('worker', 'Worker', 1, 'Labor and produce.'),
  createCard('artist', 'Artist', 1, 'Imagine and express.'),

  // Tier 2 occupations
  createCard('engineer', 'Engineer', 2, 'Build and solve.'),
  createCard('lawyer', 'Lawyer', 2, 'Argue and defend.'),
  createCard('police-officer', 'Police Officer', 2, 'Enforce and protect.'),
  createCard('politician', 'Politician', 2, 'Lead and decide.'),
  createCard('journalist', 'Journalist', 2, 'Expose and inform.'),

  // Tier 3 occupations
  createCard('soldier', 'Soldier', 3, 'Serve and fight.'),
  createCard('merchant', 'Merchant', 3, 'Trade and connect.'),
  createCard('banker', 'Banker', 3, 'Finance and grow.'),
  createCard('entrepreneur', 'Entrepreneur', 3, 'Risk and build.'),
  createCard('scientist', 'Scientist', 3, 'Discover and prove.'),
];
