/* =========================================================================
   tadaify — shared partials injector
   Renders nav + footer (marketing pages) and the canonical app sidebar
   (dashboard pages) into pages that declare:
       <div data-partial="nav"></div>
       <div data-partial="footer"></div>
       <div data-partial="app-sidebar" data-active="..." data-tier="..."></div>

   Must run BEFORE tokens.js so logo orbs get registered + animated.
   Wordmark locked per DEC-WORDMARK-01 — no hyphen, ta / da! / ify color split.
   Sidebar canon per CLAUDE.md "Sidebar canonical structure":
     Pages parent (accordion) → Home + disabled Add page (DEC-MULTIPAGE-01)
     Design / Domain / Insights / Shop / Settings / Help & docs
   ========================================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------------- */
  /* 1. Marketing nav + footer (existing — unchanged)                  */
  /* ----------------------------------------------------------------- */
  var NAV = '' +
    '<nav class="nav">' +
      '<div class="container nav-inner">' +
        '<a href="./landing.html" class="nav-brand">' +
          '<span class="logo-mark" data-logo style="width:32px;height:32px"></span>' +
          '<span class="wordmark wordmark-sm">' +
            '<span class="wm-ta">ta</span><span class="wm-da">da!</span><span class="wm-ify">ify</span>' +
          '</span>' +
        '</a>' +
        '<div class="nav-links">' +
          '<a href="./landing.html">Home</a>' +
          '<a href="./pricing.html">Pricing</a>' +
          '<!-- TODO: replace with templates.html / trust.html when those mockups exist -->' +
          '<a href="./index.html">Templates</a>' +
          '<a href="./index.html">Trust</a>' +
          '<a href="./index.html">Hub</a>' +
          '<a href="./try.html" class="btn btn-ghost btn-sm">Try it free</a>' +
          '<a href="./register.html" class="btn btn-primary btn-sm">Claim your handle</a>' +
        '</div>' +
      '</div>' +
    '</nav>';

  var FOOTER = '' +
    '<footer class="site-footer">' +
      '<div class="container site-footer-inner">' +
        '<div class="flex items-center gap-4">' +
          '<span class="logo-mark" data-logo style="width:24px;height:24px"></span>' +
          '<span class="wordmark" style="font-size:18px">' +
            '<span class="wm-ta">ta</span><span class="wm-da">da!</span><span class="wm-ify">ify</span>' +
          '</span>' +
          '<span class="text-subtle text-sm hide-mobile">— Turn your bio link into your best first impression.</span>' +
        '</div>' +
        '<!-- TODO: replace href="#" placeholders with real pages when they exist -->' +
        '<div class="flex items-center flex-wrap gap-2">' +
          '<a href="./index.html">Trust Center</a>' +
          '<a href="./index.html">Privacy</a>' +
          '<a href="./index.html">Terms</a>' +
          '<a href="./index.html">Jobs</a>' +
          '<a href="./index.html">Ask AI about tadaify ↗</a>' +
        '</div>' +
      '</div>' +
    '</footer>';

  /* ----------------------------------------------------------------- */
  /* 2. App sidebar — canonical, used by every authenticated mockup    */
  /*                                                                    */
  /* Hosts read:                                                        */
  /*   data-active="pages|design|domain|insights|shop|settings|help"   */
  /*   data-tier="free|creator|pro|business" (default: pro)            */
  /*   data-handle="alexandra"  (display only)                          */
  /*   data-username="Alexandra Silva"                                  */
  /*                                                                    */
  /* Output emits its OWN <style> tag inline so a single <script> tag  */
  /* on each app page is the only requirement (works over file://).    */
  /* ----------------------------------------------------------------- */

  /* SVG icon library — kept as a map so future additions are trivial. */
  var ICON = {
    pages:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    home:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    plus:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    design:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z"/></svg>',
    domain:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    insights: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-7"/></svg>',
    shop:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    help:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>',
    chevron:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 9 12 5 16 9"/><polyline points="8 15 12 19 16 15"/></svg>',
    caret:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
  };

  var SIDEBAR_CSS = '' +
    '<style data-source="app-sidebar-partial">' +
    'aside.tdf-side {' +
    '  display: none; background: var(--bg-elevated); border-right: 1px solid var(--border);' +
    '  padding: 18px 10px; flex-direction: column; gap: 8px; position: sticky; top: 54px; align-self: start;' +
    '  height: calc(100vh - 54px); overflow-y: auto;' +
    '}' +
    '@media (min-width: 720px) { aside.tdf-side { display: flex; } }' +
    '.tdf-side .side-user { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); }' +
    '.tdf-side .side-user .av { width: 34px; height: 34px; border-radius: 50%; background: var(--hero-gradient); display: flex; align-items: center; justify-content: center; color: #fff; font-family: var(--font-display); font-weight: 600; font-size: 15px; flex-shrink: 0; }' +
    '.tdf-side .side-user .utxt { min-width: 0; flex: 1; }' +
    '.tdf-side .side-user .uname { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '.tdf-side .side-user .uhandle { font-size: 11px; color: var(--fg-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '.tdf-side .side-user .chevron { color: var(--fg-subtle); }' +
    '.tdf-side .nav-group { display: flex; flex-direction: column; gap: 2px; padding-top: 8px; }' +
    '.tdf-side .nav-divider { border-top: 1px solid var(--border); margin: 6px 0; }' +
    '.tdf-side .nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 9px 10px; border-radius: 9px; font-size: 13.5px; font-weight: 500; background: transparent; border: 0; color: var(--fg); text-align: left; transition: background .12s ease, color .12s ease; cursor: pointer; text-decoration: none; }' +
    '.tdf-side .nav-item svg { width: 17px; height: 17px; flex-shrink: 0; color: var(--fg-muted); }' +
    '.tdf-side .nav-item:hover { background: var(--bg-muted); }' +
    '.tdf-side .nav-item.active { background: rgba(99,102,241,0.10); color: var(--brand-primary); }' +
    '.tdf-side .nav-item.active svg { color: var(--brand-primary); }' +
    '.tdf-side .nav-item .nav-count { margin-left: auto; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: var(--bg-muted); color: var(--fg-muted); }' +
    '.tdf-side .nav-pages-parent .nav-caret { margin-left: 6px; flex-shrink: 0; width: 14px; height: 14px; color: var(--fg-subtle); transform: rotate(90deg); }' +
    '.tdf-side .nav-sub-list { display: flex; flex-direction: column; gap: 1px; margin: 2px 0 4px 17px; padding-left: 8px; border-left: 1px solid var(--border); }' +
    '.tdf-side .nav-sub-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 6px 10px; border-radius: 7px; font-size: 12.5px; font-weight: 500; background: transparent; border: 0; color: var(--fg-muted); text-align: left; text-decoration: none; transition: background .12s ease, color .12s ease; cursor: pointer; }' +
    '.tdf-side .nav-sub-item svg { width: 14px; height: 14px; flex-shrink: 0; color: var(--fg-subtle); }' +
    '.tdf-side .nav-sub-item:hover { background: var(--bg-muted); color: var(--fg); }' +
    '.tdf-side .nav-sub-item.is-current { background: rgba(99,102,241,0.10); color: var(--brand-primary); }' +
    '.tdf-side .nav-sub-item.is-current svg { color: var(--brand-primary); }' +
    '.tdf-side .nav-sub-item.is-disabled { cursor: not-allowed; opacity: 0.55; font-style: italic; }' +
    '.tdf-side .nav-sub-item.is-disabled:hover { background: transparent; color: var(--fg-muted); }' +
    '.tdf-side .nav-sub-pill { margin-left: auto; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 99px; background: var(--bg-muted); color: var(--fg-subtle); white-space: nowrap; }' +
    /* Compact rail at 720-1099px (icon-only) */
    '@media (min-width: 720px) and (max-width: 1099px) {' +
    '  aside.tdf-side { padding: 14px 8px; }' +
    '  .tdf-side .side-user .utxt, .tdf-side .side-user .chevron { display: none; }' +
    '  .tdf-side .nav-item { justify-content: center; padding: 10px 6px; }' +
    '  .tdf-side .nav-item > span.label, .tdf-side .nav-item .nav-count { display: none; }' +
    '  .tdf-side .nav-item svg { width: 20px; height: 20px; }' +
    '  .tdf-side .nav-pages-parent .nav-caret { display: none; }' +
    '  .tdf-side .nav-sub-list { display: none; }' +
    '}' +
    /* Dark mode */
    'body.dark-mode .tdf-side { background: #141A2D; border-color: #1F2937; }' +
    'body.dark-mode .tdf-side .side-user { background: #0B0F1E; border-color: #1F2937; }' +
    'body.dark-mode .tdf-side .side-user .uname { color: #F3F4F6; }' +
    'body.dark-mode .tdf-side .nav-item { color: #F3F4F6; }' +
    'body.dark-mode .tdf-side .nav-item:hover { background: #1F2937; }' +
    'body.dark-mode .tdf-side .nav-item.active { background: rgba(99,102,241,0.18); color: #A5B4FC; }' +
    'body.dark-mode .tdf-side .nav-item.active svg { color: #A5B4FC; }' +
    'body.dark-mode .tdf-side .nav-divider { border-top-color: #1F2937; }' +
    'body.dark-mode .tdf-side .nav-sub-list { border-left-color: #1F2937; }' +
    'body.dark-mode .tdf-side .nav-sub-item { color: #9CA3AF; }' +
    'body.dark-mode .tdf-side .nav-sub-item:hover { background: #1F2937; color: #F3F4F6; }' +
    'body.dark-mode .tdf-side .nav-sub-item.is-current { background: rgba(99,102,241,0.18); color: #A5B4FC; }' +
    'body.dark-mode .tdf-side .nav-sub-item.is-current svg { color: #A5B4FC; }' +
    '</style>';

  // CSS injected once
  var cssInjected = false;
  function ensureCss() {
    if (cssInjected) return;
    document.head.insertAdjacentHTML('beforeend', SIDEBAR_CSS);
    cssInjected = true;
  }

  function escapeAttr(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderSidebar(active, tier, handle, username) {
    active = (active || 'pages').toLowerCase();
    tier   = (tier   || 'pro').toLowerCase();
    handle = handle || 'alexandra';
    username = username || 'Alexandra Silva';
    var initial = (username || 'A').charAt(0).toUpperCase();
    var tierLabel = ({ free: 'Free', creator: 'Creator', pro: 'Pro', business: 'Business' })[tier] || 'Pro';

    function cls(name) { return active === name ? ' active' : ''; }
    function aria(name) { return active === name ? ' aria-current="page"' : ''; }

    return '' +
      '<aside class="tdf-side side" aria-label="Primary navigation">' +
        '<div class="side-user">' +
          '<div class="av">' + escapeAttr(initial) + '</div>' +
          '<div class="utxt">' +
            '<div class="uname">' + escapeAttr(username) + '</div>' +
            '<div class="uhandle" id="side-tier">@' + escapeAttr(handle) + ' · ' + tierLabel + '</div>' +
          '</div>' +
          ICON.chevron +
        '</div>' +

        /* GROUP 1 — Pages parent (always visible expanded; no JS toggle in shared partial) */
        '<div class="nav-group">' +
          '<a href="./app-dashboard.html?tab=page" class="nav-item nav-pages-parent' + cls('pages') + '" data-tip="Pages"' + aria('pages') + '>' +
            ICON.pages +
            '<span class="label">Pages</span>' +
            '<span class="nav-count">1</span>' +
            '<span class="nav-caret">' + ICON.caret + '</span>' +
          '</a>' +
          '<div class="nav-sub-list">' +
            '<a href="./app-dashboard.html?tab=page" class="nav-sub-item' + (active === 'pages' ? ' is-current' : '') + '" data-tip="Home">' +
              ICON.home + '<span>Home</span>' +
            '</a>' +
            '<button type="button" class="nav-sub-item is-disabled" aria-disabled="true" title="Multi-page coming Q+1 — DEC-MULTIPAGE-01" onclick="event.preventDefault();event.stopPropagation();">' +
              ICON.plus + '<span>Add page</span>' +
              '<span class="nav-sub-pill">soon</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 2 — Design + Domain */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-dashboard.html?tab=design" class="nav-item' + cls('design') + '" data-tip="Design"' + aria('design') + '>' +
            ICON.design + '<span class="label">Design</span>' +
          '</a>' +
          '<a href="./app-domain.html" class="nav-item' + cls('domain') + '" data-tip="Custom domain"' + aria('domain') + '>' +
            ICON.domain + '<span class="label">Domain</span>' +
          '</a>' +
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 3 — Insights + Shop */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-insights.html" class="nav-item' + cls('insights') + '" data-tip="Insights"' + aria('insights') + '>' +
            ICON.insights + '<span class="label">Insights</span>' +
          '</a>' +
          /* TODO: replace href with ./app-shop.html when that mockup exists */
          '<button type="button" class="nav-item' + cls('shop') + '" data-tip="Shop — coming soon" onclick="alert(\'Mockup — Shop coming Q+1\')">' +
            ICON.shop + '<span class="label">Shop</span>' +
            '<span class="nav-count">0</span>' +
          '</button>' +
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 4 — Settings + Help */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-settings.html" class="nav-item' + cls('settings') + '" data-tip="Settings"' + aria('settings') + '>' +
            ICON.settings + '<span class="label">Settings</span>' +
          '</a>' +
          /* TODO: replace href with ./app-help.html when that mockup exists */
          '<button type="button" class="nav-item' + cls('help') + '" data-tip="Help &amp; docs" onclick="alert(\'Mockup — Help &amp; docs coming Q+1\')">' +
            ICON.help + '<span class="label">Help &amp; docs</span>' +
          '</button>' +
        '</div>' +
      '</aside>';
  }

  /* ----------------------------------------------------------------- */
  /* 3. Inject all partials                                            */
  /* ----------------------------------------------------------------- */
  document.querySelectorAll('[data-partial="nav"]').forEach(function (el) { el.outerHTML = NAV; });
  document.querySelectorAll('[data-partial="footer"]').forEach(function (el) { el.outerHTML = FOOTER; });

  document.querySelectorAll('[data-partial="app-sidebar"]').forEach(function (el) {
    ensureCss();
    var html = renderSidebar(
      el.getAttribute('data-active'),
      el.getAttribute('data-tier'),
      el.getAttribute('data-handle'),
      el.getAttribute('data-username')
    );
    el.outerHTML = html;
  });

  /* ----------------------------------------------------------------- */
  /* 4. Tier badge + tier-gate-modal (no-blur premium UX)              */
  /*                                                                    */
  /* Per feedback_no_blur_premium_features (2026-04-26): premium UI    */
  /* must be FULLY visible and interactive. The badge marks the tier   */
  /* required; gating happens at save/apply time via TierGate.modal.   */
  /* ----------------------------------------------------------------- */
  var TIER_RANK = { free: 0, creator: 1, pro: 2, business: 3 };
  var TIER_LABEL = { free: 'Free', creator: 'Creator', pro: 'Pro', business: 'Business' };

  var TIER_BADGE_CSS = '' +
    '<style data-source="tier-badge-partial">' +
    /* Inline pill rendered next to a section heading */
    '.tdf-tier-badge {' +
    '  display: inline-flex; align-items: center; gap: 4px;' +
    '  padding: 2px 8px; border-radius: 99px;' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '  font-size: 10px; font-weight: 700;' +
    '  text-transform: uppercase; letter-spacing: 0.06em;' +
    '  line-height: 1.3; white-space: nowrap;' +
    '  border: 1px solid transparent;' +
    '  cursor: help;' +
    '  vertical-align: middle;' +
    '}' +
    '.tdf-tier-badge .tb-ico { font-size: 10px; line-height: 1; }' +
    /* Creator — neutral teal accent */
    '.tdf-tier-badge.tier-creator {' +
    '  background: rgba(16,185,129,0.12); color: #047857;' +
    '  border-color: rgba(16,185,129,0.28);' +
    '}' +
    'body.dark-mode .tdf-tier-badge.tier-creator { background: rgba(16,185,129,0.20); color: #6EE7B7; border-color: rgba(16,185,129,0.45); }' +
    /* Pro — brand-primary indigo */
    '.tdf-tier-badge.tier-pro {' +
    '  background: rgba(99,102,241,0.13); color: #4338CA;' +
    '  border-color: rgba(99,102,241,0.30);' +
    '}' +
    'body.dark-mode .tdf-tier-badge.tier-pro { background: rgba(99,102,241,0.22); color: #A5B4FC; border-color: rgba(99,102,241,0.50); }' +
    /* Business — warm amber */
    '.tdf-tier-badge.tier-business {' +
    '  background: rgba(245,158,11,0.14); color: #92400E;' +
    '  border-color: rgba(245,158,11,0.32);' +
    '}' +
    'body.dark-mode .tdf-tier-badge.tier-business { background: rgba(245,158,11,0.22); color: #FCD34D; border-color: rgba(245,158,11,0.55); }' +
    /* Indicator-state: when a badge is rendered for a feature the user already has */
    '.tdf-tier-badge.is-included { opacity: 0.55; }' +
    /* Tier-gate modal */
    '.tdf-gate-backdrop {' +
    '  position: fixed; inset: 0; z-index: 1000;' +
    '  background: rgba(11,15,30,0.55);' +
    '  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);' +
    '  display: none; align-items: center; justify-content: center;' +
    '  padding: 16px; opacity: 0; transition: opacity .14s ease;' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '}' +
    '.tdf-gate-backdrop.is-open { display: flex; opacity: 1; }' +
    '.tdf-gate {' +
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
    '  border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 16px;' +
    '  box-shadow: 0 24px 60px rgba(11,15,30,0.25);' +
    '  width: min(460px, 94vw); max-height: 86vh; overflow-y: auto;' +
    '  transform: translateY(8px) scale(0.985);' +
    '  transition: transform .14s ease;' +
    '}' +
    '.tdf-gate-backdrop.is-open .tdf-gate { transform: translateY(0) scale(1); }' +
    '.tdf-gate-head { padding: 18px 22px 8px; }' +
    '.tdf-gate-eyebrow {' +
    '  display: inline-flex; align-items: center; gap: 6px;' +
    '  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;' +
    '  color: var(--fg-muted, #6B7280);' +
    '}' +
    '.tdf-gate-title {' +
    '  font-family: var(--font-display, "Crimson Pro", serif);' +
    '  font-size: 21px; font-weight: 600; line-height: 1.25;' +
    '  margin: 8px 0 6px; color: var(--fg, #111);' +
    '}' +
    '.tdf-gate-sub { font-size: 13.5px; color: var(--fg-muted, #6B7280); line-height: 1.55; margin: 0; }' +
    '.tdf-gate-body { padding: 6px 22px 8px; }' +
    '.tdf-gate-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 6px; }' +
    '.tdf-gate-list li {' +
    '  display: flex; align-items: flex-start; gap: 10px;' +
    '  padding: 9px 11px; border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 10px; background: var(--bg-muted, #F9FAFB);' +
    '  font-size: 13px; line-height: 1.5;' +
    '}' +
    '.tdf-gate-list li .gl-ico { flex-shrink: 0; font-size: 14px; line-height: 1.3; }' +
    '.tdf-gate-list li .gl-name { font-weight: 600; color: var(--fg, #111); }' +
    '.tdf-gate-list li .gl-meta { color: var(--fg-muted, #6B7280); font-size: 12px; }' +
    '.tdf-gate-actions {' +
    '  display: flex; flex-direction: column; gap: 8px;' +
    '  padding: 14px 22px 20px;' +
    '  border-top: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  margin-top: 10px;' +
    '}' +
    '.tdf-gate-actions button {' +
    '  display: inline-flex; align-items: center; justify-content: center; gap: 8px;' +
    '  width: 100%; padding: 11px 14px;' +
    '  border-radius: 10px; cursor: pointer; font-family: inherit;' +
    '  font-size: 13.5px; font-weight: 600;' +
    '  border: 1px solid transparent;' +
    '  transition: background .12s ease, border-color .12s ease;' +
    '}' +
    '.tdf-gate-actions .gate-primary { background: var(--brand-primary, #6366F1); color: #fff; }' +
    '.tdf-gate-actions .gate-primary:hover { background: var(--brand-primary-hover, #4F46E5); }' +
    '.tdf-gate-actions .gate-secondary { background: var(--bg-elevated, #fff); color: var(--fg, #111); border-color: var(--border-strong, rgba(0,0,0,0.16)); }' +
    '.tdf-gate-actions .gate-secondary:hover { background: var(--bg-muted, #F9FAFB); }' +
    '.tdf-gate-actions .gate-ghost { background: transparent; color: var(--fg-muted, #6B7280); }' +
    '.tdf-gate-actions .gate-ghost:hover { color: var(--fg, #111); }' +
    'body.dark-mode .tdf-gate { background: #141A2D; color: #F3F4F6; border-color: #1F2937; }' +
    'body.dark-mode .tdf-gate-list li { background: #0B0F1E; border-color: #1F2937; }' +
    'body.dark-mode .tdf-gate-list li .gl-name { color: #F3F4F6; }' +
    'body.dark-mode .tdf-gate-actions { border-top-color: #1F2937; }' +
    'body.dark-mode .tdf-gate-actions .gate-secondary { background: #141A2D; color: #F3F4F6; border-color: #1F2937; }' +
    'body.dark-mode .tdf-gate-actions .gate-secondary:hover { background: #1F2937; }' +
    '@media (prefers-reduced-motion: reduce) {' +
    '  .tdf-gate-backdrop, .tdf-gate { transition: none !important; }' +
    '}' +
    '</style>';

  var tierCssInjected = false;
  function ensureTierCss() {
    if (tierCssInjected) return;
    document.head.insertAdjacentHTML('beforeend', TIER_BADGE_CSS);
    tierCssInjected = true;
  }

  /* Render a single tier badge as a string. */
  function renderTierBadge(tier, opts) {
    ensureTierCss();
    tier = (tier || 'pro').toLowerCase();
    opts = opts || {};
    var label = TIER_LABEL[tier] || 'Pro';
    var icon  = tier === 'business' ? '🔒' : (tier === 'pro' ? '✨' : '⭐');
    var title = opts.tooltip || ('Available on ' + label + ' · click to upgrade');
    var included = opts.included ? ' is-included' : '';
    return '<span class="tdf-tier-badge tier-' + tier + included + '"' +
           ' role="note" tabindex="0"' +
           ' aria-label="' + escapeAttr(title) + '"' +
           ' title="' + escapeAttr(title) + '">' +
             '<span class="tb-ico" aria-hidden="true">' + icon + '</span>' +
             '<span class="tb-label">' + escapeAttr(label) + '</span>' +
           '</span>';
  }

  /* ----------------------------------------------------------------- */
  /* TierGate — save-time validation modal                              */
  /*                                                                    */
  /* Usage:                                                             */
  /*   TierGate.checkAndProceed({                                       */
  /*     currentTier: 'free',                                           */
  /*     features: [                                                    */
  /*       { id: 'ab', name: 'A/B testing', requires: 'business',       */
  /*         meta: '50/50 split, auto-pick winner' }                   */
  /*     ],                                                             */
  /*     onProceed:    function () { ... tier OK — save ... },          */
  /*     onSaveWithout: function () { ... save non-premium subset ... },*/
  /*     onUpgrade:    function (highestTier) { ... open Stripe ... }   */
  /*   });                                                              */
  /*                                                                    */
  /* If currentTier already meets every required tier — onProceed runs */
  /* immediately, no modal shown. Otherwise the modal lists the gated  */
  /* features and offers the three branches.                            */
  /* ----------------------------------------------------------------- */
  function highestRequired(features) {
    var highest = 'free';
    features.forEach(function (f) {
      if (TIER_RANK[f.requires] > TIER_RANK[highest]) highest = f.requires;
    });
    return highest;
  }

  function ensureGateDom() {
    if (document.getElementById('tdf-gate-backdrop')) return;
    ensureTierCss();
    var html = '' +
      '<div class="tdf-gate-backdrop" id="tdf-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="tdf-gate-title" hidden>' +
        '<div class="tdf-gate">' +
          '<div class="tdf-gate-head">' +
            '<span class="tdf-gate-eyebrow">🔒 Upgrade required to apply</span>' +
            '<h3 class="tdf-gate-title" id="tdf-gate-title">Some changes need a higher plan</h3>' +
            '<p class="tdf-gate-sub" id="tdf-gate-sub"></p>' +
          '</div>' +
          '<div class="tdf-gate-body">' +
            '<ul class="tdf-gate-list" id="tdf-gate-list"></ul>' +
          '</div>' +
          '<div class="tdf-gate-actions">' +
            '<button type="button" class="gate-primary" id="tdf-gate-upgrade">Upgrade →</button>' +
            '<button type="button" class="gate-secondary" id="tdf-gate-save-without">Save without premium changes</button>' +
            '<button type="button" class="gate-ghost" id="tdf-gate-cancel">Cancel — keep editing</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    var bd = document.getElementById('tdf-gate-backdrop');
    bd.addEventListener('click', function (e) { if (e.target === bd) closeGate(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bd.classList.contains('is-open')) closeGate();
    });
  }

  function closeGate() {
    var bd = document.getElementById('tdf-gate-backdrop');
    if (!bd) return;
    bd.classList.remove('is-open');
    bd.setAttribute('hidden', '');
  }

  function openGate(features, currentTier, hooks) {
    ensureGateDom();
    var bd = document.getElementById('tdf-gate-backdrop');
    var sub = document.getElementById('tdf-gate-sub');
    var list = document.getElementById('tdf-gate-list');
    var btnUp = document.getElementById('tdf-gate-upgrade');
    var btnSv = document.getElementById('tdf-gate-save-without');
    var btnCx = document.getElementById('tdf-gate-cancel');

    var top = highestRequired(features);
    var topLabel = TIER_LABEL[top] || 'Business';
    var multi = features.length > 1;
    sub.textContent = multi
      ? ('You enabled ' + features.length + ' premium feature' + (features.length === 1 ? '' : 's') + '. Apply them by upgrading to ' + topLabel + ', or save the rest without them.')
      : (features[0].name + ' is available on ' + topLabel + '. Upgrade to apply this change, or save without it.');

    list.innerHTML = features.map(function (f) {
      var ico = f.requires === 'business' ? '🔒' : (f.requires === 'pro' ? '✨' : '⭐');
      var meta = f.meta ? '<div class="gl-meta">' + escapeAttr(f.meta) + '</div>' : '';
      return '<li>' +
        '<span class="gl-ico" aria-hidden="true">' + ico + '</span>' +
        '<div>' +
          '<div class="gl-name">' + escapeAttr(f.name) + ' <span class="tdf-tier-badge tier-' + f.requires + '" style="margin-left:4px"><span class="tb-ico">' + ico + '</span><span class="tb-label">' + TIER_LABEL[f.requires] + '</span></span></div>' +
          meta +
        '</div>' +
      '</li>';
    }).join('');

    /* Hide "save without" if there are no non-premium changes to save (caller signals via hooks.allowSaveWithout). */
    btnSv.style.display = (hooks && hooks.onSaveWithout) ? '' : 'none';
    btnUp.textContent = 'Upgrade to ' + topLabel + ' →';

    btnUp.onclick = function () { closeGate(); if (hooks && hooks.onUpgrade) hooks.onUpgrade(top); };
    btnSv.onclick = function () { closeGate(); if (hooks && hooks.onSaveWithout) hooks.onSaveWithout(); };
    btnCx.onclick = function () { closeGate(); if (hooks && hooks.onCancel) hooks.onCancel(); };

    bd.removeAttribute('hidden');
    requestAnimationFrame(function () { bd.classList.add('is-open'); });
    setTimeout(function () { btnUp.focus(); }, 60);
  }

  function checkAndProceed(opts) {
    opts = opts || {};
    var current = (opts.currentTier || 'free').toLowerCase();
    var features = (opts.features || []).filter(function (f) {
      return TIER_RANK[(f.requires || 'free').toLowerCase()] > TIER_RANK[current];
    });
    if (features.length === 0) {
      if (opts.onProceed) opts.onProceed();
      return;
    }
    openGate(features, current, {
      onUpgrade:     opts.onUpgrade,
      onSaveWithout: opts.onSaveWithout,
      onCancel:      opts.onCancel
    });
  }

  /* Expose for tests + dynamic re-render (e.g. tier switcher in demo toolbar) */
  window.TadaifyPartials = {
    renderSidebar: renderSidebar,
    renderTierBadge: renderTierBadge
  };
  window.TierGate = {
    checkAndProceed: checkAndProceed,
    open:  function (features, currentTier, hooks) { openGate(features, currentTier, hooks || {}); },
    close: closeGate,
    TIER_RANK:  TIER_RANK,
    TIER_LABEL: TIER_LABEL
  };
})();
