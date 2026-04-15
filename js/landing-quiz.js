/*
 * Metricus landing quiz — general customer-facing entry point.
 *
 * Renders a self-motivated "How does AI see your brand?" quiz on the homepage.
 * Flow: intro → vertical picker → analysis → hands off to the matching vertical
 * benchmark quiz by injecting <div data-benchmark-quiz="..."> and lazy-loading
 * that vertical's script. Agency path and "Other" fallback handled inline.
 *
 * Mount by placing <div data-landing-quiz></div> on a page, then loading
 * /js/benchmark-quiz-engine.js and this file.
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var SELECTOR = '[data-landing-quiz]';
  var MOUNT_FLAG = 'data-landing-quiz-mounted';
  var STORAGE_KEY = 'metricusLandingQuizAnonSeed';
  var ANALYTICS_PREFIX = 'LANDING_QUIZ';

  var VERTICALS = [
    { id: 'insurance',    label: 'Insurance',                       script: '/js/insurance-benchmark-quiz.js',    benchmarkKey: 'insurance',    industryPlural: 'insurance brands' },
    { id: 'real-estate',  label: 'Real estate / brokerage',         script: '/js/real-estate-benchmark-quiz.js',  benchmarkKey: 'real-estate',  industryPlural: 'real estate brands' },
    { id: 'law-firm',     label: 'Law firm',                        script: '/js/law-firm-benchmark-quiz.js',     benchmarkKey: 'law-firm',     industryPlural: 'law firms' },
    { id: 'beauty',       label: 'Beauty / CPG brand',              script: '/js/beauty-benchmark-quiz.js',       benchmarkKey: 'beauty',       industryPlural: 'beauty brands' },
    { id: 'retail',       label: 'Retail / e-commerce',             script: '/js/retail-benchmark-quiz.js',       benchmarkKey: 'retail',       industryPlural: 'retail brands' },
    { id: 'fintech',      label: 'Fintech / financial services',    script: '/js/fintech-benchmark-quiz.js',      benchmarkKey: 'fintech',      industryPlural: 'fintech brands' },
    { id: 'hvac',         label: 'HVAC / home services',            script: '/js/hvac-benchmark-quiz.js',         benchmarkKey: 'hvac',         industryPlural: 'home service brands' },
    { id: 'childcare',    label: 'Childcare / education',           script: '/js/childcare-benchmark-quiz.js',    benchmarkKey: 'childcare',    industryPlural: 'childcare brands' }
  ];

  var AGENCY_OPTION   = { id: 'agency', label: 'Agency (I audit other brands for clients)' };
  var OTHER_OPTION    = { id: 'other',  label: 'Something else — not listed above' };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hashString(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function randomId(prefix) {
    var raw = '';
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        var arr = new Uint32Array(2);
        window.crypto.getRandomValues(arr);
        raw = Array.prototype.map.call(arr, function(num) {
          return ('00000000' + num.toString(16)).slice(-8);
        }).join('');
      }
    } catch (err) {}
    if (!raw) raw = String(Date.now()) + String(Math.random()).slice(2);
    return prefix + '_' + hashString(raw);
  }

  function getAnonymousId() {
    var seed = '';
    try {
      seed = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) || '' : '';
    } catch (err) {}
    if (!seed) {
      seed = randomId('seed') + '_' + String(Date.now());
      try {
        if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, seed);
      } catch (err2) {}
    }
    return 'anon_' + hashString(seed + '|' + (navigator.userAgent || 'ua'));
  }

  function track(kind, payload, contact) {
    try {
      var parts = [kind];
      var extras = payload || {};
      Object.keys(extras).forEach(function(key) {
        if (extras[key] == null || extras[key] === '') return;
        parts.push(key + ': ' + extras[key]);
      });
      var body = 'contact=' + encodeURIComponent(contact || 'anonymous') +
        '&pricing=' + encodeURIComponent(parts.join(' // '));
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
        keepalive: true
      }).catch(function() {});
    } catch (err) {}
  }

  function gtagEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (err) {}
  }

  var loadedScripts = {};
  function ensureScript(src) {
    if (loadedScripts[src]) return loadedScripts[src];
    loadedScripts[src] = new Promise(function(resolve, reject) {
      var existing = document.querySelector('script[data-landing-quiz-src="' + src + '"]');
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          resolve(); return;
        }
        existing.addEventListener('load', function() { resolve(); });
        existing.addEventListener('error', function() { reject(new Error('script load failed: ' + src)); });
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.setAttribute('data-landing-quiz-src', src);
      s.addEventListener('load', function() {
        s.setAttribute('data-loaded', '1');
        resolve();
      });
      s.addEventListener('error', function() { reject(new Error('script load failed: ' + src)); });
      document.head.appendChild(s);
    });
    return loadedScripts[src];
  }

  function findVertical(id) {
    for (var i = 0; i < VERTICALS.length; i++) {
      if (VERTICALS[i].id === id) return VERTICALS[i];
    }
    return null;
  }

  function mountOne(root) {
    if (!root || root.hasAttribute(MOUNT_FLAG)) return;
    root.setAttribute(MOUNT_FLAG, '1');

    var anonId = getAnonymousId();
    var quizId = randomId('lquiz');
    var state = { screen: 'intro', pickedVertical: null, emailSent: false };

    function tracked(kind, payload, contact) {
      var merged = { AnonId: anonId, QuizId: quizId, Source: 'landing-home' };
      var extras = payload || {};
      Object.keys(extras).forEach(function(k) { merged[k] = extras[k]; });
      track(ANALYTICS_PREFIX + '_' + kind, merged, contact || anonId);
    }

    function trackedGtag(name, params) {
      var merged = { source: 'landing-home', anon_id: anonId, quiz_id: quizId };
      var extras = params || {};
      Object.keys(extras).forEach(function(k) { merged[k] = extras[k]; });
      gtagEvent(name, merged);
    }

    function render() {
      root.className = 'm-bq';
      var wrapClass = 'm-bq__wrap' + (state.screen === 'intro' ? ' m-bq__wrap--intro' : '');
      root.innerHTML = '<div class="m-bq__shell"><div class="' + wrapClass + '">' + screenHtml() + '</div></div>';
      bind();
    }

    function topBar() {
      return '' +
        '<div class="m-bq__top">' +
          '<div class="m-bq__brand" aria-label="Metricus">' +
            '<svg class="m-bq__brand-icon" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
              '<path clip-rule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fill-rule="evenodd"></path>' +
            '</svg>' +
            '<span>Metricus</span>' +
          '</div>' +
        '</div>';
    }

    function screenHtml() {
      if (state.screen === 'intro') {
        return '' +
          '<div class="m-bq__screen m-bq__screen--intro">' +
            topBar() +
            '<div class="m-bq__introBody">' +
              '<div class="m-bq__introMain">' +
                '<h3 class="m-bq__title">How does AI see your brand?</h3>' +
                '<p class="m-bq__lead">Find out how your brand&rsquo;s likely AI visibility compares to similar brands in your industry &mdash; and exactly where you rank against your peers.</p>' +
              '</div>' +
              '<div class="m-bq__introPanel m-bq__introPanel--simple">' +
                '<button type="button" class="m-bq__btn m-bq__btn--big" data-lq-action="start">Start the benchmark <span class="m-bq__btnChevron" aria-hidden="true">→</span></button>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'picker') {
        var optionsHtml = VERTICALS.map(function(v) {
          return '' +
            '<button type="button" class="m-bq__option" data-lq-vertical="' + escapeHtml(v.id) + '">' +
              '<span class="m-bq__optionLabel">' + escapeHtml(v.label) + '</span>' +
              '<span class="m-bq__optionMeta"><span></span><span class="m-bq__optionArrow">→</span></span>' +
            '</button>';
        }).join('') +
          '<button type="button" class="m-bq__option" data-lq-vertical="' + escapeHtml(AGENCY_OPTION.id) + '">' +
            '<span class="m-bq__optionLabel">' + escapeHtml(AGENCY_OPTION.label) + '</span>' +
            '<span class="m-bq__optionMeta"><span></span><span class="m-bq__optionArrow">→</span></span>' +
          '</button>' +
          '<button type="button" class="m-bq__option" data-lq-vertical="' + escapeHtml(OTHER_OPTION.id) + '">' +
            '<span class="m-bq__optionLabel">' + escapeHtml(OTHER_OPTION.label) + '</span>' +
            '<span class="m-bq__optionMeta"><span></span><span class="m-bq__optionArrow">→</span></span>' +
          '</button>';

        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__progressRow"><div class="m-bq__progressText">Step 1 of 2 · Pick your category</div><div></div></div>' +
            '<div class="m-bq__bar" aria-hidden="true"><div class="m-bq__barFill" style="width:15%"></div></div>' +
            '<div class="m-bq__statusPill">Matching you to the right benchmark</div>' +
            '<h3 class="m-bq__qTitle">What describes your brand?</h3>' +
            '<p class="m-bq__qSupport">Get personalized feedback on exactly how your brand&rsquo;s AI visibility compares to similar brands in your category.</p>' +
            '<div class="m-bq__options">' + optionsHtml + '</div>' +
            '<div class="m-bq__questionFoot">One tap advances immediately. Your industry-specific benchmark loads next.</div>' +
          '</div>';
      }

      if (state.screen === 'analysis') {
        var vObj = findVertical(state.pickedVertical);
        var analysisText;
        if (state.pickedVertical === 'agency') {
          analysisText = 'Switching to the agency-track benchmark&mdash; different questions tuned for client-facing work.';
        } else if (state.pickedVertical === 'other') {
          analysisText = 'Preparing a general playbook preview for categories we don&rsquo;t yet have a benchmark for.';
        } else {
          analysisText = 'Matching you to ' + (vObj ? vObj.industryPlural : 'similar brands') + ' and loading the ' + (vObj ? vObj.label.toLowerCase() : 'industry') + ' benchmark.';
        }
        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__analysis">' +
              '<div class="m-bq__spinner" aria-hidden="true"></div>' +
              '<h3 class="m-bq__analysisTitle">Loading your benchmark&hellip;</h3>' +
              '<p class="m-bq__analysisText">' + analysisText + '</p>' +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'other-result') {
        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__resultLead">We don&rsquo;t have an industry benchmark for your category yet</div>' +
            '<h3 class="m-bq__resultTitle">Tell us your category &mdash; <strong class="m-bq__emph">we&rsquo;ll let you know when it&rsquo;s ready</strong>.</h3>' +
            '<p class="m-bq__sub">Industry benchmarks need enough similar brands in the sample before they&rsquo;re meaningful. Drop us your category below and we&rsquo;ll notify you when yours ships. You can also start with a general Metricus report, which covers what AI says about your brand regardless of category.</p>' +
            '<div class="m-bq__form">' +
              '<p class="m-bq__formTitle">Your category &middot; so we know what to build next</p>' +
              '<input class="m-bq__field" data-lq-field="category" type="text" placeholder="e.g. indie game studio, legal cannabis, robotics startup" autocomplete="off">' +
              '<input class="m-bq__field" data-lq-field="email" type="email" placeholder="you@company.com" autocomplete="email">' +
              '<textarea class="m-bq__field m-bq__textarea" data-lq-field="note" placeholder="What&rsquo;s one thing AI gets wrong about your category? (optional)"></textarea>' +
              '<div class="m-bq__formRow"><button type="button" class="m-bq__btn" data-lq-action="other-email">Notify me when it&rsquo;s ready</button></div>' +
              '<p class="m-bq__small">We&rsquo;ll email you once when a benchmark for your category ships. That&rsquo;s it.</p>' +
              (state.emailSent ? '<p class="m-bq__thanks">Thanks &mdash; we&rsquo;ll be in touch.</p>' : '') +
            '</div>' +
            '<div class="m-bq__ctaSet">' +
              '<a class="m-bq__linkBtn" data-lq-action="other-report" href="/get-report/?source=landing-quiz-other">See what AI actually says about my brand</a>' +
              '<a class="m-bq__linkBtn m-bq__linkBtn--secondary" data-lq-action="other-sample" href="/sample-ai-visibility-report/">See a sample report</a>' +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'handoff') {
        // The handoff container will be rendered directly by the engine/quiz we mount.
        // This screen is only shown briefly while we wait for the vertical script to load.
        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__analysis">' +
              '<div class="m-bq__spinner" aria-hidden="true"></div>' +
              '<h3 class="m-bq__analysisTitle">Loading benchmark&hellip;</h3>' +
              '<p class="m-bq__analysisText">If this takes longer than a couple of seconds, check your connection.</p>' +
            '</div>' +
          '</div>';
      }

      return '';
    }

    function handoffToVertical(vObj) {
      tracked('HANDOFF', { Vertical: vObj.id });
      trackedGtag('landing_quiz_handoff', { vertical: vObj.id });
      state.screen = 'handoff';
      render();
      ensureScript(vObj.script).then(function() {
        // Replace our root with a fresh benchmark mount. Engine MutationObserver picks it up.
        // data-autostart skips the per-vertical intro — the landing quiz IS the entrance.
        var shell = document.createElement('div');
        shell.setAttribute('data-benchmark-quiz', vObj.benchmarkKey);
        shell.setAttribute('data-source', 'landing-quiz-' + vObj.id);
        shell.setAttribute('data-autostart', '1');
        root.parentNode.replaceChild(shell, root);
      }).catch(function() {
        state.screen = 'other-result';
        render();
      });
    }

    function handoffToAgency() {
      tracked('HANDOFF', { Vertical: 'agency' });
      trackedGtag('landing_quiz_handoff', { vertical: 'agency' });
      state.screen = 'handoff';
      render();
      ensureScript('/js/agency-quiz.js').then(function() {
        var shell = document.createElement('div');
        shell.setAttribute('data-agency-quiz', '1');
        shell.setAttribute('data-source', 'landing-quiz-agency');
        shell.setAttribute('data-autostart', '1');
        root.parentNode.replaceChild(shell, root);
      }).catch(function() {
        state.screen = 'other-result';
        render();
      });
    }

    function pickVertical(id) {
      state.pickedVertical = id;
      tracked('PICKER', { Vertical: id });
      trackedGtag('landing_quiz_picker', { vertical: id });

      if (id === 'agency') {
        state.screen = 'analysis';
        render();
        window.setTimeout(function() { handoffToAgency(); }, 1300);
        return;
      }
      if (id === 'other') {
        state.screen = 'analysis';
        render();
        window.setTimeout(function() { state.screen = 'other-result'; render(); }, 1100);
        return;
      }

      var vObj = findVertical(id);
      if (!vObj) {
        state.screen = 'other-result';
        render();
        return;
      }
      state.screen = 'analysis';
      render();
      window.setTimeout(function() { handoffToVertical(vObj); }, 1400);
    }

    function bind() {
      var startBtn = root.querySelector('[data-lq-action="start"]');
      if (startBtn) {
        startBtn.addEventListener('click', function() {
          tracked('START', {});
          trackedGtag('landing_quiz_start', {});
          state.screen = 'picker';
          render();
        });
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-lq-vertical]'), function(btn) {
        btn.addEventListener('click', function() {
          btn.classList.add('is-picked');
          pickVertical(btn.getAttribute('data-lq-vertical'));
        });
      });

      var otherReport = root.querySelector('[data-lq-action="other-report"]');
      if (otherReport) {
        otherReport.addEventListener('click', function() {
          tracked('OTHER_CTA_REPORT', {});
          trackedGtag('landing_quiz_other_cta_report', {});
        });
      }

      var otherSample = root.querySelector('[data-lq-action="other-sample"]');
      if (otherSample) {
        otherSample.addEventListener('click', function() {
          tracked('OTHER_CTA_SAMPLE', {});
          trackedGtag('landing_quiz_other_cta_sample', {});
        });
      }

      var otherEmail = root.querySelector('[data-lq-action="other-email"]');
      if (otherEmail) {
        otherEmail.addEventListener('click', function() {
          var emailField = root.querySelector('[data-lq-field="email"]');
          var noteField = root.querySelector('[data-lq-field="note"]');
          var catField = root.querySelector('[data-lq-field="category"]');
          var email = emailField ? String(emailField.value || '').trim() : '';
          var note = noteField ? String(noteField.value || '').trim() : '';
          var category = catField ? String(catField.value || '').trim() : '';
          if (!email || !/.+@.+\..+/.test(email)) {
            if (emailField) emailField.focus();
            return;
          }
          if (!category) {
            if (catField) catField.focus();
            return;
          }
          tracked('OTHER_NOTIFY', { Category: category, Note: note }, email);
          trackedGtag('landing_quiz_other_notify', { category: category });
          state.emailSent = true;
          render();
        });
      }
    }

    tracked('VIEW', {});
    render();
  }

  function mountAll() {
    if (window.MetricusBenchmarkQuizEngine && typeof window.MetricusBenchmarkQuizEngine.ensureStyle === 'function') {
      window.MetricusBenchmarkQuizEngine.ensureStyle();
    }
    var nodes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < nodes.length; i++) mountOne(nodes[i]);
  }

  function run() {
    if (!window.MetricusBenchmarkQuizEngine) {
      // Engine script hasn't loaded yet — wait briefly.
      var tries = 0;
      var wait = setInterval(function() {
        tries += 1;
        if (window.MetricusBenchmarkQuizEngine) {
          clearInterval(wait);
          mountAll();
        } else if (tries > 40) {
          clearInterval(wait);
        }
      }, 50);
      return;
    }
    mountAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
