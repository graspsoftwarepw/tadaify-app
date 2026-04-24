/* =========================================================================
   tadaify — shared partials injector
   Renders nav + footer into pages that declare <div data-partial="nav"></div>
   and <div data-partial="footer"></div>. Keeps every page DRY.
   Must run BEFORE tokens.js so logo orbs get registered + animated.
   ========================================================================= */

(function () {
  'use strict';

  var NAV = '' +
    '<nav class="nav">' +
      '<div class="container nav-inner">' +
        '<a href="./landing.html" class="nav-brand">' +
          '<span class="logo-mark" data-logo style="width:32px;height:32px"></span>' +
          '<span class="wordmark wordmark-sm">' +
            '<span class="wm-ta">ta</span><span class="wm-hyphen">-</span><span class="wm-da">da!</span><span class="wm-ify">ify</span>' +
          '</span>' +
        '</a>' +
        '<div class="nav-links">' +
          '<a href="./landing.html">Home</a>' +
          '<a href="./pricing.html">Pricing</a>' +
          '<a href="./landing.html#templates">Templates</a>' +
          '<a href="./landing.html#trust">Trust</a>' +
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
            '<span class="wm-ta">ta</span><span class="wm-hyphen">-</span><span class="wm-da">da!</span><span class="wm-ify">ify</span>' +
          '</span>' +
          '<span class="text-subtle text-sm hide-mobile">— Turn your bio link into your best first impression.</span>' +
        '</div>' +
        '<div class="flex items-center flex-wrap gap-2">' +
          '<a href="#">Trust Center</a>' +
          '<a href="#">Privacy</a>' +
          '<a href="#">Terms</a>' +
          '<a href="#">Jobs</a>' +
          '<a href="#">Ask AI about tadaify ↗</a>' +
        '</div>' +
      '</div>' +
    '</footer>';

  document.querySelectorAll('[data-partial="nav"]').forEach(function (el) { el.outerHTML = NAV; });
  document.querySelectorAll('[data-partial="footer"]').forEach(function (el) { el.outerHTML = FOOTER; });
})();
