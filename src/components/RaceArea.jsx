import RaceCard from './RaceCard';
import './EconomyArea.css';

/** Single race slot (same footprint as economy browse card). Rules / play from hand not wired yet. */
export default function RaceArea({ cards, label = 'Race', showHint = true }) {
  const list = Array.isArray(cards) ? cards : [];

  return (
    <div className="economy-area economy-area--race-column">
      <div className="economy-area__label">{label}</div>
      {showHint && (
        <p className="economy-area__hint">
          One race in play when enabled. Slot is visible for layout; play rules coming later.
        </p>
      )}
      <div className="economy-area__slots">
        {list.length === 0 ? (
          <div className="economy-area__slot">
            <div className="economy-area__empty economy-area__empty--race" aria-hidden>
              <span className="economy-area__empty-text">{label}</span>
            </div>
          </div>
        ) : (
          list.map((card) => {
            const cardKey = card.instanceId || card.id;
            return (
              <div key={cardKey} className="economy-area__slot">
                <div className="economy-area__card-wrap">
                  <RaceCard card={card} showCost compact />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
