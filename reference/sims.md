# 3D classroom simulations — reference for lesson planning

Companion sims live in `../sims/` (a separate suite, not part of the
`content/*.csv` app — see `../sims/index.html` for the live hub, and the
`sims` skill for how to build/extend them). This file is **for lesson
planning**: what each sim shows, what it's good for, and when to reach for it
when authoring a `content/*.csv` lesson (e.g. in a `resources` row, or as the
thing a `script` row tells the teacher to pull up).

All sims: 3D, light mode (projector-friendly), drag to orbit, shift+drag to
pan, scroll/pinch to zoom, every visual layer has a show/hide toggle, and a
footer states the key equation/idea in big type. None of them auto-advance —
they're teacher- or student-driven exploration tools, not videos.

Sections below are grouped by subject (Physics / Biology / Chemistry), not by
year/level — a topic may eventually get more than one sim collection at
different year levels, so year isn't baked into the section heading.

# Physics

## Electricity & Magnetism

| Sim | Path | One-liner |
|---|---|---|
| Electric Fields | `electromagnetism/electric-field.html` | Field lines around charges, uniform fields, gravity analogy |
| DC Circuits | `electromagnetism/circuit-3d.html` | Electron flow through series & parallel circuits |
| Magnetic Fields | `electromagnetism/magnetic-field.html` | Bar magnet, current-carrying wire, solenoid field lines |
| DC Motor | `electromagnetism/motor.html` | F = BIL and the right-hand slap rule |
| Charge in a Magnetic Field | `electromagnetism/charge-in-field.html` | F = Bqv → circular motion |
| Induction & Generators | `electromagnetism/induction.html` | Rod on rails (V=BvL), AC/DC generators, Lenz's law |

These six predate this session's build and cover the standard NCEA Y12
electromagnetism sequence (fields → circuits → magnetism → motor effect →
circular motion in a field → induction/generators). Each follows the same
show/hide + readout + footer-equation pattern as the chemistry sims below;
see each page's own control panel for specifics rather than duplicating them
here (they haven't needed pedagogy notes revisited since the original build).

## Nuclear Physics

| Sim | Path | One-liner |
|---|---|---|
| Radioactive Decay | `nuclear-physics/radioactive-decay.html` | Stochastic per-nucleus decay vs the theoretical half-life curve |
| Isotopes & the Band of Stability | `nuclear-physics/isotopes.html` | Proton/neutron ratio, stability, and decay-mode prediction |
| Fission & Fusion | `nuclear-physics/fission-fusion.html` | U-235 chain reaction vs D+T fusion, side by side |
| Ionising Radiation & Safety | `nuclear-physics/radiation-safety.html` | α/β/γ penetrating power through paper, aluminium, lead |

**Radioactive Decay** — pick a particle type (α/β/γ), set a half-life and
sample size, and watch a population of nuclei decay one at a time
(`P(decay in dt) = 1 − exp(−ln2/halfLife · dt)`, not a smooth deterministic
curve). A live graph plots the actual sampled count against the theoretical
dashed exponential, so students see the two converge — the point being that
half-life is a *statistical* statement about a large population, not a
guarantee about any individual nucleus. Good for: "why can't we predict when
a specific atom will decay" and for contrasting with the deterministic
exponential formula they'll use in calculations.

**Isotopes & the Band of Stability** — proton (Z) and neutron (N) sliders
plus quick-pick presets (H-1/2/3, C-12/14, O-16, Co-60, U-235/238) plot the
nuclide on a band-of-stability chart and classify its likely decay mode
(stable / β⁻ / β⁺ / α) from where it falls relative to the band. Good for:
"isotopes of the same element have the same chemistry but different
stability" and for building intuition that too many neutrons → β⁻ decay,
too few → β⁺/positron or electron capture, and very heavy nuclides → α decay
regardless of ratio. Chart axes auto-scale to whichever nuclide is selected,
so light and heavy presets both stay readable.

**Fission & Fusion** — segment control switches between two scenarios in the
same 3D scene. Fission: fire a neutron at a scattered field of U-235 nuclei,
optionally enabling a chain reaction so each fission's released neutrons can
trigger further fissions. Fusion: push a deuterium and tritium nucleus
together against their mutual repulsion; close the gap far enough and they
fuse into He + a neutron, releasing energy. Good for a direct side-by-side of
"splitting a heavy nucleus" vs "joining two light nuclei" both releasing
energy — the common misconception that fission and fusion are opposite in
*mechanism* rather than just opposite in *which end of the mass curve they
operate on*.

**Ionising Radiation & Safety** — a radioactive source fires α/β/γ down three
lanes toward a detector, through a selectable shield (none/paper/aluminium/
lead). Each type's pass-through probability is looked up per shield (paper
stops α only; aluminium stops α+β; lead heavily attenuates but never fully
stops γ) and a distance slider drives an inverse-square relative-dose
readout. Good for the core radiation-safety objective — **time, distance,
shielding** — and for physically demonstrating why lead aprons/rooms target γ
specifically rather than "radiation" as an undifferentiated hazard.

