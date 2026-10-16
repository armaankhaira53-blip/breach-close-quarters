# BREACH project notes

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

- Sprint+C must never fall through to crouch when a slide is unavailable. Test cooldown, stamina, air and low overhead clearance together.
- Status animations must use the same dressed actor and attachments as normal movement; verify appearance definitions and full rotation through dance, knockdown and death.
- All scope rays must capture aim before applying recoil, and aimed foreground geometry must not obscure the reticle. Test every optic.
- The owner canceled multiplayer and party codes. Keep this release single-player; do not restore network services or paid hosting without a new request. Personal statistics must not be presented as worldwide rankings.
- The exact Arkh_53 username intentionally opens a public local sandbox. Never describe it as private authentication, and verify that sandbox changes cannot overwrite the normal save.
- Personal Stats belongs on the main menu. Worldwide rankings remain a future feature, not an enabled local-only substitute; multiplayer stays canceled.
