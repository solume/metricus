/*
 * Metricus reader-pulse — inline blog form (fully self-contained).
 *
 * Drop-in usage on any page:
 *
 *   <head>
 *     <script src="/js/reader-pulse.js" defer></script>
 *   </head>
 *
 *   <!-- Wherever you want the form to appear in the article: -->
 *   <div data-reader-pulse data-source="<slug>"></div>
 *
 * That's it. The script injects its own CSS, renders the 3-stage form DOM,
 * wires events, handles the skip path, and POSTs submissions to the existing
 * Cloudflare Worker logging endpoint using the existing {contact, pricing}
 * schema (same as hero gate, sample gate, agency inquiry, post-purchase
 * survey). No backend changes. No external dependencies. Vanilla JS.
 *
 * Per-placeholder overrides (all optional) via data-* attributes:
 *   data-source              — slug used in the `pricing` payload (required-ish)
 *   data-heading             — Stage 1 headline       (default: "Quick question")
 *   data-question            — Stage 1 body copy
 *   data-placeholder         — Textarea placeholder
 *   data-continue-label      — Continue button text
 *   data-hint                — Small hint beside Continue
 *   data-lead-heading        — Stage 2 headline
 *   data-lead-body           — Stage 2 body copy
 *   data-email-placeholder   — Email input placeholder
 *   data-website-placeholder — Website input placeholder
 *   data-submit-label        — "Send me the report" button text
 *   data-skip-label          — "No thanks" link text
 *   data-thanks-heading      — Stage 3 headline
 *   data-thanks-body         — Stage 3 body copy
 *
 * Events logged (kind prefix visible in the sheet):
 *   READER_PULSE_REASON  — fired on Continue if the textarea is non-empty
 *   READER_PULSE_LEAD    — fired on email submit (carries email + website + reason)
 *   READER_PULSE_SKIP    — fired on "No thanks" (carries reason if any)
 */