## Forces & Motion

| Sim | Path | One-liner |
|---|---|---|
| Newton's Three Laws | `forces-and-motion/newtons-laws.html` | Inertia, F = ma, and action-reaction, side by side |
| Projectile Motion | `forces-and-motion/projectile-motion.html` | Independent horizontal/vertical components → the parabola |
| Momentum & Collisions | `forces-and-motion/momentum-collisions.html` | Elastic vs inelastic carts — momentum always conserved, energy not always |
| Circular Motion | `forces-and-motion/circular-motion.html` | F꜀ = mv²/r, and what happens the instant the string breaks |

**Newton's Three Laws** — a segment control switches between three scenes.
1st law: push a block, then toggle friction on/off to see it either coast
forever at constant velocity or grind to a halt — makes friction visible as
the "hidden" unbalanced force that usually hides the 1st law on Earth. 2nd
law: the *same* applied force pushes two blocks of different, adjustable
mass side by side, so students watch the lighter one visibly outrun the
heavier one (a = F/m). 3rd law: two skaters at rest on frictionless ice push
apart on a button press; equal-and-opposite force arrows fire on both at
once, and the momentum readouts confirm the total stays zero even though the
lighter skater flies off faster. Good for teaching all three laws as one
connected idea in a single lesson rather than three disconnected facts.

**Projectile Motion** — set launch speed, angle, and gravity (Earth/Moon/
Mars), then launch; the ball follows the exact closed-form parabola
(computed analytically, not integrated frame-by-frame) with live vₓ/v_y
component arrows. A "compare complementary angle" toggle overlays the
(90°−θ) trajectory in a second colour — same range, different height/time,
a direct visual for why sin(2θ) governs range. Good for the "horizontal and
vertical motion are independent" objective, and the complementary-angle
toggle is a built-in "why do θ and 90°−θ give the same range" discussion
prompt. Rendered geometry auto-scales to whatever the current speed/gravity
combination produces (real ranges can span metres to hundreds of metres) —
the on-screen R/H/T readouts always show the true physics values regardless
of the visual scale.

**Momentum & Collisions** — two carts approach each other on adjustable
masses and initial velocities; a segment picks elastic or perfectly
inelastic (sticky). Before/after readouts show total momentum and total
kinetic energy: momentum matches in both modes, but kinetic energy only
matches for elastic — inelastic visibly "loses" energy as the carts stick
together. Good for the core misconception that collisions always conserve
energy; momentum is the one that's *always* conserved.

**Circular Motion** — a ball whirled on a string in a horizontal circle;
speed, radius and mass sliders drive live F꜀ = mv²/r, a꜀ = v²/r and period
readouts, with the tension arrow always shown pointing inward. The
"✂️ Cut the string!" button is the key teaching moment: the ball flies off
in a straight line **tangent** to the circle, not radially outward — directly
confronting the common "centrifugal force flings it outward" misconception
by showing what actually happens the instant the centripetal force
disappears.

## Waves

| Sim | Path | One-liner |
|---|---|---|
| Wave Properties | `waves/wave-properties.html` | Transverse vs longitudinal, and why v = fλ |
| Superposition & Interference | `waves/superposition-interference.html` | Two pulses meet, add, and pass through each other unaffected |
| Standing Waves & Resonance | `waves/standing-waves-resonance.html` | Why only certain driving frequencies make the string swell |
| The Doppler Effect | `waves/doppler-effect.html` | The source's frequency never changes — only what you hear does |

