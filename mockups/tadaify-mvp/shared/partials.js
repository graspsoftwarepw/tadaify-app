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

  /* Expose for tests + dynamic re-render (e.g. tier switcher in demo toolbar) */
  window.TadaifyPartials = {
    renderSidebar: renderSidebar
  };
})();
