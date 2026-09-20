// tiles.js — the pictures for the solid blocks: railway track, brick and girder bridge.
// Each tile is a square of TILE_SIZE (48) pixels and (0, 0) is its top-left corner.
// The top edge of a track or bridge tile is where the engine's wheels touch the rails.

import {
  TILE_SIZE,
  BALLAST_COLOR,
  BRICK_COLOR,
  GIRDER_COLOR,
  RAIL_COLOR,
  SLEEPER_COLOR,
  GAME_WIDTH,
} from "./config.js";

const T = TILE_SIZE;
const MORTAR = "#d2c2ae";
const GRAVEL = "#6f675c";

// The rails and sleepers along the top of a track or bridge tile.
// Sleepers are 16 pixels apart, so they line up from one tile to the next.
function drawRails(k) {
  const box = (x, y, width, height, color) =>
    k.drawRect({ pos: k.vec2(x, y), width, height, color: k.rgb(color) });

  for (const x of [3, 19, 35]) box(x, 3, 10, 6, SLEEPER_COLOR);
  box(0, 3, T, 2, "#6b7078"); // the thin middle of the rail
  box(0, 0, T, 3, RAIL_COLOR); // the top of the rail, where the wheels run
}

// "=" Track: rails and sleepers on a bed of stones.
function drawTrack(k) {
  k.drawRect({ pos: k.vec2(0, 0), width: T, height: T, color: k.rgb(BALLAST_COLOR) });
  for (const [x, y, w] of [[4, 22, 6], [22, 30, 8], [36, 18, 6], [12, 38, 7], [34, 40, 6]]) {
    k.drawRect({ pos: k.vec2(x, y), width: w, height: 4, color: k.rgb(GRAVEL) });
  }
  drawRails(k);
}

// "#" Brick: the wall under the track. Every other row is shifted along, like a real wall.
function drawBrick(k) {
  k.drawRect({ pos: k.vec2(0, 0), width: T, height: T, color: k.rgb(BRICK_COLOR) });
  for (let row = 0; row < 4; row++) {
    const y = row * 12;
    k.drawRect({ pos: k.vec2(0, y), width: T, height: 2, color: k.rgb(MORTAR) });
    const shift = row % 2 === 0 ? 12 : 0;
    for (const x of [shift, shift + 24]) {
      k.drawRect({ pos: k.vec2(x, y), width: 2, height: 12, color: k.rgb(MORTAR) });
    }
  }
}

// "B" Bridge: a track on top of a steel girder with criss-cross bracing.
function drawBridge(k) {
  drawRails(k);
  const top = 9;
  const bottom = T - 6;
  const beam = (x, y, width, height) =>
    k.drawRect({ pos: k.vec2(x, y), width, height, color: k.rgb(GIRDER_COLOR) });

  beam(0, top, T, 5);      // top beam
  beam(0, bottom, T, 6);   // bottom beam
  beam(0, top, 4, T - top); // upright at the left edge
  for (const [from, to] of [[[0, top + 5], [T, bottom]], [[0, bottom], [T, top + 5]]]) {
    k.drawLine({ p1: k.vec2(...from), p2: k.vec2(...to), width: 4, color: k.rgb(GIRDER_COLOR) });
  }
}

// Builds the pieces a solid block is made from. Solid means you can stand on it
// and it never moves. Only tiles near the screen are drawn, to keep the game quick.
function solidTile(k, drawTile) {
  return () => [
    k.area({ shape: new k.Rect(k.vec2(0, 0), T, T) }),
    k.body({ isStatic: true }),
    {
      draw() {
        if (Math.abs(this.pos.x + T / 2 - k.camPos().x) > GAME_WIDTH / 2 + T) return;
        drawTile(k);
      },
    },
  ];
}

export function makeTiles(k) {
  return {
    "=": solidTile(k, drawTrack),
    "#": solidTile(k, drawBrick),
    "B": solidTile(k, drawBridge),
  };
}
