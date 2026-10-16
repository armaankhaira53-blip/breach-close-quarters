BREACH / MOBILITY UPDATE 06
Created and owned by Arkh_53 · Co-owner Khibanyan

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file), enter a username and deploy.
Desktop keyboard/mouse and WebGL required. Single-player, offline-capable, no dependencies.
The website also serves these same assets. No account, paid game server or party needed.
Multiplayer and party codes were canceled at the owner's request and removed.

CONTROLS
WASD move; mouse look; left click attack/use; right click aim; R reload.
Shift sprint; C toggle crouch; C while sprinting slide only; Space jump.
Starting a sprint stands from crouch if there is room above the player.
Sprint has no stamina limit. Tap C while sprinting for a 1.15-second slide; hold C
to sustain it indefinitely. WASD steers the slide. No slide stamina cost or cooldown.
1/2/3 select Primary/Secondary/Equipment; mouse wheel cycles those slots.
G uses equipped equipment. I opens Armory from the menu or after death. Escape pauses.
Pause > Main Menu ends the run and keeps legitimately earned credits and statistics.
F spins the karambit for inspection; its equip animation spins around the finger ring.

MOBILITY UPDATE
Slide speed improved to 13 down to 11 m/s, with smooth steering up to 2.8 radians/s.
Removed the lower-left sprint bar; health remains visible.
Karambit now deals 60 damage with 1.9m reach. A connecting hit while sliding kills
one enemy instantly, including heavies and shield operators; walls and reach still apply.
New curved full-tang blade, textured scales, pins and ring; raised sideways grip shows
the complete blade and preserves its draw/inspect spin. RPG gets 1 loaded + 8 reserve
rockets at every wave start. Re-equipping cannot create rockets.
Magazines sit ahead of the firing hand; reload extraction and the support hand share
one path, clearing the receiver vertically before moving to the side.

RETAINED COMBAT IMPROVEMENTS
Fixed sprint/crouch/slide conflicts and retained headroom checks and smooth camera height.
All four optics have clear aiming views and centered reticles; shot rays precede recoil.
Detailed clothing, armor, hats, accessories and weapons share the same animated actor
through boogie dancing, knockdown and death. Corrected rotating equipment attachments.
Weapon audio now uses distinct layered firing, suppressed shots and timed reload sounds,
with distance attenuation, stereo positioning, voice limits and master compression.
Models, choreography and audio are original procedural assets, not photorealism or mocap.

DIFFICULTY AND PROGRESS
Wave credits for Thugs / Police / Cartel / Mercenaries / SWAT:
Recruit 0.75x: 90 / 120 / 150 / 180 / 210.
Regular 1.00x: 120 / 160 / 200 / 240 / 280.
Veteran 1.50x: 180 / 240 / 300 / 360 / 420.
Difficulty also changes incoming damage, enemy movement speed and accuracy.
Rewards are checked once per completed wave. The main menu shows the settings before play.
Personal Stats shows furthest wave, lifetime eliminations, completed waves and current
credits from this device's normal save. These are not worldwide or verified rankings.
Existing collection data is preserved. Armory can export/merge backups between browsers.
Shop Info uses the same fifteen exact reward probabilities as the crate chooser.

SANDBOX
Typing exactly Arkh_53 enables unlimited sandbox credits and configurable nuke, flight,
invisibility, wave selection, unlock-all and five-second mass-dance powers. Open with F2.
Anyone using that name can access this local sandbox, as requested. It is not private
account authentication. Sandbox progress never overwrites the normal collection or stats.
Flight: Space up, Ctrl down, WASD move. Normal usernames have no sandbox UI/actions.

FILES AND CHECKS
BREACH.html: synchronized self-contained build.
dist/: maintained HTML/CSS/JavaScript; only these three files are publicly served.
BALANCE-AND-TESTS.txt: exact probabilities, wave rules, values, tests and limitations.
Node 24: npm run build rebuilds the HTML and runs simulation/production checks.
npm test reruns those checks. Windows: use npm.cmd if PowerShell blocks npm.ps1.
90 automated checks pass using mocked WebGL, including saved stats, sandbox isolation,
all scopes, movement transitions, weapon/equipment behavior and 10,000 wave plans.
Production asset and exact standalone synchronization checks pass.

VERIFICATION LIMITS
This release has not had a completed Opera GX gameplay/visual/audio playtest. The owner
is using the computer and asked work to continue without interrupting it. GPU rendering,
perceived sound quality, dance recognizability, mouse feel and FPS remain unverified.
Software-rendered previews of actual model meshes and transforms were inspected for
karambit idle/attack, rifle idle/reload, SMG, sniper and pistol reload; these use a
simplified software shader and do not replace an actual WebGL playtest.
The game is single-player. Worldwide leaderboards need trusted backend hosting and are
not included; saved personal statistics are explicitly labeled. No paid hosting activated.
GitHub main is the publication target; the existing Vercel integration serves dist/.

FUTURE FEATURE
Worldwide rankings are retained on the roadmap, as requested. They are not enabled
in this single-player release and will need trusted backend validation and hosting.
Multiplayer and party codes remain canceled.
