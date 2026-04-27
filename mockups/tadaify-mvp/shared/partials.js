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
    caret:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    /* Administration section icons (added Fix #5 — Pages vs Administration separation) */
    admin:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    blogAdm:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
    storeAdm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    schedAdm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    portAdm:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/></svg>',
    paidAdm:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  };

  var SIDEBAR_CSS = '' +
    '<style data-source="app-sidebar-partial">' +
    /* Mobile (<720px): sidebar hidden by default, shown as full-screen centered overlay
       when .is-open class is added by the hamburger toggle (no right-side drawer per
       feedback_no_right_side_drawers — full-screen modal pattern). */
    'aside.tdf-side {' +
    '  display: none; background: var(--bg-elevated); border-right: 1px solid var(--border);' +
    '  padding: 18px 10px; flex-direction: column; gap: 8px; position: sticky; top: 54px; align-self: start;' +
    '  height: calc(100vh - 54px); overflow-y: auto;' +
    '}' +
    /* Tablet+ (>=720px): sticky sidebar visible */
    '@media (min-width: 720px) { aside.tdf-side { display: flex; } }' +
    /* Mobile drawer: centered full-screen modal sheet when toggled open */
    '@media (max-width: 719px) {' +
    '  aside.tdf-side.is-open {' +
    '    display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0;' +
    '    width: 100vw; height: 100vh; max-height: 100vh; z-index: 1100;' +
    '    padding: 60px 20px 24px; gap: 10px; overflow-y: auto;' +
    '    background: var(--bg-elevated); border-right: 0;' +
    '    animation: tdfSideIn .18s ease-out;' +
    '  }' +
    '  aside.tdf-side.is-open .nav-item { padding: 12px 14px; font-size: 15px; min-height: 44px; }' +
    '  aside.tdf-side.is-open .nav-sub-item { padding: 10px 12px; font-size: 14px; min-height: 40px; }' +
    '}' +
    '@keyframes tdfSideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
    /* Mobile topbar with hamburger (auto-injected on pages that have the sidebar partial) */
    '.tdf-mobile-topbar {' +
    '  display: none; position: sticky; top: 0; z-index: 1050;' +
    '  background: var(--bg-elevated); border-bottom: 1px solid var(--border);' +
    '  padding: 10px 14px; align-items: center; gap: 12px;' +
    '}' +
    '@media (max-width: 719px) {' +
    '  .tdf-mobile-topbar { display: flex; }' +
    '}' +
    '.tdf-mobile-topbar .tdf-hamburger {' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border);' +
    '  background: var(--bg); color: var(--fg); cursor: pointer;' +
    '}' +
    '.tdf-mobile-topbar .tdf-hamburger svg { width: 20px; height: 20px; }' +
    '.tdf-mobile-topbar .tdf-mobile-brand {' +
    '  font-family: var(--font-display, inherit); font-weight: 600; font-size: 15px;' +
    '  color: var(--fg); display: inline-flex; align-items: center; gap: 8px;' +
    '}' +
    '.tdf-mobile-topbar .tdf-mobile-close {' +
    '  display: none; margin-left: auto; width: 44px; height: 44px; border-radius: 10px;' +
    '  border: 1px solid var(--border); background: var(--bg); color: var(--fg); cursor: pointer;' +
    '  align-items: center; justify-content: center;' +
    '}' +
    /* When the sidebar is open on mobile, swap hamburger for close (X) inside the topbar */
    'body.tdf-side-open .tdf-mobile-topbar .tdf-hamburger { display: none; }' +
    'body.tdf-side-open .tdf-mobile-topbar .tdf-mobile-close { display: inline-flex; }' +
    'body.tdf-side-open { overflow: hidden; }' +
    /* Backdrop behind drawer */
    '.tdf-side-backdrop {' +
    '  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45);' +
    '  z-index: 1080; backdrop-filter: blur(2px);' +
    '}' +
    'body.tdf-side-open .tdf-side-backdrop { display: block; }' +
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

  function renderSidebar(active, tier, handle, username, adminActive) {
    active = (active || 'pages').toLowerCase();
    tier   = (tier   || 'pro').toLowerCase();
    handle = handle || 'alexandra';
    username = username || 'Alexandra Silva';
    /* adminActive: which Administration sub-item is current (when active==='admin').
       Values: 'blog' | 'store' | 'schedule' | 'portfolio' | 'paid-articles'.
       If absent and active==='admin', no sub-item is highlighted. */
    adminActive = (adminActive || '').toLowerCase();
    var initial = (username || 'A').charAt(0).toUpperCase();
    var tierLabel = ({ free: 'Free', creator: 'Creator', pro: 'Pro', business: 'Business' })[tier] || 'Pro';

    function cls(name) { return active === name ? ' active' : ''; }
    function aria(name) { return active === name ? ' aria-current="page"' : ''; }
    function adminCls(name) { return (active === 'admin' && adminActive === name) ? ' is-current' : ''; }

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

        /* GROUP 3 — Insights only.
           FIX-SHOP-001: native Shop is deferred to v2 per
           feedback_tadaify_no_shop_in_mvp. Sidebar Shop entry hidden in
           MVP — restore the commented block once the v2 native-shop
           epic ships. The Product *block* (in app-block-editor) is
           still available; it just links to the creator's external
           store (Shopify / Stripe / Etsy / Gumroad / etc.). */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-insights.html" class="nav-item' + cls('insights') + '" data-tip="Insights"' + aria('insights') + '>' +
            ICON.insights + '<span class="label">Insights</span>' +
          '</a>' +
          /* MVP-hidden — v2 native shop:
          '<button type="button" class="nav-item' + cls('shop') + '" data-tip="Shop — coming soon" onclick="alert(\'Mockup — Shop coming Q+1\')">' +
            ICON.shop + '<span class="label">Shop</span>' +
            '<span class="nav-count">0</span>' +
          '</button>' +
          */
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 3b — Administration (NEW — Fix #5)
           Day-to-day content management surfaces for manageable page types.
           Accordion always expanded; sub-items always visible. Highlighted
           sub-item is selected via data-admin-active attribute. Store entry
           shows a "v2" pill per feedback_tadaify_no_shop_in_mvp. */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-admin-blog.html" class="nav-item nav-pages-parent' + cls('admin') + '" data-tip="Administration"' + aria('admin') + '>' +
            ICON.admin +
            '<span class="label">Administration</span>' +
            '<span class="nav-caret">' + ICON.caret + '</span>' +
          '</a>' +
          '<div class="nav-sub-list">' +
            '<a href="./app-admin-blog.html" class="nav-sub-item' + adminCls('blog') + '" data-tip="Blog publishing">' +
              ICON.blogAdm + '<span>Blog</span>' +
            '</a>' +
            '<a href="./app-admin-store.html" class="nav-sub-item' + adminCls('store') + '" data-tip="Store — coming v2">' +
              ICON.storeAdm + '<span>Store</span>' +
              '<span class="nav-sub-pill">v2</span>' +
            '</a>' +
            '<a href="./app-admin-schedule.html" class="nav-sub-item' + adminCls('schedule') + '" data-tip="Bookings">' +
              ICON.schedAdm + '<span>Schedule</span>' +
            '</a>' +
            '<a href="./app-admin-portfolio.html" class="nav-sub-item' + adminCls('portfolio') + '" data-tip="Projects">' +
              ICON.portAdm + '<span>Portfolio</span>' +
            '</a>' +
            '<a href="./app-admin-paid-articles.html" class="nav-sub-item' + adminCls('paid-articles') + '" data-tip="Paid articles">' +
              ICON.paidAdm + '<span>Paid articles</span>' +
            '</a>' +
          '</div>' +
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
      el.getAttribute('data-username'),
      el.getAttribute('data-admin-active')
    );
    el.outerHTML = html;
  });

  /* ----------------------------------------------------------------- */
  /* 3b. Mobile topbar + sidebar drawer wiring                          */
  /*                                                                    */
  /* On viewports <720px the canonical sidebar is hidden. Inject a      */
  /* sticky topbar with a hamburger button that opens the sidebar as a  */
  /* full-screen centered modal sheet (per feedback_no_right_side_      */
  /* drawers — modal pattern, not slide-in panel).                      */
  /* ----------------------------------------------------------------- */
  (function setupMobileSidebarDrawer() {
    var sidebar = document.querySelector('aside.tdf-side');
    if (!sidebar) return;

    var HAMBURGER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    var CLOSE_SVG     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var topbar = document.createElement('div');
    topbar.className = 'tdf-mobile-topbar';
    topbar.setAttribute('role', 'banner');
    topbar.innerHTML =
      '<button type="button" class="tdf-hamburger" aria-label="Open navigation" aria-controls="tdf-sidebar-drawer" aria-expanded="false">' + HAMBURGER_SVG + '</button>' +
      '<button type="button" class="tdf-mobile-close" aria-label="Close navigation">' + CLOSE_SVG + '</button>' +
      '<span class="tdf-mobile-brand">' +
        '<span class="logo-mark" data-logo style="width:22px;height:22px"></span>' +
        '<span class="wordmark" style="font-size:15px"><span class="wm-ta">ta</span><span class="wm-da">da!</span><span class="wm-ify">ify</span></span>' +
      '</span>';

    var backdrop = document.createElement('div');
    backdrop.className = 'tdf-side-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    /* Insert topbar at the very top of <body> so it stays sticky above content. */
    document.body.insertBefore(topbar, document.body.firstChild);
    document.body.appendChild(backdrop);
    sidebar.id = sidebar.id || 'tdf-sidebar-drawer';

    function openSidebar() {
      sidebar.classList.add('is-open');
      document.body.classList.add('tdf-side-open');
      var btn = topbar.querySelector('.tdf-hamburger');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
    function closeSidebar() {
      sidebar.classList.remove('is-open');
      document.body.classList.remove('tdf-side-open');
      var btn = topbar.querySelector('.tdf-hamburger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    topbar.querySelector('.tdf-hamburger').addEventListener('click', openSidebar);
    topbar.querySelector('.tdf-mobile-close').addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('tdf-side-open')) closeSidebar();
    });
    /* Close drawer when user navigates within it (link clicks). */
    sidebar.addEventListener('click', function (e) {
      var t = e.target.closest('a, button.nav-item, button.nav-sub-item');
      if (t && document.body.classList.contains('tdf-side-open')) closeSidebar();
    });

    /* Re-register logo orb in the just-injected mobile brand */
    if (window.tadaifyTokens && typeof window.tadaifyTokens.renderLogo === 'function') {
      try { window.tadaifyTokens.renderLogo(); } catch (e) {}
    }
  })();

  /* ----------------------------------------------------------------- */
  /* 4. Tier badge + tier-gate-modal (no-blur premium UX)              */
  /*                                                                    */
  /* Per feedback_no_blur_premium_features (2026-04-26): premium UI    */
  /* must be FULLY visible and interactive. The badge marks the tier   */
  /* required; gating happens at save/apply time via TierGate.modal.   */
  /* ----------------------------------------------------------------- */
  var TIER_RANK = { free: 0, creator: 1, pro: 2, business: 3 };
  var TIER_LABEL = { free: 'Free', creator: 'Creator', pro: 'Pro', business: 'Business' };

  /* Tier pricing — single source of truth, mirrors pricing.html.
     Yearly = 10/12 of monthly (canonical "Save 2 months" rule). */
  var TIER_PRICING = {
    free:     { monthly: 0,  yearly: 0   },
    creator:  { monthly: 8,  yearly: 80  },  // ~$6.67/mo billed yearly
    pro:      { monthly: 19, yearly: 190 },  // ~$15.83/mo billed yearly
    business: { monthly: 49, yearly: 490 }   // ~$40.83/mo billed yearly
  };
  function priceFor(tier, cycle) {
    var t = TIER_PRICING[tier] || TIER_PRICING.business;
    if (cycle === 'yearly') return Math.round((t.yearly / 12) * 100) / 100;
    return t.monthly;
  }

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
    /* Monthly / yearly billing toggle inside the gate footer */
    '.tdf-gate-cycle {' +
    '  display: inline-flex; align-items: center; gap: 4px;' +
    '  padding: 3px; border-radius: 99px;' +
    '  background: var(--bg-muted, #F3F4F6);' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '  font-size: 11.5px; font-weight: 600;' +
    '  margin: 0 auto 8px;' +
    '}' +
    '.tdf-gate-cycle button {' +
    '  border: 0; background: transparent; cursor: pointer;' +
    '  padding: 5px 12px; border-radius: 99px;' +
    '  color: var(--fg-muted, #6B7280);' +
    '  font: inherit;' +
    '  transition: background .12s ease, color .12s ease;' +
    '}' +
    '.tdf-gate-cycle button.is-active {' +
    '  background: var(--bg-elevated, #fff);' +
    '  color: var(--fg, #111);' +
    '  box-shadow: 0 1px 3px rgba(11,15,30,0.12);' +
    '}' +
    '.tdf-gate-cycle .save-badge {' +
    '  font-size: 9.5px; font-weight: 700;' +
    '  margin-left: 4px;' +
    '  color: #047857; letter-spacing: 0.04em;' +
    '}' +
    'body.dark-mode .tdf-gate-cycle { background: #1F2937; }' +
    'body.dark-mode .tdf-gate-cycle button { color: #9CA3AF; }' +
    'body.dark-mode .tdf-gate-cycle button.is-active { background: #0B0F1E; color: #F3F4F6; }' +
    'body.dark-mode .tdf-gate-cycle .save-badge { color: #6EE7B7; }' +
    '.tdf-gate-actions .gate-primary .price-sub {' +
    '  display: block;' +
    '  font-size: 10.5px; font-weight: 500; opacity: 0.85;' +
    '  margin-top: 2px;' +
    '}' +
    /* "All set" silent-success toast — bottom-right */
    '.tdf-toast {' +
    '  position: fixed; right: 20px; bottom: 20px; z-index: 1100;' +
    '  display: inline-flex; align-items: center; gap: 8px;' +
    '  padding: 10px 14px; border-radius: 10px;' +
    '  background: #047857; color: #fff;' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '  font-size: 13px; font-weight: 600;' +
    '  box-shadow: 0 12px 32px rgba(11,15,30,0.20);' +
    '  opacity: 0; transform: translateY(8px);' +
    '  transition: opacity .16s ease, transform .16s ease;' +
    '  pointer-events: none;' +
    '}' +
    '.tdf-toast.is-visible { opacity: 1; transform: translateY(0); }' +
    '.tdf-toast .toast-check {' +
    '  width: 18px; height: 18px; border-radius: 50%;' +
    '  background: rgba(255,255,255,0.20);' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  font-size: 11px;' +
    '}' +
    '@media (prefers-reduced-motion: reduce) {' +
    '  .tdf-gate-backdrop, .tdf-gate, .tdf-toast { transition: none !important; }' +
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

  /* Per-modal billing cycle (default monthly; persisted across re-opens). */
  var gateCycle = 'monthly';

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
            '<div class="tdf-gate-cycle" role="group" aria-label="Billing cycle">' +
              '<button type="button" id="tdf-gate-monthly" class="is-active" data-cycle="monthly">Monthly</button>' +
              '<button type="button" id="tdf-gate-yearly" data-cycle="yearly">Yearly<span class="save-badge">−2 mo</span></button>' +
            '</div>' +
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

  /* Update the upgrade button label to reflect current cycle + tier. */
  function paintUpgradeButton(top) {
    var btn = document.getElementById('tdf-gate-upgrade');
    if (!btn) return;
    var topLabel = TIER_LABEL[top] || 'Business';
    var price = priceFor(top, gateCycle);
    var cadence = gateCycle === 'yearly' ? '/mo billed yearly' : '/mo';
    btn.innerHTML = 'Upgrade to ' + topLabel +
      ' — $' + price + '<span class="price-sub">' + cadence + '</span>';
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
    paintUpgradeButton(top);

    /* Wire monthly/yearly toggle (re-paints upgrade label live). */
    var btnMonthly = document.getElementById('tdf-gate-monthly');
    var btnYearly  = document.getElementById('tdf-gate-yearly');
    function setCycle(c) {
      gateCycle = c;
      btnMonthly.classList.toggle('is-active', c === 'monthly');
      btnYearly.classList.toggle('is-active',  c === 'yearly');
      paintUpgradeButton(top);
    }
    btnMonthly.onclick = function () { setCycle('monthly'); };
    btnYearly.onclick  = function () { setCycle('yearly');  };
    setCycle(gateCycle);

    btnUp.onclick = function () { closeGate(); if (hooks && hooks.onUpgrade) hooks.onUpgrade(top, gateCycle); };
    btnSv.onclick = function () { closeGate(); if (hooks && hooks.onSaveWithout) hooks.onSaveWithout(); };
    btnCx.onclick = function () { closeGate(); if (hooks && hooks.onCancel) hooks.onCancel(); };

    bd.removeAttribute('hidden');
    requestAnimationFrame(function () { bd.classList.add('is-open'); });
    setTimeout(function () { btnUp.focus(); }, 60);
  }

  /* ---- "All set ✓" silent-success toast (used when current tier already
         covers every requested feature — no modal, just confirmation). */
  var toastTimer = null;
  function showToast(msg) {
    ensureTierCss();
    var t = document.getElementById('tdf-toast');
    if (!t) {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="tdf-toast" id="tdf-toast" role="status" aria-live="polite">' +
          '<span class="toast-check" aria-hidden="true">✓</span>' +
          '<span class="toast-msg"></span>' +
        '</div>');
      t = document.getElementById('tdf-toast');
    }
    t.querySelector('.toast-msg').textContent = msg;
    t.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2200);
  }

  function checkAndProceed(opts) {
    opts = opts || {};
    var current = (opts.currentTier || 'free').toLowerCase();
    var features = (opts.features || []).filter(function (f) {
      return TIER_RANK[(f.requires || 'free').toLowerCase()] > TIER_RANK[current];
    });
    if (features.length === 0) {
      if (opts.onProceed) opts.onProceed();
      /* Silent success path: tiny "All set ✓" confirmation per
         feedback_no_blur_premium_features (no modal when nothing is gated). */
      if (opts.toast !== false) {
        showToast(opts.toastMsg || 'All set ✓');
      }
      return;
    }
    openGate(features, current, {
      onUpgrade:     opts.onUpgrade,
      onSaveWithout: opts.onSaveWithout,
      onCancel:      opts.onCancel
    });
  }

  /* ----------------------------------------------------------------- */
  /* AI Suggest — global sub-modal for ✨ Suggest buttons              */
  /*                                                                    */
  /* Usage:                                                             */
  /*   AISuggest.open({                                                 */
  /*     fieldName: 'Block title',                                       */
  /*     contextSummary: 'Link button → open.spotify.com/album/...',    */
  /*     onApply: function (text) { input.value = text; }               */
  /*   });                                                              */
  /*                                                                    */
  /* States: loaded (5 cards, default) / loading (skeletons) / error /  */
  /* empty / rate / selected. The default open() flow shows Loading for */
  /* 800ms then Loaded with 5 mocked suggestions matched to fieldName. */
  /*                                                                    */
  /* Cost transparency (DEC-174..179, 2026-04-27 cascade):              */
  /*   - Free 5/day, Creator 50/day, Pro/Business unlimited (~500-2000) */
  /*   - Cost strip shows current quota + countdown to midnight UTC     */
  /*   - Refresh button explicitly costs 1 from daily limit             */
  /*   - Out-of-quota = hard block + countdown + Upgrade CTA            */
  /*   - Pro+ tiers: cost strip hidden (no clutter for unlimited)       */
  /* ----------------------------------------------------------------- */

  /* Per-tier daily quota contract (locked 2026-04-27 via DEC-176).
     Pro and Business are technically unlimited at the UI layer; the
     "fair-use" ceiling exists only as abuse protection on the Worker. */
  var AI_QUOTA = {
    free:     { limit: 5,    label: '5/day',          unlimited: false },
    creator:  { limit: 50,   label: '50/day',         unlimited: false },
    pro:      { limit: 500,  label: 'Unlimited',      unlimited: true  },
    business: { limit: 2000, label: 'Unlimited',      unlimited: true  }
  };

  /* Demo-only mocked "used today" counter per tier. In production this
     comes from the Worker response. Values are intentionally above 0
     so the cost strip always has something visible to show. */
  var AI_USED_DEMO = { free: 2, creator: 12, pro: 47, business: 132 };

  /* getCurrentTier — single source of truth for the current creator's
     tier in mockup land. Resolution order:
       1. window.__tadaifyDemoTier (set by demo toolbar / tier switcher)
       2. localStorage 'tadaify_demo_tier'
       3. 'free' default
     Real app reads from creator.tier on the JWT payload. */
  function getCurrentTier() {
    try {
      if (window.__tadaifyDemoTier && AI_QUOTA[window.__tadaifyDemoTier]) {
        return window.__tadaifyDemoTier;
      }
      var saved = localStorage.getItem('tadaify_demo_tier');
      if (saved && AI_QUOTA[saved]) return saved;
    } catch (e) { /* localStorage blocked, fine */ }
    return 'free';
  }

  /* getQuotaState — returns the per-tier quota snapshot the UI needs
     to render the cost strip + decide hard-block. resetMs counts down
     to next midnight UTC; pure function of Date.now(). */
  function getQuotaState(tier) {
    var t = tier || getCurrentTier();
    var spec = AI_QUOTA[t] || AI_QUOTA.free;
    var used = (typeof AI_USED_DEMO[t] === 'number') ? AI_USED_DEMO[t] : 0;
    var now = new Date();
    var midnightUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    );
    return {
      tier:      t,
      used:      used,
      limit:     spec.limit,
      label:     spec.label,
      unlimited: spec.unlimited,
      remaining: Math.max(0, spec.limit - used),
      resetMs:   midnightUtc - now.getTime()
    };
  }

  /* formatCountdown — turn an ms duration into "8h 23m" / "47m" /
     "12s" depending on magnitude. Used by cost strip + out-of-quota. */
  function formatCountdown(ms) {
    if (ms <= 0) return '0s';
    var totalSec = Math.floor(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm';
    return s + 's';
  }

  /* nextTierUp — for upsell CTAs. Free → Creator → Pro → (Pro top). */
  function nextTierUp(tier) {
    if (tier === 'free') return 'creator';
    if (tier === 'creator') return 'pro';
    return 'pro'; // Pro / Business already unlimited
  }

  /* enhanceButtonLabel — called for every ✨ Suggest entry point. Adds
     a hover tooltip describing the per-tier cost, plus an inline badge
     when the creator is near their daily limit (last 2 calls). Pro+
     tiers stay clean — just the bare "✨ Suggest". */
  function enhanceButtonLabel(button) {
    if (!button || button.__tdfAiEnhanced) return;
    button.__tdfAiEnhanced = true;
    var q = getQuotaState();
    if (q.unlimited) {
      button.title = 'AI suggestion · unlimited on ' + TIER_LABEL[q.tier];
      return;
    }
    button.title = 'AI suggestion · uses 1 from your daily ' + q.limit +
      ' (you have ' + q.remaining + ' left)';
    if (q.remaining === 0) {
      button.classList.add('tdf-ai-btn-out');
      button.setAttribute('data-quota-badge', '0/' + q.limit + ' today');
      return;
    }
    if (q.remaining <= 2) {
      button.classList.add('tdf-ai-btn-low');
      button.setAttribute('data-quota-badge', q.remaining + ' of ' + q.limit + ' left');
    }
  }
  /* Re-enhance every wired ✨ Suggest button on the page. Called when
     the demo toolbar swaps tier so badges re-render. */
  function refreshAllButtonLabels() {
    var btns = document.querySelectorAll(
      '[onclick*="window.AISuggest.fromButton"], [onclick*="AISuggest.fromButton"]'
    );
    Array.prototype.forEach.call(btns, function (b) {
      b.__tdfAiEnhanced = false;
      b.removeAttribute('data-quota-badge');
      b.classList.remove('tdf-ai-btn-low', 'tdf-ai-btn-out');
      enhanceButtonLabel(b);
    });
  }

  var AI_SUGGEST_CSS = '' +
    '<style data-source="ai-suggest-partial">' +
    '.tdf-ai-backdrop {' +
    '  position: fixed; inset: 0; z-index: 1050;' +
    '  background: rgba(11,15,30,0.55);' +
    '  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);' +
    '  display: none; align-items: center; justify-content: center;' +
    '  padding: 16px; opacity: 0; transition: opacity .16s ease;' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '}' +
    '.tdf-ai-backdrop.is-open { display: flex; opacity: 1; }' +
    '.tdf-ai {' +
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
    '  border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 16px; box-shadow: 0 24px 60px rgba(11,15,30,0.25);' +
    '  width: min(540px, 96vw); max-height: 88vh;' +
    '  display: flex; flex-direction: column; overflow: hidden;' +
    '  transform: translateY(8px) scale(0.985);' +
    '  transition: transform .16s ease;' +
    '}' +
    '.tdf-ai-backdrop.is-open .tdf-ai { transform: translateY(0) scale(1); }' +
    '.tdf-ai-head {' +
    '  padding: 16px 20px; border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  display: flex; align-items: center; gap: 10px; flex-shrink: 0;' +
    '}' +
    '.tdf-ai-head h3 {' +
    '  font-family: var(--font-display, "Crimson Pro", serif);' +
    '  font-size: 18px; font-weight: 600; flex: 1; margin: 0;' +
    '  letter-spacing: -0.01em;' +
    '}' +
    '.tdf-ai-head h3 .sparkle { color: var(--brand-warm, #F59E0B); margin-right: 4px; }' +
    '.tdf-ai-head h3 .target  { color: var(--brand-primary, #6366F1); }' +
    '.tdf-ai-head .ai-x {' +
    '  border: 0; background: transparent; cursor: pointer;' +
    '  width: 32px; height: 32px; border-radius: 8px;' +
    '  color: var(--fg-muted, #6B7280);' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  font-size: 18px; line-height: 1;' +
    '}' +
    '.tdf-ai-head .ai-x:hover { background: var(--bg-muted, #F9FAFB); color: var(--fg, #111); }' +
    '.tdf-ai-body {' +
    '  padding: 14px 20px; overflow-y: auto;' +
    '  display: flex; flex-direction: column; gap: 12px;' +
    '}' +
    '.tdf-ai-ctx {' +
    '  display: flex; gap: 8px; padding: 10px 12px;' +
    '  background: var(--bg-muted, #F9FAFB); border-radius: 10px;' +
    '  font-size: 12.5px; color: var(--fg-muted, #6B7280); line-height: 1.5;' +
    '}' +
    '.tdf-ai-ctx .ctx-ico { flex-shrink: 0; color: var(--brand-primary, #6366F1); font-size: 14px; line-height: 1.2; }' +
    '.tdf-ai-head-row {' +
    '  display: flex; align-items: center; justify-content: space-between;' +
    '  font-size: 11.5px; color: var(--fg-muted, #6B7280);' +
    '  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;' +
    '}' +
    '.tdf-ai-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }' +
    '.tdf-ai-card {' +
    '  display: flex; gap: 10px; align-items: flex-start; width: 100%;' +
    '  padding: 11px 12px; background: var(--bg, #fff);' +
    '  border: 1.5px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 10px; cursor: pointer; text-align: left;' +
    '  font-family: inherit; transition: border-color .12s ease, background .12s ease;' +
    '}' +
    '.tdf-ai-card:hover { border-color: var(--border-strong, rgba(0,0,0,0.16)); background: var(--bg-elevated, #fff); }' +
    '.tdf-ai-card.is-selected { border-color: var(--brand-primary, #6366F1); background: rgba(99,102,241,0.06); box-shadow: 0 0 0 3px rgba(99,102,241,0.10); }' +
    '.tdf-ai-card .idx {' +
    '  flex-shrink: 0; width: 22px; height: 22px; border-radius: 7px;' +
    '  background: var(--bg-muted, #F9FAFB); color: var(--fg-muted, #6B7280);' +
    '  font-size: 11px; font-weight: 700;' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  font-family: var(--font-mono, "JetBrains Mono", monospace);' +
    '  margin-top: 1px;' +
    '}' +
    '.tdf-ai-card.is-selected .idx { background: var(--brand-primary, #6366F1); color: #fff; }' +
    '.tdf-ai-card .copy { flex: 1; min-width: 0; font-size: 13.5px; line-height: 1.45; color: var(--fg, #111); font-weight: 500; }' +
    '.tdf-ai-card .tag { flex-shrink: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 7px; border-radius: 99px; background: var(--bg-muted, #F9FAFB); color: var(--fg-muted, #6B7280); margin-top: 2px; }' +
    '.tdf-ai-card.is-selected .tag { background: rgba(245,158,11,0.16); color: #92400E; }' +
    /* Skeleton (loading) */
    '.tdf-ai-skel {' +
    '  display: flex; gap: 10px; align-items: flex-start;' +
    '  padding: 11px 12px; background: var(--bg, #fff);' +
    '  border: 1.5px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 10px;' +
    '}' +
    '.tdf-ai-skel .sk {' +
    '  background: linear-gradient(90deg, var(--bg-muted, #F3F4F6) 0%, rgba(0,0,0,0.04) 50%, var(--bg-muted, #F3F4F6) 100%);' +
    '  background-size: 200% 100%;' +
    '  animation: tdf-shim 1.4s linear infinite;' +
    '  border-radius: 6px;' +
    '}' +
    '.tdf-ai-skel .sk-idx { width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; margin-top: 1px; }' +
    '.tdf-ai-skel .sk-copy { flex: 1; }' +
    '.tdf-ai-skel .sk-line { height: 12px; }' +
    '.tdf-ai-skel .sk-line.l1 { width: 70%; }' +
    '.tdf-ai-skel .sk-line.l2 { width: 45%; margin-top: 7px; }' +
    '.tdf-ai-skel .sk-tag { width: 50px; height: 16px; border-radius: 99px; flex-shrink: 0; margin-top: 1px; }' +
    '@keyframes tdf-shim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }' +
    /* Error / empty / rate-limited */
    '.tdf-ai-state {' +
    '  padding: 16px; border: 1px dashed var(--border-strong, rgba(0,0,0,0.16));' +
    '  border-radius: 12px; text-align: center;' +
    '  color: var(--fg, #111); font-size: 13px; line-height: 1.5;' +
    '}' +
    '.tdf-ai-state.is-error { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.30); }' +
    '.tdf-ai-state.is-rate  { background: rgba(245,158,11,0.10); border-color: rgba(245,158,11,0.32); }' +
    '.tdf-ai-state .st-h { font-weight: 600; margin-bottom: 4px; }' +
    '.tdf-ai-state .st-sub { color: var(--fg-muted, #6B7280); font-size: 12.5px; }' +
    '.tdf-ai-state .st-actions { margin-top: 12px; display: inline-flex; gap: 8px; }' +
    '.tdf-ai-state .st-actions button {' +
    '  padding: 7px 12px; font-size: 12.5px; font-weight: 600;' +
    '  border-radius: 8px; cursor: pointer; font-family: inherit;' +
    '  border: 1px solid var(--border-strong, rgba(0,0,0,0.16));' +
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
    '}' +
    '.tdf-ai-state .st-actions button.is-primary { background: var(--brand-primary, #6366F1); color: #fff; border-color: transparent; }' +
    /* Footer */
    '.tdf-ai-foot {' +
    '  padding: 12px 20px; border-top: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  background: var(--bg-elevated, #fff);' +
    '  display: flex; gap: 8px; align-items: center; flex-shrink: 0;' +
    '}' +
    '.tdf-ai-foot .left { display: flex; gap: 8px; }' +
    '.tdf-ai-foot .right { display: flex; gap: 8px; margin-left: auto; }' +
    '.tdf-ai-btn {' +
    '  display: inline-flex; align-items: center; gap: 6px;' +
    '  padding: 8px 12px; border-radius: 8px; font-family: inherit;' +
    '  font-size: 13px; font-weight: 600; cursor: pointer;' +
    '  border: 1px solid transparent; transition: background .12s ease, border-color .12s ease;' +
    '}' +
    '.tdf-ai-btn.is-primary { background: var(--brand-primary, #6366F1); color: #fff; }' +
    '.tdf-ai-btn.is-primary:not(:disabled):hover { background: var(--brand-primary-hover, #4F46E5); }' +
    '.tdf-ai-btn.is-primary:disabled { background: var(--bg-muted, #F3F4F6); color: var(--fg-subtle, #9CA3AF); cursor: not-allowed; }' +
    '.tdf-ai-btn.is-secondary { background: var(--bg-elevated, #fff); color: var(--fg, #111); border-color: var(--border-strong, rgba(0,0,0,0.16)); }' +
    '.tdf-ai-btn.is-secondary:hover { background: var(--bg-muted, #F9FAFB); }' +
    '.tdf-ai-btn.is-ghost { background: transparent; color: var(--fg-muted, #6B7280); }' +
    '.tdf-ai-btn.is-ghost:hover { color: var(--fg, #111); }' +
    /* Dark mode */
    'body.dark-mode .tdf-ai { background: #141A2D; color: #F3F4F6; border-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-head { border-bottom-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-foot { background: #141A2D; border-top-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-ctx  { background: #0B0F1E; color: #9CA3AF; }' +
    'body.dark-mode .tdf-ai-card { background: #0B0F1E; border-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-card:hover { background: #141A2D; border-color: #374151; }' +
    'body.dark-mode .tdf-ai-card .copy { color: #F3F4F6; }' +
    'body.dark-mode .tdf-ai-card .tag, body.dark-mode .tdf-ai-card .idx { background: #1F2937; color: #9CA3AF; }' +
    'body.dark-mode .tdf-ai-skel { background: #0B0F1E; border-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-skel .sk { background: linear-gradient(90deg, #1F2937 0%, rgba(255,255,255,0.04) 50%, #1F2937 100%); background-size: 200% 100%; }' +
    'body.dark-mode .tdf-ai-btn.is-secondary { background: #141A2D; color: #F3F4F6; border-color: #1F2937; }' +
    'body.dark-mode .tdf-ai-btn.is-secondary:hover { background: #1F2937; }' +
    '@media (prefers-reduced-motion: reduce) {' +
    '  .tdf-ai-backdrop, .tdf-ai, .tdf-ai-skel .sk { transition: none !important; animation: none !important; }' +
    '}' +
    /* Cost transparency strip — inside modal head/body, between header and ctx */
    '.tdf-ai-cost {' +
    '  display: flex; align-items: center; gap: 10px;' +
    '  margin: 0 20px; padding: 8px 12px;' +
    '  background: var(--bg-muted, #F9FAFB);' +
    '  border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 10px;' +
    '  font-size: 12px; color: var(--fg-muted, #6B7280); line-height: 1.4;' +
    '  flex-shrink: 0;' +
    '}' +
    '.tdf-ai-cost .cost-meter {' +
    '  flex: 1; display: flex; flex-direction: column; gap: 4px;' +
    '}' +
    '.tdf-ai-cost .cost-line {' +
    '  font-weight: 500; color: var(--fg, #111);' +
    '}' +
    '.tdf-ai-cost .cost-line b { font-weight: 700; }' +
    '.tdf-ai-cost .cost-sub {' +
    '  font-size: 11px; color: var(--fg-subtle, #9CA3AF);' +
    '}' +
    '.tdf-ai-cost .cost-bar {' +
    '  height: 4px; background: rgba(0,0,0,0.06); border-radius: 99px; overflow: hidden;' +
    '  margin-top: 2px;' +
    '}' +
    '.tdf-ai-cost .cost-bar-fill {' +
    '  height: 100%; background: var(--brand-primary, #6366F1); border-radius: 99px;' +
    '  transition: width .25s ease;' +
    '}' +
    '.tdf-ai-cost.is-low {' +
    '  background: rgba(245,158,11,0.10); border-color: rgba(245,158,11,0.32);' +
    '}' +
    '.tdf-ai-cost.is-low .cost-bar-fill { background: #F59E0B; }' +
    '.tdf-ai-cost.is-out {' +
    '  background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.32);' +
    '}' +
    '.tdf-ai-cost.is-out .cost-bar-fill { background: #EF4444; }' +
    /* Refresh button explicit cost label */
    '.tdf-ai-btn .refresh-cost {' +
    '  font-size: 11px; font-weight: 500;' +
    '  color: var(--fg-subtle, #9CA3AF); margin-left: 2px;' +
    '}' +
    '.tdf-ai-btn.is-secondary:hover .refresh-cost { color: var(--fg-muted, #6B7280); }' +
    /* Out-of-quota hard-block panel */
    '.tdf-ai-out {' +
    '  padding: 22px 18px; text-align: center;' +
    '  background: rgba(239,68,68,0.04);' +
    '  border: 1px solid rgba(239,68,68,0.20);' +
    '  border-radius: 12px;' +
    '}' +
    '.tdf-ai-out .out-icon {' +
    '  width: 40px; height: 40px; border-radius: 99px;' +
    '  background: rgba(239,68,68,0.12); color: #EF4444;' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  font-size: 20px; margin-bottom: 12px;' +
    '}' +
    '.tdf-ai-out .out-h {' +
    '  font-family: var(--font-display, "Crimson Pro", serif);' +
    '  font-size: 20px; font-weight: 600; color: var(--fg, #111);' +
    '  margin-bottom: 6px; letter-spacing: -0.01em;' +
    '}' +
    '.tdf-ai-out .out-countdown {' +
    '  font-size: 14px; color: var(--fg-muted, #6B7280); margin-bottom: 14px;' +
    '}' +
    '.tdf-ai-out .out-countdown b {' +
    '  font-family: var(--font-mono, "JetBrains Mono", monospace);' +
    '  color: var(--fg, #111); font-weight: 600;' +
    '}' +
    '.tdf-ai-out .out-why {' +
    '  margin-top: 16px; padding-top: 14px; border-top: 1px dashed rgba(0,0,0,0.10);' +
    '  text-align: left;' +
    '}' +
    '.tdf-ai-out .out-why summary {' +
    '  font-size: 12px; font-weight: 600; color: var(--fg-muted, #6B7280);' +
    '  cursor: pointer; list-style: none; user-select: none;' +
    '  display: inline-flex; align-items: center; gap: 4px;' +
    '}' +
    '.tdf-ai-out .out-why summary::-webkit-details-marker { display: none; }' +
    '.tdf-ai-out .out-why summary::after {' +
    '  content: "▾"; font-size: 9px; transition: transform .14s ease;' +
    '}' +
    '.tdf-ai-out .out-why[open] summary::after { transform: rotate(180deg); }' +
    '.tdf-ai-out .out-why p {' +
    '  margin: 8px 0 0; font-size: 12.5px; line-height: 1.55;' +
    '  color: var(--fg-muted, #6B7280);' +
    '}' +
    /* Per-button quota badge (rendered via ::after on data-quota-badge) */
    '[data-quota-badge]::after {' +
    '  content: attr(data-quota-badge);' +
    '  display: inline-block; margin-left: 5px;' +
    '  padding: 1px 6px; border-radius: 99px;' +
    '  font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em;' +
    '  text-transform: uppercase;' +
    '  background: rgba(245,158,11,0.16); color: #92400E;' +
    '  vertical-align: middle; line-height: 1.5;' +
    '}' +
    '.tdf-ai-btn-out[data-quota-badge]::after {' +
    '  background: rgba(239,68,68,0.16); color: #B91C1C;' +
    '}' +
    'body.dark-mode [data-quota-badge]::after {' +
    '  background: rgba(245,158,11,0.18); color: #FBBF24;' +
    '}' +
    'body.dark-mode .tdf-ai-btn-out[data-quota-badge]::after {' +
    '  background: rgba(239,68,68,0.18); color: #FCA5A5;' +
    '}' +
    'body.dark-mode .tdf-ai-cost { background: #0B0F1E; border-color: #1F2937; color: #9CA3AF; }' +
    'body.dark-mode .tdf-ai-cost .cost-line { color: #F3F4F6; }' +
    'body.dark-mode .tdf-ai-cost .cost-bar  { background: rgba(255,255,255,0.08); }' +
    'body.dark-mode .tdf-ai-out { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.30); }' +
    'body.dark-mode .tdf-ai-out .out-h { color: #F3F4F6; }' +
    'body.dark-mode .tdf-ai-out .out-countdown b { color: #F3F4F6; }' +
    '</style>';

  var aiCssInjected = false;
  function ensureAiCss() {
    if (aiCssInjected) return;
    document.head.insertAdjacentHTML('beforeend', AI_SUGGEST_CSS);
    aiCssInjected = true;
  }

  /* Tone-tagged mocked suggestions per field flavour. Production: replace
     with a Claude Haiku call. The set picked depends on the lower-cased
     fieldName — title/label fields get short punchy lines, captions get
     longer, button/CTA labels get verb-led action lines. */
  var AI_PRESETS = {
    title: [
      { copy: 'Spring Drops — out now',                 tag: 'Direct'       },
      { copy: 'Hit play, fresh feels inside',           tag: 'Playful'      },
      { copy: 'My new album is here',                   tag: 'Friendly'     },
      { copy: 'Listen to Spring Drops',                 tag: 'Professional' },
      { copy: "Wonder what's new? Press play",          tag: 'Curious'      }
    ],
    caption: [
      { copy: "The cover art that started it all",                        tag: 'Curious'      },
      { copy: 'Spring Drops — full album, out everywhere now',            tag: 'Direct'       },
      { copy: 'Behind the artwork: how Spring Drops came together',       tag: 'Friendly'     },
      { copy: 'New album, stitched from late-night sessions',             tag: 'Professional' },
      { copy: 'Pretty proud of this one, ngl',                            tag: 'Playful'      }
    ],
    cta: [
      { copy: 'Listen now',           tag: 'Direct'       },
      { copy: 'Hit play 🎧',          tag: 'Playful'      },
      { copy: 'Stream Spring Drops',  tag: 'Professional' },
      { copy: 'Take a listen',        tag: 'Friendly'     },
      { copy: 'Curious? Press play',  tag: 'Curious'      }
    ]
  };

  function pickPreset(fieldName) {
    var n = (fieldName || '').toLowerCase();
    if (/(button|cta|label)/.test(n)) return AI_PRESETS.cta;
    if (/(caption|description|bio|body|paragraph|answer|outline)/.test(n)) return AI_PRESETS.caption;
    return AI_PRESETS.title;
  }

  var aiState = { fieldName: '', contextSummary: '', onApply: null, selected: -1, suggestions: [] };

  function ensureAiDom() {
    if (document.getElementById('tdf-ai-backdrop')) return;
    ensureAiCss();
    var html = '' +
      '<div class="tdf-ai-backdrop" id="tdf-ai-backdrop" role="dialog" aria-modal="true" aria-labelledby="tdf-ai-title" hidden>' +
        '<div class="tdf-ai">' +
          '<div class="tdf-ai-head">' +
            '<h3 id="tdf-ai-title"><span class="sparkle">✨</span>Suggest for <span class="target" id="tdf-ai-target">field</span></h3>' +
            '<button type="button" class="ai-x" id="tdf-ai-close" aria-label="Close">×</button>' +
          '</div>' +
          /* Cost transparency strip — hidden for unlimited tiers, shown otherwise. */
          '<div class="tdf-ai-cost" id="tdf-ai-cost" hidden>' +
            '<div class="cost-meter">' +
              '<div class="cost-line" id="tdf-ai-cost-line"></div>' +
              '<div class="cost-bar"><div class="cost-bar-fill" id="tdf-ai-cost-fill" style="width:0%"></div></div>' +
              '<div class="cost-sub" id="tdf-ai-cost-sub"></div>' +
            '</div>' +
          '</div>' +
          '<div class="tdf-ai-body" id="tdf-ai-body"></div>' +
          '<div class="tdf-ai-foot" id="tdf-ai-foot">' +
            '<div class="left">' +
              '<button type="button" class="tdf-ai-btn is-secondary" id="tdf-ai-refresh" title="Costs 1 from your daily limit. Different suggestions next time.">' +
                '↻ Refresh<span class="refresh-cost" id="tdf-ai-refresh-cost"> (uses 1 daily)</span>' +
              '</button>' +
            '</div>' +
            '<div class="right">' +
              '<button type="button" class="tdf-ai-btn is-ghost" id="tdf-ai-cancel">Cancel</button>' +
              '<button type="button" class="tdf-ai-btn is-primary" id="tdf-ai-use" disabled>Use this</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    var bd = document.getElementById('tdf-ai-backdrop');
    bd.addEventListener('click', function (e) { if (e.target === bd) closeAi(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bd.classList.contains('is-open')) closeAi();
    });
    document.getElementById('tdf-ai-close').onclick = closeAi;
    document.getElementById('tdf-ai-cancel').onclick = closeAi;
    document.getElementById('tdf-ai-refresh').onclick = function () {
      /* Refresh = 1 quota point. Decrement demo counter, re-render cost strip,
         then either fetch new suggestions or hard-block if we just hit 0. */
      var t = getCurrentTier();
      var spec = AI_QUOTA[t] || AI_QUOTA.free;
      if (!spec.unlimited) {
        AI_USED_DEMO[t] = Math.min(spec.limit, (AI_USED_DEMO[t] || 0) + 1);
      }
      paintCostStrip();
      refreshAllButtonLabels();
      var q = getQuotaState();
      if (!q.unlimited && q.remaining === 0) {
        renderAiState('out');
        return;
      }
      renderAiState('loading');
      setTimeout(function () {
        aiState.suggestions = pickPreset(aiState.fieldName);
        renderAiState('loaded');
      }, 800);
    };
    document.getElementById('tdf-ai-use').onclick = function () {
      if (aiState.selected < 0) return;
      var picked = aiState.suggestions[aiState.selected];
      var text = picked && picked.copy;
      closeAi();
      if (aiState.onApply && text) aiState.onApply(text);
    };
  }

  /* Live countdown ticker for the cost strip — repaints every 30s while
     the modal is open, so the "resets in 8h 23m" line stays accurate. */
  var costStripTimer = null;
  function startCostStripTicker() {
    stopCostStripTicker();
    costStripTimer = setInterval(paintCostStrip, 30000);
  }
  function stopCostStripTicker() {
    if (costStripTimer) { clearInterval(costStripTimer); costStripTimer = null; }
  }

  function paintCostStrip() {
    var strip = document.getElementById('tdf-ai-cost');
    if (!strip) return;
    var q = getQuotaState();
    if (q.unlimited) {
      strip.setAttribute('hidden', '');
      return;
    }
    strip.removeAttribute('hidden');
    strip.classList.remove('is-low', 'is-out');
    if (q.remaining === 0) strip.classList.add('is-out');
    else if (q.remaining <= 2) strip.classList.add('is-low');

    var line = document.getElementById('tdf-ai-cost-line');
    var sub  = document.getElementById('tdf-ai-cost-sub');
    var fill = document.getElementById('tdf-ai-cost-fill');
    var pct  = Math.min(100, Math.round((q.used / q.limit) * 100));

    if (q.remaining === 0) {
      line.innerHTML = '<b>You\'ve used today\'s ' + q.limit + ' AI suggestions</b>';
      sub.textContent = 'Resets in ' + formatCountdown(q.resetMs) + ' (midnight UTC)';
    } else {
      line.innerHTML = '<b>' + q.used + ' of ' + q.limit + '</b> suggestions today';
      sub.textContent = 'Resets in ' + formatCountdown(q.resetMs) + ' · midnight UTC';
    }
    fill.style.width = pct + '%';
  }

  function closeAi() {
    var bd = document.getElementById('tdf-ai-backdrop');
    if (!bd) return;
    bd.classList.remove('is-open');
    bd.setAttribute('hidden', '');
    stopCostStripTicker();
    /* Restore the standard footer in case we were last on the out-of-quota
       state — otherwise the next open() inherits the upgrade-CTA buttons. */
    var foot = document.getElementById('tdf-ai-foot');
    if (foot && !document.getElementById('tdf-ai-refresh')) {
      foot.innerHTML =
        '<div class="left">' +
          '<button type="button" class="tdf-ai-btn is-secondary" id="tdf-ai-refresh" title="Costs 1 from your daily limit. Different suggestions next time.">' +
            '↻ Refresh<span class="refresh-cost"> (uses 1 daily)</span>' +
          '</button>' +
        '</div>' +
        '<div class="right">' +
          '<button type="button" class="tdf-ai-btn is-ghost" id="tdf-ai-cancel">Cancel</button>' +
          '<button type="button" class="tdf-ai-btn is-primary" id="tdf-ai-use" disabled>Use this</button>' +
        '</div>';
      document.getElementById('tdf-ai-cancel').onclick = closeAi;
      document.getElementById('tdf-ai-refresh').onclick = function () {
        var t = getCurrentTier();
        var spec = AI_QUOTA[t] || AI_QUOTA.free;
        if (!spec.unlimited) {
          AI_USED_DEMO[t] = Math.min(spec.limit, (AI_USED_DEMO[t] || 0) + 1);
        }
        paintCostStrip();
        refreshAllButtonLabels();
        var q = getQuotaState();
        if (!q.unlimited && q.remaining === 0) { renderAiState('out'); return; }
        renderAiState('loading');
        setTimeout(function () {
          aiState.suggestions = pickPreset(aiState.fieldName);
          renderAiState('loaded');
        }, 800);
      };
    }
  }

  function renderAiState(kind) {
    var body = document.getElementById('tdf-ai-body');
    var useBtn = document.getElementById('tdf-ai-use');
    var refreshBtn = document.getElementById('tdf-ai-refresh');
    if (!body) return;

    var ctx = '<div class="tdf-ai-ctx"><span class="ctx-ico">ℹ</span><div>' +
      (aiState.contextSummary || 'No additional context — generating from field name.') +
      '</div></div>';

    useBtn.disabled = true;
    useBtn.style.display = '';
    refreshBtn.style.display = '';

    if (kind === 'loading') {
      var skel = '';
      for (var i = 0; i < 5; i++) {
        skel += '<div class="tdf-ai-skel">' +
                  '<div class="sk sk-idx"></div>' +
                  '<div class="sk-copy"><div class="sk sk-line l1"></div><div class="sk sk-line l2"></div></div>' +
                  '<div class="sk sk-tag"></div>' +
                '</div>';
      }
      body.innerHTML = ctx +
        '<div class="tdf-ai-head-row"><span>Pick one</span><span>Generating…</span></div>' +
        '<div class="tdf-ai-list">' + skel + '</div>';
      return;
    }
    if (kind === 'loaded') {
      var cards = aiState.suggestions.map(function (s, i) {
        return '<li><button type="button" class="tdf-ai-card" data-idx="' + i + '">' +
          '<span class="idx">' + (i + 1) + '</span>' +
          '<span class="copy">' + escapeAttr(s.copy) + '</span>' +
          '<span class="tag">' + escapeAttr(s.tag) + '</span>' +
        '</button></li>';
      }).join('');
      body.innerHTML = ctx +
        '<div class="tdf-ai-head-row"><span>Pick one</span><span>' + aiState.suggestions.length + ' suggestions</span></div>' +
        '<ul class="tdf-ai-list">' + cards + '</ul>';
      Array.prototype.forEach.call(body.querySelectorAll('.tdf-ai-card'), function (btn) {
        btn.onclick = function () {
          Array.prototype.forEach.call(body.querySelectorAll('.tdf-ai-card'), function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          aiState.selected = parseInt(btn.getAttribute('data-idx'), 10);
          useBtn.disabled = false;
        };
      });
      return;
    }
    if (kind === 'error') {
      body.innerHTML = ctx +
        '<div class="tdf-ai-state is-error">' +
          '<div class="st-h">Could not fetch suggestions</div>' +
          '<div class="st-sub">The AI model is taking longer than expected. Give it another go.</div>' +
          '<div class="st-actions"><button type="button" class="is-primary" id="tdf-ai-retry">Try again</button></div>' +
        '</div>';
      refreshBtn.style.display = 'none';
      useBtn.style.display = 'none';
      var retry = document.getElementById('tdf-ai-retry');
      if (retry) retry.onclick = function () { renderAiState('loading'); setTimeout(function () { aiState.suggestions = pickPreset(aiState.fieldName); renderAiState('loaded'); }, 800); };
      return;
    }
    if (kind === 'empty') {
      body.innerHTML = ctx +
        '<div class="tdf-ai-state">' +
          '<div class="st-h">Tell us a bit about it first</div>' +
          '<div class="st-sub">Type something in the field, paste a URL into the block, or describe it. We will generate five options.</div>' +
          '<div class="st-actions"><button type="button" class="is-primary" id="tdf-ai-gen">Generate from context</button></div>' +
        '</div>';
      refreshBtn.style.display = 'none';
      useBtn.style.display = 'none';
      var gen = document.getElementById('tdf-ai-gen');
      if (gen) gen.onclick = function () { renderAiState('loading'); setTimeout(function () { aiState.suggestions = pickPreset(aiState.fieldName); renderAiState('loaded'); }, 800); };
      return;
    }
    if (kind === 'rate' || kind === 'out') {
      /* Hard-block out-of-quota — DEC-177 contract. Rendered identically
         whether triggered by initial open() at 0 remaining or by Refresh
         pushing the count to the cap. Pricing comes from TIER_PRICING. */
      var q = getQuotaState();
      var nextT = nextTierUp(q.tier);
      var nextLabel = TIER_LABEL[nextT] || 'Pro';
      var nextPrice = priceFor(nextT, 'monthly');
      var nextSpec  = AI_QUOTA[nextT] || AI_QUOTA.pro;
      var nextQuotaLabel = nextSpec.unlimited
        ? 'unlimited suggestions'
        : (nextSpec.limit + '/day');
      var costPerCall = '$0.000223';

      body.innerHTML = ctx +
        '<div class="tdf-ai-out" role="alert">' +
          '<div class="out-icon" aria-hidden="true">⏳</div>' +
          '<div class="out-h">Comes back at midnight UTC</div>' +
          '<div class="out-countdown">in <b id="tdf-ai-out-cd">' + formatCountdown(q.resetMs) + '</b></div>' +
          '<details class="out-why">' +
            '<summary>Why we limit</summary>' +
            '<p>AI suggestions cost us a fraction of a cent each (' + costPerCall + ' per call on Cloudflare Workers AI). We rate-limit to keep tadaify Free for everyone.</p>' +
          '</details>' +
        '</div>';

      /* Replace footer with sticky upsell pair (Wait + Upgrade). */
      var foot = document.getElementById('tdf-ai-foot');
      if (foot) {
        foot.innerHTML =
          '<div class="left"></div>' +
          '<div class="right">' +
            '<button type="button" class="tdf-ai-btn is-ghost" id="tdf-ai-out-wait">Wait until midnight</button>' +
            '<button type="button" class="tdf-ai-btn is-primary" id="tdf-ai-out-upgrade" style="background:var(--brand-warm,#F59E0B)">' +
              'Upgrade to ' + nextLabel + ' — $' + nextPrice + '/mo for ' + nextQuotaLabel +
            '</button>' +
          '</div>';
        var wait = document.getElementById('tdf-ai-out-wait');
        if (wait) wait.onclick = closeAi;
        var up = document.getElementById('tdf-ai-out-upgrade');
        if (up) up.onclick = function () {
          closeAi();
          /* Real app: window.location = '/settings/billing?upgrade=' + nextT;
             In mockups we just log so the demo doesn't navigate away. */
          try { console.log('[AI Suggest] upgrade CTA clicked → ' + nextT); } catch (e) {}
        };
      }
      /* Also visually red-tint the cost strip when in this state. */
      paintCostStrip();
      return;
    }
  }

  function openAi(opts) {
    opts = opts || {};
    ensureAiDom();
    aiState.fieldName      = opts.fieldName || 'this field';
    aiState.contextSummary = opts.contextSummary || '';
    aiState.onApply        = opts.onApply || null;
    aiState.selected       = -1;
    aiState.suggestions    = pickPreset(aiState.fieldName);

    var target = document.getElementById('tdf-ai-target');
    if (target) target.textContent = aiState.fieldName;

    /* Paint cost strip + decide whether to enter the modal in the
       hard-block out-of-quota state right away. DEC-177 contract: even
       the first click after hitting the cap shows the hard-block, not
       a partial / cached result. */
    paintCostStrip();
    startCostStripTicker();

    var q = getQuotaState();
    if (!q.unlimited && q.remaining === 0) {
      renderAiState('out');
    } else {
      /* Default flow: brief loading skeleton (800ms) then loaded state.
         The opening "click" itself does NOT decrement quota in the mockup
         — production decrements on the Worker only after a successful
         response, mirrored here on Refresh which is the explicit re-spend. */
      renderAiState('loading');
      setTimeout(function () { renderAiState('loaded'); }, 800);
    }

    var bd = document.getElementById('tdf-ai-backdrop');
    bd.removeAttribute('hidden');
    requestAnimationFrame(function () { bd.classList.add('is-open'); });
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
    showToast: showToast,
    TIER_RANK:    TIER_RANK,
    TIER_LABEL:   TIER_LABEL,
    TIER_PRICING: TIER_PRICING
  };
  /* Convenience wrapper for the most common case: a ✨ Suggest button sat
     next to an input or textarea inside a wrapper.

     Usage in markup:
       <div class="input-wrap">
         <input id="seo-title" type="text" />
         <button type="button"
                 onclick="window.AISuggest.fromButton(this, 'SEO title')">
           ✨ Suggest
         </button>
       </div>

     The helper hunts up to 3 ancestors looking for an input / textarea
     sibling; first match wins. It writes the picked suggestion back into
     `.value` and fires both `input` and `change` events so any dirty
     tracker on the page picks up the edit. */
  function fromButton(btn, fieldName, contextSummary) {
    if (!btn) return;
    /* Belt-and-suspenders: ensure tooltip + badge are up to date even if
       the auto-enhancer hasn't run yet (e.g. button added dynamically). */
    enhanceButtonLabel(btn);
    var field = null;
    var el = btn;
    for (var i = 0; i < 4 && el && !field; i++) {
      el = el.parentElement;
      if (!el) break;
      field = el.querySelector('input:not([type=hidden]), textarea, [contenteditable="true"]');
    }
    /* Treat generic "Field" label as a fall-through hint to use the input's
       own placeholder / id. Keeps mechanical wiring concise without losing
       per-field context in the modal title. */
    var label = fieldName;
    if (!label || label === 'Field') {
      label = (field && (field.getAttribute('placeholder') || field.getAttribute('aria-label') || field.id)) || 'this field';
    }
    openAi({
      fieldName:      label,
      contextSummary: contextSummary || '',
      onApply: function (text) {
        if (!field) return;
        if (field.isContentEditable) {
          field.textContent = text;
        } else {
          field.value = text;
        }
        try {
          field.dispatchEvent(new Event('input',  { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) { /* old browsers */ }
      }
    });
  }

  window.AISuggest = {
    open:       openAi,
    close:      closeAi,
    fromButton: fromButton,
    /* Programmatic state — useful for tests and the standalone demo file. */
    setState: function (kind) { renderAiState(kind); },
    /* Tier-aware helpers (DEC-174..179, 2026-04-27). The standalone
       app-ai-suggest-modal.html demo toolbar uses these to drive its
       per-tier preview. Production app-block-editor wires the same
       getCurrentTier()/getQuotaState() to the JWT/Worker response. */
    getCurrentTier:        getCurrentTier,
    getQuotaState:         getQuotaState,
    formatCountdown:       formatCountdown,
    nextTierUp:            nextTierUp,
    enhanceButtonLabel:    enhanceButtonLabel,
    refreshAllButtonLabels: refreshAllButtonLabels,
    paintCostStrip:        paintCostStrip,
    /* Demo-only setters — let the standalone modal page drive a tier
       switcher + "used today" slider without reaching into globals. */
    _setDemoTier: function (tier) {
      if (!AI_QUOTA[tier]) return;
      window.__tadaifyDemoTier = tier;
      try { localStorage.setItem('tadaify_demo_tier', tier); } catch (e) {}
      paintCostStrip();
      refreshAllButtonLabels();
    },
    _setDemoUsed: function (tier, used) {
      if (!AI_QUOTA[tier]) return;
      AI_USED_DEMO[tier] = Math.max(0, Math.min(AI_QUOTA[tier].limit, used | 0));
      paintCostStrip();
      refreshAllButtonLabels();
    },
    _quotaSpec: AI_QUOTA
  };

  /* Auto-enhance every existing ✨ Suggest entry point on the page once
     the DOM is ready. Picks up every button wired via the canonical
     onclick="window.AISuggest.fromButton(this, ...)" pattern.

     We eagerly inject the AI Suggest CSS up-front so the per-button
     [data-quota-badge]::after pill renders on initial page load, even
     before the modal opens for the first time. */
  function autoEnhanceSuggestButtons() {
    ensureAiCss();
    refreshAllButtonLabels();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoEnhanceSuggestButtons);
  } else {
    autoEnhanceSuggestButtons();
  }
})();

/* =========================================================================
   Viewport Switcher Toolbar — preview DevTools bar (Desktop / Tablet / Mobile)
   Appears at the top of every mockup page as a dark "DevTools-style" bar.

   Rules:
   - Suppressed inside iframes (window !== window.top) to prevent recursion
   - Suppressed when URL has ?_no_viewport_toolbar=1
   - Pure vanilla JS, no dependencies, no framework
   - Does NOT touch any existing mockup DOM/CSS — purely additive
   - Keeps the existing mobile drawer code (from PR #98) fully intact
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Guard: never run inside an iframe -------------------------------- */
  try { if (window !== window.top) return; } catch (e) { return; }

  /* ---- Guard: explicit opt-out via URL param ---------------------------- */
  if (/[?&]_no_viewport_toolbar=1/.test(location.search)) return;

  /* ---- Config ----------------------------------------------------------- */
  var BRAND_COLOR = '#6366F1';
  var TOOLBAR_H   = 40; /* px */
  var VIEWPORTS = {
    desktop: { label: '🖥 Desktop', w: null, h: null },
    tablet:  { label: '📱 Tablet',  w: 820,  h: 1180 },
    mobile:  { label: '☎ Mobile',         w: 390,  h: 844  }
  };
  var LS_KEY = 'tadaify_viewport';

  /* ---- State ------------------------------------------------------------ */
  var current = 'desktop';
  var originalBodyHTML = null; /* saved on first non-desktop switch */

  /* ---- Helpers ---------------------------------------------------------- */
  function dims() {
    if (current === 'desktop') return window.innerWidth + ' × ' + window.innerHeight;
    var vp = VIEWPORTS[current];
    return vp.w + ' × ' + vp.h;
  }

  /* ---- Build toolbar CSS ------------------------------------------------ */
  var toolbarCss = [
    /* Push page body content below toolbar */
    'body { padding-top: ' + TOOLBAR_H + 'px !important; }',
    /* Toolbar container */
    '#tdf-vp-toolbar {',
    '  position: fixed; top: 0; left: 0; right: 0; z-index: 999999;',
    '  height: ' + TOOLBAR_H + 'px;',
    '  background: #1f2937;',
    '  display: flex; align-items: center; gap: 8px; padding: 0 16px;',
    '  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;',
    '  font-size: 12px; color: #d1d5db;',
    '  box-shadow: 0 1px 0 rgba(0,0,0,0.4);',
    '  box-sizing: border-box;',
    '}',
    '#tdf-vp-toolbar .vpt-label {',
    '  font-size: 11px; color: #6b7280; white-space: nowrap; user-select: none;',
    '}',
    '#tdf-vp-toolbar .vpt-btns {',
    '  display: flex; align-items: center; gap: 4px;',
    '}',
    '#tdf-vp-toolbar .vpt-btn {',
    '  height: 28px; padding: 0 10px; border-radius: 99px;',
    '  font-family: inherit; font-size: 12px; font-weight: 500;',
    '  cursor: pointer; border: 1px solid #374151; background: transparent;',
    '  color: #9ca3af; white-space: nowrap;',
    '  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease, transform 0.08s ease;',
    '  display: inline-flex; align-items: center;',
    '}',
    '#tdf-vp-toolbar .vpt-btn:hover {',
    '  background: #374151; color: #f3f4f6; transform: translateY(-1px);',
    '}',
    '#tdf-vp-toolbar .vpt-btn.vpt-active {',
    '  background: ' + BRAND_COLOR + '; color: #fff; border-color: ' + BRAND_COLOR + ';',
    '}',
    '#tdf-vp-toolbar .vpt-btn.vpt-active:hover {',
    '  background: #4f46e5; border-color: #4f46e5;',
    '}',
    '#tdf-vp-toolbar .vpt-spacer { flex: 1; }',
    '#tdf-vp-toolbar .vpt-dims {',
    '  font-family: ui-monospace, "JetBrains Mono", "Cascadia Code", monospace;',
    '  font-size: 11px; color: #6b7280; white-space: nowrap; user-select: none;',
    '}',
    '#tdf-vp-toolbar .vpt-info {',
    '  position: relative; display: inline-flex; align-items: center; justify-content: center;',
    '  width: 18px; height: 18px; border-radius: 50%;',
    '  border: 1px solid #374151; background: transparent;',
    '  color: #6b7280; font-size: 10px; font-weight: 700;',
    '  cursor: default; user-select: none; margin-left: 4px; flex-shrink: 0;',
    '}',
    '#tdf-vp-toolbar .vpt-info:hover .vpt-tip { opacity: 1; pointer-events: auto; }',
    '#tdf-vp-toolbar .vpt-tip {',
    '  position: absolute; right: 0; top: calc(100% + 6px);',
    '  background: #111827; color: #d1d5db; font-size: 11px; line-height: 1.5;',
    '  padding: 8px 10px; border-radius: 8px; white-space: normal; max-width: 260px;',
    '  box-shadow: 0 4px 16px rgba(0,0,0,0.5); z-index: 1000000;',
    '  opacity: 0; pointer-events: none; transition: opacity 0.15s ease;',
    '}',
    /* iframe device frame container */
    '#tdf-vp-frame-wrap {',
    '  width: 100%; display: flex; justify-content: center;',
    '  padding-top: 60px; padding-bottom: 60px; box-sizing: border-box;',
    '  background: #111827; min-height: calc(100vh - ' + TOOLBAR_H + 'px);',
    '}',
    '#tdf-vp-frame {',
    '  border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.25);',
    '  border: 1px solid #1f2937; background: #ffffff; display: block;',
    '}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-source', 'viewport-toolbar');
  styleEl.textContent = toolbarCss;
  document.head.appendChild(styleEl);

  /* ---- Build toolbar element -------------------------------------------- */
  var toolbar = document.createElement('div');
  toolbar.id = 'tdf-vp-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Viewport preview switcher');
  toolbar.innerHTML =
    '<span class="vpt-label">Preview viewport:</span>' +
    '<div class="vpt-btns" id="vpt-btns">' +
      '<button type="button" class="vpt-btn vpt-active" data-vp="desktop">' + VIEWPORTS.desktop.label + '</button>' +
      '<button type="button" class="vpt-btn" data-vp="tablet">' + VIEWPORTS.tablet.label + '</button>' +
      '<button type="button" class="vpt-btn" data-vp="mobile">' + VIEWPORTS.mobile.label + '</button>' +
    '</div>' +
    '<span class="vpt-spacer"></span>' +
    '<span class="vpt-dims" id="vpt-dims">' + dims() + '</span>' +
    '<span class="vpt-info" aria-label="About this bar">' +
      '?' +
      '<span class="vpt-tip" role="tooltip">This bar is a preview tool — it is not part of the mockup. Use Desktop / Tablet / Mobile to simulate viewport sizes via an embedded iframe.</span>' +
    '</span>';

  /* Insert at the very top of body, before anything else */
  document.body.insertBefore(toolbar, document.body.firstChild);

  /* ---- Update button active state --------------------------------------- */
  function paintButtons(vp) {
    var btns = document.querySelectorAll('#tdf-vp-toolbar .vpt-btn');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.classList.toggle('vpt-active', btn.getAttribute('data-vp') === vp);
    });
  }

  /* ---- Update dimensions readout ---------------------------------------- */
  function paintDims() {
    var el = document.getElementById('vpt-dims');
    if (el) el.textContent = dims();
  }

  /* ---- Build iframe src URL (suppresses toolbar recursion) -------------- */
  function buildIframeSrc() {
    var qs = location.search;
    var sep = qs ? '&' : '?';
    return location.pathname + qs + sep + '_no_viewport_toolbar=1' + (location.hash || '');
  }

  /* ---- Switch to non-desktop viewport ----------------------------------- */
  function applyViewport(vp) {
    var vpCfg = VIEWPORTS[vp];
    if (!vpCfg || vpCfg.w === null) return;

    if (current === 'desktop') {
      /* Save full body HTML (excluding toolbar) so Desktop restores correctly */
      var clone = document.body.cloneNode(true);
      var tbClone = clone.querySelector('#tdf-vp-toolbar');
      if (tbClone) tbClone.remove();
      originalBodyHTML = clone.innerHTML;
    }

    current = vp;
    paintButtons(vp);
    paintDims();
    try { localStorage.setItem(LS_KEY, vp); } catch (e) {}

    /* Clear body content (keep toolbar) */
    var children = Array.prototype.slice.call(document.body.childNodes);
    children.forEach(function (node) {
      if (node !== toolbar) document.body.removeChild(node);
    });

    /* Build frame wrapper + iframe */
    var wrap = document.createElement('div');
    wrap.id = 'tdf-vp-frame-wrap';

    var iframe = document.createElement('iframe');
    iframe.id = 'tdf-vp-frame';
    iframe.src = buildIframeSrc();
    iframe.width  = String(vpCfg.w);
    iframe.height = String(vpCfg.h);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'yes');
    iframe.setAttribute('title', 'Viewport preview — ' + vp);
    iframe.setAttribute('loading', 'eager');

    wrap.appendChild(iframe);
    document.body.appendChild(wrap);
  }

  /* ---- Restore desktop view --------------------------------------------- */
  function applyDesktop() {
    current = 'desktop';
    paintButtons('desktop');
    try { localStorage.setItem(LS_KEY, 'desktop'); } catch (e) {}

    if (originalBodyHTML !== null) {
      /* Clear body content (keep toolbar) */
      var children = Array.prototype.slice.call(document.body.childNodes);
      children.forEach(function (node) {
        if (node !== toolbar) document.body.removeChild(node);
      });

      /* Re-inject saved HTML */
      var tmp = document.createElement('div');
      tmp.innerHTML = originalBodyHTML;
      while (tmp.firstChild) {
        document.body.appendChild(tmp.firstChild);
      }
      originalBodyHTML = null;

      /* Re-fire logo render hook if available */
      try {
        if (window.tadaifyTokens && typeof window.tadaifyTokens.renderLogo === 'function') {
          window.tadaifyTokens.renderLogo();
        }
      } catch (e) { /* ignore */ }
    }

    paintDims();
  }

  /* ---- Button click handler --------------------------------------------- */
  document.getElementById('vpt-btns').addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.vpt-btn') : null;
    if (!btn && e.target.classList && e.target.classList.contains('vpt-btn')) btn = e.target;
    if (!btn) return;
    var vp = btn.getAttribute('data-vp');
    if (!vp || vp === current) return;
    if (vp === 'desktop') { applyDesktop(); } else { applyViewport(vp); }
  });

  /* ---- Keyboard shortcuts: Cmd/Ctrl+Shift+1/2/3 ------------------------- */
  document.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
    if (e.key === '1') { e.preventDefault(); if (current !== 'desktop') applyDesktop(); }
    if (e.key === '2') { e.preventDefault(); if (current !== 'tablet')  applyViewport('tablet'); }
    if (e.key === '3') { e.preventDefault(); if (current !== 'mobile')  applyViewport('mobile'); }
  });

  /* ---- Live resize readout (desktop mode only) -------------------------- */
  window.addEventListener('resize', function () {
    if (current === 'desktop') paintDims();
  });

  /* ---- Restore persisted viewport on load ------------------------------- */
  (function restorePersisted() {
    var saved = '';
    try { saved = localStorage.getItem(LS_KEY) || ''; } catch (e) {}
    if (saved === 'tablet' || saved === 'mobile') {
      /* Defer so partials / tokens have rendered first */
      setTimeout(function () { applyViewport(saved); }, 150);
    }
  })();

})();

