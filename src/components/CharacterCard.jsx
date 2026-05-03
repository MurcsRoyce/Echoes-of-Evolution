import { useState, useEffect } from 'react';
import { getColorHex, getRankForColorId } from '../data/colors';
import { normalizeDeckRarity } from '../lib/deckRarity';
import './CharacterCard.css';

const DECK_RANK_LABEL = { basic: 'Basic', advanced: 'Advanced', rare: 'Rare' };

/** Build image src from path; encodes each segment so your exact filenames (e.g. with spaces) work. */
function portraitSrc(path) {
  if (!path) return '';
  const base = import.meta.env.BASE_URL ?? '';
  const baseNorm = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathNorm = path.startsWith('/') ? path.slice(1) : path;
  const encoded = pathNorm.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${baseNorm}/${encoded}`;
}

export default function CharacterCard({ character, compact }) {
  if (!character) return null;

  const { name, rarity, tier, power, health, abilityName, abilityText, playCost, portrait, evolution_color_id, isEvolved } = character;
  const src = portrait ? portraitSrc(portrait) : '';
  const [portraitError, setPortraitError] = useState(false);

  // Retry showing portrait when src changes (e.g. after images are added)
  useEffect(() => {
    setPortraitError(false);
  }, [src]);
  const deckRarity = normalizeDeckRarity(rarity, tier);
  const rankHex = evolution_color_id
    ? getColorHex(evolution_color_id)
    : deckRarity === 'rare'
      ? '#FDD835'
      : deckRarity === 'advanced'
        ? '#1E88E5'
        : '#E53935';

  const costValue = playCost ?? tier ?? 1;
  const attackValue = power ?? 0;
  const healthValue = health ?? 0;

  const rankLabel = isEvolved
    ? getRankForColorId(evolution_color_id) ?? rarity ?? 'Evolved'
    : DECK_RANK_LABEL[deckRarity] ?? rarity ?? 'Basic';

  return (
    <div
      className={`character-card character-card--${deckRarity} ${compact ? 'character-card--compact' : ''} ${isEvolved ? 'character-card--evolved' : ''}`}
      style={rankHex ? { '--tier-color': rankHex } : undefined}
    >
      <div className="character-card__top-right">
        <span className="character-card__cost" title="Play cost (Evolution)">
          <span className="character-card__cost-diamond" aria-hidden>◆</span>
          {costValue}
        </span>
        <span className="character-card__attack" title="Power (Attack)">
          <span className="character-card__attack-icon" aria-hidden>⚔️</span>
          {attackValue}
        </span>
        <span className="character-card__health" title="Health">
          <span className="character-card__health-icon" aria-hidden>🛡️</span>
          {healthValue}
        </span>
      </div>
      <div className="character-card__portrait">
        {portrait && !portraitError ? (
          <img
            key={src}
            src={src}
            alt=""
            onError={() => setPortraitError(true)}
          />
        ) : (
          <div className="character-card__portrait-placeholder" aria-hidden>
            <span className="character-card__portrait-placeholder-icon">◆</span>
          </div>
        )}
        {name && (
          <span className="character-card__portrait-type">{name}</span>
        )}
      </div>

      <div className="character-card__body">
        <span className="character-card__ability-name">{abilityName}</span>
        <p className="character-card__ability-text">{abilityText}</p>
      </div>
      <span
        className="character-card__rank-badge"
        title={isEvolved ? `Evolved — ${rankLabel} rank` : `Rank: ${rankLabel}`}
      >
        {rankLabel}
      </span>
    </div>
  );
}
