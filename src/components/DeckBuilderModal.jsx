import { useEffect, useState } from 'react';
import { isEconomyCard } from '../data/economyCards';
import { getCharacterFromCard } from '../lib/abilities';
import CharacterCard from './CharacterCard';
import EconomyCard from './EconomyCard';
import './DeckBuilderModal.css';

function formatSavedAt(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function buildDisplayCharacter(card) {
  if (!card || isEconomyCard(card)) return null;
  const baseCharacter = getCharacterFromCard(card);
  const isCharacterCard = card.abilityName != null || baseCharacter != null;
  if (baseCharacter) return { ...card, ...baseCharacter };
  if (isCharacterCard) return card;
  return null;
}

export default function DeckBuilderModal({ isOpen, onClose, entries }) {
  const [previewCard, setPreviewCard] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      const id = requestAnimationFrame(() => setPreviewCard(null));
      document.body.style.overflow = '';
      return () => cancelAnimationFrame(id);
    }

    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      if (previewCard) {
        setPreviewCard(null);
      } else {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, previewCard]);

  if (!isOpen) return null;

  const list = Array.isArray(entries)
    ? [...entries].sort((a, b) => {
        const ta = new Date(a?.savedAt || 0).getTime();
        const tb = new Date(b?.savedAt || 0).getTime();
        return tb - ta;
      })
    : [];

  const previewDisplayCharacter = previewCard ? buildDisplayCharacter(previewCard) : null;

  return (
    <>
      <div
        className="deck-builder-modal__backdrop"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-builder-title"
      >
        <div className="deck-builder-modal__panel" onClick={(e) => e.stopPropagation()}>
          <div className="deck-builder-modal__header">
            <h2 id="deck-builder-title" className="deck-builder-modal__title">
              Deck Builder
            </h2>
            <button type="button" className="deck-builder-modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="deck-builder-modal__content">
            <p className="deck-builder-modal__intro">
              Saved evolved cards appear here. Right-click an evolved card in your hand or on your field during a match,
              then choose <strong>Save to collection</strong>. Click a card for a larger preview. Full deck editing will
              come later.
            </p>
            <p className="deck-builder-modal__count">
              {list.length === 0 ? 'No saved cards yet.' : `${list.length} saved card${list.length === 1 ? '' : 's'}`}
            </p>
            {list.length > 0 && (
              <ul className="deck-builder-modal__grid">
                {list.map((entry) => {
                  const c = entry?.card;
                  if (!c) return null;
                  const name = c?.name ?? 'Saved card';
                  const displayCharacter = buildDisplayCharacter(c);
                  return (
                    <li key={entry.savedId} className="deck-builder-modal__grid-cell">
                      <button
                        type="button"
                        className="deck-builder-modal__grid-hit"
                        onClick={() => setPreviewCard(c)}
                        aria-label={`View full card: ${name}${entry.savedAt ? `, saved ${formatSavedAt(entry.savedAt)}` : ''}`}
                      >
                        {isEconomyCard(c) ? (
                          <EconomyCard card={c} showCost />
                        ) : displayCharacter ? (
                          <CharacterCard character={displayCharacter} />
                        ) : (
                          <div className="deck-builder-modal__grid-placeholder">
                            <span className="deck-builder-modal__grid-placeholder-name">{name}</span>
                            {entry.savedAt && (
                              <span className="deck-builder-modal__grid-placeholder-meta">{formatSavedAt(entry.savedAt)}</span>
                            )}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {previewCard && (
        <div
          className="deck-builder-modal__card-preview-backdrop"
          onClick={() => setPreviewCard(null)}
          role="presentation"
        >
          <div
            className="deck-builder-modal__card-preview-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={previewCard.name ? `Card: ${previewCard.name}` : 'Saved card'}
          >
            <div className="deck-builder-modal__card-preview-header">
              <h3 className="deck-builder-modal__card-preview-title">{previewCard.name ?? 'Card'}</h3>
              <button
                type="button"
                className="deck-builder-modal__card-preview-close"
                onClick={() => setPreviewCard(null)}
                aria-label="Close card preview"
              >
                ×
              </button>
            </div>
            <div className="deck-builder-modal__card-preview-body">
              {isEconomyCard(previewCard) ? (
                <EconomyCard card={previewCard} showCost />
              ) : previewDisplayCharacter ? (
                <CharacterCard character={previewDisplayCharacter} />
              ) : (
                <p className="deck-builder-modal__card-preview-fallback">Unable to render this card.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
