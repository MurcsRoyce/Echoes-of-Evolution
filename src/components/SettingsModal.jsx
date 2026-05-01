import { useEffect } from 'react';
import './SettingsModal.css';

const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'bright', label: 'Bright' },
];

export default function SettingsModal({ isOpen, onClose, theme, onThemeChange }) {
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

  if (!isOpen) return null;

  return (
    <div
      className="settings-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        className="settings-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="settings-modal__close"
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
        <h2 className="settings-modal__title">Settings</h2>

        <div className="settings-modal__section">
          <label className="settings-modal__label" htmlFor="settings-theme">
            Theme
          </label>
          <select
            id="settings-theme"
            className="settings-modal__select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            aria-label="Select theme"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