**Wave Properties** — a travelling wave rendered two ways via a segment
toggle: transverse (particles oscillate perpendicular to travel, riding a
visible sine curve) and longitudinal (particles oscillate parallel to
travel, visibly bunching into compressions/rarefactions, with a dashed
reference sine curve alongside showing the underlying displacement
function). Frequency and wave-speed sliders are independent; wavelength is
derived live (`λ = v/f`). Good for: the core "v = fλ" relationship — show
that increasing frequency shortens wavelength *for a fixed medium* rather
than treating them as independent dials. Misconception it heads off: that
longitudinal waves don't have a "shape" the way transverse waves do — the
dashed reference curve links the particle bunching directly to the same
sinusoidal maths.

**Superposition & Interference** — two pulses launched from opposite ends
of a 1D medium travel toward each other, overlap, and separate; a segment
control picks same-side (constructive) or opposite-side (destructive)
pulse 2. Dashed component curves plus a solid resultant curve make "the
resultant is just the sum" a literal visual rather than an assertion —
constructive peaks visibly reach 2×A, destructive pulses visibly nearly
cancel at the coincidence point. Good for: the superposition principle
itself, and for the "pulses pass through each other unaffected" fact that
trips students up (they expect a collision/bounce). Best paired with the
standing-waves sim afterward — that's what happens when superposition
repeats continuously against a fixed boundary rather than being a one-off
transient.

**Standing Waves & Resonance** — a string fixed at both ends, driven at a
selectable frequency; nodes (grey) and antinodes (red) are marked
explicitly, and quick-pick buttons jump straight to the 1st–5th harmonic. A
continuous frequency slider shows the amplitude swell sharply only near
each resonant `f_n = n·v/2L` and stay small everywhere else (a Lorentzian
resonance response), rather than only ever showing clean quantized modes.
Good for: "why do only certain frequencies produce big standing waves" —
sweeping through off-resonance frequencies and watching the string barely
move is a much stronger demo than jumping between presets alone.
Misconception it heads off: that any driving frequency produces *some*
standing wave — most frequencies produce almost nothing.

**The Doppler Effect** — a source moves along a track emitting expanding
circular wavefronts at a fixed f₀; two stationary observers (ahead and
behind) read off the classic `f = f0·v/(v∓vs)` shifted frequency. The
wavefront circles are visibly asymmetric around the current source
position — bunched tightly on the leading side, spread out on the trailing
side — making "the source frequency never changes, only the wavefront
spacing does" a visual fact rather than a verbal claim. Good for: the core
siren/ambulance misconception that the *source* changes pitch — it doesn't;
only what each observer receives changes, and the sim's two independent
readouts make that split explicit.

## Optics

| Sim | Path | One-liner |
|---|---|---|
| Reflection & Refraction | `optics/reflection-refraction.html` | Snell's law, and why total internal reflection only goes one way |
| Lenses & Ray Diagrams | `optics/lenses.html` | Converging vs diverging lenses — real, virtual, upright, inverted |
| Total Internal Reflection & Fibre Optics | `optics/total-internal-reflection.html` | Why light stays trapped inside a bent fibre — until it doesn't |
| Diffraction & Interference of Light | `optics/diffraction-interference.html` | Single-slit vs Young's double-slit — the same wave principle, live |

**Reflection & Refraction** — an incident ray hits a boundary between two
selectable media (air/water/glass/diamond); shows the reflected ray and the
Snell's-law-refracted ray simultaneously, with live angle readouts and
automatic total-internal-reflection detection (critical angle computed and
the refracted ray suppressed when exceeded). Misconception headed off: that
light "chooses" one path — this shows reflection and refraction happening
together at every boundary. Good moment: introduce Snell's law, then flip
medium order to show TIR only happens going from dense→less-dense.

**Lenses & Ray Diagrams** — converging/diverging lens toggle, adjustable
focal length and object distance/height; draws the three standard principal
rays and the resulting image, with live image-distance/magnification/
real-virtual-upright-inverted readouts from the thin lens equation.
Misconception headed off: that virtual images are "not really there" — the
dashed backward ray extensions show precisely how the eye/brain constructs
the virtual image from real forward-travelling light. Good moment: drag
object distance from beyond 2f down through f to show the real→virtual
transition live.

