# Sims suite — status & continuation plan

**Not committed to the `lesson_planning` git repo.** Hamish plans to make
`sims/` its own repo eventually. Nothing under `sims/` — including this file,
`previews/`, and the sims-building skill at `../.claude/skills/sims/` — should
be `git add`ed to `lesson_planning`. The only sims-related file that DOES
belong in that repo is `../reference/sims.md` (a lesson-planning reference
doc, described below) and the one-line pointer to it added in
`../.claude/skills/lesson-tables/SKILL.md`'s "Source documents" list.

**For house style / API reference (colours, control panel API, page
skeleton, engine gotchas), read `../.claude/skills/sims/SKILL.md` first.**
This file is status + the current plan only; it doesn't repeat that
reference material.

**Hub/reference structure (subject groups → topic sections, no year/level
prefix) is now documented as permanent house style in the skill** — see
`../.claude/skills/sims/SKILL.md`'s "Hub structure" section, not here. This
file only tracks the current status: Physics = Electricity & Magnetism,
Nuclear Physics, Forces & Motion, Waves, **Optics** (all added this
session). Biology = Genetics. Chemistry = Atomic Structure, Acids & Bases.
**Every planned sim is now built, tested, and integrated** — 34 cards total
across 8 topics / 3 subjects. See "What to do next" for what's left (mostly
"check in with Hamish," not more building).

## Status by subject

All of these boot clean (headless-tested) and follow house style unless
flagged otherwise.

### `atomic-structure/` — Year 10, done
- `plum-pudding-model.html` ✅
- `rutherford-experiment.html` ✅ (renamed this session from
  `rutherford-model.html` — it's the gold-foil-experiment + single-atom-view
  sim; **do not confuse with** the new `rutherford-model.html` below)
- `rutherford-model.html` ✅ — **new sim**, Rutherford's actual 1911
  *planetary* model: nucleus + electrons on continuous, non-quantized,
  randomly-inclined orbits (no fixed shells — that's Bohr's fix). Footer
  explains the "orbiting charge should radiate and spiral in" problem that
  motivated Bohr.
- `bohr-model.html` ✅ — nucleus rendering was rebuilt this session to use
  real close-packing: `packNucleusPositions()` in the file generates FCC
  lattice candidates, greedily fills them nearest-to-centre first, and
  breaks distance ties by whichever candidate keeps the running centroid
  most balanced on each axis. Don't regress this back to the old
  random-scatter version.

### `chemistry/` — Year 10, done
- `ph-scale.html` ✅ — this session added: a `labelledIons` toggle (single
  toggle controls both H⁺ and OH⁻ rendering — false/default = accurate
  molecule models (bare H⁺ dust, bonded O–H for OH⁻, matches what Hamish had
  hand-edited it to before this session), true = simple big spheres labelled
  "H⁺"/"OH⁻"), plus `sizeMul` and `countMul` sliders (both apply to ion *and*
  water-molecule size/count). **Note**: Hamish had directly hand-edited this
  file mid-session (bare-proton H⁺, bonded-molecule OH⁻) — always re-read the
  live file before assuming its contents match older context.
- `neutralisation.html` ✅, `acid-reactions.html` ✅, `combustion.html` ✅

### `electromagnetism/` — Year 12, done, several fixes this session
- `electric-field.html` ✅ — fixed a "weird green blob" bug: the Earth's
  "continent" decoration used to be a separate `eng.sphere` whose centre sat
  *inside* the main Earth sphere; painter's-algorithm depth-sorting compares
  whole-primitive depth, so an embedded sphere renders as a floating blob
  instead of clipping correctly. Fixed via `continentPatch()`, which builds a
  small blob of points that all lie *on* the sphere surface (each point is a
  slight angular deviation of a centre direction, re-normalized and scaled to
  the sphere radius), drawn as one `eng.poly` with a small `depthBias`. If you
  ever need a "sticker on a sphere" effect elsewhere, reuse this pattern
  rather than embedding a second sphere.
- `circuit-3d.html` ✅ — added an "Old resistor symbol (zigzag)" toggle,
  default **off** (new default = plain rectangle, `drawResistorRect`). Old
  zigzag path kept as `drawResistorZigzag`, still reachable via the toggle.
