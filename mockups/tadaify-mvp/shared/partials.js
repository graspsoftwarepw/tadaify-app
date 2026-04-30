/* =========================================================================
   tadaify — shared partials injector
   Renders nav + footer (marketing pages) and the canonical app sidebar
   (dashboard pages) into pages that declare:
       <div data-partial="nav"></div>
       <div data-partial="footer"></div>
       <div data-partial="app-sidebar" data-active="..." data-tier="..."></div>

   Must run BEFORE tokens.js so logo orbs get registered + animated.
   Wordmark locked per DEC-WORDMARK-01 — no hyphen, ta / da! / ify color split.
   Sidebar canon per CLAUDE.md "Sidebar canonical structure"
   (TADA-BUG-005, 2026-04-28 — IA restructure):
     1. Pages parent (accordion) → Home + Add page (opens template picker, BUG-006)
     2. Configuration parent (accordion, renamed from "Design") →
          Theme / Profile / Background / Text / Buttons / Animations /
          Colors / Footer / Domain (Domain folded in from top-level)
     3. Insights (top-level)
     4. Administration parent (accordion) → Shop / Blog / Schedule /
          Portfolio / Paid articles (admin-* counterparts)
     5. Settings
     6. Help & docs
     7. Feedback (NEW — bottom entry, → app-feedback.html)
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
          '<a href="./login.html" class="btn btn-ghost btn-sm">Log in</a>' +
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
    paidAdm:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    /* Configuration sub-icons (added TADA-BUG-005 — Configuration accordion) */
    theme:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>',
    profile:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    bgIcon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    textIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    buttons:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="5" rx="2.5"/><rect x="2" y="14" width="20" height="5" rx="2.5"/></svg>',
    anims:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>',
    colors:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z"/></svg>',
    footer:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    /* Feedback icon — speech bubble (added TADA-BUG-005) */
    feedback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
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
       If absent and active==='admin', no sub-item is highlighted.

       configActive: which Configuration sub-item is current (when active==='config' OR
       active==='design' for back-compat). Values: 'theme' | 'profile' | 'background' |
       'text' | 'buttons' | 'animations' | 'colors' | 'footer' | 'domain'.
       (TADA-BUG-005 IA restructure — passed via data-config-active attribute.) */
    adminActive = (adminActive || '').toLowerCase();
    var configActiveAttr = arguments[5] || '';
    var configActive = (configActiveAttr || '').toLowerCase();
    /* Back-compat: if caller still uses data-active="design", treat as Configuration. */
    var isConfig = (active === 'config' || active === 'design');
    /* Back-compat: data-active="domain" maps onto Configuration→Domain sub-item. */
    if (active === 'domain') { isConfig = true; configActive = configActive || 'domain'; }
    var initial = (username || 'A').charAt(0).toUpperCase();
    var tierLabel = ({ free: 'Free', creator: 'Creator', pro: 'Pro', business: 'Business' })[tier] || 'Pro';

    function cls(name) { return active === name ? ' active' : ''; }
    function aria(name) { return active === name ? ' aria-current="page"' : ''; }
    function adminCls(name) { return (active === 'admin' && adminActive === name) ? ' is-current' : ''; }
    function configCls(name) { return (isConfig && configActive === name) ? ' is-current' : ''; }
    function configParentCls() { return isConfig ? ' active' : ''; }

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
            /* TADA-BUG-006: "Add page" opens the page-template picker modal.
               Wired by setupAddPageModal() further down. Removed "soon" pill +
               is-disabled state per BUG-006 spec. */
            '<button type="button" class="nav-sub-item nav-add-page" data-tip="Add a new page" data-action="open-add-page-modal">' +
              ICON.plus + '<span>Add page</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 2 — Configuration parent (renamed from "Design" per TADA-BUG-005).
           Workspace-level config: Theme, Profile, Background, Text, Buttons,
           Animations, Colors, Footer, Domain (Domain folded in from top-level).
           Click parent → Theme sub-section by default. Sub-items always
           visible (accordion expanded by default for nav clarity). */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-dashboard.html?tab=design&sub=theme" class="nav-item nav-pages-parent' + configParentCls() + '" data-tip="Configuration"' + (isConfig ? ' aria-current="page"' : '') + '>' +
            ICON.design +
            '<span class="label">Configuration</span>' +
            '<span class="nav-caret">' + ICON.caret + '</span>' +
          '</a>' +
          '<div class="nav-sub-list">' +
            '<a href="./app-dashboard.html?tab=design&sub=theme" class="nav-sub-item' + configCls('theme') + '" data-tip="Theme">' +
              ICON.theme + '<span>Theme</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=profile" class="nav-sub-item' + configCls('profile') + '" data-tip="Profile">' +
              ICON.profile + '<span>Profile</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=background" class="nav-sub-item' + configCls('background') + '" data-tip="Background">' +
              ICON.bgIcon + '<span>Background</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=text" class="nav-sub-item' + configCls('text') + '" data-tip="Text">' +
              ICON.textIcon + '<span>Text</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=buttons" class="nav-sub-item' + configCls('buttons') + '" data-tip="Buttons">' +
              ICON.buttons + '<span>Buttons</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=animations" class="nav-sub-item' + configCls('animations') + '" data-tip="Animations">' +
              ICON.anims + '<span>Animations</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=colors" class="nav-sub-item' + configCls('colors') + '" data-tip="Colors">' +
              ICON.colors + '<span>Colors</span>' +
            '</a>' +
            '<a href="./app-dashboard.html?tab=design&sub=footer" class="nav-sub-item' + configCls('footer') + '" data-tip="Footer">' +
              ICON.footer + '<span>Footer</span>' +
            '</a>' +
            '<a href="./app-domain.html" class="nav-sub-item' + configCls('domain') + '" data-tip="Custom domain">' +
              ICON.domain + '<span>Domain</span>' +
            '</a>' +
          '</div>' +
        '</div>' +

        '<div class="nav-divider"></div>' +

        /* GROUP 3 — Insights + Affiliate (revenue program).
           FIX-SHOP-001: native Shop is deferred to v2 per
           feedback_tadaify_no_shop_in_mvp.
           Affiliate added top-level (TADA-BUG-003) — own dashboard surface
           (earnings + referrals) so it sits as a peer of Insights, not nested
           under Settings. */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-insights.html" class="nav-item' + cls('insights') + '" data-tip="Insights"' + aria('insights') + '>' +
            ICON.insights + '<span class="label">Insights</span>' +
          '</a>' +
          '<a href="./app-affiliate.html" class="nav-item' + cls('affiliate') + '" data-tip="Affiliate program — earn 30% recurring"' + aria('affiliate') + '>' +
            ICON.paidAdm + '<span class="label">Affiliate</span>' +
          '</a>' +
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

        /* GROUP 4 — Settings + Help + Feedback (Feedback added TADA-BUG-005). */
        '<div class="nav-group" style="padding-top:0">' +
          '<a href="./app-settings.html" class="nav-item' + cls('settings') + '" data-tip="Settings"' + aria('settings') + '>' +
            ICON.settings + '<span class="label">Settings</span>' +
          '</a>' +
          /* TODO: replace href with ./app-help.html when that mockup exists */
          '<button type="button" class="nav-item' + cls('help') + '" data-tip="Help &amp; docs" onclick="alert(\'Mockup — Help &amp; docs coming Q+1\')">' +
            ICON.help + '<span class="label">Help &amp; docs</span>' +
          '</button>' +
          '<a href="./app-feedback.html" class="nav-item' + cls('feedback') + '" data-tip="Send feedback to tadaify"' + aria('feedback') + '>' +
            ICON.feedback + '<span class="label">Feedback</span>' +
          '</a>' +
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
      el.getAttribute('data-admin-active'),
      el.getAttribute('data-config-active')
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

  var publicSrc = pageType === 'public'
    ? './creator-public.html?_no_viewport_toolbar=1&_preview=1'
    : './creator-' + pageType + '-public.html?_no_viewport_toolbar=1&_preview=1';

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

