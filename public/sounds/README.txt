Custom sound effects
====================

Put audio files in this folder (same directory as this README).

Expected filenames (WAV — change extensions in src/lib/sounds.js SOUND_FILES if you use another format):

  draw.wav       — drawing a card
  play.wav       — playing a card
  evolve.wav     — evolving
  win.wav        — you win
  lose.wav       — you lose
  attack.wav     — attack / being hit
  your-turn.wav  — opponent ended; your turn (ding / notification)

If a file is missing, the game automatically uses a built-in beep instead.

After adding or replacing files, refresh the app. If you previously hit a missing file, do a full page reload so the game tries the file again.

Tip: keep clips short (under ~1s) for responsive UI. Normalize volume so none of them blast louder than the others.
