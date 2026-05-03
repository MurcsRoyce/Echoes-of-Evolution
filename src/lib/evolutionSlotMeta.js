/** Where the card was when placed into an evolution slot (for return + refund rules). */
export const EVOLUTION_SOURCE = {
  HAND: 'hand',
  FIELD: 'field',
  ECONOMY: 'economy',
};

export function stripEvolutionSlotMeta(card) {
  if (!card || typeof card !== 'object') return card;
  const {
    _evolutionSource: _s,
    _evolutionSlotCostPaid: _p,
    _evolutionEducationDiscount: _e,
    ...rest
  } = card;
  return rest;
}

/** EP refunded when returning a card from an evolution slot without evolving. */
export function getEvolutionSlotRefundAmount(card) {
  const paid = Number(card?._evolutionSlotCostPaid);
  if (Number.isFinite(paid) && paid >= 0) return paid;
  return Math.max(0, Number(card?.playCost) || 1);
}