/* =========================================================================
   LinkTarget — tabbed Pages / External URL picker (Fix #6 Sub-feature 6B)

   Replaces plain URL input for click-through fields across the block
   editor. Two tabs:
     • Pages — searchable list of creator's published pages, blog posts,
       portfolio projects, paid articles, booking types. Click a row to
       fill the URL field with `tadaify.com/<handle>/<slug>` (or relative
       `/<slug>` per the spec — stored as relative internally).
     • External URL — plain `<input type="url">` with javascript: guard.

   Default tab: "Pages" if creator has any non-Home page; otherwise
   "External URL" (caller can override per field via `defaultTab`).

   Public API:
     window.LinkTarget.openPicker({
       fieldId:        '...',         // optional, used as a logical key
       fieldLabel:     'URL',         // shown in modal header
       currentValue:   'https://...', // pre-populates input + selection
       defaultTab:     'pages'|'external'|undefined,
       onSelect:       function (value) { ... }     // called with chosen string
     });

   Anti-recursion: no-ops inside iframes (preview pane).
   Centered modal only — never a right-side drawer per
   feedback_no_right_side_drawers.

   PR #98/99/101/102/103 IIFEs above are NOT touched by this block — this
   IIFE appends a NEW window.LinkTarget global and a NEW <style> tag.
   ========================================================================= */
