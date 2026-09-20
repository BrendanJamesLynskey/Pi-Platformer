# Project: Son's Train Simulator

Directions for a future Claude Code session. Read all of it before writing code.

This is the **second** project of its kind. The first, `Pi-Platformer`, is finished
and is the working template: same machine, same way of playing, same way of
editing, same kind of readable code. Follow its pattern rather than inventing a new
one. Where this file says "as Pi-Platformer", look at that repo:

- Working copy: `~/Claude_sandbox/Pi-Platformer`
- GitHub: https://github.com/BrendanJamesLynskey/Pi-Platformer
- Live: https://brendanjameslynskey.github.io/Pi-Platformer/

## Goal

A train simulator, built as a web app, that my 11-year-old son plays on a
Raspberry Pi 5 in his room (TV + Logitech F310 gamepad) and edits himself as he
learns to code. He uses a laptop/keyboard at the Pi to make changes; I review and
help via the Ubuntu box running Claude Code.

It must stay **readable and editable by a beginner**. That matters more than
realism or features. He will open the files and change numbers.

## Decisions to settle first (ask me, don't guess)

The brief above is deliberately open. Before building, use AskUserQuestion for the
things that change the whole design. Recommend a default for each so I can just say yes:

1. **View.** Recommended: **2D side-on** (like the platformer: the train runs along
   the track and the screen scrolls). Alternatives: top-down track layout, or a 3D
   driver's-cab view. 3D is a big step up in code he can read and in Pi performance,
   so only do it if I ask.
2. **What you drive.** Recommended: **the steam locomotive from Pi-Platformer**
   (`drawEngine()` in `src/player.js`), reused so it feels like his world.
3. **What the game is about.** Recommended: **drive a route, stop accurately at
   stations, obey signals and speed limits, earn a score**, with several routes of
   increasing difficulty (heavier train, steeper hills, more signals, tighter
   timetable).

Don't ask more than these. Pick sensible defaults for everything else and say so.

For railway realism and vocabulary, my other projects are good references. Skim them,
don't copy their complexity (they are large single-file apps): 
`~/Claude_sandbox/Airedale-Wharfedale-Sim` (3D driver sim, real routes),
`~/Claude_sandbox/Yorkshire-Line-Editor` (a JSON line format for that sim),
`~/Claude_sandbox/UK-Railtour-Manager`.

## Stack

Exactly as Pi-Platformer:

