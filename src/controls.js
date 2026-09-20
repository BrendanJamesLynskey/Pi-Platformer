// controls.js — turns the gamepad (and keyboard) into simple answers like
// "how far left/right is he pushing?" and "did he just press jump?".
//
// The browser has no "button pressed" events for gamepads. Instead we LOOK at
// the gamepad once every frame (this is called polling). controls.update()
// does the looking, and it runs at the start of every frame (see main.js).

import { STICK_DEADZONE } from "./config.js";

// Button numbers on a pad that reports the "standard" layout.
// (The F310 does this when the switch on the back is set to X.)
const BUTTON_A = 0;
const DPAD_LEFT = 14;
const DPAD_RIGHT = 15;
const LEFT_STICK_X = 0; // axis number, -1 = full left, +1 = full right

// Sticks never rest at exactly 0, so ignore tiny movements.
function applyDeadzone(value) {
  return Math.abs(value) < STICK_DEADZONE ? 0 : value;
}

// Browsers only show a gamepad after a button has been pressed on it once.
// getGamepads() gives a fresh snapshot every time, so we call it every frame.
function findGamepad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const pad of pads) {
    if (pad && pad.connected) return pad;
  }
  return null;
}

export function createControls(k) {
  let wasJumpHeld = false;

  const controls = {
    moveX: 0,            // -1 (left) .. 0 .. +1 (right)
    jumpHeld: false,     // is jump down right now?
    jumpPressed: false,  // did jump go down THIS frame?
    jumpReleased: false, // did jump come up THIS frame?
    padStatus: "none",   // "none" | "wrong-mode" | "ready"

    update() {
      const pad = findGamepad();
      let moveX = 0;
      let jumpHeld = false;

      if (!pad) {
        controls.padStatus = "none";
      } else if (pad.mapping !== "standard") {
        // The switch on the back is probably on D instead of X.
        controls.padStatus = "wrong-mode";
      } else {
        controls.padStatus = "ready";
        moveX = applyDeadzone(pad.axes[LEFT_STICK_X]);
        if (pad.buttons[DPAD_LEFT].pressed) moveX = -1;
        if (pad.buttons[DPAD_RIGHT].pressed) moveX = 1;
        jumpHeld = pad.buttons[BUTTON_A].pressed;
      }

      // Keyboard works too, handy when there's no gamepad nearby.
      if (k.isKeyDown("left") || k.isKeyDown("a")) moveX = -1;
      if (k.isKeyDown("right") || k.isKeyDown("d")) moveX = 1;
      if (k.isKeyDown("space") || k.isKeyDown("up") || k.isKeyDown("w")) jumpHeld = true;

      controls.moveX = moveX;
      controls.jumpHeld = jumpHeld;
      controls.jumpPressed = jumpHeld && !wasJumpHeld;
      controls.jumpReleased = !jumpHeld && wasJumpHeld;
      wasJumpHeld = jumpHeld;
    },
  };

  return controls;
}
