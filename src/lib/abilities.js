import {
  DOCTOR_DESIGN,
  ENGINEER_DESIGN,
  FARMER_DESIGN,
  TEACHER_DESIGN,
  LAWYER_DESIGN,
  WORKER_DESIGN,
  SOLDIER_DESIGN,
  MERCHANT_DESIGN,
  BANKER_DESIGN,
  SCIENTIST_DESIGN,
  ARTIST_DESIGN,
  JOURNALIST_DESIGN,
  POLICE_OFFICER_DESIGN,
  POLITICIAN_DESIGN,
  ENTREPRENEUR_DESIGN
} from '../data/occupations';

const ALL_DESIGNS = [
  DOCTOR_DESIGN,
  ENGINEER_DESIGN,
  FARMER_DESIGN,
  TEACHER_DESIGN,
  LAWYER_DESIGN,
  WORKER_DESIGN,
  SOLDIER_DESIGN,
  MERCHANT_DESIGN,
  BANKER_DESIGN,
  SCIENTIST_DESIGN,
  ARTIST_DESIGN,
  JOURNALIST_DESIGN,
  POLICE_OFFICER_DESIGN,
  POLITICIAN_DESIGN,
  ENTREPRENEUR_DESIGN
];

// Helper to determine occupation of a card
export function getOccupationDesignId(card) {
  if (!card) return null;
  for (const design of ALL_DESIGNS) {
    if (design?.baseCharacters?.some((c) => c.id === card.id)) {
      return design.id;
    }
  }
  return null;
}

// Canonical lookup: given a card or id, return the base character
export function getCharacterDesignById(id) {
  if (!id) return null;
  for (const design of ALL_DESIGNS) {
    const found = design?.baseCharacters?.find((c) => c.id === id);
    if (found) return found;
    // If the card id is the occupation id (e.g. "teacher"), fall back to its first base character
    if (design.id === id && design.baseCharacters && design.baseCharacters.length > 0) {
      return design.baseCharacters[0];
    }
  }
  return null;
}

export function getCharacterFromCard(card) {
  if (!card) return null;
  return getCharacterDesignById(card.id);
}

export function getCardPower(card, field = []) {
  if (!card) return 0;

  // Prefer canonical character stats when available so the board matches the info popup
  const baseDesign = getCharacterFromCard(card);
  let basePower = baseDesign?.power;
  if (basePower == null) {
    basePower = card.power != null ? card.power : 0;
  }

  let bonusPower = 0;
  const occupation = getOccupationDesignId(card);
  
  // Foreman: Other Workers you control have +1 power.
  if (occupation === 'worker') {
    const foremanCount = field.filter(c => c.id === 'foreman' && c.instanceId !== card.instanceId).length;
    bonusPower += foremanCount; // +1 for each foreman? Or just +1 total? Usually they stack.
  }

  return basePower + bonusPower;
}

export function getCardHealth(card, field = []) {
  if (!card) return 0;

  // If this character has taken damage, use current health
  if (card.currentHealth !== undefined && card.currentHealth !== null) {
    return Math.max(0, card.currentHealth);
  }

  // Prefer canonical character stats when available so the board matches the info popup
  const baseDesign = getCharacterFromCard(card);
  let baseHealth = baseDesign?.health;
  if (baseHealth == null) {
    baseHealth = card.health != null ? card.health : 0;
  }

  let bonusHealth = 0;
  const occupation = getOccupationDesignId(card);

  // Professor: Your other Teacher characters have +1 Health.
  if (occupation === 'teacher') {
    const professorCount = field.filter(c => c.id === 'professor' && c.instanceId !== card.instanceId).length;
    bonusHealth += professorCount;
  }

  return baseHealth + bonusHealth;
}

/** Max health from design + bonuses (ignores currentHealth). Used for capping heals. */
export function getMaxHealth(card, field = []) {
  if (!card) return 0;
  const baseDesign = getCharacterFromCard(card);
  let baseHealth = baseDesign?.health;
  if (baseHealth == null) baseHealth = card.health != null ? card.health : 0;
  let bonus = 0;
  if (getOccupationDesignId(card) === 'teacher') {
    bonus = field.filter(c => c.id === 'professor' && c.instanceId !== card.instanceId).length;
  }
  return baseHealth + bonus;
}

