import { useEffect } from 'react';
import { getOccupationDesign } from '../data/occupations';
import { CARD_LIBRARY, TIERS } from '../data/cards';
import { getEconomyCardById } from '../data/economyCards';
import OccupationDesignSheet from './OccupationDesignSheet';
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

  const design = occupationId ? getOccupationDesign(occupationId) : null;
  const card = occupationId ? CARD_LIBRARY.find((c) => c.id === occupationId) : null;
  const economyCard = occupationId ? getEconomyCardById(occupationId) : null;
  const dialogLabel =
    design?.name ?? card?.name ?? economyCard?.name ?? 'Card info';

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
          {design ? (
            <OccupationDesignSheet design={design} />
          ) : economyCard ? (
            <div className="occupation-sheet occupation-sheet--simple">
              <header className="occupation-sheet__header">
                <h2 className="occupation-sheet__title">{economyCard.name}</h2>
                <p className="occupation-sheet__subtitle">
                  Economy card · Play cost ◆{economyCard.playCost}
                </p>
              </header>
              <p className="occupation-sheet__quote" style={{ margin: '0 0 12px' }}>
                {economyCard.effect}
              </p>
              {economyCard.designRole && (
                <p className="occupation-sheet__coming" style={{ fontStyle: 'italic', opacity: 0.9 }}>
                  {economyCard.designRole}
                </p>
              )}
            </div>
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
