BREACH / ARSENAL UPDATE 11
Created and owned by Arkh_53 · Co-owner Khibanyan

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file). Enter a callsign and deploy.
Desktop keyboard/mouse and WebGL required. The website serves the same dist assets.
Single-player, offline-capable, no external dependencies. Multiplayer remains canceled.

WHAT CHANGED
13 new weapons/equipment; 28 total crate unlocks. Three category-specific slots remain.
New K9 skeleton/poses, sniper penetration (90 body / preserved 276 head), Glock/revolver
open sights and aiming, RPG side-box cleanup, more reliable lifetime statistics,
falling sandbox nuke and sandbox invincibility. Main-menu reward explanation removed.
Enemies deal 8% less scaled damage, have 8% wider firearm spread and 6% longer pauses
between attack cycles. Factions, counts, movement speeds and credits are unchanged.
See BALANCE-AND-TESTS.txt for all values, exact crate odds and verification limits.

CONTROLS
WASD move; mouse look; left click attack/use; right click aim; R reload.
Shift sprint; C crouch; sprint+C slide. C again cancels slide; Space cancels into jump
when clear. Sprint is unlimited. Slide lasts 0.70s, decelerates, and keeps its initial
travel direction while mouse aiming remains free. No stamina cost or slide cooldown.
1/2/3 select Primary/Secondary/Equipment; wheel cycles those three slots.
G uses equipped equipment; V detonates placed C4 (1, 2 or 3 charges).
C4 placement: aim at a surface within 3m; maximum 3 active charges per wave supply.
LMG: crouch and hold fire for 1s to spin up. You cannot move while holding it in use.
F inspects the karambit. I opens the menu/death Armory. Escape pauses.
Pause > Main Menu ends the run and preserves legitimately earned credits/statistics.

MAPS AND PRACTICE
The Yard, Freight Depot and Ironworks are survival arenas; Practice Range has nine
resetting targets and allows any item in category-correct practice slots. All maps
retain their 42 x 50m boundary, enterable structures, cover and navigation.
E refills/reset practice. Practice causes no health loss and grants no unlocks, credits
or lifetime statistics. Choose your combat loadout from the main menu.

SUPPLIES AND RETAINED MECHANICS
Wave spawn refills magazines/reserves/equipment. Switching never grants supplies.
RPG: 1 loaded + 8 spare rockets, 1.5s reload, 2s shot cooldown. Close downward blasts
can rocket-jump about 4m for 10 health, with 65% faster air movement until landing.
No midair boost stacking. Headroom/solid collision apply. No self-damage in practice.
Machete: 25 damage, 1.65m reach, 1s cooldown; no sliding execution.
Karambit: 60 damage; connecting sliding hit executes non-SWAT enemies; all SWAT
variants are immune. Slide cancel immediately removes the execution bonus.
Flash: 5s knockdown; boogie: 5s dance; smoke: 10s cloud, 5s blindness on entry.
Bandage: 35 health after 2.4s, canceled without refund by switching.

SAVES, SANDBOX AND ACCESS LIMITATIONS
The existing breach.collection.v1 browser-local save is retained. Export/merge a backup
before changing browser/origin. Unreadable saved bytes are not silently overwritten.
Personal Stats shows lifetime completed waves and player-credited eliminations.
Arkh_53 remains a PUBLIC, unsaved sandbox available to anyone entering that callsign.
Its test powers do not overwrite ordinary progress. It is not authenticated admin access.
Requested Aanav2453/Khibanyan secure admin grants require an identity provider and trusted
backend and are NOT enabled. No public/global leaderboard exists in this release.
No weapon named Block exists in the catalog; clarification is needed for that item.

VALIDATION
node build.cjs; node check.cjs; node production-check.cjs
162 isolated simulation checks passed, including fresh-session save reload. Software
model previews were inspected. Opera GX gameplay was blocked by Computer Use's inability
to verify the current browser URL. Actual browser rendering/audio/input, menu layout,
live persistence and perceived difficulty remain unverified. See the detailed test report.
GitHub main is the requested publication target. Hosting configuration remains unchanged.
