// shots.js — deterministic ?shot= states for screenshots.
// One clear job: build a fixed world for each named shot, from a fixed
// seed, so every screenshot is reproducible. No live play happens here.

import { createWorld, spawnTicket, selectTicket, grabIngredient, startStationJob, addPop, showMessage } from './world.js';
import { dishById } from './config.js';

// Put three tickets on the board in a fixed order, with fixed timers.
function boardWith(world, specs) {
  for (const spec of specs) {
    const dish = dishById(spec.dish);
    const ticket = spawnTicket(world);
    // Replace the random dish with the one this shot wants.
    ticket.dishId = dish.id;
    ticket.name = dish.name;
    ticket.price = dish.price;
    ticket.steps = dish.steps;
    ticket.timeLeft = spec.timeLeft;
    ticket.timeLimit = spec.timeLimit ?? 45;
    ticket.doneSteps = spec.doneSteps ?? 0;
  }
  return world;
}

export function buildShotWorld(shot, seed = 1) {
  const world = createWorld(seed);
  world.phase = 'playing';

  if (shot === 'start') {
    world.phase = 'title';
    world.elapsed = 0;
    boardWith(world, [
      { dish: 'nasi-goreng', timeLeft: 38 },
      { dish: 'mie-goreng', timeLeft: 30 },
      { dish: 'es-teh', timeLeft: 42 },
    ]);
    selectTicket(world, world.tickets[0].id);
    return world;
  }

  if (shot === 'kitchen') {
    // The calm kitchen at the start of the shift: full board, full bins,
    // stations idle, first ticket selected, nothing cooked yet.
    world.elapsed = 12;
    world.shiftLeft = 168;
    boardWith(world, [
      { dish: 'nasi-goreng', timeLeft: 38 },
      { dish: 'mie-goreng', timeLeft: 30 },
      { dish: 'es-teh', timeLeft: 42 },
    ]);
    selectTicket(world, world.tickets[0].id);
    return world;
  }

  if (shot === 'play') {
    // Mid-assembly: Nasi Goreng at the wok, two ingredients already in,
    // the fry job half done, a second ticket waiting, combo 2, timer running.
    world.elapsed = 42;
    world.shiftLeft = 138;
    world.coins = 55;
    world.served = 2;
    world.combo = 2;
    boardWith(world, [
      { dish: 'nasi-goreng', timeLeft: 28 },
      { dish: 'mie-goreng', timeLeft: 36 },
      { dish: 'sate-kilat', timeLeft: 41 },
    ]);
    selectTicket(world, world.tickets[0].id);
    grabIngredient(world, 'rice');
    grabIngredient(world, 'egg');
    startStationJob(world, 'wok');
    if (world.plate && world.plate.stationJob) world.plate.stationJob.left = 0.8;
    return world;
  }

  if (shot === 'serve') {
    // Plate complete and ready to serve, with a fresh "+25 koin" pop.
    world.elapsed = 88;
    world.shiftLeft = 92;
    world.coins = 80;
    world.served = 3;
    world.combo = 2;
    boardWith(world, [
      { dish: 'mie-goreng', timeLeft: 22 },
      { dish: 'es-teh', timeLeft: 39 },
    ]);
    selectTicket(world, world.tickets[0].id);
    grabIngredient(world, 'noodles');
    grabIngredient(world, 'chicken');
    startStationJob(world, 'wok');
    if (world.plate && world.plate.stationJob) world.plate.stationJob.left = 0;
    // Finish the fry instantly, then add the egg: plate is now complete.
    world.plate.stationJob = null;
    world.plate.stepIndex = 3;
    world.tickets[0].doneSteps = 3;
    grabIngredient(world, 'egg');
    addPop(world, 1060, 430, '+25 koin', '#16a34a');
    showMessage(world, 'Piring lengkap — antar sekarang!');
    return world;
  }

  if (shot === 'rush') {
    // Rush hour: glowing edges, four tickets, fast timers, combo 1.
    world.elapsed = 65;
    world.shiftLeft = 115;
    world.rush = true;
    world.rushLeft = 15;
    world.rushRung = true;
    world.coins = 110;
    world.served = 4;
    world.combo = 1;
    boardWith(world, [
      { dish: 'nasi-goreng', timeLeft: 14 },
      { dish: 'mie-goreng', timeLeft: 9 },
      { dish: 'sate-kilat', timeLeft: 24 },
      { dish: 'es-teh', timeLeft: 31 },
    ]);
    selectTicket(world, world.tickets[1].id);
    grabIngredient(world, 'noodles');
    // The HUD's orange JAM SIBUK banner already carries the message.
    return world;
  }

  // Unknown ?shot=: fall back to a fresh playing world.
  return world;
}

export const SHOT_NAMES = ['start', 'kitchen', 'play', 'serve', 'rush'];