(function setupLinkTargetPicker() {
  if (window !== window.top) return; /* skip inside iframes */

  /* --------------------------------------------------------------- */
  /* 1. Mock content directory (creator's published surfaces)        */
  /* --------------------------------------------------------------- */
  var CREATOR_HANDLE = 'alexandra';

  /* "Pages" entries — every page type listed in the spec. Only ones
     the creator has *published* show up. For the mockup we list a
     realistic mix: Home + a handful of accepted page types. Legal +
     Paid articles parents are present because the creator owns them
     even if they're empty. */
  var DIRECTORY = {
    pages: [
      { title: 'Home',              slug: '',                  type: 'page' },
      { title: 'About',             slug: '/about',            type: 'page' },
      { title: 'Blog',              slug: '/blog',             type: 'page' },
      { title: 'Portfolio',         slug: '/portfolio',        type: 'page' },
      { title: 'Newsletter',        slug: '/newsletter',       type: 'page' },
      { title: 'Contact',           slug: '/contact',          type: 'page' },
      { title: 'FAQ',               slug: '/faq',              type: 'page' },
      { title: 'Schedule',          slug: '/schedule',         type: 'page' },
      { title: 'Links archive',     slug: '/links',            type: 'page' },
      { title: 'Paid articles',     slug: '/articles',         type: 'page' }
    ],
    blogPosts: [
      { title: 'How I shipped tadaify',  slug: '/blog/how-i-shipped-tadaify' },
      { title: '5 productivity tips',    slug: '/blog/5-productivity-tips'   },
      { title: 'A year in review',       slug: '/blog/a-year-in-review'      }
    ],
    portfolio: [
      { title: 'Spring Drops cover',     slug: '/portfolio/spring-drops'     },
      { title: 'Summer EP artwork',      slug: '/portfolio/summer-ep'        }
    ],
    paidArticles: [
      { title: 'Behind-the-scenes',      slug: '/article/behind-scenes'      },
      { title: 'My pricing strategy',    slug: '/article/pricing-strategy'   }
    ],
    bookingTypes: [
      { title: '30-min intro call',      slug: '/book/intro'                 },
      { title: 'Coaching session',       slug: '/book/coaching'              }
    ]
  };

  function hasNonHomePages() {
    return DIRECTORY.pages.filter(function (p) { return p.slug !== ''; }).length > 0;
  }

  function fullUrl(slug) {
    /* Stored as relative internally — display form for previews uses
       the full handle URL. The caller receives the relative path. */
    return slug === '' ? ('tadaify.com/' + CREATOR_HANDLE) : ('tadaify.com/' + CREATOR_HANDLE + slug);
  }

  /* --------------------------------------------------------------- */
  /* 2. CSS                                                           */
  /* --------------------------------------------------------------- */
  var LT_CSS = '' +
    '<style data-source="link-target-partial">' +
    '.tdf-lt-backdrop {' +
    '  position: fixed; inset: 0; z-index: 1060;' +
    '  background: rgba(11,15,30,0.55);' +
    '  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);' +
    '  display: none; align-items: center; justify-content: center;' +
    '  padding: 16px; opacity: 0; transition: opacity .16s ease;' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '}' +
    '.tdf-lt-backdrop.is-open { display: flex; opacity: 1; }' +
    '.tdf-lt {' +
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
    '  border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 16px; box-shadow: 0 24px 60px rgba(11,15,30,0.25);' +
    '  width: min(720px, 96vw); max-height: 88vh;' +
    '  display: flex; flex-direction: column; overflow: hidden;' +
    '  transform: translateY(8px) scale(0.985);' +
    '  transition: transform .16s ease;' +
    '}' +
    '.tdf-lt-backdrop.is-open .tdf-lt { transform: translateY(0) scale(1); }' +
    '.tdf-lt-head {' +
    '  padding: 16px 20px; border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  display: flex; align-items: center; gap: 10px; flex-shrink: 0;' +
    '}' +
    '.tdf-lt-head h3 {' +
    '  font-family: var(--font-display, "Crimson Pro", serif);' +
    '  font-size: 18px; font-weight: 600; flex: 1; margin: 0;' +
    '  letter-spacing: -0.01em;' +
    '}' +
    '.tdf-lt-head h3 .accent { color: var(--brand-primary, #6366F1); }' +
    '.tdf-lt-head .lt-x {' +
    '  border: 0; background: transparent; cursor: pointer;' +
    '  width: 32px; height: 32px; border-radius: 8px;' +
    '  color: var(--fg-muted, #6B7280);' +
    '  display: inline-flex; align-items: center; justify-content: center;' +
    '  font-size: 18px; line-height: 1;' +
    '}' +
    '.tdf-lt-head .lt-x:hover { background: var(--bg-muted, #F9FAFB); color: var(--fg, #111); }' +
    '.tdf-lt-tabs {' +
    '  display: flex; gap: 4px; padding: 8px 16px 0;' +
    '  border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  flex-shrink: 0; background: var(--bg-elevated, #fff);' +
    '}' +
    '.tdf-lt-tab {' +
    '  border: 0; background: transparent; cursor: pointer;' +
    '  padding: 9px 14px; font-size: 13px; font-weight: 600;' +
    '  color: var(--fg-muted, #6B7280); font-family: inherit;' +
    '  border-bottom: 2px solid transparent;' +
    '  margin-bottom: -1px; border-radius: 6px 6px 0 0;' +
    '  transition: color .12s ease, border-color .12s ease, background .12s ease;' +
    '}' +
    '.tdf-lt-tab:hover { color: var(--fg, #111); background: var(--bg-muted, #F9FAFB); }' +
    '.tdf-lt-tab.is-active {' +
    '  color: var(--brand-primary, #6366F1);' +
    '  border-bottom-color: var(--brand-primary, #6366F1);' +
    '  background: transparent;' +
    '}' +
    '.tdf-lt-body {' +
    '  padding: 14px 16px 12px; overflow-y: auto;' +
    '  display: flex; flex-direction: column; gap: 10px;' +
    '  min-height: 320px;' +
    '}' +
    '.tdf-lt-search {' +
    '  display: flex; align-items: center; gap: 8px;' +
    '  padding: 9px 12px; background: var(--bg-muted, #F9FAFB);' +
    '  border: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  border-radius: 10px; flex-shrink: 0;' +
    '}' +
    '.tdf-lt-search .ico { color: var(--fg-muted, #6B7280); font-size: 14px; flex-shrink: 0; }' +
    '.tdf-lt-search input {' +
    '  flex: 1; border: 0; outline: 0; background: transparent;' +
    '  font-size: 13.5px; font-family: inherit; color: var(--fg, #111);' +
    '  padding: 0;' +
    '}' +
    '.tdf-lt-section { display: flex; flex-direction: column; gap: 4px; }' +
    '.tdf-lt-section-h {' +
    '  display: flex; align-items: center; gap: 6px;' +
    '  font-size: 11px; font-weight: 700; text-transform: uppercase;' +
    '  letter-spacing: 0.06em; color: var(--fg-muted, #6B7280);' +
    '  padding: 8px 6px 4px;' +
    '}' +
    '.tdf-lt-section-h .ico { font-size: 13px; }' +
    '.tdf-lt-row {' +
    '  display: flex; align-items: center; gap: 10px;' +
    '  width: 100%; padding: 9px 10px;' +
    '  background: transparent; border: 1px solid transparent;' +
    '  border-radius: 8px; cursor: pointer; text-align: left;' +
    '  font-family: inherit; font-size: 13px; color: var(--fg, #111);' +
    '  transition: background .1s ease, border-color .1s ease;' +
    '}' +
    '.tdf-lt-row:hover { background: var(--bg-muted, #F9FAFB); }' +
    '.tdf-lt-row.is-selected {' +
    '  border-color: var(--brand-primary, #6366F1);' +
    '  background: rgba(99,102,241,0.06);' +
    '}' +
    '.tdf-lt-row .title { flex: 1; min-width: 0; font-weight: 500; }' +
    '.tdf-lt-row .url {' +
    '  flex-shrink: 0; font-size: 11.5px; color: var(--fg-muted, #6B7280);' +
    '  font-family: var(--font-mono, "JetBrains Mono", monospace);' +
    '  max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' +
    '}' +
    '.tdf-lt-empty {' +
    '  padding: 10px 12px; font-size: 12.5px; color: var(--fg-muted, #6B7280);' +
    '  font-style: italic;' +
    '}' +
    '.tdf-lt-empty a { color: var(--brand-primary, #6366F1); text-decoration: none; font-style: normal; font-weight: 500; }' +
    '.tdf-lt-empty a:hover { text-decoration: underline; }' +
    '.tdf-lt-ext { display: flex; flex-direction: column; gap: 6px; }' +
    '.tdf-lt-ext label {' +
    '  font-size: 12px; font-weight: 600; color: var(--fg-muted, #6B7280);' +
    '  text-transform: uppercase; letter-spacing: 0.05em;' +
    '}' +
    '.tdf-lt-ext input {' +
    '  padding: 10px 12px; border: 1px solid var(--border-strong, rgba(0,0,0,0.16));' +
    '  border-radius: 10px; font-size: 14px; font-family: inherit;' +
    '  background: var(--bg, #fff); color: var(--fg, #111);' +
    '}' +
    '.tdf-lt-ext input:focus { outline: 2px solid var(--brand-primary, #6366F1); outline-offset: 1px; }' +
    '.tdf-lt-ext .err {' +
    '  font-size: 12px; color: #B91C1C; padding-top: 2px;' +
    '}' +
    '.tdf-lt-ext .help {' +
    '  font-size: 12px; color: var(--fg-muted, #6B7280); padding-top: 2px; line-height: 1.45;' +
    '}' +
    '.tdf-lt-foot {' +
    '  padding: 12px 20px; border-top: 1px solid var(--border, rgba(0,0,0,0.08));' +
    '  background: var(--bg-elevated, #fff);' +
    '  display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0;' +
    '}' +
    '.tdf-lt-foot button {' +
    '  padding: 9px 16px; font-size: 13px; font-weight: 600;' +
    '  border-radius: 9px; cursor: pointer; font-family: inherit;' +
    '  border: 1px solid var(--border-strong, rgba(0,0,0,0.16));' +
    '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
    '}' +
    '.tdf-lt-foot button.is-primary {' +
    '  background: var(--brand-primary, #6366F1); color: #fff; border-color: transparent;' +
    '}' +
    '.tdf-lt-foot button.is-primary:disabled { opacity: 0.5; cursor: not-allowed; }' +
    /* Inline preview chip rendered next to fields backed by link-target */
    '.tdf-lt-field { display: flex; flex-direction: column; gap: 6px; }' +
    '.tdf-lt-trigger {' +
    '  display: flex; align-items: center; gap: 10px; width: 100%;' +
    '  padding: 9px 12px; background: var(--bg, #fff);' +
    '  border: 1px solid var(--border-strong, rgba(0,0,0,0.16));' +
    '  border-radius: 10px; cursor: pointer; font-family: inherit;' +
    '  font-size: 13.5px; color: var(--fg, #111); text-align: left;' +
    '  transition: border-color .12s ease, background .12s ease;' +
    '}' +
    '.tdf-lt-trigger:hover { border-color: var(--brand-primary, #6366F1); }' +
    '.tdf-lt-trigger .lt-kind {' +
    '  flex-shrink: 0; padding: 2px 7px; border-radius: 99px;' +
    '  font-size: 10px; font-weight: 700; text-transform: uppercase;' +
    '  letter-spacing: 0.04em;' +
    '  background: var(--bg-muted, #F9FAFB); color: var(--fg-muted, #6B7280);' +
    '}' +
    '.tdf-lt-trigger.is-internal .lt-kind {' +
    '  background: rgba(99,102,241,0.12); color: var(--brand-primary, #6366F1);' +
    '}' +
    '.tdf-lt-trigger .lt-val { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }' +
    '.tdf-lt-trigger .lt-val.is-empty { color: var(--fg-muted, #6B7280); font-style: italic; }' +
    '.tdf-lt-trigger .lt-edit { flex-shrink: 0; font-size: 12px; color: var(--brand-primary, #6366F1); font-weight: 600; }' +
    '@media (prefers-reduced-motion: reduce) {' +
    '  .tdf-lt-backdrop, .tdf-lt { transition: none !important; }' +
    '}' +
    '</style>';

  var cssInjected = false;
  function ensureLtCss() {
    if (cssInjected) return;
    document.head.insertAdjacentHTML('beforeend', LT_CSS);
    cssInjected = true;
  }

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escHtml(s) { return escAttr(s); }

  /* --------------------------------------------------------------- */
  /* 3. Modal mount + state                                           */
  /* --------------------------------------------------------------- */
  var backdrop = null;
  var pickerState = null; /* { fieldId, fieldLabel, currentValue, tab, query, selectedSlug, externalValue, onSelect } */
  var lastTabKeyByField = {};

  function getLastTabFor(fieldId, defaultTab) {
    if (!fieldId) return defaultTab;
    try {
      var v = localStorage.getItem('tadaify_lt_tab_' + fieldId);
      if (v === 'pages' || v === 'external') return v;
    } catch (e) {}
    return defaultTab;
  }
  function setLastTabFor(fieldId, tab) {
    if (!fieldId) return;
    try { localStorage.setItem('tadaify_lt_tab_' + fieldId, tab); } catch (e) {}
  }

  function ensureMount() {
    ensureLtCss();
    if (backdrop) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="tdf-lt-backdrop" id="tdf-lt-backdrop" role="dialog" aria-modal="true" aria-label="Pick a link target">' +
        '<div class="tdf-lt" id="tdf-lt"></div>' +
      '</div>'
    );
    backdrop = document.getElementById('tdf-lt-backdrop');
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closePicker();
    });
    document.addEventListener('keydown', function (e) {
      if (!backdrop || !backdrop.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closePicker(); }
    });
  }

  function isExternalUrl(v) {
    if (!v) return false;
    return /^https?:\/\//i.test(v) || /^mailto:/i.test(v) || /^tel:/i.test(v);
  }

  function detectInitialTab(currentValue, defaultTab) {
    if (defaultTab === 'pages' || defaultTab === 'external') return defaultTab;
    if (isExternalUrl(currentValue)) return 'external';
    if (currentValue && currentValue.charAt(0) === '/') return 'pages';
    return hasNonHomePages() ? 'pages' : 'external';
  }

  function findSlug(value) {
    if (!value) return null;
    var all = []
      .concat(DIRECTORY.pages)
      .concat(DIRECTORY.blogPosts)
      .concat(DIRECTORY.portfolio)
      .concat(DIRECTORY.paidArticles)
      .concat(DIRECTORY.bookingTypes);
    for (var i = 0; i < all.length; i++) {
      if (all[i].slug === value) return all[i].slug;
    }
    return null;
  }

  /* --------------------------------------------------------------- */
  /* 4. Render                                                        */
  /* --------------------------------------------------------------- */
  function renderModal() {
    var s = pickerState;
    var modal = document.getElementById('tdf-lt');
    if (!modal || !s) return;
    var pagesActive = s.tab === 'pages';
    var canPick = pagesActive ? !!s.selectedSlug : (s.externalValue && !s.externalError);

    modal.innerHTML =
      '<div class="tdf-lt-head">' +
        '<h3><span class="accent">🔗</span> Link target' +
          (s.fieldLabel ? ' <span style="color:var(--fg-muted, #6B7280);font-weight:400;font-size:13px;margin-left:6px">— ' + escHtml(s.fieldLabel) + '</span>' : '') +
        '</h3>' +
        '<button type="button" class="lt-x" aria-label="Close" data-action="close">×</button>' +
      '</div>' +
      '<div class="tdf-lt-tabs" role="tablist">' +
        '<button type="button" role="tab" class="tdf-lt-tab' + (pagesActive ? ' is-active' : '') + '" data-tab="pages" aria-selected="' + (pagesActive ? 'true' : 'false') + '">Pages</button>' +
        '<button type="button" role="tab" class="tdf-lt-tab' + (!pagesActive ? ' is-active' : '') + '" data-tab="external" aria-selected="' + (!pagesActive ? 'true' : 'false') + '">External URL</button>' +
      '</div>' +
      '<div class="tdf-lt-body">' +
        (pagesActive ? renderPagesTab() : renderExternalTab()) +
      '</div>' +
      '<div class="tdf-lt-foot">' +
        '<button type="button" data-action="close">Cancel</button>' +
        '<button type="button" class="is-primary" data-action="apply"' + (canPick ? '' : ' disabled') + '>Use this</button>' +
      '</div>';

    /* Wire actions */
    modal.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-action');
        if (act === 'close') closePicker();
        if (act === 'apply') applyAndClose();
      });
    });
    modal.querySelectorAll('.tdf-lt-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        if (tab !== pickerState.tab) {
          pickerState.tab = tab;
          setLastTabFor(pickerState.fieldId, tab);
          renderModal();
          focusFirstControl();
        }
      });
    });

    if (pagesActive) {
      var search = modal.querySelector('.tdf-lt-search input');
      if (search) {
        search.addEventListener('input', function () {
          pickerState.query = search.value;
          rerenderPagesList();
        });
      }
      modal.querySelectorAll('.tdf-lt-row').forEach(function (row) {
        row.addEventListener('click', function () {
          pickerState.selectedSlug = row.getAttribute('data-slug');
          renderModal();
        });
      });
    } else {
      var inp = modal.querySelector('.tdf-lt-ext input');
      if (inp) {
        inp.addEventListener('input', function () {
          pickerState.externalValue = inp.value.trim();
          pickerState.externalError = validateExternal(pickerState.externalValue);
          var errEl = modal.querySelector('.tdf-lt-ext .err');
          if (errEl) errEl.textContent = pickerState.externalError || '';
          var apply = modal.querySelector('[data-action="apply"]');
          if (apply) {
            if (pickerState.externalValue && !pickerState.externalError) {
              apply.removeAttribute('disabled');
            } else {
              apply.setAttribute('disabled', 'disabled');
            }
          }
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !pickerState.externalError && pickerState.externalValue) {
            e.preventDefault();
            applyAndClose();
          }
        });
      }
    }
  }

  function focusFirstControl() {
    var modal = document.getElementById('tdf-lt');
    if (!modal) return;
    var t = pickerState.tab === 'pages'
      ? modal.querySelector('.tdf-lt-search input')
      : modal.querySelector('.tdf-lt-ext input');
    if (t) {
      try { t.focus(); } catch (e) {}
      if (t.tagName === 'INPUT' && t.type !== 'url') {
        try { t.select && t.select(); } catch (e) {}
      }
    }
  }

  function rerenderPagesList() {
    var modal = document.getElementById('tdf-lt');
    if (!modal) return;
    var listMount = modal.querySelector('[data-lt-pages-list]');
    if (listMount) listMount.innerHTML = renderPagesSections();
    modal.querySelectorAll('.tdf-lt-row').forEach(function (row) {
      row.addEventListener('click', function () {
        pickerState.selectedSlug = row.getAttribute('data-slug');
        renderModal();
      });
    });
  }

  function matchesQuery(item) {
    var q = (pickerState.query || '').trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().indexOf(q) !== -1
        || item.slug.toLowerCase().indexOf(q) !== -1;
  }

  function renderPagesTab() {
    return '' +
      '<div class="tdf-lt-search">' +
        '<span class="ico">🔍</span>' +
        '<input type="search" placeholder="Search your pages, posts, products…" value="' + escAttr(pickerState.query || '') + '" aria-label="Search link targets" />' +
      '</div>' +
      '<div data-lt-pages-list>' + renderPagesSections() + '</div>';
  }

  function renderSection(label, ico, items, emptyMsg) {
    var rows = items.filter(matchesQuery).map(function (it) {
      var sel = (pickerState.selectedSlug != null && pickerState.selectedSlug === it.slug);
      return '<button type="button" class="tdf-lt-row' + (sel ? ' is-selected' : '') + '" data-slug="' + escAttr(it.slug) + '">' +
               '<span class="title">' + escHtml(it.title) + '</span>' +
               '<span class="url">' + escHtml(fullUrl(it.slug)) + '</span>' +
             '</button>';
    }).join('');
    var body = rows || ('<div class="tdf-lt-empty">' + emptyMsg + '</div>');
    return '<div class="tdf-lt-section">' +
             '<div class="tdf-lt-section-h"><span class="ico">' + ico + '</span>' + escHtml(label) + '</div>' +
             body +
           '</div>';
  }

  function renderPagesSections() {
    var html = '';
    html += renderSection('Pages', '📄', DIRECTORY.pages, 'No pages match your search.');
    html += renderSection('Blog posts', '📝', DIRECTORY.blogPosts,
      'No posts yet · <a href="./app-admin-blog.html">Manage in Administration → Blog →</a>');
    html += renderSection('Portfolio projects', '🎨', DIRECTORY.portfolio,
      'No projects yet · <a href="./app-admin-portfolio.html">Manage in Administration → Portfolio →</a>');
    html += renderSection('Paid articles', '💰', DIRECTORY.paidArticles,
      'No paid articles yet · <a href="./app-admin-paid-articles.html">Manage in Administration → Paid articles →</a>');
    html += renderSection('Booking types', '📅', DIRECTORY.bookingTypes,
      'No booking types yet · <a href="./app-page-schedule.html">Set up in Pages → Schedule →</a>');
    return html;
  }

  function renderExternalTab() {
    var v = pickerState.externalValue || '';
    var err = pickerState.externalError || '';
    return '' +
      '<div class="tdf-lt-ext">' +
        '<label for="tdf-lt-ext-input">External URL</label>' +
        '<input id="tdf-lt-ext-input" type="url" placeholder="https://example.com/path" value="' + escAttr(v) + '" autocomplete="off" />' +
        (err ? '<div class="err">' + escHtml(err) + '</div>' : '') +
        '<div class="help">Use https:// for the safest link. mailto: and tel: are also accepted.</div>' +
      '</div>';
  }

  function validateExternal(v) {
    if (!v) return '';
    if (/^javascript:/i.test(v) || /^data:/i.test(v) || /^vbscript:/i.test(v)) {
      return 'That scheme isn\'t allowed for safety reasons.';
    }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(v)) {
      return 'Start with https:// (or mailto:/tel:) so the link works for visitors.';
    }
    return '';
  }

  /* --------------------------------------------------------------- */
  /* 5. Open / close / apply                                          */
  /* --------------------------------------------------------------- */
  function openPicker(opts) {
    if (window !== window.top) return;
    opts = opts || {};
    ensureMount();
    var initialTab = detectInitialTab(opts.currentValue, getLastTabFor(opts.fieldId, opts.defaultTab));
    var matchedSlug = findSlug(opts.currentValue);
    pickerState = {
      fieldId:        opts.fieldId || null,
      fieldLabel:     opts.fieldLabel || '',
      currentValue:   opts.currentValue || '',
      tab:            initialTab,
      query:          '',
      selectedSlug:   initialTab === 'pages' ? matchedSlug : null,
      externalValue:  initialTab === 'external' ? (opts.currentValue || '') : '',
      externalError:  '',
      onSelect:       typeof opts.onSelect === 'function' ? opts.onSelect : null
    };
    if (pickerState.externalValue) {
      pickerState.externalError = validateExternal(pickerState.externalValue);
    }
    renderModal();
    backdrop.classList.add('is-open');
    setTimeout(focusFirstControl, 60);
  }

  function closePicker() {
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    pickerState = null;
  }

  function applyAndClose() {
    if (!pickerState) return;
    var value = '';
    if (pickerState.tab === 'pages') {
      if (pickerState.selectedSlug == null) return;
      value = pickerState.selectedSlug; /* '' for Home, '/about' etc */
    } else {
      if (!pickerState.externalValue || pickerState.externalError) return;
      value = pickerState.externalValue;
    }
    var cb = pickerState.onSelect;
    closePicker();
    if (cb) cb(value);
  }

  /* --------------------------------------------------------------- */
  /* 6. Public API                                                    */
  /* --------------------------------------------------------------- */
  window.LinkTarget = {
    openPicker:   openPicker,
    closePicker:  closePicker,
    /* Helpers exposed for the block editor field renderer */
    isExternalUrl: isExternalUrl,
    fullUrl:       fullUrl,
    findSlug:      findSlug,
    hasNonHomePages: hasNonHomePages,
    /* Test hooks */
    _state:       function () { return pickerState; }
  };
})();

