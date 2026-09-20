# My Platformer

A little platform game you can change yourself. Drive a steam locomotive along
the railway through five levels, jump over the pits and spikes, grab the coins and
reach the purple flag at the end of each one.

[Play it here](https://brendanjameslynskey.github.io/Pi-Platformer/)

## Start the game

1. Open a terminal in this folder.
2. Type `./run` and press Enter.
3. It prints two addresses. On the Raspberry Pi, open Chromium and type in the
   one that says **Network** (it looks like `http://192.168.1.132:5173`).
4. Press **A** on the gamepad.

Leave `./run` going while you work. Every time you save a file, the game on the
TV changes by itself. Press `Ctrl+C` in the terminal to stop it.

## Controls

| Gamepad (Logitech F310) | Keyboard | Does |
|-------------------------|----------|------|
| Left stick or D-pad | Arrow keys or A / D | Run left and right |
| **A** button | Space or Up | Jump (tap for a small hop, hold for a big one) |

The switch on the back of the gamepad must be on **X**, not D.
If it isn't, the start screen will tell you.

## Your first change: jump higher

1. Open [`src/config.js`](src/config.js).
2. Find the line `export const JUMP_FORCE = 820;`
3. Change `820` to `1100` and save.
4. Look at the TV. You are jumping much higher!

Now try these in the same file:

- `PLAYER_COLOR` — repaint the locomotive: change `"#1e6fd9"` to `"green"` or `"#c62828"`
- `MOVE_SPEED` — run faster or slower
- `GRAVITY` — make everything floaty (try `800`) or heavy (try `4000`)
- `GAME_TITLE` — give your game a name

If you break something, change it back and save again.

## Where things live

| File | What is in it |
|------|---------------|
| [`src/config.js`](src/config.js) | All the numbers and colours you can tweak |
| [`src/levels.js`](src/levels.js) | All the levels, drawn with letters. Change them, or add your own! |
| [`src/player.js`](src/player.js) | The steam locomotive: how it looks, runs and jumps |
| [`src/controls.js`](src/controls.js) | Reads the gamepad and keyboard |
| [`src/world.js`](src/world.js) | Turns the letters in a map into blocks, coins, spikes and signals |
| [`src/tiles.js`](src/tiles.js) | The pictures for the track, brick wall and bridge |
| [`src/main.js`](src/main.js) | Starts the game and connects the start, level and "level complete" screens |

## The levels

| # | Name | What is new |
|---|------|-------------|
| 1 | First Steps | Pits, spikes, a staircase and your first bridges |
| 2 | Branch Line | Longer, with signals to restart from |
| 3 | The Viaduct | A huge gap to cross on a chain of bridges |
| 4 | Mountain Pass | Climb up the bridges, run along the top, come back down |
| 5 | Grand Central | Everything at once, plus a low tunnel and single-square bridges |

A **signal** is a checkpoint. Drive past it and the light turns green. If you
fall in a pit or hit spikes, you start again from the last green signal.

Want to jump straight to a level? Open [`src/config.js`](src/config.js) and change
`START_LEVEL` to `4`.

## Build your own level

Open [`src/levels.js`](src/levels.js). Every letter is one square:

```
=  railway track    #  brick wall     B  girder bridge
$  coin             ^  spikes          S  signal (checkpoint)
F  finish flag      @  where you start
```

Add a `B` in the sky and you have a new bridge to jump on. Add `^` and you have
a new trap. Every row must be exactly the same length.

You can run and jump about 4 squares across and 3 squares up, so don't make
gaps bigger than that! Under a bridge there is only just room for the engine,
so don't put a bridge one square above the track.

**To add a whole new level:** copy one of the `{ name, map }` blocks in
`levels.js`, paste it at the bottom of the list, give it a new name and change
the letters. Every map needs 15 rows, exactly one `@` and one `F`. The game
plays the levels in the order they are listed.

## Save your work

When you have made something you like:

```
./save "what I changed"
```

For example: `./save "made the jump higher and the engine green"`.
This sends your changes to GitHub, and the game on the internet updates a minute later.

## Help, something is wrong

- **The screen is blank or the game stopped** — look at the terminal where `./run` is
  going. Errors show up there, and often tell you which file and line.
- **Press `F1` in the game** to see the invisible boxes that decide what touches what.
- **The gamepad does nothing** — press a button on it first. Browsers hide gamepads
  until you do.

## Notes for grown-ups

- Built with [KAPLAY](https://kaplayjs.com/) and Vite in plain JavaScript. Needs Node 22+.
- The Pi only shows the game: it runs Chromium pointed at the dev server on the
  Ubuntu box, or at the GitHub Pages address above.
- Pushing to `main` builds the game and publishes it to GitHub Pages
  ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
- `npm run build` makes a `dist/` folder; `npm run preview` serves it locally.
- `node tools/check-levels.js` ([`tools/check-levels.js`](tools/check-levels.js)) checks that every
  level can be finished and every coin reached, using the jump and speed numbers from
  `src/config.js`. Run it after editing a level or changing the jump or speed.
- The gamepad is read directly with the browser Gamepad API, every frame, in
  [`src/controls.js`](src/controls.js): "standard" mapping, 0.15 stick deadzone.
- [`docs/directions_train_simulator.md`](docs/directions_train_simulator.md) is the brief for the next project, a
  train simulator built the same way. It is written for Claude Code sessions and records what was learnt here.
