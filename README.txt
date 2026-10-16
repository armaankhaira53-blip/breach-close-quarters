BREACH / ARSENAL UPDATE 03
Created and owned by Arkh_53

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file), then click DEPLOY.
Desktop keyboard/mouse and WebGL required. Runs offline without dependencies.

CONTROLS
WASD move; mouse look; left click attack/use; right click aim; R reload.
Shift sprint; C toggle crouch; C while sprinting slide; Space jump.
1/2/3 select Primary/Secondary/Equipment; mouse wheel cycles those slots.
G uses equipped equipment. I opens the scrollable inventory/shop. Escape pauses.

COLLECTION
Shop Info shows all fifteen rewards and exact odds. Crates cost earned credits.
Three slots only, one per category. Owned items stay owned when replaced.
During a run, loadout changes apply at the next wave; swaps never refill supplies.
Progress saves in this browser. Use Armory > Save and restore collection to export
before moving the file or changing browsers. Import merges rather than deletes.

FILES
BREACH.html: updated self-contained game.
dist/: maintained HTML/CSS/JavaScript source (only these files are served).
BALANCE-AND-TESTS.txt: exact probabilities, wave rules, balance, tests and limitations.
build.cjs: synchronizes the standalone HTML. check.cjs + qa-tests.cjs: simulation tests.
production-check.cjs: verifies public assets and absence of diagnostic controls.
Run npm run build (Node 24) to rebuild and run all checks.
Local development copies also retain build-qa.cjs, the isolated QA-arsenal.html,
and backup-2026-10-15/. These local-only files are excluded from the public repo.
Never place a diagnostic harness in dist/.

STATUS
51 simulation checks pass, including weapon/equipment behavior and 10,000 wave plans.
Package checks and standalone synchronization pass. Real-browser playtesting was
blocked by the Computer Use runtime's browser-URL verification failure. Rendering,
sound playback, dance recognizability, camera feel and real FPS remain unverified.
Custom sounds and models are procedural. The NPC hurt voice is synthetic.
Single-player only; no server or multiplayer. No hosted publication in this task.
