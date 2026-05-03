import BackOfCard from './BackOfCard';
import './BoardDeckPile.css';

/**
 * Deck visualization on the board (left of economy). Count may be null when hidden (e.g. online opponent).
 * @param {{ label: string, count: number | null, variant?: 'player' | 'opponent' }} props
 */
export default function BoardDeckPile({ label, count, variant = 'opponent' }) {
  const countLabel = count == null ? '?' : String(Math.max(0, Math.floor(count)));
  const aria =
    count == null
      ? `${label}: size hidden`
      : `${label}: ${countLabel} card${countLabel === '1' ? '' : 's'} remaining`;

  const rootClass =
    variant === 'player' ? 'board-deck-pile board-deck-pile--player' : 'board-deck-pile';

  return (
    <div className={rootClass} role="group" aria-label={aria}>
      <span className="board-deck-pile__label">{label}</span>
      <div className="board-deck-pile__visual">
        <BackOfCard compact />
        <span className="board-deck-pile__count" aria-hidden>
          {countLabel}
        </span>
      </div>
    </div>
  );
}
