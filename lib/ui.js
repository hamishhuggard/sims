/* SimUI — shared control-panel + header builder for the classroom sims.
   Usage:
     const ui = SimUI({ title: 'DC Motor', subtitle: 'Year 12 Physics' });
     const g = ui.group('Show / hide');
     ui.toggle(g, 'Field lines', true, v => { ... }, { swatch: '#7c3aed' });

   Equations: wrap in $...$ (inline) or $$...$$ (display) in any string
   passed to header/footer/readout — KaTeX auto-renders it. Loaded here via
   document.write so it's ready before this file's caller runs (same CDN
   pin the viewer app uses); needs internet, same as TikZJax there.
*/
document.write(
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">' +
  '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>' +
  '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>'
);

function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ]
    });
  }
}

function SimUI(opts) {
  opts = opts || {};

  // header (title + back link)
  const header = document.createElement('div');
  header.className = 'sim-header';
  header.innerHTML =
    '<a class="back" href="' + (opts.back || 'index.html') + '">← All sims</a>' +
    '<h1>' + (opts.title || document.title) + '</h1>' +
    (opts.subtitle ? '<div class="subtitle">' + opts.subtitle + '</div>' : '');
  document.body.appendChild(header);
  renderMath(header);

  // control panel
  const panel = document.createElement('div');
  panel.className = 'sim-panel';
  panel.innerHTML =
    '<div class="panel-head"><span>Controls</span><span class="chev">▾</span></div>' +
    '<div class="panel-body"></div>';
  document.body.appendChild(panel);
  const body = panel.querySelector('.panel-body');
  panel.querySelector('.panel-head').addEventListener('click', () => {
    panel.classList.toggle('collapsed');
    panel.querySelector('.chev').textContent = panel.classList.contains('collapsed') ? '◂' : '▾';
  });
  if (typeof Theme !== 'undefined') {
    const chev = panel.querySelector('.chev');
    chev.parentNode.insertBefore(Theme.mountToggle({ small: true }), chev);
  }

  function group(title) {
    const g = document.createElement('div');
    g.className = 'ctl-group';
    if (title) {
      const t = document.createElement('div');
      t.className = 'group-title';
      t.textContent = title;
      g.appendChild(t);
    }
    body.appendChild(g);
    return g;
  }

  function toggle(parent, label, checked, onChange, o) {
    o = o || {};
    const el = document.createElement('label');
    el.className = 'ctl-toggle';
    el.innerHTML = '<input type="checkbox"><span class="box"></span>' +
      (o.swatch ? '<span class="swatch" style="background:' + o.swatch + '"></span>' : '') +
      '<span>' + label + '</span>';
    const input = el.querySelector('input');
    input.checked = !!checked;
    input.addEventListener('change', () => onChange(input.checked));
    (parent || body).appendChild(el);
    return { get: () => input.checked, set: v => { input.checked = v; onChange(v); } };
  }

  function slider(parent, label, cfg, onChange) {
    const el = document.createElement('div');
    el.className = 'ctl-slider';
    el.innerHTML = '<div class="row"><span>' + label + '</span><span class="val"></span></div>' +
      '<input type="range">';
    const input = el.querySelector('input');
    const valEl = el.querySelector('.val');
    input.min = cfg.min; input.max = cfg.max; input.step = cfg.step || 1;
    input.value = cfg.value;
    const fmt = cfg.fmt || (v => v);
    const update = fire => {
      const v = parseFloat(input.value);
      valEl.textContent = fmt(v);
      if (fire) onChange(v);
    };
    input.addEventListener('input', () => update(true));
    update(false);
    (parent || body).appendChild(el);
    return {
      get: () => parseFloat(input.value),
      set: v => { input.value = v; update(true); }
    };
  }

  function select(parent, label, options, value, onChange) {
    const el = document.createElement('div');
    el.className = 'ctl-select';
    el.innerHTML = (label ? '<div class="lbl">' + label + '</div>' : '') + '<select></select>';
    const sel = el.querySelector('select');
    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = (o.value !== undefined) ? o.value : o;
      opt.textContent = o.label || o;
      sel.appendChild(opt);
    });
    sel.value = value;
    sel.addEventListener('change', () => onChange(sel.value));
    (parent || body).appendChild(el);
    return { get: () => sel.value, set: v => { sel.value = v; onChange(v); } };
  }

  // segmented control — exactly one option active
  function segment(parent, label, options, value, onChange) {
    const el = document.createElement('div');
    el.className = 'ctl-seg';
    if (label) {
      const l = document.createElement('span');
      l.className = 'lbl';
      l.textContent = label;
      el.appendChild(l);
    }
    const btns = {};
    let cur = value;
    options.forEach(o => {
      const v = (o.value !== undefined) ? o.value : o;
      const b = document.createElement('button');
      b.textContent = o.label || o;
      if (v === value) b.classList.add('on');
      b.addEventListener('click', () => {
        if (cur === v) return;
        btns[cur].classList.remove('on');
        cur = v;
        b.classList.add('on');
        onChange(v);
      });
      btns[v] = b;
      el.appendChild(b);
    });
    (parent || body).appendChild(el);
    return {
      get: () => cur,
      set: v => { btns[cur].classList.remove('on'); cur = v; btns[v].classList.add('on'); onChange(v); }
    };
  }

  function buttons(parent, defs) {
    const el = document.createElement('div');
    el.className = 'ctl-buttons';
    defs.forEach(d => {
      const b = document.createElement('button');
      b.textContent = d.label;
      if (d.primary) b.classList.add('primary');
      b.addEventListener('click', d.onClick);
      el.appendChild(b);
    });
    (parent || body).appendChild(el);
    return el;
  }

  function readout(parent, label, initial) {
    const el = document.createElement('div');
    el.className = 'ctl-readout';
    el.innerHTML = '<span>' + label + '</span><span class="val"></span>';
    const valEl = el.querySelector('.val');
    valEl.innerHTML = initial !== undefined ? initial : '';
    (parent || body).appendChild(el);
    renderMath(el);
    return { set: v => { valEl.innerHTML = v; renderMath(valEl); } };
  }

  // "Key idea" panel — collapsible box on the left, same visual language as
  // the controls panel on the right. Anchored below the header (whose height
  // varies with title/subtitle length), recomputed on resize.
  // ?keyIdeas=0 in the URL suppresses it entirely (for embedding a sim
  // somewhere the surrounding page already states the key idea) — default is
  // shown, same as every sim's current behaviour.
  const showKeyIdeas = new URLSearchParams(location.search).get('keyIdeas') !== '0';
  function footer(html) {
    if (!showKeyIdeas) return { set: () => {} };
    let f = document.querySelector('.sim-footer');
    if (!f) {
      f = document.createElement('div');
      f.className = 'sim-footer';
      f.innerHTML =
        '<div class="panel-head"><span>Key idea</span><span class="chev">▾</span></div>' +
        '<div class="panel-body"></div>';
      document.body.appendChild(f);
      f.querySelector('.panel-head').addEventListener('click', () => {
        f.classList.toggle('collapsed');
        f.querySelector('.chev').textContent = f.classList.contains('collapsed') ? '▸' : '▾';
      });
      const position = () => {
        const top = header.getBoundingClientRect().bottom + 16;
        f.style.top = top + 'px';
        f.style.maxHeight = 'calc(100vh - ' + (top + 16) + 'px)';
      };
      position();
      window.addEventListener('resize', position);
    }
    const fbody = f.querySelector('.panel-body');
    fbody.innerHTML = html;
    renderMath(fbody);
    return { set: h => { fbody.innerHTML = h; renderMath(fbody); }, el: f };
  }

  function hint(text) {
    const h = document.createElement('div');
    h.className = 'hint';
    h.textContent = text;
    document.body.appendChild(h);
  }

  return { group, toggle, slider, select, segment, buttons, readout, footer, hint, panel };
}

