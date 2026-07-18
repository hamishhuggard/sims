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
  lib/ui.js, lib/engine3d.js, lib/vessel.js   — shared engine, frozen unless
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

- **Light mode only** (projected in a classroom), white background.
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
- Last line of the script, right before starting the animation loop:
  `window.BOOT_DONE = true;` — the headless test harness (and preview
  screenshotter) waits on this.
- `'use strict';` vanilla JS, no libraries, self-contained file.

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
`lib/vessel.js` exemplars.

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
  - `ui.footer(html)` → `{set(html)}` — the bottom equation strip
  - `ui.hint(text)` — small grey text bottom-left
- `SimCanvas()` → `{canvas, ctx, W(), H()}` — DPR-corrected full-viewport
  canvas (`W()`/`H()` are CSS-pixel getters).
- `Draw.arrow(ctx,x1,y1,x2,y2,color,width)`, `Draw.label(ctx,text,x,y,{size,
  color,align,weight})` — **2D overlay** helpers (call after `eng.flush`).

**2D overlay placement**: the control panel is `position:absolute; right:16px;
width:300px` — anything you draw at `W() - 300ish` will be hidden under it.
Put 2D overlays (graphs, bars) in the **bottom-left** corner instead, above
the hint text, matching `induction.html`'s graph and `combustion.html`'s
energy bar.

### `lib/engine3d.js`

Points are arrays `[x,y,z]`, +y up. `v3` has `add sub mul dot cross len norm
lerp`. Colour utils `lighten(hex,t)` / `shade(hex,f)` are global.

- `Engine3D(canvas, {dist, yaw, pitch})` → `eng`. Orbit (drag), pan
  (shift+drag, translates `eng.cam.target`), and zoom (wheel/pinch) are all
  wired automatically. Each frame: `eng.begin(W(),H())`, draw, `eng.flush(ctx)`
  (painter's-algorithm depth sort of everything buffered).
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

### `lib/vessel.js` (chemistry only)

- `drawBeaker(eng, {x,z, r, y0, y1, level, liquid, glass, lineW, lip})` —
  straight vessel (beaker if squat, test tube if slim). `liquid` should be
  `rgba(...,0.5–0.6)`.
- `drawFlask(eng, {x,z, rBase, rNeck, y0, yShoulder, y1, level, liquid})` —
  conical flask.
- `ParticleSwarm({r, y0, y1, x, z})` → swarm confined to that cylinder:
  - `.want(key, {n, color, radius, label, speed})` — declare/update a group;
    changing `n` later drifts the population gradually (nice for reactions)
  - `.setRegion({y1: newSurface})` when the liquid level changes
  - `.step(dt)` then `.draw(eng, showLabels)`
  - `.count(key)` — current live count
- `circle3(y, r, n?)` and `sideVec(eng)` for custom glassware.
- **If a non-chemistry sim needs `sideVec` or `frontVec`** (e.g. for a
  camera-facing flame/cone silhouette, like `chemistry/combustion.html`
  does), don't add a `<script src="../lib/vessel.js">` tag just for one
  helper — inline the ~3-line function instead. `sideVec` is:
  ```js
  function sideVec(eng) {
    return [-Math.cos(eng.cam.yaw), 0, Math.sin(eng.cam.yaw)];
  }
  ```

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
