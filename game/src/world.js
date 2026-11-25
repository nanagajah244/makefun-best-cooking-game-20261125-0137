// world.js — the game state: tickets, the dish being built, stations,
// score, combo, rush hour and the shift clock. No drawing lives here.

import {
  DISHES,
  INGREDIENTS,
  SHIFT_SECONDS,
  RUSH_AT,
  RUSH_SECONDS,
  TICKET_GAP_START,
  TICKET_GAP_END,
  TICKET_TIME_LIMIT,
  WRONG_INGREDIENT_PENALTY_SECONDS,
  EXPIRED_PENALTY_COINS,
  COMBO_BONUS_COINS,
  COMBO_STREAK_FOR_BONUS,
  MAX_EXPIRED,
} from './config.js';

// mulberry32: a tiny seeded RNG so ?shot= presets are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDish(rng) {
  return DISHES[Math.floor(rng() * DISHES.length)];
}

export function newTicket(id, dish, timeLimit) {
  return {
    id,
    dishId: dish.id,
    name: dish.name,
    price: dish.price,
    steps: dish.steps,
    timeLeft: timeLimit,
    timeLimit,
    doneSteps: 0,
    state: 'waiting', // waiting | active | served | expired
    flash: 0, // >0 while the ticket shakes after a wrong ingredient
  };
}

export function createWorld(seed = 1) {
  return {
    seed,
    rng: makeRng(seed),
    phase: 'title', // title | playing | won | lost
    elapsed: 0,
    shiftLeft: SHIFT_SECONDS,
    rush: false,
    rushLeft: 0,
    rushRung: false,
    tickets: [],
    nextTicketId: 1,
    nextTicketIn: 2.5,
    selectedTicketId: null,
    // The dish currently being assembled on the plating counter.
    plate: null, // { ticketId, stepIndex, stationJob: { station, left, total } | null }
    coins: 0,
    served: 0,
    expired: 0,
    combo: 0,
    bestCombo: 0,
    pops: [], // floating "+25" score pops: { x, y, text, color, life }
    message: '',
    messageLife: 0,
    shake: 0,
  };
}

export function ticketGapAt(elapsed, rush) {
  const t = Math.min(1, elapsed / SHIFT_SECONDS);
  let gap = TICKET_GAP_START + (TICKET_GAP_END - TICKET_GAP_START) * t;
  if (rush) gap /= 2;
  return gap;
}

export function spawnTicket(world) {
  const dish = pickDish(world.rng);
  const ticket = newTicket(world.nextTicketId++, dish, TICKET_TIME_LIMIT);
  world.tickets.push(ticket);
  if (world.selectedTicketId === null) {
    world.selectedTicketId = ticket.id;
    ticket.state = 'active';
    world.plate = { ticketId: ticket.id, stepIndex: 0, stationJob: null };
  }
  return ticket;
}

export function selectedTicket(world) {
  return world.tickets.find((t) => t.id === world.selectedTicketId) ?? null;
}

export function selectTicket(world, id) {
  const ticket = world.tickets.find((t) => t.id === id);
  if (!ticket || ticket.state === 'expired' || ticket.state === 'served') return;
  for (const t of world.tickets) if (t.state === 'active') t.state = 'waiting';
  ticket.state = 'active';
  world.selectedTicketId = id;
  // The plate follows the ticket: start (or resume) building this dish.
  if (!world.plate || world.plate.ticketId !== id) {
    world.plate = {
      ticketId: id,
      stepIndex: ticket.doneSteps,
      stationJob: null,
    };
  }
}

export function addPop(world, x, y, text, color) {
  world.pops.push({ x, y, text, color, life: 1.4 });
}

export function showMessage(world, text) {
  world.message = text;
  world.messageLife = 2.2;
}

// Grab an ingredient bin. Returns 'ok' | 'wrong' | 'not-ready' | 'no-ticket'.
export function grabIngredient(world, ingredientId) {
  const ticket = selectedTicket(world);
  if (!ticket || world.phase !== 'playing') return 'no-ticket';
  if (!world.plate || world.plate.ticketId !== ticket.id) {
    world.plate = { ticketId: ticket.id, stepIndex: ticket.doneSteps, stationJob: null };
  }
  const plate = world.plate;
  if (plate.stationJob) return 'not-ready';
  const step = ticket.steps[plate.stepIndex];
  if (!step || step.kind !== 'ingredient') return 'not-ready';
  if (step.ingredient !== ingredientId) {
    ticket.timeLeft = Math.max(0, ticket.timeLeft - WRONG_INGREDIENT_PENALTY_SECONDS);
    ticket.flash = 0.5;
    world.combo = 0;
    showMessage(world, 'Salah bahan! -3 detik');
    return 'wrong';
  }
  plate.stepIndex += 1;
  ticket.doneSteps = plate.stepIndex;
  return 'ok';
}