export function getManualAbilityInfo(card) {
  if (!card) return null;
  switch (card.id) {
    case 'loan-officer': return { cost: 2, text: 'Draw 2 cards', needsDiscard: false };
    case 'shopkeeper': return { cost: 1, text: 'Draw 1 card', needsDiscard: false };
    case 'judge': return { cost: 2, text: 'Draw 2 cards', needsDiscard: false };
    case 'postdoc': return { cost: 0, text: 'Discard 1 card to draw 1 card', needsDiscard: 1 };
    case 'innovator': return { cost: 0, text: 'Discard 1 card to gain 1 EP and draw 1 card', needsDiscard: 1 };
    // We skip target-based ones for now to avoid complex UI changes, focusing on simple draw/ep ones
  }
  return null;
}

export function executeManualAbility(card, gameState) {
  const effects = {};
  let message = '';
  switch (card.id) {
    case 'loan-officer':
    case 'judge':
      effects.draw = 2;
      message = `${card.name}: Drew 2 cards!`;
      break;
    case 'shopkeeper':
      effects.draw = 1;
      message = `${card.name}: Drew 1 card!`;
      break;
    case 'postdoc':
      effects.draw = 1;
      message = 'Postdoc: Discarded 1 card and drew 1 card!';
      break;
    case 'innovator':
      effects.ep = 1;
      effects.draw = 1;
      message = 'Innovator: Discarded 1 card, gained 1 EP, and drew 1 card!';
      break;
  }
  return { effects, message };
}

export function executeStartOfTurnAbilities(gameState) {
  const { field, ep, epForThresholdAbilities } = gameState;
  const effects = { ep: 0, draw: 0 };
  let message = '';
  /** Analyst checks 5+ EP after this turn's automatic EP gain (+2, etc.). */
  const thresholdEp = epForThresholdAbilities != null ? epForThresholdAbilities : ep;

  for (const card of field) {
    if (card.id === 'analyst' && thresholdEp >= 5) {
      effects.draw += 1;
      message = 'Analyst: Drew 1 card!';
    }
    if (card.id === 'foreman-elite') {
      const workerCount = field.filter(c => getOccupationDesignId(c) === 'worker').length;
      if (workerCount >= 2) effects.ep += 1;
    }
    if (card.id === 'caravan-leader') {
      const merchantCount = field.filter(c => getOccupationDesignId(c) === 'merchant').length;
      if (merchantCount >= 2) effects.ep += 1;
    }
    if (card.id === 'governor') {
      effects.ep += field.length;
      message = `Governor: Gained ${field.length} EP!`;
    }
  }

  if (effects.ep === 0 && effects.draw === 0) return null;
  return { effects, message };
}

export function executeEndOfTurnAbilities(gameState) {
  const { field, ep, economyField } = gameState;
  const effects = { ep: 0, draw: 0, health: 0 };
  let message = '';

  for (const card of field) {
    if (card.id === 'branch-manager' && ep >= 10) {
      effects.ep += 2;
    }
    if (card.id === 'medical-intern') {
      effects.health += 1; // Simplified to player heal since no targeting
    }
    if (card.id === 'corporate-lawyer') {
      const otherLawyers = field.filter(c => getOccupationDesignId(c) === 'lawyer' && c.instanceId !== card.instanceId).length;
      if (otherLawyers > 0) effects.ep += 1;
    }
    if (card.id === 'merchant-prince') {
      effects.ep += economyField.length;
    }
    if (card.id === 'ceo' && economyField.length > 0) {
      effects.draw += 1;
    }
  }

  if (effects.ep === 0 && effects.draw === 0 && effects.health === 0) return null;
  return { effects, message };
}

/** If this card's enter-play effect requires targeting, returns { damage } or { heal, regenThisTurn }. No immediate effects. */
export function getEntersPlayTargetEffect(card) {
  if (!card) return null;
  switch (card.id) {
    case 'teller':
      return { damage: 3 };
    case 'clinical-specialist':
      return { heal: 2, regenThisTurn: true };
    default:
      return null;
  }
}

