// config.js — every tunable number, dish, ingredient and colour of Warung Rush.
// One clear job: the game's data. No logic lives here, so tuning never touches code.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// A 3-minute dinner shift. The rush bell rings at 60 s and doubles ticket
// speed for 20 s. Three expired tickets end the shift early.
export const SHIFT_SECONDS = 180;
export const RUSH_AT = 60;
export const RUSH_SECONDS = 20;
export const MAX_EXPIRED = 3;

// Tickets arrive faster as the shift goes on: one every ~14 s at the start,
// one every ~7 s by the last minute. During rush hour the gap halves.
export const TICKET_GAP_START = 14;
export const TICKET_GAP_END = 7;
export const TICKET_TIME_LIMIT = 45;
export const WRONG_INGREDIENT_PENALTY_SECONDS = 3;
export const EXPIRED_PENALTY_COINS = 10;
export const COMBO_BONUS_COINS = 15;
export const COMBO_STREAK_FOR_BONUS = 3;

// How long a station job takes once started (seconds).
export const FRY_SECONDS = 1.6;
export const CHOP_SECONDS = 1.2;

// Ingredient bins across the counter. Keys 1-8 grab them in this order.
export const INGREDIENTS = [
  { id: 'rice',     name: 'Nasi',      key: '1', color: '#fdf6e3', draw: 'rice' },
  { id: 'noodles',  name: 'Mie',       key: '2', color: '#f5c542', draw: 'noodles' },
  { id: 'egg',      name: 'Telur',     key: '3', color: '#fff3c4', draw: 'egg' },
  { id: 'chicken',  name: 'Ayam',      key: '4', color: '#e8a06a', draw: 'chicken' },
  { id: 'chili',    name: 'Cabai',     key: '5', color: '#d92b2b', draw: 'chili' },
  { id: 'cucumber', name: 'Timun',     key: '6', color: '#7dc383', draw: 'cucumber' },
  { id: 'crackers', name: 'Kerupuk',   key: '7', color: '#f08c2e', draw: 'crackers' },
  { id: 'tea',      name: 'Teh',       key: '8', color: '#c98a3d', draw: 'tea' },
];

// 'ice' is not a bin: Es Teh's second step is a station job at the
// plating counter ("Tambah Es"), done by clicking the counter or Space.
export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Kilat',
    price: 25,
    steps: [
      { kind: 'ingredient', ingredient: 'rice' },
      { kind: 'ingredient', ingredient: 'egg' },
      { kind: 'station', station: 'wok', label: 'Tumis di Wok', seconds: FRY_SECONDS },
      { kind: 'ingredient', ingredient: 'chili' },
    ],
  },
  {
    id: 'mie-goreng',
    name: 'Mie Goreng Warung',
    price: 30,
    steps: [
      { kind: 'ingredient', ingredient: 'noodles' },
      { kind: 'ingredient', ingredient: 'chicken' },
      { kind: 'station', station: 'wok', label: 'Tumis di Wok', seconds: FRY_SECONDS },
      { kind: 'ingredient', ingredient: 'egg' },
    ],
  },
  {
    id: 'sate-kilat',
    name: 'Sate Kilat',
    price: 35,
    steps: [
      { kind: 'ingredient', ingredient: 'chicken' },
      { kind: 'station', station: 'board', label: 'Potong di Talenan', seconds: CHOP_SECONDS },
      { kind: 'ingredient', ingredient: 'crackers' },
    ],
  },
  {
    id: 'es-teh',
    name: 'Es Teh Warung',
    price: 12,
    steps: [
      { kind: 'ingredient', ingredient: 'tea' },
      { kind: 'station', station: 'plate', label: 'Tambah Es', seconds: 0.6 },
    ],
  },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id);
}

// Warm warung palette: teal awning, wood counter, terracotta tiles.
export const PALETTE = {
  awning: '#0f766e',
  awningDark: '#0b5e57',
  awningStripe: '#f5e6c8',
  wall: '#f7ead1',
  floor: '#e07856',
  floorDark: '#c96a4a',
  counterWood: '#a16207',
  counterWoodDark: '#7c4a05',
  counterTop: '#d9a441',
  binWood: '#8b5a2b',
  ticket: '#fffdf5',
  ticketBorder: '#d9a441',
  ink: '#2b2118',
  muted: '#6b5d4f',
  wok: '#3f3f46',
  board: '#e8c890',
  plate: '#ffffff',
  good: '#16a34a',
  warn: '#ea580c',
  bad: '#dc2626',
  gold: '#f5c542',
  rushGlow: '#f97316',
};
