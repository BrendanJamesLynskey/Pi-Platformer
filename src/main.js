// main.js — starts the game and joins the screens together:
//   start screen  ->  level 1  ->  "level complete"  ->  level 2  ->  ...  ->  the end

import kaplay from "kaplay";
import { createControls } from "./controls.js";
import { makePlayer } from "./player.js";
import { buildWorld } from "./world.js";
import { LEVELS } from "./levels.js";
import {
  GAME_TITLE,
  START_LEVEL,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  GRAVITY,
  SKY_COLOR,
} from "./config.js";

const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  background: SKY_COLOR,
  letterbox: true, // keeps the shape right on any screen, with bars if needed
});

k.setGravity(GRAVITY);

const controls = createControls(k);

// Like k.scene(), but every screen also looks at the gamepad at the start of
// each frame. (Changing screen throws away anything set up outside a scene,
// so this has to be redone inside each one.)
function addScene(name, setup) {
  k.scene(name, (...args) => {
    k.onUpdate(() => controls.update());
    setup(...args);
  });
}

const CENTER_X = GAME_WIDTH / 2;
const T = TILE_SIZE;
const DARK = "#1b2a41";

// A line of text in the middle of the screen (the anchor makes pos the middle of the text).
function addCenteredText(message, y, size, color = DARK) {
  return k.add([
    k.text(message, { size, align: "center" }),
    k.pos(CENTER_X, y),
    k.anchor("center"),
    k.color(color),
  ]);
}

// ---------- Start screen ----------
// Browsers won't show us the gamepad until a button has been pressed on it,
// so we wait for A here. It also tells us if the pad is not ready.
addScene("start", () => {
  addCenteredText(GAME_TITLE, 240, 72);
  addCenteredText("Press A to start", 360, 36);
  const padMessage = addCenteredText("", 460, 24);

  const messages = {
    none: "No gamepad found yet. Press a button on it.\n(Or use the keyboard: arrows + Space)",
    "wrong-mode": "Gamepad found, but flip the switch on the back to X!",
    ready: "Gamepad ready!",
  };

  k.onUpdate(() => {
    padMessage.text = messages[controls.padStatus];
    if (controls.jumpPressed) startLevel(START_LEVEL - 1, { coins: 0, possible: 0 });
  });
});

// Starts a level. "bank" is the coins collected in the levels finished so far.
function startLevel(levelIndex, bank) {
  k.go("game", { levelIndex, bank });
}

// ---------- The game ----------
addScene("game", ({ levelIndex, bank }) => {
  const level = LEVELS[levelIndex];
  const world = buildWorld(k, level.map);
  const player = makePlayer(k, controls, world.spawn);
  let coins = 0;

  const hud = k.add([
    k.text("", { size: 28 }),
    k.pos(20, 16),
    k.color(DARK),
    k.fixed(), // fixed = stays on screen while the camera moves
    k.z(100),
  ]);
  const showHud = () => {
    hud.text = `Level ${levelIndex + 1}: ${level.name}    Coins: ${coins} / ${world.coinCount}`;
  };
  showHud();

  // The level's name, big in the middle for a couple of seconds.
  const title = k.add([
    k.text(`Level ${levelIndex + 1}\n${level.name}`, { size: 64, align: "center" }),
    k.pos(CENTER_X, 200),
    k.anchor("center"),
    k.color(DARK),
    k.fixed(),
    k.z(100),
  ]);
  k.wait(2.5, () => title.destroy());

  player.onCollide("coin", (coin) => {
    coin.destroy();
    coins++;
    showHud();
  });
  player.onCollide("hazard", () => player.respawn());
  player.onCollide("signal", (signal) => {
    signal.passed = true; // turns the light green
    player.setRestartPoint(k.vec2(signal.pos.x + T / 2, signal.pos.y + T));
  });
  player.onCollide("goal", () => {
    const newBank = { coins: bank.coins + coins, possible: bank.possible + world.coinCount };
    k.go("win", { levelIndex, coins, total: world.coinCount, bank: newBank });
  });

  k.onUpdate(() => {
    // Follow the player sideways, but don't show past the edges of the level.
    // (Every level is 15 squares tall, which is exactly the height of the screen.)
    const halfScreen = GAME_WIDTH / 2;
    const cameraX = Math.min(Math.max(player.pos.x, halfScreen), world.width - halfScreen);
    k.camPos(cameraX, GAME_HEIGHT / 2);

    // Fell down a pit? Try again from the last signal.
    if (player.pos.y > world.height + 200) player.respawn();
  });
});

// ---------- Level complete / the end ----------
addScene("win", ({ levelIndex, coins, total, bank }) => {
  const isLastLevel = levelIndex === LEVELS.length - 1;

  if (isLastLevel) {
    addCenteredText("You finished the railway!", 220, 64);
    addCenteredText(`Coins in the whole game: ${bank.coins} / ${bank.possible}`, 340, 36);
    addCenteredText("Press A to play again", 440, 32);
  } else {
    addCenteredText(`Level ${levelIndex + 1} complete!`, 220, 64);
    addCenteredText(`Coins: ${coins} / ${total}`, 340, 40);
    addCenteredText("Press A for the next level", 440, 32);
  }

  k.onUpdate(() => {
    if (!controls.jumpPressed) return;
    if (isLastLevel) k.go("start");
    else startLevel(levelIndex + 1, bank);
  });
});

k.go("start");
