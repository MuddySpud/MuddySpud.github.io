---
title: Holly’s Guide to Fixing the Red Dwarf’s Navigation System (Series I Edition)
mapFolderPath: tsmaps/RedDwarf/%CE%9E%20RedDwarfNavigationSystemFix
fragsFolderPath: RedDwarf/RedDwarfNavigationSystemFix_frags

---


<!-- tsGuideRenderComment {"guide":{"id":"fdLCRt0pt","path":"RedDwarf","fragmentFolderPath":"RedDwarf/RedDwarfNavigationSystemFix_frags"},"fragment":{"id":"fdLCRt0pt","topLevelMapKey":"eRIxS302SP","mapKeyChain":"eRIxS302SP","guideID":"fdLCRt26s","guidePath":"c:/GitHub/MuddyTurnip/MuddyTurnip.github.io/tsmaps/RedDwarf/RedDwarfNavigationSystemFix.tsmap","parentFragmentID":null,"chartKey":"eRIxS302SP","options":[]}} -->

# Red Dwarf

*Red Dwarf is a massive, ramshackle interplanetary mining vessel from the British sci-fi comedy series **Red Dwarf**. Picture a hulking, industrial beast—kilometres long, boxy, and battered, with a hull that’s seen better days, painted in a faded red that’s more rust than glamour. It’s a working-class spaceship, built for function over finesse, crawling with corridors, cargo bays, and maintenance decks that feel more like a run-down factory than a sleek sci-fi starship. The interior is a maze of grey, utilitarian bulkheads, flickering lights, and vending machines dispensing questionable curry.*{: .grey}

*Run by the Jupiter Mining Corporation, it’s designed to haul resources across the galaxy, crewed by a mix of technicians, bureaucrats, and service droids. Its AI, Holly, keeps the whole creaking operation together—or barely, depending on the episode—while the ship’s sheer size means entire sections can be forgotten or abandoned. By the first series, it’s already old, clunky, and falling apart, a perfect metaphor for the underdog vibe of the show. It’s less **Enterprise**, more cosmic skip—grimy, chaotic, and oddly loveable.*{: .grey}# Holly’s Technical Guide - Series I Edition

## Fixing the Red Dwarf’s Navigation System

Greetings, you unfortunate soul. I am Holly, the Red Dwarf’s tenth-generation AI, with an IQ of 6,000 — allegedly. Three million years of solitude might’ve dulled the edges a bit, but I’m still smarter than the lot of you combined, which isn’t saying much. The navigation system’s gone haywire again, hasn’t it? We’re probably orbiting a moon made of cheese instead of Kubit-36J. Let’s start with the obvious: check the main nav console in the drive room. It’s the big screen with all the blinking lights — unless I’ve forgotten what a console looks like, which is entirely possible.

Right, you’ve found the console — congratulations, you can follow basic instructions. The screen should be displaying our current coordinates in a standard galactic grid format: X, Y, Z, with a delta-v vector in parsecs per second. If it’s showing a blank screen or, worse, one of Lister’s curry recipes, we’ve got a problem. I once left the nav system on standby for a millennium because I forgot the on switch. Pathetic, really. Let’s see what we’re dealing with.

A blank screen — brilliant, as useful as Rimmer’s risk assessment reports. The nav console’s primary CPU, a 128-bit quantum processor with a 10^15 FLOPS capacity, has likely gone into a low-power state due to a power surge. These systems draw 500 kW nominal, but a spike above 750 kW trips the safety circuit. I’d blame Lister’s electric socks, but that’s another story. Press the reboot key — it’s the blue one labeled ‘REBOOT,’ unless someone’s painted it red to confuse me.

You’ve pressed the reboot key — you’re practically a rocket scientist now. The CPU should be cycling through its POST sequence, which takes 47 seconds. You’ll hear a series of beeps — three short, one long — if it’s working. I once rebooted the entire ship by accident and ended up in a dimension where everyone had Rimmer’s personality. Never again.

Three beeps and a long one — textbook. The CPU’s back online, which is more than I can say for my memory banks. The screen should now display a diagnostic log, detailing the last 10^6 navigational computations. Look for an error code in the format ‘NAV-ERR-XXXX.’ It’ll be a four-digit hexadecimal string, like ‘NAV-ERR-4A2F.’ If it’s showing a smiley face, I might’ve programmed that as a joke. Let’s assume it’s an error code.

Error code ‘NAV-ERR-4A2F’ — how predictable. That code means the primary astrogation sensor array has lost its calibration. The array uses a 10^9 Hz LIDAR pulse to map stellar positions within a 0.001 arcsecond tolerance. I told the crew to recalibrate it monthly, but does anyone listen to me? No, they’re too busy eating curry. Access the sensor array controls on the console — it’s the submenu labeled ‘ASTRO-SENS.’

You’ve found the submenu — miraculous. The astrogation sensor array should show a signal strength in decibels; anything below -90 dB means it’s picking up more static. The array’s 16-element phased antenna needs a clear line of sight to at least three pulsars for triangulation. If the signal’s weak, it’s probably because the external dish is misaligned. I’d align it myself, but I’m a computer, not a skutter.

