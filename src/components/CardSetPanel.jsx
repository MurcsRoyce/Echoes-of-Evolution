import { useState, useEffect, useMemo } from 'react';
import { TIERS, CARD_LIBRARY } from '../data/cards';
import { ECONOMY_CARDS, isEconomyCard } from '../data/economyCards';
import { RACE_CARDS } from '../data/raceCards';
import { fetchCards } from '../lib/cardsDb';
import { getColorHex, getTierColorHex } from '../data/colors';
import './CardSetPanel.css';

export default function CardSetPanel({ onCardClick }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseLibraryById = useMemo(
    () => Object.fromEntries(CARD_LIBRARY.map((c) => [c.id, c])),
    []
  );
  const occupationCards = useMemo(() => {
    const source = cards.length > 0 ? cards : CARD_LIBRARY;
    return source
      .filter((c) => !isEconomyCard({ id: c.id }))
      .map((c) => {
        const base = baseLibraryById[c.id];
        // Keep server extras, but force canonical local tier/flavor for known occupations.
        if (!base) return c;
        return {
          ...c,
          tier: base.tier,
          flavor: c.flavor ?? base.flavor,
        };
      });
  }, [cards, baseLibraryById]);
  const listItems = useMemo(
    () => [
      ...occupationCards.map((card) => ({ kind: 'occupation', card })),
      ...ECONOMY_CARDS.map((card) => ({ kind: 'economy', card })),
      ...RACE_CARDS.map((card) => ({ kind: 'race', card })),
    ],
    [occupationCards]
  );

  const getBaseTierColor = (tier) => {
    if (tier === 1) return getTierColorHex(1); // red
    if (tier === 2) return getTierColorHex(2); // blue
    return getTierColorHex(3); // yellow (Tier 3+ clamp)
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCards();
        if (!cancelled) setCards(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="card-set-panel">
        <h2 className="card-set-panel__title">Card set</h2>
        <p className="card-set-panel__muted">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card-set-panel">
        <h2 className="card-set-panel__title">Card set</h2>
        <p className="card-set-panel__error">
          Could not load cards. Run the schema in Supabase and add VITE_SUPABASE_* to .env.local.
        </p>
        <p className="card-set-panel__muted">{error}</p>
      </section>
    );
  }

  return (
    <section className="card-set-panel">
      <h2 className="card-set-panel__title">Card set ({listItems.length})</h2>
      <ul className="card-set-panel__list">
        {listItems.map(({ kind, card }) => {
          const tierLabel =
            kind === 'economy'
              ? `Economy · ◆${card.playCost}`
              : kind === 'race'
                ? `Race · ◆${card.playCost ?? 0} · preview`
                : TIERS[card.tier] ?? (card.tier != null ? `Tier ${card.tier}` : '—');
          const flavor =
            kind === 'economy' || kind === 'race' ? card.effect : card.flavor;
          const nameColor =
            kind === 'economy'
              ? '#7cb342'
              : kind === 'race'
                ? '#c9b8ff'
                : getBaseTierColor(card.tier) ?? '#e8e0c8';
          return (
            <li
              key={`${kind}-${card.id}`}
              className="card-set-panel__item card-set-panel__item--clickable"
              onClick={() => onCardClick?.(card.id)}
              onKeyDown={(e) => e.key === 'Enter' && onCardClick?.(card.id)}
              role="button"
              tabIndex={0}
            >
              <span
                className="card-set-panel__color"
                style={{
                  background:
                    kind === 'occupation'
                      ? getBaseTierColor(card.tier)
                      : kind === 'economy'
                        ? 'linear-gradient(135deg, #2d4a3e 0%, #1a2e28 100%)'
                        : kind === 'race'
                          ? 'linear-gradient(135deg, #4a3568 0%, #2a1c3e 100%)'
                          : 'transparent',
                }}
                title={
                  kind === 'occupation'
                    ? `Tier ${card.tier ?? 1}`
                    : kind === 'economy'
                      ? 'Economy'
                      : kind === 'race'
                        ? 'Race (preview — not in play yet)'
                        : ''
                }
              />
              <span className="card-set-panel__name" style={{ color: nameColor }}>{card.name}</span>
              <span className="card-set-panel__tier">{tierLabel}</span>
              {flavor && <span className="card-set-panel__flavor">{flavor}</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
