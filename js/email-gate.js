/*
 * Metricus email-gate.js — unified email gate handler.
 *
 * Handles all forms with class "email-gate-form" across the site:
 *   - Gated pages (lead magnet downloads)
 *   - Knowledge base gates
 *   - Exit-intent popup forms
 *   - Any other email capture form
 *
 * On submit:
 *   1. Validates the email address
 *   2. Stores email in localStorage ("metricus_email")
 *   3. POSTs email + lead magnet type to the Cloudflare Worker
 *   4. Fires a GA4 lead_magnet_download event
 *   5. Redirects to data-thank-you-url (or shows inline thank-you)
 *
 * On page load:
 *   - If metricus_email already exists, auto-unlocks gated content
 *
 * Coexists with reader-pulse.js and reader-pulse-b.js (no shared state).
 *
 * Usage:
 *   <script src="/js/email-gate.js" defer></script>
 *
 *   <form class="email-gate-form"
 *         data-lead-magnet="playbook"
 *         data-thank-you-url="/thank-you/playbook/">
 *     <input type="email" name="email" required placeholder="Work email">
 *     <button type="submit">Download</button>
 *   </form>
 *
 *   Gated content wrapper:
 *   <div class="metricus-gated" data-gate-id="playbook">
 *     <!-- Hidden/blurred content here -->
 *   </div>
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var STORAGE_KEY = 'metricus_email';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  /** Read stored email (or null). */
  function getStoredEmail() {
    try { return localStorage.getItem(STORAGE_KEY) || null; }
    catch (e) { return null; }
  }

  /** Persist email to localStorage. */
  function storeEmail(email) {
    try { localStorage.setItem(STORAGE_KEY, email); }
    catch (e) { /* private browsing — fail silently */ }
  }

  /** POST lead data to the Cloudflare Worker (same pattern as reader-pulse-b). */
  function postLead(email, leadMagnet) {
    try {
      var pricing = 'EMAIL_GATE_LEAD // Lead Magnet: ' + (leadMagnet || 'unknown') +
                    ' // Page: ' + location.pathname;
      var body = 'contact=' + encodeURIComponent(email) +
                 '&pricing=' + encodeURIComponent(pricing);

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* network errors are non-fatal */ }
  }

  /** Fire GA4 event if gtag is available. */
  function fireGA4(leadMagnet) {
    if (typeof gtag === 'function') {
      gtag('event', 'lead_magnet_download', {
        lead_magnet: leadMagnet || 'unknown',
        page_url: location.pathname
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Auto-unlock gated content                                         */
  /* ------------------------------------------------------------------ */

  /**
   * If the visitor already provided their email, remove gates:
   *   - Elements with class "metricus-gated" get the blur removed and
   *     hidden children shown.
   *   - Elements with class "metricus-gate-overlay" are hidden entirely.
   */
  function autoUnlock() {
    if (!getStoredEmail()) return;

    var gated = document.querySelectorAll('.metricus-gated');
    for (var i = 0; i < gated.length; i++) {
      gated[i].style.filter = 'none';
      gated[i].style.pointerEvents = 'auto';
      gated[i].style.userSelect = 'auto';
      gated[i].classList.add('metricus-unlocked');
    }

    var overlays = document.querySelectorAll('.metricus-gate-overlay');
    for (var j = 0; j < overlays.length; j++) {
      overlays[j].style.display = 'none';
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Show inline thank-you (fallback when no redirect URL)             */
  /* ------------------------------------------------------------------ */

  function showInlineThankYou(form) {
    var wrapper = document.createElement('div');
    wrapper.className = 'metricus-gate-thanks';
    wrapper.style.cssText = 'padding:1.5rem;text-align:center;';
    wrapper.innerHTML =
      '<p style="font-family:Newsreader,serif;font-weight:700;font-size:1.25rem;color:#0F172A;margin:0 0 0.5rem 0;">Thanks — check your inbox.</p>' +
      '<p style="font-size:0.875rem;color:#64748B;margin:0;">Your download is on the way.</p>';

    form.style.display = 'none';
    form.parentNode.insertBefore(wrapper, form.nextSibling);
  }

  function getStatusNode(form) {
    var node = form.parentNode.querySelector('.metricus-gate-status');
    if (node) return node;

    node = document.createElement('p');
    node.className = 'metricus-gate-status';
    node.style.cssText = 'font-size:0.8125rem;color:#64748B;margin:0.75rem 0 0 0;';
    form.parentNode.insertBefore(node, form.nextSibling);
    return node;
  }

  function setStatus(form, message, color) {
    var node = getStatusNode(form);
    node.textContent = message;
    node.style.color = color || '#64748B';
  }

  function setSubmitting(form, submitting) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = submitting;
    btn.style.opacity = submitting ? '0.7' : '';
    btn.style.cursor = submitting ? 'wait' : '';
  }

  /* ------------------------------------------------------------------ */
  /*  Form handler                                                      */
  /* ------------------------------------------------------------------ */

  function handleSubmit(e) {
    e.preventDefault();

    var form = e.target;
    if (!form || !form.classList.contains('email-gate-form')) return;

    /* Find the email input (by type or name). */
    var emailInput = form.querySelector('input[type="email"]') ||
                     form.querySelector('input[name="email"]');
    if (!emailInput) return;

    var email = (emailInput.value || '').trim();

    /* Validate. */
    if (!email || !EMAIL_RE.test(email)) {
      emailInput.focus();
      emailInput.style.borderColor = '#ef4444';
      setStatus(form, 'Enter a valid email address to continue.', '#dc2626');
      return;
    }

    /* Reset visual error state. */
    emailInput.style.borderColor = '';
    setStatus(form, '');

    var leadMagnet = form.dataset.leadMagnet || 'unknown';
    var thankYouUrl = form.dataset.thankYouUrl || '';

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus(form, 'You appear to be offline. Reconnect and try again.', '#dc2626');
      return;
    }

    setSubmitting(form, true);
    setStatus(form, 'Sending…', '#64748B');

    /* 1. Store email locally. */
    storeEmail(email);

    /* 2. POST to Cloudflare Worker. */
    postLead(email, leadMagnet);

    /* 3. Fire GA4 event. */
    fireGA4(leadMagnet);

    /* 4. Auto-unlock any gated sections on this page. */
    autoUnlock();

    /* 5. Redirect or show inline thank-you. */
    if (thankYouUrl) {
      setTimeout(function () {
        window.location.href = thankYouUrl;
      }, 120);
    } else {
      setSubmitting(form, false);
      showInlineThankYou(form);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Initialization                                                     */
  /* ------------------------------------------------------------------ */

  function init() {
    /* Delegate submit events from email-gate-form instances. */
    document.addEventListener('submit', function (e) {
      if (e.target && e.target.classList &&
          e.target.classList.contains('email-gate-form')) {
        handleSubmit(e);
      }
    });

    /* Auto-unlock gated content if visitor is already known. */
    autoUnlock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
