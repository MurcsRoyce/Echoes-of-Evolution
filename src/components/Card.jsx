import { TIERS } from '../data/cards';
import { getColorHex } from '../data/colors';
import './Card.css';

export default function Card({ card, onClick, selected, faceDown }) {
  if (!card) return null;

  if (faceDown) {
    return (
      <div className="card card--facedown" onClick={onClick}>
        <div className="card__back" />
      </div>
    );
  }

  const tierLabel = card.tier ? TIERS[card.tier] : null;
  // Only evolved cards get rank-colored border; set cards (basic/advanced/rare) keep default
  const rankHex = card.evolution_color_id ? getColorHex(card.evolution_color_id) : null;

  return (
    <div
      className={`card card--tier-${card.tier ?? 0} ${selected ? 'card--selected' : ''}`}
      style={rankHex ? { '--rank-color': rankHex } : undefined}
      onClick={() => onClick?.(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(card)}
    >
      <div className="card__name">{card.name}</div>
      {tierLabel && <span className="card__tier">{tierLabel}</span>}
      <p className="card__flavor">{card.flavor}</p>
    </div>
  );
}
