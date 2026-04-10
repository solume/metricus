/*
 * Metricus scroll-cta.js — slide-in CTA at 60% scroll depth.
 *
 * Shows a bottom-right card when the visitor has scrolled past 60% of
 * the page. Shown at most once per page load. Hidden on mobile (< 768px)
 * to avoid being intrusive.
 *
 * Content defaults:
 *   "Find out what AI is getting wrong about your brand."
 *   Button: "Get Your Report" -> /get-report/
 *
 * Override via data attributes on <body> or a parent element:
 *   data-scroll-cta-headline="..."
 *   data-scroll-cta-body="..."
 *   data-scroll-cta-button-text="..."
 *   data-scroll-cta-button-url="..."
 *   data-scroll-cta-lead-magnet="playbook"  (shows email form instead)
 *
 * Usage:
 *   <script src="/js/scroll-cta.js" defer></script>
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */

  var SCROLL_TRIGGER = 0.60;          /* 60% of document height */
  var CTA_ID = 'metricus-scroll-cta';

  var DEFAULT_HEADLINE = 'Find out what AI is getting wrong about your brand.';
  var DEFAULT_BUTTON_TEXT = 'Get Your Report \u2192';
  var DEFAULT_BUTTON_URL = '/get-report/';

  /* ------------------------------------------------------------------ */
  /*  Guards                                                             */
  /* ------------------------------------------------------------------ */

  /** Don't show on mobile — too intrusive. */
  function isMobile() {
    return window.innerWidth < 768;
  }

  /* ------------------------------------------------------------------ */
  /*  Read optional overrides from data attributes                      */
  /* ------------------------------------------------------------------ */

  function getConfig() {
    /* Check <body>, then any element with [data-scroll-cta-lead-magnet]. */
    var src = document.body;
    var custom = document.querySelector('[data-scroll-cta-lead-magnet]') ||
                 document.querySelector('[data-scroll-cta-headline]');
    if (custom) src = custom;

    return {
      headline:    src.dataset.scrollCtaHeadline   || DEFAULT_HEADLINE,
      body:        src.dataset.scrollCtaBody       || '',
      buttonText:  src.dataset.scrollCtaButtonText || DEFAULT_BUTTON_TEXT,
      buttonUrl:   src.dataset.scrollCtaButtonUrl  || DEFAULT_BUTTON_URL,
      leadMagnet:  src.dataset.scrollCtaLeadMagnet || ''
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Build the CTA card                                                */
  /* ------------------------------------------------------------------ */

  function buildCTA(cfg) {
    var card = document.createElement('div');
    card.id = CTA_ID;
    card.setAttribute('role', 'complementary');
    card.setAttribute('aria-label', 'Call to action');

    /* Positioning + slide-in animation via inline styles.
       Tailwind classes used for colors / typography to match the site. */
    card.className = [
      'fixed z-[90] bg-white border border-outline-variant/30 shadow-2xl',
      'w-[340px] max-w-[calc(100vw-2rem)]'
    ].join(' ');
    card.style.cssText = [
      'bottom:1.5rem;right:1.5rem;',
      'transform:translateY(120%);',
      'transition:transform 400ms cubic-bezier(0.22,1,0.36,1);',
      'font-family:Inter,sans-serif;',
      'opacity:0;'
    ].join('');

    var inner = '';

    /* Close button */
    inner += '<button type="button" data-scroll-cta-close aria-label="Close"' +
             ' class="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface transition-colors"' +
             ' style="background:none;border:none;cursor:pointer;padding:4px;line-height:1;">' +
             '<span class="material-symbols-outlined" style="font-size:18px;">close</span>' +
             '</button>';

    inner += '<div class="p-6">';

    /* Headline */
    inner += '<p class="font-headline italic text-lg text-slate-text leading-snug mb-3 pr-6"' +
             ' style="font-family:Newsreader,serif;color:#0F172A;">' +
             escapeHTML(cfg.headline) + '</p>';

    /* Optional body text */
    if (cfg.body) {
      inner += '<p class="text-sm text-slate-muted leading-relaxed mb-4" style="color:#64748B;">' +
               escapeHTML(cfg.body) + '</p>';
    }

    if (cfg.leadMagnet) {
      /* Lead-magnet mode: show an email form (handled by email-gate.js). */
      inner += '<form class="email-gate-form" data-lead-magnet="' + escapeAttr(cfg.leadMagnet) + '">';
      inner += '  <input type="email" name="email" required' +
               '    placeholder="Work email" autocomplete="email"' +
               '    class="w-full border border-outline-variant/50 bg-white text-on-surface text-sm' +
               '           px-3 py-2.5 mb-2 outline-none focus:border-primary transition-colors"' +
               '    style="font-family:Inter,sans-serif;">';
      inner += '  <button type="submit"' +
               '    class="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary' +
               '           text-sm font-semibold px-5 py-2.5 hover:bg-primary-dim transition-colors">' +
               escapeHTML(cfg.buttonText) +
               '  </button>';
      inner += '</form>';
    } else {
      /* Default mode: simple link button. */
      inner += '<a href="' + escapeAttr(cfg.buttonUrl) + '"' +
               '  class="inline-flex items-center justify-center gap-2 bg-primary text-on-primary' +
               '         text-sm font-semibold px-5 py-2.5 hover:bg-primary-dim transition-colors">' +
               escapeHTML(cfg.buttonText) +
               '</a>';
    }

    inner += '</div>';

    card.innerHTML = inner;
    document.body.appendChild(card);
    return card;
  }

  /* ------------------------------------------------------------------ */
  /*  Utility                                                           */
  /* ------------------------------------------------------------------ */

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
              .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------------------ */
  /*  Show / hide                                                       */
  /* ------------------------------------------------------------------ */

  var ctaEl = null;
  var shown = false;

  function showCTA() {
    if (shown || isMobile()) return;
    shown = true;

    var cfg = getConfig();
    ctaEl = buildCTA(cfg);

    /* Trigger slide-in on next frame so the transition animates. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (ctaEl) {
          ctaEl.style.transform = 'translateY(0)';
          ctaEl.style.opacity = '1';
        }
      });
    });
  }

  function hideCTA() {
    if (!ctaEl) return;
    ctaEl.style.transform = 'translateY(120%)';
    ctaEl.style.opacity = '0';

    /* Remove from DOM after animation. */
    var el = ctaEl;
    ctaEl = null;
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 450);
  }

  /* ------------------------------------------------------------------ */
  /*  Scroll listener                                                   */
  /* ------------------------------------------------------------------ */

  function onScroll() {
    if (shown) return; /* fire once */

    var scrollTop = window.scrollY || window.pageYOffset || 0;
    var docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    var winHeight = window.innerHeight || document.documentElement.clientHeight;
    var scrollable = docHeight - winHeight;

    if (scrollable <= 0) return; /* page too short to trigger */

    var pct = scrollTop / scrollable;
    if (pct >= SCROLL_TRIGGER) {
      showCTA();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Close handler                                                     */
  /* ------------------------------------------------------------------ */

  function attachCloseHandler() {
    document.addEventListener('click', function (e) {
      if (!ctaEl) return;
      if (e.target.closest && e.target.closest('[data-scroll-cta-close]')) {
        hideCTA();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init() {
    if (isMobile()) return;

    attachCloseHandler();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Check immediately in case the page loaded mid-scroll. */
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
