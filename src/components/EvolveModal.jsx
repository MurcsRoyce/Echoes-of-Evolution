import { useEffect } from 'react';
import './EvolveModal.css';

const EVOLVE_TEXT = `## How Evolving Works

Evolving combines two cards into one stronger card. You use two slots: **Target** (first) and **Burn** (second). You can only combine **two occupations** or **two economy** cards — **not** a mix.

## The Two Slots

- **Target (slot 1)**: The **base** for names, portrait, and **which ability is always kept**. Its stats are combined with the Burn’s.
- **Burn (slot 2)**: **Sacrificed** when you evolve; its **power** and **health** are **added** to the Target’s.

Putting a card into a slot **costs evolution points equal to that card’s play cost**. If you control **Universal Education Grant**, the **first** slot placement each turn costs **1** fewer EP (that payment can reach **0**). You can remove a card from a slot before evolving: **the EP you paid is refunded**, and the card returns to **hand**, **field**, or **economy row** depending on where it came from. Cards can be placed from **hand**, **field**, or your **active economy row**.

## When Both Slots Are Filled

Click **Evolve**. Both cards are removed and you receive **one** new card in your hand.

## Occupations — stats and tier

- **Power and Health**: **Sum** of Target and Burn (e.g. 2+1 Power → **3**, 3+2 Health → **5**).
- **Tier (rarities)**: If **both** cards are **Tier 1**, the result is **Tier 2**. **Otherwise** the result is **Tier 3** (including Tier 2+Tier 2, Tier 3 mixes, etc.).
- **Play cost**: **50%** chance the Burn’s play cost is **added** to the Target’s, **50%** **subtracted**. Result is at least **1** EP to play the evolved card.
- **Ability**: The evolved card **always** keeps the **Target**’s ability. **50%** chance to **also** add the **Burn**’s ability (names joined with **·**). If both abilities are **identical**, nothing extra is added. The result also moves forward on the **evolution color** track (header palette).

## Economy cards

Two economy cards combine their **effect** text and use the same **50/50** play-cost add-or-subtract rule (minimum **1**).`;

function formatContent(text) {
  const lines = text.split('\n');
  const out = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('- **')) {
      if (!inList) { out.push('<ul>'); inList = true; }
      const content = line.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      out.push(`<li>${content}</li>`);
    } else if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p>${line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

export default function EvolveModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="evolve-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How evolving works"
    >
      <div className="evolve-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="evolve-modal__header">
          <h2 className="evolve-modal__title">Evolve</h2>
          <button type="button" className="evolve-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div
          className="evolve-modal__content"
          dangerouslySetInnerHTML={{ __html: formatContent(EVOLVE_TEXT) }}
        />
      </div>
    </div>
  );
}
