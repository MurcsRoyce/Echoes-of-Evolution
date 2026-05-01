import { useMemo, useEffect } from 'react';
import {
  DOCTOR_DESIGN,
  ENGINEER_DESIGN,
  FARMER_DESIGN,
  TEACHER_DESIGN,
  LAWYER_DESIGN,
  WORKER_DESIGN,
  SOLDIER_DESIGN,
  MERCHANT_DESIGN,
  BANKER_DESIGN,
  SCIENTIST_DESIGN,
  ARTIST_DESIGN,
  JOURNALIST_DESIGN,
  POLICE_OFFICER_DESIGN,
  POLITICIAN_DESIGN,
  ENTREPRENEUR_DESIGN,
  RARITY,
} from '../data/occupations';
import { normalizeDeckRarity } from '../lib/deckRarity';
import './AbilitiesModal.css';

const ALL_DESIGNS = [
  DOCTOR_DESIGN,
  ENGINEER_DESIGN,
  FARMER_DESIGN,
  TEACHER_DESIGN,
  LAWYER_DESIGN,
  WORKER_DESIGN,
  SOLDIER_DESIGN,
  MERCHANT_DESIGN,
  BANKER_DESIGN,
  SCIENTIST_DESIGN,
  ARTIST_DESIGN,
  JOURNALIST_DESIGN,
  POLICE_OFFICER_DESIGN,
  POLITICIAN_DESIGN,
  ENTREPRENEUR_DESIGN,
];

const rarityClass = (rarity) => {
  const n = normalizeDeckRarity(rarity);
  if (n === 'rare') return 'abilities-modal__row--rare';
  if (n === 'advanced') return 'abilities-modal__row--advanced';
  return 'abilities-modal__row--basic';
};

export default function AbilitiesModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const rows = useMemo(() => {
    const list = [];
    for (const design of ALL_DESIGNS) {
      if (!design?.baseCharacters) continue;
      for (const c of design.baseCharacters) {
        if (!c.abilityName && !c.abilityText) continue;
        list.push({
          id: c.id,
          name: c.name,
          rarity: c.rarity || RARITY.BASIC,
          occupationName: design.name,
          abilityName: c.abilityName || '',
          abilityText: c.abilityText || '',
        });
      }
    }
    // Sort by base tier (Tier 1, Tier 2, Tier 3), then occupation, then name
    const rarityOrder = { basic: 0, common: 0, advanced: 1, uncommon: 1, rare: 2 };
    list.sort((a, b) => {
      const ra = rarityOrder[normalizeDeckRarity(a.rarity)] ?? 0;
      const rb = rarityOrder[normalizeDeckRarity(b.rarity)] ?? 0;
      if (ra !== rb) return ra - rb;
      if (a.occupationName !== b.occupationName) return a.occupationName.localeCompare(b.occupationName);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="abilities-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Card abilities"
    >
      <div
        className="abilities-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="abilities-modal__header">
          <h2 className="abilities-modal__title">Abilities</h2>
          <button
            type="button"
            className="abilities-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="abilities-modal__legend">
          <span className="abilities-modal__legend-chip abilities-modal__legend-chip--basic">Tier 1</span>
          <span className="abilities-modal__legend-chip abilities-modal__legend-chip--advanced">Tier 2</span>
          <span className="abilities-modal__legend-chip abilities-modal__legend-chip--rare">Tier 3</span>
        </div>
        <div className="abilities-modal__content">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`abilities-modal__row ${rarityClass(row.rarity)}`}
            >
              <div className="abilities-modal__row-main">
                <span className="abilities-modal__name">
                  {row.name}
                  <span className="abilities-modal__occupation"> ({row.occupationName})</span>
                </span>
                <span className="abilities-modal__rarity">{row.rarity}</span>
              </div>
              <div className="abilities-modal__row-ability">
                <span className="abilities-modal__ability-name">{row.abilityName}</span>
                <span className="abilities-modal__ability-text">{row.abilityText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