- `magnetic-field.html` ✅ — added a "Current / magnet strength" slider
  (0.3×–2.5×) that scales `fieldAt()`'s returned vector, all field-line/arrow
  widths (via a new `lw(base)` helper), and compass-needle length.
- `charge-in-field.html` ✅ — the roam-before-reset box was too small (±6),
  so large-radius circular paths (high speed/mass, low charge/B — very
  possible within the existing slider ranges) got cut off almost immediately.
  Bumped to `BOUND = 14`, extended the field-arrow grid and floor grid to
  match, camera pulled back to `dist: 20`.
- `induction.html` ✅ (untouched this session), `motor.html` ✅ (untouched)

**Also this session**: `lib/engine3d.js` gained **shift+drag to pan**
(orbit is still plain drag; wheel/pinch still zooms). It translates
`cam.target` using screen-space right/up vectors derived from yaw/pitch, so
it's already live in every sim with zero per-file changes needed. All 10
pre-existing sims' `ui.hint(...)` strings were updated to mention it
(they were all an identical string, `sed`-replaced in one pass) — **do the
same for any new sim's hint text**, or better, just copy the current skeleton
in the sims skill, which already includes it.

### `nuclear-physics/` — new this session, in progress
- `radioactive-decay.html` ✅ tested — stochastic per-nucleus decay
  (`P(decay in dt) = 1 - exp(-ln2/halfLife * dt)`), live decay-curve graph
  (actual sampled curve vs theoretical dashed curve), alpha/beta/gamma
  particle-type selector, half-life & sample-size sliders. Verified the
  sampled curve tracks the theoretical one closely.
- `isotopes.html` ✅ tested (after a fix) — proton/neutron sliders + quick-pick
  presets (H-1/2/3, C-12/14, O-16, Co-60, U-235/238), band-of-stability
  chart, decay-mode classification. **Fix applied**: sliders originally
  maxed at Z=30/N=40, silently clamping the Uranium presets (native
  `<input type=range>` clamps `.value` to `max`) — bumped to Z:1–95, N:0–150,
  extended the `SYMBOLS` element list to match, and made the stability-chart
  axes auto-scale to the current nuclide instead of a fixed 0–30/0–45 range.
- `fission-fusion.html` ✅ tested (after a fix) — segment for Fission
  (fire-a-neutron + optional chain reaction through a scattered field of
  U-235 nuclei) vs Fusion (push D+T together, must close the gap to fuse
  into He + neutron). **Fix applied**: the fired neutron's velocity was a
  fixed guess `(3.5, -0.15, 0)` that didn't actually aim at the target
  nucleus and mostly missed the 0.65-unit collision radius — replaced with
  `v3.norm(target - start) * speed` so it always aims correctly. Fusion
  logic was verified correct via manual frame-stepping.
- `radiation-safety.html` ✅ **QA complete** — three parallel lanes (α/β/γ)
  of particles flying from a source through a selectable shield (none/paper/
  aluminium/lead) to a detector; penetration is a lookup table
  (`PENETRATION`) of pass-probability per type per shield; a distance slider
  drives an inverse-square relative-dose readout. Verified via headless
  screenshots for all 4 shield cases + the numeric dose readout (which
  matches the `PENETRATION` table exactly, e.g. lead → 0.02 ≈ 0.15/9): paper
  stops α only, aluminium stops α+β, lead heavily attenuates but never fully
  stops γ. All correct.

**Nuclear Physics section is now fully done**: previews captured for all 4
sims (`previews/radioactive-decay.png`, `isotopes.png`, `fission-fusion.png`,
`radiation-safety.png`), hub section added to `index.html` (18 cards total
now), and `../reference/sims.md` extended with the Nuclear Physics section
(same table + per-sim paragraph structure as the other sections).

### `genetics/` — done
Built by a parallel fork this session. **All four** confirmed sims: DNA
structure & replication, meiosis & inheritance, Punnett squares & genetic
crosses, natural selection & evolution — `dna-structure.html`,
`meiosis.html`, `punnett-squares.html`, `natural-selection.html`, all ✅
tested (headless boot-check + numeric/visual verification — see the fork's
full report for specifics, e.g. dihybrid cross verified to exact 9:3:3:1).
Previews captured, hub section + `reference/sims.md` section added.

