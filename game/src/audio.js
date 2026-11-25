// audio.js — tiny synthesized sound effects, WebAudio only, no audio files.
// One clear job: beeps. Every sound is an oscillator envelope built in code.

let ctx = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function beep(freq, seconds, type = 'sine', volume = 0.12, when = 0) {
  const ac = ensureCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.05);
}

// Named effects the game uses. Unknown names stay silent.
export function playSfx(name) {
  try {
    switch (name) {
      case 'grab': // short tick when an ingredient lands on the plate
        beep(660, 0.07, 'triangle', 0.1);
        break;
      case 'chop': // knife hits the board: two quick ticks
        beep(220, 0.06, 'square', 0.09);
        beep(180, 0.07, 'square', 0.09, 0.09);
        break;
      case 'fry': // wok sizzle: a low rising buzz
        beep(140, 0.35, 'sawtooth', 0.05);
        beep(210, 0.3, 'sawtooth', 0.04, 0.08);
        break;
      case 'ding': // plating bell
        beep(880, 0.18, 'sine', 0.12);
        beep(1320, 0.25, 'sine', 0.08, 0.05);
        break;
      case 'serve': // served: happy two-note chime
        beep(523, 0.12, 'triangle', 0.12);
        beep(784, 0.22, 'triangle', 0.12, 0.1);
        break;
      case 'wrong': // dull buzz for a wrong ingredient
        beep(110, 0.18, 'square', 0.08);
        break;
      case 'bell': // rush-hour bell
        beep(1046, 0.3, 'sine', 0.12);
        beep(1046, 0.3, 'sine', 0.12, 0.35);
        break;
      case 'start': // shift starts
        beep(392, 0.1, 'triangle', 0.1);
        beep(523, 0.12, 'triangle', 0.1, 0.09);
        beep(659, 0.18, 'triangle', 0.1, 0.18);
        break;
      case 'click':
        beep(500, 0.05, 'triangle', 0.07);
        break;
      default:
        break;
    }
  } catch (err) {
    // Sound is garnish: a blocked AudioContext must never break the game.
  }
}