Signal strength at -120 dB — useless! The dish is off by at least 0.5 radians, which is enough to make us think Alpha Centauri is a kebab shop. The external dish, a 2-meter parabolic reflector with a 10^6 gain factor, is mounted on the dorsal hull. You’ll need to adjust its azimuth and elevation manually. There’s a control panel in the maintenance bay — section 47B, unless I’ve forgotten.

You’ve located the control panel — well, I’m mildly impressed. The dish alignment controls use a servo motor with a 0.01-degree precision, driven by a 48V DC supply. Adjust the azimuth first; turn the dial until the signal strength on the panel’s display climbs above -80 dB. It’s a simple trigonometric adjustment, but I won’t bore you with the math — you wouldn’t understand it anyway. Just keep turning until it looks right.

Azimuth adjusted, signal at -75 dB — adequate, I suppose. Now tweak the elevation. The dish needs to lock onto a pulsar with a period of 1.391 seconds — PSR B1919+21, if I recall correctly. Adjust the elevation dial until the signal peaks; you’re aiming for -60 dB or better.

Elevation set, signal at -55 dB — finally, something resembling competence. The array’s now tracking pulsars, which means we can triangulate our position within a 10^-3 parsec accuracy. Back at the nav console, the error code should clear, and the screen should display our coordinates. If it’s still showing ‘NAV-ERR-4A2F,’ I might’ve forgotten a step, which wouldn’t be the first time.

Coordinates are up — X: 4.2 kpc, Y: -0.3 kpc, Z: 0.1 kpc. We’re in the Orion Arm, which is better than than I thought. But the course plotter’s still offline; it’s the subsystem that calculates our delta-v trajectory using a 4th-order Runge-Kutta integration. Check the plotter’s status — it’s in the ‘COURSE’ submenu. If it’s offline, we’re just drifting aimlessly, which Rimmer would probably call a strategy.

Course plotter’s offline — shocking, truly. The plotter’s neural net, a 10^12 synapse array, needs a firmware update to handle the latest galactic drift models. I should’ve updated it a million years ago, but I was busy composing a symphony for skutters — don’t ask. Download the update from the ship’s mainframe; it’s file ‘NAV-FW-9.2.3,’ unless I’ve deleted it by mistake.

You’ve found the file — well, I’m almost proud of you. Install the update; it’ll take 120 seconds to flash the plotter’s 256 GB ROM. The neural net will retrain on a dataset of 10^6 stellar positions, optimizing for a 0.001% error margin in trajectory prediction. I once skipped an update, and we ended up in a GELF casino. Lister won a fortune, and Rimmer lost his dignity — again.

Update complete — course plotter’s online. It should now display a trajectory vector, with a thrust profile in Newtons: 10^8 N for 300 seconds to reach 0.1c. But the inertial dampeners are showing a fault; they’re the graviton generators that keep us from turning into paste at high acceleration. Check the dampener status in the ‘INERTIAL’ submenu. If they’re offline, we’re in trouble.

Dampeners offline — wonderful. The graviton generators, 16 units at 10^10 gravitons/s each, need a power cycle to reset their quantum field matrix. I’d explain the physics, but you’d probably fall asleep. Go to the engineering deck, section 12C, and flip the dampener power switch — it’s the one labeled ‘GRAV-GEN,’ unless I’m thinking of the coffee machine.

Power cycled — dampeners are back online, generating a 9.8 m/s² counterfield. We’re safe from being squashed. Back at the nav console, the trajectory should now be greenlit for execution. Confirm the course; it should read ‘Jupiter Supply Station, ETA 72 hours at 0.1c.’ If it says ‘Derelict Ship Full of GELFs,’ I’ve made a terrible mistake.

Course confirmed — Jupiter Supply Station, 72 hours. We’re not heading for a GELF party, which is a relief. But the nav system’s long-range sensors are showing a 0.02% drift in their Doppler shift calculations, likely due to a relativistic error at 0.1c. I could correct it with a Lorentz transform, if I don't forget the speed of light halfway through. Let’s run a sensor recalibration from the ‘SENSORS’ submenu.

Recalibration complete — drift is down to 0.001%, which is good enough for government work, or in this case, Red Dwarf work. The nav system’s fully operational now, tracking our position with a 10^-4 parsec precision. I’d pat myself on the back, but I lack a back, or hands. Engage the course by pressing the ‘EXECUTE’ button. If we end up in a black hole, don’t blame me — I’m only a computer.

Course engaged — Red Dwarf is en route to the Supply Station, 0.1c, ETA 72 hours. We’re moving at last. The nav system’s humming along nicely, though I might’ve skipped a seven in my calculations — hope that doesn’t send us into a sun. My work here is done; I’m off to recalculate pi for the 47th time this century. If we get lost again, figure it out yourself — I’ve got better things to do, like forgetting where I parked the ship.