**Total Internal Reflection & Fibre Optics** — a light ray launched down a
gently bent fibre either zigzags via TIR all the way to the exit or escapes
through the wall, depending on entry angle, bend sharpness, and core
refractive index vs the computed critical angle. Misconception headed off:
that fibre optics work by some special property of the glass rather than
plain TIR geometry. Good moment: crank the bend angle up until the ray
visibly leaks out, tying "why fibres have a minimum bend radius" to the
diagram.

**Diffraction & Interference of Light** — segment toggle between
single-slit (diffraction) and Young's double-slit (interference); a source
illuminates the slit(s), and the resulting bright/dark fringe pattern
renders live on a screen, coloured by the selected wavelength (with a
wavelength→RGB conversion), alongside fringe/minima spacing readouts.
Misconception headed off: that diffraction and interference are unrelated
phenomena — flipping the segment control on the same apparatus shows
they're both consequences of wave superposition, just with one or two
coherent sources. Good moment: pair with the general-wave
`waves/superposition-interference.html` sim to bridge "waves on a rope" to
"waves of light."

# Biology

## Genetics

| Sim | Path | One-liner |
|---|---|---|
| DNA Structure & Replication | `genetics/dna-structure.html` | The double helix, base pairing, and semi-conservative replication |
| Meiosis & Inheritance | `genetics/meiosis.html` | Diploid cell → four haploid gametes, with crossing over & independent assortment |
| Punnett Squares & Genetic Crosses | `genetics/punnett-squares.html` | Monohybrid & dihybrid crosses with live genotype/phenotype ratios |
| Natural Selection & Evolution | `genetics/natural-selection.html` | Birds eat the bugs that stand out against the ground — camouflage selection shifts a population's traits over generations |

**DNA Structure & Replication** — a segment control switches between two
views. "Structure" shows a static double helix built from real base pairing
(A–T two H-bonds, G–C three H-bonds), sugar-phosphate backbone outside,
bases inside, 5′/3′ end labels. "Replication" adds a moving replication fork
(Play/Pause + Reset): behind the fork the helix visibly splits into two
daughter molecules, one strand tinted as "new" (teal) — a direct visual for
semi-conservative replication (**each daughter keeps one original strand +
one new strand**), rather than the common misconception that replication
produces one fully-old and one fully-new molecule.

**Meiosis & Inheritance** — a five-stage stepper (Prev/Next) from a diploid
cell (2n = 4, two homologous pairs colour-coded paternal/maternal) through
S-phase replication, synapsis with optional crossing over (toggle), Meiosis I
separation into two cells, and Meiosis II separation into four haploid
gametes. A "🔀 Shuffle independent assortment" button re-randomises which
homolog goes to which cell at Meiosis I and re-renders all four downstream
gametes — a concrete demonstration that **independent assortment** (not
crossing over) is what makes gametes 1↔2 and 3↔4 identical pairs but 1↔3
genetically different. Good for walking through the full sequence stage by
stage rather than showing an animated blur.

**Punnett Squares & Genetic Crosses** — pick each parent's genotype for
seed colour (Y/y) and, in dihybrid mode, seed shape (R/r too) — the classic
Mendel pea traits — and the sim builds the correct 2×2 or 4×4 grid live from
however many distinct gametes each parent actually produces (a homozygous
parent correctly collapses to fewer grid columns/rows). Each cell shows the
offspring genotype and a phenotype marker (colour = seed colour, sphere vs
cube = round vs wrinkled), with genotype and phenotype ratios computed and
displayed live (verifies to the textbook 3:1 and 9:3:3:1 ratios). Good for
letting students choose non-textbook genotype combinations (e.g. a testcross)
and see the ratio actually change, not just memorise the classic case.

