// render.js — every pixel of Warung Rush, drawn with canvas shapes.
// One clear job: drawing. It reads the world, it never changes it.

import { CANVAS_W, CANVAS_H, INGREDIENTS, PALETTE, SHIFT_SECONDS, RUSH_AT, MAX_EXPIRED, ingredientById } from './config.js';
import { LAYOUT, binRect, ticketRect } from './layout.js';
import { selectedTicket } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Same as text(), but with a dark outline so it stays readable on the
// striped awning. Keep the stroke thin: a fat stroke swallows small text.
function textOutlined(ctx, str, x, y, size, color, align = 'left') {
  ctx.font = `bold ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(11,94,87,0.9)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// Chunky, readable ingredient art — plain canvas shapes, no images.
export function drawIngredientIcon(ctx, kind, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const u = s / 40; // unit: icons are drawn in a 40-unit box
  ctx.lineWidth = 2 * u;
  ctx.strokeStyle = 'rgba(43,33,24,0.55)';
  switch (kind) {
    case 'rice': {
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.ellipse(0, 6 * u, 16 * u, 9 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-4 * u, -2 * u, 12 * u, 8 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(5 * u, -6 * u, 9 * u, 7 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.ellipse(0, 12 * u, 17 * u, 4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'noodles': {
      ctx.strokeStyle = '#e8a91c';
      ctx.lineWidth = 4 * u;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-14 * u, (-6 + i * 6) * u);
        ctx.bezierCurveTo(-5 * u, (-12 + i * 6) * u, 5 * u, (0 + i * 6) * u, 14 * u, (-6 + i * 6) * u);
        ctx.stroke();
      }
      ctx.fillStyle = '#7dc383';
      ctx.beginPath();
      ctx.arc(10 * u, -10 * u, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 * u, 11 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f5a623';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd970';
      ctx.beginPath();
      ctx.arc(-2 * u, -2 * u, 2.5 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chicken': {
      ctx.fillStyle = '#e8a06a';
      ctx.beginPath();
      ctx.ellipse(-2 * u, 2 * u, 11 * u, 9 * u, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fdf6e3';
      ctx.lineWidth = 5 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8 * u, -6 * u);
      ctx.lineTo(16 * u, -14 * u);
      ctx.stroke();
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.arc(17 * u, -15 * u, 4 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13 * u, -17 * u, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chili': {
      ctx.strokeStyle = '#d92b2b';
      ctx.lineWidth = 6 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-13 * u, -8 * u);
      ctx.quadraticCurveTo(0, 14 * u, 14 * u, -10 * u);
      ctx.stroke();
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 3.5 * u;
      ctx.beginPath();
      ctx.moveTo(14 * u, -10 * u);
      ctx.quadraticCurveTo(18 * u, -16 * u, 12 * u, -17 * u);
      ctx.stroke();
      break;
    }
    case 'cucumber': {
      ctx.fillStyle = '#2f7d32';
      ctx.beginPath();
      ctx.arc(-6 * u, 0, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8 * u, 0, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8e6b0';
      ctx.beginPath();
      ctx.arc(-6 * u, 0, 6 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8 * u, 0, 6 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dc383';
      ctx.beginPath();
      ctx.arc(-6 * u, 0, 2.5 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8 * u, 0, 2.5 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crackers': {
      ctx.fillStyle = '#f08c2e';
      for (const [dx, dy] of [[-7, -4], [7, -5], [0, 7]]) {
        ctx.beginPath();
        ctx.arc(dx * u, dy * u, 8 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd08a';
      ctx.beginPath();
      ctx.arc(0, 7 * u, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tea': {
      ctx.fillStyle = '#c98a3d';
      rr(ctx, -9 * u, -8 * u, 18 * u, 22 * u, 3 * u);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f0c98a';
      rr(ctx, -6 * u, -5 * u, 12 * u, 5 * u, 2 * u);
      ctx.fill();
      ctx.fillStyle = '#bfe8ff';
      ctx.save();
      ctx.rotate(0.5);
      ctx.fillRect(-3 * u, -14 * u, 6 * u, 6 * u);
      ctx.restore();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawAwning(ctx) {
  ctx.fillStyle = PALETTE.awning;
  ctx.fillRect(0, 0, CANVAS_W, 44);
  ctx.fillStyle = PALETTE.awningStripe;
  for (let x = 0; x < CANVAS_W; x += 80) {
    ctx.fillRect(x, 0, 40, 44);
  }
  ctx.fillStyle = PALETTE.awningDark;
  for (let x = 0; x < CANVAS_W; x += 80) {
    ctx.beginPath();
    ctx.arc(x + 40, 44, 40, 0, Math.PI);
    ctx.fill();
  }
  textOutlined(ctx, 'WARUNG RUSH: DAPUR KILAT', 24, 22, 22, '#ffffff');
  // The right subtitle sits on a dark pill: plain text on the cream stripe
  // is unreadable, and an outline swallows 14 px glyphs.
  ctx.fillStyle = 'rgba(11,94,87,0.85)';
  rr(ctx, 1010, 8, 246, 28, 14);
  ctx.fill();
  text(ctx, 'warung Pak Kilat — shift makan malam', 1133, 23, 13, '#d7f3ef', 'normal', 'center');
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 44, CANVAS_W, 140);
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 184, CANVAS_W, CANVAS_H - 184);
  ctx.fillStyle = PALETTE.floorDark;
  for (let y = 184; y < CANVAS_H; y += 46) {
    ctx.fillRect(0, y, CANVAS_W, 2);
  }
  for (let x = 0; x < CANVAS_W; x += 92) {
    for (let y = 184; y < CANVAS_H; y += 46) {
      ctx.fillRect(x + ((y / 46) % 2 === 0 ? 46 : 0), y, 2, 46);
    }
  }
}

function drawTicket(ctx, ticket, index) {
  const r = ticketRect(index);
  const urgent = ticket.timeLeft < 12;
  const shakeX = ticket.flash > 0 ? Math.sin(ticket.flash * 40) * 4 : 0;
  ctx.save();
  ctx.translate(shakeX, 0);
  ctx.fillStyle = ticket.state === 'active' ? '#fff7d6' : PALETTE.ticket;
  ctx.strokeStyle = ticket.state === 'active' ? '#f59e0b' : PALETTE.ticketBorder;
  ctx.lineWidth = ticket.state === 'active' ? 4 : 2;
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.stroke();

  text(ctx, ticket.name, r.x + 12, r.y + 18, 16, PALETTE.ink);
  text(ctx, `${ticket.price} koin`, r.x + r.w - 12, r.y + 18, 14, '#b45309', 'bold', 'right');

  // Recipe steps as icons with checkmarks, spaced so nothing overlaps.
  let sx = r.x + 20;
  ticket.steps.forEach((step, i) => {
    const done = i < ticket.doneSteps;
    ctx.globalAlpha = done ? 1 : 0.85;
    if (step.kind === 'ingredient') {
      drawIngredientIcon(ctx, ingredientById(step.ingredient).draw, sx, r.y + 52, 28);
    } else {
      // Station step: draw the station's mark.
      ctx.fillStyle = step.station === 'wok' ? '#3f3f46' : step.station === 'board' ? '#e8c890' : '#ffffff';
      ctx.strokeStyle = 'rgba(43,33,24,0.55)';
      ctx.beginPath();
      ctx.arc(sx, r.y + 52, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      text(ctx, step.station === 'wok' ? 'WOK' : step.station === 'board' ? 'POTONG' : 'ES', sx, r.y + 52, 8, PALETTE.ink, 'bold', 'center');
    }
    if (done) {
      ctx.fillStyle = PALETTE.good;
      ctx.beginPath();
      ctx.arc(sx + 11, r.y + 39, 8, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, '✓', sx + 11, r.y + 40, 11, '#ffffff', 'bold', 'center');
    }
    if (i < ticket.steps.length - 1) {
      text(ctx, '›', sx + 25, r.y + 52, 16, PALETTE.muted, 'bold', 'center');
    }
    sx += 50;
    ctx.globalAlpha = 1;
  });

  // Countdown timer bar — big and always visible.
  const frac = Math.max(0, ticket.timeLeft / ticket.timeLimit);
  ctx.fillStyle = '#e7dcc8';
  rr(ctx, r.x + 12, r.y + r.h - 20, r.w - 24, 10, 5);
  ctx.fill();
  ctx.fillStyle = urgent ? PALETTE.bad : frac < 0.5 ? PALETTE.warn : PALETTE.good;
  if (frac > 0) {
    rr(ctx, r.x + 12, r.y + r.h - 20, (r.w - 24) * frac, 10, 5);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(ticket.timeLeft)} dtk`, r.x + r.w - 12, r.y + r.h - 34, 12, urgent ? PALETTE.bad : PALETTE.muted, 'bold', 'right');
  ctx.restore();
}

