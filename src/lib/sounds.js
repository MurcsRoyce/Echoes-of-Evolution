/**
 * Sound effects for Echoes of Evolution.
 *
 * Custom files: add audio under public/sounds/ using the names in SOUND_FILES
 * (WAV by default — change SOUND_FILES if you use another format).
 * If a file is missing or fails to play, a Web Audio synth fallback is used.
 */

const SOUND_FILES = {
  draw: 'draw.wav',
  play: 'play.wav',
  evolve: 'evolve.wav',
  win: 'win.wav',
  lose: 'lose.wav',
  attack: 'attack.wav',
  /** Short chime when it becomes your turn (e.g. opponent ended). */
  yourTurn: 'your-turn.wav',
};

function getSoundUrl(type) {
  const file = SOUND_FILES[type];
  if (!file) return null;
  const base = import.meta.env.BASE_URL ?? '';
  const baseNorm = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${baseNorm}/sounds/${file}`;
}

let audioContext = null;

function getAudioContext() {
  if (audioContext) return audioContext;
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioContext = new Ctx();
  return audioContext;
}

/**
 * Play a short synthesized tone (fallback when no file or load/play fails).
 */
function playTone(frequency, durationMs, volume = 0.15, type = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (_) {}
}

function playSynthSound(soundType) {
  switch (soundType) {
    case 'draw':
      playTone(520, 80);
      break;
    case 'play':
      playTone(440, 100);
      setTimeout(() => playTone(660, 80, 0.12), 50);
      break;
    case 'evolve':
      playTone(330, 60);
      setTimeout(() => playTone(523, 120, 0.18), 80);
      break;
    case 'win':
      playTone(523, 100);
      setTimeout(() => playTone(659, 100), 120);
      setTimeout(() => playTone(784, 200, 0.2), 240);
      break;
    case 'lose':
      playTone(200, 150, 0.2, 'triangle');
      setTimeout(() => playTone(165, 250, 0.18, 'triangle'), 120);
      break;
    case 'attack': {
      playTone(95, 45, 0.22, 'square');
      playTone(55, 90, 0.2, 'sawtooth');
      setTimeout(() => playTone(40, 140, 0.18, 'square'), 55);
      setTimeout(() => playTone(120, 35, 0.14, 'triangle'), 20);
      break;
    }
    case 'yourTurn':
      playTone(784, 100, 0.11);
      setTimeout(() => playTone(1047, 220, 0.09), 70);
      break;
    default:
      playTone(400, 60);
  }
}

/** Types where the file URL failed (missing/unsupported) — avoid repeat network errors. */
const FILE_UNAVAILABLE = new Set();

/**
 * Try to play the file in public/sounds/. Missing or bad files fall back to synth permanently for that type.
 * Autoplay blocks only fall back once (synth) without blacklisting the file.
 */
function playFileThenFallback(type) {
  if (FILE_UNAVAILABLE.has(type)) {
    playSynthSound(type);
    return;
  }
  const url = getSoundUrl(type);
  if (!url) return;

  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.volume = 0.75;

  const synthFallback = () => {
    playSynthSound(type);
  };

  const blacklistAndSynth = () => {
    FILE_UNAVAILABLE.add(type);
    synthFallback();
  };

  audio.addEventListener(
    'error',
    () => {
      audio.removeAttribute('src');
      blacklistAndSynth();
    },
    { once: true }
  );

  audio.play().catch((err) => {
    if (err && err.name === 'NotAllowedError') {
      synthFallback();
      return;
    }
    blacklistAndSynth();
  });
}

/**
 * Play a sound effect. No-op if muted or type unknown.
 * Uses public/sounds/<name> when present; otherwise synthesized tones.
 */
export function playSound(type, muted) {
  if (muted || !SOUND_FILES[type]) return;
  if (typeof window === 'undefined') return;
  playFileThenFallback(type);
}

export const SOUND_MUTED_STORAGE_KEY = 'echoes-sound-muted';
