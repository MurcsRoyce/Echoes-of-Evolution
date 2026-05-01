import { useEffect } from 'react';
import ProfilePanel from './ProfilePanel';
import './ProfileModal.css';

export default function ProfileModal({ isOpen, onClose, onAfterSignOut }) {
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
      className="profile-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Player profile"
    >
      <div
        className="profile-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="profile-modal__close"
          onClick={onClose}
          aria-label="Close profile"
        >
          ×
        </button>
        <ProfilePanel onAfterSignOut={onAfterSignOut} />
      </div>
    </div>
  );
}
