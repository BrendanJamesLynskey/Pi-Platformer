// check-levels.js — checks that every level in src/levels.js can be completed.
//
// Run it with:   node tools/check-levels.js
//
// It works like a very patient player. It starts at the @, tries lots of
// different runs and jumps (different directions, jump lengths and mid-air
// changes of mind), remembers every place the engine can stand, and asks:
// can we get from the @ to the F? Can we reach every coin?
//
// It uses the numbers from src/config.js, so if you change JUMP_FORCE or
// MOVE_SPEED it will tell you if a level has become impossible.
//
// It plays a little cautiously on purpose (spikes count as slightly bigger, and
// it won't stand with the engine's middle hanging off an edge), so a level it
// passes should have some spare room for a human.
//
// It is a copy of the game's movement, not the game itself. It is a very good
// guide, but the real test is still to play the level!

import { LEVELS } from "../src/levels.js";
import {
  TILE_SIZE as T,
  PLAYER_WIDTH as WIDTH,
  PLAYER_HEIGHT as HEIGHT,
  MOVE_SPEED,
  JUMP_FORCE,
  GRAVITY,
  JUMP_CUT,
} from "../src/config.js";

const DT = 1 / 60;          // one frame
const SPIKE_MARGIN = 6;     // pixels of extra room we keep from spikes
const MAX_FALL_SPEED = 2400;
const SOLID = "=#B";

// Ways to jump: how many frames the button is held (short = small hop), which way
// to run, and whether to change direction in mid-air. Longest jumps first so
// the checker prefers the easy full jumps.
const HOLD_FRAMES = [60, 22, 14, 9, 5];
const DIRECTIONS = [-1, 0, 1];
const AIR_CHANGE_FRAMES = [0, 14, 28]; // 0 = never change

