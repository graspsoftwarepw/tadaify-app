/* =========================================================================
   tadaify — onboarding preview pane (Slice C revision 2026-04-29)

   Reusable 3-viewport preview pane for onboarding-* screens.
   Mirrors the page-editor preview pattern (memory:
   feedback_tadaify_page_editor_preview_pane.md) and obeys
   feedback_tadaify_three_viewport_support.md (tablet is its own tier).

   Usage in any onboarding-*.html:
     <aside data-onboarding-preview
            data-render="social|profile|template|complete"
            data-handle="alexandra"></aside>
     <script src="./shared/onboarding-preview-pane.js"></script>

   Then call window.tdfPreview.update({ ...state }) whenever the form changes.

   Preview iframe is built from a srcdoc string — no extra files required.
   Light/dark toggle on pane top-bar is independent (kept linked to host
   page via prefers-color-scheme inheritance).
   ========================================================================= */
(function () {
  'use strict';

  var PLATFORM_META = {
    instagram: { label: 'Instagram', icon: 'IG', bg: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)' },
    tiktok:    { label: 'TikTok',    icon: 'TT', bg: '#010101' },
    youtube:   { label: 'YouTube',   icon: 'YT', bg: '#FF0000' },
    x:         { label: 'X',         icon: 'X',  bg: '#000000' },
    twitch:    { label: 'Twitch',    icon: 'TW', bg: '#9146FF' },
    spotify:   { label: 'Spotify',   icon: 'SP', bg: '#1DB954' },
    linkedin:  { label: 'LinkedIn',  icon: 'in', bg: '#0A66C2' },
    pinterest: { label: 'Pinterest', icon: 'PT', bg: '#E60023' },
    threads:   { label: 'Threads',   icon: '@',  bg: '#000000' },
    facebook:  { label: 'Facebook',  icon: 'FB', bg: '#1877F2' }
  };

  var TEMPLATES = {
    chopin:    { bg: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)', fg: '#FFFFFF', mute: 'rgba(255,255,255,0.78)', card: 'rgba(255,255,255,0.16)', font: '"Crimson Pro", serif' },
    neon:      { bg: 'linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)', fg: '#FFFFFF', mute: 'rgba(255,255,255,0.85)', card: 'rgba(0,0,0,0.18)',     font: '"Inter", sans-serif' },
    minimal:   { bg: '#FFFFFF',                                          fg: '#111827', mute: '#6B7280',                  card: '#F3F4F6',               font: '"Inter", sans-serif' },
    nightfall: { bg: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 100%)',  fg: '#FFFFFF', mute: 'rgba(255,255,255,0.72)',   card: 'rgba(255,255,255,0.10)',font: '"Crimson Pro", serif' },
    sunrise:   { bg: 'linear-gradient(135deg,#FFE0B2 0%,#FFAB91 100%)',  fg: '#1F2937', mute: 'rgba(31,41,55,0.65)',      card: 'rgba(255,255,255,0.55)',font: '"Inter", sans-serif' },
    custom:    { bg: '#F9FAFB',                                          fg: '#111827', mute: '#6B7280',                  card: '#FFFFFF',               font: '"Inter", sans-serif' }
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function initialsFor(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'YOU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderSocialIcons(platforms, fg) {
    if (!platforms || !platforms.length) return '';
    var icons = platforms.slice(0, 6).map(function (p) {
      var meta = PLATFORM_META[p] || { icon: '?', bg: '#6B7280', label: p };
      return (
        '<span class="sicon" title="' + escapeHtml(meta.label) + '" ' +
        'style="background:' + meta.bg + ';">' + escapeHtml(meta.icon) + '</span>'
      );
    }).join('');
    return '<div class="social-row" style="color:' + fg + ';">' + icons + '</div>';
  }

  function renderAvatar(state) {
    var size = 64;
    var fg = state.t.fg;
    if (state.avatarUrl) {
      return (
        '<img alt="" src="' + escapeHtml(state.avatarUrl) + '" ' +
        'style="width:' + size + 'px;height:' + size + 'px;border-radius:999px;object-fit:cover;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.18);"/>'
      );
    }
    return (
      '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:999px;' +
      'background:rgba(99,102,241,0.85);color:#fff;display:flex;align-items:center;justify-content:center;' +
      'font-weight:700;font-family:Inter,sans-serif;font-size:22px;letter-spacing:0.04em;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.18);">' + escapeHtml(initialsFor(state.displayName || state.handle)) +
      '</div>'
    );
  }

  function renderPreviewSrcdoc(state, viewport) {
    var t = state.t = TEMPLATES[state.template] || TEMPLATES.chopin;
    var width = viewport === 'desktop' ? 720 : viewport === 'tablet' ? 768 : 390;
    var pad = viewport === 'mobile' ? 18 : 28;
    var avatar = renderAvatar(state);
    var name = escapeHtml(state.displayName || ('@' + (state.handle || 'yourname')));
    var bio = state.bio ? escapeHtml(state.bio) : '';
    var socials = renderSocialIcons(state.platforms, t.fg);

    var body = '';
    body += avatar;
    body += '<h1 style="font-family:' + t.font + ';font-weight:700;font-size:' +
            (viewport === 'mobile' ? 22 : 26) + 'px;margin:14px 0 4px;color:' + t.fg + ';">' + name + '</h1>';
    if (bio) {
      body += '<p style="margin:0 0 12px;color:' + t.mute + ';font-size:13px;line-height:1.5;max-width:340px;">' +
              bio + '</p>';
    }
    if (socials) body += socials;

    // Link cards (depends on render type)
    if (state.render === 'template' || state.render === 'complete') {
      body += '<div class="links" style="margin-top:18px;display:flex;flex-direction:column;gap:10px;width:100%;max-width:360px;">';
      body += '<div class="lk" style="background:' + t.card + ';color:' + t.fg + ';">→ Latest workout plan</div>';
      body += '<div class="lk" style="background:' + t.card + ';color:' + t.fg + ';">→ Free 7-day starter guide</div>';
      body += '<div class="lk" style="background:' + t.card + ';color:' + t.fg + ';">→ My favourite gear</div>';
      body += '</div>';
    } else if (state.render === 'profile' || state.render === 'social') {
      body += '<div class="links empty" style="margin-top:18px;width:100%;max-width:360px;">' +
              '<div class="lk-empty" style="background:' + t.card + ';color:' + t.mute + ';">+ Add your first link</div>' +
              '</div>';
    }

    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"/>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
      '<style>' +
      '*{box-sizing:border-box}' +
      'html,body{margin:0;padding:0;background:transparent;}' +
      /* width:100% — body fills the iframe width at any viewport size.
         The iframe container (tdf-pp-frame[data-vp="..."]) controls the visual
         width (min(100%,720px) / 520px / 300px); body must not overflow it. */
      '.page{min-height:100vh;background:' + (typeof t.bg === 'string' ? t.bg : t.bg) + ';' +
      'padding:' + pad + 'px;display:flex;flex-direction:column;align-items:center;text-align:center;' +
      'font-family:Inter,system-ui,sans-serif;width:100%;}' +
      '.lk,.lk-empty{padding:11px 14px;border-radius:12px;font-weight:600;font-size:13px;text-align:left;' +
      'border:1px solid rgba(255,255,255,0.12);}' +
      '.lk-empty{border-style:dashed;font-weight:500;}' +
      '.social-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:6px;}' +
      '.sicon{width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;' +
      'font-size:11px;font-weight:700;color:#fff;letter-spacing:0;}' +
      '</style></head><body><div class="page">' + body + '</div></body></html>'
    );
  }

  // --- SVG viewport icons (match canonical injectPagePreviewPane in partials.js) ---
  var ICON_DESKTOP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
  var ICON_TABLET  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>';
  var ICON_MOBILE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>';

  // --- Preview pane DOM scaffolding -----------------------------------------
  var PANE_CSS = (
    '.tdf-pp{position:sticky;top:24px;display:flex;flex-direction:column;gap:0;' +
      'background:var(--bg-elevated,#fff);border:1px solid var(--border,#E5E7EB);' +
      'border-radius:18px;overflow:hidden;box-shadow:0 12px 30px -18px rgba(15,23,42,0.18);}' +
    '.tdf-pp-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;' +
      'padding:10px 14px;border-bottom:1px solid var(--border,#E5E7EB);}' +
    '.tdf-pp-title{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;' +
      'color:var(--fg-muted,#4B5563);}' +
    '.tdf-pp-segment{display:inline-flex;background:var(--bg-sunken,#F3F4F6);border-radius:8px;padding:2px;gap:1px;}' +
    '.tdf-pp-segment button{appearance:none;background:transparent;border:0;padding:5px 8px;font:inherit;' +
      'color:var(--fg-muted,#4B5563);cursor:pointer;border-radius:6px;display:inline-flex;align-items:center;line-height:1;}' +
    '.tdf-pp-segment button.active{background:#fff;color:var(--brand-primary,#6366F1);box-shadow:0 1px 4px rgba(15,23,42,0.08);}' +
    '.tdf-pp-theme{appearance:none;background:transparent;border:1px solid var(--border,#E5E7EB);border-radius:99px;' +
      'padding:5px 10px;font-size:12px;font-weight:600;color:var(--fg-muted,#4B5563);cursor:pointer;}' +
    '.tdf-pp-stage{background:repeating-linear-gradient(45deg,#F9FAFB,#F9FAFB 8px,#F3F4F6 8px,#F3F4F6 16px);' +
      'padding:14px;display:flex;justify-content:center;align-items:flex-start;min-height:480px;}' +
    '.tdf-pp[data-theme="dark"] .tdf-pp-stage{background:repeating-linear-gradient(45deg,#0F172A,#0F172A 8px,#1E293B 8px,#1E293B 16px);}' +
    '.tdf-pp-frame{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(15,23,42,0.08);' +
      'box-shadow:0 18px 40px -20px rgba(15,23,42,0.32);transition:width .25s ease;}' +
    '.tdf-pp-frame iframe{display:block;border:0;width:100%;height:560px;}' +
    '.tdf-pp-frame[data-vp="desktop"]{width:min(100%,720px);}' +
    '.tdf-pp-frame[data-vp="tablet"]{width:min(100%,520px);}' +
    '.tdf-pp-frame[data-vp="mobile"]{width:300px;}' +
    '.tdf-pp-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;' +
      'padding:8px 14px;border-top:1px solid var(--border,#E5E7EB);}' +
    '.tdf-pp-update{display:inline-flex;align-items:center;gap:5px;font-size:11px;' +
      'color:var(--fg-subtle,#6B7280);font-weight:500;}' +
    '.tdf-pp-dot{width:6px;height:6px;border-radius:50%;background:#22C55E;flex-shrink:0;' +
      'box-shadow:0 0 0 0 rgba(34,197,94,.4);animation:tdf-pulse 2s ease-in-out infinite;}' +
    '@keyframes tdf-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}' +
    '@media (max-width:959px){' +
      '.tdf-pp{position:static;}' +
      '.tdf-pp-stage{min-height:380px;}' +
      '.tdf-pp-frame iframe{height:460px;}' +
    '}'
  );

  function ensureCss() {
    if (document.getElementById('tdf-pp-style')) return;
    var s = document.createElement('style');
    s.id = 'tdf-pp-style';
    s.textContent = PANE_CSS;
    document.head.appendChild(s);
  }

  function buildPane(host, opts) {
    var render = opts.render || host.getAttribute('data-render') || 'profile';
    host.classList.add('tdf-pp');
    host.setAttribute('data-theme', 'light');
    host.innerHTML = (
      '<div class="tdf-pp-head">' +
        '<div class="tdf-pp-title">Live preview · /public</div>' +
        '<div class="tdf-pp-segment" role="tablist" aria-label="Viewport">' +
          '<button type="button" data-vp="desktop" title="Desktop" aria-label="Desktop">' + ICON_DESKTOP + '</button>' +
          '<button type="button" data-vp="tablet" title="Tablet" aria-label="Tablet">' + ICON_TABLET + '</button>' +
          '<button type="button" data-vp="mobile" class="active" title="Mobile" aria-label="Mobile">' + ICON_MOBILE + '</button>' +
        '</div>' +
        '<button type="button" class="tdf-pp-theme" data-theme-toggle>Light</button>' +
      '</div>' +
      '<div class="tdf-pp-stage">' +
        '<div class="tdf-pp-frame" data-vp="mobile">' +
          '<iframe title="Live preview of your tadaify page"></iframe>' +
        '</div>' +
      '</div>' +
      '<div class="tdf-pp-foot">' +
        '<span class="tdf-pp-update"><span class="tdf-pp-dot"></span> Live · updates as you edit</span>' +
        '<span style="font-size:11px;color:var(--fg-subtle,#6B7280);" data-vp-label>Mobile · 390 × 844</span>' +
      '</div>'
    );

    var frame = host.querySelector('.tdf-pp-frame');
    var iframe = host.querySelector('iframe');
    var label = host.querySelector('[data-vp-label]');
    var themeBtn = host.querySelector('[data-theme-toggle]');

    var state = {
      render: render,
      handle: host.getAttribute('data-handle') || 'yourname',
      displayName: '',
      bio: '',
      avatarUrl: '',
      platforms: (host.getAttribute('data-platforms') || '').split(',').filter(Boolean),
      template: host.getAttribute('data-template') || 'chopin',
      viewport: 'mobile',
      theme: 'light'
    };

    function rerender() {
      var doc = renderPreviewSrcdoc(state, state.viewport);
      iframe.srcdoc = doc;
      frame.setAttribute('data-vp', state.viewport);
      var labels = {
        desktop: 'Desktop · 1280+ wide',
        tablet:  'Tablet · 768 × 1024',
        mobile:  'Mobile · 390 × 844'
      };
      if (label) label.textContent = labels[state.viewport];
    }

    host.querySelectorAll('.tdf-pp-segment button[data-vp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        host.querySelectorAll('.tdf-pp-segment button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.viewport = btn.getAttribute('data-vp');
        rerender();
      });
    });

    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        host.setAttribute('data-theme', state.theme);
        themeBtn.textContent = state.theme === 'light' ? 'Light' : 'Dark';
      });
    }

    rerender();

    return {
      host: host,
      state: state,
      update: function (patch) {
        if (!patch) return;
        Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
        rerender();
      }
    };
  }

  function init() {
    ensureCss();
    var hosts = document.querySelectorAll('[data-onboarding-preview]');
    var instances = [];
    hosts.forEach(function (h) { instances.push(buildPane(h, {})); });
    window.tdfPreview = instances.length === 1 ? instances[0] : {
      list: instances,
      update: function (p) { instances.forEach(function (i) { i.update(p); }); }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