### `forces-and-motion/` — done
Built by a parallel fork this session. **All four** confirmed sims:
Newton's laws, projectile motion, momentum & collisions, circular motion —
`newtons-laws.html`, `projectile-motion.html`, `momentum-collisions.html`,
`circular-motion.html`, all ✅ tested. **Fix applied**: extreme
projectile-motion slider combos (e.g. Moon gravity + high launch speed)
produced ranges that exceeded the camera's zoom clamp and rendered
off-screen — fixed with an auto-scaling `worldScale` on the rendered
geometry (readouts still show true physics values, only the drawing scales).
Previews captured, hub section + `reference/sims.md` section added.

### `waves/` — done
Built by a parallel fork this session. **All four**: wave properties
(transverse/longitudinal, v=fλ), superposition & interference, standing
waves & resonance, the Doppler effect — `wave-properties.html`,
`superposition-interference.html`, `standing-waves-resonance.html`,
`doppler-effect.html`, all ✅ tested. **Two fixes applied**: (1) standing
waves' default camera framing put the string's right half behind the
control panel — recentred `cam.target` to the string midpoint; (2) Doppler's
wavefront-circle cull radius was too generous, so only one giant arc was
visible at a time instead of several concentric rings — tightened the cull
radius so 3+ rings stay visible simultaneously. Previews captured, hub
section + `reference/sims.md` section added (this was **not** in Hamish's
original genetics/forces-and-motion request — he asked to cover "other NCEA
physics topics" and waves + optics were picked as the two obvious remaining
pillars alongside mechanics/electromagnetism/nuclear).