function drawBoard(ctx, world) {
  text(ctx, 'PAPAN PESANAN — klik tiket untuk memasak', LAYOUT.orderBoard.x, LAYOUT.orderBoard.y - 10, 13, PALETTE.muted, 'bold');
  if (world.tickets.length === 0) {
    text(ctx, 'Belum ada pesanan… sebentar lagi ramai!', LAYOUT.orderBoard.x + 8, LAYOUT.orderBoard.y + 60, 18, PALETTE.muted, 'normal');
  }
  world.tickets.forEach((ticket, i) => drawTicket(ctx, ticket, i));
}

function drawBins(ctx, world) {
  text(ctx, 'BAHAN — klik atau tekan 1–8', LAYOUT.bins.x, LAYOUT.bins.y - 8, 13, PALETTE.muted, 'bold');
  const ticket = selectedTicket(world);
  const nextStep = ticket && world.plate ? ticket.steps[world.plate.stepIndex] : null;
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const needed = nextStep && nextStep.kind === 'ingredient' && nextStep.ingredient === ing.id;
    ctx.fillStyle = needed ? '#fff7d6' : '#fdf3dd';
    ctx.strokeStyle = needed ? '#f59e0b' : PALETTE.binWood;
    ctx.lineWidth = needed ? 4 : 2;
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.stroke();
    drawIngredientIcon(ctx, ing.draw, r.x + r.w / 2, r.y + 34, 40);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 70, 14, PALETTE.ink, 'bold', 'center');
    text(ctx, `[${ing.key}]`, r.x + r.w - 8, r.y + 14, 11, PALETTE.muted, 'normal', 'right');
  });
}

