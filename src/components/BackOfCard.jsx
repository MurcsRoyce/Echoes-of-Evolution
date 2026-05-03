import { useState } from 'react';
import './BackOfCard.css';

/** Public asset: `public/images/BackOfCard.png` */
export const BACK_OF_CARD_IMAGE_PATH = '/images/BackOfCard.png';

function imageSrc(path) {
  if (!path) return '';
  const base = import.meta.env.BASE_URL ?? '';
  const baseNorm = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathNorm = path.startsWith('/') ? path.slice(1) : path;
  const encoded = pathNorm.split('/').map((s) => encodeURIComponent(s)).join('/');
  return `${baseNorm}/${encoded}`;
}

/**
 * Card-back art for deck piles on the board (not interactive by default).
 * @param {{ compact?: boolean, className?: string }} props
 */
export default function BackOfCard({ compact = true, className = '' }) {
  const src = imageSrc(BACK_OF_CARD_IMAGE_PATH);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`back-of-card ${compact ? 'back-of-card--compact' : ''} ${className}`.trim()}
      aria-hidden
    >
      {src && !imgError ? (
        <img
          className="back-of-card__img"
          src={src}
          alt=""
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="back-of-card__fallback" />
      )}
    </div>
  );
}
