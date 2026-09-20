// main.js — starts the game and joins the screens together:
//   start screen  ->  the game  ->  win screen  ->  (back to the game)

import kaplay from "kaplay";
import { createControls } from "./controls.js";
import { makePlayer } from "./player.js";
import { buildWorld } from "./world.js";
import {
  GAME_TITLE,
  GAME_WIDTH,
  GAME_HEIGHT,
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
    if (controls.jumpPressed) k.go("game");
  });
});

// ---------- The game ----------
addScene("game", () => {
  const world = buildWorld(k);
  const player = makePlayer(k, controls, world.spawn);
  let coins = 0;

  const hud = k.add([
    k.text("", { size: 28 }),
    k.pos(20, 16),
    k.color(DARK),
    k.fixed(), // fixed = stays on screen while the camera moves
    k.z(100),
  ]);
  const showCoins = () => {
    hud.text = `Coins: ${coins} / ${world.coinCount}`;
  };
  showCoins();

  player.onCollide("coin", (coin) => {
    coin.destroy();
    coins++;
    showCoins();
  });
  player.onCollide("hazard", () => player.respawn());
  player.onCollide("goal", () => k.go("win", { coins, total: world.coinCount }));

  k.onUpdate(() => {
    // Follow the player sideways, but don't show past the edges of the level.
    const halfScreen = GAME_WIDTH / 2;
    const cameraX = Math.min(Math.max(player.pos.x, halfScreen), world.width - halfScreen);
    k.camPos(cameraX, GAME_HEIGHT / 2);

    // Fell down a pit? Try again from the start.
    if (player.pos.y > world.height + 200) player.respawn();
  });
});

// ---------- Win screen ----------
addScene("win", ({ coins, total }) => {
  addCenteredText("You made it!", 240, 72);
  addCenteredText(`Coins: ${coins} / ${total}`, 340, 40);
  addCenteredText("Press A to play again", 440, 32);

  k.onUpdate(() => {
    if (controls.jumpPressed) k.go("game");
  });
});

k.go("start");
