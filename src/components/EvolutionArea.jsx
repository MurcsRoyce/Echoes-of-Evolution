import Card from './Card';
import CharacterCard from './CharacterCard';
import EconomyCard from './EconomyCard';
import { getCharacterFromCard } from '../lib/abilities';
import { isEconomyCard } from '../data/economyCards';
import { EVOLUTION_SOURCE } from '../lib/evolutionSlotMeta';
import './EvolutionArea.css';

const SLOT_COUNT = 2;
// Slot 0 = Target: card whose stats will carry over to the evolved result (later).
// Slot 1 = Burn: sacrifice card only; consumed for the evolution. Target gains burn's ability.

function SlotCard({ card }) {
  if (isEconomyCard(card)) {
    return (
      <div className="evolution-area__card-wrap">
        <EconomyCard card={card} compact showCost />
      </div>
    );
  }

  const baseCharacter = getCharacterFromCard(card);
  const isCharacterCard = card.abilityName != null || baseCharacter != null;
  const displayCharacter = baseCharacter
    ? { ...baseCharacter, ...card, playCost: card.playCost ?? baseCharacter.playCost }
    : isCharacterCard
      ? card
      : null;

  if (displayCharacter) {
    return (
      <div className="evolution-area__card-wrap">
        <CharacterCard character={displayCharacter} />
      </div>
    );
  }

  return <Card card={card} selected={false} onClick={undefined} />;
}

export default function EvolutionArea({
  slots,
  selectedHandId,
  selectedFieldId,
  selectedEconomyId,
  canAct,
  canAffordSlotCost,
  onPlaceInSlot,
  onReturnFromSlot,
  onEvolve,
}) {
  const slotsArray = Array.isArray(slots) ? slots : [];
  const padded = [...slotsArray];
  while (padded.length < SLOT_COUNT) padded.push(null);

  const hasCardSelected = Boolean(selectedHandId || selectedFieldId || selectedEconomyId);
  const isActive = hasCardSelected;
  const bothFilled = padded[0] != null && padded[1] != null;
  const sameType = bothFilled && (isEconomyCard(padded[0]) === isEconomyCard(padded[1]));
  const canEvolve = bothFilled && sameType;
  const canPlace = canAct && hasCardSelected && canAffordSlotCost;

  return (
    <div className={`evolution-area ${isActive ? 'evolution-area--active' : ''}`}>
      <div className="evolution-area__label">Evolution</div>
      <p className="evolution-area__hint">
        Placing a card costs its play cost in EP (first slot placement each turn can be −1 EP if you control Universal
        Education Grant). Returning a card refunds that EP—back to hand, field, or economy row.
      </p>
      <div className="evolution-area__slots">
        {padded.slice(0, SLOT_COUNT).map((card, index) => (
          <div key={index} className="evolution-area__slot">
            {card ? (
              <>
                <SlotCard card={card} />
                <div className="evolution-area__return-row">
                  {isEconomyCard(card) && card._evolutionSource === EVOLUTION_SOURCE.ECONOMY ? (
                    <button
                      type="button"
                      className="evolution-area__return"
                      onClick={() => onReturnFromSlot?.(index, 'economy')}
                      title="Refund evolution points and restore this economy card"
                    >
                      Return to economy
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="evolution-area__return"
                        onClick={() => onReturnFromSlot?.(index, 'hand')}
                        title="Refund evolution points and return this card to your hand"
                      >
                        Return to hand
                      </button>
                      {!isEconomyCard(card) && card._evolutionSource === EVOLUTION_SOURCE.FIELD && (
                        <button
                          type="button"
                          className="evolution-area__return evolution-area__return--field"
                          onClick={() => onReturnFromSlot?.(index, 'field')}
                          title="Refund evolution points and return this card to your field"
                        >
                          Return to field
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                className={`evolution-area__empty evolution-area__empty--${index === 0 ? 'target' : 'burn'}`}
                onClick={() => onPlaceInSlot?.(index)}
                disabled={!canPlace}
                title={
                  !hasCardSelected
                    ? 'Select a card in hand, on your field, or your economy row'
                    : !canAffordSlotCost
                      ? 'Not enough evolution points'
                      : 'Place selected card here (costs play cost)'
                }
              >
                <span className="evolution-area__empty-text">{index === 0 ? 'Target' : 'Burn'}</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`evolution-area__evolve-btn ${canEvolve && canAct ? 'evolution-area__evolve-btn--ready' : ''}`}
        onClick={canEvolve && canAct ? onEvolve : undefined}
        disabled={!canEvolve || !canAct}
        title={!canAct ? 'Start your turn first' : bothFilled && !sameType ? 'Economy and occupation cannot be combined — use two economy or two occupation cards' : canEvolve ? 'Evolve: both cards become one new card in your hand' : 'Add 2 cards to evolve'}
      >
        Evolve
      </button>
    </div>
  );
}
