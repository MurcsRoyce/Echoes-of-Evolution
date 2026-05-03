import Card from './Card';
import CharacterCard from './CharacterCard';
import { getCardPower, getCardHealth, getCharacterFromCard } from '../lib/abilities';
import { isEvolvedCollectionCard } from '../lib/evolvedCollection';
import './PlayArea.css';

export default function PlayArea({
  cards,
  selectedId,
  onSelectCard,
  label,
  emptyMessage,
  animatedCardId,
  attackSelectedIds = [],
  targetable = false,
  onSaveEvolvedCard,
}) {
  const hasCards = Array.isArray(cards) && cards.length > 0;
  const attackSet = new Set(Array.isArray(attackSelectedIds) ? attackSelectedIds : []);

  return (
    <div className={`play-area ${targetable ? 'play-area--targetable' : ''}`}>
      {label && <div className="play-area__label">{label}</div>}
      <div className="play-area__slots">
        {hasCards
          ? cards.map((card) => {
              const cardKey = card.instanceId || card.id;
              const isSelected = selectedId === cardKey;
              const justPlayed = animatedCardId === cardKey;
              const isAttackReady = attackSet.has(cardKey);

              const baseCharacter = getCharacterFromCard(card);
              const isCharacterCard = card.abilityName != null || baseCharacter != null;

              // Prefer canonical design stats/ability text, but preserve instance-specific props
              let displayCharacter = baseCharacter
                ? { ...card, ...baseCharacter }
                : isCharacterCard
                  ? card
                  : null;

              if (displayCharacter) {
                displayCharacter = {
                  ...displayCharacter,
                  power: getCardPower(card, cards),
                  health: getCardHealth(card, cards),
                };
              }

              if (displayCharacter) {
                return (
                  <div
                    key={cardKey}
                    className={`play-area__card-wrap ${isSelected ? 'play-area__card-wrap--selected' : ''} ${justPlayed ? 'play-area__card-wrap--just-played' : ''} ${isAttackReady ? 'play-area__card-wrap--attack-ready' : ''} ${targetable ? 'play-area__card-wrap--targetable' : ''}`}
                    onClick={() => onSelectCard?.(card)}
                    onContextMenu={(e) => {
                      if (!onSaveEvolvedCard || !isEvolvedCollectionCard(card)) return;
                      e.preventDefault();
                      e.stopPropagation();
                      onSaveEvolvedCard(card, { clientX: e.clientX, clientY: e.clientY });
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectCard?.(card)}
                  >
                    <CharacterCard character={displayCharacter} />
                  </div>
                );
              }

              return (
                <div
                  key={cardKey}
                  className={`play-area__card-wrap ${isSelected ? 'play-area__card-wrap--selected' : ''} ${isAttackReady ? 'play-area__card-wrap--attack-ready' : ''}`}
                  onClick={() => onSelectCard?.(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectCard?.(card)}
                >
                  <Card
                    card={card}
                    selected={isSelected}
                    onClick={() => {}}
                  />
                </div>
              );
            })
          : emptyMessage && (
              <div className="play-area__empty">{emptyMessage}</div>
            )}
      </div>
    </div>
  );
}
