import './DiceTracks.css';

export default function DiceTracks({
  health,
  shield = 0,
  evolutionPoints,
  opponentHealth,
  opponentShield = null,
  opponentEvolutionPoints,
}) {
  return (
    <div className="dice-tracks">
      <div className="dice-tracks__row">
        <span className="dice-tracks__side-label">You</span>
        <span className="dice-tracks__stat dice-tracks__stat--health" title="Health">
          <span className="dice-tracks__icon" aria-hidden>❤</span>
          <span className="dice-tracks__value" aria-live="polite">{health}</span>
        </span>
        <span className="dice-tracks__stat dice-tracks__stat--shield" title="Shield (absorbs damage before health)">
          <span className="dice-tracks__icon" aria-hidden>🛡</span>
          <span className="dice-tracks__value" aria-live="polite">{shield}</span>
        </span>
        <span className="dice-tracks__stat dice-tracks__stat--ep" title="Evolution points">
          <span className="dice-tracks__icon" aria-hidden>◆</span>
          <span className="dice-tracks__value" aria-live="polite">{evolutionPoints}</span>
        </span>
      </div>
      <div className="dice-tracks__row dice-tracks__row--opponent">
        <span className="dice-tracks__side-label dice-tracks__side-label--opponent">Opponent</span>
        <span className="dice-tracks__stat dice-tracks__stat--health" title="Health">
          <span className="dice-tracks__icon" aria-hidden>❤</span>
          <span className="dice-tracks__value" aria-live="polite">{opponentHealth ?? '—'}</span>
        </span>
        <span className="dice-tracks__stat dice-tracks__stat--shield" title="Shield">
          <span className="dice-tracks__icon" aria-hidden>🛡</span>
          <span className="dice-tracks__value" aria-live="polite">{opponentShield ?? '—'}</span>
        </span>
        <span className="dice-tracks__stat dice-tracks__stat--ep" title="Evolution points">
          <span className="dice-tracks__icon" aria-hidden>◆</span>
          <span className="dice-tracks__value" aria-live="polite">{opponentEvolutionPoints ?? '—'}</span>
        </span>
      </div>
    </div>
  );
}
