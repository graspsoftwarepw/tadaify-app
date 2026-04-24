/* =========================================================================
   tadaify — shared runtime
   - Animated logo (purple orb + warm orb orbit) — v10 FINAL (DEC-029)
   - Auto-injects SVG markup into every <span class="logo-mark" data-logo>
   - Drives warm orb animation across all instances from a single rAF loop
   ========================================================================= */

(function () {
  'use strict';

  /* ---------- 1. SVG template (one shared pair: purple shell + warm orb) ---------- */
  // Each instance gets unique gradient IDs so multiple logos on a page stay
  // visually independent but share the JS-driven (cx, cy) updates.
  function svgTemplate(uid) {
    return (
      '<svg viewBox="0 0 100 100" role="img" aria-label="tadaify logo">' +
        '<defs>' +
          '<linearGradient id="' + uid + '-s" x1="30%" y1="20%" x2="80%" y2="85%">' +
            '<stop offset="0%"  stop-color="#7C78FF"/>' +
            '<stop offset="58%" stop-color="#5B56E8"/>' +
            '<stop offset="100%" stop-color="#4F46E5"/>' +
          '</linearGradient>' +
          '<radialGradient id="' + uid + '-sh" cx="32%" cy="24%" r="30%">' +
            '<stop offset="0%"  stop-color="rgba(255,255,255,0.36)"/>' +
            '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
          '</radialGradient>' +
          '<linearGradient id="' + uid + '-w" x1="20%" y1="15%" x2="80%" y2="88%">' +
            '<stop offset="0%"  stop-color="#FFD36A"/>' +
            '<stop offset="58%" stop-color="#F59E0B"/>' +
            '<stop offset="100%" stop-color="#D97706"/>' +
          '</linearGradient>' +
          '<radialGradient id="' + uid + '-wh" cx="28%" cy="22%" r="38%">' +
            '<stop offset="0%"  stop-color="rgba(255,255,255,0.42)"/>' +
            '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="40" fill="url(#' + uid + '-s)"/>' +
        '<circle cx="50" cy="50" r="40" fill="url(#' + uid + '-sh)"/>' +
        '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="3.5"/>' +
        '<circle class="orb-base" cx="50" cy="50" r="20" fill="url(#' + uid + '-w)"/>' +
        '<circle class="orb-hl"   cx="50" cy="50" r="20" fill="url(#' + uid + '-wh)"/>' +
      '</svg>'
    );
  }

  /* ---------- 2. Inject SVG into every [data-logo] ---------- */
  var orbPairs = [];
  var nextId = 0;
  document.querySelectorAll('[data-logo]').forEach(function (host) {
    var uid = 'tl' + (++nextId);
    host.innerHTML = svgTemplate(uid);
    orbPairs.push([
      host.querySelector('.orb-base'),
      host.querySelector('.orb-hl')
    ]);
  });

  /* ---------- 3. Motion (v10 FINAL, DEC-029) ---------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ORBIT_R   = 18.4;
  var CX        = 50;
  var CY        = 50;
  var GLIDE_IN  = 900;
  var ORBIT_DUR = 5600;
  var GLIDE_OUT = 900;
  var REST      = 800;
  var CYCLE     = GLIDE_IN + ORBIT_DUR + GLIDE_OUT + REST; // 8200ms
  var SWAY_AMP  = 0.55;
  var SWAY_FREQ = 4;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)  { return Math.pow(t, 3); }
  function clamp(t)   { return Math.max(0, Math.min(1, t)); }

  function getPos(t) {
    if (t < GLIDE_IN) {
      var p = easeOut(clamp(t / GLIDE_IN));
      return { x: CX + ORBIT_R * p, y: CY };
    } else if (t < GLIDE_IN + ORBIT_DUR) {
      var frac = (t - GLIDE_IN) / ORBIT_DUR;
      var angle = 2 * Math.PI * frac;
      var r = ORBIT_R + SWAY_AMP * Math.sin(SWAY_FREQ * angle);
      return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
    } else if (t < GLIDE_IN + ORBIT_DUR + GLIDE_OUT) {
      var p2 = easeIn(clamp((t - GLIDE_IN - ORBIT_DUR) / GLIDE_OUT));
      return { x: CX + ORBIT_R * (1 - p2), y: CY };
    }
    return { x: CX, y: CY };
  }

  function setPos(el, x, y) {
    if (!el) return;
    el.setAttribute('cx', x.toFixed(3));
    el.setAttribute('cy', y.toFixed(3));
  }

  var startTime = null;
  function frame(now) {
    if (!startTime) startTime = now;
    var t = (now - startTime) % CYCLE;
    var pos = getPos(t);
    orbPairs.forEach(function (pair) {
      pair.forEach(function (el) { setPos(el, pos.x, pos.y); });
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
