BREACH / ROCKET MOBILITY UPDATE 09
Created and owned by Arkh_53 · Co-owner Khibanyan

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file), enter a username and deploy.
Desktop keyboard/mouse and WebGL required. Single-player, offline-capable, no dependencies.
The website also serves these same assets. No account, paid game server or party needed.
Multiplayer and party codes were canceled at the owner's request and removed.

MAPS
Choose SELECT MAP on the main menu; your choice is remembered on this device.
All four locations use the original 42 x 50 metre boundary.
The Yard: two open cargo-container passages, a security hut, new cover and industrial detail.
Freight Depot: a warehouse, cargo office, furnished dispatch room and loading-area cover.
Ironworks: detailed cooling tanks, pipework, a workshop, a control room and extra cover.
Practice Range: five lanes at 5/10/15/25/40m, moving/melee targets and two training rooms.
Ten enterable spaces across the four maps have multiple exits. Seven newly built rooms
have firing windows, solid sills/roofs, workbenches, lockers, lights and signs.
Eighteen new sandbag, pallet and generator cover clusters supplement existing cover.
Practice now has nine targets, including two inside the new training rooms.
Try any item in three category-correct practice slots without unlocking it. Targets
have 100 HP, hit/damage feedback and reset two seconds after falling. E refills ammo
and equipment, clears effects and resets targets/counters. Player damage is disabled.
Practice gives no credits and never changes your saved combat statistics or loadout.
Escape > Main Menu lets you change maps or practice items.

CONTROLS
WASD move; mouse look; left click attack/use; right click aim; R reload.
Shift sprint; C toggle crouch; C while sprinting slide only; Space jump.
Starting a sprint stands from crouch if there is room above the player.
Sprint has no stamina limit. Tap C while sprinting for a 0.70-second slide.
Travel direction stays locked; mouse aiming remains available. C again cancels into
movement; Space cancels into a jump if clear. Holding C cannot extend or repeat slides.
No slide stamina cost or cooldown.
1/2/3 select Primary/Secondary/Equipment; mouse wheel cycles those slots.
E resets/refills the practice range. G uses equipped equipment. I opens Armory from the menu or after death. Escape pauses.
Pause > Main Menu ends the run and keeps legitimately earned credits and statistics.
F spins the karambit for inspection; its equip animation spins around the finger ring.

MACHETE BALANCE
Machete damage reduced from 65 to 25, reach from 2.35m to 1.65m, and attack cooldown
raised from 0.70s to 1.00s. Full-health enemies require multiple hits; sliding never
grants a machete execution. Karambit balance and mechanics are unchanged.

MOBILITY UPDATE
Slides decelerate smoothly from 13 to 3 m/s over about 5.1m on clear ground.
Removed the lower-left sprint bar; health remains visible.
Karambit now deals 60 damage with 1.9m reach. A connecting hit while sliding kills
one non-SWAT enemy instantly; all SWAT variants are immune to every karambit hit.
Sliding slashes sweep body contact during travel and accept point-blank overlap,
with a 0.12-0.24s contact window. Walls, vertical separation and reach still apply.
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
129 automated checks pass using mocked WebGL, including saved stats, sandbox isolation,
all scopes, movement transitions, weapon/equipment behavior and 10,000 wave plans.
Production asset and exact standalone synchronization checks pass.

VERIFICATION LIMITS
This release has not had a completed Opera GX gameplay/visual/audio playtest. The owner
is using the computer and asked work to continue without interrupting it. GPU rendering,
perceived sound quality, dance recognizability, mouse feel and FPS remain unverified.
Software-rendered map overviews and spawn/firing-line views were checked for the new
arenas and range, including interior views. All four navigation grids are connected.
Standing doorway traversal, window/sill/roof collision, and early/25-SWAT routes into
every combat interior pass automated checks.
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

ROCKET MOBILITY UPDATE 09
Aim the RPG down at the surface close to your feet to launch about 4 metres up.
A qualifying close blast costs 10 health on every difficulty (zero in practice).
Airborne movement is 65% faster until landing, including sprinting: 7.4 -> 12.21 m/s.
The HUD shows ROCKET BOOST. Headroom and roof/cover landings respect solid collision.
No boost stacking in midair; landing clears the boost and allows another launch.
RPG supply stays at 9 per wave. Ordinary blast damage and all other weapons are unchanged.
New simulation checks cover all maps at 30/60/144 FPS, speed/reset, damage, pause/death,
ceiling clearance, elevated landings/relaunches, boundaries and thin-wall impacts.
Real-browser movement feel remains unverified; no desktop takeover was performed.

RPG reload time is now 1.5 seconds; nine-rocket supplies and rocket jumping are unchanged.
