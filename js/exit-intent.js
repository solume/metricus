/*
 * Metricus exit-intent.js — exit-intent popup for blog posts.
 *
 * Offers the AI Visibility Playbook PDF when the visitor shows exit intent.
 *
 * Desktop trigger: mouse moves above the viewport (clientY < 10).
 * Mobile trigger:  rapid upward scroll OR 45+ seconds on page.
 *
 * The popup is shown at most ONCE per session (sessionStorage flag).
 * It is never shown if the visitor already has metricus_email in localStorage
 * (i.e., they already gave us their email through any gate).
 *
 * The form inside the popup uses class "email-gate-form" so email-gate.js
 * handles submission, storage, Worker POST, and GA4 events automatically.
 *
 * Usage:
 *   <script src="/js/exit-intent.js" defer></script>
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */

  var SESSION_FLAG = 'exitPopupShown';
  var STORAGE_KEY = 'metricus_email';
  var MOBILE_TIMER_MS = 45000;        /* 45 seconds on page */
  var SCROLL_UP_THRESHOLD = -300;     /* px of rapid upward scroll */
  var POPUP_ID = 'metricus-exit-popup';

  /* ------------------------------------------------------------------ */
  /*  Guards                                                             */
  /* ------------------------------------------------------------------ */

  function shouldSuppress() {
    /* Already shown this session. */
    try { if (sessionStorage.getItem(SESSION_FLAG)) return true; }
    catch (e) { /* private browsing */ }

    /* Visitor already known — no need to gate. */
    try { if (localStorage.getItem(STORAGE_KEY)) return true; }
    catch (e) {}

    return false;
  }

  function markShown() {
    try { sessionStorage.setItem(SESSION_FLAG, '1'); }
    catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /*  Popup HTML (injected once, then shown/hidden)                     */
  /* ------------------------------------------------------------------ */

  function buildPopup() {
    var overlay = document.createElement('div');
    overlay.id = POPUP_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Download the AI Visibility Playbook');

    /* Tailwind classes matching the site's design system:
       - 0px border-radius (all radii are 0 in the theme)
       - primary: #515F74, on-primary: #f6f7ff
       - Newsreader serif for headlines, Inter for body
       - Surface palette for card background                         */
    overlay.className = [
      'fixed inset-0 z-[100] flex items-center justify-center',
      'p-4'
    ].join(' ');
    overlay.style.cssText = 'background:rgba(0,0,0,0.5);display:none;';

    overlay.innerHTML = [
      '<div class="relative w-full max-w-md bg-white border border-outline-variant/30 shadow-2xl" style="font-family:Inter,sans-serif;">',

      /* Close button */
      '  <button type="button" data-exit-close aria-label="Close"',
      '    class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"',
      '    style="background:none;border:none;cursor:pointer;padding:4px;line-height:1;">',
      '    <span class="material-symbols-outlined" style="font-size:20px;">close</span>',
      '  </button>',

      /* Content */
      '  <div class="p-8 md:p-10">',
      '    <p class="font-headline italic text-2xl md:text-3xl text-slate-text leading-tight mb-3"',
      '       style="font-family:Newsreader,serif;color:#0F172A;">',
      '      Before you go &mdash;',
      '    </p>',
      '    <p class="text-sm text-slate-muted leading-relaxed mb-6" style="color:#64748B;">',
      '      Get the complete AI visibility playbook. Free PDF, delivered instantly.',
      '    </p>',

      /* Form — handled by email-gate.js */
      '    <form class="email-gate-form" data-lead-magnet="playbook" data-thank-you-url="/thank-you/playbook/">',
      '      <input type="email" name="email" required',
      '        placeholder="Work email"',
      '        autocomplete="email"',
      '        class="w-full border border-outline-variant/50 bg-white text-on-surface text-sm',
      '               px-4 py-3 mb-3 outline-none focus:border-primary transition-colors"',
      '        style="font-family:Inter,sans-serif;">',
      '      <button type="submit"',
      '        class="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary',
      '               text-sm font-semibold px-6 py-3 hover:bg-primary-dim transition-colors">',
      '        Send Me the Playbook',
      '        <span class="material-symbols-outlined" style="font-size:16px;" aria-hidden="true">arrow_forward</span>',
      '      </button>',
      '    </form>',
      '  </div>',

      '</div>'
    ].join('\n');

    document.body.appendChild(overlay);
    return overlay;
  }

  /* ------------------------------------------------------------------ */
  /*  Show / hide                                                       */
  /* ------------------------------------------------------------------ */

  var popupEl = null;

  function showPopup() {
    if (shouldSuppress()) return;
    if (document.getElementById(POPUP_ID)) return; /* already visible */

    markShown();
    popupEl = buildPopup();
    popupEl.style.display = 'flex';

    /* Prevent background scroll. */
    document.body.style.overflow = 'hidden';

    /* Focus the email input for accessibility. */
    var input = popupEl.querySelector('input[type="email"]');
    if (input) setTimeout(function () { input.focus(); }, 100);
  }

  function hidePopup() {
    if (!popupEl) return;
    popupEl.style.display = 'none';
    document.body.style.overflow = '';

    /* Clean up DOM. */
    if (popupEl.parentNode) popupEl.parentNode.removeChild(popupEl);
    popupEl = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Close triggers                                                    */
  /* ------------------------------------------------------------------ */

  function attachCloseHandlers() {
    /* Delegate clicks: close on X button, or backdrop click. */
    document.addEventListener('click', function (e) {
      if (!popupEl) return;

      /* X button. */
      if (e.target.closest && e.target.closest('[data-exit-close]')) {
        hidePopup();
        return;
      }

      /* Backdrop click (clicked the overlay itself, not the card). */
      if (e.target === popupEl) {
        hidePopup();
      }
    });

    /* Escape key. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popupEl) hidePopup();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Desktop trigger: mouseout toward browser chrome                   */
  /* ------------------------------------------------------------------ */

  function attachDesktopTrigger() {
    document.addEventListener('mouseout', function (e) {
      if (shouldSuppress()) return;
      /* Only trigger when mouse moves above the viewport. */
      if (e.clientY < 10 && (!e.relatedTarget && !e.toElement)) {
        showPopup();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Mobile triggers: rapid scroll-up OR 45+ seconds on page          */
  /* ------------------------------------------------------------------ */

  function attachMobileTriggers() {
    /* Only apply on narrow viewports. */
    if (window.innerWidth >= 768) return;

    /* --- Rapid scroll-up detection --- */
    var lastScrollY = window.scrollY || window.pageYOffset || 0;
    var scrollDelta = 0;
    var scrollTimer = null;

    window.addEventListener('scroll', function () {
      if (shouldSuppress()) return;

      var currentY = window.scrollY || window.pageYOffset || 0;
      var diff = currentY - lastScrollY;
      lastScrollY = currentY;

      /* Only accumulate upward scroll (negative diff). */
      if (diff < 0) {
        scrollDelta += diff;
      } else {
        scrollDelta = 0;
      }

      /* If the user scrolled up more than the threshold rapidly. */
      if (scrollDelta < SCROLL_UP_THRESHOLD) {
        scrollDelta = 0;
        showPopup();
      }

      /* Reset accumulated delta after a pause. */
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { scrollDelta = 0; }, 300);
    }, { passive: true });

    /* --- Time-on-page trigger (45 seconds) --- */
    setTimeout(function () {
      if (!shouldSuppress()) showPopup();
    }, MOBILE_TIMER_MS);
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init() {
    if (shouldSuppress()) return;

    attachCloseHandlers();

    if (window.innerWidth >= 768) {
      attachDesktopTrigger();
    } else {
      attachMobileTriggers();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
