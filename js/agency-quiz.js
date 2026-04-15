/*
 * Metricus agency quiz — vertical-agnostic quiz for agencies and consultants.
 *
 * Agencies assess other brands for clients, so the motivation frame is different
 * from the customer benchmark: "what kind of AI-visibility practice could you
 * run, and what's the next step?" rather than "is your brand visible?".
 *
 * Mount by placing <div data-agency-quiz></div>, plus /js/benchmark-quiz-engine.js
 * (for CSS reuse) and this file.
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var SELECTOR = '[data-agency-quiz]';
  var MOUNT_FLAG = 'data-agency-quiz-mounted';
  var STORAGE_KEY = 'metricusAgencyQuizAnonSeed';
  var ANALYTICS_PREFIX = 'AGENCY_QUIZ';

  var QUESTIONS = [
    {
      id: 'size',
      headline: 'What kind of agency are you?',
      support: 'This calibrates which engagement sizes and deliverables actually fit your team.',
      options: [
        { id: 'solo',       label: 'Solo consultant or freelancer' },
        { id: 'boutique',   label: 'Boutique agency (2&ndash;10 people)' },
        { id: 'small',      label: 'Small agency (11&ndash;25 people)' },
        { id: 'midsize',    label: 'Mid-size agency (26&ndash;100 people)' },
        { id: 'large',      label: 'Large / enterprise agency (100+)' },
        { id: 'inhouse',    label: 'In-house team &mdash; not really an agency' }
      ]
    },
    {
      id: 'service',
      headline: 'What&rsquo;s the closest thing to your core service today?',
      support: 'GEO work slots differently into SEO-shaped agencies vs. PR/brand-shaped ones.',
      options: [
        { id: 'seo_content',  label: 'SEO / content marketing' },
        { id: 'pr_comms',     label: 'PR / communications / brand reputation' },
        { id: 'brand_strat',  label: 'Brand or strategy consulting' },
        { id: 'performance',  label: 'Performance / paid media' },
        { id: 'full_service', label: 'Full-service digital' },
        { id: 'ai_geo',       label: 'AI / GEO / LLM optimization specialist' }
      ]
    },
    {
      id: 'clients',
      headline: 'Who are your typical clients?',
      support: 'Local SMBs, mid-market, and enterprise buyers all respond to AI-visibility arguments differently.',
      options: [
        { id: 'local_smb',    label: 'Local SMBs (single market / single location)' },
        { id: 'regional',     label: 'Regional mid-market brands' },
        { id: 'national_dtc', label: 'National DTC or B2B brands' },
        { id: 'enterprise',   label: 'Enterprise / Fortune 1000' },
        { id: 'mixed',        label: 'A mix across all segments' }
      ]
    },
    {
      id: 'pressure',
      headline: 'What&rsquo;s pushing you to look at AI visibility right now?',
      support: 'Knowing the actual trigger shapes whether to lead with audit, retainer, or education.',
      options: [
        { id: 'clients_asking',  label: 'Clients are asking about ChatGPT or AI search' },
        { id: 'losing_pitches',  label: 'Losing pitches to &ldquo;AI-savvy&rdquo; competitors' },
        { id: 'seo_declining',   label: 'Client SEO traffic is softening &mdash; pressure on renewals' },
        { id: 'lead_market',     label: 'Want to lead the category before others do' },
        { id: 'new_service',     label: 'Launching a new service line / repositioning' },
        { id: 'internal',        label: 'Internal curiosity &mdash; no external pressure yet' }
      ]
    },
    {
      id: 'offer',
      headline: 'What would you actually sell to clients?',
      support: 'This drives the packaging we suggest &mdash; audit-first, retainer-first, or bundled.',
      options: [
        { id: 'one_time_audit', label: 'One-time AI visibility audit engagement' },
        { id: 'retainer',       label: 'Ongoing GEO retainer (monthly)' },
        { id: 'workshop',       label: 'Strategy workshop or executive session' },
        { id: 'bundle',         label: 'Bundle into existing SEO / content retainer' },
        { id: 'undecided',      label: 'Haven&rsquo;t figured out the packaging yet' }
      ]
    },
    {
      id: 'barrier',
      headline: 'What&rsquo;s the biggest barrier to shipping it?',
      support: 'This is the piece the Metricus agency toolkit is most likely to unblock first.',
      options: [
        { id: 'methodology', label: 'No methodology or framework to follow' },
        { id: 'deliverable', label: 'No deliverable / output format' },
        { id: 'pricing',     label: 'Don&rsquo;t know what to charge' },
        { id: 'capacity',    label: 'Team capacity / internal training' },
        { id: 'education',   label: 'Client education &mdash; selling the problem first' },
        { id: 'none',        label: 'Nothing really &mdash; ready to go' }
      ]
    }
  ];

  // Agency tier mapping (rule-based).
  var TIERS = {
    launch: {
      id: 'launch',
      label: 'Agency Launch tier',
      priceRange: '$1,500&ndash;$3,000 per audit engagement',
      retainerRange: '$1,500&ndash;$5,000 / month per client',
      clientVolume: '1&ndash;3 clients',
      profileLabel: 'solo or small team still sizing up the AI visibility opportunity'
    },
    build: {
      id: 'build',
      label: 'Agency Build tier',
      priceRange: '$3,000&ndash;$7,500 per audit engagement',
      retainerRange: '$3,000&ndash;$8,000 / month per client',
      clientVolume: '3&ndash;10 clients',
      profileLabel: 'boutique or mid-size agency positioning a productized AI visibility service'
    },
    scale: {
      id: 'scale',
      label: 'Agency Scale tier',
      priceRange: '$7,500&ndash;$25,000 per audit engagement',
      retainerRange: '$5,000&ndash;$15,000 / month per client',
      clientVolume: '10+ clients',
      profileLabel: 'mid-to-large agency building AI visibility as a named practice area'
    },
    enterprise: {
      id: 'enterprise',
      label: 'Agency Enterprise tier',
      priceRange: '$25,000&ndash;$100,000+ per audit engagement',
      retainerRange: '$15,000&ndash;$50,000+ / month per client',
      clientVolume: 'Enterprise roster',
      profileLabel: 'large or enterprise agency running multi-brand AI visibility governance'
    }
  };

  var BARRIER_FIX = {
    methodology: {
      label: 'Methodology gap',
      fix: 'Start with a framework. The Metricus toolkit includes the audit scoring approach Metricus uses for customer reports, which agencies can white-label as a methodology of record.'
    },
    deliverable: {
      label: 'Deliverable gap',
      fix: 'Use a completed Metricus report as your deliverable template. One $99&ndash;$499 audit per client becomes your branded client deck, and you mark up on top of that.'
    },
    pricing: {
      label: 'Pricing gap',
      fix: 'The Agency Toolkit includes a margin calculator plus the engagement price ranges other agencies in your size band are charging for similar work.'
    },
    capacity: {
      label: 'Capacity gap',
      fix: 'Outsource the audit itself to Metricus and use your team for presentation and fix-list execution. That&rsquo;s the typical agency delivery model &mdash; no new hires required.'
    },
    education: {
      label: 'Education gap',
      fix: 'Start every client pitch with a sample Metricus report that shows exact AI quotes about a brand. Client education happens in one deck, not a six-week conversation.'
    },
    none: {
      label: 'No blocker',
      fix: 'If you&rsquo;re ready to go, the fastest path is ordering one audit and using it as your pitch deck for the next three clients. Volume pricing starts at 5+ reports per month.'
    }
  };

  var PRESSURE_CONTEXT = {
    clients_asking: 'Your clients are already asking about ChatGPT. The window to lead the conversation with a framework is now.',
    losing_pitches: 'Pitch losses to &ldquo;AI-savvy&rdquo; competitors are usually about deliverable format, not strategic depth. Fix the deliverable, win the pitch.',
    seo_declining: 'Softening SEO traffic is the most common entry point into GEO work. Position AI visibility as the natural next layer, not a replacement.',
    lead_market: 'Leading the category means productizing before competitors do. A named service, a named price, a branded deliverable.',
    new_service: 'New service lines fail when the deliverable is vague. Start with a concrete audit format and build the retainer around it.',
    internal: 'No external pressure yet is the ideal time to build the playbook. You decide positioning without a burning deadline.'
  };

  var CLIENT_PHRASES = {
    local_smb: 'local SMB clients',
    regional: 'regional mid-market clients',
    national_dtc: 'national DTC and B2B clients',
    enterprise: 'enterprise clients',
    mixed: 'a mixed client roster'
  };

  var SERVICE_NEXT_STEP = {
    seo_content: 'You already own the content surface AI pulls from. Position AI visibility as an evolution of your SEO retainer, not a new thing.',
    pr_comms: 'PR agencies have an underused edge here &mdash; third-party citations drive AI recommendations more than on-site content. Lead with that advantage.',
    brand_strat: 'Strategy-led agencies win on framing. Position AI visibility as category perception across the buyer&rsquo;s AI-mediated journey.',
    performance: 'Performance shops are typically weakest on the content/citation side AI rewards. Partner or extend &mdash; don&rsquo;t pretend it&rsquo;s paid-media-adjacent.',
    full_service: 'Full-service agencies can bundle AI visibility into retainers fastest. Lead with a bundle; audit is the door-opener.',
    ai_geo: 'You&rsquo;re already in the category. The question is productization speed and how you differentiate against the next 50 agencies who claim the same thing.'
  };

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

  function optionLabel(questionId, optionId) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id !== questionId) continue;
      for (var j = 0; j < QUESTIONS[i].options.length; j++) {
        if (QUESTIONS[i].options[j].id === optionId) return QUESTIONS[i].options[j].label;
      }
    }
    return optionId;
  }

  function tierFor(answers) {
    var size = answers.size || 'boutique';
    var clients = answers.clients || 'regional';
    var service = answers.service || 'seo_content';

    if (size === 'large' || clients === 'enterprise') return TIERS.enterprise;
    if (size === 'midsize') return TIERS.scale;
    if (size === 'small' && (clients === 'national_dtc' || clients === 'enterprise')) return TIERS.scale;
    if (size === 'small') return TIERS.build;
    if (size === 'boutique' && (clients === 'national_dtc' || clients === 'enterprise')) return TIERS.build;
    if (size === 'boutique') return TIERS.build;
    if (size === 'solo') return TIERS.launch;
    if (size === 'inhouse') return service === 'ai_geo' ? TIERS.build : TIERS.launch;
    return TIERS.launch;
  }

  function peerPhraseFor(tier, clients, size) {
    var clientLabel = CLIENT_PHRASES[clients] || 'client roster';
    var sizeLabel;
    switch (size) {
      case 'solo':     sizeLabel = 'solo consultants'; break;
      case 'boutique': sizeLabel = 'boutique agencies'; break;
      case 'small':    sizeLabel = 'small agencies'; break;
      case 'midsize':  sizeLabel = 'mid-size agencies'; break;
      case 'large':    sizeLabel = 'large agencies'; break;
      case 'inhouse':  sizeLabel = 'in-house teams'; break;
      default:         sizeLabel = 'agencies';
    }
    return sizeLabel + ' working with ' + clientLabel;
  }

  function readinessScore(answers) {
    // Rough "ready to ship" score 0-100 for a labinthewild-style comparative number.
    var score = 40;
    if (answers.service === 'ai_geo') score += 25;
    if (answers.service === 'seo_content') score += 10;
    if (answers.service === 'full_service') score += 8;
    if (answers.service === 'performance') score -= 4;
    if (answers.pressure === 'clients_asking') score += 12;
    if (answers.pressure === 'losing_pitches') score += 15;
    if (answers.pressure === 'seo_declining') score += 10;
    if (answers.pressure === 'internal') score -= 5;
    if (answers.offer === 'one_time_audit') score += 8;
    if (answers.offer === 'retainer') score += 10;
    if (answers.offer === 'bundle') score += 6;
    if (answers.offer === 'undecided') score -= 8;
    if (answers.barrier === 'none') score += 15;
    if (answers.barrier === 'education') score -= 6;
    if (answers.barrier === 'capacity') score -= 3;
    if (answers.size === 'large') score += 5;
    if (answers.size === 'midsize') score += 3;
    if (answers.size === 'solo') score -= 3;
    if (score < 5) score = 5;
    if (score > 95) score = 95;
    return Math.round(score);
  }

  function peerPercentile(score) {
    // Map rough score to "higher than X% of peer agencies" for labinthewild-style comparison.
    if (score <= 15) return 10;
    if (score <= 30) return 22;
    if (score <= 45) return 38;
    if (score <= 60) return 55;
    if (score <= 70) return 68;
    if (score <= 80) return 80;
    if (score <= 88) return 88;
    return 94;
  }

  function buildResult(answers) {
    var tier = tierFor(answers);
    var barrier = BARRIER_FIX[answers.barrier] || BARRIER_FIX.none;
    var pressureCtx = PRESSURE_CONTEXT[answers.pressure] || '';
    var serviceCtx = SERVICE_NEXT_STEP[answers.service] || '';
    var peerPhrase = peerPhraseFor(tier, answers.clients, answers.size);
    var score = readinessScore(answers);
    var percentile = peerPercentile(score);

    return {
      tier: tier,
      barrier: barrier,
      pressureCtx: pressureCtx,
      serviceCtx: serviceCtx,
      peerPhrase: peerPhrase,
      score: score,
      percentile: percentile
    };
  }

  function mountOne(root) {
    if (!root || root.hasAttribute(MOUNT_FLAG)) return;
    root.setAttribute(MOUNT_FLAG, '1');

    var source = root.getAttribute('data-source') || 'for-agencies';
    var anonId = getAnonymousId();
    var quizId = randomId('aquiz');
    // Autostart skips the intro — used when handed off from landing quiz.
    var autostart = root.getAttribute('data-autostart') === '1';
    var state = {
      screen: autostart ? 'question' : 'intro',
      stepIndex: 0,
      answers: {},
      analysis: null,
      result: null,
      emailSent: false
    };

    function tracked(kind, payload, contact) {
      var merged = { AnonId: anonId, QuizId: quizId, Source: source };
      var extras = payload || {};
      Object.keys(extras).forEach(function(k) { merged[k] = extras[k]; });
      track(ANALYTICS_PREFIX + '_' + kind, merged, contact || anonId);
    }

    function trackedGtag(name, params) {
      var merged = { source: source, anon_id: anonId, quiz_id: quizId };
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
          '<div class="m-bq__meta">Agency track</div>' +
        '</div>';
    }

    function runAnalysis(config, done) {
      state.analysis = config;
      state.screen = 'analysis';
      render();
      window.setTimeout(function() {
        state.analysis = null;
        done();
      }, config.duration);
    }

    function screenHtml() {
      if (state.screen === 'intro') {
        var previewTiles = [QUESTIONS[0].options[1], QUESTIONS[0].options[2], QUESTIONS[0].options[3]].map(function(opt) {
          return '<div class="m-bq__previewTile"><span>' + opt.label + '</span><span class="m-bq__previewGhost">Preview</span></div>';
        }).join('');
        return '' +
          '<div class="m-bq__screen m-bq__screen--intro">' +
            topBar() +
            '<div class="m-bq__introBody">' +
              '<div class="m-bq__introMain">' +
                '<div class="m-bq__introKickers">' +
                  '<span class="m-bq__kicker">6 questions</span>' +
                  '<span class="m-bq__kicker">Agency benchmark</span>' +
                  '<span class="m-bq__kicker">No email required</span>' +
                '</div>' +
                '<h3 class="m-bq__title">Which AI-visibility practice fits your agency?</h3>' +
                '<p class="m-bq__lead">See which tier your agency lines up with, what peers your size charge for AI visibility work, and where you are most likely to stall first.</p>' +
                '<p class="m-bq__sub">This is the agency track. It sizes the opportunity and the packaging &mdash; not a brand audit. That&rsquo;s your clients&rsquo; job.</p>' +
                '<p class="m-bq__time">Takes about 60 seconds.</p>' +
              '</div>' +
              '<div class="m-bq__introPanel">' +
                '<div>' +
                  '<div class="m-bq__introFlow">' +
                    '<div class="m-bq__introFlowLabel">Question 1 of 6</div>' +
                    '<div class="m-bq__introDots" aria-hidden="true">' +
                      '<span class="m-bq__introDot is-active"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span><span class="m-bq__introDot"></span>' +
                    '</div>' +
                  '</div>' +
                  '<h4 class="m-bq__introQuestion">' + QUESTIONS[0].headline + '</h4>' +
                  '<div class="m-bq__introPreview" aria-hidden="true">' + previewTiles + '</div>' +
                  '<p class="m-bq__previewHint">Six quick questions. Your agency-tier match, likely price ranges, and first barrier reveal after the last answer.</p>' +
                '</div>' +
                '<div class="m-bq__ctaRow m-bq__ctaRow--intro"><button type="button" class="m-bq__btn" data-aq-action="start">Start the agency benchmark <span class="m-bq__btnChevron" aria-hidden="true">↓</span></button></div>' +
              '</div>' +
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

      if (state.screen === 'question') {
        var question = QUESTIONS[state.stepIndex];
        var progress = Math.round(((state.stepIndex + 1) / QUESTIONS.length) * 100);
        var optionsHtml = question.options.map(function(option) {
          return '' +
            '<button type="button" class="m-bq__option" data-aq-answer="' + escapeHtml(option.id) + '" data-aq-question="' + escapeHtml(question.id) + '">' +
              '<span class="m-bq__optionLabel">' + option.label + '</span>' +
              '<span class="m-bq__optionMeta"><span></span><span class="m-bq__optionArrow">→</span></span>' +
            '</button>';
        }).join('');

        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__progressRow"><div class="m-bq__progressText">Question ' + (state.stepIndex + 1) + ' of ' + QUESTIONS.length + '</div><div></div></div>' +
            '<div class="m-bq__bar" aria-hidden="true"><div class="m-bq__barFill" style="width:' + progress + '%"></div></div>' +
            '<div class="m-bq__statusPill">Agency track &middot; sizing the opportunity</div>' +
            '<h3 class="m-bq__qTitle">' + question.headline + '</h3>' +
            '<p class="m-bq__qSupport">' + question.support + '</p>' +
            '<div class="m-bq__options">' + optionsHtml + '</div>' +
            '<div class="m-bq__questionFoot">One tap advances immediately. Your agency-tier match appears after the sixth answer.</div>' +
          '</div>';
      }

      if (state.screen === 'result' && state.result) {
        var r = state.result;
        var answers = state.answers;
        return '' +
          '<div class="m-bq__screen">' +
            topBar() +
            '<div class="m-bq__resultLead">Your agency benchmark</div>' +
            '<h3 class="m-bq__resultTitle">You line up with the <strong class="m-bq__emph">' + r.tier.label + '</strong>.</h3>' +
            '<div class="m-bq__stats">' +
              '<div class="m-bq__statCard m-bq__statCard--score">' +
                '<div class="m-bq__statLabel">Readiness score</div>' +
                '<div class="m-bq__scoreValue">' + r.score + '</div>' +
                '<div class="m-bq__scoreScale">out of 100</div>' +
              '</div>' +
              '<div class="m-bq__statCard">' +
                '<div class="m-bq__statLabel">You score higher than</div>' +
                '<div class="m-bq__statBig">' + r.percentile + '%</div>' +
                '<div class="m-bq__statDesc">of <strong class="m-bq__emph">' + escapeHtml(r.peerPhrase) + '</strong> we&rsquo;ve benchmarked on AI-visibility readiness.</div>' +
              '</div>' +
              '<div class="m-bq__statCard">' +
                '<div class="m-bq__statLabel">Typical engagement</div>' +
                '<div class="m-bq__statBig" style="font-size:1.55rem;line-height:1.1">' + r.tier.priceRange + '</div>' +
                '<div class="m-bq__statDesc">Retainers at this tier: <strong class="m-bq__emph">' + r.tier.retainerRange + '</strong>.</div>' +
              '</div>' +
            '</div>' +
            '<div class="m-bq__tier">' + r.tier.label + '</div>' +
            '<div class="m-bq__callouts">' +
              '<div class="m-bq__callout">' +
                '<div class="m-bq__calloutLabel">Your first barrier</div>' +
                '<p class="m-bq__diag"><strong class="m-bq__emph">' + r.barrier.label + ':</strong> ' + r.barrier.fix + '</p>' +
              '</div>' +
              '<div class="m-bq__callout">' +
                '<div class="m-bq__calloutLabel">Your angle of attack</div>' +
                '<p class="m-bq__meaning">' + escapeHtml(r.serviceCtx) + '</p>' +
              '</div>' +
            '</div>' +
            '<ul class="m-bq__bullets">' +
              '<li>Typical tier profile: <strong class="m-bq__emph">' + r.tier.profileLabel + '</strong>.</li>' +
              '<li>Peer context: <strong class="m-bq__emph">' + escapeHtml(r.pressureCtx) + '</strong></li>' +
              '<li>Suggested starting packaging: <strong class="m-bq__emph">' + escapeHtml(optionLabel('offer', answers.offer) || 'One-time audit') + '</strong>.</li>' +
            '</ul>' +
            '<p class="m-bq__guard">This is a positioning benchmark for agencies. The Agency Toolkit adds the margin calculator, pricing tables, and client pitch framework that land actual engagements.</p>' +
            '<div class="m-bq__ctaSet">' +
              '<a class="m-bq__linkBtn" data-aq-action="toolkit" href="/for-agencies/#agency-toolkit">Get the Agency Toolkit</a>' +
              '<a class="m-bq__linkBtn m-bq__linkBtn--secondary" data-aq-action="inquire" href="/agency-inquiry/">Inquire about volume pricing</a>' +
            '</div>' +
            '<div class="m-bq__form">' +
              '<p class="m-bq__formTitle">Send me this agency benchmark</p>' +
              '<input class="m-bq__field" data-aq-field="email" type="email" placeholder="you@agency.com" autocomplete="email">' +
              '<input class="m-bq__field" data-aq-field="agency" type="text" placeholder="Agency name (optional)">' +
              '<div class="m-bq__formRow"><button type="button" class="m-bq__btn" data-aq-action="email-result">Send me this result</button></div>' +
              '<p class="m-bq__small">We&rsquo;ll send the benchmark plus the Agency Toolkit in one email. No follow-up sequence.</p>' +
              (state.emailSent ? '<p class="m-bq__thanks">Benchmark sent &mdash; check your inbox shortly.</p>' : '') +
            '</div>' +
          '</div>';
      }

      return '';
    }

    function bind() {
      var startBtn = root.querySelector('[data-aq-action="start"]');
      if (startBtn) {
        startBtn.addEventListener('click', function() {
          tracked('START', {});
          trackedGtag('agency_quiz_start', {});
          state.screen = 'question';
          state.stepIndex = 0;
          state.answers = {};
          state.result = null;
          state.emailSent = false;
          state.quizId = randomId('aquiz');
          render();
        });
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-aq-answer]'), function(btn) {
        btn.addEventListener('click', function() {
          var questionId = btn.getAttribute('data-aq-question');
          var answerId = btn.getAttribute('data-aq-answer');
          btn.classList.add('is-picked');
          state.answers[questionId] = answerId;

          tracked(questionId.toUpperCase(), { Answer: answerId });

          window.setTimeout(function() {
            if (state.stepIndex >= QUESTIONS.length - 1) {
              tracked('ANALYSIS_STAGE', { Stage: 'result_calculation' });
              runAnalysis({
                title: 'Sizing your agency opportunity&hellip;',
                text: 'Matching you to peer agencies and estimating your tier, pricing, and first barrier.',
                duration: 2000
              }, function() {
                state.result = buildResult(state.answers);
                state.screen = 'result';
                tracked('COMPLETE', {
                  Tier: state.result.tier.id,
                  Score: state.result.score,
                  Percentile: state.result.percentile
                });
                trackedGtag('agency_quiz_complete', {
                  tier: state.result.tier.id,
                  score: state.result.score
                });
                render();
              });
              return;
            }

            // Mid-quiz analysis pause after the "clients" question (the peer-group assembly moment).
            if (questionId === 'clients') {
              tracked('ANALYSIS_STAGE', { Stage: 'peer_group_assembly' });
              runAnalysis({
                title: 'Matching your peer agency cohort&hellip;',
                text: 'Building a comparison group of agencies your size with a similar client mix.',
                duration: 1200
              }, function() {
                state.stepIndex += 1;
                state.screen = 'question';
                render();
              });
              return;
            }

            state.stepIndex += 1;
            state.screen = 'question';
            render();
          }, 180);
        });
      });

      var toolkitBtn = root.querySelector('[data-aq-action="toolkit"]');
      if (toolkitBtn) {
        toolkitBtn.addEventListener('click', function() {
          tracked('CTA_TOOLKIT', { Tier: state.result ? state.result.tier.id : '' });
          trackedGtag('agency_quiz_cta_toolkit', { tier: state.result ? state.result.tier.id : '' });
        });
      }

      var inquireBtn = root.querySelector('[data-aq-action="inquire"]');
      if (inquireBtn) {
        inquireBtn.addEventListener('click', function() {
          tracked('CTA_INQUIRE', { Tier: state.result ? state.result.tier.id : '' });
          trackedGtag('agency_quiz_cta_inquire', { tier: state.result ? state.result.tier.id : '' });
        });
      }

      var emailBtn = root.querySelector('[data-aq-action="email-result"]');
      if (emailBtn) {
        emailBtn.addEventListener('click', function() {
          var emailField = root.querySelector('[data-aq-field="email"]');
          var agencyField = root.querySelector('[data-aq-field="agency"]');
          var email = emailField ? String(emailField.value || '').trim() : '';
          var agencyName = agencyField ? String(agencyField.value || '').trim() : '';
          if (!email || !/.+@.+\..+/.test(email)) {
            if (emailField) emailField.focus();
            return;
          }
          tracked('EMAIL_RESULT', {
            Tier: state.result ? state.result.tier.id : '',
            Score: state.result ? state.result.score : '',
            Agency: agencyName
          }, email);
          trackedGtag('agency_quiz_email_result', {
            tier: state.result ? state.result.tier.id : '',
            score: state.result ? state.result.score : ''
          });
          state.emailSent = true;
          render();
        });
      }
    }

    tracked('VIEW', {});
    if (autostart) {
      tracked('START', { Autostart: '1' });
      trackedGtag('agency_quiz_start', { autostart: true });
    }
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

  // Observe newly added elements (for landing-quiz handoff).
  if (typeof MutationObserver !== 'undefined') {
    try {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (!node || node.nodeType !== 1) continue;
            if (node.matches && node.matches(SELECTOR)) mountOne(node);
            if (node.querySelectorAll) {
              var nested = node.querySelectorAll(SELECTOR);
              for (var k = 0; k < nested.length; k++) mountOne(nested[k]);
            }
          }
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch (err) {}
  }
})();
