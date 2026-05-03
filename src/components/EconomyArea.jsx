import EconomyCard from './EconomyCard';
import { isEvolvedCollectionCard } from '../lib/evolvedCollection';
import './EconomyArea.css';

export default function EconomyArea({
  cards,
  selectedId,
  onSelectCard,
  label = 'Economy',
  showHint = true,
  onSaveEvolvedCard,
}) {
  const list = Array.isArray(cards) ? cards : [];

  return (
    <div className="economy-area">
      <div className="economy-area__label">{label}</div>
      {showHint && (
        <p className="economy-area__hint">
          Only one economy card in play. Click to select for evolution (pay cost again).
        </p>
      )}
      <div className="economy-area__slots">
        {list.length === 0 ? (
          <div className="economy-area__slot">
            <div className="economy-area__empty" aria-hidden>
              <span className="economy-area__empty-text">{label}</span>
            </div>
          </div>
        ) : (
          list.map((card) => {
            const cardKey = card.instanceId || card.id;
            const isSelected = selectedId === cardKey;
            return (
              <div key={cardKey} className="economy-area__slot">
                <div
                  className={`economy-area__card-wrap ${isSelected ? 'economy-area__card-wrap--selected' : ''}`}
                  onClick={() => onSelectCard?.(card)}
                  onContextMenu={(e) => {
                    if (!onSaveEvolvedCard || !isEvolvedCollectionCard(card)) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onSaveEvolvedCard(card, { clientX: e.clientX, clientY: e.clientY });
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectCard?.(card)}
                  role={onSelectCard ? 'button' : undefined}
                  tabIndex={onSelectCard ? 0 : undefined}
                  title={onSelectCard ? 'Select to place in evolution slot (costs play cost again)' : undefined}
                >
                  <EconomyCard card={card} showCost compact />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
