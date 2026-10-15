BREACH / CLOSE QUARTERS

PLAY
Open BREACH.html in a desktop browser with WebGL enabled, then click DEPLOY.
The game is self-contained and can run offline. No installation is needed.
Mouse and keyboard are required. Press Escape to release your mouse and pause.

CONTROLS
WASD: move
Mouse: look
Left click: shoot (hold for automatic rifle fire)
Right click: aim down sights
Shift: sprint
C while sprinting: slide
Space: jump
R: reload
1: AR-4 assault rifle (30 rounds)
2: Glock 19 sidearm (15 rounds; click per shot)
3: select fragmentation grenade; left click to throw
G: quick-throw grenade
Escape: pause

GAMEPLAY
Survive increasing waves in a compact 36 x 44 metre industrial arena.
Enemies use sight and sound, flank, strafe, seek cover, peek, and evade grenades.
They fire aimed bursts, avoid firing through allies, and reload their weapons.
Headshots deal extra damage. Cover blocks bullets and grenade damage.
Grenades bounce and explode after a short fuse; close explosions hurt you too.
Enemies and the player collapse into jointed physics ragdolls on death.
Blood particles, muzzle flashes, bullet tracers, shell ejection, weapon recoil,
reload movement, synthesized sound, and hit markers provide combat feedback.
The tactical update adds spring-based weapon recoil, aim-linked bullet recoil,
weapon sway, animated sidearm slides, and more detailed weapons and soldiers.
The arena has directional shadows, procedural surface shading and sky,
container door hardware, drainage grates, fencing, and additional trim.
Sprint uses stamina. Sliding consumes stamina and briefly lowers your view.
Health regenerates after five seconds without damage. Cleared waves restore
health and replenish ammunition and grenades. The death screen lets you restart.
Choose Recruit, Regular, or Veteran and set mouse sensitivity before deployment.

FILES
BREACH.html: single-file offline game
dist/: editable HTML, CSS, and JavaScript sources
check.cjs: Node simulation checks
build.cjs: rebuild BREACH.html from dist/ using Node.js

VERIFICATION
All 22 simulation checks passed, including flanking, cover selection, grenade
evasion, AI movement, recoil recovery, and the existing combat controls.
The checks use a mocked WebGL context; they do not verify real GPU rendering.
The upgraded arena and weapon were inspected in Opera GX. Final graphical QA
after sky and AI refinements remains incomplete because Computer Use was stopped.
Standalone HTML/source synchronization is checked by check.cjs.
Vercel preparation updated 2026-10-14. Run npm run build to rebuild the
standalone file, run the 22 simulation checks, and validate public assets.
Only dist/ is served. No runtime secrets, database, backend, or package
dependencies are required. Node 24 is used for build-time checks only.

PUBLIC SOURCE
The repository is intended to be public. Local deployment records, credentials,
environment files, backups, and tooling metadata are excluded by .gitignore.
Ignore rules do not remove files already tracked by Git or erase Git history.
Never put secrets in dist/ or BREACH.html: browser game code is public.

This is an original stylized browser FPS prototype, with no Call of Duty assets.
