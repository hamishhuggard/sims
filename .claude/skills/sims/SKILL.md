---
name: sims
description: Build or extend the 3D classroom simulations in this repo (vanilla JS, no build step, shared Engine3D + SimUI). Use when asked to create a new simulation, add a control/toggle, fix a physics or chemistry visualization, or regenerate the sims hub page.
---

# 3D classroom simulations

A standalone suite of 3D classroom simulations (its own repo, `~/Desktop/sims`),
separate from the table-driven lesson app in the sibling `lesson_planning`
repo's `viewer/`. No-build-step, no-npm-deps philosophy — plain HTML/CSS/JS
files opened over `python3 -m http.server`, nothing to install.

```
sims/ (repo root)
  lib/ui.js, lib/engine3d.js, lib/vessel.js,
  lib/theme.js                                — shared engine, frozen unless
                                                  you have a good reason to
                                                  touch them (every page depends
                                                  on them — see below)
  sim.css                                      — shared styles (light mode,
                                                  chunky, control panel, footer)
  index.html                                    — hub page: card grid with
                                                  screenshot thumbnails
  previews/<slug>.png                           — card thumbnails (regenerate
                                                  after visual changes, see below)
  atomic-structure/, chemistry/                — Chemistry topics
  genetics/                                     — Biology topics
  electromagnetism/, nuclear-physics/,
  forces-and-motion/, waves/, optics/           — Physics topics
```

Each topic subdirectory holds sims for one topic (not one class/year — see
hub structure below). Adding a genuinely new topic = new subdirectory, same
pattern.

### Hub structure: subject groups → topic sections, no year/level labels

Both `index.html` and `reference/sims.md` are organized two levels deep:

