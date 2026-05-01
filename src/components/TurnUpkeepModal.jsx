import { useEffect } from 'react';
import './TurnUpkeepModal.css';

export default function TurnUpkeepModal({ isOpen, onClose, lines }) {
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

  if (!isOpen || !lines?.length) return null;

  return (
    <div
      className="turn-upkeep-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="turn-upkeep-modal-title"
    >
      <div
        className="turn-upkeep-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="turn-upkeep-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="turn-upkeep-modal-title" className="turn-upkeep-modal__title">
          Turn upkeep
        </h2>
        <p className="turn-upkeep-modal__subtitle">
          Everything you just gained at the start of this turn (Evolution is capped at your maximum).
        </p>
        <ul className="turn-upkeep-modal__list">
          {lines.map((line, i) => (
            <li key={i} className="turn-upkeep-modal__item">
              {line}
            </li>
          ))}
        </ul>
        <button type="button" className="turn-upkeep-modal__ok" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