export function getEntersPlayEffects(card, gameState) {
  const { field, economyField } = gameState;
  const effects = {};
  let message = '';

  // Targeting handled via UI: teller (damage), clinical-specialist (heal + regen)
  if (card.id === 'teller' || card.id === 'clinical-specialist') {
    return null;
  }

  switch (card.id) {
    // Workers
    case 'laborer':
      effects.ep = 1;
      message = 'Laborer: Gained 1 Evolution Point!';
      break;
      
    // Merchant
    case 'peddler':
      effects.draw = 1;
      message = 'Peddler: Drew 1 card!';
      break;
      
    // Scientist
    case 'lab-assistant':
      effects.draw = 1;
      message = 'Lab Assistant: Drew 1 card!';
      break;
    case 'nobel-laureate':
      effects.draw = 3;
      message = 'Nobel Laureate: Drew 3 cards!';
      break;
      
    // Soldier
    case 'infantry':
      effects.oppHealth = -1;
      message = 'Infantry: Dealt 1 damage to opponent!';
      break;

    // Doctor
    case 'medical-intern': // Note: App.jsx had "medical-student", but id is likely medical-intern based on previous JSON
      effects.health = 1;
      message = 'Medical Intern: Gained 1 Health!';
      break;
    case 'general-practitioner':
      effects.health = 2;
      message = 'General Practitioner: Gained 2 Health!';
      break;
      
    // Teacher
    case 'student-teacher':
      effects.draw = 1;
      message = 'Student Teacher: Drew 1 card!';
      break;
    case 'department-head':
      // Draw a card for each other Teacher you control
      const otherTeachersCount = field.filter(c => getOccupationDesignId(c) === 'teacher' && c.instanceId !== card.instanceId).length;
      if (otherTeachersCount > 0) {
        effects.draw = otherTeachersCount;
        message = `Department Head: Drew ${otherTeachersCount} card(s)!`;
      }
      break;
    case 'principal':
      effects.draw = 2;
      effects.ep = 1;
      message = 'Principal: Drew 2 cards and gained 1 EP!';
      break;
      
    // Entrepreneur
    case 'founder':
      effects.ep = 2;
      message = 'Founder: Gained 2 Evolution Points!';
      break;
      
    // Farmer
    case 'village-farmhand':
      effects.ep = 1;
      message = 'Village Farmhand: Gained 1 Evolution Point!';
      break;
    case 'agro-innovator':
      const hasOtherFarmer = field.some(c => getOccupationDesignId(c) === 'farmer' && c.instanceId !== card.instanceId);
      if (hasOtherFarmer) {
        effects.ep = 2;
        message = 'Agro Innovator: Gained 2 Evolution Points!';
      }
      break;

    // Journalist
    case 'whistleblower':
      effects.opponentDiscardRandom = 1;
      effects.ep = 2;
      message = 'Whistleblower: Gained 2 EP (and opponent discards 1 card)!';
      break;
      
    // Lawyer
    case 'paralegal':
      // Scry 2, draw 1 is hard to implement without UI. We'll simplify to draw 1 for now.
      effects.draw = 1;
      message = 'Paralegal: Drew 1 card (from top 2)!';
      break;
    case 'prosecutor':
      // Deal 1 damage to target opponent character. Simplified to face damage if no UI.
      effects.oppHealth = -1;
      message = 'Prosecutor: Dealt 1 damage to opponent!';
      break;

    // Police
    case 'detective':
      // Look at top 3 cards, put back in any order. Needs UI.
      message = 'Detective: Investigated top 3 cards (UI pending).';
      break;
      
    // Politician
    case 'campaign-staff':
      // Draw 2 discard 1. We will draw 1 for simplicity until target UI.
      effects.draw = 1;
      message = 'Campaign Staff: Drew 1 card!';
      break;

    // Engineer
    case 'apprentice-engineer':
      // Look at top 2, put any on bottom.
      message = 'Apprentice Engineer: Planned next draws (UI pending).';
      break;
    case 'civil-engineer':
      // +2 HP to another friendly character. Needs target UI.
      break;
    case 'chief-engineer':
      // Draw 1, may discard 1 to gain +2 EP. 
      effects.draw = 1;
      // Note: Needs a way to optionally discard.
      message = 'Chief Engineer: Drew 1 card!';
      break;
  }
  
  if (Object.keys(effects).length > 0) {
    return { effects, message };
  }
  
  return null;
}

