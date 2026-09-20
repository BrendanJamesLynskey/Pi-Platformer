// player.js — the character you control. Start here if you want to change
// how he looks or how he moves!

import {
  PLAYER_COLOR,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MOVE_SPEED,
  JUMP_FORCE,
  JUMP_CUT,
} from "./config.js";

export function makePlayer(k, controls, spawn) {
  const player = k.add([
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT),
    k.color(PLAYER_COLOR),
    k.pos(spawn),
    k.anchor("bot"),  // pos is his feet, which makes "standing on the ground" easy to think about
    k.area(),         // area() = he can touch things
    k.body(),         // body() = gravity pulls him and solid things stop him
    k.z(10),          // draw him in front of the level
    "player",
  ]);

  // A little eye so you can see which way he's facing.
  const eye = player.add([
    k.rect(6, 10),
    k.color("#000000"),
    k.pos(4, -PLAYER_HEIGHT + 8),
  ]);

  player.onUpdate(() => {
    // Run left/right. moveX is between -1 and 1, so a gentle stick push runs slowly.
    player.move(controls.moveX * MOVE_SPEED, 0);
    if (controls.moveX !== 0) {
      eye.pos.x = controls.moveX > 0 ? 4 : -10;
    }

    // Only jump when standing on something, otherwise he could fly forever.
    if (controls.jumpPressed && player.isGrounded()) {
      player.jump(JUMP_FORCE);
    }

    // Let go of jump while still going up: cut the jump short.
    // (vel.y is negative when going up, because y grows downwards on screen.)
    if (controls.jumpReleased && player.vel.y < 0) {
      player.vel.y *= JUMP_CUT;
    }
  });

  // Put him back at the start (used when he falls in a pit or hits spikes).
  player.respawn = () => {
    player.pos = spawn.clone();
    player.vel = k.vec2(0, 0);
  };

  return player;
}