**Natural Selection & Evolution** — a population of 50 beetle-like **bugs**
wandering on a ground whose darkness is a slider; each bug's shell colour is a
continuous heritable trait. "Run 1 generation" runs an animated **hunt**:
birds swoop down out of the sky and visibly pick off the bugs whose colour
mismatches the ground (probability scales with mismatch × adjustable selection
strength), each snatched bug vanishing in a little puff. The survivors then
breed with a small mutation drift, and a live histogram + average-colour-vs-
generation graph show the population visibly evolving toward camouflage over
repeated generations (or auto-run continuously). Showing the predation
explicitly — rather than culling silently — makes the *mechanism* of
differential survival concrete: students watch which bugs get eaten and why.
Good for the core natural-selection sequence — **variation → differential
survival → heritability → change in population over time** — and for
showing that selection acts on individuals but the population's makeup is
what changes; no individual bug "evolves."

# Chemistry

## Atomic Structure

| Sim | Path | One-liner |
|---|---|---|
| Plum Pudding Model | `atomic-structure/plum-pudding-model.html` | Thomson's atom: electrons embedded in a ball of positive charge |
| Rutherford Model | `atomic-structure/rutherford-model.html` | The gold foil experiment, plus a zoomed single-atom view |
| Bohr Model | `atomic-structure/bohr-model.html` | Electron shells/energy levels, with photon emission on de-excitation |

**Plum Pudding Model** — a big translucent sphere of "positive charge"
with electron spheres embedded inside, gently vibrating. Slider controls how
many electrons (net charge always reads as balanced/neutral). Good for: "what
did people think the atom looked like *before* we knew about the nucleus?" —
establishes the historical baseline the next two sims overturn. Misconception
it heads off: students often picture "planets around a sun" as the *first*
atomic model; this shows that came later, and *why* (evidence-driven).

**Rutherford Model** — two views via a segment control. "Gold foil
experiment" fires a continuous stream of alpha particles at a plane of gold
nuclei; most sail straight through empty space, a few (aimed close to a
nucleus) deflect sharply or bounce back — this *is* the actual 1911
evidence, not just an illustration (uses the real Rutherford scattering-angle
relation, θ = 2·atan(k/b)). "Single atom" zooms into one atom: tiny dense
positive nucleus, mostly empty space, electrons unexplained-loosely
somewhere around it. Best used as: **the pivotal lesson** — show Plum
Pudding first, ask "what result would prove this wrong?", then run the foil
experiment and let the deflection counter build the case live. Readouts
(particles fired / deflected) make a nice "why is this evidence for a small
dense nucleus" discussion prompt.