1. **Top-level subject groups** — currently **Physics, Biology, Chemistry**,
   in that order. HTML: `<h1 class="subject-title">` (the CSS class exists
   in `index.html`'s own `<style>` block, styled in `--accent` blue).
   Markdown: `#`.
2. **Topic sections** nested under each subject — e.g. "Nuclear Physics",
   "Forces & Motion", "Waves" under Physics; "Genetics" under Biology;
   "Atomic Structure", "Acids & Bases" under Chemistry. HTML: `<h2>` inside
   a `.hub-section`. Markdown: `##`.

Topic section titles are **topic-only — never prefixed with a year/level**
(no "Year 10 ·", no "Year 12 ·"). Hamish wants room to build separate sim
collections for the same topic at a different year level later without a
year baked into the label; year/level isn't tracked in this structure at
all right now.

When adding a new topic: classify it into the right existing subject group
(add a new top-level subject only if it's genuinely new, e.g. Earth
Science), then add its topic section using the exact same
`.subject-title`/`.hub-section` HTML pattern or `#`/`##` markdown pattern as
the existing sections in `index.html` / `reference/sims.md` — don't
reinvent the layout, copy a neighbouring section verbatim and edit it.

## House style contract (every page)

- **Designed for light mode** (projected in a classroom), white background —
  every sim is authored and colour-tuned against a white canvas. Dark mode is
  layered on top globally, not per-sim: see "Dark mode" below. Never add
  per-sim dark-mode logic or dark-tuned colours to an individual page.
- **Chunky**: 3–10px strokes, 15–30px bold labels, big controls — `sim.css`
  does most of this for you.
- Full viewport `100vw × 100vh`, no page scrolling (`sim.css` sets
  `overflow: hidden` on body — `index.html` is the one page that overrides
  this, being a normal scrolling hub).
- Every sim: **drag = orbit, shift+drag = pan, wheel/pinch = zoom** (all free
  from `Engine3D` — don't reimplement), a control panel with show/hide
  toggles for every visual layer, a footer strip with the key equation/idea
  in big type, and `ui.hint(...)` stating the controls.
- Colour conventions (also CSS vars in `sim.css`):
  - ink `#1a1a2e`, accent `#2563eb`
  - positive / acid: `#e63946` · negative / base: `#2563eb`
  - E-field `#ea580c` · B-field `#7c3aed` · force `#dc2626` · velocity `#16a34a`
  - conventional current `#d97706` · copper `#b45309`
  - particles, in every sim they appear in: electron `#2563eb` (blue, `'−'`
    label) · proton `#e63946` (`'+'`) · neutron `#94a3b8` · photon/energy
    `#f59e0b`. Electrons stay blue even as current carriers in circuit sims
    (a red/warm electron reads as positive charge).
- Last line of the script, right before starting the animation loop:
  `window.BOOT_DONE = true;` — the headless test harness (and preview
  screenshotter) waits on this.
- `'use strict';` vanilla JS, no libraries, self-contained file.

### Dark mode

Site-wide light/dark toggle, driven entirely by `lib/theme.js` (the `Theme`
global) — never add dark-specific colours or logic to an individual sim.
Dark rendering is one global CSS rule in `sim.css`:
`html[data-theme="dark"] { filter: invert(1) hue-rotate(180deg); }` (plus a
second pass on `img` so raster screenshots invert twice and cancel back to
normal). This darkens the chrome *and* the 3D canvas scene together in one
shot — cheap and "rough" rather than a hand-tuned palette, deliberately, so
individual sims stay untouched. `Theme.current()` checks
`localStorage['sim-theme']`, falling back to the OS `prefers-color-scheme`;
`Theme.mountToggle({small, floating})` builds the toggle button — `SimUI`
already mounts one in the control-panel header corner for every sim
automatically, and `index.html` mounts a `{floating: true}` one since it
doesn't use `SimUI`. New sim pages don't need to think about any of this
beyond including the script tag below.

### Page skeleton (copy this — note the `../` paths, files live one level
under `sims/` in a subject subdirectory)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>YOUR TITLE</title>
<link rel="stylesheet" href="../sim.css">
</head>
<body>
<canvas id="sim"></canvas>
<script src="../lib/theme.js"></script>
<script src="../lib/ui.js"></script>
<script src="../lib/engine3d.js"></script>
<script src="../lib/vessel.js"></script>   <!-- chemistry sims only -->
<script>
'use strict';
const S = { /* all sim state, mutated by controls */ };
const ui = SimUI({ back: '../index.html', title: '…', subtitle: '…' });
// build controls (see API below), then:
const foot = ui.footer('');
ui.hint('Drag to rotate · shift+drag to pan · scroll / pinch to zoom');
const { canvas, ctx, W, H } = SimCanvas();
const eng = Engine3D(canvas, { dist: 12, yaw: 0.5, pitch: 0.35 });
let lastT = 0;
function frame(tms) {
  const t = tms / 1000, dt = Math.min(t - lastT, 0.04); lastT = t;
  ctx.clearRect(0, 0, W(), H());
  eng.begin(W(), H());
  // … eng.line / sphere / poly / arrow / label / box calls …
  eng.flush(ctx);
  // … optional 2D overlays drawn straight on ctx (graphs, pH bar, energy bar) …
  requestAnimationFrame(frame);
}
window.BOOT_DONE = true;
requestAnimationFrame(frame);
</script>
</body>
</html>
```

`SimUI`'s `back` option defaults to `'index.html'`, which is wrong once the
page lives in a subject subdirectory — **always pass `back: '../index.html'`
explicitly.**

## Shared API reference

Read the source of a finished sim for a worked example —
`electromagnetism/charge-in-field.html` is the shortest complete one;
`electromagnetism/induction.html` shows a 2D graph overlay;
`chemistry/ph-scale.html` and `chemistry/neutralisation.html` are the
`lib/vessel.js` exemplars; `electromagnetism/voltage-hill.html` is the
exemplar for a **height-encodes-a-scalar landscape** (a circuit loop drawn as
a 3D track whose `y` at each point *is* the electric potential — cells ramp up,
resistors ramp down, translucent "curtain" polys from each raised segment to
the ground give the box/prism look). It also demonstrates several reusable
patterns worth copying:
- **Animate on change by easing a driver scalar, not by tweening geometry.**
  voltage-hill rebuilds all node heights every frame from one animated current
  `Idisp` (`Idisp += (Itarget-Idisp)*(1-exp(-dt*k))`, `k≈6`); opening the switch
  just changes `Itarget` and the whole potential profile flows to its new shape
  for free. Initialise the driver to `null` and set it to the target on the
  first frame so there's no start-up transient captured in previews.
- **A "shadow" projection**: draw a flat 2D copy of the same run list on the
  bench (`y = SHY`) under the 3D scene, linked by dashed vertical droplines at
  the corners — a cheap, legible way to tie an abstract 3D view to the ordinary
  diagram. A **view toggle** then just swaps which set (3D vs flat) is drawn and
  re-aims the camera (`eng.cam.pitch/dist/target`), reusing one geometry builder.
- **Reuse `circuit-3d.html`'s particle graph-walker** (`buildFlowGraph` +
  weighted-round-robin `pickBranch`) for anything with a fork (here: parallel
  resistors) — model the loop as directed runs in the carriers' travel
  direction and let the walker split them by branch current. Draw electrons in
  that direction and point the conventional-current `I` arrows the *opposite*
  way (tag the two rail runs and reverse the arrow).
- **Schematic component glyphs that must read as connected**: draw the
  continuous wire `a→b` first, then lay the symbol (battery plates, etc.) on
  top — leads that merely *approach* the symbol leave sub-pixel gaps that read
  as "not connecting."

### `lib/ui.js`

- `SimUI({title, subtitle, back})` → adds header + collapsible control panel.
  Returns `ui` with:
  - `ui.group(title)` → container element for the following calls
  - `ui.toggle(group, label, initialBool, cb, {swatch: '#hex'})` → `{get,set}`
  - `ui.slider(group, label, {min,max,step,value,fmt}, cb)` → `{get,set}`
  - `ui.segment(group, label|null, [{value,label},…], initialValue, cb)` —
    radio pills, → `{get,set}`
  - `ui.select(group, label, [{value,label},…], value, cb)`
  - `ui.buttons(group, [{label, onClick, primary?},…])` — returns the
    container element; grab individual buttons with
    `el.querySelectorAll('button')[i]` if you need to change a label later
    (e.g. a start/pause toggle button)
  - `ui.readout(group, label, initial)` → `{set(html)}` — big blue value
  - `ui.footer(html)` → `{set(html)}` — the "Key idea" panel: a collapsible
    box on the **left**, same chrome as the controls panel (click its
    `panel-head` to collapse/expand), anchored just below the header —
    `lib/ui.js` measures the header's actual rendered height (title +
    subtitle vary per sim) and repositions on resize, so don't hardcode a
    `top` offset for it yourself.
  - `ui.hint(text)` — small grey text bottom-left
- `SimCanvas()` → `{canvas, ctx, W(), H()}` — DPR-corrected full-viewport
  canvas (`W()`/`H()` are CSS-pixel getters).
- `Draw.arrow(ctx,x1,y1,x2,y2,color,width)`, `Draw.label(ctx,text,x,y,{size,
  color,align,weight})` — **2D overlay** helpers (call after `eng.flush`).

**2D overlay placement**: the control panel is `position:absolute; right:16px;
width:300px` — anything you draw at `W() - 300ish` will be hidden under it.
Put 2D overlays (graphs, bars) in the **bottom-left** corner instead, above
the hint text, matching `induction.html`'s graph and `combustion.html`'s
energy bar. The "Key idea" panel (`ui.footer`) no longer competes for this
space — it moved off the bottom entirely (top-left, below the header) — so
this bottom-left guidance is unaffected by footer content length.

### `lib/engine3d.js`

Points are arrays `[x,y,z]`, +y up. `v3` has `add sub mul dot cross len norm
lerp`. Colour utils `lighten(hex,t)` / `shade(hex,f)` are global.

- `Engine3D(canvas, {dist, yaw, pitch, focal})` → `eng`. Orbit (drag), pan
  (shift+drag, translates `eng.cam.target`), and zoom (wheel/pinch) are all
  wired automatically. Each frame: `eng.begin(W(),H())`, draw, `eng.flush(ctx)`
  (painter's-algorithm depth sort of everything buffered). `focal` defaults to
  1.5; **pass a smaller `focal` (≈1.2) to soften perspective** when a scene has
  wide depth so near objects don't render huge (voltage-hill.html).
- **Set `eng.cam.target = [x,y,z]` right after construction to pan the scene as
  a default view** — e.g. shift a wide scene right so it clears the top-left
  "Key idea" panel, and lift `y` to the mid-height of a tall object so it sits
  centred (voltage-hill.html sets `[-0.6, 1.3, 0]`). It's the same field
  shift+drag mutates.
- Gotcha: **a long axis viewed at a steep yaw recedes hard and crushes labels
  along it together.** If measurement labels down one side collide no matter
  how you nudge them, *lower the yaw toward side-on* (voltage-hill went 0.62→
  0.48) so that axis lies more across the screen — cheaper and clearer than
  fighting the collisions. As a second lever, offset colliding overlay labels
  in **screen space** via `eng.label`'s `dx`/`dy` (pixels), pushing one group
  up and its neighbour down.
- `eng.line(pts, {color, width, dash:[a,b], arrow, midArrow, depthOverride})` —
  polyline, auto-split per segment for correct occlusion; widths scale with
  depth. `depthOverride` (see the sphere note) forces every segment to sort at
  one fixed depth.
- `eng.arrow(from, to, {color, width, label})` — 3D arrow, optional big
  coloured label just past the head.
- `eng.sphere(p, r, color, {stroke, strokeWidth, label, highlight, depthOverride})` —
  shaded ball; `label` prints white text centred on it (use `'+'`, `'−'`).
  **Gotcha**: unless you pass `highlight` explicitly, it calls
  `lighten(color, 0.55)` to build the gradient's near side, and `lighten()`
  only parses `#rrggbb` hex. Passing an `rgba(...)` colour without a
  `highlight` override throws `SyntaxError: ... could not be parsed as a
  color` — the error only surfaces once that sphere is actually drawn, which
  can silently kill the whole `requestAnimationFrame` loop (see Testing
  below). Always pass `highlight` when `color` is `rgba(...)`.
- `eng.poly(pts, fillColor, {stroke, strokeWidth, depthBias})` — filled
  planar polygon. `depthBias` (negative = nearer) resolves z-fighting between
  coplanar fills.
- `eng.box(center, hx, hy, hz, color, {stroke, strokeWidth})` — shaded cuboid.
- `eng.label(p, text, {color, size, dx, dy, lift, weight})` — halo'd text at
  a 3D point; `lift` pulls it nearer in depth so it isn't buried.
- Gotcha: everything is depth-sorted per primitive — huge translucent
  polygons vs many small spheres sorts fine in practice, but nudge with
  `depthBias`/`lift` if something hides.
- Gotcha: a **composite object made of several primitives** (e.g. a bug =
  shell sphere + head sphere + leg/antenna lines) will *flicker* — its parts
  swap draw order as it moves, because each sorts on its own depth and the
  sphere depth key is `centre − r`, so a big part always beats a small one
  regardless of true position. Fix: project the object's centre once
  (`eng.project(c).depth`) and pass that as `depthOverride` to **every** part.
  The sort is stable, so the parts then layer purely by call order (draw
  back-to-front yourself) and the whole object sorts as one unit against
  everything else. Also give a big flat ground poly a large positive
  `depthBias` so it can never sort in front of things resting on it.
- Gotcha: a **ring/orbit built in world space collapses to a straight line**
  at some camera angles (its plane goes edge-on) — the old electron shells in
  `nuclear-physics/fission-fusion.html` looked like skewers through the
  nucleus. Fix: build the ring in a **camera-facing frame**, screen-right
  crossed with screen-up tipped back towards the viewer, so it always projects
  to an ellipse of a fixed aspect ratio:
  ```js
  const cy=Math.cos(eng.cam.yaw), sy=Math.sin(eng.cam.yaw);
  const cp=Math.cos(eng.cam.pitch), sp=Math.sin(eng.cam.pitch);
  const right=[cy,0,-sy], up=[-sp*sy,cp,-sp*cy], toward=[cp*sy,sp,cp*cy];
  // ring plane = right × (cos(TILT)·up + sin(TILT)·toward), TILT≈1.04 → 2:1 ellipse
  ```
  And do **not** `depthOverride` such a ring: letting each segment sort on its
  own depth is what makes the far half pass *behind* the thing it orbits,
  which is the whole illusion. (Rotate the in-screen basis by a per-object
  phase so a lattice of them isn't one repeated stamp.)
- Gotcha: `eng.sphere`'s own `label` is sized `max(pr*1.1, 10)` — right for
  `'+'`/`'−'`, far too big for a word like `'U-235'`. To write a name *across*
  a ball, size it yourself from the projected radius
  (`pr = r * q.s * eng.cam.focal * Math.min(W(),H()) / eng.cam.dist`) and call
  `eng.label(c, text, { size: px / q.s, lift: r + 0.05 })`; bail out below
  ~11px and fall back to a floating tag. Use **ink** text, not white —
  `eng.label`'s white halo then reads as an outline instead of smearing a pale
  ball. See `ballLabel()` in `nuclear-physics/fission-fusion.html`.
- Gotcha: **a long straight line passed as just two points sorts on its
  midpoint's depth**, so it paints straight over anything standing nearer than
  that midpoint — a floor grid line spanning `x ∈ [-9, 9]` drew on top of a
  source box sitting at `x = -6.6`. `eng.line` only splits *between* the points
  you give it, so give it more: a `seg(a, b, n)` helper that lerps `n+1` points
  makes each piece sort where it actually is. For a **floor** grid, skip that
  and pin the whole thing behind everything with a big constant
  `depthOverride` (`900`) — nothing is ever under the floor. See
  `nuclear-physics/radiation-safety.html`.
- Gotcha: **a small detail sitting proud of a big flat face** (an indicator
  lamp on a detector panel, a button on a box) still sorts on its own depth,
  and one placed low/off-centre is genuinely further from the camera than the
  face's centre — so it silently disappears behind the panel while its
  siblings higher up render fine. Pin all of them to the face's own projected
  depth: `depthOverride: eng.project(faceCentre).depth - 0.4`. Recompute it
  each frame and orbiting round the back still hides them correctly.
- Gotcha: **parallel beams/tracks must be separated in `y`, not `z`.** Three
  lanes offset in `z` collapse into one jumbled band at the usual camera yaw;
  stacked vertically they stay distinct at every angle.
- Gotcha: if a per-particle scalar like `fade` or `age` **multiplies drawn
  geometry** (radius, ray length), a negative `dt` grows it without bound —
  one bad frame and the screen fills with a giant sphere. Clamp at both ends:
  `Math.max(0, Math.min(t - lastT, 0.04))`.
- For **any wave/photon**, reuse `sinePts(from, to, wavelength, amp)` from
  `atomic-structure/bohr-model.html`: a sine carrier under a
  `Math.sin(Math.PI * f)` envelope, so the packet tapers to nothing at both
  ends instead of stopping dead. That envelope is the whole reason it reads as
  a photon rather than a scribble — and no arrowhead. Space emitted packets so
  `gap × speed` comfortably exceeds the packet length, or the stream fuses into
  one continuous wave.

### `lib/vessel.js` (chemistry only)

- `drawBeaker(eng, {x,z, r, y0, y1, level, liquid, glass, lineW, lip})` —
  straight vessel (beaker if squat, flat-bottomed tube if slim). `liquid`
  should be `rgba(...,0.5–0.6)`.
- `drawTestTube(eng, {x,z, r, y0, y1, level, liquid, glass, lineW})` —
  round-bottomed test tube: straight walls closed by a hemispherical bowl.
  `y0` is the lowest point of the bowl; the hemisphere centre is `y0 + r`.
  It can't stand on the bench — hang it from a clamp stand (base plate +
  rod + arm boxes, plus an `eng.line(circle3(clampY, r + 0.07))` ring),
  see `chemistry/ph-scale.html`.
- `drawFlask(eng, {x,z, rBase, rNeck, y0, yShoulder, y1, level, liquid})` —
  conical flask.
- `drawMolecule(eng, p, dir, spec, {scale, showLabels})` — ball-and-stick
  molecule at `p`, local +x axis aligned with `dir` (pass the particle's
  velocity so it tumbles as it moves; for non-swarm particles store a random
  yaw phase/speed + tilt at spawn and rotate the dir each frame, as
  `combustion.html` does). `spec = { atoms: [{d:[x,y,z], r, color, label?,
  highlight?}], bonds: [[i,j],…], bondColor?, bondW? }`. It handles the
  composite-object depthOverride gotcha internally (bonds first, atoms
  back-to-front, all at the molecule centre's depth) — never hand-roll a
  multi-sphere molecule again.
- `ParticleSwarm({r, y0, y1, x, z, bowl?, rAt?})` → swarm confined to that
  cylinder:
  - `bowl: {yc, r}` — hemispherical bottom (round test tube): below `yc`
    particles bounce off that sphere instead of the wall/floor. Pair with
    `drawTestTube`: `bowl.yc` = glass `y0 + r`, `bowl.r` = swarm `r`.
  - `rAt: y => radius` — height-dependent wall (a conical flask's taper);
    without it particles poke through sloped glass once the level rises.
    See `neutralisation.html` (`flaskRAt`).
  - `.want(key, {n, color, radius, label, speed})` — declare/update a group;
    changing `n` later drifts the population gradually (nice for reactions)
  - `.setRegion({y1: newSurface})` when the liquid level changes
  - `.step(dt)` then `.draw(eng, showLabels)` — or skip `.draw` and render
    `.list(key)` yourself (all four chemistry sims do, to switch between
    labelled spheres and `drawMolecule` models)
  - `.count(key)` — current live count
- `circle3(y, r, n?)` and `sideVec(eng)` for custom glassware.
- All four chemistry sims share a **particle-mode toggle convention**: a
  `ui.group('Particles')` with `ui.toggle(gp, 'Labelled spheres (vs molecule
  models)', false, …)` — default **off = accurate molecule models** (bare H⁺
  dust, bonded O–H, real relative ion sizes), on = big uniform spheres
  labelled with full formulas ('H⁺', 'OH⁻', 'Na⁺'…). Reuse the exact label
  string and default in any new chemistry sim.
- **If a non-chemistry sim needs `sideVec` or `frontVec`** (e.g. for a
  camera-facing flame/cone silhouette) and nothing else from vessel.js,
  don't add a `<script src="../lib/vessel.js">` tag just for one helper —
  inline the ~3-line function instead. `sideVec` is:
  ```js
  function sideVec(eng) {
    return [-Math.cos(eng.cam.yaw), 0, Math.sin(eng.cam.yaw)];
  }
  ```
  (`combustion.html` used to inline it but now loads vessel.js properly,
  since it also uses `drawMolecule`.)

## Testing

```sh
cd /Users/hamish/Desktop/sims
python3 -m http.server 8123   # then open http://localhost:8123/index.html
```

**Automated**: see `tests/README.md` + `tests/headless.js` — raw-CDP
headless Chrome, zero npm deps. Key traps:
- Wait on `window.BOOT_DONE`, not just page load.
- **A thrown exception inside `frame()` silently kills the animation loop**
  (the `requestAnimationFrame(frame)` call at the end of `frame` never
  happens) — if a readout/state variable looks frozen after some interaction,
  suspect an uncaught exception rather than dead logic. Reproduce directly
  with `await page.eval("frame(<some_tms>)")` — `page.eval` throws with the
  real stack trace, which a live rAF loop swallows.
- Fail on zero-things-scanned/rendered, never let a test pass vacuously.
- `tests/test_chemistry.js` covers all four chemistry sims — run it after
  touching them or vessel.js. Its containment assertions (every particle
  inside the vessel's glass profile) are what caught `ParticleSwarm`
  silently dropping newly added region options; keep geometry assertions
  like that when adding vessel/swarm features, and remember the live rAF
  loop keeps mutating state between `page.eval` calls (assert with slack,
  not exact equality, on anything time-driven).

**Preview thumbnails** (`previews/<slug>.png`, used by `index.html`'s card
grid): after a visual change worth re-previewing, recapture with headless
Chrome — launch the page, wait for `BOOT_DONE`, click `.panel-head` to
collapse the control panel (cleaner scene-only shot), wait ~1s for
particles/animation to settle, `page.screenshot(...)`, then shrink with
`sips -Z 640 previews/*.png` (macOS built-in, no deps) to keep the repo
light. `index.html`'s `.card .thumb` uses `object-fit: cover; object-position:
center 65%` to crop toward the scene and away from the header.

## Adding a new sim

1. Pick the right topic subdirectory (or make a new one if it's a genuinely
   new topic) and copy the page skeleton above.
2. Build it against the house style contract; keep controls/readouts/footer
   matching the conventions of sibling sims in that subdirectory.
3. Test per the Testing section, over HTTP.
4. Capture a preview screenshot into `previews/<slug>.png` and add a card
   (thumbnail + title + one-line teaching hook) to the relevant topic
   section of `index.html` — see "Hub structure" above for where that
   section sits (which subject group) and how it's titled (topic-only, no
   year/level prefix). If the topic itself is new, add a `<div
   class="hub-section">` under the right `<h1 class="subject-title">`.
5. Add the same sim to `reference/sims.md` in the separate `lesson_planning`
   repo (`~/Desktop/TTI/scihub/lesson_planning/reference/sims.md` — that repo
   is where lesson-planning docs for these sims live) — a table row plus a
   paragraph per sim (what it shows, misconception it heads off, suggested
   lesson moment), in the matching subject/topic section.
6. If you added or changed shared engine behaviour (like the pan feature),
   update the "Shared API reference" section above and consider whether
   every sim's `ui.hint(...)` text needs updating too (they're all currently
   identical strings — a `sed` across every subject dir's `*.html` files
   keeps them in sync).
