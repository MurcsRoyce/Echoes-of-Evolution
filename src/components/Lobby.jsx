import { useState, useEffect } from 'react';
import { joinQueue, leaveQueue, subscribeToMatch, getQueueCount } from '../lib/matchmaking';
import { getCachedDisplayName } from '../lib/profileDisplayName';
import './Lobby.css';

export default function Lobby({ onMatchFound, onStartTutorial }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'finding' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [queueCount, setQueueCount] = useState(null);

  useEffect(() => {
    if (status !== 'finding') return;
    const unsubscribe = subscribeToMatch(({ matchId, playerSlot }) => {
      setStatus('idle');
      onMatchFound?.({ matchId, playerSlot });
    });
    return () => unsubscribe();
  }, [status, onMatchFound]);

  useEffect(() => {
    if (status !== 'finding') return;
    let cancelled = false;
    const poll = async () => {
      const count = await getQueueCount();
      if (!cancelled) setQueueCount(count);
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(id); };
  }, [status]);

  const handleJoinMatch = async () => {
    setErrorMessage(null);
    setStatus('finding');
    const result = await joinQueue(getCachedDisplayName() || null);
    if (!result.ok) {
      setStatus('error');
      setErrorMessage(result.error || 'Failed to join queue');
    }
  };

  const handleCancel = async () => {
    await leaveQueue();
    setStatus('idle');
    setErrorMessage(null);
  };

  return (
    <div className="lobby">
      <div className="lobby__card">
        <h2 className="lobby__title">Echoes of Evolution</h2>
        <p className="lobby__subtitle">When the stars align</p>

        {status === 'idle' && (
          <>
            <button
              type="button"
              className="lobby__join-btn"
              onClick={handleJoinMatch}
            >
              Join Match
            </button>
            {onStartTutorial && (
              <button
                type="button"
                className="lobby__tutorial-btn"
                onClick={onStartTutorial}
              >
                Tutorial
              </button>
            )}
          </>
        )}

        {status === 'finding' && (
          <div className="lobby__finding">
            <p className="lobby__finding-text">
              Finding opponent…{queueCount != null ? ` (${queueCount} in queue)` : ''}
            </p>
            <div className="lobby__spinner" aria-hidden />
            <button
              type="button"
              className="lobby__cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="lobby__error">
            <p className="lobby__error-text">{errorMessage}</p>
            <button
              type="button"
              className="lobby__join-btn"
              onClick={() => { setStatus('idle'); setErrorMessage(null); }}
            >
              Try again
            </button>
          </div>
        )}

        <p className="lobby__hint">2 players per match. You’ll be matched when another player joins.</p>
      </div>
    </div>
  );
}
