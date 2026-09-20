# My Platformer

A little platform game you can change yourself. Drive a steam locomotive along
the railway, jump over the pits and spikes, grab the coins and reach the purple flag.

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
| [`src/level.js`](src/level.js) | The map, drawn with letters. Change it to build your own level! |
| [`src/player.js`](src/player.js) | The steam locomotive: how it looks, runs and jumps |
| [`src/controls.js`](src/controls.js) | Reads the gamepad and keyboard |
| [`src/world.js`](src/world.js) | Turns the letters in the map into blocks, coins and spikes |
| [`src/tiles.js`](src/tiles.js) | The pictures for the track, brick wall and bridge |
| [`src/main.js`](src/main.js) | Starts the game and connects the start, game and win screens |

## Build your own level

Open [`src/level.js`](src/level.js). Every letter is one square:

```
=  railway track    #  brick wall     B  girder bridge
$  coin             ^  spikes          F  finish flag
@  where you start
```

Add a `B` in the sky and you have a new bridge to jump on. Add `^` and you have
a new trap. Every row must be exactly the same length.

You can run and jump about 4 squares across and 3 squares up, so don't make
gaps bigger than that!

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
- The gamepad is read directly with the browser Gamepad API, every frame, in
  [`src/controls.js`](src/controls.js): "standard" mapping, 0.15 stick deadzone.
