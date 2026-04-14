/*
 * Metricus benchmark quiz engine
 *
 * Wrapper usage:
 *   window.MetricusBenchmarkQuizEngine.boot({
 *     key: 'insurance',
 *     selector: '[data-benchmark-quiz="insurance"]',
 *     sourceDefault: 'insurance-ai-visibility',
 *     storageKey: 'metricusInsuranceBenchmarkAnonSeed',
 *     dataUrl: '/js/benchmark-quizzes/insurance-benchmark-cohorts.json',
 *     config: { ... }
 *   });
 */
(function(global) {
  'use strict';

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var STYLE_ID = 'metricus-benchmark-quiz-style';
  var MOUNT_FLAG_PREFIX = 'mbq-mounted';

  var DEFAULT_COLORS = {
    primary: '#515F74',
    primaryDim: '#455368',
    accent: '#0f8a62',
    accentDim: '#0a6d4d',
    accentSoft: '#e7f6ef',
    surface: '#f7f9fb',
    surfaceLow: '#f0f4f7',
    surfaceHigh: '#e8eff3',
    border: '#a9b4b9',
    borderLight: '#d9e4ea',
    text: '#2a3439',
    textDim: '#566166',
    white: '#ffffff'
  };

  function mergeColors(overrides) {
    var merged = {};
    var key;
    for (key in DEFAULT_COLORS) merged[key] = DEFAULT_COLORS[key];
    for (key in (overrides || {})) merged[key] = overrides[key];
    return merged;
  }

  function buildCss(c) {
    return [
      '.m-bq{position:relative;left:50%;transform:translateX(-50%);width:min(calc(100vw - 2rem),980px);max-width:980px;margin:2.35rem 0;font-family:"Public Sans",Arial,sans-serif;color:' + c.text + ';}',
      '@media(max-width:767px){.m-bq{width:calc(100vw - 1.25rem)}}',
      '.m-bq *{box-sizing:border-box}',
      '.m-bq__shell{border-top:3px dotted ' + c.border + ';border-bottom:3px dotted ' + c.border + ';padding:.8rem 0;background:linear-gradient(180deg, rgba(231,246,239,0.74), rgba(255,255,255,0.97))}',
      '@media(min-width:768px){.m-bq__shell{padding:1.35rem 0}}',
      '.m-bq__wrap{background:' + c.white + ';border:1px solid ' + c.borderLight + ';padding:1rem;min-height:540px;box-shadow:0 18px 44px rgba(81,95,116,0.09);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease}',
      '@media(min-width:768px){.m-bq__wrap{padding:1.4rem 1.7rem 1.5rem}}',
      '@media(max-width:767px){.m-bq__wrap{min-height:500px}}',
      '.m-bq__wrap--intro{min-height:auto;border-color:#c7e5d7;box-shadow:0 22px 48px rgba(15,138,98,0.12)}',
      '@media(hover:hover){.m-bq__wrap--intro:hover{transform:translateY(-2px);box-shadow:0 26px 56px rgba(15,138,98,0.15)}}',
      '.m-bq__top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.15rem}',
      '.m-bq__brand{font-family:"Newsreader",Georgia,serif;font-size:2.1rem;line-height:1;color:' + c.primary + ';font-weight:700;letter-spacing:-0.04em}',
      '.m-bq__meta{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:' + c.textDim + ';text-align:right}',
      '.m-bq__screen{animation:mbqFade .26s ease;min-height:470px;display:flex;flex-direction:column}',
      '.m-bq__screen--intro{min-height:auto}',
      '@keyframes mbqFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      '.m-bq__introBody{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(280px,.88fr);gap:1rem;align-items:start;max-width:none}',
      '@media(max-width:819px){.m-bq__introBody{grid-template-columns:1fr}}',
      '.m-bq__introMain{max-width:44rem}',
      '.m-bq__introKickers{display:flex;flex-wrap:wrap;gap:.45rem;margin:0 0 .75rem}',
      '.m-bq__kicker{display:inline-flex;align-items:center;padding:.4rem .64rem;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;background:' + c.accentSoft + ';border:1px solid #c7e5d7;color:' + c.accent + ';font-weight:700}',
      '.m-bq__title{font-family:"Newsreader",Georgia,serif;font-size:2.15rem;line-height:1.02;letter-spacing:-0.04em;color:' + c.text + ';margin:0 0 .7rem}',
      '@media(min-width:768px){.m-bq__title{font-size:2.8rem}}',
      '.m-bq__lead{font-size:1.08rem;line-height:1.48;margin:0 0 .7rem;color:' + c.text + ';max-width:48rem}',
      '.m-bq__sub{font-size:.98rem;line-height:1.55;margin:0 0 .68rem;color:' + c.textDim + ';max-width:50rem}',
      '.m-bq__introPanel{background:linear-gradient(180deg,#f7fcfa,' + c.accentSoft + ');border:1px solid #b9dccd;padding:.88rem .92rem;display:flex;flex-direction:column;justify-content:space-between;gap:.85rem;box-shadow:0 12px 26px rgba(15,138,98,0.09);min-height:272px}',
      '.m-bq__introFlow{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.55rem}',
      '.m-bq__introFlowLabel{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;color:' + c.accent + ';font-weight:800}',
      '.m-bq__introDots{display:inline-flex;gap:.26rem;align-items:center}',
      '.m-bq__introDot{width:7px;height:7px;border-radius:999px;background:#b9dccd}',
      '.m-bq__introDot.is-active{background:' + c.accent + '}',
      '.m-bq__introQuestion{font-family:"Newsreader",Georgia,serif;font-size:1.34rem;line-height:1.05;letter-spacing:-0.03em;color:' + c.text + ';margin:0 0 .72rem}',
      '.m-bq__introPreview{display:grid;gap:.46rem;margin:0 0 .78rem}',
      '.m-bq__previewTile{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.58rem .7rem;background:rgba(255,255,255,.88);border:1px solid #c7e5d7;color:' + c.text + ';font-size:.9rem;line-height:1.25;font-weight:600}',
      '.m-bq__previewHint{font-size:.78rem;line-height:1.35;color:' + c.textDim + ';margin:0}',
      '.m-bq__previewGhost{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:' + c.accent + ';font-weight:800;white-space:nowrap}',
      '.m-bq__time{font-size:.95rem;line-height:1.35;color:' + c.text + ';margin:0 0 1.05rem;font-weight:600}',
      '.m-bq__ctaRow{display:flex;justify-content:flex-start;align-items:center;padding-top:.2rem}',
      '.m-bq__ctaRow--intro{padding-top:0}',
      '.m-bq__btn,.m-bq__linkBtn,.m-bq__ghost{font-family:inherit;font-size:1rem;line-height:1.2;border:0;cursor:pointer;transition:all .16s ease}',
      '.m-bq__btn{display:inline-flex;align-items:center;justify-content:center;background:' + c.accent + ';color:#fff;padding:.86rem 1.35rem;font-weight:700;min-width:8.2rem;box-shadow:0 12px 24px rgba(15,138,98,0.22)}',
      '.m-bq__btn:hover{background:' + c.accentDim + ';transform:translateY(-1px)}',
      '.m-bq__btn:disabled{opacity:.55;cursor:default}',
      '.m-bq__btnChevron{display:inline-block;margin-left:.45rem;font-size:1rem;line-height:1;transform:translateY(1px)}',
      '.m-bq__ghost{background:transparent;color:' + c.primary + ';padding:.55rem 0;font-weight:600}',
      '.m-bq__progressRow{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.55rem}',
      '.m-bq__progressText{font-size:.77rem;letter-spacing:.14em;text-transform:uppercase;color:' + c.textDim + ';font-weight:700}',
      '.m-bq__statusPill{display:inline-flex;align-items:center;padding:.38rem .62rem;font-size:.71rem;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;background:' + c.accentSoft + ';border:1px solid #c7e5d7;color:' + c.accent + ';font-weight:700;margin-bottom:.8rem}',
      '.m-bq__bar{height:8px;background:' + c.surfaceLow + ';overflow:hidden;margin-bottom:1rem}',
      '.m-bq__barFill{height:100%;background:' + c.accent + ';transition:width .22s ease}',
      '.m-bq__qTitle{font-family:"Newsreader",Georgia,serif;font-size:1.92rem;line-height:1.06;letter-spacing:-0.03em;margin:0 0 .55rem}',
      '@media(min-width:768px){.m-bq__qTitle{font-size:2.35rem}}',
      '.m-bq__qSupport{font-size:.97rem;line-height:1.5;color:' + c.textDim + ';margin:0 0 1rem;max-width:45rem}',
      '.m-bq__options{display:grid;grid-template-columns:1fr;gap:.7rem;flex:1;align-content:start;grid-auto-rows:1fr;min-height:248px}',
      '@media(min-width:760px){.m-bq__options{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '.m-bq__option{width:100%;text-align:left;background:linear-gradient(180deg,' + c.white + ', ' + c.surface + ');border:1px solid ' + c.borderLight + ';padding:.8rem .9rem .85rem;color:' + c.text + ';font-size:1rem;line-height:1.35;position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:.7rem;min-height:90px;box-shadow:0 6px 18px rgba(81,95,116,0.05)}',
      '.m-bq__option:hover{border-color:' + c.accent + ';background:linear-gradient(180deg,' + c.white + ', ' + c.surfaceLow + ');transform:translateY(-1px)}',
      '.m-bq__option.is-picked{border-color:' + c.accent + ';background:linear-gradient(180deg,#f4fbf8,' + c.accentSoft + ');color:' + c.text + ';box-shadow:0 10px 24px rgba(15,138,98,0.12)}',
      '.m-bq__optionLabel{display:block;font-size:.98rem;line-height:1.34;font-weight:600;color:' + c.text + ';max-width:92%}',
      '.m-bq__optionMeta{display:flex;align-items:center;justify-content:space-between;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:' + c.textDim + ';font-weight:700}',
      '.m-bq__optionArrow{font-size:1rem;color:' + c.accent + '}',
      '.m-bq__questionFoot{margin-top:.75rem;font-size:.84rem;line-height:1.45;color:' + c.textDim + '}',
      '.m-bq__spinner{width:32px;height:32px;border:3px solid ' + c.borderLight + ';border-top-color:' + c.accent + ';border-radius:50%;animation:mbqSpin .8s linear infinite;margin:0 auto 1rem}',
      '@keyframes mbqSpin{to{transform:rotate(360deg)}}',
      '.m-bq__loading{text-align:center;padding:2rem 0}',
      '.m-bq__analysis{max-width:30rem;margin:auto;text-align:center;padding:1rem 0}',
      '.m-bq__analysisTitle{font-family:"Newsreader",Georgia,serif;font-size:2rem;line-height:1.04;letter-spacing:-0.03em;margin:0 0 .45rem;color:' + c.text + '}',
      '.m-bq__analysisText{font-size:1rem;line-height:1.5;color:' + c.textDim + ';margin:0}',
      '.m-bq__error{background:#fff7f7;border-left:4px solid #b42318;padding:1rem;color:#7a271a}',
      '.m-bq__resultLead{font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:' + c.textDim + ';font-weight:700;margin:0 0 .55rem}',
      '.m-bq__resultTitle{font-family:"Newsreader",Georgia,serif;font-size:2.05rem;line-height:1.03;letter-spacing:-0.04em;margin:0 0 .8rem}',
      '.m-bq__stats{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:.65rem;margin:0 0 .8rem}',
      '@media(min-width:760px){.m-bq__stats{grid-template-columns:1.15fr 1fr 1fr}}',
      '.m-bq__statCard{background:linear-gradient(180deg,' + c.white + ',' + c.surface + ');border:1px solid ' + c.borderLight + ';padding:.82rem .88rem .9rem;box-shadow:0 6px 18px rgba(81,95,116,0.05)}',
      '.m-bq__statCard--score{background:linear-gradient(180deg,' + c.surfaceHigh + ',' + c.surface + ')}',
      '.m-bq__statLabel{font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:' + c.textDim + ';font-weight:700;margin-bottom:.45rem}',
      '.m-bq__scoreValue{font-family:"Newsreader",Georgia,serif;font-size:3.55rem;line-height:.88;color:' + c.text + ';letter-spacing:-0.06em}',
      '.m-bq__scoreScale{font-size:.9rem;color:' + c.textDim + ';margin-top:.18rem}',
      '.m-bq__statBig{font-family:"Newsreader",Georgia,serif;font-size:2rem;line-height:1;color:' + c.text + ';letter-spacing:-0.04em}',
      '.m-bq__statDesc{font-size:.92rem;line-height:1.45;color:' + c.text + ';margin-top:.32rem}',
      '.m-bq__emph{font-weight:800;color:' + c.text + '}',
      '.m-bq__tier{display:inline-flex;align-items:center;background:' + c.accentSoft + ';border:1px solid #c7e5d7;padding:.42rem .68rem;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;color:' + c.accent + ';font-weight:800;margin:.15rem 0 .8rem}',
      '.m-bq__callouts{display:grid;gap:.65rem;margin-bottom:.8rem}',
      '@media(min-width:820px){.m-bq__callouts{grid-template-columns:1fr 1fr}}',
      '.m-bq__callout{background:' + c.surface + ';border:1px solid ' + c.borderLight + ';padding:.82rem .9rem}',
      '.m-bq__calloutLabel{font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:' + c.textDim + ';font-weight:700;margin-bottom:.42rem}',
      '.m-bq__diag,.m-bq__meaning{font-size:.98rem;line-height:1.52;color:' + c.text + ';margin:0}',
      '.m-bq__meaning{color:' + c.textDim + '}',
      '.m-bq__bullets{margin:0 0 .8rem;padding-left:1.05rem;color:' + c.textDim + ';font-size:.94rem}',
      '.m-bq__bullets li{margin:.28rem 0;line-height:1.42}',
      '.m-bq__flags{display:flex;flex-wrap:wrap;gap:.5rem;margin:.8rem 0 .95rem}',
      '.m-bq__flag{font-size:.78rem;line-height:1.2;padding:.44rem .62rem;background:' + c.surfaceLow + ';border:1px solid ' + c.borderLight + ';color:' + c.text + ';font-weight:700}',
      '.m-bq__guard{font-size:.86rem;line-height:1.45;color:' + c.textDim + ';border-top:1px solid ' + c.borderLight + ';padding-top:.8rem;margin-top:.8rem}',
      '.m-bq__ctaSet{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}',
      '.m-bq__linkBtn{display:inline-flex;align-items:center;justify-content:center;background:' + c.accent + ';color:#fff;padding:.82rem 1.05rem;font-weight:700;text-decoration:none;min-height:46px}',
      '.m-bq__linkBtn:hover{background:' + c.accentDim + '}',
      '.m-bq__linkBtn--secondary{background:' + c.white + ';color:' + c.text + ';border:1px solid ' + c.borderLight + '}',
      '.m-bq__linkBtn--secondary:hover{background:' + c.surface + '}',
      '.m-bq__form{margin-top:1.1rem;border-top:1px solid ' + c.borderLight + ';padding-top:1rem}',
      '.m-bq__formTitle{font-size:.84rem;letter-spacing:.12em;text-transform:uppercase;color:' + c.textDim + ';margin:0 0 .55rem}',
      '.m-bq__field{display:block;width:100%;font-family:inherit;font-size:.92rem;line-height:1.35;padding:.78rem .82rem;border:1px solid ' + c.borderLight + ';background:#fff;color:' + c.text + ';outline:0;margin:0 0 .65rem}',
      '.m-bq__field:focus{border-color:' + c.accent + '}',
      '.m-bq__textarea{min-height:92px;resize:vertical}',
      '.m-bq__formRow{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center}',
      '.m-bq__small{font-size:.82rem;line-height:1.42;color:' + c.textDim + ';margin-top:.3rem}',
      '.m-bq__thanks{font-size:.9rem;line-height:1.4;color:' + c.accent + ';font-weight:600;margin-top:.5rem}'
    ].join('');
  }

  function injectStyle(colors) {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = buildCss(colors);
    (document.head || document.documentElement).appendChild(style);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      if (global.crypto && global.crypto.getRandomValues) {
        var arr = new Uint32Array(2);
        global.crypto.getRandomValues(arr);
        raw = Array.prototype.map.call(arr, function(num) {
          return ('00000000' + num.toString(16)).slice(-8);
        }).join('');
      }
    } catch (err) {}
    if (!raw) raw = String(Date.now()) + String(Math.random()).slice(2);
    return prefix + '_' + hashString(raw);
  }

  function getAnonymousId(storageKey) {
    var seed = '';
    try {
      seed = global.localStorage ? global.localStorage.getItem(storageKey) || '' : '';
    } catch (err) {}
    if (!seed) {
      seed = randomId('seed') + '_' + String(Date.now());
      try {
        if (global.localStorage) global.localStorage.setItem(storageKey, seed);
      } catch (err2) {}
    }
    return 'anon_' + hashString(seed + '|' + (navigator.userAgent || 'ua'));
  }

  function track(kind, source, payload, contact) {
    try {
      var extras = payload || {};
      var parts = [kind, 'Source: ' + (source || 'unknown')];
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
      if (typeof global.gtag === 'function') global.gtag('event', name, params || {});
    } catch (err) {}
  }

  function interpolate(template, values) {
    return String(template || '').replace(/\{([^}]+)\}/g, function(match, key) {
      return values[key] == null ? '' : values[key];
    });
  }

  function topKeyFromCounts(counts) {
    if (!counts) return null;
    var topKey = null;
    var topValue = -1;
    Object.keys(counts).forEach(function(key) {
      if (counts[key] > topValue) {
        topValue = counts[key];
        topKey = key;
      }
    });
    return topKey;
  }

  function estimatePercentile(score, cohort) {
    var points = [
      { score: Math.max(0, cohort.p10 - 10), pct: 2 },
      { score: cohort.p10, pct: 10 },
      { score: cohort.p25, pct: 25 },
      { score: cohort.p50, pct: 50 },
      { score: cohort.p75, pct: 75 },
      { score: cohort.p90, pct: 90 },
      { score: Math.min(100, cohort.p90 + 10), pct: 98 }
    ];
    if (score <= points[0].score) return 1;
    if (score >= points[points.length - 1].score) return 99;
    for (var i = 1; i < points.length; i++) {
      if (score <= points[i].score) {
        var prev = points[i - 1];
        var next = points[i];
        var ratio = (score - prev.score) / Math.max(0.0001, next.score - prev.score);
        return round1(prev.pct + ((next.pct - prev.pct) * ratio));
      }
    }
    return 50;
  }

  function boot(bootstrap) {
    if (!bootstrap || !bootstrap.config || !bootstrap.key || !bootstrap.dataUrl) return;

    var cfg = bootstrap.config;
    var colors = mergeColors(cfg.colors || {});
    var selector = bootstrap.selector || '[data-benchmark-quiz="' + bootstrap.key + '"]';
    var mountFlag = 'data-' + MOUNT_FLAG_PREFIX + '-' + String(bootstrap.key)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    var storageKey = bootstrap.storageKey || ('metricus' + bootstrap.key + 'BenchmarkAnonSeed');
    var sourceDefault = bootstrap.sourceDefault || (bootstrap.key + '-ai-visibility');
    var analyticsPrefix = cfg.analyticsPrefix || ('BENCHMARK_' + bootstrap.key.toUpperCase());

    function optionLabel(questionId, optionId) {
      var question = cfg.questions[questionId];
      if (!question) return optionId;
      for (var i = 0; i < question.options.length; i++) {
        if (question.options[i].id === optionId) return question.options[i].label;
      }
      return optionId;
    }

    function orgPlural(answerId) {
      return (cfg.resultEngine.orgPluralMap && cfg.resultEngine.orgPluralMap[answerId]) ||
        cfg.resultEngine.industryPlural ||
        'brands';
    }

    function footprintShort(value) {
      return (cfg.resultEngine.footprintShortMap && cfg.resultEngine.footprintShortMap[value]) || value;
    }

    function resolveQuestionIds(answers) {
      var ids = ['org_type', 'segment', 'footprint', 'main_failure'];
      if (answers.main_failure) {
        var discoverabilityAnswers = (cfg.branching && cfg.branching.discoverabilityAnswers) || [];
        ids.push(discoverabilityAnswers.indexOf(answers.main_failure) !== -1 ? 'q5_discoverability' : 'q5_accuracy');
      }
      ids.push('business_impact');
      return ids;
    }

    function normalizeValue(field, value) {
      var mapping = (cfg.normalization && cfg.normalization[field]) || {};
      return mapping[value] || value;
    }

    function normalizeAnswers(answers) {
      return {
        vertical: bootstrap.key,
        org_type: normalizeValue('org_type', answers.org_type),
        segment: normalizeValue('segment', answers.segment),
        footprint: normalizeValue('footprint', answers.footprint),
        main_failure: answers.main_failure,
        q5_discoverability: answers.q5_discoverability || null,
        q5_accuracy: answers.q5_accuracy || null,
        business_impact: answers.business_impact
      };
    }

    function applyDelta(dimensions, delta) {
      if (!delta) return;
      ['discoverability', 'accuracy', 'displacement', 'complexity'].forEach(function(key) {
        if (delta[key] == null) return;
        dimensions[key] = clamp(dimensions[key] + delta[key], 0, 100);
      });
    }

    function bandLabel(score) {
      var bands = cfg.resultEngine.bands || [];
      for (var i = 0; i < bands.length; i++) {
        if (score <= bands[i].max) return bands[i].label;
      }
      return bands.length ? bands[bands.length - 1].label : 'Benchmark tier';
    }

    function buildResult(dataMap, answers, source) {
      var normalized = normalizeAnswers(answers);
      var key = [bootstrap.key, normalized.org_type, normalized.segment, normalized.footprint].join('__');
      var cohort = dataMap[key];
      if (!cohort) return null;

      var dimensions = {
        discoverability: cohort.avgDiscoverability,
        accuracy: cohort.avgAccuracy,
        displacement: cohort.avgDisplacement,
        complexity: cohort.avgComplexity
      };

      applyDelta(dimensions, cfg.resultEngine.adjustments.main_failure[normalized.main_failure]);
      if (normalized.q5_discoverability) {
        applyDelta(dimensions, cfg.resultEngine.adjustments.q5_discoverability[normalized.q5_discoverability]);
      }
      if (normalized.q5_accuracy) {
        applyDelta(dimensions, cfg.resultEngine.adjustments.q5_accuracy[normalized.q5_accuracy]);
      }

      Object.keys(dimensions).forEach(function(dim) {
        dimensions[dim] = round1(clamp(dimensions[dim], 0, 100));
      });

      var weights = cfg.resultEngine.weights;
      var score = round1(
        (dimensions.discoverability * weights.discoverability) +
        (dimensions.accuracy * weights.accuracy) +
        (dimensions.displacement * weights.displacement) +
        (dimensions.complexity * weights.complexity)
      );
      score = clamp(score, 0, 100);

      var percentile = estimatePercentile(score, cohort);
      var band = bandLabel(score);
      var flags = (cfg.resultEngine.flags || [])
        .filter(function(rule) { return dimensions[rule.dimension] <= rule.max; })
        .map(function(rule) { return rule.label; })
        .slice(0, 3);

      var orgLabel = optionLabel('org_type', answers.org_type);
      var segmentLabel = optionLabel('segment', answers.segment);
      var footprintLabel = footprintShort(answers.footprint);
      var profileOrgLabel = (cfg.resultEngine.profileLabelMap && cfg.resultEngine.profileLabelMap[answers.org_type]) ||
        (answers.org_type === 'other' ? (cfg.resultEngine.otherOrgProfileLabel || 'business') : orgLabel.toLowerCase());
      var profileLabel = [footprintLabel, segmentLabel.toLowerCase(), profileOrgLabel].join(' ');
      var peerGroupLabel = [footprintLabel, segmentLabel.toLowerCase(), orgPlural(answers.org_type)].join(' ');

      var topRiskKey = topKeyFromCounts(cohort.topRisks);
      var topFixKey = topKeyFromCounts(cohort.topFixes);
      var industryPlural = cfg.resultEngine.industryPlural || 'brands';
      var patternPhrase = cfg.resultEngine.patternPhrases[normalized.main_failure];
      var meaningPhrase = cfg.resultEngine.meaningPhrases[normalized.business_impact];
      var riskLabel = cfg.resultEngine.riskLabels[topRiskKey] || 'visibility risk';
      var fixLabel = cfg.resultEngine.fixLabels[topFixKey] || 'source structuring';

      var reportParams = [
        'source=' + encodeURIComponent((cfg.report && cfg.report.source) || source),
        'cohort=' + encodeURIComponent(key),
        'org_type=' + encodeURIComponent(normalized.org_type),
        'segment=' + encodeURIComponent(normalized.segment),
        'footprint=' + encodeURIComponent(normalized.footprint),
        'main_failure=' + encodeURIComponent(normalized.main_failure),
        'score=' + encodeURIComponent(score)
      ].join('&');

      return {
        cohortKey: key,
        sampleSize: cohort.sampleSize,
        score: score,
        percentile: percentile,
        band: band,
        avgScore: cohort.avgScore,
        flags: flags,
        profileLabel: profileLabel,
        peerGroupLabel: peerGroupLabel,
        patternPhrase: patternPhrase,
        meaningPhrase: meaningPhrase,
        topRiskLabel: riskLabel,
        topFixLabel: fixLabel,
        industryPlural: industryPlural,
        reportUrl: ((cfg.report && cfg.report.path) || '/get-report/') + '?' + reportParams,
        guardLine: cfg.result.guardLine
      };
    }

    function mountOne(root) {
      if (!root || root.hasAttribute(mountFlag)) return;
      root.setAttribute(mountFlag, '1');

      var source = root.getAttribute('data-source') || sourceDefault;
      var state = {
        screen: 'loading',
        stepIndex: 0,
        answers: {},
        loadingError: '',
        dataMap: null,
        result: null,
        emailSent: false,
        anonId: getAnonymousId(storageKey),
        quizId: randomId('quiz'),
        analysis: null
      };

      function tracked(kind, payload, contact) {
        var merged = { AnonId: state.anonId, QuizId: state.quizId };
        var extras = payload || {};
        Object.keys(extras).forEach(function(key) {
          merged[key] = extras[key];
        });
        track(kind, source, merged, contact || state.anonId);
      }

      function trackedGtag(name, params) {
        var merged = { source: source, vertical: bootstrap.key, anon_id: state.anonId, quiz_id: state.quizId };
        var extras = params || {};
        Object.keys(extras).forEach(function(key) {
          merged[key] = extras[key];
        });
        gtagEvent(name, merged);
      }

      function render() {
        root.className = 'm-bq';
        var wrapClass = 'm-bq__wrap' + (state.screen === 'intro' ? ' m-bq__wrap--intro' : '');
        root.innerHTML = '<div class="m-bq__shell"><div class="' + wrapClass + '">' + screenHtml() + '</div></div>';
        bind();
      }

      function runAnalysis(config, done) {
        state.analysis = config;
        state.screen = 'analysis';
        render();
        global.setTimeout(function() {
          state.analysis = null;
          done();
        }, config.duration);
      }

      function topBar() {
        return '' +
          '<div class="m-bq__top">' +
            '<div class="m-bq__brand">Metricus</div>' +
            '<div class="m-bq__meta">' + escapeHtml(cfg.metaLabel || 'Benchmark research') + '</div>' +
          '</div>';
      }

      function introPreviewHtml() {
        var previewId = (cfg.intro && cfg.intro.previewQuestionId) || 'org_type';
        var previewQuestion = cfg.questions[previewId];
        var previewOptionIds = (cfg.intro && cfg.intro.previewOptionIds) || [];
        var previewOptions = [];
        var i;
        if (previewOptionIds.length) {
          for (i = 0; i < previewOptionIds.length; i++) {
            previewOptions.push(optionLabel(previewId, previewOptionIds[i]));
          }
        } else {
          for (i = 0; i < Math.min(3, previewQuestion.options.length); i++) {
            previewOptions.push(previewQuestion.options[i].label);
          }
        }
        return {
          headline: previewQuestion.headline,
          tiles: previewOptions.map(function(label) {
            return '<div class="m-bq__previewTile"><span>' + escapeHtml(label) + '</span><span class="m-bq__previewGhost">' + escapeHtml((cfg.intro && cfg.intro.previewGhostLabel) || 'Preview') + '</span></div>';
          }).join('')
        };
      }

      function questionStatus() {
        if (!state.answers.segment) return (cfg.questionStatus && cfg.questionStatus.empty) || 'Live benchmark path';
        return interpolate((cfg.questionStatus && cfg.questionStatus.active) || 'Building benchmark for {footprint} {segment} {orgPlural}…', {
          footprint: footprintShort(state.answers.footprint || normalizeValue('footprint', 'unknown') || 'regional'),
          segment: optionLabel('segment', state.answers.segment).toLowerCase(),
          orgPlural: orgPlural(state.answers.org_type || 'other')
        });
      }

      function screenHtml() {
        if (state.screen === 'loading') {
          return '' +
            '<div class="m-bq__screen m-bq__loading">' +
              '<div class="m-bq__spinner" aria-hidden="true"></div>' +
              '<p class="m-bq__sub">' + escapeHtml(cfg.loadingText || 'Loading the benchmark…') + '</p>' +
            '</div>';
        }

        if (state.screen === 'error') {
          return '' +
            '<div class="m-bq__screen">' +
              topBar() +
              '<div class="m-bq__error"><strong>Benchmark preview could not load.</strong> ' +
              escapeHtml(state.loadingError || 'Try a normal local or deployed web server preview.') +
              '</div>' +
            '</div>';
        }

        if (state.screen === 'analysis' && state.analysis) {
          return '' +
            '<div class="m-bq__screen">' +
              topBar() +
              '<div class="m-bq__analysis">' +
                '<div class="m-bq__spinner" aria-hidden="true"></div>' +
                '<h3 class="m-bq__analysisTitle">' + escapeHtml(state.analysis.title) + '</h3>' +
                '<p class="m-bq__analysisText">' + escapeHtml(state.analysis.text) + '</p>' +
              '</div>' +
            '</div>';
        }

        if (state.screen === 'intro') {
          var preview = introPreviewHtml();
          return '' +
            '<div class="m-bq__screen m-bq__screen--intro">' +
              topBar() +
              '<div class="m-bq__introBody">' +
                '<div class="m-bq__introMain">' +
                  '<div class="m-bq__introKickers">' +
                    '<span class="m-bq__kicker">' + escapeHtml((cfg.intro && cfg.intro.kickerOne) || '6 quick taps') + '</span>' +
                    '<span class="m-bq__kicker">' + escapeHtml((cfg.intro && cfg.intro.kickerTwo) || 'Instant result') + '</span>' +
                  '</div>' +
                  '<h3 class="m-bq__title">' + escapeHtml(cfg.intro.title) + '</h3>' +
                  '<p class="m-bq__lead">' + escapeHtml(cfg.intro.lead) + '</p>' +
                  '<p class="m-bq__sub">' + escapeHtml(cfg.intro.sub) + '</p>' +
                  '<p class="m-bq__time">' + escapeHtml(cfg.intro.timeText || 'Takes 60 seconds.') + '</p>' +
                '</div>' +
                '<div class="m-bq__introPanel">' +
                  '<div>' +
                    '<div class="m-bq__introFlow">' +
                      '<div class="m-bq__introFlowLabel">Question 1 of 6</div>' +
                      '<div class="m-bq__introDots" aria-hidden="true">' +
                        '<span class="m-bq__introDot is-active"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span>' +
                      '</div>' +
                    '</div>' +
                    '<h4 class="m-bq__introQuestion">' + escapeHtml(preview.headline) + '</h4>' +
                    '<div class="m-bq__introPreview" aria-hidden="true">' + preview.tiles + '</div>' +
                    '<p class="m-bq__previewHint">' + escapeHtml((cfg.intro && cfg.intro.previewHint) || 'Starts in this module and reveals your benchmark here after 6 answers.') + '</p>' +
                  '</div>' +
                  '<div class="m-bq__ctaRow m-bq__ctaRow--intro"><button type="button" class="m-bq__btn" data-bq-action="start">' +
                    escapeHtml((cfg.intro && cfg.intro.ctaLabel) || 'Start here') +
                    ' <span class="m-bq__btnChevron" aria-hidden="true">↓</span></button></div>' +
                '</div>' +
              '</div>' +
            '</div>';
        }

        if (state.screen === 'question') {
          var questionIds = resolveQuestionIds(state.answers);
          var questionId = questionIds[state.stepIndex];
          var question = cfg.questions[questionId];
          var progress = Math.round(((state.stepIndex + 1) / questionIds.length) * 100);
          var optionsHtml = question.options.map(function(option) {
            return '' +
              '<button type="button" class="m-bq__option" data-bq-answer="' + escapeHtml(option.id) + '" data-bq-question="' + escapeHtml(questionId) + '">' +
                '<span class="m-bq__optionLabel">' + escapeHtml(option.label) + '</span>' +
                '<span class="m-bq__optionMeta"><span>Select answer</span><span class="m-bq__optionArrow">→</span></span>' +
              '</button>';
          }).join('');

          return '' +
            '<div class="m-bq__screen">' +
              topBar() +
              '<div class="m-bq__progressRow"><div class="m-bq__progressText">Question ' + (state.stepIndex + 1) + ' of ' + questionIds.length + '</div><div></div></div>' +
              '<div class="m-bq__bar" aria-hidden="true"><div class="m-bq__barFill" style="width:' + progress + '%"></div></div>' +
              '<div class="m-bq__statusPill">' + escapeHtml(questionStatus()) + '</div>' +
              '<h3 class="m-bq__qTitle">' + escapeHtml(question.headline) + '</h3>' +
              '<p class="m-bq__qSupport">' + escapeHtml(question.support) + '</p>' +
              '<div class="m-bq__options">' + optionsHtml + '</div>' +
              '<div class="m-bq__questionFoot">' + escapeHtml((cfg.questionsFootText) || 'One tap advances immediately. Your result appears after the sixth answer.') + '</div>' +
            '</div>';
        }

        if (state.screen === 'result' && state.result) {
          var flagsHtml = state.result.flags.map(function(flag) {
            return '<span class="m-bq__flag">' + escapeHtml(flag) + '</span>';
          }).join('');

          return '' +
            '<div class="m-bq__screen">' +
              topBar() +
              '<div class="m-bq__resultLead">' + escapeHtml(cfg.result.leadLabel || 'Your benchmark result') + '</div>' +
              '<h3 class="m-bq__resultTitle">' +
                escapeHtml(interpolate(cfg.result.titlePrefix || 'You landed in the ', {})) +
                '<strong class="m-bq__emph">' + escapeHtml(state.result.band) + '</strong>' +
                escapeHtml(cfg.result.titleSuffix || '.') +
              '</h3>' +
              '<div class="m-bq__stats">' +
                '<div class="m-bq__statCard m-bq__statCard--score"><div class="m-bq__statLabel">' + escapeHtml(cfg.result.scoreLabel || 'Your score') + '</div><div class="m-bq__scoreValue">' + escapeHtml(state.result.score) + '</div><div class="m-bq__scoreScale">out of 100</div></div>' +
                '<div class="m-bq__statCard"><div class="m-bq__statLabel">' + escapeHtml(cfg.result.percentileLabel || 'You scored higher than') + '</div><div class="m-bq__statBig">' + escapeHtml(state.result.percentile) + '%</div><div class="m-bq__statDesc">of <strong class="m-bq__emph">similar ' + escapeHtml(state.result.industryPlural) + '</strong> in this benchmark.</div></div>' +
                '<div class="m-bq__statCard"><div class="m-bq__statLabel">' + escapeHtml(cfg.result.averageLabel || 'Cohort average') + '</div><div class="m-bq__statBig">' + escapeHtml(state.result.avgScore) + '</div><div class="m-bq__statDesc">for <strong class="m-bq__emph">' + escapeHtml(state.result.peerGroupLabel) + '</strong>.</div></div>' +
              '</div>' +
              '<div class="m-bq__tier">' + escapeHtml(state.result.band) + '</div>' +
              '<div class="m-bq__callouts">' +
                '<div class="m-bq__callout"><div class="m-bq__calloutLabel">' + escapeHtml(cfg.result.diagnosisLabel || 'What your answers most strongly suggest') + '</div><p class="m-bq__diag">For a <strong class="m-bq__emph">' + escapeHtml(state.result.profileLabel) + '</strong>, your answers most strongly match a pattern where <strong class="m-bq__emph">' + escapeHtml(state.result.patternPhrase) + '</strong>.</p></div>' +
                '<div class="m-bq__callout"><div class="m-bq__calloutLabel">' + escapeHtml(cfg.result.meaningLabel || 'What this usually means') + '</div><p class="m-bq__meaning"><strong class="m-bq__emph">' + escapeHtml(state.result.meaningPhrase) + '</strong>.</p></div>' +
              '</div>' +
              '<ul class="m-bq__bullets"><li>In this cohort, <strong class="m-bq__emph">' + escapeHtml(state.result.topRiskLabel) + '</strong> is the most common pressure pattern.</li><li>The most common fix category in similar audits is <strong class="m-bq__emph">' + escapeHtml(state.result.topFixLabel) + '</strong>.</li></ul>' +
              (flagsHtml ? '<div class="m-bq__flags">' + flagsHtml + '</div>' : '') +
              '<p class="m-bq__guard">' + escapeHtml(state.result.guardLine) + '</p>' +
              '<div class="m-bq__ctaSet">' +
                '<a class="m-bq__linkBtn" data-bq-action="report" href="' + escapeHtml(state.result.reportUrl + '&quiz_id=' + encodeURIComponent(state.quizId)) + '">' + escapeHtml(cfg.result.primaryCta || 'See what AI actually says about my brand') + '</a>' +
                '<a class="m-bq__linkBtn m-bq__linkBtn--secondary" data-bq-action="sample" href="' + escapeHtml((cfg.result.sampleReportUrl) || '/sample-ai-visibility-report/') + '">' + escapeHtml(cfg.result.secondaryCta || 'See a sample report') + '</a>' +
              '</div>' +
              '<div class="m-bq__form">' +
                '<p class="m-bq__formTitle">' + escapeHtml(cfg.result.emailTitle || 'Send me this benchmark result') + '</p>' +
                '<input class="m-bq__field" data-bq-field="email" type="email" placeholder="you@company.com" autocomplete="email">' +
                '<textarea class="m-bq__field m-bq__textarea" data-bq-field="note" placeholder="' + escapeHtml(cfg.result.notePlaceholder || 'What&rsquo;s one wrong thing AI gets wrong most often about your brand or category? (optional)') + '"></textarea>' +
                '<div class="m-bq__formRow"><button type="button" class="m-bq__btn" data-bq-action="email-result">' + escapeHtml(cfg.result.emailCta || 'Send me this result') + '</button></div>' +
                '<p class="m-bq__small">' + escapeHtml(cfg.result.emailNote || 'This sends your benchmark summary only. The full Metricus report is a separate audit.') + '</p>' +
                (state.emailSent ? '<p class="m-bq__thanks">' + escapeHtml(cfg.result.emailThanks || 'Benchmark summary request received.') + '</p>' : '') +
              '</div>' +
            '</div>';
        }

        return '';
      }

      function bind() {
        var startBtn = root.querySelector('[data-bq-action="start"]');
        if (startBtn) {
          startBtn.addEventListener('click', function() {
            state.screen = 'question';
            state.stepIndex = 0;
            state.answers = {};
            state.result = null;
            state.emailSent = false;
            state.quizId = randomId('quiz');
            tracked(analyticsPrefix + '_START', {});
            trackedGtag('benchmark_quiz_start', { benchmark_key: bootstrap.key });
            render();
          });
        }

        Array.prototype.forEach.call(root.querySelectorAll('[data-bq-answer]'), function(btn) {
          btn.addEventListener('click', function() {
            var questionId = btn.getAttribute('data-bq-question');
            var answerId = btn.getAttribute('data-bq-answer');
            btn.classList.add('is-picked');
            state.answers[questionId] = answerId;

            if (questionId === 'main_failure') {
              delete state.answers.q5_discoverability;
              delete state.answers.q5_accuracy;
            }

            tracked(analyticsPrefix + '_' + questionId.toUpperCase(), { Answer: answerId });

            global.setTimeout(function() {
              var questionIds = resolveQuestionIds(state.answers);
              if (questionId === 'segment') {
                tracked(analyticsPrefix + '_ANALYSIS_STAGE', { Stage: 'segment_assembly' });
                runAnalysis({
                  title: (cfg.analysis.segmentAssembly && cfg.analysis.segmentAssembly.title) || 'Assembling your benchmark…',
                  text: (cfg.analysis.segmentAssembly && cfg.analysis.segmentAssembly.text) || 'Matching your category and peer group before the next questions.',
                  duration: (cfg.analysis.segmentAssembly && cfg.analysis.segmentAssembly.duration) || 1300
                }, function() {
                  state.screen = 'question';
                  state.stepIndex += 1;
                  render();
                });
                return;
              }

              if (state.stepIndex >= questionIds.length - 1) {
                tracked(analyticsPrefix + '_ANALYSIS_STAGE', { Stage: 'result_calculation' });
                runAnalysis({
                  title: (cfg.analysis.resultCalculation && cfg.analysis.resultCalculation.title) || 'Preparing your benchmark result…',
                  text: (cfg.analysis.resultCalculation && cfg.analysis.resultCalculation.text) || 'Matching your answers to similar brands and calculating your result.',
                  duration: (cfg.analysis.resultCalculation && cfg.analysis.resultCalculation.duration) || 2200
                }, function() {
                  state.result = buildResult(state.dataMap, state.answers, source);
                  state.screen = 'result';
                  tracked(analyticsPrefix + '_COMPLETE', {
                    Score: state.result ? state.result.score : '',
                    Percentile: state.result ? state.result.percentile : '',
                    Cohort: state.result ? state.result.cohortKey : ''
                  });
                  trackedGtag('benchmark_quiz_complete', {
                    benchmark_key: bootstrap.key,
                    score: state.result ? state.result.score : '',
                    cohort: state.result ? state.result.cohortKey : ''
                  });
                  render();
                });
              } else {
                state.stepIndex += 1;
                state.screen = 'question';
                render();
              }
            }, 180);
          });
        });

        var reportLink = root.querySelector('[data-bq-action="report"]');
        if (reportLink) {
          reportLink.addEventListener('click', function() {
            tracked(analyticsPrefix + '_CTA_REPORT', {
              Score: state.result ? state.result.score : '',
              Cohort: state.result ? state.result.cohortKey : ''
            });
            trackedGtag('benchmark_quiz_report_click', {
              benchmark_key: bootstrap.key,
              score: state.result ? state.result.score : ''
            });
          });
        }

        var sampleLink = root.querySelector('[data-bq-action="sample"]');
        if (sampleLink) {
          sampleLink.addEventListener('click', function() {
            tracked(analyticsPrefix + '_CTA_SAMPLE', {
              Score: state.result ? state.result.score : '',
              Cohort: state.result ? state.result.cohortKey : ''
            });
          });
        }

        var emailBtn = root.querySelector('[data-bq-action="email-result"]');
        if (emailBtn) {
          emailBtn.addEventListener('click', function() {
            var emailField = root.querySelector('[data-bq-field="email"]');
            var noteField = root.querySelector('[data-bq-field="note"]');
            var email = emailField ? String(emailField.value || '').trim() : '';
            var note = noteField ? String(noteField.value || '').trim() : '';
            if (!email || !/.+@.+\..+/.test(email)) {
              if (emailField) emailField.focus();
              return;
            }
            tracked(analyticsPrefix + '_EMAIL_RESULT', {
              Score: state.result ? state.result.score : '',
              Cohort: state.result ? state.result.cohortKey : '',
              Note: note
            }, email);
            trackedGtag('benchmark_quiz_email_result', {
              benchmark_key: bootstrap.key,
              score: state.result ? state.result.score : ''
            });
            state.emailSent = true;
            render();
          });
        }
      }

      function loadData() {
        fetch(bootstrap.dataUrl, { credentials: 'same-origin' })
          .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
          })
          .then(function(json) {
            var map = {};
            (json.cohorts || []).forEach(function(cohort) {
              map[cohort.cohort_key] = {
                orgType: cohort.org_type,
                segment: cohort.segment || cohort.insurance_line,
                footprint: cohort.footprint,
                sampleSize: cohort.sample_size,
                avgScore: cohort.average_score,
                avgDiscoverability: cohort.average_discoverability_score,
                avgAccuracy: cohort.average_accuracy_score,
                avgDisplacement: cohort.average_displacement_score,
                avgComplexity: cohort.average_complexity_score,
                p10: cohort.p10_score,
                p25: cohort.p25_score,
                p50: cohort.p50_score,
                p75: cohort.p75_score,
                p90: cohort.p90_score,
                topRisks: cohort.top_risk_counts,
                topFixes: cohort.top_fix_counts
              };
            });
            state.dataMap = map;
            state.screen = 'intro';
            tracked(analyticsPrefix + '_VIEW', { DataMode: 'benchmark' });
            render();
          })
          .catch(function(err) {
            state.loadingError = location.protocol === 'file:'
              ? 'Open this page through a local web server so the benchmark cohort data can load.'
              : (err && err.message ? err.message : 'The benchmark dataset could not be loaded.');
            state.screen = 'error';
            render();
          });
      }

      render();
      loadData();
    }

    function mountAll() {
      injectStyle(colors);
      var nodes = document.querySelectorAll(selector);
      for (var i = 0; i < nodes.length; i++) mountOne(nodes[i]);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountAll);
    } else {
      mountAll();
    }

    if (typeof MutationObserver !== 'undefined') {
      try {
        var observer = new MutationObserver(function(mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
              var node = added[j];
              if (!node || node.nodeType !== 1) continue;
              if (node.matches && node.matches(selector)) mountOne(node);
              if (node.querySelectorAll) {
                var nested = node.querySelectorAll(selector);
                for (var k = 0; k < nested.length; k++) mountOne(nested[k]);
              }
            }
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      } catch (err) {}
    }
  }

  global.MetricusBenchmarkQuizEngine = { boot: boot };
})(window);
