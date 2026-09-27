/*
 * Metricus reader-pulse-b — multiple-choice inline blog form.
 *
 * Usage:
 *   <script src="/js/reader-pulse-b.js" defer></script>
 *   <div data-reader-pulse-b data-source="<slug>"></div>
 *
 * Three stages: a multiple-choice question, then the way into the tool, then thanks.
 * but Stage 1 is a compact multiple-choice question instead of a textarea.
 * Logs to the same Cloudflare Worker endpoint with READER_PULSE_B_* kinds.
 *
 * Can coexist with reader-pulse.js on the same page (different mount attr).
 */
(function(){
  'use strict';

  var SW_LOGS_URL = 'https://metricus-studio-logs.red-hill-a87d.workers.dev/';
  var STYLE_ID = 'metricus-reader-pulse-b-style';
  var MOUNT_FLAG = 'rpbMounted';

  var SW_UID = (function() {
    try {
      var u = localStorage.getItem('metricus_uid');
      if (!u) {
        u = (crypto.randomUUID && crypto.randomUUID()) ||
            ('uid-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
        localStorage.setItem('metricus_uid', u);
      }
      return u;
    } catch (e) {
      return 'uid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  })();
  var SW_SID = (function() {
    try {
      var s = sessionStorage.getItem('metricus_sid');
      if (!s) {
        s = (crypto.randomUUID && crypto.randomUUID()) ||
            ('sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
        sessionStorage.setItem('metricus_sid', s);
      }
      return s;
    } catch (e) {
      return 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  })();

  var DEFAULT_QUESTION = 'What\u2019s stopping you from finding out what AI says about your business?';
  var DEFAULT_CHOICES = [
    'I\u2019m not sure AI matters for my business yet',
    'I don\u2019t have time to look into it',
    'I wouldn\u2019t know what to do with the results',
    'I\u2019d rather spend the budget elsewhere'
  ];

  var CSS = [
    '.m-rpb{margin:36px 0;font:inherit}',
    '.m-rpb *{box-sizing:border-box}',
    '.m-rpb__stage{background:#F1EFEA;color:#1F1F1F;padding:18px 20px;border-radius:8px}',
    '.m-rpb__h{font-weight:700;font-size:19px;line-height:1.4;margin:0 0 10px 0}',
    '.m-rpb__body{font-size:17px;line-height:1.55;margin:0 0 12px 0}',
    '.m-rpb .m-rpb__choices{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;max-width:none}',
    '.m-rpb .m-rpb__choices li{margin:0;max-width:none}',
    '.m-rpb__choice{display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;border:1.5px solid #BDB8AE;border-radius:8px;background:#fff;font-size:17px;line-height:1.35}',
    '.m-rpb__choice--sel{border-color:#0B57D0}',
    '.m-rpb__radio{flex-shrink:0;width:18px;height:18px;border:2px solid #8a8a8a;border-radius:50%;position:relative}',
    '.m-rpb__choice--sel .m-rpb__radio{border-color:#0B57D0}',
    '.m-rpb__choice--sel .m-rpb__radio::after{content:"";position:absolute;top:3px;left:3px;width:8px;height:8px;border-radius:50%;background:#0B57D0}',
    '.m-rpb__other-wrap{display:flex;align-items:center;gap:8px;flex:1;min-width:0}',
    '.m-rpb__other-input{font:inherit;flex:1;min-width:0;padding:4px 8px;border:1.5px solid #BDB8AE;border-radius:6px;background:#fff;color:#1F1F1F;font-size:16px;outline:0}',
    '.m-rpb__other-input:focus{border-color:#1F1F1F}',
    '.m-rpb__row{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:14px}',
    '.m-rpb__btn{font:inherit;display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:8px;border:1.5px solid #0B57D0;background:#0B57D0;color:#fff;font-weight:700;font-size:17px;cursor:pointer;text-decoration:none}',
    '.m-rpb__btn:disabled{opacity:.4;cursor:default}',
    '.m-rpb__fields{display:flex;flex-direction:column;gap:10px;margin:0}',
    '.m-rpb__input{font:inherit;width:100%;padding:10px 12px;border:1.5px solid #BDB8AE;border-radius:8px;background:#fff;color:#1F1F1F;font-size:17px;outline:0}',
    '.m-rpb__input:focus{border-color:#1F1F1F}',
    '.m-rpb__skip{font:inherit;font-size:16px;color:#545454;text-decoration:underline;text-underline-offset:3px;background:0;border:0;padding:0;cursor:pointer}',
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
      var raw = String(pricing || '');
      var parts = raw.split(' // ');
      var event = parts.shift() || '';
      var details = parts.join(' // ');
      fetch(SW_LOGS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          uid: SW_UID,
          sid: SW_SID,
          event: event,
          value: { contact: contact || 'anonymous', details: details }
        }),
        keepalive: true
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

    // --- Stage 2: the tool ---
    var openBtn = el('a', { class: 'm-rpb__btn', href: '/', text: 'Ask AI' });
    var skipBtn = el('button', {
      type: 'button', class: 'm-rpb__skip', text: 'No thanks'
    });
    var s2 = el('div', { class: 'm-rpb__stage', hidden: true, 'data-rpb-stage': '2' }, [
      el('div', { class: 'm-rpb__h', role: 'heading', 'aria-level': '3', text: 'What do your customers ask AI?' }),
      el('div', { class: 'm-rpb__body', text: 'Type it in. You see the answer and every business it names.' }),
      el('div', { class: 'm-rpb__row' }, [openBtn, skipBtn])
    ]);

    // --- Stage 3: Thanks ---
    var s3 = el('div', { class: 'm-rpb__stage', hidden: true, 'data-rpb-stage': '3' }, [
      el('div', { class: 'm-rpb__h', role: 'heading', 'aria-level': '3', text: 'Thanks.' })
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
    });

    openBtn.addEventListener('click', function(){
      postLog('anonymous', buildPricing('READER_PULSE_B_TOOL', source, { Answer: getAnswer() }));
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
