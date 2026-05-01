import { useEffect } from 'react';
import './EvolveModal.css';

const EVOLVE_TEXT = `## How Evolving Works

Evolving combines two cards into one stronger **Evolved Form** card. You use two slots: **Target** and **Burn**.

## The Two Slots

- **Target (slot 1)**: The card whose **rarity** determines the evolved card's rank. This is the "base" card for the evolution.
- **Burn (slot 2)**: The card you **sacrifice**. It is consumed and its stats are added to the Target's stats.

Putting a card into a slot **costs evolution points equal to that card's play cost** (each time you place it). You can take a card back out of a slot to your hand with no cost. Cards can come **from your hand or from your field** (already in play).

## When Both Slots Are Filled

Click **Evolve**. Both cards are removed and you receive **one new Evolved Form card** in your hand.

## How Stats Get Increased

- **Power and Health**: The evolved card's **power** and **health** are the **sum** of the Target and Burn cards. So if Target has 2 Power and 3 Health, and Burn has 1 Power and 2 Health, the evolved card has **3 Power** and **5 Health**.
- **Rarity (rank)**: The evolved card's rarity goes **one step up** from the **Target** only: Tier 1 → Tier 2, Tier 2 → Tier 3, Tier 3 stays Tier 3.
- **Play cost**: **50%** chance the Burn card’s play cost is **added** to the Target’s, **50%** it is **subtracted**. The result is at least **1** Evolution to play.
- **Ability**: The evolved card **always** keeps the **Target**'s ability. There is also a **50% chance** to **add** the **Burn** card's ability as a second one (shown below the Target's, with both ability names joined). If the two abilities are identical, nothing extra is added. The Burn card always contributes power and health.

Evolving is how you turn weaker or duplicate cards into a single, stronger card for later turns.`;

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
