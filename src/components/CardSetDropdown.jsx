import { useState, useRef, useEffect } from 'react';
import CardSetPanel from './CardSetPanel';
import './CardSetDropdown.css';

export default function CardSetDropdown({ onCardClick }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCardClick = (id) => {
    onCardClick?.(id);
    setOpen(false);
  };

  return (
    <div className="card-set-dropdown" ref={containerRef}>
      <button
        type="button"
        className="card-set-dropdown__trigger app__settings-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open card set"
      >
        Card set
      </button>
      {open && (
        <div className="card-set-dropdown__panel" role="menu">
          <CardSetPanel onCardClick={handleCardClick} />
        </div>
      )}
    </div>
  );
}
