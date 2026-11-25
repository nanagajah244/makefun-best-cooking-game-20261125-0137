// main.js — the game loop and wiring.
// One clear job: boot the canvas, run requestAnimationFrame, hook input.
// The world simulation lives in world.js; the pixels live in render.js.

import { CANVAS_W, CANVAS_H } from './config.js';
import { createWorld, tick } from './world.js';
import { render } from './render.js';
import { handleClick, handleKey, canvasPos } from './input.js';
import { buildShotWorld } from './shots.js';
import { playSfx } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? 1) || 1;

// A deterministic screenshot state freezes the clock: the same URL always
// renders the same frame. A normal visit plays live.
let world;
let frozen = false;
if (shot) {
  world = buildShotWorld(shot, seed);
  frozen = true;
} else {
  world = createWorld(seed);
}

// Restart support for the end screens: input.js asks the world to reset.
world.__reset = (nextSeed) => {
  const fresh = createWorld(nextSeed);
  fresh.__reset = world.__reset;
  return fresh;
};

canvas.addEventListener('click', (event) => {
  const pos = canvasPos(canvas, event.clientX, event.clientY);
  handleClick(world, pos.x, pos.y, playSfx);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'Enter', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  handleKey(world, event.key, playSfx);
});

// A click anywhere first unlocks audio (browsers need a user gesture).
window.addEventListener('pointerdown', () => playSfx('click'), { once: true });

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen) tick(world, dt);
  render(ctx, world);
  requestAnimationFrame(frame);
}

render(ctx, world);
requestAnimationFrame(frame);
