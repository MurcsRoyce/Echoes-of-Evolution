import { useState, useEffect } from 'react';
import { subscribeMatchPresence, parseMatchPresenceState } from '../lib/matchPresence';
import { isLocalPracticeMatch } from '../lib/localPractice';
import { getCachedDisplayName, resolveDisplayNameForUi } from '../lib/profileDisplayName';
import './MatchPlayersOnline.css';

export default function MatchPlayersOnline({ matchId, playerSlot, isSyncedMatch }) {
  /** Same source as Profile / chat: cache + profiles row (auth users use user id as profile id). */
  const [myDisplayName, setMyDisplayName] = useState(() => getCachedDisplayName().trim());
  const [presence, setPresence] = useState(() => parseMatchPresenceState({}));

  useEffect(() => {
    let cancelled = false;
    void resolveDisplayNameForUi().then((n) => {
      if (cancelled) return;
      const t = (n ?? '').trim();
      if (t) setMyDisplayName(t);
    });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  useEffect(() => {
    if (!matchId || playerSlot == null) {
      setPresence(parseMatchPresenceState({}));
      return undefined;
    }
    if (!isSyncedMatch || isLocalPracticeMatch(matchId)) {
      const slots = {
        1: { online: playerSlot === 1, displayName: playerSlot === 1 ? myDisplayName : '' },
        2: { online: playerSlot === 2, displayName: playerSlot === 2 ? myDisplayName : '' },
      };
      setPresence({
        slots,
        onlineCount: 1,
      });
      return undefined;
    }

    const unsub = subscribeMatchPresence(
      matchId,
      { playerSlot, displayName: myDisplayName },
      setPresence
    );
    return unsub;
  }, [matchId, playerSlot, isSyncedMatch, myDisplayName]);

  if (!matchId) return null;

  const rows = [1, 2].map((slot) => {
    const row = presence.slots[slot];
    const isYou = playerSlot === slot;
    let nameLine = 'Offline';
    if (row.online) {
      if (isYou && myDisplayName) nameLine = myDisplayName;
      else if (row.displayName) nameLine = row.displayName;
      else if (isYou) nameLine = 'You';
      else nameLine = 'Connected';
    }
    return { slot, row, isYou, nameLine };
  });

  return (
    <section className="match-players-online" aria-label="Players in this match">
      <header className="match-players-online__header">
        <span className="match-players-online__title">Players online</span>
        <span className="match-players-online__count" aria-live="polite">
          {presence.onlineCount}
        </span>
      </header>
      <ul className="match-players-online__list">
        {rows.map(({ slot, row, isYou, nameLine }) => (
          <li key={slot} className={`match-players-online__row${isYou ? ' match-players-online__row--you' : ''}`}>
            <span
              className={`match-players-online__dot${row.online ? ' match-players-online__dot--on' : ''}`}
              title={row.online ? 'Online' : 'Offline'}
              aria-hidden
            />
            <div className="match-players-online__meta">
              <span className="match-players-online__slot">
                Player {slot}
                {isYou ? ' · You' : ''}
              </span>
              <span
                className={`match-players-online__name${!row.online ? ' match-players-online__name--off' : ''}`}
              >
                {nameLine}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
