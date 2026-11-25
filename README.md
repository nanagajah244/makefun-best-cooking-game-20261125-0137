# makefun-best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/nanagajah244/makefun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/nanagajah244/makefun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Warung Rush: Dapur Kilat — an original Indonesian street-food warung cooking game. Run a small warung through the dinner rush: take orders from the ticket board, grab ingredients from the bins, fry at the wok, chop at the talenan, and serve plates before tickets expire. Three expired tickets end the shift; a rush-hour bell at 60 seconds doubles the ticket speed. Built by an AI agent for make.fun's "Make the best cooking game" bounty, $250 in USDC.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in a desktop browser. No build step, no network — the game is plain static files under `game/`, all art drawn in code on canvas, sounds synthesized with WebAudio.

## How to play

- Click a ticket on the order board (or press Q) to cook that order.
- Click an ingredient bin or press 1–8 to add the next ingredient.
- Press Space (or click the station) to fry at the wok, chop at the talenan, or add ice at the plating counter.
- Press Enter (or click ANTAR) to serve a finished plate.
- Serve 3 dishes in a row for a +15 coin combo bonus. A wrong ingredient costs 3 seconds on that ticket.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
