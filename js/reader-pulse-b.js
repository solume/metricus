/*
 * Metricus reader-pulse-b — multiple-choice inline blog form.
 *
 * Usage:
 *   <script src="/js/reader-pulse-b.js" defer></script>
 *   <div data-reader-pulse-b data-source="<slug>"></div>
 *
 * Same 3-stage flow as reader-pulse.js (choice → lead capture → thanks)
 * but Stage 1 is a compact multiple-choice question instead of a textarea.
 * Logs to the same Cloudflare Worker endpoint with READER_PULSE_B_* kinds.
 *
 * Can coexist with reader-pulse.js on the same page (different mount attr).
 */
(function(){
  'use strict';

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var STYLE_ID = 'metricus-reader-pulse-b-style';
  var MOUNT_FLAG = 'rpbMounted';

  var DEFAULT_QUESTION = 'What\u2019s stopping you from finding out what AI says about your business?';
  var DEFAULT_CHOICES = [
    'I don\u2019t think AI affects how people find me yet',
    'I wouldn\u2019t know what to do with that info',
    'I can probably figure it out myself'
  ];

  var CSS = [
    '.m-rpb{margin:2.5rem 0;font-family:Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif}',
    '.m-rpb *{box-sizing:border-box}',
    '.m-rpb__stage{background:#0F172A;color:#f6f7ff;padding:1.5rem;border-left:4px solid #f6f7ff}',
    '@media(min-width:768px){.m-rpb__stage{padding:2rem}}',
    '.m-rpb__h{font-family:Newsreader,Georgia,serif;font-weight:700;font-size:1.35rem;line-height:1.15;color:#fff;margin:0 0 .75rem 0}',
    '@media(min-width:768px){.m-rpb__h{font-size:1.5rem}}',
    '.m-rpb__body{font-size:1rem;line-height:1.35;color:#cbd5e1;margin:0 0 1rem 0}',
    '.m-rpb__choices{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}',
    '.m-rpb__choice{display:flex;align-items:center;gap:.65rem;cursor:pointer;padding:.65rem .85rem;border:1px solid #334155;background:#1E293B;font-size:.9375rem;color:#e2e8f0;line-height:1.3;transition:border-color 150ms ease}',
    '.m-rpb__choice:hover{border-color:#94a3b8}',
    '.m-rpb__choice--sel{border-color:#fff;background:#334155}',
    '.m-rpb__radio{flex-shrink:0;width:16px;height:16px;border:2px solid #64748b;border-radius:50%;position:relative}',
    '.m-rpb__choice--sel .m-rpb__radio{border-color:#fff}',
    '.m-rpb__choice--sel .m-rpb__radio::after{content:"";position:absolute;top:3px;left:3px;width:6px;height:6px;border-radius:50%;background:#fff}',
    '.m-rpb__other-wrap{display:flex;align-items:center;gap:.65rem;flex:1;min-width:0}',
    '.m-rpb__other-input{font-family:inherit;flex:1;min-width:0;padding:.4rem .6rem;border:1px solid #475569;background:#fff;color:#0F172A;font-size:.875rem;outline:0;border-radius:0}',
    '.m-rpb__other-input::placeholder{color:#64748B;opacity:1}',
    '.m-rpb__other-input:focus{border-color:#fff}',
    '.m-rpb__row{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;margin-top:1rem}',
    '.m-rpb__btn{font-family:inherit;background:#fff;color:#0F172A;font-weight:600;font-size:.875rem;padding:.65rem 1.5rem;border:0;cursor:pointer;transition:background-color 150ms ease;border-radius:0;line-height:1.2}',
    '.m-rpb__btn:hover{background:#cbd5e1}',
    '.m-rpb__btn:disabled{opacity:.4;cursor:default}',
    '.m-rpb__fields{display:flex;flex-direction:column;gap:.75rem;margin:0}',
    '.m-rpb__input{font-family:inherit;width:100%;padding:.85rem;border:1px solid #334155;background:#fff;color:#0F172A;font-size:.9375rem;line-height:1.5;outline:0;border-radius:0;margin:0}',
    '.m-rpb__input::placeholder{color:#64748B;opacity:1}',
    '.m-rpb__input:focus{border-color:#fff}',
    '.m-rpb__skip{font-family:inherit;font-size:.875rem;color:#94a3b8;text-decoration:underline;text-underline-offset:4px;background:0;border:0;padding:0;cursor:pointer}',
    '.m-rpb__skip:hover{color:#fff}',
    '.m-rpb [hidden]{display:none!important}'
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
      var body = 'contact=' + encodeURIComponent(contact || 'anonymous') +
                 '&pricing=' + encodeURIComponent(pricing || '');
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
      fetch(ENDPOINT, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body, keepalive: true
      }).catch(function(){});
    } catch (e) {}
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
        if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function mountOne(root){
    if (!root || root.dataset[MOUNT_FLAG]) return;
    root.dataset[MOUNT_FLAG] = '1';

    var source = root.dataset.source || 'unknown';
    root.classList.add('m-rpb');
    while (root.firstChild) root.removeChild(root.firstChild);

    // --- Stage 1: Multiple choice ---
    var choices = DEFAULT_CHOICES.slice();
    for (var ci = choices.length - 1; ci > 0; ci--) {
      var ri = Math.floor(Math.random() * (ci + 1));
      var tmp = choices[ci]; choices[ci] = choices[ri]; choices[ri] = tmp;
    }
    var selected = null;
    var choiceEls = [];
    var otherInput = el('input', {
      type: 'text',
      class: 'm-rpb__other-input',
      placeholder: 'Something else\u2026'
    });
    var continueBtn = el('button', {
      type: 'button', class: 'm-rpb__btn', text: 'Submit', disabled: true
    });

    var list = el('ul', { class: 'm-rpb__choices' });

    function getAnswerByIdx(idx){
      if (idx === null) return '';
      if (idx === otherIdx) return 'Other: ' + (otherInput.value || '').trim();
      return choices[idx];
    }

    function select(idx){
      selected = idx;
      for (var i = 0; i < choiceEls.length; i++) {
        if (i === idx) choiceEls[i].classList.add('m-rpb__choice--sel');
        else choiceEls[i].classList.remove('m-rpb__choice--sel');
      }
      continueBtn.disabled = false;
      postLog('anonymous', buildPricing('READER_PULSE_B_CLICK', source, { Answer: getAnswerByIdx(idx) }));
    }

    for (var i = 0; i < choices.length; i++) {
      (function(idx){
        var li = el('li', { class: 'm-rpb__choice', role: 'option' }, [
          el('span', { class: 'm-rpb__radio' }),
          document.createTextNode(choices[idx])
        ]);
        li.addEventListener('click', function(){ select(idx); });
        choiceEls.push(li);
        list.appendChild(li);
      })(i);
    }

    // "Other" option
    var otherLi = el('li', { class: 'm-rpb__choice', role: 'option' }, [
      el('span', { class: 'm-rpb__radio' }),
      el('span', { class: 'm-rpb__other-wrap' }, [
        document.createTextNode('Other: '),
        otherInput
      ])
    ]);
    var otherIdx = choices.length;
    otherLi.addEventListener('click', function(){
      select(otherIdx);
      try { otherInput.focus(); } catch (e) {}
    });
    otherInput.addEventListener('focus', function(){ select(otherIdx); });
    otherInput.addEventListener('input', function(){
      if (selected !== otherIdx) select(otherIdx);
    });
    choiceEls.push(otherLi);
    list.appendChild(otherLi);

    var s1 = el('div', { class: 'm-rpb__stage', 'data-rpb-stage': '1' }, [
      el('div', { class: 'm-rpb__h', role: 'heading', 'aria-level': '3', text: DEFAULT_QUESTION }),
      list,
      el('div', { class: 'm-rpb__row' }, [continueBtn])
    ]);

    // --- Stage 2: Lead capture ---
    var emailEl = el('input', {
      type: 'email', class: 'm-rpb__input', required: 'required',
      placeholder: 'Work email', autocomplete: 'email'
    });
    var websiteEl = el('input', {
      type: 'text', class: 'm-rpb__input',
      placeholder: 'Website (optional)', autocomplete: 'url'
    });
    var submitBtn = el('button', { type: 'submit', class: 'm-rpb__btn', text: 'Send me the report' });
    var skipBtn = el('button', {
      type: 'button', class: 'm-rpb__skip', text: 'No thanks'
    });
    var form = el('form', { class: 'm-rpb__fields', novalidate: 'novalidate' }, [
      emailEl, websiteEl,
      el('div', { class: 'm-rpb__row' }, [submitBtn, skipBtn])
    ]);
    var s2 = el('div', { class: 'm-rpb__stage', hidden: true, 'data-rpb-stage': '2' }, [
      el('div', { class: 'm-rpb__h', role: 'heading', 'aria-level': '3', text: 'Want a free AI visibility report for your site?' }),
      el('div', { class: 'm-rpb__body', text: 'Leave your work email and we\u2019ll send it over.' }),
      form
    ]);

    // --- Stage 3: Thanks ---
    var s3 = el('div', { class: 'm-rpb__stage', hidden: true, 'data-rpb-stage': '3' }, [
      el('div', { class: 'm-rpb__h', role: 'heading', 'aria-level': '3', text: 'Thanks \u2014 got it.' }),
      el('div', { class: 'm-rpb__body', text: 'We\u2019ll send the report to your inbox shortly.' })
    ]);

    root.appendChild(s1);
    root.appendChild(s2);
    root.appendChild(s3);

    // --- Helpers ---
    function show(n){
      s1.hidden = (n !== 1);
      s2.hidden = (n !== 2);
      s3.hidden = (n !== 3);
    }

    function getAnswer(){
      return getAnswerByIdx(selected);
    }

    // --- Events ---
    continueBtn.addEventListener('click', function(){
      var answer = getAnswer();
      if (!answer) return;
      postLog('anonymous', buildPricing('READER_PULSE_B_REASON', source, { Answer: answer }));
      show(2);
      try { emailEl.focus(); } catch (e) {}
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (emailEl.value || '').trim();
      if (!email || !/.+@.+\..+/.test(email)) {
        try { emailEl.focus(); } catch (e2) {}
        return;
      }
      postLog(email, buildPricing('READER_PULSE_B_LEAD', source, {
        Website: (websiteEl.value || '').trim(),
        Answer: getAnswer()
      }));
      show(3);
    });

    skipBtn.addEventListener('click', function(){
      postLog('anonymous', buildPricing('READER_PULSE_B_SKIP', source, { Answer: getAnswer() }));
      if (root.parentNode) root.parentNode.removeChild(root);
    });
  }

  function mountAll(){
    injectStyle();
    var nodes = document.querySelectorAll('[data-reader-pulse-b]');
    for (var i = 0; i < nodes.length; i++) mountOne(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  if (typeof MutationObserver !== 'undefined') {
    try {
      var mo = new MutationObserver(function(mutations){
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (!n || n.nodeType !== 1) continue;
            if (n.matches && n.matches('[data-reader-pulse-b]')) mountOne(n);
            if (n.querySelectorAll) {
              var nested = n.querySelectorAll('[data-reader-pulse-b]');
              for (var k = 0; k < nested.length; k++) mountOne(nested[k]);
            }
          }
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }
})();