- **KAPLAY** (https://kaplayjs.com/) + **Vite**, **plain JavaScript** (not TypeScript).
  Node 22+ is installed.
- Scaffold: `npx create-kaplay@latest -s 2 <RepoName>` (it runs non-interactively).
  Then delete the sample `public/sprites/bean.png` and replace the generated
  `src/main.js`, `README.md`, `vite.config.js` and `package.json` (see below).
- Repo name: `Pi-Train-Sim` unless I say otherwise. GitHub account
  `BrendanJamesLynskey`. It lives on my account because he is under GitHub's minimum age.
  **Public** (GitHub Pages needs it). Never put my son's name or any personal
  detail in the repo, README, commit messages or the site.
- Working copy in `~/Claude_sandbox/<RepoName>`.

## How this gets played

Identical to Pi-Platformer:

- The Pi does **not** run the dev server or build anything. It is a display + input
  device only: Chromium pointed at either the Vite dev server on this Ubuntu box
  (development) or the GitHub Pages site (stable / kiosk).
- Dev workflow: `./run` here (`npm run dev -- --host`, port **5173**, `strictPort`),
  then open `http://<this-box>:5173` in Chromium on the Pi. Find the address with
  `hostname -I` (it was `192.168.1.132`, and the hostname was `bren-ubuntu24-04`; both may
  change). Saving a file reloads the page on the TV.
- GitHub Actions builds and deploys to GitHub Pages on every push to `main`.

## Gamepad (Logitech F310, switch on X)

Same as Pi-Platformer. `src/controls.js` there is the model: it polls
`navigator.getGamepads()` every frame, insists on `mapping === "standard"` and tells
the player on the start screen if the pad isn't found or is in the wrong mode. Reuse it
and extend it; keep the keyboard fallback.

Standard-mapping indices (F310 in X mode):

| Input | Index |
|-------|-------|
| A / B / X / Y | buttons 0 / 1 / 2 / 3 |
| LB / RB | buttons 4 / 5 |
| **LT / RT (triggers)** | buttons **6 / 7**, use `.value` (0 to 1) for how far they are pressed |
| Back / Start | buttons 8 / 9 |
| D-pad up / down / left / right | buttons 12 / 13 / 14 / 15 |
| Left stick X / Y, right stick X / Y | axes 0 / 1 / 2 / 3 (apply the 0.15 deadzone) |

Suggested train mapping (change it if a better one occurs to you): **RT = throttle,
LT = brake** (analogue, so he feels the difference between a gentle and a hard pull),
**A = whistle/horn**, **Start = pause**, left stick or D-pad for menus. Keyboard: up/down
for throttle/brake, Space for the horn.

Reminders: no gamepad events exist, so poll every frame. Browsers hide the pad until
a button is pressed once, so keep a "press A to start" screen.

## Repo structure

Flat, and the same shape as Pi-Platformer so he already knows where things are.

Copy these from Pi-Platformer with only the names changed:

| File | Notes |
|------|-------|
| `run` and `save` | `./run` starts the dev server; `./save "message"` does add, commit and push. Keep `chmod +x`. |
| `.gitignore` | `node_modules/`, `dist/`, `.DS_Store` |
| `index.html` | Set the `<title>` and keep the empty-favicon `<link rel="icon" href="data:,">` (stops a 404 in the console). |
| `vite.config.js` | `base: "./"` (works on GitHub Pages) and port 5173 with `strictPort`. |
| `package.json` | Minimal: `kaplay` and `vite`, scripts `dev` / `build` / `preview`. Set `"type": "module"`. |
| `.github/workflows/deploy.yml` | Node 22, `npm ci`, `npm run build`, upload `dist`, deploy. |
| `src/controls.js` | Extend with the triggers (`.value`) instead of rewriting. |

Write fresh, following Pi-Platformer's pattern:

- `src/config.js`: **every tunable number and colour** (train mass, engine power, brake
  strength, max speed, screen size, colours). He changes numbers here first.
- `src/main.js`: creates KAPLAY, registers the scenes (start, game, results), nothing else.
- One small file per idea: e.g. `src/train.js` (the train and how it looks),
  `src/physics.js` (speed, acceleration, braking, gradient, with the formula in a comment),
  `src/routes.js` (each route as data, like `levels.js`), `src/world.js` (builds a route
  on screen), `src/signals.js`, `src/hud.js`.
- `README.md`: written for an **11-year-old**, like Pi-Platformer's. How to start it,
  the controls, one first successful edit (e.g. make the train more powerful in
  `config.js`), where each file lives (link every file), how to build a route, how to
  `./save`, and a "Help, something is wrong" section. A short "Notes for grown-ups"
  section at the end.
- `docs/`: no need to copy this file.

Per `CLAUDE.md` in `~/Claude_sandbox`: match the style of neighbouring repos, **update
the README to link any new files**, and **commit and push to GitHub** after changes.

## Code style

- Clarity over cleverness. Short functions, descriptive names.
- Comments explain **why**, not just what. He reads this to learn. Pi-Platformer's
  `player.js` and `controls.js` are the tone to match.
- Data over code where possible: a route is a list, edited like Pi-Platformer's ASCII
  level maps. He should be able to add a station by adding a line.
- Isolate tunable numbers in `config.js`. No magic numbers in logic.
- No TypeScript, no build cleverness, no frameworks beyond KAPLAY.

## First deliverable

A minimal playable scene, not a finished game: **a train on a stretch of track with
scrolling scenery, an analogue throttle and brake on the F310 triggers with believable
inertia, a speedometer, and one station to stop at with a simple score**, running on
the Pi via `./run` and live on GitHub Pages. Get it running and looking intentional.
Then add features in this order, one commit each, checking with me between them:

1. Stations: stop on the platform mark, score for accuracy.
2. Signals and speed limits (red means stop; over the limit costs points).
3. Several routes of increasing difficulty; gradients; heavier trains.
4. Sound, synthesised with Web Audio (no audio assets): a chuff whose rate follows
   the speed, a whistle. See the note on suspended audio contexts in the gotchas below.
5. A route selector, then his own ideas.

## Reuse from Pi-Platformer

`src/player.js` has `drawEngine()`: a drawn steam locomotive with spinning wheels, a
connecting rod and steam puffs. Reuse it as the train's picture. Check the wheel-spin
and steam-puff rate follow speed rather than key presses. `src/tiles.js` has track,
brick and girder-bridge pictures that fit a railway backdrop.

## Hard-won lessons (read these before you debug for an hour)

**KAPLAY**

- **`k.go()` clears handlers registered outside a scene.** A global `k.onUpdate` silently
  stops after the first scene change. Pi-Platformer wraps `k.scene` in an `addScene()`
  helper that registers the per-frame gamepad update inside every scene.
- **`anchor("bot")` moves custom `onDraw` output** by the shape's height when there is no
  `rect()`. Pi-Platformer drops the anchor and defines an explicit
  `area({ shape: new k.Rect(...) })` so `pos` is simply the feet.
- Custom drawing: `player.onDraw(() => ...)` or an object with a `draw()` method.
  Coordinates are local to the object. Use `k.pushTransform()` / `k.pushScale(-1, 1)` /
  `k.popTransform()` to flip a picture.
- Draw calls add up on a Pi. Off-screen tiles skip drawing (see `solidTile()` in
  `tiles.js`). Do the same for long routes.
- `kaplay()` defaults to `global: true`, so tests can call `get("player")`, `go(...)`, `vec2(...)`
  from puppeteer. The game code itself uses the `k.` prefix.
- **Collision resolution pushes out the short way.** Landing on the corner of a block
  can shove a body sideways instead. Relevant for anything that jumps; not for a train
  on rails, but remember it.
- Polygons must be convex. `k.circle()` is drawn from its centre, tiles from their
  top-left, so nudge accordingly.

**Audio**

- A gesture-created `AudioContext` can still be `suspended` on mobile; UI that
  follows the transport must follow the clock. See the memory note "Web Audio on
  mobile". The start screen's "press A" is your user gesture.

**Testing (do this; don't declare done from a clean build)**

- Chrome and puppeteer are installed. `NODE_PATH=/home/brendan/Claude_sandbox/node_modules`.
- KAPLAY needs WebGL, and plain `--use-gl=swiftshader` gives "WebGL not supported".
  Launch with `{ headless: 'new', executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--mute-audio'] }`.
- Fake the F310 with `page.evaluateOnNewDocument` overriding `navigator.getGamepads`
  to return an object `{ connected: true, mapping: 'standard', axes: [...], buttons: [{pressed, value}...] }`
  you control from the test (and set `.value` for the triggers). Screenshot the start
  screen with the pad missing, in the wrong mapping, and ready.
- Drive the game from the test using the globals (`get(...)`, teleporting an object with
  `pos = vec2(...)`), and **read the screenshots**. A build passing says nothing about
  how it looks.
- Run one headless browser at a time. Several at once make swiftshader lag, and any
  timing based test then gives meaningless results.
- Pi-Platformer's `tools/check-levels.js` is an example of a checker that proves data
  can be completed, using the numbers from `config.js`. If routes have a
  "can this be finished with this train?" question (braking distance to a signal,
  a hill too steep for the engine), write a similar checker: a hill that is impossible to
  climb, or a stop that is impossible to make, is a bug I will not find until he does.
- Don't run `pkill -f vite` from the Bash tool: the pattern matches the shell's own
  command line and kills it. Use `pgrep -f "[n]ode.*vite"` and kill the PIDs.

**Publishing (order matters)**

1. `gh repo create BrendanJamesLynskey/<RepoName> --public --description "..." --source=. --remote=origin`
2. **Enable Pages before the first push**, or the first workflow run fails at
   "Setup Pages" with "Get Pages site failed":
   `gh api --method POST repos/BrendanJamesLynskey/<RepoName>/pages -f build_type=workflow`
   (if you forgot: enable it, then `gh workflow run deploy.yml --ref main`).
3. Commit and `git push -u origin main`.
4. `gh run watch <id> --exit-status`, then load
   `https://brendanjameslynskey.github.io/<RepoName>/` in puppeteer and confirm the game
   starts with no `pageerror` and no failed requests. A 200 from `curl` is not enough.
5. Commit trailer: end commit messages with the `Co-Authored-By` line your session's
   attribution instructions give you.

**Index it and remember it**

- Add the project to my index: `~/JW/README.md` (repo `BrendanJamesLynskey/JW`). Add a
  `## <Name>` section at the end, in the same shape as the others: a paragraph, then
  `[Play it here](<Pages URL>) &middot; [View on GitHub](<repo URL>)`, then a
  `### Controls` table. Leave `~/JW/index.html` alone, it's the A-10 game. Commit
  "Index <Name> in the projects README" and push.
- Write a project memory file (`project_<name>.md`) and add a one-line pointer to
  `MEMORY.md`, as `project_pi_platformer.md` does. Add anything you learn that isn't here.

## What is not yet proven

Be honest about these in your final report:

- As of this brief, Pi-Platformer has been tested with a **fake** gamepad in headless
  Chrome, not with a real F310 on the real Pi 5. If I have since told you it works,
  fine. If not, say the same about this project.
- Performance on the Pi is estimated, not measured. RC Flight Line holds 60 fps there,
  so a 2D KAPLAY scene should be fine, but check it once it's running.

## Done means

- `./run` shows it on the Pi; the F310 drives it; the start screen tells him when the pad
  isn't ready.
- `npm run build` is clean and the deployed Pages site loads and plays.
- README links every file and includes a first-edit walkthrough that actually works.
- `config.js` holds all the numbers; nothing he'd want to tweak is buried in logic.
- It is indexed in `~/JW/README.md` and pushed.
- You have reported what you verified, what you didn't, and what I need to try on the Pi.
