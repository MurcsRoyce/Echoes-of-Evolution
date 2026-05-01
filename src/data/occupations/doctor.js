/**
 * DOCTOR — Full occupation design for Echoes of Evolution
 * Theme: Healing, ethics, life manipulation. Supports ethics, branching evolution, sacrifice, corruption, Apex power.
 * Portrait images: public/images/doctor/male/ and public/images/doctor/female/
 */

export const RARITY = {
  BASIC: 'Tier 1',
  ADVANCED: 'Tier 2',
  RARE: 'Tier 3',
};

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

export const DOCTOR_DESIGN = {
  id: 'doctor',
  name: 'Doctor',
  icon: '🩺',

  // Core Identity
  theme: 'Healing, ethics, life manipulation',
  strengths: 'Sustain, protection, reversal of damage',
  weakness: 'Low raw damage, vulnerable to disruption',
  riskAxis: 'Moral choices — save lives vs exploit biology',
  quote: 'Doctors rarely win fast. They win by outlasting, outsmarting, or reshaping the rules of survival.',

  // 6 Base Character Cards (early-to-mid game). Tier 1–5 = red, blue, yellow, green, orange.
  baseCharacters: [
    character(
      'medical-intern',
      'Medical Intern',
      RARITY.BASIC,
      1,
      3,
      3,
      1,
      'First Aid',
      'At end of your turn, heal 1 HP to any character.',
      'Early support, teaches healing identity.',
      '/images/doctor/male/doctor_common_m.png'
    ),
    character(
      'general-practitioner',
      'General Practitioner',
      RARITY.BASIC,
      1,
      3,
      3,
      3,
      'Routine Care',
      'When this character enters play, heal 2 HP.',
      null,
      '/images/doctor/female/doctor_common_w.png'
    ),
    character(
      'emergency-doctor',
      'Emergency Doctor',
      RARITY.ADVANCED,
      1,
      2,
      3,
      3,
      'Rapid Response',
      'Once per turn, when a character would be defeated, prevent it and reduce its HP to 1 instead.',
      'Powerful stall tool.',
      '/images/doctor/male/doctor_uncommon_m.png'
    ),
    character(
      'field-medic',
      'Field Medic',
      RARITY.ADVANCED,
      1,
      2,
      4,
      3,
      'Combat Triage',
      'Whenever you take damage, heal 1 health.',
      null,
      '/images/doctor/female/doctor_uncommon_w.png'
    ),
    character(
      'clinical-specialist',
      'Clinical Specialist',
      RARITY.RARE,
      1,
      6,
      6,
      7,
      'Targeted Treatment',
      'Choose a character. It gains +2 HP and Regenerate this turn.',
      null,
      '/images/doctor/male/doctor_rare_m.png'
    ),
    character(
      'senior-physician',
      'Senior Physician',
      RARITY.RARE,
      1,
      4,
      4,
      7,
      'Medical Authority',
      'Your healing effects heal +1 additional HP.',
      'This card becomes terrifying once evolved.',
      '/images/doctor/female/doctor_rare_w.png'
    ),
  ],
};


