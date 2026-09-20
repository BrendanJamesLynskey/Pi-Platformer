# Project: Class 47 Cab Simulator

Directions for a Claude Code session (written for Sonnet). Read **all** of this before
you write any code. It replaces the earlier, more general `directions_train_simulator.md`.

This is the **second** game in the "Ubuntu box builds it, Raspberry Pi plays it" pattern.
The first, **Pi-Platformer**, is finished and **has been tested and works on the real Pi 5
with the real Logitech F310** (Brendan confirmed, 2026-09-20). It is the working template.
Wherever this file says "as Pi-Platformer", go and look at it:

- Working copy: `~/Claude_sandbox/Pi-Platformer`
- GitHub: https://github.com/BrendanJamesLynskey/Pi-Platformer
- Live: https://brendanjameslynskey.github.io/Pi-Platformer/

## 0. How to work (read this first)

- The design decisions are **already made** in this file. Do not re-ask them. If something
  is genuinely unspecified, choose a sensible default, write the choice down in the README
  and your report, and carry on. Only stop to ask Brendan when you are truly blocked.
- Work in the **milestones** in section 15, in order. Finish, verify and push each one before
  starting the next. After **Milestone 1** stop and hand over for a real-Pi test (section 17).
- **Never claim something works because it built.** Run it in headless Chrome, drive it,
  take screenshots and **read them** (section 14). Say plainly what you verified and what
  you could not.
- Don't guess library APIs from memory. Three.js changes between versions. Check the
  installed copy in `node_modules/three` (grep it, or read the examples under
  `node_modules/three/examples/jsm`) before using an API you're unsure of.
- Keep to `~/Claude_sandbox/CLAUDE.md`: match the style of neighbouring repos, update the
  README to link new files, commit and push to GitHub after changes.
- Don't touch other repos, except adding one entry to `~/JW/README.md` (section 16).

## 1. Goal

A **train driving simulator seen from the driver's seat**, built as a web app, that
Brendan's 11-year-old son plays on a Raspberry Pi 5 in his room (TV + Logitech F310
gamepad) and edits himself as he learns to code. He uses a laptop/keyboard at the Pi to
make changes; Brendan reviews and helps from the Ubuntu box running Claude Code.

It must stay **readable and editable by a beginner**. That matters more than realism.
He will open the files and change numbers. Realism is a means to feeling like driving a
real train, not a goal in itself.

## 2. What is decided

