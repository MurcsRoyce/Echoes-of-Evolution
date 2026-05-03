import Card from './Card';
import './Deck.css';

/** Sidebar deck pile (visual). Use the Draw button below it in `App` to draw. */
export default function Deck() {
  return (
    <div className="deck">
      <div className="deck__pile">
        <Card faceDown />
      </div>
    </div>
  );
}
