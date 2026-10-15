# BREACH project notes

- Horizontal player and navigation collision checks must exclude the floor plane. After editing collision code, run check.cjs and verify movement and a route across the arena.
- Read and write source files explicitly as UTF-8. Windows PowerShell default decoding can corrupt multiplication signs and middle dots; inspect the HUD text after scripted replacements.
- The game uses a self-contained WebGL renderer, with no external dependencies. Keep BREACH.html synchronized with dist/index.html, dist/style.css, and dist/game.js for local delivery.
- check.cjs verifies simulation behavior with a mocked rendering context. Do not describe it as browser or visual verification.
- Use Opera GX for this project's browser playtests, as requested by the user. Verify the loaded local path and update label before inspecting graphics.
- After editing dist/, run build.cjs and check.cjs; the checks must confirm the standalone HTML contains the exact current JavaScript and CSS.
- If the user reports that a local game link does nothing, give the browser's Ctrl+O workflow with the exact verified HTML path rather than repeating the same chat link. Confirm the file exists before providing the path.
- For production asset checks, recursively inventory files, including hidden files, and reject symbolic links. Empty directories are not deployable assets; nested unexpected files must still fail the check.
- Before publishing source, inspect tracked files as well as ignore rules. The existing local Git index tracks .openai/hosting.json and qa-scenario.js despite .gitignore; publish only a reviewed clean snapshot, or remove excluded files from tracking and audit history before pushing it. Verify the remote file list after upload.