/* =========================================================================
   Page editor — sticky right-column Preview pane with 3-viewport switcher.
   ─────────────────────────────────────────────────────────────────────────
   Activates on any page that declares a content container with
   `data-preview-pane="<page-type>"`. The pane:
     - sits sticky to the right of the editor on viewports >= 1024px
     - collapses below the editor (full-width) on smaller viewports
     - renders an <iframe> loading creator-<page-type>-public.html?_preview=1
       (the `_no_viewport_toolbar=1` query param suppresses recursion of the
       PR #99 viewport toolbar inside the iframe)
     - exposes a 3-viewport switcher (Desktop / Tablet / Mobile) and a
       Light / Dark toggle in the pane header
     - live-updates: editor form input/change events broadcast a
       `postMessage({type: 'preview-update', state})` to the iframe — the
       iframe is welcome to ignore (mockup contract; production wires it)

   Pattern source: app-settings-theme.html "Live preview" pane (sticky
   right column, 3-toggle device switcher, light / dark toggle, live
   update banner).

   This IIFE is INDEPENDENT of the global PR #99 viewport toolbar — they
   answer different questions:
     - PR #99 toolbar:    "How does the WHOLE EDITOR PAGE render at
                           Desktop / Tablet / Mobile?"
     - Preview pane here: "How does the VISITOR'S VIEW of the creator's
                           page render at Desktop / Tablet / Mobile?"
   ========================================================================= */
