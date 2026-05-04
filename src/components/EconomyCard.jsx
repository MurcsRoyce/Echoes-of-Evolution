import { useState, useEffect } from 'react';
import './EconomyCard.css';

function artSrc(path) {
  if (!path) return '';
  const base = import.meta.env.BASE_URL ?? '';
  const baseNorm = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathNorm = path.startsWith('/') ? path.slice(1) : path;
  const encoded = pathNorm.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${baseNorm}/${encoded}`;
}

export default function EconomyCard({ card, compact, showCost = true, rootClassName = '' }) {
  const [artError, setArtError] = useState(false);
  useEffect(() => {
    setArtError(false);
  }, [card?.art]);

  if (!card) return null;
  const { name, playCost, effect, art } = card;
  const cost = playCost ?? 0;
  const src = art ? artSrc(art) : '';

  return (
    <div
      className={['economy-card', rootClassName, compact ? 'economy-card--compact' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {showCost && (
        <span className="economy-card__cost" title="Evolution cost">
          <span className="economy-card__cost-diamond" aria-hidden>◆</span>
          {cost}
        </span>
      )}
      <div className="economy-card__art" aria-hidden>
        {src && !artError && (
          <img
            src={src}
            alt=""
            onError={() => setArtError(true)}
          />
        )}
      </div>
      <div className="economy-card__footer">
        <span className="economy-card__name">{name}</span>
        <p className="economy-card__effect">{effect}</p>
      </div>
    </div>
  );
}
