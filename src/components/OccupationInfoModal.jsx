import { useEffect } from 'react';
import { getOccupationDesign } from '../data/occupations';
import { CARD_LIBRARY, TIERS } from '../data/cards';
import { getEconomyCardById } from '../data/economyCards';
import { getRaceCardById } from '../data/raceCards';
import OccupationDesignSheet from './OccupationDesignSheet';
import EconomyCard from './EconomyCard';
import RaceCard from './RaceCard';
import './OccupationInfoModal.css';

export default function OccupationInfoModal({ isOpen, onClose, occupationId }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const raceCard = occupationId ? getRaceCardById(occupationId) : null;
  const economyCard = occupationId && !raceCard ? getEconomyCardById(occupationId) : null;
  const design =
    occupationId && !economyCard && !raceCard ? getOccupationDesign(occupationId) : null;
  const card =
    occupationId && !economyCard && !raceCard
      ? CARD_LIBRARY.find((c) => c.id === occupationId)
      : null;
  const dialogLabel =
    raceCard?.name ?? economyCard?.name ?? design?.name ?? card?.name ?? 'Card info';

  return (
    <div
      className="occupation-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${dialogLabel} info`}
    >
      <div
        className="occupation-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="occupation-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="occupation-modal__content">
          {raceCard ? (
            <div className="occupation-modal__economy">
              <RaceCard card={raceCard} />
              {raceCard.designRole && (
                <p className="occupation-modal__economy-role">{raceCard.designRole}</p>
              )}
              <p className="occupation-modal__economy-role" style={{ marginTop: 8, opacity: 0.85 }}>
                Race field slot and in-match rules are not enabled yet — browse only.
              </p>
            </div>
          ) : economyCard ? (
            <div className="occupation-modal__economy">
              <EconomyCard card={economyCard} />
              {economyCard.designRole && (
                <p className="occupation-modal__economy-role">{economyCard.designRole}</p>
              )}
            </div>
          ) : design ? (
            <OccupationDesignSheet design={design} />
          ) : card ? (
            <div className="occupation-sheet occupation-sheet--simple">
              <header className="occupation-sheet__header">
                <h2 className="occupation-sheet__title">{card.name}</h2>
                <p className="occupation-sheet__subtitle">
                  {TIERS[card.tier] ?? `Tier ${card.tier}`}
                </p>
              </header>
              {card.flavor && (
                <p className="occupation-sheet__quote" style={{ fontStyle: 'italic', margin: 0 }}>
                  {card.flavor}
                </p>
              )}
              <p className="occupation-sheet__coming">Full design coming soon.</p>
            </div>
          ) : (
            <p className="occupation-modal__empty">Select a card from the card set.</p>
          )}
        </div>
      </div>
    </div>
  );
}