function drawStationJob(ctx, plate, r) {
  const job = plate.stationJob;
  const frac = 1 - job.left / job.total;
  ctx.fillStyle = 'rgba(43,33,24,0.75)';
  rr(ctx, r.x + 20, r.y + r.h - 44, r.w - 40, 18, 9);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  rr(ctx, r.x + 20, r.y + r.h - 44, (r.w - 40) * frac, 18, 9);
  ctx.fill();
  // Label sits under the bar, clear of the food in the station.
  text(ctx, job.label, r.x + r.w / 2, r.y + r.h - 22, 13, '#ffffff', 'bold', 'center');
}

function drawStations(ctx, world) {
  const ticket = selectedTicket(world);
  const plate = world.plate;
  const nextStep = ticket && plate ? ticket.steps[plate.stepIndex] : null;

  // Wok station.
  const wok = LAYOUT.wok;
  const wokNeeded = nextStep && nextStep.kind === 'station' && nextStep.station === 'wok';
  ctx.fillStyle = PALETTE.counterWood;
  rr(ctx, wok.x, wok.y, wok.w, wok.h, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, wok.x + 8, wok.y + 8, wok.w - 16, 34, 8);
  ctx.fill();
  text(ctx, 'WOK — tumis', wok.x + 20, wok.y + 26, 15, PALETTE.ink, 'bold');
  text(ctx, 'klik / Spasi', wok.x + wok.w - 20, wok.y + 26, 12, PALETTE.muted, 'normal', 'right');
  ctx.fillStyle = PALETTE.wok;
  ctx.beginPath();
  ctx.ellipse(wok.x + wok.w / 2, wok.y + 118, 110, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#52525b';
  ctx.beginPath();
  ctx.ellipse(wok.x + wok.w / 2, wok.y + 112, 92, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  if (plate && plate.stationJob && plate.stationJob.station === 'wok') {
    // Show the ingredients already in the wok, from this ticket's steps.
    const added = ticket.steps.slice(0, plate.stepIndex).filter((s) => s.kind === 'ingredient');
    added.forEach((s, i) => {
      drawIngredientIcon(ctx, ingredientById(s.ingredient).draw, wok.x + wok.w / 2 - 24 + i * 48, wok.y + 110, 40);
    });
    drawStationJob(ctx, plate, wok);
  } else if (wokNeeded) {
    text(ctx, '▶ MASAK DI SINI', wok.x + wok.w / 2, wok.y + 118, 16, '#fbbf24', 'bold', 'center');
  } else {
    text(ctx, 'wok panas, siap menumis', wok.x + wok.w / 2, wok.y + 118, 13, '#a1a1aa', 'normal', 'center');
  }

  // Chopping board.
  const board = LAYOUT.chop;
  const boardNeeded = nextStep && nextStep.kind === 'station' && nextStep.station === 'board';
  ctx.fillStyle = PALETTE.counterWood;
  rr(ctx, board.x, board.y, board.w, board.h, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, board.x + 8, board.y + 8, board.w - 16, 34, 8);
  ctx.fill();
  text(ctx, 'TALENAN — potong', board.x + 20, board.y + 26, 15, PALETTE.ink, 'bold');
  text(ctx, 'klik / Spasi', board.x + board.w - 20, board.y + 26, 12, PALETTE.muted, 'normal', 'right');
  ctx.fillStyle = PALETTE.board;
  rr(ctx, board.x + 60, board.y + 66, board.w - 120, 92, 10);
  ctx.fill();
  ctx.strokeStyle = '#b98a4a';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (plate && plate.stationJob && plate.stationJob.station === 'board') {
    drawIngredientIcon(ctx, 'chicken', board.x + board.w / 2 - 30, board.y + 112, 44);
    drawIngredientIcon(ctx, 'chicken', board.x + board.w / 2 + 34, board.y + 112, 44);
    // Knife mid-chop.
    ctx.save();
    ctx.translate(board.x + board.w / 2 + 70, board.y + 84);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(-6, -26, 12, 52);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, -40, 12, 16);
    ctx.restore();
    drawStationJob(ctx, plate, board);
  } else if (boardNeeded) {
    text(ctx, '▶ POTONG DI SINI', board.x + board.w / 2, board.y + 118, 16, '#b45309', 'bold', 'center');
  } else {
    drawIngredientIcon(ctx, 'cucumber', board.x + board.w / 2, board.y + 112, 40);
  }

  // Plating counter — where the dish is assembled and served.
  const pl = LAYOUT.plate;
  const plateNeeded = nextStep && nextStep.kind === 'station' && nextStep.station === 'plate';
  const ready = ticket && plate && plate.stepIndex >= ticket.steps.length && !plate.stationJob;
  ctx.fillStyle = PALETTE.counterWood;
  rr(ctx, pl.x, pl.y, pl.w, pl.h, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, pl.x + 8, pl.y + 8, pl.w - 16, 34, 8);
  ctx.fill();
  text(ctx, 'MEJA SAJI — piring', pl.x + 20, pl.y + 26, 15, PALETTE.ink, 'bold');
  text(ctx, 'Enter = antar', pl.x + pl.w - 20, pl.y + 26, 12, PALETTE.muted, 'normal', 'right');
  // The plate itself (kept small so its label fits under it, clear of the
  // station's bottom edge).
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.ellipse(pl.x + pl.w / 2, pl.y + 106, 104, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (ticket && plate) {
    // Ingredients already on the plate, left to right.
    let ix = pl.x + pl.w / 2 - (Math.min(plate.stepIndex, 4) - 1) * 26;
    for (let i = 0; i < plate.stepIndex; i++) {
      const step = ticket.steps[i];
      if (step.kind === 'ingredient') {
        drawIngredientIcon(ctx, ingredientById(step.ingredient).draw, ix, pl.y + 100, 34);
        ix += 52;
      }
    }
    if (plate.stationJob && plate.stationJob.station === 'plate') {
      drawStationJob(ctx, plate, pl);
    } else if (ready) {
      text(ctx, '✓ SIAP DIANTAR!', pl.x + pl.w / 2, pl.y + 164, 16, PALETTE.good, 'bold', 'center');
    } else if (plateNeeded) {
      text(ctx, '▶ TAMBAH ES DI SINI', pl.x + pl.w / 2, pl.y + 164, 14, '#0e7490', 'bold', 'center');
    } else {
      text(ctx, ticket.name, pl.x + pl.w / 2, pl.y + 164, 14, PALETTE.ink, 'bold', 'center');
    }
  } else {
    text(ctx, 'pilih pesanan di papan atas', pl.x + pl.w / 2, pl.y + 164, 13, PALETTE.muted, 'normal', 'center');
  }
}

function drawHud(ctx, world) {
  const hud = LAYOUT.hud;
  ctx.fillStyle = 'rgba(43,33,24,0.92)';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);

  // Shift timer — the big one, always visible.
  const frac = Math.max(0, world.shiftLeft / SHIFT_SECONDS);
  text(ctx, 'SHIFT', 24, hud.y + 28, 14, '#f5c542', 'bold');
  ctx.fillStyle = '#57534e';
  rr(ctx, 90, hud.y + 14, 560, 28, 14);
  ctx.fill();
  ctx.fillStyle = frac < 0.25 ? PALETTE.bad : PALETTE.gold;
  if (frac > 0) {
    rr(ctx, 90, hud.y + 14, 560 * frac, 28, 14);
    ctx.fill();
  }
  const mm = Math.floor(world.shiftLeft / 60);
  const ss = Math.floor(world.shiftLeft % 60).toString().padStart(2, '0');
  text(ctx, `${mm}:${ss}`, 664, hud.y + 28, 20, '#ffffff', 'bold');

  // Coins, served, combo, expired.
  text(ctx, `🪙 ${world.coins} koin`, 24, hud.y + 76, 24, '#f5c542', 'bold');
  text(ctx, `Disajikan: ${world.served}`, 24, hud.y + 112, 16, '#ffffff', 'normal');
  text(ctx, `Hangus: ${world.expired}/${MAX_EXPIRED}`, 24, hud.y + 142, 16, world.expired > 0 ? '#fca5a5' : '#ffffff', 'bold');

  // Combo meter: filled dots show the current streak toward the next bonus.
  text(ctx, 'KOMBO', 330, hud.y + 76, 14, '#f5c542', 'bold');
  const filled = world.combo === 0 ? 0 : world.combo % 3 === 0 ? 3 : world.combo % 3;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < filled ? '#f59e0b' : '#57534e';
    ctx.beginPath();
    ctx.arc(400 + i * 30, hud.y + 76, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, world.combo > 0 ? `x${world.combo} beruntun` : 'sajikan 3 beruntun = +15', 500, hud.y + 76, 15, '#ffffff', 'normal');
  text(ctx, 'Bonus kombo: tiap 3 sajian beruntun +15 koin', 330, hud.y + 112, 14, '#d6d3d1', 'normal');

  // Rush banner.
  if (world.rush) {
    ctx.fillStyle = '#f97316';
    rr(ctx, 330, hud.y + 132, 420, 34, 10);
    ctx.fill();
    text(ctx, `🔔 JAM SIBUK! ${Math.ceil(world.rushLeft)} dtk — pesanan 2x cepat`, 540, hud.y + 150, 16, '#ffffff', 'bold', 'center');
  } else if (world.elapsed < RUSH_AT && world.phase === 'playing') {
    text(ctx, `Jam sibuk mulai dalam ${Math.ceil(RUSH_AT - world.elapsed)} dtk`, 330, hud.y + 150, 14, '#d6d3d1', 'normal');
  }

  // Current order progress (kept short so it never runs under the ANTAR button).
  const ticket = selectedTicket(world);
  if (ticket && world.plate) {
    text(ctx, `Memasak: ${ticket.name}`, 760, hud.y + 76, 15, '#ffffff', 'bold');
    const next = ticket.steps[world.plate.stepIndex];
    if (next) {
      const hint = next.kind === 'ingredient'
        ? `Langkah ${world.plate.stepIndex + 1}/${ticket.steps.length} — ${ingredientById(next.ingredient).name}  [${ingredientById(next.ingredient).key}]`
        : `Langkah ${world.plate.stepIndex + 1}/${ticket.steps.length} — ${next.label}  [Spasi]`;
      text(ctx, hint, 760, hud.y + 112, 15, '#fde68a', 'normal');
    } else {
      text(ctx, 'Piring lengkap — tekan Enter untuk mengantar!', 760, hud.y + 112, 15, '#86efac', 'bold');
    }
  } else {
    text(ctx, 'Klik tiket di papan pesanan untuk mulai memasak.', 760, hud.y + 76, 15, '#d6d3d1', 'normal');
  }
  text(ctx, '1–8 bahan · Spasi olah · Enter antar · Q ganti pesanan', 760, hud.y + 142, 13, '#a8a29e', 'normal');

  // Serve button.
  const sb = LAYOUT.serveButton;
  const ready = ticket && world.plate && world.plate.stepIndex >= ticket.steps.length && !world.plate.stationJob;
  ctx.fillStyle = ready ? PALETTE.good : '#57534e';
  ctx.strokeStyle = ready ? '#15803d' : '#44403c';
  ctx.lineWidth = 3;
  rr(ctx, sb.x, sb.y, sb.w, sb.h, 12);
  ctx.fill();
  ctx.stroke();
  text(ctx, ready ? 'ANTAR!  [Enter]' : 'ANTAR', sb.x + sb.w / 2, sb.y + sb.h / 2, 20, '#ffffff', 'bold', 'center');

  // Floating score pops.
  for (const pop of world.pops) {
    ctx.globalAlpha = Math.min(1, pop.life);
    text(ctx, pop.text, pop.x, pop.y - (1.4 - pop.life) * 30, 20, pop.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }

  // Transient centre message: a small pill over the awning's free middle,
  // so it never covers the board, bins or stations.
  if (world.messageLife > 0) {
    ctx.globalAlpha = Math.min(1, world.messageLife);
    ctx.fillStyle = 'rgba(43,33,24,0.92)';
    ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
    const mw = ctx.measureText(world.message).width + 48;
    rr(ctx, 640 - mw / 2, 6, mw, 32, 16);
    ctx.fill();
    text(ctx, world.message, 640, 23, 16, '#ffffff', 'bold', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawRushGlow(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(249,115,22,0.9)';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, CANVAS_W - 14, CANVAS_H - 14);
  ctx.strokeStyle = 'rgba(249,115,22,0.35)';
  ctx.lineWidth = 30;
  ctx.strokeRect(15, 15, CANVAS_W - 30, CANVAS_H - 30);
  ctx.restore();
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 44, CANVAS_W, CANVAS_H - 44);
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 290, 150, 700, 390, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketBorder;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'WARUNG RUSH', 640, 205, 52, PALETTE.ink, 'bold', 'center');
  text(ctx, 'Dapur Kilat — shift makan malam', 640, 252, 22, '#b45309', 'bold', 'center');
  text(ctx, 'Pesanan datang di papan atas. Ambil bahan (klik / 1–8),', 640, 306, 17, PALETTE.ink, 'normal', 'center');
  text(ctx, 'olah di wok & talenan (Spasi), antar piringnya (Enter).', 640, 334, 17, PALETTE.ink, 'normal', 'center');
  text(ctx, '3 pesanan hangus = shift berakhir. Jam sibuk jam 60 detik!', 640, 362, 17, PALETTE.ink, 'normal', 'center');
  text(ctx, 'Nasi Goreng Kilat · Mie Goreng Warung · Sate Kilat · Es Teh Warung', 640, 396, 15, PALETTE.muted, 'normal', 'center');
  const b = LAYOUT.startButton;
  ctx.fillStyle = PALETTE.good;
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  text(ctx, 'MULAI SHIFT  [Enter]', b.x + b.w / 2, b.y + b.h / 2, 20, '#ffffff', 'bold', 'center');
  text(ctx, 'Suara: bip WebAudio (boleh dimatikan di browser)', 640, 518, 12, '#a8a29e', 'normal', 'center');
}

function drawEnd(ctx, world) {
  ctx.fillStyle = 'rgba(43,33,24,0.78)';
  ctx.fillRect(0, 44, CANVAS_W, CANVAS_H - 44);
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 340, 160, 600, 360, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketBorder;
  ctx.lineWidth = 3;
  ctx.stroke();
  const won = world.phase === 'won';
  text(ctx, won ? 'SHIFT SELESAI!' : 'WARUNG TUTUP…', 640, 220, 44, won ? PALETTE.good : PALETTE.bad, 'bold', 'center');
  text(ctx, won ? 'Semua pesanan malam ini terlayani.' : 'Tiga pesanan hangus — pelanggan pulang.', 640, 268, 18, PALETTE.ink, 'normal', 'center');
  text(ctx, `🪙 ${world.coins} koin`, 640, 330, 34, '#b45309', 'bold', 'center');
  text(ctx, `Disajikan: ${world.served}  ·  Hangus: ${world.expired}  ·  Kombo terbaik: x${world.bestCombo}`, 640, 378, 17, PALETTE.ink, 'normal', 'center');
  const b = LAYOUT.restartButton;
  ctx.fillStyle = PALETTE.good;
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  text(ctx, 'MAIN LAGI  [R]', b.x + b.w / 2, b.y + b.h / 2, 20, '#ffffff', 'bold', 'center');
}

export function render(ctx, world) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawFloor(ctx);
  drawAwning(ctx);
  drawBoard(ctx, world);
  // The kitchen (bins, stations, HUD) shows behind the title card too, so
  // the very first screenshot already reads as a complete cooking game.
  drawBins(ctx, world);
  drawStations(ctx, world);
  drawHud(ctx, world);
  if (world.rush) drawRushGlow(ctx);
  if (world.phase === 'title') drawTitle(ctx, world);
  if (world.phase === 'won' || world.phase === 'lost') drawEnd(ctx, world);
}