/* =========================================================================
   AutoLink — auto-add home button on new page creation (Fix #6 Sub-feature 6A)

   When a creator creates a NEW page (Blog / About / Portfolio / etc), this
   IIFE injects a friendly banner at the top of the page editor offering to
   add a button on the home page that links to the new page. Click "Add" →
   pushes a Link button block onto the (mocked) home state via localStorage,
   shows a toast, dismisses the banner. Click "Skip" → dismisses + remembers
   per-page-type via localStorage so it doesn't reappear.

   New-page detection: URL query param `?new=1` (or sessionStorage flag
   `tadaify_new_page=<page-type>` set by the "+ Add page" trigger when it
   eventually exists). Page editor pages declare their type via a meta tag
   `<meta name="tadaify-page-type" content="blog">` — when absent, the
   banner stays dormant.

   Anti-recursion: skipped inside iframes (preview pane).
   ========================================================================= */
(function setupAutoLinkPrompt() {
  if (window !== window.top) return;

  /* Per-page-type defaults — copy + icon used for the auto-added Link block */
  var DEFAULTS = {
    'blog':              { copy: 'Read my blog →',           icon: '📝' },
    'about':             { copy: 'About me →',                icon: '👤' },
    'portfolio':         { copy: 'View my portfolio →',       icon: '🎨' },
    'newsletter-signup': { copy: 'Subscribe →',               icon: '✉️' },
    'newsletter':        { copy: 'Subscribe →',               icon: '✉️' },
    'contact':           { copy: 'Get in touch →',            icon: '💬' },
    'faq':               { copy: 'FAQ →',                     icon: '❓' },
    'schedule':          { copy: 'Book a session →',          icon: '📅' },
    'custom':            { copy: null /* uses page title */,  icon: '🔗' },
    'links-archive':     { copy: 'All my links →',            icon: '🗂' },
    'paid-articles':     { copy: 'Read my paid articles →',   icon: '💰' }
    /* 'legal' intentionally omitted — legal goes in footer not body */
  };

  /* Page-type → relative slug used as the link target */
  var SLUG_BY_TYPE = {
    'blog':              '/blog',
    'about':             '/about',
    'portfolio':         '/portfolio',
    'newsletter-signup': '/newsletter',
    'newsletter':        '/newsletter',
    'contact':           '/contact',
    'faq':               '/faq',
    'schedule':          '/schedule',
    'custom':            '/page',
    'links-archive':     '/links',
    'paid-articles':     '/articles'
  };

  function getPageType() {
    var meta = document.querySelector('meta[name="tadaify-page-type"]');
    return meta ? (meta.getAttribute('content') || '').toLowerCase() : '';
  }

  function isNewPage() {
    /* Query param wins; sessionStorage flag is the fallback for a future
       "+ Add page" flow that can't always rewrite the URL. The
       fallback is one-shot: once consumed, we clear it. */
    var qs = (location.search || '').toLowerCase();
    if (/(^|[?&])new=1(&|$)/.test(qs)) return true;
    try {
      var flag = sessionStorage.getItem('tadaify_new_page');
      if (flag && flag.toLowerCase() === getPageType()) {
        sessionStorage.removeItem('tadaify_new_page');
        return true;
      }
    } catch (e) {}
    return false;
  }

  function isDismissed(pageType) {
    try { return !!localStorage.getItem('tadaify_dismissed_homelink_' + pageType); }
    catch (e) { return false; }
  }
  function markDismissed(pageType) {
    try { localStorage.setItem('tadaify_dismissed_homelink_' + pageType, '1'); } catch (e) {}
  }

  /* Mocked home-state push — a real impl would diff against the home
     page's block list in app state. For the mockup we stash the planned
     addition under a localStorage key the home editor can read on next
     load. Idempotent per page-type per session. */
  function pushHomeLinkBlock(pageType, copy, icon) {
    var slug = SLUG_BY_TYPE[pageType] || '/page';
    var pending = [];
    try {
      var raw = localStorage.getItem('tadaify_home_pending_blocks');
      pending = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(pending)) pending = [];
    } catch (e) { pending = []; }
    pending.push({
      type: 'link',
      label: copy,
      icon: icon,
      url: slug,
      target: 'internal',
      added_at: new Date().toISOString(),
      source: 'auto-add-from-' + pageType
    });
    try {
      localStorage.setItem('tadaify_home_pending_blocks', JSON.stringify(pending));
    } catch (e) {}
  }

  function ensureCss() {
    if (document.getElementById('tdf-autolink-css')) return;
    var css = '' +
      '<style id="tdf-autolink-css" data-source="autolink-partial">' +
      '.tdf-autolink-banner {' +
      '  margin: 16px auto; max-width: 720px;' +
      '  border: 1.5px solid var(--brand-primary, #6366F1);' +
      '  background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(245,158,11,0.04));' +
      '  border-radius: 14px; padding: 16px 18px;' +
      '  display: flex; gap: 14px; align-items: flex-start;' +
      '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
      '  box-shadow: 0 4px 12px rgba(99,102,241,0.08);' +
      '}' +
      '.tdf-autolink-banner .al-ico {' +
      '  flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;' +
      '  background: var(--brand-primary, #6366F1); color: #fff;' +
      '  display: inline-flex; align-items: center; justify-content: center;' +
      '  font-size: 18px;' +
      '}' +
      '.tdf-autolink-banner .al-body { flex: 1; min-width: 0; }' +
      '.tdf-autolink-banner h4 {' +
      '  margin: 0 0 4px; font-size: 14px; font-weight: 600;' +
      '  color: var(--fg, #111); letter-spacing: -0.005em;' +
      '}' +
      '.tdf-autolink-banner h4 .sparkle { color: var(--brand-warm, #F59E0B); margin-right: 4px; }' +
      '.tdf-autolink-banner .al-sub {' +
      '  font-size: 12.5px; color: var(--fg-muted, #6B7280); line-height: 1.45;' +
      '  margin: 0 0 10px;' +
      '}' +
      '.tdf-autolink-banner .al-actions {' +
      '  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;' +
      '}' +
      '.tdf-autolink-banner button {' +
      '  font-family: inherit; font-size: 13px; font-weight: 600;' +
      '  padding: 8px 14px; border-radius: 9px; cursor: pointer;' +
      '  border: 1px solid var(--border-strong, rgba(0,0,0,0.16));' +
      '  background: var(--bg-elevated, #fff); color: var(--fg, #111);' +
      '}' +
      '.tdf-autolink-banner button.is-primary {' +
      '  background: var(--brand-primary, #6366F1); color: #fff; border-color: transparent;' +
      '}' +
      '.tdf-autolink-banner button.is-primary:hover { filter: brightness(1.05); }' +
      '.tdf-autolink-banner .al-x {' +
      '  flex-shrink: 0; border: 0; background: transparent; cursor: pointer;' +
      '  width: 28px; height: 28px; border-radius: 7px; padding: 0;' +
      '  color: var(--fg-muted, #6B7280); font-size: 16px; line-height: 1;' +
      '}' +
      '.tdf-autolink-banner .al-x:hover { background: rgba(0,0,0,0.04); color: var(--fg, #111); }' +
      '@media (max-width: 720px) {' +
      '  .tdf-autolink-banner { margin: 12px; }' +
      '}' +
      '</style>';
    document.head.insertAdjacentHTML('beforeend', css);
  }

  function findMountPoint() {
    /* Mount: above the first <main>, .editor-wrap, .container, or just
       below the sidebar. We pick the first reasonable target so the
       banner lands at the top of the visible editor surface. */
    var candidates = [
      'main .container',
      'main',
      '.editor-wrap',
      '.tdf-app-shell',
      '.app-main',
      'body > .container'
    ];
    for (var i = 0; i < candidates.length; i++) {
      var el = document.querySelector(candidates[i]);
      if (el) return el;
    }
    return document.body;
  }

  function showBanner() {
    var pageType = getPageType();
    if (!pageType || !DEFAULTS[pageType]) return;
    if (isDismissed(pageType)) return;
    if (document.getElementById('tdf-autolink-banner')) return;
    ensureCss();

    var def = DEFAULTS[pageType];
    var label = def.copy || (document.title || 'My page').replace(/ — tadaify.*$/, '').replace(/\s+/g, ' ').trim() + ' →';
    var pageTypeLabel = pageType.replace('-', ' ');

    var banner = document.createElement('div');
    banner.className = 'tdf-autolink-banner';
    banner.id = 'tdf-autolink-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Add a home page button for this new page');
    banner.innerHTML =
      '<div class="al-ico" aria-hidden="true">' + def.icon + '</div>' +
      '<div class="al-body">' +
        '<h4><span class="sparkle">✨</span>Add a button on your home page linking to this ' + pageTypeLabel + '?</h4>' +
        '<p class="al-sub">You can always add it later from your home page editor.</p>' +
        '<div class="al-actions">' +
          '<button type="button" class="is-primary" data-al="add">+ Add &ldquo;' + label.replace(/"/g, '&quot;') + '&rdquo; button to home</button>' +
          '<button type="button" data-al="skip">Skip</button>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="al-x" data-al="skip" aria-label="Dismiss">×</button>';

    var mount = findMountPoint();
    if (mount.firstChild) {
      mount.insertBefore(banner, mount.firstChild);
    } else {
      mount.appendChild(banner);
    }

    banner.querySelectorAll('[data-al]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-al');
        if (act === 'add') {
          pushHomeLinkBlock(pageType, label, def.icon);
          if (window.TierGate && typeof window.TierGate.showToast === 'function') {
            window.TierGate.showToast('Added "' + label + '" button to your home page');
          }
        } else {
          markDismissed(pageType);
        }
        banner.remove();
      });
    });
  }

  function init() {
    if (!isNewPage()) return;
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Public hooks for the eventual "+ Add page" trigger to use:
     window.AutoLinkPrompt.markNewPage('blog') — call BEFORE navigating
     to the new page editor; the banner picks it up after load. */
  window.AutoLinkPrompt = {
    markNewPage: function (pageType) {
      try { sessionStorage.setItem('tadaify_new_page', String(pageType || '').toLowerCase()); } catch (e) {}
    },
    forceShow: function () { showBanner(); },
    _defaults: DEFAULTS,
    _slugByType: SLUG_BY_TYPE
  };
})();

