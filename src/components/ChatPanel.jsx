import { useState, useEffect, useRef } from 'react';
import { subscribeMatchChat, sendMatchMessage } from '../lib/matchChat';
import { isLocalPracticeMatch } from '../lib/localPractice';
import { fetchProfile, getStoredProfileId } from '../lib/profilesDb';
import './ChatPanel.css';

export default function ChatPanel({ matchId, playerSlot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [localName, setLocalName] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const id = getStoredProfileId();
    if (id) {
      fetchProfile(id).then(p => {
        if (p?.display_name) setLocalName(p.display_name);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!matchId || isLocalPracticeMatch(matchId)) return;
    const unsub = subscribeMatchChat(matchId, setMessages);
    return unsub;
  }, [matchId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || !matchId || playerSlot == null) return;
    
    if (isLocalPracticeMatch(matchId)) {
      // Local only for practice / tutorial
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        player_slot: playerSlot,
        display_name: localName,
        body: text,
        created_at: new Date().toISOString()
      }]);
      setInput('');
      return;
    }

    setSending(true);
    await sendMatchMessage(matchId, playerSlot, text, localName || undefined);
    setInput('');
    setSending(false);
  };

  if (!matchId) return null;

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <span className="chat-panel__title">Chat</span>
      </div>
      <div className="chat-panel__list" ref={listRef} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="chat-panel__empty">No messages yet. Say hi!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`chat-panel__message ${m.player_slot === playerSlot ? 'chat-panel__message--own' : ''}`}
            >
              <span className="chat-panel__sender">
                {m.display_name || `Player ${m.player_slot}`}
              </span>
              <p className="chat-panel__body">{m.body}</p>
            </div>
          ))
        )}
      </div>
      <form className="chat-panel__form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-panel__input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          disabled={sending}
          aria-label="Chat message"
        />
        <button type="submit" className="chat-panel__send" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
