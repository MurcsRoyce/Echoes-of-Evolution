import CharacterCard from './CharacterCard';
import './OccupationDesignSheet.css';

/** Renders the full occupation design (theme, identity, base character cards). */
export default function OccupationDesignSheet({ design }) {
  if (!design) return null;

  const { name, icon, theme, strengths, weakness, riskAxis, quote, baseCharacters } = design;

  return (
    <div className="occupation-sheet">
      <header className="occupation-sheet__header">
        <h2 className="occupation-sheet__title">{icon ? `${icon} ` : ''}{name}</h2>
        <p className="occupation-sheet__subtitle">Occupation design — base character cards</p>
      </header>

      <div className="occupation-sheet__identity">
        <h3 className="occupation-sheet__section-title">Core identity</h3>
        <dl className="occupation-sheet__dl">
          <dt>Theme</dt>
          <dd>{theme}</dd>
          <dt>Strengths</dt>
          <dd>{strengths}</dd>
          <dt>Weakness</dt>
          <dd>{weakness}</dd>
          <dt>Risk axis</dt>
          <dd>{riskAxis}</dd>
        </dl>
        {quote && (
          <blockquote className="occupation-sheet__quote">{quote}</blockquote>
        )}
      </div>

      {baseCharacters && baseCharacters.length > 0 && (
        <div className="occupation-sheet__cards">
          <h3 className="occupation-sheet__section-title">Base character cards ({baseCharacters.length})</h3>
          <div className="occupation-sheet__grid">
            {baseCharacters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
