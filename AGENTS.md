# BREACH project notes

- For expanded crate tables, compare the random roll against cumulative fractional thresholds. Flooring a floating-point product can select the previous item at an exact boundary; test every interval start and end and require a 10,000 total.
- Lifetime waves must be recorded on the final credited enemy death before a same-frame player death can interrupt the wave timer. Keep the wave identifier guard and test immediate death, menu exit, and fresh-session reload. Personal Stats should show current normal-profile values if a storage write fails; never overwrite unreadable save bytes with defaults.
- The Arsenal Update 11 does not add authentication. Aanav2453 and Khibanyan admin grants are pending an identity-provider/backend decision. Never grant them privileges from the editable callsign. Arkh_53 remains the pre-existing public, unsaved sandbox; its invincibility is a sandbox test capability, not verified administrator access.

- Horizontal player and navigation collision checks must exclude the floor plane. After editing collision code, run check.cjs and verify movement and a route across the arena.
- Read and write source files explicitly as UTF-8. Windows PowerShell default decoding can corrupt multiplication signs and middle dots; inspect the HUD text after scripted replacements.
- The game uses a self-contained WebGL renderer, with no external dependencies. Keep BREACH.html synchronized with dist/index.html, dist/style.css, and dist/game.js for local delivery.
- check.cjs verifies simulation behavior with a mocked rendering context. Do not describe it as browser or visual verification.
- Use Opera GX for this project's browser playtests, as requested by the user. Verify the loaded local path and update label before inspecting graphics.
- After editing dist/, run build.cjs and check.cjs; the checks must confirm the standalone HTML contains the exact current JavaScript and CSS.
- Never ship simulation mutation controls or references to live arrays through a diagnostic API. Inject test-only access into an isolated QA build, and assert that dist/game.js and BREACH.html expose no such API.
- Wave rewards must use a threshold crossing plus a wave identifier; resupply resets at wave spawn. Check transitions at multiple frame rates and confirm rewards happen once.
- All equipment activation paths share one cooldown and require the playing state. Test quick-use, selected equipment, rapid input, and pause together.
- Loadout changes must not create ammunition. Preserve owned items separately, validate category and ownership, and apply in-run changes at the next wave's resupply.
- Validate player positions before movement and restore invalid positions to a verified safe point. Check non-finite coordinates and out-of-arena recovery.
- expand.cjs and *.inc are one-time upgrade tooling; dist/game.js is the maintained runtime source. Do not regenerate it from old backup files after making direct runtime fixes.
- If the user reports that a local game link does nothing, give the browser's Ctrl+O workflow with the exact verified HTML path rather than repeating the same chat link. Confirm the file exists before providing the path.
- For production asset checks, recursively inventory files, including hidden files, and reject symbolic links. Empty directories are not deployable assets; nested unexpected files must still fail the check.
- Before publishing source, inspect tracked files as well as ignore rules. The existing local Git index tracks .openai/hosting.json and qa-scenario.js despite .gitignore; publish only a reviewed clean snapshot, or remove excluded files from tracking and audit history before pushing it. After browser uploads, compare the recursive remote file list and hashes against the prepared manifest, explicitly checking .gitignore, .vercelignore, and check.cjs; these were missing from the initial manual upload.

- Sprint+C must never fall through to crouch when a slide is unavailable. Test air and low overhead clearance. Sprint is unlimited and slide has no stamina cost or cooldown. Slides are short and decelerating; never extend a slide by holding C.
- Status animations must use the same dressed actor and attachments as normal movement; verify appearance definitions and full rotation through dance, knockdown and death.
- All scope rays must capture aim before applying recoil, and aimed foreground geometry must not obscure the reticle. Test every optic.
- The owner canceled multiplayer and party codes. Keep this release single-player; do not restore network services or paid hosting without a new request. Personal statistics must not be presented as worldwide rankings.
- The exact Arkh_53 username intentionally opens a public local sandbox. Never describe it as private authentication, and verify that sandbox changes cannot overwrite the normal save.
- Personal Stats belongs on the main menu. Worldwide rankings remain a future feature, not an enabled local-only substitute; multiplayer stays canceled.
- Magazine bodies and details must share the same local frame. Reloads must extract clear of the receiver before lateral motion, with the support hand following that frame. Verify idle and reload assembly previews.
- RPG supplies reset to exactly 1 loaded plus 8 reserve every wave. Karambit is 60 damage with a one-hit execution only on a connecting sliding hit against non-SWAT enemies. Every SWAT variant is immune to all karambit damage. Test impact-time, reach, cover and faction immunity together.
- When passing source through a PowerShell pipe to Node, use ASCII script text with Unicode escapes for new non-ASCII strings; verify literal menu/credit text after writing.
- Slide cancel: a second C press ends the slide into movement, and Space ends it into a jump when clear. Respect overhead clearance, cap exit speed, and remove the karambit execution bonus immediately on cancel. Test held-key expiry and real keydown/keyup paths.
- Slide travel direction is locked at initiation. Neither WASD nor mouse aiming may steer an active slide; mouse look remains available to aim. Verify direction and trajectory stay fixed while inputs change.

- Sliding melee must handle body overlap and movement during windup. Record the karambit attack origin even before sliding starts; use body bounds for normal hits after slide expiry/cancel too, without retaining execution damage. Test both mouse/C input orders, moving enemies, point-blank and side contact, pass-through, walls, cancellation and one target per slash at multiple frame rates.

- New arenas must switch cached geometry, collision, navigation and shadows together. Verify connected grids and routes from every spawn at early and 25-member waves; do not change maps during a run.
- Practice targets must not pay credits or update lifetime combat statistics. Test the all-targets-down interval and immediate return to menu before targets respawn, not just the state after respawn. Practice loadouts must never unlock or replace the saved combat collection.

- Enterable structures need two reachable exits and collision matching walls, window sills and roofs. Verify standing traversal through each doorway, enemy paths to room centers and projectile obstruction independently; preserve the range firing lanes when adding cover.

- The player machete is intentionally weak: 25 damage, 1.65m reach, 1s cooldown, no sliding execution. Test full-health human/K9 survival on normal/sliding hits; keep karambit mechanics unchanged when tuning the machete.

- Rocket boosts are transient: clear on floor/roof/cover landing, death, menu exit and invalid recovery. Sweep projectile impacts; require a player-owned downward surface blast and headroom. Verify 30/60/144 FPS, ceilings, roof relaunches and nine-rocket supply conservation. Lethal-damage tests must account for passive healing before impact.
