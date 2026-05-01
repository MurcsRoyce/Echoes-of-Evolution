/**
 * Player-level damage: shield absorbs first, then health.
 * @param {number} health
 * @param {number} shield
 * @param {number} damage - positive amount
 * @returns {{ health: number, shield: number }}
 */
export function applyPlayerDamage(health, shield, damage) {
  const h = Math.max(0, Number(health) || 0);
  const s = Math.max(0, Number(shield) || 0);
  const d = Math.max(0, Number(damage) || 0);
  const absorbed = Math.min(s, d);
  const newShield = s - absorbed;
  const remaining = d - absorbed;
  const newHealth = Math.max(0, h - remaining);
  return { health: newHealth, shield: newShield };
}
