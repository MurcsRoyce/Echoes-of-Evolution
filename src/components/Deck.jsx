import Card from './Card';
import './Deck.css';

export default function Deck({ count, onDraw, canDraw }) {
  return (
    <div className="deck">
      <div className="deck__pile" onClick={canDraw ? onDraw : undefined}>
        <Card faceDown />
      </div>
    </div>
  );
}
