/* vessel.js — 3D glassware + particle swarms for the chemistry sims.
   Depends on engine3d.js (v3, an Engine3D instance) being loaded first.
   All shapes are centred on the y axis; liquids are drawn with a
   camera-facing silhouette quad, which reads as a solid of revolution
   from any orbit angle.

   API (all take the Engine3D instance `eng` as first arg):
     sideVec(eng)                              → unit vector ⊥ to the view, horizontal
     circle3(y, r, n?)                         → points of a horizontal circle
     drawBeaker(eng, o)                        → straight-walled beaker/flat tube
     drawTestTube(eng, o)                      → round-bottomed test tube
     drawFlask(eng, o)                         → conical flask with neck
     drawMolecule(eng, p, dir, spec, o)        → ball-and-stick molecule
     ParticleSwarm(region)                     → bouncing labelled spheres in a
                                                 cylinder (optional bowl bottom)
*/

function sideVec(eng) {
  // horizontal unit vector perpendicular to the camera direction
  return [-Math.cos(eng.cam.yaw), 0, Math.sin(eng.cam.yaw)];
}

function circle3(y, r, n) {
  n = n || 40;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([r * Math.cos(a), y, r * Math.sin(a)]);
  }
  return pts;
}

/* colour helpers for the liquid-cylinder shading below — accept either
   '#rrggbb' or 'rgba(r,g,b,a)' (vessel liquids are always specced as rgba) */