### `optics/` — done
Built by a parallel fork this session (alongside waves/). **All four**,
scoped to light-specific behaviour distinct from `waves/`'s general
mechanical-wave content: `reflection-refraction.html` (Snell's law, live TIR
detection), `lenses.html` (ray diagrams, thin lens equation), 
`total-internal-reflection.html` (critical angle, fibre optics),
`diffraction-interference.html` (single-slit/Young's double-slit). **Three
fixes applied** (all in `lenses.html`/`total-internal-reflection.html`): (1)
a magnification-formula sign error (`v/u` instead of `-v/u`) made every
converging-lens real image incorrectly report "upright"; (2) the diverging
lens polygon was shape-identical to the converging lens regardless of sign,
and Ray 3's fixed lens-plane height could miss the lens icon for close
objects — lens now auto-sizes height, diverging lens got a proper
concave profile, and virtual images gained dashed backward-extension rays;
(3) `total-internal-reflection.html` had the classic embedded-primitive
depth-sort bug (ray traveled inside an opaque `eng.box` fibre, which always
painted over it) — rebuilt as a wireframe tube — plus default angles
(60°/25°) intermittently dropped below the critical angle mid-demo,
retuned to 70°/15°. All verified numerically against closed-form optics
results (Snell's law, thin-lens equation, critical angle, fringe spacing),
not just visual inspection. Previews captured, hub section +
`reference/sims.md` section integrated by the coordinator.

## Hub (`index.html`) and previews

`index.html` now has sections for **Physics** (Electricity & Magnetism 6,
Nuclear Physics 4, Forces & Motion 4, Waves 4, Optics 4 = 22), **Biology**
(Genetics 4), and **Chemistry** (Atomic Structure 4, Acids & Bases 4) — **34
cards total**, all linking correctly into their topic subdirectories,
grouped under `<h1 class="subject-title">` per the skill's "Hub structure"
section. Verified via headless card-count check after every merge. Nothing
outstanding here.

`previews/<slug>.png` holds a screenshot-thumbnail per sim (control panel
collapsed before capture, ~1s settle time for particles to look lively,
`sips -Z 640` to shrink). Every current sim across all 8 topic subdirectories
has a matching preview.

Capture recipe (see the sims skill's Testing section for the full writeup):
```js
const page = await launch(`http://127.0.0.1:${port}/<subdir>/<file>.html`);
await page.waitFor("window.BOOT_DONE === true", 5000);
await page.eval("document.querySelector('.panel-head').click()"); // collapse panel
await new Promise(r => setTimeout(r, 1200));
await page.screenshot(`sims/previews/<slug>.png`);
// then: sips -Z 640 sims/previews/<slug>.png
```

## `../reference/sims.md` — the one file in this whole effort that DOES get committed

Written for Hamish to feed into lesson planning — per-sim descriptions (what
it shows, misconceptions it heads off, suggested moment to use it in a
lesson), organised by subject group then topic (`# Physics`/`# Biology`/
`# Chemistry`, `##` per topic — see the skill's "Hub structure" section),
plus a "suggested lesson-integration patterns" section at the end. **Now
covers all 8 topics / 34 sims** (Electricity & Magnetism, Nuclear Physics,
Forces & Motion, Waves, Optics, Genetics, Atomic Structure, Acids & Bases) —
nothing outstanding. Already linked from
`../.claude/skills/lesson-tables/SKILL.md`'s "Source documents" list — no
further linking needed, just keep the content current if new sims get
added later.

## Known-good engine gotchas (learned the hard way this session, already
folded into `../.claude/skills/sims/SKILL.md` — repeating the headline here
so you don't rediscover them)

1. `eng.sphere(p, r, color, opts)` calls `lighten(color, 0.55)` for its
   highlight unless you pass `opts.highlight` explicitly, and `lighten()`
   only parses `#rrggbb` hex — passing an `rgba(...)` color without a
   `highlight` override throws, and because the throw happens inside the
   `requestAnimationFrame` callback, **it silently kills the whole animation
   loop** with no visible error. If a readout looks frozen, suspect this
   before suspecting your update logic — reproduce with
   `await page.eval("frame(<tms>)")`, which surfaces the real exception.
2. Never recompute per-frame `Math.random()`-based positions for something
   that's supposed to be static (a nucleus, a fixed cloud) — assign once
   when the relevant state (e.g. element/Z) changes, cache it, and only
   rebuild on change. Doing it every frame produces a "spinning/jittering"
   artifact that looks like a bug even though each individual frame is
   "correct" in isolation.
3. Don't integrate a 1/d² (or similar singular) force with a variable,
   coarse `requestAnimationFrame` dt — it blows up near small d. Prefer a
   closed-form result computed once (e.g. the real Rutherford scattering
   formula θ = 2·atan(k/b), applied as a single deterministic
   direction-change at the point of closest approach) over naive Euler
   integration of the force.
4. A small sphere whose centre sits *inside* a larger sphere depth-sorts
   unpredictably (painter's algorithm compares whole-primitive depth, not
   per-pixel) — build a small `eng.poly` patch of points lying flush on the
   big sphere's surface instead (see `continentPatch()` in
   `electric-field.html`).
5. Slider `min`/`max` silently clamp preset values that fall outside them —
   when adding "quick pick" presets/select options, check they're within
   every slider's declared range, not just the range that felt sensible for
   manual dragging.
6. Aiming a projectile/particle at a target: compute
   `v3.mul(v3.norm(v3.sub(target, start)), speed)`, don't guess a fixed
   velocity vector — an unaimed guess reliably misses the collision radius.

## What to do next

**Everything planned this session is built, tested, and integrated**:
Nuclear Physics, Genetics, Forces & Motion, Waves, and Optics are all done
(built, QA'd, previews captured, hub + sims.md integrated — 34 cards, 8
topics, 3 subjects, verified via headless card-count check). There is no
queued build work left. Next session should:

1. Check in with Hamish for what's next rather than inventing more scope —
   he asked for genetics + forces-and-motion explicitly, then "other NCEA
   physics topics" generically (which is how waves/optics got picked); both
   requests are now fully satisfied.
2. Do **not** run any git commit involving anything under `sims/` — only
   `../reference/sims.md` and the `../.claude/skills/lesson-tables/SKILL.md`
   pointer edit belong in a `lesson_planning` commit, and only if/when
   Hamish actually asks for one.

**Note (this session)**: genetics/, forces-and-motion/, waves/, and optics/
were each built by a separate parallel Sonnet fork, given the full
house-style contract, gotchas, and scope from this file + the sims skill.
Three of the four forks independently found and fixed real bugs during their
own QA pass (waves, forces-and-motion, optics — see "Status by subject"
above for specifics) — worth re-verifying fresh sims interactively rather
than trusting a clean headless boot-check alone, since headless boot-check
only proves the page doesn't crash on load, not that the physics/
interactions are correct.
