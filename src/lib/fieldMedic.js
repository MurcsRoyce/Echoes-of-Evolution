import { applyPlayerDamage } from './playerDamage';

export const FIELD_MEDIC_CARD_ID = 'field-medic';

export function fieldHasFieldMedic(field) {
  return Array.isArray(field) && field.some((c) => c?.id === FIELD_MEDIC_CARD_ID);
}

/** If player HP decreased and Field Medic is in play, restore 1 HP (cap maxHealth). */
export function applyPlayerDamageWithFieldMedic(field, health, shield, damage, maxHealth) {
  const { health: hAfter, shield: sAfter } = applyPlayerDamage(health, shield, damage);
  if (!fieldHasFieldMedic(field) || hAfter >= health) {
    return { health: hAfter, shield: sAfter };
  }
  return { health: Math.min(hAfter + 1, maxHealth), shield: sAfter };
}