/* Full-viewport canvas with devicePixelRatio handling.
   Returns { canvas, ctx, W(), H() } where W/H are CSS-pixel sizes.
   onResize (optional) is called after each resize. */
function SimCanvas(onResize) {
  const canvas = document.getElementById('sim') || (() => {
    const c = document.createElement('canvas');
    c.id = 'sim';
    document.body.insertBefore(c, document.body.firstChild);
    return c;
  })();
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (onResize) onResize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();
  return { canvas, ctx, W: () => w, H: () => h };
}

/* Small canvas drawing helpers shared by the 2D sims */
const Draw = {
  arrow(ctx, x1, y1, x2, y2, color, width, headScale) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const head = Math.max(10, (width || 4) * 3) * (headScale || 1);
    const ux = dx / len, uy = dy / len;
    const bx = x2 - ux * head, by = y2 - uy * head;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width || 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(bx - uy * head * 0.5, by + ux * head * 0.5);
    ctx.lineTo(bx + uy * head * 0.5, by - ux * head * 0.5);
    ctx.closePath();
    ctx.fill();
  },
  label(ctx, text, x, y, o) {
    o = o || {};
    ctx.font = (o.weight || 800) + ' ' + (o.size || 18) + 'px system-ui';
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.halo !== false) {
      ctx.lineWidth = o.haloWidth || 5;
      ctx.strokeStyle = o.halo || '#ffffff';
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = o.color || '#1a1a2e';
    ctx.fillText(text, x, y);
  },
  // × or • symbol grid for B into/out of page
  fieldSymbols(ctx, x0, y0, x1, y1, spacing, into, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let x = x0 + spacing / 2; x < x1; x += spacing) {
      for (let y = y0 + spacing / 2; y < y1; y += spacing) {
        if (into) {
          const s = 6;
          ctx.beginPath();
          ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
          ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
          ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }
  }
};
