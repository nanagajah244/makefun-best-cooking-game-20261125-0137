// input.js — keyboard and mouse for Warung Rush.
// One clear job: turn clicks and keys into world actions. No drawing here.

import { INGREDIENTS } from './config.js';
import { LAYOUT, pointInRect, binRect, ticketRect } from './layout.js';
import {
  grabIngredient,
  startStationJob,
  servePlate,
  selectTicket,
  startShift,
  selectedTicket,
} from './world.js';

export function canvasPos(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((clientX - r.left) / r.width) * canvas.width,
    y: ((clientY - r.top) / r.height) * canvas.height,
  };
}

// The station a step needs, so Space always works the right station.
export function stationNeededForNextStep(world) {
  const ticket = selectedTicket(world);
  if (!ticket || !world.plate) return null;
  const step = ticket.steps[world.plate.stepIndex];
  return step && step.kind === 'station' ? step.station : null;
}

export function handleClick(world, px, py, sfx) {
  if (world.phase === 'title') {
    if (pointInRect(px, py, LAYOUT.startButton)) {
      sfx('start');
      startShift(world);
    }
    return;
  }
  if (world.phase === 'won' || world.phase === 'lost') {
    if (pointInRect(px, py, LAYOUT.restartButton)) {
      sfx('start');
      const seed = world.seed + 1;
      const fresh = world.__reset(seed);
      Object.assign(world, fresh);
      startShift(world);
    }
    return;
  }

  // Serve button first: it is the biggest target when a plate is ready.
  if (pointInRect(px, py, LAYOUT.serveButton)) {
    const earned = servePlate(world);
    if (earned > 0) sfx('serve');
    else sfx('wrong');
    return;
  }

  // Ticket cards: click to cook that order.
  for (let i = 0; i < world.tickets.length; i++) {
    if (pointInRect(px, py, ticketRect(i))) {
      selectTicket(world, world.tickets[i].id);
      sfx('click');
      return;
    }
  }

  // Ingredient bins.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (pointInRect(px, py, binRect(i))) {
      const result = grabIngredient(world, INGREDIENTS[i].id);
      if (result === 'ok') sfx('grab');
      else if (result === 'wrong') sfx('wrong');
      return;
    }
  }

  // Stations: wok, chopping board, plating counter.
  if (pointInRect(px, py, LAYOUT.wok)) {
    if (startStationJob(world, 'wok')) sfx('fry');
    return;
  }
  if (pointInRect(px, py, LAYOUT.chop)) {
    if (startStationJob(world, 'board')) sfx('chop');
    return;
  }
  if (pointInRect(px, py, LAYOUT.plate)) {
    const needed = stationNeededForNextStep(world);
    if (needed === 'plate') {
      if (startStationJob(world, 'plate')) sfx('ding');
    } else {
      const earned = servePlate(world);
      if (earned > 0) sfx('serve');
    }
    return;
  }
}

export function handleKey(world, key, sfx) {
  if (world.phase === 'title') {
    if (key === 'Enter' || key === ' ') {
      sfx('start');
      startShift(world);
    }
    return;
  }
  if (world.phase === 'won' || world.phase === 'lost') {
    if (key === 'Enter' || key === 'r' || key === 'R' || key === ' ') {
      sfx('start');
      const fresh = world.__reset(world.seed + 1);
      Object.assign(world, fresh);
      startShift(world);
    }
    return;
  }

  // Number keys 1-8 grab the matching ingredient bin.
  const bin = INGREDIENTS.find((ing) => ing.key === key);
  if (bin) {
    const result = grabIngredient(world, bin.id);
    if (result === 'ok') sfx('grab');
    else if (result === 'wrong') sfx('wrong');
    return;
  }

  // Space chops / stirs: runs the station job the next step needs.
  if (key === ' ') {
    const needed = stationNeededForNextStep(world);
    if (needed && startStationJob(world, needed)) {
      sfx(needed === 'board' ? 'chop' : needed === 'wok' ? 'fry' : 'ding');
    }
    return;
  }

  // Enter serves a finished plate. Q cycles to the next ticket.
  if (key === 'Enter') {
    const earned = servePlate(world);
    if (earned > 0) sfx('serve');
    else sfx('wrong');
    return;
  }
  if (key === 'q' || key === 'Q') {
    const waiting = world.tickets.filter((t) => t.state === 'waiting');
    if (waiting.length > 0) {
      selectTicket(world, waiting[0].id);
      sfx('click');
    }
  }
}