| Topic | Decision |
|-------|----------|
| View | **First person, from the driver's seat** in the cab, looking forward along the track. |
| Train | **A modern-image British diesel, Class 47, running a railtour** (loco number **47790**, as in Brendan's `UK-Railtour-Manager`). A short rake of coaches behind it. The player never sees the outside of the train. |
| Controls | Logitech F310 mapped to the cab controls (section 5). **RT = more throttle, RB = less throttle, LT = more brake, LB = less brake.** |
| Scenery | **Town and country.** Fields, hedges, trees, farms, a village and a market town with a station. |
| Stack | **Three.js + Vite, plain JavaScript.** (KAPLAY is 2D and can't do this view.) |
| Where it runs | Ubuntu box dev server or GitHub Pages, shown in Chromium on the Pi. Same as Pi-Platformer. |
| Repo | `BrendanJamesLynskey/Class-47-Cab-Sim`, **public** (Pages needs it), working copy `~/Claude_sandbox/Class-47-Cab-Sim`. |
| Privacy | No personal details or the son's name anywhere: repo, README, commits, the site. |

## 3. Stack

- **Three.js** from npm (`three`), bundled by **Vite**. No CDN links. Plain JavaScript, ES
  modules, **no TypeScript**, no frameworks, no post-processing.
- Scaffold: `npm create vite@latest Class-47-Cab-Sim -- --template vanilla`, then
  `cd Class-47-Cab-Sim && npm install three`. (If the scaffold prompts or the flags differ in the
  installed version, adapt; delete the sample counter/CSS/assets.) Node 22 is installed.
- Everything visual is **generated at load time**: geometry from primitives, textures drawn
  on a small `<canvas>`, sounds synthesised with Web Audio. **No image, model or sound
  files.** This is how Brendan's other projects work and it keeps the repo tiny.
- Use `THREE.MeshLambertMaterial` / `MeshBasicMaterial` and vertex colours. **No shadows**,
  no PBR, no custom shaders. Simple beats pretty on a Pi.

**Precedent to read, not copy.** Brendan's `~/Claude_sandbox/Airedale-Wharfedale-Sim` is a
3D Class 333/331 driver sim in one 360 KB `index.html`. It is far too big and dense to
imitate, but mine it for ideas:

- `README.md`: the control list, and how AWS, DSD and the brake notches behave.
- `index.html` around lines 745-780 (renderer, fog, pixel ratio, no shadows) and 1240-1310
  (`InstancedMesh` for sleepers and telegraph poles).
- `sample-line.json`: a route as data.

Also `~/Claude_sandbox/RC-Flight-Line`: hand-written WebGL that holds 60 fps on the Pi 5. It
has **adaptive resolution** (frame time measured, resolution scaled between 50% and 100%) and
an **F key** diagnostic readout. Do the same here.

## 4. How it is played

Identical to Pi-Platformer:

- The Pi does **not** run the dev server or build anything. It is a display and input device:
  Chromium pointed at the Vite dev server on this Ubuntu box (while developing) or at the
  GitHub Pages site (when stable).
- Dev: `./run` here (`npm run dev -- --host`, port **5173**, `strictPort: true`). Find the
  address with `hostname -I` (it has been `192.168.1.132`; the hostname is `bren-ubuntu24-04`;
  either may change). On the Pi open `http://<that>:5173`. Saving a file reloads the page.
- GitHub Actions builds and deploys to Pages on every push to `main`.
- **Audio needs a Pi Chromium flag.** Browsers block sound until the page has had a user
  gesture, and a **gamepad button press may not count as one**. Tell Brendan (in the README's
  "Notes for grown-ups" and in your Milestone 1 handover) to start Chromium with
  `--autoplay-policy=no-user-gesture-required`. Also make the game **cope without it**: if
  the `AudioContext` is `suspended`, show a small "Sound off: press any key" hint and resume
  on the first keyboard/mouse/touch event. See the memory note "Web Audio on mobile".

## 5. Controls

Use the F310 in **X mode** (`mapping === "standard"`). Copy `src/controls.js` from
Pi-Platformer and extend it. It already polls `navigator.getGamepads()` every frame, applies a
0.15 deadzone, and reports "no pad" / "wrong mode" / "ready" for the start screen. Keep the
"press A to start" screen: browsers hide the pad until a button is pressed once.

### Gamepad map

| Input | Standard-mapping index | Cab control |
|-------|------------------------|-------------|
| **RT** (right trigger) | `buttons[7].value` (0..1) | **More throttle.** While held, the power handle rises. |
| **RB** (right bumper) | `buttons[5]` | **Less throttle.** While held, the power handle falls. |
| **LT** (left trigger) | `buttons[6].value` (0..1) | **More brake.** While held, the brake handle applies. |
| **LB** (left bumper) | `buttons[4]` | **Less brake.** While held, the brake handle releases. |
| A | `buttons[0]` | **Horn** (two-tone, sounds while held). Also "start" on menus. |
| B | `buttons[1]` | **AWS acknowledge** (Milestone 4). |
| X | `buttons[2]` | Headlights: off / dipped / full. |
| Y | `buttons[3]` | Windscreen wipers on / off. |
| D-pad up / down | `buttons[12]` / `[13]` | **Reverser:** one step toward Forward / toward Reverse (Reverse - Neutral - Forward). Only when stopped. |
| Left stick | `axes[0]`, `axes[1]` | **Look around** the cab (head turn). Springs back to centre. |
| L3 / R3 (stick clicks) | `buttons[10]` / `[11]` | R3 re-centres the view. L3 unused (too easy to press by accident). |
| Back | `buttons[8]` | **Emergency brake** (full application, power cut, throttle to zero). |
| Start | `buttons[9]` | Pause. |

### How the handles move (this matters for the feel)

The throttle and brake are **levers with a position from 0 to 1** that the player pushes, not
buttons that jump. The lever position is shown in the cab (the handle physically moves) and on
the HUD.

- **RT** raises the power handle at `THROTTLE_RAISE_RATE * trigger.value` per second (default
  about 0.5 per second at full pull, so a gentle squeeze is a gentle increase). **RB** lowers it
  at `THROTTLE_LOWER_RATE` per second (default about 0.9, faster than raising, as real drivers
  shut off quickly).
- **LT** raises the brake handle at `BRAKE_APPLY_RATE * trigger.value`. **LB** lowers it at
  `BRAKE_RELEASE_RATE`.
- The handle **stays where the player leaves it** when they let go. They tap a bumper to back
  it off. This is the whole point of the mapping: increase with the triggers, decrease with the
  bumpers.
- All four rates are in `config.js` with a comment saying what changing them does.
- **Power cut-out:** while the brake handle is above `POWER_CUTOUT_BRAKE` (default 0.15) the
  engine delivers no traction, whatever the throttle says. Show a small "POWER CUT" light.
- Reverser starts in **Neutral**. Driving needs Forward and the brake released. If they try to
  move the throttle in Neutral, show a friendly hint on the HUD: "Reverser to Forward (D-pad up)".
- Wrong pad mode: the start screen says "flip the switch on the back to X" as in Pi-Platformer.

### Keyboard (for testing and for the laptop)

Match the Airedale sim so it is familiar. Keys are all in `config.js`.

| Key | Action |
|-----|--------|
| Up / W | More throttle |
| Down / S | Less throttle |
| Left / A | More brake |
| Right / D | Less brake |
| Space | Emergency brake |
| H / J | Horn high / low (both = two-tone) |
| Q | AWS acknowledge |
| L / V | Headlights / wipers |
| F / R | Reverser forward / reverse |
| Arrow keys with Shift, or mouse drag | Look around |
| P / Esc | Pause |
| F1 | Show or hide the performance readout |

## 6. The train and its physics

Physics is **1-D**: one number for speed along the track. The 3D world just displays it.
Put it in `src/physics.js` as **pure functions with no DOM and no Three.js**, so it can be
imported by a Node test (section 14). Use a **fixed time step** (1/120 s), accumulating real
time in the main loop, so behaviour doesn't depend on frame rate. Clamp a long frame so a tab
switch can't cause a huge jump.

Each tick, with speed `v` in m/s (never negative; the reverser sets direction) and mass `m` in kg:

```
traction   = min( MAX_TRACTIVE_EFFORT * throttle ,  TRACTION_POWER * throttle / max(v, 1) )
             and never more than  ADHESION_LIMIT (about 0.25 * loco weight * g)
             and zero if the power cut-out is active or the reverser is in Neutral
resistance = ROLLING_RESISTANCE * m * g  +  DRAG * v * v
gradient   = m * g * slope                 (slope = rise/run; 1 in 100 is 0.01; uphill positive)
braking    = brakeCylinder * MAX_BRAKE_FORCE_PER_TONNE * (m / 1000)
accel      = ( traction - resistance - gradient - braking ) / ( m * ROTATING_MASS_FACTOR )
```

`brakeCylinder` is **not** the handle position. It chases it with a delay, because air brakes
are slow. Apply it with a time constant of a couple of seconds, and release it more slowly (a
long rake takes longer to recharge):

```
brakeCylinder += (handle - brakeCylinder) * dt / (handle > brakeCylinder ? BRAKE_APPLY_LAG : BRAKE_RELEASE_LAG)
```

This lag is what makes braking a skill: **you have to brake early.** Don't remove it to be kind.
The emergency brake applies faster and harder (`EMERGENCY_BRAKE_FACTOR`).

### Numbers (in `config.js`, all with units in the name and a comment)

These are **approximate**, chosen to feel right. They are not from a data sheet. If you have
web access, sanity-check them against a reliable Class 47 source; otherwise use them as given.
What matters is that the checks in section 14 pass. Brendan's session ran a quick reference simulation of exactly these values (step 1/120 s, 8 coaches unless stated) to set the acceptance ranges in section 14; your `physics.js` should land close to it:

| Case | Reference result |
|------|------------------|
| 8 coaches, level, full power | 60 mph after about **118 s**; settles at about **87 mph** |
| 3 coaches | 60 mph after about 60 s; reaches the 95 mph limit |
| 0 coaches (light loco) | 60 mph after about 30 s; reaches 95 mph |
| 12 coaches | 60 mph after about 177 s; settles at about 78 mph |
| 8 coaches on a 1-in-50 climb | slows to about **40 mph** |
| Full service brake from 60 mph (power off) | stops in about **620 m** |
| Emergency brake from 60 mph | stops in about **360 m** |

| Quantity | Value | Notes |
|----------|-------|-------|
| Locomotive | Brush Type 4 (Class 47), Co-Co, Sulzer 12-cylinder | Number **47790**. |
| Loco mass | about 120 t | |
| Engine power | 2,580 bhp (1,920 kW); use about **1,700 kW** at the rail | `TRACTION_POWER_KW` |
| Starting tractive effort | about **275 kN** (62,000 lbf) | `MAX_TRACTIVE_EFFORT_KN` |
| Top speed | **95 mph** (42.5 m/s) | Also in the Railtour Manager roster. Enforce as a hard limit. |
| Coaches | **8** by default (about 35 t each, 20 m each) | `COACHES` in config: **the easy first edit**. Try 3 and 12. |
| Rolling resistance | about 0.0020 | |
| Drag | about **8 N per (m/s)²** for the loco, plus about **2 N per (m/s)² per coach** | `DRAG_*` |
| Full service brake | about **636 N per tonne** of train at full cylinder pressure, which is about 0.6 m/s² | so about 600 m to stop from 60 mph |
| Brake lag | apply time constant about **2.5 s**, release about **6 s** | `BRAKE_APPLY_LAG_S`, `BRAKE_RELEASE_LAG_S` |
| Emergency brake | about 1.7 times the service force, with a **0.8 s** lag | about 1.0 m/s² |
| Rotating mass factor | 1.06 | |

Units: the **game shows miles per hour and miles/yards**, because it is a British railway.
Keep the physics in **metres, seconds, newtons**, and convert only at the display edge (one
small `units.js`: `mph(v)`, `miles(m)`, `yards(m)`).

## 7. The cab (what the player sees)

- Camera at the driver's eye, **seated on the left** of the cab, looking forward. Field of view
  about 65 degrees vertical. Near plane about 0.05.
- **Look around** with the left stick: yaw plus or minus 70 degrees, pitch plus 20 / minus 25,
  smoothed, springing back to centre.
- Build the cab from primitives, a simple stylised evocation of a Class 47 cab, not a museum
  replica: a light grey-cream shell with a dark grey **desk** sloping toward the driver; a
  **windscreen** with a centre pillar and dark frames (the glass is simply not drawn); a small
  side window on the left. Add a **sun visor**, a **cab roof** with a lamp, and the
  **nose of the locomotive** just visible below the screen. Keep it to a few dozen meshes.
- On the desk, all working, driven by the physics state:
  - **Speedometer**, mph, 0 to 100, a round dial with a moving needle. Draw the dial face once
    to a canvas texture; rotate a needle mesh.
  - **Brake gauges** (brake pipe and cylinder, 0 to 100 psi), and an **ammeter** showing
    traction current (which follows the throttle and falls to zero when the power cuts out).
  - **Power handle** and **brake handle**: real lever meshes that rotate with their
    values, so he *sees* his RT and LT presses move them. A small **reverser** handle too.
  - **AWS sunflower** indicator (black and yellow, Milestone 4).
  - Small **warning lights**: POWER CUT, brakes applied, etc.
- Windscreen **wipers** (Y), that sweep when on. Headlights (X) light the track ahead a little.
- A modest, optional **HUD** (toggle with H on the keyboard, or from a config flag): current
  speed limit, distance to the next station or signal, and the throttle/brake percentages. He is
  11; being able to see the number helps. Keep it small and out of the way, top of the screen.

## 8. The world

### Track

- **Route is data** in `src/route.js`, like Pi-Platformer's `levels.js`: plain objects a
  beginner can edit. Distances in **miles** in the file (with a helper), converted once.
  Keep it shaped so a future session could import a Yorkshire Line Editor JSON.
- The route lists, by distance along the line:
  `environment` stretches (`"country"`, `"village"`, `"town"`, `"cutting"`, `"embankment"`),
  `stations` (name, distance, platform length, side), `signals` (aspects), `speedLimits` (mph),
  `gradients` (1 in N, up or down), `curves` (radius, length, direction), `levelCrossings`,
  `bridges`, and optionally a short `tunnel`.
- **Track geometry** (`src/path.js`): from the curves and gradients, precompute the centre-line
  every metre (x, z, heading, height). `pathAt(distance)` returns a position, heading and slope.
  Everything else in the world is placed **relative to `pathAt`**. Start with a straight,
  level line in Milestone 1 so it is easy to debug, then add gentle curves and gradients.
- Build **ballast, sleepers and two rails** (sleepers as `InstancedMesh`), a cess (walkway)
  either side, **lineside fences**, **telegraph poles**, **mileposts**, and **speed and
  signal furniture**. Two tracks (a passing line at stations) is a later nice-to-have; one is fine.

### Scenery: town and country

Generate scenery from the route data with a **seeded random number generator** (same seed,
same world, so bugs are reproducible), in **chunks** (about 100 m) built ahead of the train
and **recycled** behind it. Never build the whole route at once, and **dispose** geometries and
materials you throw away.

**Country:** rolling fields in two or three greens and a ploughed brown; hedgerows and drystone
walls dividing them; hedgerow trees and small woods (oak, a few conifers; simple low-poly
shapes); a farm with a barn and a farmhouse; sheep or cows as small grey and white or black
and white blocks; hills on the horizon; a stream under a small bridge; a road crossing.

**Village** (with a small halt station): a church with a square tower, a pub, a dozen stone cottages
on a lane, a level crossing with gates and a road, a couple of cars waiting.

**Town** (with the main station): terraced brick houses in rows, a factory or mill with a
chimney, a gasworks holder, a road bridge over the line, allotments and back gardens along the
lineside, warehouses, a footbridge, a busier station with two platforms, a canopy and a
clock, and platform-end signals. Buildings are simple boxes with pitched roofs, a few colours, a
window texture drawn on a canvas.

**Sky and light:** a vertical gradient sky, a few soft cloud sprites, a sun, and `THREE.Fog`
matching the horizon so the far distance fades. Fixed pleasant morning light. (Weather and
time of day are a later extra.)

### Performance budget (the Pi 5 is the target)

- Aim for **60 fps at an internal 1280x720**, scaled up by CSS to the TV.
  `renderer.setPixelRatio(1)`, `antialias: false` (or off by default on the Pi).
- **At most about 200 draw calls and about 250,000 triangles** on screen. Read them from
  `renderer.info.render` and print them in the F1 readout.
- **Merge** static geometry per chunk with `mergeGeometries` (vertex colours), and use
  `InstancedMesh` for repeated things (sleepers, poles, fence posts, trees, houses).
- **Adaptive resolution** as in RC Flight Line: measure frame time, and scale the render size
  between 50% and 100% to hold the frame rate. Expose `QUALITY` in config
  (`"low" | "medium" | "high"`: view distance, prop density, resolution) and default to
  `"medium"`.
- If a Pi test shows the frame rate too low, reduce in this order: resolution scale, view
  distance and fog, prop density, then geometry detail.

## 9. Gameplay

The first version is a **driving sim with a score**, not just a viewer.

- **A journey** of about 10 to 12 miles: start in the country, stop at a village halt, go on
  through more country and into the town, stop at the main station.
- **Stopping** at a station: stop with the locomotive's nose beside the **stop marker**. Score by
  how close: within 5 m is "Perfect".
- **Speed limits** with lineside signs. Going over costs points and the HUD limit flashes.
- **Signals** (colour light: green, double yellow, yellow, red) and **AWS** (Milestone 4). The
  sunflower goes black then, on a caution, the horn sounds and B acknowledges it, or the train
  is brought to a stop. Passing a red signal ends the run ("Signal passed at danger") with the
  reason shown kindly.
- **Passenger comfort:** harsh braking (too high a deceleration change) costs a little.
- A **results screen** at the end with the stop accuracy, the speed-limit record, comfort and
  total, and "Press A to drive again".
- Keep the score simple and readable, and make its numbers tunable in `config.js`.

## 10. Sound (all synthesised, Web Audio)

- **Diesel engine.** A 12-cylinder four-stroke firing frequency is `rpm / 60 * 6`: about **45 Hz
  at idle (450 rpm) rising to about 75 Hz (750 rpm) at full power**. Build a rough rumble from a
  low sawtooth or a filtered noise pulse train at that frequency, low-passed, with a little
  turbo whistle rising with power. The pitch and volume follow the **throttle**, with a lag
  (engines take time to rev).
- **Wheel clatter:** rail joints every 18.3 m (60 ft), so the click rate is `speed / 18.3` per
  second, in a rhythm.
- **Two-tone horn** (A, or H and J): two steady tones a major third apart, around 340 and
  425 Hz. **Brake hiss** noise following changes in brake pressure. A quiet **wind** noise
  rising with speed. **AWS**: bell (clear) and horn (warning).
- A master volume in `config.js`. Never clip. Add an **offline-render audit** hook that
  renders a few seconds through an `OfflineAudioContext` and reports peak and RMS, as the ROLLER
  project does, so loudness is measurable when you can't listen.

## 11. Repo structure

Flat and readable, one small file per idea, none over roughly 300 lines. Copy from
Pi-Platformer with only names changed:

| File | Notes |
|------|-------|
| `run`, `save` | `./run` starts the dev server; `./save "msg"` does add, commit and push. `chmod +x`. |
| `.gitignore` | `node_modules/`, `dist/`, `.DS_Store` |
| `vite.config.js` | `base: "./"` and port 5173 with `strictPort: true`. |
| `.github/workflows/deploy.yml` | Node 22, `npm ci`, `npm run build`, upload `dist`, deploy. |
| `index.html` | Title, empty favicon `<link rel="icon" href="data:,">`, a full-window canvas, `cursor: none`, no scrollbars, black background. |
| `src/controls.js` | Start here and extend with triggers, look stick, buttons. |

Write fresh:

```
src/config.js      every tunable number and colour, with units and a "what changing it does" comment
src/main.js        creates the renderer, the fixed-step loop, and the scenes (start, drive, paused, results)
src/controls.js    gamepad + keyboard -> handle levers, buttons, look
src/units.js       m/s <-> mph, metres <-> miles and yards
src/physics.js     PURE: the train model (no DOM, no Three.js)
src/route.js       the route as data
src/path.js        route -> track centre-line, pathAt(distance)
src/cab.js         the cab model, gauges, levers
src/world/         track.js, terrain.js, nature.js, buildings.js, furniture.js (poles, signs, signals),
                   stations.js, sky.js, chunks.js (build ahead, recycle behind)
src/hud.js         the small overlay
src/audio.js       synthesised sound
src/scoring.js     stop accuracy, limits, comfort, results
src/debug.js       performance readout (F1) and, in dev only, window.__sim for tests
tools/check-physics.js   Node test of the train model (section 14)
tools/check-route.js     Node check that the route data is sane
docs/                     (leave empty; the brief lives in the Pi-Platformer repo)
README.md          for an 11-year-old (section 13)
```

## 12. Code style

- Clarity over cleverness. Short functions, descriptive names, **units in names**
  (`speed_mps`, `distance_m`, `mass_kg`).
- Comments explain **why**, not just what. He reads this to learn. Match the tone of
  Pi-Platformer's `player.js` and `controls.js`.
- Data over code: a station is a line in `route.js`.
- All tunables in `config.js`. No magic numbers in logic.
- Small named helper functions instead of long functions. No deep class hierarchies; plain
  objects and functions.
- No TypeScript, no shader code, no clever build steps.

## 13. README (for an 11-year-old)

Same shape as Pi-Platformer's. Friendly, short sentences.

1. What this is, and the Pages link.
2. **Start the game** (`./run`, open the Network address on the Pi, press A).
3. **Controls:** a table for the F310 (with the four throttle/brake buttons front and centre)
   and for the keyboard.
4. **How to drive a train** in five steps: put the reverser to Forward; release the brake;
   squeeze RT to add power; ease off with RB and coast; and **brake early**, because trains
   are heavy and take a long time to stop.
5. **Your first change:** in `src/config.js` change `COACHES` from `8` to `3` (a lighter train
   accelerates faster and stops sooner) or to `12`. Then `TOP_SPEED_MPH`, then the horn pitch.
6. **Where things live:** a table linking every file.
7. **Build your own route:** add a station or a speed limit in `route.js`.
8. **Save your work:** `./save "what I changed"`.
9. **Help, something is wrong:** the terminal shows errors; press F1 for the performance
   readout; press a button on the pad first.
10. **Notes for grown-ups:** stack, how it's played, the Pi Chromium flag for audio, the
    `tools/` checkers, and a link to the brief.

Per CLAUDE.md, every file you add is linked from the README.

## 14. How to verify (do all of this)

**Headless Chrome.** `NODE_PATH=/home/brendan/Claude_sandbox/node_modules`; puppeteer and
Chrome are already installed. WebGL needs
`{ headless: 'new', executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--mute-audio'] }`.
(Plain `--use-gl=swiftshader` gives "WebGL not supported".) Use a small viewport (for example
640x360) so software rendering is quick. Headless frame rates are **meaningless as a Pi
performance measure**; use them only to check that it draws.

**Fake the F310.** With `page.evaluateOnNewDocument`, override `navigator.getGamepads` to return
`[{ connected: true, mapping: 'standard', axes: [0,0,0,0], buttons: [...] }]` with buttons as
`{ pressed, value }` objects that your test mutates (set `.value` for the triggers). See how
Pi-Platformer's tests did it. Check the start screen with no pad, with `mapping: 'other'`, and ready.

**A debug hook.** Three.js has no `get()` global. In **dev builds only**
(`if (import.meta.env.DEV)`), expose `window.__sim` with the physics state (speed, handles,
distance) and a few setters (teleport to a distance, set the reverser). Tests use it.

**Tests to run and pass:**

1. **Control mapping.** Hold RT (`value` 1) for 3 s: power handle rises, speed rises. RB: handle
   falls. LT: brake handle rises. LB: it falls. Half-pull RT raises it about half as fast. Let go: the
   handle stays put.
2. **Physics** (`node tools/check-physics.js`, pure Node): on level track with the default
   train (8 coaches), full power from rest reaches **60 mph in roughly 90 to 180 s** and settles
   **below** the 95 mph limit (about 80 to 92 mph); with no coaches it reaches 95 mph in well under
   a minute to 60; coasting slows only gently; a full service brake from 60 mph stops in **roughly
   500 to 750 m**; the emergency brake stops it in **roughly 300 to 450 m**; a 1-in-50 climb slows
   the 8-coach train to roughly 35 to 45 mph. Assert ranges, not exact values. If you change the
   numbers, keep these passing and explain why.
3. **Route data** (`node tools/check-route.js`): distances ascending, stations not overlapping,
   signals not inside platforms, speed limits cover the whole line, gradients not absurd.
4. **Screenshots, and read them:** the start screen (three pad states); the cab at rest; the
   country at 500 m; the village station; the town; the station stop. Confirm the speedometer and
   levers actually move. Confirm nothing is upside down, mirrored, black or z-fighting.
5. **Budget:** print `renderer.info.render.calls` and `.triangles` at a few points along the
   route and confirm they are inside section 8's budget.
6. **Streaming:** teleport far along the route and confirm chunks build ahead and free behind,
   with no console errors and no growth in `renderer.info.memory.geometries` over a long run.
7. **No errors:** zero `pageerror` and zero failed requests, on the dev server, on
   `npm run build` served by `npm run preview`, and on the deployed Pages URL.

**Housekeeping.** Run **one** headless browser at a time; parallel runs make software rendering
lag and results meaningless. Don't run `pkill -f vite` from the Bash tool: the pattern matches
the shell's own command line. Find the process with `pgrep -f "[n]ode.*vite"` and kill the PIDs.

## 15. Milestones

Commit and push after each one. Keep `README.md` current as you go.

**Milestone 0: set up.** Scaffold, copy the shared files, `config.js` skeleton, an empty
scene that clears to sky blue, `./run` works, the repo exists on GitHub with Pages enabled and
the workflow green (section 16). A "Hello" page live on Pages proves the pipeline before any
game exists.

**Milestone 1: first deliverable, then STOP for the Pi.** The **cab and a stretch of country
line**: the cab model with working speedometer, brake gauges, ammeter and moving power, brake
and reverser levers; the F310 mapping in section 5 fully working with keyboard fallback and the
start screen; the physics in section 6 with `tools/check-physics.js` passing; **about 5 miles of
country**: straight and level first, ballast, sleepers, rails, poles, fences, mileposts, fields,
hedges, trees, sky, fog, chunk streaming; the F1 performance readout and adaptive resolution; a
basic HUD; the README; deployed to Pages; indexed in JW. Then hand over for a real Pi test.

**Milestone 2: village, town and stations.** Village and town scenery; the halt and the main
station; stop markers; station-stop scoring; the results screen; gentle curves and a few
gradients; a level crossing, bridges.

**Milestone 3: speed limits and signals.** Speed-limit signs and scoring; colour-light signals
with aspects; SPAD handling; passenger comfort.

**Milestone 4: sound and safety kit.** Everything in section 10; AWS sunflower, bell and horn with
the B button; the audio-suspended fallback; the offline-render audit.

**Milestone 5: polish.** Look-around comfort, headlight beams, wipers, a second route or
weather as ideas, whatever Brendan and his son ask for next.

## 16. Publishing, indexing and memory

**Create and publish, in this order** (as Pi-Platformer):

1. `gh repo create BrendanJamesLynskey/Class-47-Cab-Sim --public --description "A first-person British diesel (Class 47) driving simulator for the Raspberry Pi, built to be edited by a beginner" --source=. --remote=origin`
2. **Enable Pages before the first push**, or the first workflow run fails at "Setup Pages":
   `gh api --method POST repos/BrendanJamesLynskey/Class-47-Cab-Sim/pages -f build_type=workflow`
   (if you forgot: enable it, then `gh workflow run deploy.yml --ref main`).
3. Commit, then `git push -u origin main`.
4. `gh run watch <id> --exit-status`, then load
   `https://brendanjameslynskey.github.io/Class-47-Cab-Sim/` in puppeteer and confirm it starts
   with no `pageerror` and no failed requests. A 200 from `curl` is not enough.
5. End commit messages with the `Co-Authored-By` line your session's attribution instructions
   give you.

**Index it from JW** (Brendan's project index): edit `~/JW/README.md` (repo
`BrendanJamesLynskey/JW`). The Pi Platformer entry there currently links to this brief. Add a new
`## Class 47 Cab Simulator` section at the end, in the same shape as the others: a paragraph
describing the game, then
`[Play it here](https://brendanjameslynskey.github.io/Class-47-Cab-Sim/) &middot; [View on GitHub](https://github.com/BrendanJamesLynskey/Class-47-Cab-Sim)`,
then a `### Controls` table for the F310. Do this at the end of **Milestone 1**, and update the
paragraph as the game grows. Leave `~/JW/index.html` alone (it is the A-10 game). Commit
`Index Class 47 Cab Simulator in the projects README` and push.

**Remember it:** write a memory file `project_class47_cab_sim.md` in
`~/.claude/projects/-home-brendan-Claude-sandbox/memory/`, add a one-line pointer to `MEMORY.md`,
following `project_pi_platformer.md`. Record what you learn that isn't in this file.

## 17. Milestone 1 handover (what to tell Brendan)

Give Brendan a short, exact checklist for the Pi, and say which numbers to report back:

1. On the Ubuntu box: `cd ~/Claude_sandbox/Class-47-Cab-Sim && ./run`.
2. On the Pi, start Chromium with `--autoplay-policy=no-user-gesture-required` and open the Network address.
3. F310 in X mode; press A; check RT, RB, LT, LB and the D-pad reverser move the levers.
4. Press **F1**: report the frame rate, the draw calls, the triangles and the resolution scale the game settled on.
5. Say whether it feels smooth, whether the picture is sharp, and whether it looks like a cab.
6. Try the Pages URL too.

Then say honestly what you verified (headless, fake pad, physics checks, screenshots) and what
you did **not** (a real F310, the real Pi, real performance, real audio).

## 18. What is proven and what is not

- **Proven:** the pattern. Pi-Platformer runs on the real Pi 5 with the real F310 (2026-09-20). The
  gamepad polling in `controls.js` works there.
- **Not proven:** 3D performance on the Pi for this scene. RC Flight Line reaches 60 fps there, so
  it should be achievable, but it must be measured (Milestone 1 handover). Also unproven: audio on
  the Pi without the autoplay flag; the trigger `value` behaviour on the Pi's Chromium (check that
  triggers report analogue values; if they only report `pressed`, fall back to a fixed rate).

## 19. Done means

- `./run` puts the cab on the Pi; the F310 drives it exactly as in section 5; the start screen says
  when the pad isn't ready.
- The physics checks pass, the route checks pass, and the tests in section 14 pass.
- `npm run build` is clean and the deployed Pages site loads and plays.
- The README links every file and its first-edit walkthrough actually works.
- Every number he'd want to tweak is in `config.js`, not buried in logic.
- It is indexed in `~/JW/README.md`, pushed, and remembered in the memory files.
- You have reported plainly what you verified, what you didn't, and what Brendan should try on the Pi.