**Bohr Model** — pick any of the first 20 elements; shells fill by the
simplified 2-8-8 rule taught at this level, nucleus shows individual protons
(red) and neutrons (grey). "⚡ Excite electron" jumps an outer electron up a
level and shows it fall back releasing a photon — direct visual for
"electrons emit light when they drop energy levels" (ties to flame tests /
emission spectra if that's on the unit plan). Good follow-on from
Rutherford: "Rutherford explained the nucleus, but not why electrons don't
just spiral in — Bohr's fix was fixed shells." Element picker doubles as
quick electron-configuration drill (readout shows e.g. "2, 8, 1" for sodium).

## Acids & Bases

| Sim | Path | One-liner |
|---|---|---|
| pH & Indicators | `chemistry/ph-scale.html` | Why the pH scale runs red→purple, and how each indicator responds |
| Neutralisation (Titration) | `chemistry/neutralisation.html` | Acid + base titration with a live pH curve and the steep equivalence jump |
| Reactions of Acids | `chemistry/acid-reactions.html` | Metal/carbonate/base/oxide + acid, with gas tests |
| Combustion | `chemistry/combustion.html` | Complete vs incomplete combustion, air supply, soot & CO |

**pH & Indicators** — a beaker with an ion swarm (H⁺ red, OH⁻ blue, water
optional); pick a real substance (or drag the pH slider directly) and watch
ion populations shift, with universal indicator / litmus / phenolphthalein
colour response and a scale-bar overlay. Good for the "acids release H⁺,
bases release OH⁻" objective and for the definition of strong vs weak
acid/alkali by ion count rather than just a memorised colour.

**Neutralisation (Titration)** — a burette drips NaOH into a HCl-filled
flask (retort stand, falling drops, ion swarm including spectator ions Na⁺/
Cl⁻); a live pH-vs-volume graph plots the real titration S-curve with the
equivalence point marked at 25 mL. Chemistry is exact (not just an
illustration): `pH = −log10(excess acid conc.)` etc. Good for: the
"neutralisation is acid + base → salt + water" objective, and for showing
*why* indicator choice matters near the steep equivalence jump. The
"+1 mL" button is handy for a slow, discussable approach to equivalence
rather than watching the whole curve fly past.

**Reactions of Acids** — segment-pick an acid (HCl/H₂SO₄/HNO₃) and what
you're adding it to (Mg, Zn, Cu, CaCO₃, CuCO₃, NaOH, CuO); watch bubbles,
solution colour change for copper salts, and press buttons to "test gas with
lit splint" (pop for H₂, splint goes out for CO₂) or "bubble through
limewater" (goes milky for CO₂ only). Word + symbol equations toggle
independently. Good for: the whole "acid + metal/carbonate/base" reaction-type
lesson in one sim, including the deliberate **copper is unreactive** "no
reaction" teaching point, and for drilling gas tests without needing the real
(slower, messier) practical every time.

**Combustion** — a Bunsen burner with a 3D flame; the air-supply slider
crosses from a blue roaring flame (complete combustion, CO₂+H₂O, tall energy
bar) to a yellow sooty flame (incomplete, C soot + CO + H₂O, short energy
bar) below 60% air. Product molecules float up and label themselves; soot
visibly accumulates. Good for: "why do we adjust the air hole on a Bunsen
burner" and the CO-is-toxic safety point — the energy bar makes "incomplete
combustion wastes energy" a visible, not just asserted, fact.

# Astronomy

| Sim | Path | One-liner |
|---|---|---|
| The Solar System | `astronomy/solar-system-model.html` | Scale, order and orbits of the eight planets, with a true-distances mode |
| Retrograde Motion of Mars | `astronomy/retrograde-motion.html` | Earth overtaking Mars on the inside track — an illusion, not a reversal |
| Phases of the Moon | `astronomy/moon-phases.html` | Half the Moon is always lit — phases are changing angles, not shadows |
| The Seasons | `astronomy/seasons.html` | Axial tilt, not distance from the Sun, is what drives the seasons |
| Solar & Lunar Eclipses | `astronomy/eclipses.html` | The Moon's ~5° tilted orbit is why eclipses aren't a monthly event |
| Kepler's Laws & Orbital Mechanics | `astronomy/kepler-orbits.html` | Ellipses, equal areas in equal times, and why T² ∝ a³ |
| Stellar Evolution & the H-R Diagram | `astronomy/hr-diagram.html` | Mass alone decides a star's lifetime and whether it ends white dwarf or supernova |

**The Solar System** — the Sun and eight planets orbit at Kepler-consistent
relative speeds (farther out = slower), with orbit paths, planet labels and
an asteroid belt all independently toggleable, plus a time-speed slider.
A segment control switches between "Classroom scale" (sizes and distances
both exaggerated so every planet is comfortably visible — the default) and
"True distances," which uses one consistent real-astronomical conversion
factor for both size and distance at once — at that scale every planet
(and the Sun) shrinks to a sub-pixel dot, spread across a much larger
region. Good for: the specific misconception that a "to scale" solar
system diagram (like the one in most textbooks) is actually to scale — it
can only ever be to scale in size *or* distance, never both at once. Good
moment: start in Classroom scale to establish order and names, then flip to
True distances and ask students to find Jupiter.

**Retrograde Motion of Mars** — Earth (inner, faster) and Mars (outer,
slower) orbit the Sun on Kepler-consistent periods; a "Sky view" locks the
camera near Earth looking outward, and a scrolling inset plots Mars's
apparent position against a fixed starfield over time, tracing the classic
backward loop live as Earth laps Mars. A live readout states plainly
whether Mars is currently moving forward or backward as seen from Earth.
Misconception it heads off: that Mars *actually* reverses direction in
space — it never does; the loop is purely what a moving observer sees.
Good moment: pair with a heliocentric-vs-geocentric history discussion —
this is exactly the observation that forced ever more epicycles onto the
geocentric model until Copernicus/Kepler's heliocentric picture explained
it in one line.

**Phases of the Moon** — drag the Moon around its orbit (or press play) and
watch a 2D "as seen from Earth" inset render the correct crescent/gibbous/
full/new shape live, alongside the current phase name and illuminated
percentage. Misconception it heads off: that phases are caused by Earth's
shadow falling on the Moon — that's an eclipse, a separate and much rarer
alignment (see the eclipses sim). Half the Moon is always lit by the Sun;
what changes is how much of that lit half faces Earth. Good moment: have
students predict the next phase name before advancing the slider.

**The Seasons** — Earth orbits the Sun with its axis tilted 23.5° and,
crucially, **pointing the same fixed direction in space all year** — a
draggable latitude slider and a 2D noon-sun-angle inset show how that fixed
tilt changes the sun's elevation and day length at a chosen latitude across
the year, including a season name and day-length-in-hours readout. Good
moment: set latitude near the equator first (little seasonal swing), then
near a pole (extreme swing, including possible 0h/24h days), to show
seasonal intensity depends on latitude too, not just time of year.
Misconception it heads off: that seasons are caused by Earth being closer
to the Sun in summer — the footer states plainly that Earth is actually
*closest* to the Sun during the Northern Hemisphere's winter.

**Solar & Lunar Eclipses** — a segment control sets up a solar eclipse
(Moon between Earth and Sun) or lunar eclipse (Earth between Sun and Moon)
scenario, with the Moon's real ~5° orbital tilt drawn in and umbra/penumbra
shadow cones rendered live. A tilt on/off toggle is the key teaching
control: with the real tilt on, most new/full moons pass just above or
below the shadow (no eclipse); switching it off makes the shadow line up
almost every orbit. Good moment: ask "why doesn't every full moon give us a
lunar eclipse?" before revealing the tilt toggle — students usually assume
alignment happens automatically at every new/full moon.

**Kepler's Laws & Orbital Mechanics** — a planet orbits the Sun on a true
ellipse with the Sun correctly placed at one focus (not the center);
eccentricity and semi-major-axis sliders reshape the orbit live, and real
physics (numerically integrated gravity, not a scripted path) drives the
planet visibly faster at perihelion and slower at aphelion. An
equal-areas-sweep toggle shades the Sun-to-planet wedge swept over a
trailing time window so students can directly compare a fat/short wedge
near perihelion against a thin/long one near aphelion. Readouts include
live speed, distance, and a Kepler's-third-law period calculation that
updates as the semi-major axis changes. Good for teaching all three of
Kepler's laws from one live apparatus rather than three separate diagrams;
good moment: crank eccentricity up and ask students to predict where the
planet will move fastest before pressing play.

**Stellar Evolution & the H-R Diagram** — set a star's mass (0.5–25 solar
masses) and step it through its life stages one at a time (Protostar → Main
Sequence → then either Red Giant → Planetary Nebula → White Dwarf for
low/mid-mass stars, or Red Supergiant → Supernova → Neutron Star/Black Hole
for high-mass stars), with the star's size and colour updating each stage
and a duration caption giving rough relative timescales. A live H-R diagram
inset (temperature vs luminosity, hot-on-left per the real convention)
plots the star's position and leaves a trail as it evolves. Good for: the
core idea that a star's *mass alone* — not anything else — determines both
how long it sits on the main sequence and how it dies. Good moment: run a
1 M☉ star and a 20 M☉ star side by side (two tabs, or one after the other)
to contrast "main sequence lasts ~10 billion years" against "~a few million
years," and a quiet white-dwarf ending against a supernova flash.

## Suggested lesson-integration patterns

- **Hook / Do Now**: open the relevant sim already on the projector before
  the title slide, no explanation — let students guess what it shows first.
- **Mid-objective demo**: drive it live while teaching, toggling layers on
  one at a time (e.g. Bohr: show shells only, then add electrons, then
  trigger an excitation) rather than dumping the full view at once.
- **Student-driven exploration**: for sims with a rich Show/hide panel
  (pH & Indicators, Reactions of Acids, Bohr Model), let students drive from
  a Chromebook/tablet with a specific question to answer ("find a substance
  where OH⁻ outnumbers H⁺ by more than 10:1").
- **Evidence-then-explanation pairing**: Plum Pudding → Rutherford → Bohr is
  a built-in three-lesson arc mirroring the actual history of the atomic
  model; don't skip straight to Bohr.
- Reference a sim in a lesson CSV with a `resources` row, e.g.
  `resources,Sim: Neutralisation (Titration) — sims/chemistry/neutralisation.html`.
