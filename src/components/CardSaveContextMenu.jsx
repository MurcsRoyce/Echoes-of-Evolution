import { useEffect, useRef, useLayoutEffect } from 'react';
import './CardSaveContextMenu.css';

export default function CardSaveContextMenu({ x, y, onSave, onDismiss }) {
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const pad = 8;
    const nx = Math.max(pad, Math.min(x, window.innerWidth - w - pad));
    const ny = Math.max(pad, Math.min(y, window.innerHeight - h - pad));
    el.style.left = `${nx}px`;
    el.style.top = `${ny}px`;
  }, [x, y]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onDismiss?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  useEffect(() => {
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target)) onDismiss?.();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', onDown), 120);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onDismiss]);

  return (
    <div
      ref={panelRef}
      className="card-save-context-menu"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Card actions"
    >
      <button type="button" className="card-save-context-menu__item" role="menuitem" onClick={onSave}>
        Save to collection
      </button>
    </div>
  );
}