(function injectPagePreviewPane() {
  'use strict';

  /* Guard: never run inside an iframe (the inner public render is loaded
     in an iframe and must NOT recursively grow another preview pane). */
  try { if (window !== window.top) return; } catch (e) { return; }

  /* Guard: explicit opt-out via URL param (e.g. when preview iframe loads
     editor pages directly, though that is not the typical flow). */
  if (/[?&]_no_preview_pane=1/.test(location.search)) return;

  /* ---- Locate the editor's content container --------------------------- */
  /* Convention: each app-page-*.html editor adds
       data-preview-pane="<page-type>"
     to its main.content element. Page-type is the slug used in the
     companion creator-<page-type>-public.html public render
     (e.g. "blog", "about", "portfolio"). */
  var contentEl = document.querySelector('[data-preview-pane]');
  if (!contentEl) return;

  var pageType = contentEl.getAttribute('data-preview-pane') || '';
  if (!pageType) return;

  var publicSrc = './creator-' + pageType + '-public.html?_no_viewport_toolbar=1&_preview=1';

  /* ---- Viewport configurations ---------------------------------------- */
  var VIEWPORTS = {
    desktop: { label: 'Desktop', w: null, h: null, scale: 1 },
    tablet:  { label: 'Tablet',  w: 820,  h: 1180, scale: null },
    mobile:  { label: 'Mobile',  w: 390,  h: 844,  scale: null }
  };
  var LS_KEY  = 'tadaify_preview_pane_vp_' + pageType;
  var LS_DARK = 'tadaify_preview_pane_dark_' + pageType;

  /* ---- Inject CSS once ------------------------------------------------- */
  var css = [
    '.tdf-pp-shell {',
    '  display: grid; grid-template-columns: 1fr; gap: 24px;',
    '  align-items: start; min-width: 0;',
    '}',
    '@media (min-width: 1024px) {',
    '  .tdf-pp-shell { grid-template-columns: minmax(0, 1fr) 480px; }',
    '}',
    '.tdf-pp-editor { min-width: 0; }',
    '.tdf-pp-col {',
    '  position: static; align-self: start; min-width: 0;',
    '}',
    '@media (min-width: 1024px) {',
    '  .tdf-pp-col {',
    '    position: sticky; top: 78px;',
    '    max-height: calc(100vh - 100px);',
    '    display: flex; flex-direction: column;',
    '  }',
    '}',
    '.tdf-pp-panel {',
    '  background: var(--bg-elevated, #fff);',
    '  border: 1px solid var(--border, #E5E7EB);',
    '  border-radius: 14px;',
    '  overflow: hidden;',
    '  display: flex; flex-direction: column;',
    '  box-shadow: 0 4px 12px rgba(17,24,39,0.05);',
    '  flex: 1; min-height: 0;',
    '}',
    '.tdf-pp-head {',
    '  padding: 10px 14px;',
    '  border-bottom: 1px solid var(--border, #E5E7EB);',
    '  background: var(--bg, #F9FAFB);',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  gap: 10px; flex-wrap: wrap;',
    '}',
    '.tdf-pp-title {',
    '  font-size: 11px; font-weight: 700;',
    '  text-transform: uppercase; letter-spacing: 0.08em;',
    '  color: var(--fg-subtle, #6B7280);',
    '}',
    '.tdf-pp-segment {',
    '  display: inline-flex; gap: 0;',
    '  background: var(--bg-muted, #F3F4F6); border-radius: 7px;',
    '  padding: 2px;',
    '}',
    '.tdf-pp-segment button {',
    '  padding: 4px 10px; border: 0; background: transparent;',
    '  font-size: 11px; font-weight: 600; color: var(--fg-muted, #6B7280);',
    '  border-radius: 5px; cursor: pointer;',
    '  display: inline-flex; align-items: center; gap: 4px;',
    '  font-family: inherit;',
    '}',
    '.tdf-pp-segment button.is-active {',
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111827);',
    '  box-shadow: 0 1px 2px rgba(17,24,39,0.06);',
    '}',
    '.tdf-pp-segment svg { width: 12px; height: 12px; }',
    '.tdf-pp-stage {',
    '  background:',
    '    radial-gradient(120% 80% at 50% 0%, rgba(99,102,241,0.06), transparent 60%),',
    '    var(--bg-muted, #F3F4F6);',
    '  display: flex; align-items: flex-start; justify-content: center;',
    '  padding: 18px 14px; min-height: 480px; flex: 1;',
    '  overflow: auto;',
    '}',
    '.tdf-pp-stage[data-device="desktop"] .tdf-pp-frame-wrap {',
    '  width: 100%; max-width: 100%;',
    '}',
    '.tdf-pp-stage[data-device="tablet"] .tdf-pp-frame-wrap,',
    '.tdf-pp-stage[data-device="mobile"] .tdf-pp-frame-wrap {',
    '  display: inline-block;',
    '  transform-origin: top center;',
    '}',
    '.tdf-pp-frame-wrap {',
    '  border-radius: 12px;',
    '  box-shadow: 0 12px 30px rgba(17,24,39,0.16);',
    '  overflow: hidden; background: #fff;',
    '  transition: width .25s ease, height .25s ease;',
    '}',
    '.tdf-pp-frame {',
    '  border: 0; display: block; background: #fff;',
    '  width: 100%; height: 600px;',
    '}',
    '.tdf-pp-stage[data-device="desktop"] .tdf-pp-frame { height: 600px; }',
    '.tdf-pp-stage[data-device="tablet"] .tdf-pp-frame { width: 820px; height: 1180px; }',
    '.tdf-pp-stage[data-device="mobile"] .tdf-pp-frame { width: 390px; height: 844px; }',
    '.tdf-pp-foot {',
    '  padding: 10px 14px;',
    '  background: var(--bg, #F9FAFB);',
    '  border-top: 1px solid var(--border, #E5E7EB);',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  gap: 10px; flex-wrap: wrap;',
    '  font-size: 11.5px; color: var(--fg-muted, #6B7280);',
    '}',
    '.tdf-pp-update { display: inline-flex; align-items: center; gap: 6px; }',
    '.tdf-pp-dot {',
    '  width: 7px; height: 7px; border-radius: 50%;',
    '  background: #10B981;',
    '  box-shadow: 0 0 0 3px rgba(16,185,129,0.20);',
    '}',
    '.tdf-pp-dark-btn {',
    '  border: 1px solid var(--border, #E5E7EB);',
    '  background: var(--bg-elevated, #fff);',
    '  color: var(--fg-muted, #6B7280);',
    '  border-radius: 99px; padding: 4px 10px; cursor: pointer;',
    '  font-size: 11px; font-weight: 600; font-family: inherit;',
    '  display: inline-flex; align-items: center; gap: 4px;',
    '}',
    '.tdf-pp-dark-btn.is-dark {',
    '  background: #111827; color: #F9FAFB; border-color: #111827;',
    '}',
    /* Dark-mode tokens */
    'body.dark-mode .tdf-pp-panel { background: #141A2D; border-color: #1F2937; }',
    'body.dark-mode .tdf-pp-head, body.dark-mode .tdf-pp-foot { background: #0B0F1E; border-color: #1F2937; }',
    'body.dark-mode .tdf-pp-stage { background: #0B0F1E; }',
    'body.dark-mode .tdf-pp-segment { background: #1A2236; }',
    'body.dark-mode .tdf-pp-segment button.is-active { background: #141A2D; color: #F3F4F6; }'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-source', 'page-preview-pane');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---- SVG icons ------------------------------------------------------- */
  var ICON_DESKTOP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
  var ICON_TABLET  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>';
  var ICON_MOBILE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>';

  /* ---- Build pane DOM -------------------------------------------------- */
  var aside = document.createElement('aside');
  aside.className = 'tdf-pp-col';
  aside.setAttribute('aria-label', 'Live preview — visitor view');
  aside.innerHTML =
    '<div class="tdf-pp-panel">' +
      '<div class="tdf-pp-head">' +
        '<div class="tdf-pp-title">Live preview · /' + pageType + '</div>' +
        '<div class="tdf-pp-segment" role="tablist" aria-label="Viewport">' +
          '<button type="button" class="is-active" data-device="desktop" title="Desktop" aria-label="Desktop">' + ICON_DESKTOP + '</button>' +
          '<button type="button" data-device="tablet" title="Tablet" aria-label="Tablet">' + ICON_TABLET + '</button>' +
          '<button type="button" data-device="mobile" title="Mobile" aria-label="Mobile">' + ICON_MOBILE + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="tdf-pp-stage" data-device="desktop">' +
        '<div class="tdf-pp-frame-wrap">' +
          '<iframe class="tdf-pp-frame" src="' + publicSrc + '" title="Visitor preview" loading="lazy"></iframe>' +
        '</div>' +
      '</div>' +
      '<div class="tdf-pp-foot">' +
        '<span class="tdf-pp-update"><span class="tdf-pp-dot"></span> Live · updates as you edit</span>' +
        '<button type="button" class="tdf-pp-dark-btn" data-action="toggle-dark">🌙 Dark</button>' +
      '</div>' +
    '</div>';

  /* ---- Wrap editor + pane in 2-column shell ---------------------------- */
  /* Insert a wrapper element AROUND the editor's content. The original
     parent keeps its layout (sidebar grid in the dashboard layout) and
     the wrapper turns the right column into "editor + preview". */
  var parent = contentEl.parentNode;
  if (!parent) return;

  var shell = document.createElement('div');
  shell.className = 'tdf-pp-shell';

  var editorWrap = document.createElement('div');
  editorWrap.className = 'tdf-pp-editor';

  /* Move <main> into editorWrap, then editorWrap + aside into shell, then
     insert shell where <main> originally lived. */
  parent.insertBefore(shell, contentEl);
  editorWrap.appendChild(contentEl);
  shell.appendChild(editorWrap);
  shell.appendChild(aside);

  /* ---- Switcher behaviour --------------------------------------------- */
  var stage = aside.querySelector('.tdf-pp-stage');
  var segBtns = aside.querySelectorAll('.tdf-pp-segment button');

  function setDevice(device) {
    if (!VIEWPORTS[device]) return;
    stage.setAttribute('data-device', device);
    Array.prototype.forEach.call(segBtns, function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-device') === device);
    });
    try { localStorage.setItem(LS_KEY, device); } catch (e) {}
  }

  Array.prototype.forEach.call(segBtns, function (btn) {
    btn.addEventListener('click', function () {
      setDevice(btn.getAttribute('data-device'));
    });
  });

  /* Restore persisted viewport */
  var savedDevice = '';
  try { savedDevice = localStorage.getItem(LS_KEY) || ''; } catch (e) {}
  if (VIEWPORTS[savedDevice]) setDevice(savedDevice);

  /* ---- Light / dark toggle (preview-only, doesn't touch parent body) -- */
  var darkBtn = aside.querySelector('[data-action="toggle-dark"]');
  var iframe  = aside.querySelector('.tdf-pp-frame');

  function applyDark(isDark) {
    if (isDark) {
      darkBtn.classList.add('is-dark');
      darkBtn.textContent = '☀ Light';
    } else {
      darkBtn.classList.remove('is-dark');
      darkBtn.textContent = '🌙 Dark';
    }
    /* Ask the iframe to toggle its own body.dark-mode. Listener is
       optional in the public mockup — if absent, the request is a no-op. */
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'preview-theme',
          theme: isDark ? 'dark' : 'light'
        }, '*');
      }
    } catch (e) { /* ignore cross-origin */ }
    try { localStorage.setItem(LS_DARK, isDark ? '1' : '0'); } catch (e) {}
  }

  darkBtn.addEventListener('click', function () {
    var nowDark = !darkBtn.classList.contains('is-dark');
    applyDark(nowDark);
  });

  /* Restore persisted dark flag */
  var savedDark = '0';
  try { savedDark = localStorage.getItem(LS_DARK) || '0'; } catch (e) {}
  if (savedDark === '1') applyDark(true);

  /* ---- Live update contract ------------------------------------------- */
  /* Snapshot current editor state from any input/select/textarea inside
     the editor, then postMessage to the iframe. The iframe doesn't have
     to act on it (mockup), but the contract is documented and a future
     production renderer can wire it. Debounced to 200 ms. */
  function snapshotEditorState() {
    var state = {};
    var fields = editorWrap.querySelectorAll('input, select, textarea');
    Array.prototype.forEach.call(fields, function (f) {
      var name = f.id || f.getAttribute('name');
      if (!name) return;
      if (f.type === 'checkbox' || f.type === 'radio') {
        state[name] = !!f.checked;
      } else {
        state[name] = f.value;
      }
    });
    return state;
  }

  var debounceTimer = null;
  function scheduleBroadcast() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      try {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'preview-update',
            pageType: pageType,
            state: snapshotEditorState()
          }, '*');
        }
      } catch (e) { /* ignore */ }
    }, 200);
  }

  editorWrap.addEventListener('input',  scheduleBroadcast);
  editorWrap.addEventListener('change', scheduleBroadcast);
})();
