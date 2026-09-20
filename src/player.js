// player.js — the character you control: a little steam locomotive!
// Start here if you want to change how it looks or how it moves.

import {
  PLAYER_COLOR,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MOVE_SPEED,
  JUMP_FORCE,
  JUMP_CUT,
} from "./config.js";

// The colours of the parts of the engine. (PLAYER_COLOR, in config.js, is the boiler and cab.)
const IRON = "#2b2b33";     // frame, chimney, roof, cowcatcher
const BRASS = "#ffc93c";    // dome, boiler band, headlamp
const WHEEL_RED = "#c62828";
const WINDOW = "#cfe8ff";
const STEAM = "#ffffff";

const DRIVER_RADIUS = 8;    // the big wheels
const SMALL_RADIUS = 5;     // the little wheels at each end

// Draws the engine. (0, 0) is the middle of its feet and it faces right;
// the caller flips the picture when it turns round.
// Every y is negative because up on the screen is a smaller number.
function drawEngine(k, wheelAngle) {
  const rect = (x, y, width, height, color, radius = 0) =>
    k.drawRect({ pos: k.vec2(x, y), width, height, color: k.rgb(color), radius });
  const circle = (x, y, radius, color, opacity = 1) =>
    k.drawCircle({ pos: k.vec2(x, y), radius, color: k.rgb(color), opacity });

  // Steam puffing out of the chimney. Each puff rises, drifts back, grows and fades.
  const time = k.time();
  for (let i = 0; i < 3; i++) {
    const age = (time * 0.9 + i / 3) % 1; // 0 = just left the chimney, 1 = gone
    circle(23 - age * 26, -46 - age * 34, 4 + age * 7, STEAM, 0.85 * (1 - age));
  }

  // Dome first, so the boiler is drawn over its bottom half.
  circle(4, -32, 5, BRASS);

  // Frame, boiler, smokebox (the dark round front), then the cab at the back.
  rect(-28, -18, 56, 6, IRON);
  rect(-8, -32, 34, 16, PLAYER_COLOR, 5);
  rect(9, -32, 3, 16, BRASS);
  rect(22, -32, 6, 16, IRON);
  rect(-28, -40, 22, 26, PLAYER_COLOR, 2);
  rect(-30, -44, 26, 5, IRON, 2);
  rect(-24, -35, 11, 10, WINDOW, 1);

  // Chimney with a flared top, headlamp and cowcatcher.
  rect(20, -40, 6, 9, IRON);
  rect(18, -43, 10, 4, IRON, 1);
  circle(27, -24, 3, BRASS);
  k.drawTriangle({ p1: k.vec2(19, -12), p2: k.vec2(28, -12), p3: k.vec2(28, -3), color: k.rgb(IRON) });

  // Wheels. A spoke turns round each one, and the connecting rod joins the two big wheels.
  const wheel = (x, radius) => {
    const y = -radius;
    circle(x, y, radius, WHEEL_RED);
    circle(x, y, radius - 2, IRON);
    k.drawLine({
      p1: k.vec2(x - Math.cos(wheelAngle) * (radius - 2), y - Math.sin(wheelAngle) * (radius - 2)),
      p2: k.vec2(x + Math.cos(wheelAngle) * (radius - 2), y + Math.sin(wheelAngle) * (radius - 2)),
      width: 2,
      color: k.rgb(WHEEL_RED),
    });
  };
  wheel(-24, SMALL_RADIUS);
  wheel(-10, DRIVER_RADIUS);
  wheel(8, DRIVER_RADIUS);
  wheel(22, SMALL_RADIUS);

  const crank = 4;
  const crankY = -DRIVER_RADIUS + Math.sin(wheelAngle) * crank;
  k.drawLine({
    p1: k.vec2(-10 + Math.cos(wheelAngle) * crank, crankY),
    p2: k.vec2(8 + Math.cos(wheelAngle) * crank, crankY),
    width: 3,
    color: k.rgb(BRASS),
  });
}

export function makePlayer(k, controls, spawn) {
  const player = k.add([
    k.pos(spawn),     // pos is the middle of its feet, which makes "standing on the ground" easy to think about
    // area() = it can touch things. This box is what touches; drawEngine() is just the picture.
    // The box reaches up (-PLAYER_HEIGHT) and half its width to each side from pos.
    k.area({ shape: new k.Rect(k.vec2(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT), PLAYER_WIDTH, PLAYER_HEIGHT) }),
    k.body(),         // body() = gravity pulls it and solid things stop it
    k.z(10),          // draw it in front of the level
    "player",
  ]);

  let facing = 1;     // 1 = looking right, -1 = looking left
  let wheelAngle = 0; // how far the wheels have turned
  let lastX = spawn.x;

  player.onDraw(() => {
    k.pushTransform();
    k.pushScale(facing, 1); // -1 flips the picture left-to-right
    drawEngine(k, wheelAngle);
    k.popTransform();
  });

  player.onUpdate(() => {
    // Run left/right. moveX is between -1 and 1, so a gentle stick push runs slowly.
    player.move(controls.moveX * MOVE_SPEED, 0);
    if (controls.moveX !== 0) {
      facing = controls.moveX > 0 ? 1 : -1;
    }

    // Turn the wheels by however far we really moved (a wheel turns 1 radian per radius rolled).
    wheelAngle += Math.abs(player.pos.x - lastX) / DRIVER_RADIUS;
    lastX = player.pos.x;

    // Only jump when standing on something, otherwise it could fly forever.
    if (controls.jumpPressed && player.isGrounded()) {
      player.jump(JUMP_FORCE);
    }

    // Let go of jump while still going up: cut the jump short.
    // (vel.y is negative when going up, because y grows downwards on screen.)
    if (controls.jumpReleased && player.vel.y < 0) {
      player.vel.y *= JUMP_CUT;
    }
  });

  // Put it back at the start (used when it falls in a pit or hits spikes).
  player.respawn = () => {
    player.pos = spawn.clone();
    player.vel = k.vec2(0, 0);
    lastX = spawn.x; // so the wheels don't spin wildly for the trip back
  };

  return player;
}
