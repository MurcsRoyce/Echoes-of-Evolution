import { useEffect } from 'react';
import './RulesModal.css';

const RULES_TEXT = `## Core Game Rules

- **Starting Health**: Each player starts with **100 health**.
- **Starting Evolution Points**: Each player starts with **20 evolution points**.
- **Starting Hand Size**: On the **first turn only**, the player clicks **Start turn** then **Draw 4** to get their opening hand of 4 cards. Every turn after that, **Draw** gives 1 card (hand max 8). **You may only draw once per turn** — after you draw, the Draw button is disabled until your next turn.

## Card Play & Costs

- **Field Limit**: You may have at most **4 character cards** in your field at a time. You cannot play a character if your field is full. (Economy is separate — one economy card.)
- **Play Cost**: Each character card has a **play cost** shown in the **top-right corner** of the card.
- **Rarity and Cost**: **Higher rarity cards have higher play costs** (for example, Tier 3 cards cost more than Tier 1 cards).
- **Spending Evolution Points**: To play a card from your hand, you must **spend evolution points equal to its play cost**.

## Economy Cards

- You may only have **one Economy card** in play at a time. Playing a new Economy card replaces the old one.
- Economy cards provide passive or active benefits (like extra evolution points or drawing cards).

## Turn Structure

- **Start turn**: When it's your turn, you must click **Start turn** to begin. You gain **+2 evolution points** (capped at 20). Until you do, you can't draw or play cards.
- **End turn**: Click **End turn** when you're done. This passes the turn to the other player so they can take theirs.

## Combat

- Characters in play with a **power** number can attack the opponent.
- Click characters to select them for attack. You may attack with as many characters as you want at the same time.
- Click the **Attack** button to deal their combined power as damage to the opponent's health.
- You can only initiate an **attack once per turn**.

## Black Market

- If you control the **Black Market Exchange** economy card, **once per turn** you may **discard 1 card** from your hand to gain **+2 evolution points** (still capped at 20).

## Evolution

- **Evolution slots**: Two slots — **Target** (first) and **Burn** (second). Place from **your hand**, **your field**, or **your active economy row**. Each placement costs **evolution points equal to that card’s play cost**. If you control **Universal Education Grant**, the **first** slot placement each turn costs **1** fewer EP (that step can go to **0**).
- **Pairing**: Only **two occupation** cards or **two economy** cards can be evolved together (not a mix).
- **Returning cards**: Before you click **Evolve**, you can pull a card out of a slot; **the EP you paid to place it is refunded**. It goes back to **hand**, **field**, or **economy row** depending on where it came from.
- **Evolve**: When both slots hold a valid pair, click **Evolve**. Both cards are removed and you receive **one** new card in your hand.
- **Occupations**: **Power** and **health** are **added**. **Tier (rarities)**: if **both** cards are **Tier 1**, the result is **Tier 2**; **otherwise** the result is **Tier 3**. **Play cost**: **50%** chance the Burn’s play cost is **added** to the Target’s, **50%** **subtracted** (minimum **1**). The evolved card **keeps the Target’s ability**; **50%** chance to **also** add the Burn’s ability (skipped if the two abilities are identical). The card’s **evolution color / frame** advances on the track shown in the header.
- **Economy cards**: **Effect** text is **combined**. **Play cost** uses the same **50/50 add or subtract** rule (minimum **1**).

## Win Condition

- Reduce your opponent's **health to 0** to win.`;

function formatRules(text) {
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

export default function RulesModal({ isOpen, onClose }) {
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
      className="rules-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Game rules"
    >
      <div className="rules-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="rules-modal__header">
          <h2 className="rules-modal__title">Rules</h2>
          <button type="button" className="rules-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div
          className="rules-modal__content"
          dangerouslySetInnerHTML={{ __html: formatRules(RULES_TEXT) }}
        />
      </div>
    </div>
  );
}
