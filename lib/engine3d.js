/* Engine3D — tiny hand-rolled 3D renderer on canvas 2D for the classroom sims.
   No deps, painter's-algorithm depth sort, chunky projected line widths.

   Coordinates: right-handed, +y up. Points are arrays [x,y,z].
   Usage:
     const eng = Engine3D(canvas, { dist: 12, yaw: 0.7, pitch: 0.4 });
     eng.begin();
     eng.line([[0,0,0],[1,0,0]], { color:'#333', width:5, arrow:true });
     eng.sphere([0,1,0], 0.2, '#2563eb');
     eng.flush(ctx, W, H);
   Dragging the canvas orbits; wheel / pinch zooms.
*/

/* --- vec3 helpers (arrays) --- */
const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ],
  len: a => Math.hypot(a[0], a[1], a[2]),
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
};

function Engine3D(canvas, opts) {
  opts = opts || {};
  const cam = {
    yaw: opts.yaw !== undefined ? opts.yaw : 0.7,
    pitch: opts.pitch !== undefined ? opts.pitch : 0.38,
    dist: opts.dist || 12,
    target: opts.target || [0, 0, 0],
    focal: opts.focal || 1.5   // multiplied by min(W,H)
  };
  let W = 0, H = 0;
  let buf = [];

  function project(p) {
    const t = v3.sub(p, cam.target);
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const x1 = cy * t[0] - sy * t[2];
    const z1 = sy * t[0] + cy * t[2];
    const y2 = cp * t[1] - sp * z1;
    const z2 = sp * t[1] + cp * z1;
    const depth = cam.dist - z2;
    const f = cam.focal * Math.min(W, H);
    const s = f / Math.max(depth, 0.1);
    return { x: W / 2 + x1 * s, y: H / 2 - y2 * s, s: s / f * cam.dist, depth };
    // .s is a relative scale: 1 at the orbit target's distance
  }

  function push(depth, fn) { buf.push({ depth, fn }); }

  /* polyline, split into segments for proper occlusion */
  function line(pts, o) {
    o = o || {};
    const projected = pts.map(project);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = projected[i], b = projected[i + 1];
      const depth = o.depthOverride !== undefined ? o.depthOverride : (a.depth + b.depth) / 2;
      const w = (o.width || 4) * ((a.s + b.s) / 2);
      const isLast = i === pts.length - 2;
      push(depth, ctx => {
        ctx.strokeStyle = o.color || '#1a1a2e';
        ctx.lineWidth = Math.max(w, 1);
        ctx.lineCap = 'round';
        ctx.setLineDash(o.dash ? o.dash.map(d => d * a.s) : []);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        if (o.arrow && isLast) drawHead(ctx, projected[i], projected[i + 1], o);
        if (o.midArrow && i === Math.floor((pts.length - 1) / 2)) drawHead(ctx, a, b, o, 0.5);
      });
    }
  }

  function drawHead(ctx, a, b, o, tpos) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const ux = dx / len, uy = dy / len;
    const size = Math.max(8, (o.width || 4) * 2.8) * ((a.s + b.s) / 2);
    const tx = tpos !== undefined ? a.x + dx * tpos + ux * size / 2 : b.x;
    const ty = tpos !== undefined ? a.y + dy * tpos + uy * size / 2 : b.y;
    ctx.fillStyle = o.color || '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - ux * size - uy * size * 0.55, ty - uy * size + ux * size * 0.55);
    ctx.lineTo(tx - ux * size + uy * size * 0.55, ty - uy * size - ux * size * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  /* 3D arrow: shaft + head, one primitive */
  function arrow(from, to, o) {
    o = o || {};
    const a = project(from), b = project(to);
    const depth = (a.depth + b.depth) / 2;
    push(depth, ctx => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      const w = (o.width || 5) * ((a.s + b.s) / 2);
      const head = Math.max(10, w * 2.6);
      const ux = dx / len, uy = dy / len;
      const bx = b.x - ux * head, by = b.y - uy * head;
      ctx.strokeStyle = ctx.fillStyle = o.color || '#1a1a2e';
      ctx.lineWidth = Math.max(w, 1.5);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bx, by); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(bx - uy * head * 0.55, by + ux * head * 0.55);
      ctx.lineTo(bx + uy * head * 0.55, by - ux * head * 0.55);
      ctx.closePath(); ctx.fill();
      if (o.label) {
        const lx = b.x + ux * head * 1.2, ly = b.y + uy * head * 1.2;
        haloText(ctx, o.label, lx, ly, o.color, 17 * ((a.s + b.s) / 2));
      }
    });
  }

  function sphere(p, r, color, o) {
    o = o || {};
    const q = project(p);
    const pr = r * q.s * cam.focal * Math.min(W, H) / cam.dist;
    push(o.depthOverride !== undefined ? o.depthOverride : q.depth - r, ctx => {
      const g = ctx.createRadialGradient(q.x - pr * 0.35, q.y - pr * 0.35, pr * 0.1, q.x, q.y, pr);
      g.addColorStop(0, o.highlight || lighten(color, 0.55));
      g.addColorStop(1, color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(q.x, q.y, Math.max(pr, 0.5), 0, Math.PI * 2);
      ctx.fill();
      if (o.stroke) {
        ctx.strokeStyle = o.stroke;
        ctx.lineWidth = (o.strokeWidth || 2.5) * q.s;
        ctx.stroke();
      }
      if (o.label) haloText(ctx, o.label, q.x, q.y, o.labelColor || '#fff', Math.max(pr * 1.1, 10), false);
    });
  }

  /* filled 3D polygon (planar) */
  function poly(pts, color, o) {
    o = o || {};
    const projected = pts.map(project);
    const depth = projected.reduce((s, p) => s + p.depth, 0) / projected.length + (o.depthBias || 0);
    push(depth, ctx => {
      ctx.beginPath();
      projected.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.closePath();
      if (color) { ctx.fillStyle = color; ctx.fill(); }
      if (o.stroke) {
        ctx.strokeStyle = o.stroke;
        ctx.lineWidth = (o.strokeWidth || 3) * projected[0].s;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });
  }

  /* axis-aligned-ish box from center + half-sizes, optionally rotated by fn */
  function box(c, hx, hy, hz, color, o) {
    o = o || {};
    const xf = o.transform || (p => p);
    const corners = [];
    for (let i = 0; i < 8; i++) {
      corners.push(xf([
        c[0] + (i & 1 ? hx : -hx),
        c[1] + (i & 2 ? hy : -hy),
        c[2] + (i & 4 ? hz : -hz)
      ]));
    }
    const faces = [
      [0, 1, 3, 2], [4, 6, 7, 5], // z-, z+
      [0, 2, 6, 4], [1, 5, 7, 3], // x-, x+
      [0, 4, 5, 1], [2, 3, 7, 6]  // y-, y+
    ];
    const shades = o.shades || [0.82, 0.82, 0.7, 0.7, 1.0, 0.6];
    faces.forEach((f, fi) => {
      poly(f.map(i => corners[i]), shade(color, shades[fi]), { stroke: o.stroke, strokeWidth: o.strokeWidth || 2.5 });
    });
    if (o.label) label(c, o.label, o.labelOpts);
  }

  function label(p, text, o) {
    o = o || {};
    const q = project(p);
    push(q.depth - (o.lift || 0.5), ctx => {
      haloText(ctx, text, q.x + (o.dx || 0), q.y + (o.dy || 0), o.color || '#1a1a2e', (o.size || 18) * q.s, true, o.weight);
    });
  }

  function haloText(ctx, text, x, y, color, size, halo, weight) {
    ctx.font = (weight || 800) + ' ' + Math.max(size, 9) + 'px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (halo !== false) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = size / 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  /* text painted flat onto a world plane (e.g. a bench or a spectrum strip)
     instead of always facing the camera — o.right / o.up are world-space
     direction vectors spanning the plane (only their direction matters,
     they're renormalized to o.size), so as the camera orbits the text
     skews in perspective like real ink on that surface. */
  function flatLabel(p, text, o) {
    o = o || {};
    const size = o.size || 0.3;
    const rn = v3.mul(v3.norm(o.right || [1, 0, 0]), size);
    const un = v3.mul(v3.norm(o.up || [0, 0, -1]), size);
    const q0 = project(p);
    const q1 = project(v3.add(p, rn));
    const q2 = project(v3.add(p, un));
    push(q0.depth - (o.lift || 0.01), ctx => {
      ctx.save();
      ctx.translate(q0.x, q0.y);
      ctx.transform(q1.x - q0.x, q1.y - q0.y, q2.x - q0.x, q2.y - q0.y, 0, 0);
      ctx.font = (o.weight || 800) + ' 1px system-ui';
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = 'middle';
      if (o.halo !== false) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 0.3;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillStyle = o.color || '#1a1a2e';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  }

  function begin(w, h) { W = w; H = h; buf = []; }

  function flush(ctx) {
    buf.sort((a, b) => b.depth - a.depth);
    buf.forEach(item => item.fn(ctx));
    buf = [];
  }

  /* --- orbit + pan + zoom controls --- */
  // panOnly: when a sim sets this true (eng.panOnly = true), plain drag pans
  // instead of orbiting — shift is no longer needed, and orbit is disabled —
  // for scenes (a flat 2D cell) where there's nothing to orbit around.
  let dragging = false, panning = false, lastX = 0, lastY = 0, pinchDist = 0, panOnly = false;
  const listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function changed() { listeners.forEach(f => f()); }

  /* world-space vectors corresponding to screen right/up at the target's
     depth — used to pan cam.target so the scene tracks the cursor */
  function screenAxes() {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    const sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
    return {
      right: [cy, 0, -sy],
      up: [-sy * sp, cp, -cy * sp]
    };
  }

  canvas.addEventListener('pointerdown', e => {
    dragging = true; panning = panOnly || e.shiftKey; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (panning) {
      const { right, up } = screenAxes();
      const k = cam.dist / (cam.focal * Math.min(W, H));
      cam.target[0] += (-right[0] * dx + up[0] * dy) * k;
      cam.target[1] += (-right[1] * dx + up[1] * dy) * k;
      cam.target[2] += (-right[2] * dx + up[2] * dy) * k;
    } else {
      cam.yaw += dx * 0.008;
      cam.pitch += dy * 0.008;
      cam.pitch = Math.max(-1.45, Math.min(1.45, cam.pitch));
    }
    lastX = e.clientX; lastY = e.clientY;
    changed();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; panning = false; });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    cam.dist *= Math.exp(e.deltaY * 0.0012);
    cam.dist = Math.max(0.5, Math.min(200, cam.dist));
    changed();
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
      if (pinchDist) {
        cam.dist *= pinchDist / d;
        cam.dist = Math.max(0.5, Math.min(200, cam.dist));
        changed();
      }
      pinchDist = d;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { pinchDist = 0; });

  const eng = { cam, project, begin, flush, line, arrow, sphere, poly, box, label, flatLabel, onChange };
  Object.defineProperty(eng, 'panOnly', { get: () => panOnly, set: v => { panOnly = v; } });
  return eng;
}

/* --- small color utils --- */
function _hex(c) {
  const m = c.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
function _rgb(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function lighten(c, t) {
  const [r, g, b] = _hex(c);
  return _rgb(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}
function shade(c, f) {
  const [r, g, b] = _hex(c);
  return f <= 1 ? _rgb(r * f, g * f, b * f) : lighten(c, f - 1);
}