/* =========================================================================
   tadaify — Add Page modal (TADA-BUG-006, 2026-04-28)
   Mirrors app-block-picker.html UX: centered modal 720px, search input,
   category chips, grid of page-template cards. Click a card → navigate
   to the corresponding app-page-<type>.html mockup (representing
   "page now added, configure it"). Wired to any element with
   data-action="open-add-page-modal" (typically the "+ Add page" button
   in the sidebar's Pages group). Per feedback_no_right_side_drawers:
   centered modal, NOT a slide-in drawer.
   ========================================================================= */
(function () {
  'use strict';

  var TEMPLATES = [
    /* Content category */
    { id: 'blog',              cat: 'content',  ic: '📝', title: 'Blog',              desc: 'Long-form posts with tags, filtering, RSS.', href: './app-page-blog.html' },
    { id: 'newsletter-signup', cat: 'content',  ic: '✉️', title: 'Newsletter signup', desc: 'Capture emails for Kit / Beehiiv / Mailchimp.', href: './app-page-newsletter-signup.html' },
    { id: 'paid-articles',     cat: 'content',  ic: '🔒', title: 'Paid articles',     desc: 'Single-purchase or subscriber-only articles.', href: './app-page-paid-articles.html' },
    { id: 'portfolio',         cat: 'content',  ic: '🎨', title: 'Portfolio',         desc: 'Project gallery — case studies, photos, work.', href: './app-page-portfolio.html' },

    /* Commerce category */
    { id: 'schedule',          cat: 'commerce', ic: '📅', title: 'Schedule / Booking',desc: 'Bookable time slots with payment + reminders.', href: './app-page-schedule.html' },

    /* About + Info category */
    { id: 'about',             cat: 'about',    ic: '👋', title: 'About',             desc: 'Bio, story, and what you do — long-form intro.', href: './app-page-about.html' },
    { id: 'faq',               cat: 'about',    ic: '❓', title: 'FAQ',               desc: 'Accordion of common questions and answers.', href: './app-page-faq.html' },
    { id: 'contact',           cat: 'about',    ic: '📨', title: 'Contact',           desc: 'Form that emails you (or webhooks on Pro+).', href: './app-page-contact.html' },
    { id: 'legal',             cat: 'about',    ic: '⚖️', title: 'Legal',             desc: 'Terms, privacy, refund policy — pre-filled boilerplate.', href: './app-page-legal.html' },
    { id: 'links-archive',     cat: 'about',    ic: '🗂', title: 'Links archive',     desc: 'Searchable archive of every link you have ever shared.', href: './app-page-links-archive.html' },

    /* Custom — last for emphasis */
    { id: 'custom',            cat: 'custom',   ic: '✨', title: 'Custom page',       desc: 'Blank canvas — compose only with blocks.', href: './app-page-custom.html' }
  ];

  var CATEGORIES = [
    { id: 'all',      label: 'All' },
    { id: 'content',  label: 'Content' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'about',    label: 'About + Info' },
    { id: 'custom',   label: 'Custom' }
  ];

  var CSS = '' +
    '<style data-source="add-page-modal-partial">' +
    '.tdf-addpage-backdrop {' +
    '  position: fixed; inset: 0; z-index: 1200;' +
    '  background: rgba(11,15,30,0.55); backdrop-filter: blur(3px);' +
    '  display: flex; align-items: center; justify-content: center;' +
    '  padding: 16px;' +
    '  opacity: 0; pointer-events: none;' +
    '  transition: opacity .22s ease;' +
    '}' +
    '.tdf-addpage-backdrop.is-open { opacity: 1; pointer-events: auto; }' +
    '.tdf-addpage-modal {' +
    '  background: var(--bg-elevated, #fff);' +
    '  border: 1px solid var(--border, #E5E7EB);' +
    '  border-radius: 18px;' +
    '  box-shadow: var(--shadow-xl, 0 20px 60px rgba(11,15,30,0.25));' +
    '  width: min(820px, 100%);' +
    '  max-height: calc(100vh - 32px);' +
    '  display: flex; flex-direction: column;' +
    '  transform: translateY(8px) scale(0.98);' +
    '  transition: transform .22s cubic-bezier(.22,.61,.36,1);' +
    '  font-family: var(--font-sans, Inter, system-ui, sans-serif);' +
    '}' +
    '.tdf-addpage-backdrop.is-open .tdf-addpage-modal { transform: translateY(0) scale(1); }' +
    '@media (max-width: 720px) {' +
    '  .tdf-addpage-backdrop { padding: 0; align-items: stretch; }' +
    '  .tdf-addpage-modal { border-radius: 0; max-height: 100vh; height: 100vh; width: 100vw; }' +
    '}' +
    '.tdf-addpage-head { padding: 18px 22px; border-bottom: 1px solid var(--border, #E5E7EB); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }' +
    '.tdf-addpage-head h2 { font-family: var(--font-display, inherit); font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0; flex-shrink: 0; }' +
    '.tdf-addpage-search-wrap { flex: 1; min-width: 200px; position: relative; }' +
    '.tdf-addpage-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--fg-subtle, #9CA3AF); }' +
    '.tdf-addpage-search { width: 100%; padding: 9px 12px 9px 36px; font-size: 13.5px; border: 1px solid var(--border-strong, #D1D5DB); border-radius: 99px; background: var(--bg, #fff); color: var(--fg, #111827); font-family: inherit; outline: none; transition: border .14s, box-shadow .14s; }' +
    '.tdf-addpage-search:focus { border-color: var(--border-focus, #6366F1); box-shadow: 0 0 0 3px rgba(99,102,241,0.14); }' +
    '.tdf-addpage-close { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: transparent; border: 0; color: var(--fg-muted, #6B7280); cursor: pointer; flex-shrink: 0; }' +
    '.tdf-addpage-close:hover { background: var(--bg-muted, #F3F4F6); color: var(--fg, #111827); }' +
    '.tdf-addpage-cats { display: flex; gap: 6px; padding: 12px 22px 0; border-bottom: 1px solid var(--border, #E5E7EB); overflow-x: auto; flex-shrink: 0; }' +
    '.tdf-addpage-cat { padding: 8px 14px; border: 0; background: transparent; font-size: 13px; font-weight: 600; color: var(--fg-muted, #6B7280); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; margin-bottom: -1px; transition: color .12s, border-color .12s; font-family: inherit; }' +
    '.tdf-addpage-cat:hover { color: var(--fg, #111827); }' +
    '.tdf-addpage-cat.is-active { color: var(--brand-primary, #6366F1); border-bottom-color: var(--brand-primary, #6366F1); }' +
    '.tdf-addpage-body { flex: 1; overflow-y: auto; padding: 18px 22px; }' +
    '.tdf-addpage-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }' +
    '@media (max-width: 760px) { .tdf-addpage-grid { grid-template-columns: repeat(2, 1fr); } }' +
    '@media (max-width: 460px) { .tdf-addpage-grid { grid-template-columns: 1fr; } }' +
    '.tdf-addpage-card { position: relative; background: var(--bg, #fff); border: 1.5px solid var(--border, #E5E7EB); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; text-align: left; color: inherit; text-decoration: none; transition: border .12s, transform .12s, box-shadow .12s; }' +
    '.tdf-addpage-card:hover { border-color: var(--brand-primary, #6366F1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.15); }' +
    '.tdf-addpage-card .ic { width: 40px; height: 40px; border-radius: 10px; background: rgba(99,102,241,0.12); display: flex; align-items: center; justify-content: center; font-size: 20px; }' +
    '.tdf-addpage-card[data-cat="commerce"] .ic { background: rgba(245,158,11,0.16); }' +
    '.tdf-addpage-card[data-cat="about"]    .ic { background: rgba(16,185,129,0.16); }' +
    '.tdf-addpage-card[data-cat="custom"]   .ic { background: rgba(139,92,246,0.16); }' +
    '.tdf-addpage-card .ttl { font-size: 14px; font-weight: 600; color: var(--fg, #111827); }' +
    '.tdf-addpage-card .desc { font-size: 12.5px; color: var(--fg-muted, #6B7280); line-height: 1.45; }' +
    '.tdf-addpage-empty { grid-column: 1 / -1; padding: 32px 16px; text-align: center; color: var(--fg-muted, #6B7280); font-size: 13px; background: var(--bg-muted, #F3F4F6); border-radius: 12px; border: 1px dashed var(--border-strong, #D1D5DB); }' +
    '.tdf-addpage-foot { padding: 14px 22px; border-top: 1px solid var(--border, #E5E7EB); font-size: 12px; color: var(--fg-muted, #6B7280); flex-shrink: 0; }' +
    'body.dark-mode .tdf-addpage-modal { background: #141A2D; border-color: #1F2937; }' +
    'body.dark-mode .tdf-addpage-head, body.dark-mode .tdf-addpage-cats, body.dark-mode .tdf-addpage-foot { border-color: #1F2937; }' +
    'body.dark-mode .tdf-addpage-search { background: #0B0F1E; color: #F3F4F6; border-color: #1F2937; }' +
    'body.dark-mode .tdf-addpage-card { background: #0B0F1E; border-color: #1F2937; }' +
    'body.dark-mode .tdf-addpage-card .ttl { color: #F3F4F6; }' +
    'body.dark-mode .tdf-addpage-empty { background: #1F2937; border-color: #374151; color: #9CA3AF; }' +
    '@media (prefers-reduced-motion: reduce) { .tdf-addpage-backdrop, .tdf-addpage-modal { transition: none !important; } }' +
    '</style>';

  var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var CLOSE_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var modalEl, gridEl, searchEl, currentCat = 'all', currentQuery = '';

  function buildModal() {
    if (modalEl) return modalEl;
    if (!document.head.querySelector('style[data-source="add-page-modal-partial"]')) {
      var wrap = document.createElement('div');
      wrap.innerHTML = CSS;
      document.head.appendChild(wrap.querySelector('style'));
    }
    var backdrop = document.createElement('div');
    backdrop.className = 'tdf-addpage-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'tdf-addpage-h');
    backdrop.innerHTML =
      '<div class="tdf-addpage-modal" role="document">' +
        '<header class="tdf-addpage-head">' +
          '<h2 id="tdf-addpage-h">Add a page</h2>' +
          '<div class="tdf-addpage-search-wrap">' +
            SEARCH_SVG +
            '<input type="text" class="tdf-addpage-search" placeholder="Find a page template…" autocomplete="off"/>' +
          '</div>' +
          '<button type="button" class="tdf-addpage-close" aria-label="Close (Esc)" title="Close (Esc)">' + CLOSE_SVG + '</button>' +
        '</header>' +
        '<nav class="tdf-addpage-cats" role="tablist" aria-label="Page template categories">' +
          CATEGORIES.map(function (c) {
            return '<button type="button" class="tdf-addpage-cat' + (c.id === 'all' ? ' is-active' : '') + '" data-cat="' + c.id + '" role="tab">' + c.label + '</button>';
          }).join('') +
        '</nav>' +
        '<div class="tdf-addpage-body">' +
          '<div class="tdf-addpage-grid" role="list"></div>' +
        '</div>' +
        '<footer class="tdf-addpage-foot">Tip: every page can be themed individually after creation. You can rename / reorder them anytime.</footer>' +
      '</div>';

    document.body.appendChild(backdrop);
    modalEl  = backdrop;
    gridEl   = backdrop.querySelector('.tdf-addpage-grid');
    searchEl = backdrop.querySelector('.tdf-addpage-search');

    /* Wire close + backdrop click */
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    backdrop.querySelector('.tdf-addpage-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
    });

    /* Wire category tabs */
    backdrop.querySelectorAll('.tdf-addpage-cat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        backdrop.querySelectorAll('.tdf-addpage-cat').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentCat = btn.getAttribute('data-cat');
        renderGrid();
      });
    });

    /* Wire search */
    searchEl.addEventListener('input', function (e) {
      currentQuery = (e.target.value || '').toLowerCase().trim();
      renderGrid();
    });

    renderGrid();
    return modalEl;
  }

  function renderGrid() {
    var filtered = TEMPLATES.filter(function (t) {
      if (currentCat !== 'all' && t.cat !== currentCat) return false;
      if (currentQuery) {
        var hay = (t.title + ' ' + t.desc + ' ' + t.id).toLowerCase();
        if (hay.indexOf(currentQuery) === -1) return false;
      }
      return true;
    });
    if (!filtered.length) {
      gridEl.innerHTML = '<div class="tdf-addpage-empty">No page templates match your search.</div>';
      return;
    }
    gridEl.innerHTML = filtered.map(function (t) {
      return '' +
        '<a class="tdf-addpage-card" data-cat="' + t.cat + '" href="' + t.href + '" role="listitem">' +
          '<div class="ic" aria-hidden="true">' + t.ic + '</div>' +
          '<div class="ttl">' + t.title + '</div>' +
          '<div class="desc">' + t.desc + '</div>' +
        '</a>';
    }).join('');
  }

  function open() {
    buildModal();
    modalEl.classList.add('is-open');
    setTimeout(function () { if (searchEl) searchEl.focus(); }, 80);
  }
  function close() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    if (searchEl) { searchEl.value = ''; currentQuery = ''; }
    var firstCat = modalEl.querySelector('.tdf-addpage-cat[data-cat="all"]');
    if (firstCat) {
      modalEl.querySelectorAll('.tdf-addpage-cat').forEach(function (b) { b.classList.remove('is-active'); });
      firstCat.classList.add('is-active');
      currentCat = 'all';
    }
    renderGrid();
  }

  /* Global delegated click handler — works across sidebar / inline mocks. */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-action="open-add-page-modal"]');
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    open();
  });

  window.AddPageModal = { open: open, close: close, _templates: TEMPLATES };
})();
