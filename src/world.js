// world.js — turns the letters of one level (see levels.js) into real things on screen.

import { makeTiles } from "./tiles.js";
import {
  TILE_SIZE,
  COIN_COLOR,
  SPIKE_COLOR,
  FLAG_COLOR,
} from "./config.js";

const T = TILE_SIZE;

export function buildWorld(k, map) {
  const level = k.addLevel(map, {
    tileWidth: T,
    tileHeight: T,
    tiles: {
      ...makeTiles(k), // "=" track, "#" brick, "B" bridge (see tiles.js)
      "$": () => [
        k.circle(11),
        k.color(COIN_COLOR),
        k.outline(3, k.rgb("#c79100")),
        k.anchor("center"),
        k.area(),
        "coin",
      ],
      "^": () => [
        // A triangle pointing up. The hitbox is just the bottom half so it feels fair.
        k.polygon([k.vec2(0, T), k.vec2(T / 2, T * 0.3), k.vec2(T, T)]),
        k.color(SPIKE_COLOR),
        k.area({ shape: new k.Rect(k.vec2(8, T * 0.6), T - 16, T * 0.4) }),
        "hazard",
      ],
      "F": () => [
        k.rect(6, T),
        k.color("#eeeeee"),
        k.area({ shape: new k.Rect(k.vec2(-T / 2, -T), T * 1.5, T * 2) }),
        "goal",
      ],
      "S": () => [
        // A signal. It starts red; once the engine drives past it turns green
        // (main.js does that) and it becomes the new place to restart from.
        k.area({ shape: new k.Rect(k.vec2(0, 0), T, T) }),
        {
          passed: false,
          draw() {
            const box = (x, y, width, height, color, radius = 0) =>
              k.drawRect({ pos: k.vec2(x, y), width, height, color: k.rgb(color), radius });
            box(21, 12, 6, T - 12, "#2b2b33"); // the post
            box(13, 0, 22, 22, "#2b2b33", 4);  // the box with the lamps in
            k.drawCircle({
              pos: k.vec2(24, 11),
              radius: 6,
              color: k.rgb(this.passed ? "#43d17a" : "#ef3b3b"),
            });
          },
        },
        "signal",
      ],
      "@": () => [k.pos(), "spawn"],
    },
  });

  // Coins are drawn from their centre, so nudge them into the middle of their tile.
  for (const coin of level.get("coin")) {
    coin.pos = coin.pos.add(k.vec2(T / 2, T / 2));
  }

  // The flag tile is only one square, so add a second bit of pole above it
  // and hang a purple flag on the very top.
  for (const goal of level.get("goal")) {
    goal.add([k.rect(6, T), k.color("#eeeeee"), k.pos(0, -T)]);
    goal.add([
      k.polygon([k.vec2(6, -T), k.vec2(T * 0.8, -T + 12), k.vec2(6, -T + 24)]),
      k.color(FLAG_COLOR),
    ]);
  }

  const spawnTile = level.get("spawn")[0];
  const spawn = k.vec2(spawnTile.pos.x + T / 2, spawnTile.pos.y + T); // feet on the bottom of the tile
  spawnTile.destroy();

  return {
    spawn,
    coinCount: level.get("coin").length,
    width: map[0].length * T,
    height: map.length * T,
  };
}