function parseColor(c) {
  if (c[0] === '#') {
    const n = parseInt(c.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
  return { r: 140, g: 160, b: 180, a: 0.5 };
}
function shadeRGBA(c, f, aMul) {
  const r = Math.max(0, Math.min(255, Math.round(c.r * f)));
  const g = Math.max(0, Math.min(255, Math.round(c.g * f)));
  const b = Math.max(0, Math.min(255, Math.round(c.b * f)));
  const a = c.a * (aMul === undefined ? 1 : aMul);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';
}
// horizontal unit vector pointing from the orbit target toward the camera
function frontVec(eng) {
  return [Math.sin(eng.cam.yaw), 0, Math.cos(eng.cam.yaw)];
}

// "up" as seen by the camera — [0,1,0] at pitch 0, tilting toward the
// horizontal as the camera pitches to look from steeply above/below.
// Together with sideVec (always ⊥ to the view) this spans the silhouette
// plane at any orbit angle — needed by drawTestTube's bottom-curve arc.
function viewUpVec(eng) {
  const sy = Math.sin(eng.cam.yaw), cy = Math.cos(eng.cam.yaw);
  const sp = Math.sin(eng.cam.pitch), cp = Math.cos(eng.cam.pitch);
  return [-sy * sp, cp, -cy * sp];
}

/* Wrapped, shaded cylinder wall — used for liquid bodies (and the beaker
   flare below) instead of a flat silhouette quad, so it reads as round from
   any orbit angle: segments facing the camera are lit, ones curving away
   are darker.
   o: { x?, z?, y0, level (top), liquid (colour), rAt(y)→radius, segments?,
        rows? (vertical bands, >1 for curved profiles — default 1),
        cap? (draw the top surface disc — default true),
        backstop? (opaque bottom disc — default follows cap; pass false when
                   the vessel bottom is closed glass, e.g. a round tube) }  */
function drawLiquidCylinder(eng, o) {
  const cx = o.x || 0, cz = o.z || 0;
  const col = parseColor(o.liquid);
  const fwd = frontVec(eng);
  const N = o.segments || 28;
  const rows = o.rows || 1;
  for (let j = 0; j < rows; j++) {
    const ya = o.y0 + ((o.level - o.y0) * j) / rows;
    const yb = o.y0 + ((o.level - o.y0) * (j + 1)) / rows;
    const r0 = o.rAt(ya), r1 = o.rAt(yb);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      const amid = (a0 + a1) / 2;
      const facing = Math.cos(amid) * fwd[0] + Math.sin(amid) * fwd[2]; // +1 toward camera, -1 away
      const light = 0.78 + 0.4 * facing;
      const p0 = [cx + r0 * Math.cos(a0), ya, cz + r0 * Math.sin(a0)];
      const p1 = [cx + r0 * Math.cos(a1), ya, cz + r0 * Math.sin(a1)];
      const p2 = [cx + r1 * Math.cos(a1), yb, cz + r1 * Math.sin(a1)];
      const p3 = [cx + r1 * Math.cos(a0), yb, cz + r1 * Math.sin(a0)];
      eng.poly([p0, p1, p2, p3], shadeRGBA(col, light));
    }
  }
  if (o.cap !== false) {
    const rBot = o.rAt(o.y0), rTop = o.rAt(o.level);
    if (o.backstop !== false && rBot > 0.01) {
      // near-opaque backstop (ignores the liquid's own alpha) so nothing behind the
      // vessel — e.g. the bench grid — bleeds through the open bottom; slightly
      // oversized so no sliver of the bench shows at the rim either
      const backR = Math.round(col.r * 0.5), backG = Math.round(col.g * 0.5), backB = Math.round(col.b * 0.5);
      eng.poly(circle3(o.y0, rBot * 1.03).map(p => [p[0] + cx, p[1], p[2] + cz]), 'rgba(' + backR + ',' + backG + ',' + backB + ',0.92)');
    }
    // surface glint, nudged in front of the body in depth
    eng.poly(circle3(o.level, rTop * 0.98).map(p => [p[0] + cx, p[1], p[2] + cz]), shadeRGBA(col, 1.12), { depthBias: -0.03 });
  }
}

/* Straight-walled vessel (beaker if squat, test tube if slim).
   o: { x?, z?      — centre offset (default 0,0)
        r           — radius
        y0, y1      — bottom / rim height
        level       — liquid surface height (≤ y1); omit for empty
        liquid      — CSS colour for the liquid (use rgba with ~0.55 alpha)
        glass?      — outline colour (default translucent slate)
        lineW?      — outline width (default 3.5)
        lip?        — true for an actual beaker: adds a flared pour lip
                      (skip for test tubes / burettes)                     }*/
function drawBeaker(eng, o) {
  const cx = o.x || 0, cz = o.z || 0;
  const off = p => [p[0] + cx, p[1], p[2] + cz];
  const glass = o.glass || 'rgba(100,116,139,0.75)';
  const lw = o.lineW || 3.5;
  const s = v3.mul(sideVec(eng), o.r);

  if (o.liquid && o.level > o.y0) {
    drawLiquidCylinder(eng, { x: cx, z: cz, y0: o.y0, level: o.level, liquid: o.liquid, rAt: () => o.r });
  }
  // glass outlines: bottom, rim, and the two silhouette edges
  eng.line(circle3(o.y0, o.r).map(off), { color: glass, width: lw });
  eng.line(circle3(o.y1, o.r).map(off), { color: glass, width: lw });
  eng.line([off([-s[0], o.y0, -s[2]]), off([-s[0], o.y1, -s[2]])], { color: glass, width: lw });
  eng.line([off([s[0], o.y0, s[2]]), off([s[0], o.y1, s[2]])], { color: glass, width: lw });

  if (o.lip) {
    const rim = o.r * 1.12;
    const yLip = o.y1 - 0.12;
    drawLiquidCylinder(eng, {
      x: cx, z: cz, y0: yLip, level: o.y1, segments: 24, cap: false,
      liquid: 'rgba(100,116,139,0.3)',
      rAt: y => o.r + (rim - o.r) * ((y - yLip) / (o.y1 - yLip))
    });
    eng.line(circle3(o.y1, rim).map(off), { color: glass, width: lw * 1.15 });
  }
}

/* Round-bottomed test tube: straight walls closed by a hemispherical bowl.
   o: { x?, z?      — centre offset (default 0,0)
        r           — radius
        y0          — lowest point of the bowl (hemisphere centre is y0 + r)
        y1          — rim height
        level?      — liquid surface height; omit for empty
        liquid?     — CSS colour (rgba with ~0.55 alpha)
        glass?, lineW? — as drawBeaker }                                   */
function drawTestTube(eng, o) {
  const cx = o.x || 0, cz = o.z || 0;
  const off = p => [p[0] + cx, p[1], p[2] + cz];
  const glass = o.glass || 'rgba(100,116,139,0.75)';
  const lw = o.lineW || 3.5;
  const yc = o.y0 + o.r; // hemisphere centre
  const rAt = y => y >= yc ? o.r : Math.sqrt(Math.max(0, o.r * o.r - (yc - y) * (yc - y)));
  const sv = sideVec(eng);
  const up = viewUpVec(eng);

  if (o.liquid && o.level > o.y0) {
    if (o.level > yc) {
      // curved bowl (subdivided) + straight column above it
      drawLiquidCylinder(eng, { x: cx, z: cz, y0: o.y0, level: yc, liquid: o.liquid, rAt, rows: 5, cap: false });
      drawLiquidCylinder(eng, { x: cx, z: cz, y0: yc, level: o.level, liquid: o.liquid, rAt: () => o.r, backstop: false });
    } else {
      drawLiquidCylinder(eng, { x: cx, z: cz, y0: o.y0, level: o.level, liquid: o.liquid, rAt, rows: 5, backstop: false });
    }
  }
  // glass: rim circle, straight silhouette edges, and a camera-facing
  // semicircular arc closing the round bottom
  eng.line(circle3(o.y1, o.r).map(off), { color: glass, width: lw });
  for (const sgn of [-1, 1]) {
    eng.line([off([sgn * sv[0] * o.r, yc, sgn * sv[2] * o.r]), off([sgn * sv[0] * o.r, o.y1, sgn * sv[2] * o.r])], { color: glass, width: lw });
  }
  // Silhouette of the round bottom: a great-circle arc in the plane
  // perpendicular to the view direction (spanned by sv and up), not a fixed
  // vertical plane — a fixed world-y plane only matches sv/up at pitch 0 and
  // draws the wrong curve when orbiting to steep top-down/bottom-up angles.
  const arc = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (i / 16);
    const c = Math.cos(a) * o.r, s = Math.sin(a) * o.r;
    arc.push(off([sv[0] * c - up[0] * s, yc - up[1] * s, sv[2] * c - up[2] * s]));
  }
  eng.line(arc, { color: glass, width: lw });
}

