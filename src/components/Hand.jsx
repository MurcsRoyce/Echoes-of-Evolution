import Card from './Card';
import CharacterCard from './CharacterCard';
import EconomyCard from './EconomyCard';
import { isEconomyCard } from '../data/economyCards';
import { getCharacterFromCard } from '../lib/abilities';
import { isEvolvedCollectionCard } from '../lib/evolvedCollection';
import './Hand.css';

export default function Hand({ cards, selectedId, onSelectCard, onSaveEvolvedCard, disabled }) {
  return (
    <div className={`hand ${disabled ? 'hand--disabled' : ''}`}>
      <div className="hand__label">Hand</div>
      <div className="hand__cards">
        {cards.map((card) => {
          const key = card.instanceId || card.id;
          const isSelected = selectedId === key;

          if (isEconomyCard(card)) {
            return (
              <div
                key={key}
                className={`hand__card-wrap ${isSelected ? 'hand__card-wrap--selected' : ''}`}
                onClick={() => !disabled && onSelectCard?.(card)}
                onContextMenu={(e) => {
                  if (!onSaveEvolvedCard || !isEvolvedCollectionCard(card)) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSaveEvolvedCard(card, { clientX: e.clientX, clientY: e.clientY });
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => !disabled && e.key === 'Enter' && onSelectCard?.(card)}
              >
                <EconomyCard card={card} showCost />
              </div>
            );
          }

          const baseCharacter = getCharacterFromCard(card);
          const isCharacterCard = card.abilityName != null || baseCharacter != null;

          // Prefer the canonical stats from the occupation design, but keep instance-specific props (like instanceId)
          const displayCharacter = baseCharacter
            ? { ...card, ...baseCharacter }
            : isCharacterCard
              ? card
              : null;

          if (displayCharacter) {
            return (
              <div
                key={key}
                className={`hand__card-wrap ${isSelected ? 'hand__card-wrap--selected' : ''}`}
                onClick={() => !disabled && onSelectCard?.(card)}
                onContextMenu={(e) => {
                  if (!onSaveEvolvedCard || !isEvolvedCollectionCard(card)) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSaveEvolvedCard(card, { clientX: e.clientX, clientY: e.clientY });
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => !disabled && e.key === 'Enter' && onSelectCard?.(card)}
              >
                <CharacterCard character={displayCharacter} />
              </div>
            );
          }

          return (
            <Card
              key={key}
              card={card}
              selected={isSelected}
              onClick={disabled ? undefined : onSelectCard}
            />
          );
        })}
      </div>
    </div>
  );
}
