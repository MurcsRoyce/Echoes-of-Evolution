import { EVOLUTION_COLORS } from '../data/colors';
import './ColorPalette.css';

export default function ColorPalette() {
  return (
    <div className="color-palette" aria-label="Evolutionary color system">
      {EVOLUTION_COLORS.map(({ id, name, hex, zodiacImage }) => (
        <div
          key={id}
          className="color-palette__swatch"
          title={name}
        >
          <div className="color-palette__icon-wrap">
            <img
              src={zodiacImage}
              alt=""
              className="color-palette__icon"
              aria-hidden
            />
            <span
              className="color-palette__dot"
              style={{ backgroundColor: hex }}
              aria-hidden
            />
          </div>
          <span className="color-palette__name">{name}</span>
        </div>
      ))}
    </div>
  );
}