// Start the station job the current step needs. Returns true when started.
export function startStationJob(world, station) {
  const ticket = selectedTicket(world);
  if (!ticket || world.phase !== 'playing') return false;
  if (!world.plate || world.plate.ticketId !== ticket.id) return false;
  const plate = world.plate;
  if (plate.stationJob) return false;
  const step = ticket.steps[plate.stepIndex];
  if (!step || step.kind !== 'station' || step.station !== station) return false;
  plate.stationJob = { station, left: step.seconds, total: step.seconds, label: step.label };
  return true;
}

// Serve the finished plate. Returns the coins earned, or 0 when not ready.
export function servePlate(world) {
  const ticket = selectedTicket(world);
  if (!ticket || world.phase !== 'playing') return 0;
  if (!world.plate || world.plate.ticketId !== ticket.id) return 0;
  if (world.plate.stepIndex < ticket.steps.length) return 0;
  if (world.plate.stationJob) return 0;

  let earned = ticket.price;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  if (world.combo > 0 && world.combo % COMBO_STREAK_FOR_BONUS === 0) {
    earned += COMBO_BONUS_COINS;
  }
  world.coins += earned;
  world.served += 1;
  ticket.state = 'served';
  addPop(world, 1060, 430, `+${earned} koin`, '#16a34a');
  if (world.combo > 0 && world.combo % COMBO_STREAK_FOR_BONUS === 0) {
    addPop(world, 1060, 465, `KOMBO x${world.combo}!`, '#f5c542');
  }
  world.tickets = world.tickets.filter((t) => t.id !== ticket.id);
  world.selectedTicketId = null;
  world.plate = null;
  const next = world.tickets.find((t) => t.state === 'waiting');
  if (next) selectTicket(world, next.id);
  return earned;
}

export function expireTicket(world, ticket) {
  ticket.state = 'expired';
  world.expired += 1;
  world.combo = 0;
  world.coins = Math.max(0, world.coins - EXPIRED_PENALTY_COINS);
  addPop(world, 640, 120, `Pesanan hangus! -${EXPIRED_PENALTY_COINS}`, '#dc2626');
  if (world.selectedTicketId === ticket.id) {
    world.selectedTicketId = null;
    world.plate = null;
  }
  world.tickets = world.tickets.filter((t) => t.id !== ticket.id);
  const next = world.tickets.find((t) => t.state === 'waiting');
  if (next) selectTicket(world, next.id);
  if (world.expired >= MAX_EXPIRED) {
    world.phase = 'lost';
  }
}

// Advance the clock by dt seconds. Pure simulation: no input, no drawing.
export function tick(world, dt) {
  if (world.phase !== 'playing') return;
  world.elapsed += dt;
  world.shiftLeft = Math.max(0, SHIFT_SECONDS - world.elapsed);

  const rushJustStarted = !world.rushRung && world.elapsed >= RUSH_AT;
  if (rushJustStarted) {
    world.rushRung = true;
    world.rush = true;
    world.rushLeft = RUSH_SECONDS;
    showMessage(world, 'JAM SIBUK! Pesanan datang 2x lebih cepat!');
  }
  // A rush that starts on this tick keeps its full 20 s even when dt is
  // huge (a single 60 s test tick must not swallow the whole rush).
  if (world.rush && !rushJustStarted) {
    world.rushLeft -= dt;
    if (world.rushLeft <= 0) {
      world.rush = false;
      showMessage(world, 'Jam sibuk selesai. Tarik napas!');
    }
  }

  world.nextTicketIn -= dt;
  if (world.nextTicketIn <= 0) {
    spawnTicket(world);
    world.nextTicketIn = ticketGapAt(world.elapsed, world.rush);
  }

  for (const ticket of [...world.tickets]) {
    ticket.timeLeft -= dt;
    if (ticket.flash > 0) ticket.flash -= dt;
    if (ticket.timeLeft <= 0) expireTicket(world, ticket);
  }

  const plate = world.plate;
  if (plate && plate.stationJob) {
    plate.stationJob.left -= dt;
    if (plate.stationJob.left <= 0) {
      plate.stationJob = null;
      const ticket = selectedTicket(world);
      if (ticket) {
        plate.stepIndex += 1;
        ticket.doneSteps = plate.stepIndex;
      }
    }
  }

  for (const pop of world.pops) pop.life -= dt;
  world.pops = world.pops.filter((p) => p.life > 0);
  if (world.messageLife > 0) world.messageLife -= dt;
  if (world.shake > 0) world.shake -= dt;

  if (world.shiftLeft <= 0 && world.phase === 'playing') {
    world.phase = 'won';
  }
}

export function startShift(world) {
  world.phase = 'playing';
  world.elapsed = 0;
  world.shiftLeft = SHIFT_SECONDS;
  spawnTicket(world);
  world.nextTicketIn = ticketGapAt(0, false);
}
