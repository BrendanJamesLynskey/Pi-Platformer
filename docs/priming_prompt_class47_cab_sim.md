# Priming prompt: Class 47 Cab Simulator

How to start the session, then the prompt to paste as your first message.

## Start it

```bash
cd ~/Claude_sandbox
claude --model sonnet
```

(`~/Claude_sandbox` is where `CLAUDE.md` lives, so its repo rules load automatically.)

## Paste this

```
You are starting a new project in ~/Claude_sandbox: a first-person British diesel
(Class 47) driving simulator that my 11-year-old son will play on a Raspberry Pi 5
with a Logitech F310 and edit himself as he learns to code.

The full brief is here. Read all of it before doing anything else:

@~/Downloads/directions_class47_cab_sim.md

Then read, in this order:
1. ~/Claude_sandbox/CLAUDE.md (repo rules)
2. ~/Claude_sandbox/Pi-Platformer: README.md, src/controls.js, src/config.js,
   .github/workflows/deploy.yml, run, save, tools/check-levels.js. It is the finished, working
   template (tested on the real Pi), and you are following its pattern.
3. Your memory notes on the Pi-Platformer project and on verifying web apps with puppeteer.

How I want you to work:
- The brief has already made the design decisions. Don't re-ask them. Choose sensible defaults
  for anything unspecified, record the choice, and carry on. Ask me only if you are truly blocked.
- Work through the milestones in section 15, in order. Do Milestone 0 and Milestone 1, then STOP.
  Milestone 1 ends with me testing on the real Pi, so finish it with the handover checklist in
  section 17 and don't start Milestone 2 until I say so.
- Verify for real: headless Chrome with the WebGL flags in section 14, a fake F310, and screenshots
  that you actually open and look at. A clean build proves nothing about how it looks or plays.
- Check Three.js APIs against the installed copy in node_modules before using them.
- Commit and push after each milestone (with the Co-Authored-By line from your attribution
  instructions), create the repo and enable Pages in the order given in section 16, and add the
  JW index entry at the end of Milestone 1.
- Report plainly: what you verified, what you did not, and what I need to try on the Pi.

Start by telling me, in a few lines, your plan for Milestone 0, then begin.
```

## Notes for Brendan

- The brief is at `~/Downloads/directions_class47_cab_sim.md` (a copy of
  `docs/directions_class47_cab_sim.md` in the Pi-Platformer repo, which is the master).
- Milestone 1 ends with a Pi test. Start Chromium on the Pi with
  `--autoplay-policy=no-user-gesture-required`, or the sound may stay silent.
- The brief asks the new session to report the frame rate, draw calls and resolution scale from
  the F1 readout on the Pi. Those numbers decide whether the scenery needs trimming.