function checkLevel(map) {
  const rows = map.length;
  const cols = map[0].length;
  const isSolid = (col, row) =>
    col >= 0 && col < cols && row >= 0 && row < rows && SOLID.includes(map[row][col]);

  // Collect the things to touch. Each box is [left, top, right, bottom] in pixels.
  const hazards = [];
  const coins = [];
  const goals = [];
  let spawn = null;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * T;
      const y = row * T;
      const letter = map[row][col];
      if (letter === "^") hazards.push([x + 8 - SPIKE_MARGIN, y + 0.6 * T - SPIKE_MARGIN, x + T - 8 + SPIKE_MARGIN, y + T]);
      if (letter === "$") coins.push([x + T / 2 - 11, y + T / 2 - 11, x + T / 2 + 11, y + T / 2 + 11]);
      if (letter === "F") goals.push([x - T / 2, y - T, x + T, y + T]);
      if (letter === "@") spawn = { x: x + T / 2, y: y + T };
    }
  }
  if (!spawn) return { problem: "no @ (start) in this map" };
  if (goals.length !== 1) return { problem: `needs exactly one F, found ${goals.length}` };

  const touches = (s, box) =>
    s.x - WIDTH / 2 < box[2] && s.x + WIDTH / 2 > box[0] && s.y - HEIGHT < box[3] && s.y > box[1];

  // Moves the engine by one frame, the way the game does.
  function step(s, direction, jumpHeld, jumpPressed) {
    if (jumpPressed && s.grounded) s.vy = -JUMP_FORCE;
    if (!jumpHeld && s.wasHeld && s.vy < 0) s.vy *= JUMP_CUT;
    s.wasHeld = jumpHeld;
    s.vy = Math.min(s.vy + GRAVITY * DT, MAX_FALL_SPEED);

    // Sideways, stopping at walls.
    const vx = direction * MOVE_SPEED;
    let newX = s.x + vx * DT;
    if (vx !== 0) {
      const topRow = Math.floor((s.y - HEIGHT + 0.01) / T);
      const bottomRow = Math.floor((s.y - 0.01) / T);
      const edgeCol = Math.floor((vx > 0 ? newX + WIDTH / 2 : newX - WIDTH / 2) / T);
      for (let row = topRow; row <= bottomRow; row++) {
        if (isSolid(edgeCol, row)) {
          newX = vx > 0 ? edgeCol * T - WIDTH / 2 - 0.001 : (edgeCol + 1) * T + WIDTH / 2 + 0.001;
          break;
        }
      }
    }
    s.x = newX;

    // Up and down: land on things below, bump heads on things above.
    let newY = s.y + s.vy * DT;
    s.grounded = false;
    const leftCol = Math.floor((s.x - WIDTH / 2 + 0.01) / T);
    const rightCol = Math.floor((s.x + WIDTH / 2 - 0.01) / T);
    if (s.vy > 0) {
      const row = Math.floor(newY / T);
      const sunkIn = newY - row * T;
      for (let col = leftCol; col <= rightCol; col++) {
        if (!isSolid(col, row) || s.y > row * T + 0.01) continue;
        // The game handles each block separately and pushes the engine out the
        // short way. Clipping just the corner of a block pushes it sideways
        // instead of landing on it, so that doesn't count as landing.
        const overlap = Math.min(s.x + WIDTH / 2, (col + 1) * T) - Math.max(s.x - WIDTH / 2, col * T);
        if (overlap >= sunkIn) {
          newY = row * T;
          s.vy = 0;
          s.grounded = true;
          break;
        }
      }
    } else if (s.vy < 0) {
      const row = Math.floor((newY - HEIGHT) / T);
      for (let col = leftCol; col <= rightCol; col++) {
        if (isSolid(col, row)) {
          newY = (row + 1) * T + HEIGHT + 0.001;
          s.vy = 0;
          break;
        }
      }
    }
    s.y = newY;
  }

  // Places the engine can stand, found so far. Only spots with the engine's
  // middle over a block count, so we never rely on hanging off an edge.
  const standingSpots = new Map();
  const queue = [];
  const spotKey = (s) => `${Math.round(s.x / 8)},${Math.round(s.y)}`;
  function addSpot(s) {
    if (!isSolid(Math.floor(s.x / T), Math.round(s.y / T))) return;
    const key = spotKey(s);
    if (standingSpots.has(key)) return;
    const spot = { x: s.x, y: s.y };
    standingSpots.set(key, spot);
    queue.push(spot);
  }

  const coinsSeen = new Set();
  let finishFound = false;

  // Plays out one run from a standing spot. Returns where it lands (or null).
  function tryRun(from, directionAt, holdFrames, isWalk) {
    const s = { x: from.x, y: from.y, vy: 0, grounded: true, wasHeld: false };
    for (let frame = 0; frame < 260; frame++) {
      step(s, directionAt(frame), holdFrames > 0 && frame < holdFrames, holdFrames > 0 && frame === 0);
      if (s.y > rows * T + 120) return null; // fell down a pit
      if (hazards.some((h) => touches(s, h))) return null; // hit spikes
      coins.forEach((c, i) => touches(s, c) && coinsSeen.add(i));
      if (goals.some((g) => touches(s, g))) { finishFound = true; return null; }
      if (isWalk) {
        if (frame % 3 === 0 && s.grounded) addSpot(s); // walking passes through lots of spots
        if (!s.grounded && frame > 2) { isWalk = false; holdFrames = 0; } // walked off the edge: now falling
      } else if (frame > 1 && s.grounded) {
        return { x: s.x, y: s.y };
      }
    }
    return null;
  }

  // Start: drop the engine onto the ground at the @.
  const start = { x: spawn.x, y: spawn.y - 1, vy: 0, grounded: false, wasHeld: false };
  for (let i = 0; i < 100 && !start.grounded; i++) step(start, 0, false, false);
  addSpot(start);

  while (queue.length > 0) {
    const spot = queue.shift();
    for (const direction of [-1, 1]) {
      const landing = tryRun(spot, () => direction, 0, true);
      if (landing) addSpot(landing);
    }
    for (const first of DIRECTIONS) {
      for (const hold of HOLD_FRAMES) {
        for (const changeAt of AIR_CHANGE_FRAMES) {
          for (const second of changeAt ? [0, -first] : [first]) {
            const landing = tryRun(spot, (f) => (changeAt && f >= changeAt ? second : first), hold, false);
            if (landing) addSpot(landing);
          }
        }
      }
    }
  }

  const missedCoins = coins
    .map((c, i) => ({ i, col: Math.floor((c[0] + 11) / T), row: Math.floor((c[1] + 11) / T) }))
    .filter((c) => !coinsSeen.has(c.i));
  return { finishFound, coinTotal: coins.length, missedCoins };
}

let allGood = true;
LEVELS.forEach((level, index) => {
  const label = `Level ${index + 1} (${level.name})`;
  const lengths = new Set(level.map.map((row) => row.length));
  if (lengths.size !== 1) {
    console.log(`FAIL  ${label}: the rows are not all the same length (${[...lengths].join(", ")})`);
    allGood = false;
    return;
  }
  if (level.map.length !== 15) {
    console.log(`FAIL  ${label}: needs 15 rows, has ${level.map.length}`);
    allGood = false;
    return;
  }
  const result = checkLevel(level.map);
  if (result.problem) {
    console.log(`FAIL  ${label}: ${result.problem}`);
    allGood = false;
  } else if (!result.finishFound) {
    console.log(`FAIL  ${label}: could not find any way from @ to F`);
    allGood = false;
  } else if (result.missedCoins.length > 0) {
    const where = result.missedCoins.map((c) => `column ${c.col} row ${c.row}`).join("; ");
    console.log(`WARN  ${label}: can finish, but these coins look out of reach: ${where}`);
  } else {
    console.log(`ok    ${label}: can finish, all ${result.coinTotal} coins reachable`);
  }
});
process.exit(allGood ? 0 : 1);