/* Conical flask: wide base tapering to a neck.
   o: { x?, z?, rBase, rNeck, y0, yShoulder, y1 (top of neck),
        level?, liquid?, glass?, lineW? }                                 */
function drawFlask(eng, o) {
  const cx = o.x || 0, cz = o.z || 0;
  const off = p => [p[0] + cx, p[1], p[2] + cz];
  const glass = o.glass || 'rgba(100,116,139,0.75)';
  const lw = o.lineW || 3.5;
  const sv = sideVec(eng);
  const rAt = y => {
    if (y >= o.yShoulder) return o.rNeck;
    const t = (y - o.y0) / (o.yShoulder - o.y0);
    return o.rBase + (o.rNeck - o.rBase) * t;
  };
  if (o.liquid && o.level > o.y0) {
    const r0 = o.rBase, r1 = rAt(o.level);
    const q = [
      off([-sv[0] * r0, o.y0, -sv[2] * r0]),
      off([sv[0] * r0, o.y0, sv[2] * r0]),
      off([sv[0] * r1, o.level, sv[2] * r1]),
      off([-sv[0] * r1, o.level, -sv[2] * r1])
    ];
    eng.poly(q, o.liquid);
    eng.poly(circle3(o.level, r1 * 0.98).map(off), o.liquid, { depthBias: -0.03 });
  }
  // outlines: base circle, shoulder→rim edges, neck rim
  eng.line(circle3(o.y0, o.rBase).map(off), { color: glass, width: lw });
  eng.line(circle3(o.y1, o.rNeck).map(off), { color: glass, width: lw });
  for (const sgn of [-1, 1]) {
    eng.line([
      off([sgn * sv[0] * o.rBase, o.y0, sgn * sv[2] * o.rBase]),
      off([sgn * sv[0] * o.rNeck, o.yShoulder, sgn * sv[2] * o.rNeck]),
      off([sgn * sv[0] * o.rNeck, o.y1, sgn * sv[2] * o.rNeck])
    ], { color: glass, width: lw });
  }
}

