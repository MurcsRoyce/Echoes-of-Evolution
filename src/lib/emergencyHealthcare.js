export const EMERGENCY_HEALTHCARE_ACT_ID = 'emergency-healthcare-act';

export function economyHasEmergencyHealthcareAct(economyField) {
  return Array.isArray(economyField) && economyField.some((c) => c?.id === EMERGENCY_HEALTHCARE_ACT_ID);
}

/**
 * Once per defender window (tracked separately), reduce incoming damage by 1 if the economy card is in play.
 * @param {number} damage - positive amount
 * @param {unknown[]} economyField
 * @param {boolean} alreadyUsedThisWindow
 * @returns {{ damage: number, consumedHealthcare: boolean }}
 */
export function resolveIncomingDamageWithEmergencyHealthcare(damage, economyField, alreadyUsedThisWindow) {
  const d = Math.max(0, Math.floor(Number(damage) || 0));
  if (d <= 0 || alreadyUsedThisWindow) return { damage: d, consumedHealthcare: false };
  if (!economyHasEmergencyHealthcareAct(economyField)) return { damage: d, consumedHealthcare: false };
  return { damage: Math.max(0, d - 1), consumedHealthcare: true };
}
