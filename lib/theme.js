/* Theme — shared dark/light mode toggle for every sim page + the hub.
   Preference is stored in localStorage (same-origin, so it just carries
   across pages — no query params or cookies needed) and falls back to the
   OS/browser prefers-color-scheme when the user hasn't chosen explicitly.
   Actual dark rendering is one global CSS filter (invert + hue-rotate) in
   sim.css's [data-theme="dark"] rule, so it darkens the chrome AND the 3D
   canvas scenes uniformly without touching any per-sim colors. Runs as the
   very first <script> in <body> (before ui.js) so the attribute is set
   before anything meaningful paints. */
'use strict';
const Theme = (function () {
  const KEY = 'sim-theme'; // 'light' | 'dark' in storage; absent = follow system
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    return localStorage.getItem(KEY) || (mql.matches ? 'dark' : 'light');
  }
  function apply() {
    document.documentElement.setAttribute('data-theme', current());
  }
  function set(mode) {
    localStorage.setItem(KEY, mode);
    apply();
    document.dispatchEvent(new CustomEvent('themechange'));
  }
  function toggle() {
    set(current() === 'dark' ? 'light' : 'dark');
  }
  // Builds a ready-to-insert toggle button; caller places it (panel-head
  // corner, or floating on the hub). opts: { small, floating }
  function mountToggle(opts) {
    opts = opts || {};
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle' + (opts.small ? ' small' : '') + (opts.floating ? ' floating' : '');
    btn.title = 'Toggle dark mode';
    const paint = () => { btn.textContent = current() === 'dark' ? '🌙' : '☀️'; };
    paint();
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); paint(); });
    document.addEventListener('themechange', paint);
    return btn;
  }

  apply();
  mql.addEventListener('change', () => { if (!localStorage.getItem(KEY)) apply(); });
  window.addEventListener('storage', e => { if (e.key === KEY) apply(); });

  return { current, set, toggle, mountToggle };
})();
