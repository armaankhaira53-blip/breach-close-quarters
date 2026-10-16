BREACH / DETAIL UPDATE 04
Created and owned by Arkh_53

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file), then click DEPLOY.
Desktop keyboard/mouse and WebGL required. Runs offline without dependencies.

CONTROLS
WASD move; mouse look; left click attack/use; right click aim; R reload.
Shift sprint; C toggle crouch; C while sprinting slide; Space jump.
1/2/3 select Primary/Secondary/Equipment; mouse wheel cycles those slots.
G uses equipped equipment. I opens the scrollable inventory/shop. Escape pauses.
F spins the equipped karambit for inspection. Attacking cancels inspection.

DETAIL UPDATE
All fifteen inventory items have rebuilt, beveled component models with distinct
metal, paint, rubber, fabric, wood, skin and glass shading. Detailed gloves, armor,
helmets, close-range NPC weapons, drones, mines and industrial arena trim are added.
Karambit: one full ring-pivot spin over 0.72s when equipped, followed by a settled
grip; attacking uses a slash and recovery motion. F performs two inspection spins
over 1.2s. Animations freeze while paused and do not modify the player camera.
Reloads animate magazines, bolts/slides, the revolver cylinder, shotgun barrels
and RPG rocket. Original combat values and collection data are preserved.
Graphics selector: Low / Balanced / High / Ultra. High is the default. Pixel
budgets prevent unlimited supersampling; choose Balanced or Low on slower hardware.
This is detailed procedural art, not photorealistic scanned models or textures.

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
61 automated checks pass, including weapon/equipment behavior, 10,000 wave plans,
karambit spin/attack/pause behavior, finite geometry, unit normals and cached buffers.
Package checks and standalone synchronization pass. These checks use mocked WebGL.
Opera GX preview automation was interrupted by repeated user-input detection and
a minimized window; recovery did not permit loading Update 04. Its actual GPU
rendering, animation appearance, sound playback, camera feel and FPS remain unverified.
Custom sounds and models are procedural. The NPC hurt voice is synthetic.
Single-player only; no server or multiplayer. GitHub main is the publication target;
the existing Vercel integration builds and serves dist/.