(function(){
  'use strict';

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var STYLE_ID = 'metricus-reader-pulse-style';
  var MOUNT_FLAG = 'rpMounted';

  var DEFAULTS = {
    heading:            'Quick question',
    question:           'What\u2019s happening that made you look into AI visibility now?',
    placeholder:        'Your answer here.',
    continueLabel:      'Continue',
    hint:               'One sentence is fine. Two is better.',
    leadHeading:        'Want a free AI visibility report for your site?',
    leadBody:           'Leave your work email and we\u2019ll send it over.',
    emailPlaceholder:   'Work email',
    websitePlaceholder: 'Website (optional)',
    submitLabel:        'Send me the report',
    skipLabel:          'No thanks',
    thanksHeading:      'Thanks \u2014 got it.',
    thanksBody:         'We\u2019ll send the report to your inbox shortly.'
  };

  var CSS = [
    '.m-rp{margin:3rem 0;font-family:Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif}',
    '@media (min-width:768px){.m-rp{margin:3.5rem 0}}',
    '.m-rp *{box-sizing:border-box}',
    '.m-rp__stage{background:#0F172A;color:#f6f7ff;padding:1.75rem;border-left:4px solid #f6f7ff}',
    '@media (min-width:768px){.m-rp__stage{padding:2.5rem}}',
    '.m-rp__h{font-family:Newsreader,Georgia,serif;font-weight:700;font-size:1.5rem;line-height:1.15;color:#fff;margin:0 0 .75rem 0}',
    '@media (min-width:768px){.m-rp__h{font-size:1.875rem}}',
    '.m-rp__h--thanks{margin-bottom:.5rem}',
    '.m-rp__body{font-size:1.0625rem;line-height:1.375;color:#cbd5e1;margin:0 0 1.25rem 0}',
    '@media (min-width:768px){.m-rp__body{font-size:1.125rem}}',
    '.m-rp__input,.m-rp__textarea{font-family:inherit;width:100%;padding:1rem;border:1px solid #334155;background:#fff;color:#0F172A;font-size:.9375rem;line-height:1.5;outline:0;border-radius:0;margin:0}',
    '.m-rp__textarea{resize:vertical;min-height:7.5rem}',
    '.m-rp__input::placeholder,.m-rp__textarea::placeholder{color:#64748B;opacity:1}',
    '.m-rp__input:focus,.m-rp__textarea:focus{border-color:#fff}',
    '.m-rp__row{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;margin-top:1.25rem}',
    '.m-rp__row--form{margin-top:.75rem;gap:1.25rem}',
    '.m-rp__btn{font-family:inherit;background:#fff;color:#0F172A;font-weight:600;font-size:.875rem;padding:.75rem 1.75rem;border:0;cursor:pointer;transition:background-color 150ms ease;border-radius:0;line-height:1.2}',
    '.m-rp__btn:hover{background:#cbd5e1}',
    '.m-rp__hint{font-size:.75rem;color:#94a3b8}',
    '.m-rp__fields{display:flex;flex-direction:column;gap:.75rem;margin:0}',
    '.m-rp__skip{font-family:inherit;font-size:.875rem;color:#94a3b8;text-decoration:underline;text-underline-offset:4px;background:0;border:0;padding:0;cursor:pointer}',
    '.m-rp__skip:hover{color:#fff}',
    '.m-rp [hidden]{display:none!important}'
  ].join('');

  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function postLog(contact, pricing){
    try {
      var body = 'contact='  + encodeURIComponent(contact || 'anonymous') +
                 '&pricing=' + encodeURIComponent(pricing || '');
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
      fetch(ENDPOINT, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body,
        keepalive: true
      }).catch(function(){});
    } catch (e) { /* logging must never break the page */ }
  }

  function buildPricing(kind, source, extras){
    var parts = [kind, 'Source: ' + source];
    if (extras) {
      for (var k in extras) {
        if (Object.prototype.hasOwnProperty.call(extras, k) && extras[k]) {
          parts.push(k + ': ' + extras[k]);
        }
      }
    }
    return parts.join(' // ');
  }

  function readConfig(el){
    var d = el.dataset;
    return {
      source:             d.source             || 'unknown',
      heading:            d.heading            || DEFAULTS.heading,
      question:           d.question           || DEFAULTS.question,
      placeholder:        d.placeholder        || DEFAULTS.placeholder,
      continueLabel:      d.continueLabel      || DEFAULTS.continueLabel,
      hint:               d.hint               || DEFAULTS.hint,
      leadHeading:        d.leadHeading        || DEFAULTS.leadHeading,
      leadBody:           d.leadBody           || DEFAULTS.leadBody,
      emailPlaceholder:   d.emailPlaceholder   || DEFAULTS.emailPlaceholder,
      websitePlaceholder: d.websitePlaceholder || DEFAULTS.websitePlaceholder,
      submitLabel:        d.submitLabel        || DEFAULTS.submitLabel,
      skipLabel:          d.skipLabel          || DEFAULTS.skipLabel,
      thanksHeading:      d.thanksHeading      || DEFAULTS.thanksHeading,
      thanksBody:         d.thanksBody         || DEFAULTS.thanksBody
    };
  }

  function el(tag, attrs, children){
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'hidden') { if (v) node.setAttribute('hidden', ''); }
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c == null) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function render(root, cfg){
    root.classList.add('m-rp');
    // Clean any stale child nodes (re-mounts or SSR residue)
    while (root.firstChild) root.removeChild(root.firstChild);

    var reasonEl = el('textarea', {
      class: 'm-rp__textarea',
      rows: '5',
      placeholder: cfg.placeholder,
      'data-rp-field': 'reason'
    });

    var continueBtn = el('button', {
      type: 'button',
      class: 'm-rp__btn',
      'data-rp-action': 'continue',
      text: cfg.continueLabel
    });

    var s1 = el('div', { class: 'm-rp__stage', 'data-rp-stage': '1' }, [
      el('div', { class: 'm-rp__h', role: 'heading', 'aria-level': '3', text: cfg.heading }),
      el('div', { class: 'm-rp__body', text: cfg.question }),
      reasonEl,
      el('div', { class: 'm-rp__row' }, [
        continueBtn,
        el('div', { class: 'm-rp__hint', text: cfg.hint })
      ])
    ]);

    var emailEl = el('input', {
      type: 'email',
      class: 'm-rp__input',
      required: 'required',
      placeholder: cfg.emailPlaceholder,
      autocomplete: 'email',
      'data-rp-field': 'email'
    });

    var websiteEl = el('input', {
      type: 'text',
      class: 'm-rp__input',
      placeholder: cfg.websitePlaceholder,
      autocomplete: 'url',
      'data-rp-field': 'website'
    });

    var submitBtn = el('button', {
      type: 'submit',
      class: 'm-rp__btn',
      text: cfg.submitLabel
    });

    var skipBtn = el('button', {
      type: 'button',
      class: 'm-rp__skip',
      'data-rp-action': 'skip',
      text: cfg.skipLabel
    });

    var form = el('form', { class: 'm-rp__fields', 'data-rp-form': '', novalidate: 'novalidate' }, [
      emailEl,
      websiteEl,
      el('div', { class: 'm-rp__row m-rp__row--form' }, [submitBtn, skipBtn])
    ]);

    var s2 = el('div', { class: 'm-rp__stage', 'data-rp-stage': '2', hidden: true }, [
      el('div', { class: 'm-rp__h', role: 'heading', 'aria-level': '3', text: cfg.leadHeading }),
      el('div', { class: 'm-rp__body', text: cfg.leadBody }),
      form
    ]);

    var s3 = el('div', { class: 'm-rp__stage', 'data-rp-stage': '3', hidden: true }, [
      el('div', { class: 'm-rp__h m-rp__h--thanks', role: 'heading', 'aria-level': '3', text: cfg.thanksHeading }),
      el('div', { class: 'm-rp__body', text: cfg.thanksBody })
    ]);

    root.appendChild(s1);
    root.appendChild(s2);
    root.appendChild(s3);

    return {
      s1: s1, s2: s2, s3: s3,
      reasonEl: reasonEl,
      emailEl: emailEl,
      websiteEl: websiteEl,
      continueBtn: continueBtn,
      form: form,
      skipBtn: skipBtn
    };
  }

  function mountOne(root){
    if (!root || root.dataset[MOUNT_FLAG]) return;
    root.dataset[MOUNT_FLAG] = '1';

    var cfg = readConfig(root);
    var p = render(root, cfg);

    function getReason(){ return (p.reasonEl.value  || '').trim(); }
    function getEmail(){  return (p.emailEl.value   || '').trim(); }
    function getSite(){   return (p.websiteEl.value || '').trim(); }

    function show(n){
      p.s1.hidden = (n !== 1);
      p.s2.hidden = (n !== 2);
      p.s3.hidden = (n !== 3);
    }

    p.continueBtn.addEventListener('click', function(){
      var reason = getReason();
      if (reason) {
        postLog('anonymous', buildPricing('READER_PULSE_REASON', cfg.source, { Reason: reason }));
      }
      show(2);
      try { p.emailEl.focus(); } catch (e) {}
    });

    p.form.addEventListener('submit', function(e){
      e.preventDefault();
      var email = getEmail();
      if (!email || !/.+@.+\..+/.test(email)) {
        try { p.emailEl.focus(); } catch (e2) {}
        return;
      }
      postLog(email, buildPricing('READER_PULSE_LEAD', cfg.source, {
        Website: getSite(),
        Reason:  getReason()
      }));
      show(3);
    });

    p.skipBtn.addEventListener('click', function(){
      postLog('anonymous', buildPricing('READER_PULSE_SKIP', cfg.source, {
        Reason: getReason()
      }));
      if (root.parentNode) root.parentNode.removeChild(root);
    });
  }

  function mountAll(){
    injectStyle();
    var nodes = document.querySelectorAll('[data-reader-pulse]');
    for (var i = 0; i < nodes.length; i++) mountOne(nodes[i]);
  }

  // Initial mount — works whether the script is in <head> with defer, at the
  // end of <body>, or loaded dynamically after DOMContentLoaded has fired.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  // Auto-pick-up placeholders added later (e.g., by client-side routing).
  if (typeof MutationObserver !== 'undefined') {
    try {
      var mo = new MutationObserver(function(mutations){
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (!n || n.nodeType !== 1) continue;
            if (n.matches && n.matches('[data-reader-pulse]')) mountOne(n);
            if (n.querySelectorAll) {
              var nested = n.querySelectorAll('[data-reader-pulse]');
              for (var k = 0; k < nested.length; k++) mountOne(nested[k]);
            }
          }
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) { /* MO unsupported — initial mount is enough */ }
  }
})();
