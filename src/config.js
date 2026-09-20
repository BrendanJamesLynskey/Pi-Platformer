// config.js — every number you might want to change lives here.
// Change a value, save the file, and the game on the TV updates by itself!

// ---- The game ----
export const GAME_TITLE = "My Platformer"; // shown on the start screen. Give it a name!

// ---- The player (a steam locomotive) ----
export const PLAYER_COLOR = "#1e6fd9"; // colour of the boiler and cab: try "green" or "#c62828"
export const PLAYER_WIDTH = 56;        // the size of the box that touches things
export const PLAYER_HEIGHT = 44;       // (keep it under 48 so it fits under the low platforms)

// ---- Movement ----
export const MOVE_SPEED = 320;  // how fast you run left/right (bigger = faster)
export const JUMP_FORCE = 820;  // how hard you jump (bigger = higher)
export const GRAVITY = 2200;    // how hard the ground pulls you down (bigger = heavier)

// Let go of jump early and you stop rising sooner, so a tap makes a small hop.
// 1 = no effect, 0.2 = very short hops.
export const JUMP_CUT = 0.45;

// ---- The gamepad (Logitech F310, switch set to X) ----
export const STICK_DEADZONE = 0.15; // ignore tiny stick wobbles (the sticks never rest at exactly 0)

// ---- Colours ----
export const SKY_COLOR = "#7ec8f0";
export const BALLAST_COLOR = "#8a8175"; // the stones under the track
export const BRICK_COLOR = "#9c4a35";
export const GIRDER_COLOR = "#3f5f7a";  // steel bridges
export const RAIL_COLOR = "#c9ced6";
export const SLEEPER_COLOR = "#5d4037"; // the wooden planks the rails sit on
export const COIN_COLOR = "#ffd54f";
export const SPIKE_COLOR = "#455a64";
export const FLAG_COLOR = "#ab47bc";

// ---- Screen size (you probably don't need to change these) ----
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE_SIZE = 48; // each letter in level.js is one tile this big
