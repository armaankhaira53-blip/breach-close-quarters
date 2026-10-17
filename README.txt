BREACH / WAVE EVENTS UPDATE 13
Created and owned by Arkh_53 · Co-owner Khibanyan

PLAY
Open BREACH.html in Opera GX (Ctrl+O, select the file). Enter a callsign and deploy.
Desktop keyboard/mouse and WebGL required. The website serves the same dist assets.
Single-player, offline-capable, no external dependencies. Multiplayer remains canceled.

WHAT CHANGED
Four wave events with one 5% total chance per wave, active objectives and locator maps.
Thief: recover supplies for 900 credits. Crate: defend for 1,500. Beacon: hold E
for 15s before its 30s timer for 900. Radio: stop the 10s call for 500. One event
per wave, with budgeted reinforcements and cleanup on death/menu/restart.
Sandbox Powers adds an event selector and one-time REFILL ALL AMMO.
Testing follow-ups: thief runs at 3.6m/s carrying a wooden crate without a weapon.
The protected crate now takes 12 damage per hit; half the soldiers, capped at five,
target it. Radio operators hold a radio while calling; failure brings five reserved
reinforcements after 10 seconds. Failed airstrikes now halve current health anywhere on the map, even
with admin invincibility enabled. Reload the game to load these changes.
See WAVE-EVENTS-AND-TESTS.txt for timers, implementation, checks and limitations.

RETAINED ARSENAL UPDATE
26 total crate unlocks. Fire Axe and Double-barrel shotgun removed from play and crates.
Old equipped copies fall back to the starter rifle/pistol; saved ownership records, credits
and statistics are retained. Three category-specific slots remain.
All ranged weapons except the sniper share the AR-4 reflex model, reticle and 49-degree
aimed FOV. Sniper retains its 28-degree scope.
Flamethrower: 300 fuel + 300 base reserve, 7 damage every 0.1s (was 6); flames render
with 55% opacity per surface and fade before expiry. Range/reload unchanged.
Tactical Crossbow: 60 body / 120 head damage (was 78 / 156), 2.2s reload (was 1.8s);
accuracy, bolt speed and 1 + 18 ammunition unchanged. Mini Uzi: 11 damage (was 14), 0.075s fire
interval (was 0.065s), 24 + 72 rounds; 1.8s reload, range and recoil unchanged.
Sniper body damage scales from enemy maximum health, so full-health enemies survive.
Existing armor/shield protection and long-range falloff still apply; follow-up hits can kill.
New K9 skeleton/poses, sniper penetration (90% max-health body / preserved 276 head), Glock/revolver
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
LMG: crouch and hold fire for 1.5s to spin up. You cannot move while holding it in use.
No sliding while the LMG is selected; switching to it ends a slide. Other slots can slide.
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
Exact callsigns Arkh_53, Aanav2453 and Khibanyan open the same PUBLIC, unsaved sandbox.
Its test powers do not overwrite ordinary progress. It is not authenticated admin access.
This matches the requested username-entry behavior; no new login system is required.
All three names receive the same powers, including invincibility and the falling nuke.
Other usernames do not receive powers. No public/global leaderboard exists.
The user clarified that Block means Glock 19; its aiming fix is already included.

VALIDATION
node build.cjs; node check.cjs; node production-check.cjs
217 isolated simulation checks cover this build. Opera GX verified the local Update 13, real
sandbox event activation and objective layout; separate visual fixtures verified
crate, beacon, missile, fireball/lighting, radio and supply pickup presentation.
Audible sound quality, full-run difficulty, real-input completion of all events,
browser restart persistence and an independent deployed-host playthrough remain
unverified. Server validation is unavailable under the agreed offline scope.
See WAVE-EVENTS-AND-TESTS.txt for the detailed report.
GitHub main is the requested publication target. Hosting configuration remains unchanged.
