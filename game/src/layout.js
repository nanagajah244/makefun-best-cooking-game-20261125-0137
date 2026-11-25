// layout.js — where every clickable thing sits on the 1280x720 canvas.
// One clear job: geometry. render.js draws these rects, input.js hit-tests them.
// NOTE: the order board and the chopping board are different rects — the
// keys must stay distinct (orderBoard vs chop), or tickets land on the
// chopping board.

export const LAYOUT = {
  // Order board: ticket cards across the top, under the awning scallops.
  orderBoard: { x: 24, y: 108, w: 1232, h: 104 },
  ticket: { w: 232, h: 104, gap: 12 },

  // Ingredient bins: one row across the kitchen.
  bins: { x: 24, y: 232, w: 142, h: 92, gap: 12 },

  // The three stations.
  wok: { x: 24, y: 340, w: 380, h: 180 },
  chop: { x: 440, y: 340, w: 400, h: 180 },
  plate: { x: 876, y: 340, w: 380, h: 180 },

  // Bottom HUD strip.
  hud: { x: 0, y: 536, w: 1280, h: 184 },
  serveButton: { x: 1030, y: 560, w: 226, h: 64 },
  startButton: { x: 490, y: 430, w: 300, h: 60 },
  restartButton: { x: 490, y: 440, w: 300, h: 60 },
};

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function binRect(index) {
  const b = LAYOUT.bins;
  return { x: b.x + index * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}

export function ticketRect(index) {
  const t = LAYOUT.ticket;
  return { x: LAYOUT.orderBoard.x + index * (t.w + t.gap), y: LAYOUT.orderBoard.y, w: t.w, h: t.h };
}