/* Ball-and-stick molecule at point p, oriented so the spec's local +x axis
   lies along `dir` (pass the particle's velocity so it tumbles naturally).
   spec: { atoms: [{ d:[x,y,z], r, color, label?, highlight? }, …],
           bonds: [[i,j], …], bondColor?, bondW? }
   o: { scale? (multiplies offsets and radii), showLabels? }
   Every part shares one depthOverride and atoms are drawn back-to-front, so
   the whole molecule sorts as a single unit against the rest of the scene
   (the composite-object gotcha in engine3d).                              */
function drawMolecule(eng, p, dir, spec, o) {
  o = o || {};
  const k = o.scale || 1;
  const xa = v3.len(dir) > 1e-4 ? v3.norm(dir) : [1, 0, 0];
  const ref = Math.abs(xa[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const za = v3.norm(v3.cross(xa, ref));
  const ya = v3.cross(za, xa);
  const pos = spec.atoms.map(a => [
    p[0] + (xa[0] * a.d[0] + ya[0] * a.d[1] + za[0] * a.d[2]) * k,
    p[1] + (xa[1] * a.d[0] + ya[1] * a.d[1] + za[1] * a.d[2]) * k,
    p[2] + (xa[2] * a.d[0] + ya[2] * a.d[1] + za[2] * a.d[2]) * k
  ]);
  const depth = eng.project(p).depth;
  for (const b of spec.bonds || []) {
    eng.line([pos[b[0]], pos[b[1]]], { color: spec.bondColor || '#64748b', width: spec.bondW || 2.5, depthOverride: depth });
  }
  const order = spec.atoms.map((a, i) => i)
    .sort((i, j) => eng.project(pos[j]).depth - eng.project(pos[i]).depth);
  for (const i of order) {
    const a = spec.atoms[i];
    eng.sphere(pos[i], a.r * k, a.color, {
      depthOverride: depth,
      stroke: 'rgba(26,26,46,0.3)', strokeWidth: 1,
      label: o.showLabels && a.label ? a.label : undefined,
      highlight: a.highlight
    });
  }
}

/* Bouncing labelled spheres confined to a cylinder (the liquid).
   region: { r, y0, y1, x?, z?, bowl?, rAt? } — call setRegion to move the surface.
   bowl: { yc, r } — optional hemispherical bottom (a round test tube):
   below yc particles bounce off a sphere of radius r centred at [x, yc, z]
   instead of the cylinder wall/floor.
   rAt: y → radius — optional height-dependent wall radius (≤ r, e.g. a
   conical flask's taper), used for wall bounces and spawning.
   Usage:
     const swarm = ParticleSwarm({ r: 1.6, y0: -1.4, y1: 0.6 });
     swarm.want('H+',  { n: 12, color: '#e63946', radius: 0.13, label: '+', speed: 0.8 });
     swarm.want('OH-', { n: 2,  color: '#2563eb', radius: 0.15, label: '−' });
     swarm.step(dt);  swarm.draw(eng);
   Changing n later adds/removes particles gradually (a few per frame). */
function ParticleSwarm(region) {
  const groups = {}; // key → { cfg, parts: [{p, v}] }
  // copy the whole region (incl. optional bowl / rAt) — not a field whitelist
  const R = Object.assign({ x: 0, z: 0 }, region);

  function wallR(y) { return R.rAt ? Math.min(R.r, R.rAt(y)) : R.r; }

  function spawn(cfg) {
    const a = Math.random() * Math.PI * 2;
    const y = R.y0 + Math.random() * (R.y1 - R.y0);
    const rr = Math.sqrt(Math.random()) * Math.max(0.05, wallR(y) - cfg.radius);
    return {
      p: [R.x + rr * Math.cos(a), y, R.z + rr * Math.sin(a)],
      v: v3.mul(v3.norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]), cfg.speed || 0.7)
    };
  }

  return {
    setRegion(r2) { Object.assign(R, r2); },
    want(key, cfg) {
      if (!groups[key]) groups[key] = { cfg, parts: [] };
      groups[key].cfg = Object.assign(groups[key].cfg, cfg);
    },
    count(key) { return groups[key] ? groups[key].parts.length : 0; },
    // raw particle list [{p,v},…] for a group, so callers can render something
    // fancier than a single sphere (e.g. a compound molecule) while still
    // getting the swarm's motion/bounce physics for free
    list(key) { return groups[key] ? groups[key].parts : []; },
    step(dt) {
      for (const key in groups) {
        const g = groups[key];
        // drift counts toward target, max 2 per frame per group
        const want = Math.max(0, Math.round(g.cfg.n || 0));
        if (g.parts.length < want) g.parts.push(spawn(g.cfg));
        if (g.parts.length < want) g.parts.push(spawn(g.cfg));
        if (g.parts.length > want) g.parts.splice(0, g.parts.length > want + 1 ? 2 : 1);
        for (const pt of g.parts) {
          pt.p = v3.add(pt.p, v3.mul(pt.v, dt));
          // wobble
          pt.v = v3.norm(v3.add(pt.v, v3.mul([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5], 0.25)));
          pt.v = v3.mul(pt.v, g.cfg.speed || 0.7);
          // bounce off cylinder wall + floor/surface (or the bowl, if set)
          if (R.bowl && pt.p[1] < R.bowl.yc) {
            const c = [R.x, R.bowl.yc, R.z];
            const d = v3.sub(pt.p, c), L = v3.len(d);
            const rm = R.bowl.r - g.cfg.radius;
            if (L > rm) {
              const nrm = v3.mul(d, 1 / (L || 1));
              pt.p = v3.add(c, v3.mul(nrm, rm));
              const dot = v3.dot(pt.v, nrm);
              pt.v = v3.sub(pt.v, v3.mul(nrm, 2 * dot));
            }
          } else {
            const dx = pt.p[0] - R.x, dz = pt.p[2] - R.z;
            const rr = Math.hypot(dx, dz);
            const rmax = Math.max(0.05, wallR(pt.p[1]) - g.cfg.radius);
            if (rr > rmax) {
              const nx = dx / rr, nz = dz / rr;
              pt.p[0] = R.x + nx * rmax; pt.p[2] = R.z + nz * rmax;
              const dot = pt.v[0] * nx + pt.v[2] * nz;
              pt.v[0] -= 2 * dot * nx; pt.v[2] -= 2 * dot * nz;
            }
            const yLo = R.y0 + g.cfg.radius;
            if (!R.bowl && pt.p[1] < yLo) { pt.p[1] = yLo; pt.v[1] = Math.abs(pt.v[1]); }
          }
          const yHi = R.y1 - g.cfg.radius;
          if (pt.p[1] > yHi) { pt.p[1] = yHi; pt.v[1] = -Math.abs(pt.v[1]); }
        }
      }
    },
    draw(eng, showLabels) {
      for (const key in groups) {
        const g = groups[key];
        for (const pt of g.parts) {
          eng.sphere(pt.p, g.cfg.radius, g.cfg.color, showLabels !== false && g.cfg.label
            ? { label: g.cfg.label, stroke: 'rgba(26,26,46,0.35)', strokeWidth: 1 } : {});
        }
      }
    }
  };
}
