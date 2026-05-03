import { useEffect, useState } from 'react';
import { submitPlayerFeedback } from '../lib/feedbackSubmit';
import './FeedbackModal.css';

function isValidEmail(value) {
  const v = value.trim();
  if (!v) return false;
  // Practical check; not full RFC 5322
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function FeedbackModal({ isOpen, onClose, defaultEmail = '' }) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return;
    setEmail((defaultEmail ?? '').trim());
    setDescription('');
    setFormError('');
    setDone(false);
    setSending(false);
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe your feedback.');
      return;
    }
    setSending(true);
    const result = await submitPlayerFeedback({ email, description });
    setSending(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="feedback-modal__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="feedback-modal__panel" onClick={(ev) => ev.stopPropagation()}>
        <button type="button" className="feedback-modal__close" onClick={onClose} aria-label="Close feedback">
          ×
        </button>
        <h2 id="feedback-modal-title" className="feedback-modal__title">
          Send feedback
        </h2>
        <p className="feedback-modal__intro">
          Tell us what is working, what is not, or what you would like to see next. We read every message.
        </p>

        {done ? (
          <p className="feedback-modal__success" role="status">
            Thanks — your feedback was sent.
          </p>
        ) : (
          <form className="feedback-modal__form" onSubmit={handleSubmit}>
            <div className="feedback-modal__field">
              <label className="feedback-modal__label" htmlFor="feedback-email">
                Email
              </label>
              <input
                id="feedback-email"
                type="email"
                className="feedback-modal__input"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={254}
                disabled={sending}
                required
              />
            </div>
            <div className="feedback-modal__field">
              <label className="feedback-modal__label" htmlFor="feedback-body">
                Feedback
              </label>
              <textarea
                id="feedback-body"
                className="feedback-modal__textarea"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Describe your feedback…"
                rows={6}
                maxLength={8000}
                disabled={sending}
                required
              />
            </div>
            {formError && (
              <p className="feedback-modal__error" role="alert">
                {formError}
              </p>
            )}
            <div className="feedback-modal__actions">
              <button type="button" className="feedback-modal__btn feedback-modal__btn--secondary" onClick={onClose} disabled={sending}>
                Cancel
              </button>
              <button type="submit" className="feedback-modal__btn feedback-modal__btn--primary" disabled={sending}>
                {sending ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </form>
        )}

        {done && (
          <div className="feedback-modal__actions feedback-modal__actions--after">
            <button type="button" className="feedback-modal__btn feedback-modal__btn--primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
