/**
 * Human-readable lines for the turn-upkeep popup (Start turn).
 */

export function buildTurnUpkeepLines({
  baseGain,
  hasNationalInfrastructure,
  hasReactiveShield,
  reactiveShieldAmount,
  startEffects,
  additionalEp,
  drawAmount,
}) {
  const lines = [];

  lines.push(`+${baseGain} Evolution — start of turn`);
  if (hasNationalInfrastructure) {
    lines.push('+1 Evolution — National Infrastructure');
  }
  if (startEffects?.message) {
    lines.push(startEffects.message);
  } else if (additionalEp > 0) {
    lines.push(`+${additionalEp} Evolution — abilities on your field`);
  }
  const messageCoversDraw =
    Boolean(startEffects?.message && /drew|draw/i.test(startEffects.message));
  if (drawAmount > 0 && !messageCoversDraw) {
    lines.push(`Drew ${drawAmount} card${drawAmount === 1 ? '' : 's'}`);
  }
  if (hasReactiveShield) {
    lines.push(`Shield → ${reactiveShieldAmount} (Reactive Shield Mandate)`);
  } else {
    lines.push('Shield → 0 (no Reactive Shield Mandate in economy slot)');
  }

  return lines;
}
