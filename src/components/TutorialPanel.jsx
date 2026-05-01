import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import './TutorialPanel.css';

function formatBody(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="tutorial-panel__strong">
        {chunk}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

export default function TutorialPanel({ stepIndex, onStepChange, onExit, playerDisplayName = '' }) {
  const safeIndex = Math.max(0, Math.min(stepIndex, TUTORIAL_STEPS.length - 1));
  const step = TUTORIAL_STEPS[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === TUTORIAL_STEPS.length - 1;

  const trimmedName = typeof playerDisplayName === 'string' ? playerDisplayName.trim() : '';
  const stepTitle =
    step.id === 'welcome' && trimmedName
      ? `Welcome, ${trimmedName}`
      : step.title;

  return (
    <div className="tutorial-panel" role="region" aria-label="Tutorial">
      <div className="tutorial-panel__header">
        <span className="tutorial-panel__badge">Tutorial</span>
        <span className="tutorial-panel__progress">
          Step {safeIndex + 1} / {TUTORIAL_STEPS.length}
        </span>
      </div>
      <h3 className="tutorial-panel__title">{stepTitle}</h3>
      <p className="tutorial-panel__body">{formatBody(step.body)}</p>
      <div className="tutorial-panel__actions">
        <button
          type="button"
          className="tutorial-panel__btn tutorial-panel__btn--ghost"
          onClick={() => onStepChange(safeIndex - 1)}
          disabled={isFirst}
        >
          Back
        </button>
        <button
          type="button"
          className="tutorial-panel__btn tutorial-panel__btn--primary"
          onClick={() => {
            if (isLast) onExit?.();
            else onStepChange(safeIndex + 1);
          }}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
