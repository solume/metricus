/*
 * Metricus insurance benchmark quiz
 *
 * Drop-in usage:
 *   <script src="/js/insurance-benchmark-quiz.js" defer></script>
 *   <div data-insurance-benchmark-quiz data-source="insurance-ai-visibility"></div>
 *
 * This version uses the insurance cohort dataset served from the public js directory.
 */
(function() {
  'use strict';

  var DATA_URL = '/js/insurance-benchmark-cohorts.json';
  var ENDPOINT = 'https://metricus.red-hill-a87d.workers.dev/';
  var STYLE_ID = 'metricus-insurance-benchmark-style';
  var MOUNT_FLAG = 'ibqMounted';
  var ANON_STORAGE_KEY = 'metricusInsuranceBenchmarkAnonSeed';

  var COLORS = {
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

  var QUESTIONS = {
    org_type: {
      id: 'org_type',
      step: 1,
      headline: 'What best describes your business?',
      support: 'This changes which insurance brands you should be compared against.',
      options: [
        { id: 'carrier', label: 'Carrier' },
        { id: 'mga', label: 'MGA / wholesaler' },
        { id: 'agency', label: 'Independent agency / broker' },
        { id: 'insurtech', label: 'Insurtech / digital-first brand' },
        { id: 'other', label: 'Other' }
      ]
    },
    insurance_line: {
      id: 'insurance_line',
      step: 2,
      headline: 'Which insurance line matters most for this benchmark?',
      support: 'Visibility patterns differ sharply across consumer, commercial, and regulated insurance searches.',
      options: [
        { id: 'auto', label: 'Auto' },
        { id: 'homeowners', label: 'Homeowners' },
        { id: 'life', label: 'Life' },
        { id: 'health', label: 'Health' },
        { id: 'commercial', label: 'Commercial' },
        { id: 'multiline', label: 'Multi-line' },
        { id: 'other', label: 'Other' }
      ]
    },
    footprint: {
      id: 'footprint',
      step: 3,
      headline: 'How broad is the market you compete in?',
      support: 'AI behavior is very different for local, regional, and national insurance brands.',
      options: [
        { id: 'local', label: 'Single-state / local' },
        { id: 'regional', label: 'Multi-state regional' },
        { id: 'national', label: 'National' },
        { id: 'unknown', label: 'Not sure' }
      ]
    },
    main_failure: {
      id: 'main_failure',
      step: 4,
      headline: 'What feels most broken right now?',
      support: 'For most insurance brands, the problem is either invisibility or wrong facts.',
      options: [
        { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
        { id: 'wrong_competitors', label: 'AI mentions the wrong competitors instead' },
        { id: 'pricing_wrong', label: 'AI gets pricing wrong' },
        { id: 'coverage_wrong', label: 'AI gets coverage details wrong' },
        { id: 'state_wrong', label: 'AI gets state availability or regulation details wrong' },
        { id: 'claims_wrong', label: 'AI gets claims or service expectations wrong' }
      ]
    },
    q5_discoverability: {
      id: 'q5_discoverability',
      step: 5,
      headline: 'When you check AI, what usually happens?',
      support: 'This helps distinguish total invisibility from competitor displacement.',
      options: [
        { id: 'not_present', label: 'We do not appear at all' },
        { id: 'weak_mentions', label: 'We appear only in weak or secondary mentions' },
        { id: 'narrow_cases', label: 'We show up only in narrow or local cases' },
        { id: 'nationals_take_slots', label: 'Big national brands take the recommendation spots' }
      ]
    },
    q5_accuracy: {
      id: 'q5_accuracy',
      step: 5,
      headline: 'Which wrong answer is most damaging?',
      support: 'Insurance trust breaks quickly when AI sounds confident but is factually wrong.',
      options: [
        { id: 'fake_quote_expectations', label: 'Fake premium or quote expectations' },
        { id: 'wrong_exclusions', label: 'Wrong coverage or exclusion details' },
        { id: 'wrong_state_rules', label: 'Wrong state availability or regulatory details' },
        { id: 'wrong_claims_service', label: 'Wrong claims or service expectations' }
      ]
    },
    business_impact: {
      id: 'business_impact',
      step: 6,
      headline: 'If this keeps happening, what hurts most?',
      support: 'This helps interpret the risk pattern, not just the score.',
      options: [
        { id: 'fewer_quotes', label: 'Fewer quotes or inbound leads' },
        { id: 'lose_to_larger_brands', label: 'Losing buyers to larger brands' },
        { id: 'sales_correction', label: 'Sales or service teams correcting bad expectations' },
        { id: 'trust_erosion', label: 'Brand trust erosion' },
        { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
      ]
    }
  };

  var RESULT_ENGINE = {
    normalization: {
      unknown_footprint_maps_to: 'regional',
      other_org_maps_to: 'carrier',
      other_line_maps_to: 'multiline'
    },
    weights: {
      discoverability: 0.36,
      accuracy: 0.28,
      displacement: 0.22,
      complexity: 0.14
    },
    mainFailureAdjustments: {
      rarely_mentioned: { discoverability: -16, displacement: -8, accuracy: -2, complexity: 0 },
      wrong_competitors: { discoverability: -10, displacement: -16, accuracy: -2, complexity: 0 },
      pricing_wrong: { discoverability: -2, displacement: -2, accuracy: -15, complexity: -4 },
      coverage_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -6 },
      state_wrong: { discoverability: -2, displacement: -2, accuracy: -12, complexity: -8 },
      claims_wrong: { discoverability: -2, displacement: -1, accuracy: -10, complexity: -7 }
    },
    q5DiscoverabilityAdjustments: {
      not_present: { discoverability: -12, displacement: -6 },
      weak_mentions: { discoverability: -8, displacement: -4 },
      narrow_cases: { discoverability: -5, displacement: -2 },
      nationals_take_slots: { discoverability: -4, displacement: -10 }
    },
    q5AccuracyAdjustments: {
      fake_quote_expectations: { accuracy: -10, complexity: -3 },
      wrong_exclusions: { accuracy: -8, complexity: -5 },
      wrong_state_rules: { accuracy: -8, complexity: -8 },
      wrong_claims_service: { accuracy: -7, complexity: -6 }
    },
    flags: [
      { label: 'High discoverability risk', dimension: 'discoverability', max: 45 },
      { label: 'High factual accuracy risk', dimension: 'accuracy', max: 48 },
      { label: 'High competitor displacement risk', dimension: 'displacement', max: 46 },
      { label: 'High insurance complexity risk', dimension: 'complexity', max: 44 }
    ],
    riskLabels: {
      discoverability_gap: 'discoverability pressure',
      accuracy_gap: 'factual accuracy pressure',
      competitor_displacement: 'competitor displacement',
      complexity_gap: 'insurance complexity pressure'
    },
    fixLabels: {
      citation_surface_gap: 'citation surface gaps',
      comparison_and_competitor_positioning: 'comparison-positioning gaps',
      state_specific_fact_hygiene: 'state-specific fact hygiene',
      pricing_fact_hygiene: 'pricing fact hygiene',
      coverage_and_exclusion_clarity: 'coverage clarity',
      claims_process_clarity: 'claims clarity',
      source_structuring_and_fact_hygiene: 'source structuring'
    },
    bandLabel: function(score) {
      if (score < 40) return 'Lower visibility tier';
      if (score < 65) return 'Mixed visibility tier';
      return 'Stronger visibility tier';
    },
    patternPhrase: {
      rarely_mentioned: 'AI has too little trustworthy surface area to include you consistently',
      wrong_competitors: 'larger brands and better-cited competitors take the recommendation layer before buyers reach you',
      pricing_wrong: 'buyers may be receiving false quote expectations before they ever request pricing from you',
      coverage_wrong: 'AI is likely compressing or distorting product detail that matters to buyer trust',
      state_wrong: 'state-specific complexity is creating a high risk of wrong availability or compliance expectations',
      claims_wrong: 'generic AI claims language is likely flattening real service differences into misleading expectations'
    },
    meaningPhrase: {
      fewer_quotes: 'buyers may leave the consideration set before your team ever gets a chance to quote or explain fit',
      lose_to_larger_brands: 'brand size and citation footprint may be substituting for actual suitability in the buyer shortlist',
      sales_correction: 'your team may be starting conversations by undoing AI-created confusion instead of moving toward the sale',
      trust_erosion: 'wrong facts can damage confidence before a buyer reaches your owned channels',
      dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
    }
  };

  var CSS = [
    '.m-ibq{position:relative;left:50%;transform:translateX(-50%);width:min(calc(100vw - 2rem), 980px);max-width:980px;margin:2.35rem 0;font-family:"Public Sans",Arial,sans-serif;color:' + COLORS.text + ';}',
    '@media(max-width:767px){.m-ibq{width:calc(100vw - 1.25rem)}}',
    '.m-ibq *{box-sizing:border-box}',
    '.m-ibq__shell{border-top:3px dotted ' + COLORS.border + ';border-bottom:3px dotted ' + COLORS.border + ';padding:.8rem 0;background:linear-gradient(180deg, rgba(231,246,239,0.74), rgba(255,255,255,0.97))}',
    '@media(min-width:768px){.m-ibq__shell{padding:1.35rem 0}}',
    '.m-ibq__wrap{background:' + COLORS.white + ';border:1px solid ' + COLORS.borderLight + ';padding:1rem;min-height:540px;box-shadow:0 18px 44px rgba(81,95,116,0.09);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease}',
    '@media(min-width:768px){.m-ibq__wrap{padding:1.4rem 1.7rem 1.5rem}}',
    '@media(max-width:767px){.m-ibq__wrap{min-height:500px}}',
    '.m-ibq__wrap--intro{min-height:auto;border-color:#c7e5d7;box-shadow:0 22px 48px rgba(15,138,98,0.12)}',
    '@media(hover:hover){.m-ibq__wrap--intro:hover{transform:translateY(-2px);box-shadow:0 26px 56px rgba(15,138,98,0.15)}}',
    '.m-ibq__top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.15rem}',
    '.m-ibq__brand{font-family:"Newsreader",Georgia,serif;font-size:2.1rem;line-height:1;color:' + COLORS.primary + ';font-weight:700;letter-spacing:-0.04em}',
    '.m-ibq__meta{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:' + COLORS.textDim + ';text-align:right}',
    '.m-ibq__screen{animation:mibqFade .26s ease;min-height:470px;display:flex;flex-direction:column}',
    '.m-ibq__screen--intro{min-height:auto}',
    '@keyframes mibqFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '.m-ibq__introBody{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(280px,.88fr);gap:1rem;align-items:start;max-width:none}',
    '@media(max-width:819px){.m-ibq__introBody{grid-template-columns:1fr}}',
    '.m-ibq__introMain{max-width:44rem}',
    '.m-ibq__introKickers{display:flex;flex-wrap:wrap;gap:.45rem;margin:0 0 .75rem}',
    '.m-ibq__kicker{display:inline-flex;align-items:center;padding:.4rem .64rem;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;background:' + COLORS.accentSoft + ';border:1px solid #c7e5d7;color:' + COLORS.accent + ';font-weight:700}',
    '.m-ibq__title{font-family:"Newsreader",Georgia,serif;font-size:2.15rem;line-height:1.02;letter-spacing:-0.04em;color:' + COLORS.text + ';margin:0 0 .7rem}',
    '@media(min-width:768px){.m-ibq__title{font-size:2.8rem}}',
    '.m-ibq__lead{font-size:1.08rem;line-height:1.48;margin:0 0 .7rem;color:' + COLORS.text + ';max-width:48rem}',
    '.m-ibq__sub{font-size:.98rem;line-height:1.55;margin:0 0 .68rem;color:' + COLORS.textDim + ';max-width:50rem}',
    '.m-ibq__introPanel{background:linear-gradient(180deg,#f7fcfa,' + COLORS.accentSoft + ');border:1px solid #b9dccd;padding:.88rem .92rem;display:flex;flex-direction:column;justify-content:space-between;gap:.85rem;box-shadow:0 12px 26px rgba(15,138,98,0.09);min-height:272px}',
    '.m-ibq__introFlow{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.55rem}',
    '.m-ibq__introFlowLabel{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;color:' + COLORS.accent + ';font-weight:800}',
    '.m-ibq__introDots{display:inline-flex;gap:.26rem;align-items:center}',
    '.m-ibq__introDot{width:7px;height:7px;border-radius:999px;background:#b9dccd}',
    '.m-ibq__introDot.is-active{background:' + COLORS.accent + '}',
    '.m-ibq__introQuestion{font-family:"Newsreader",Georgia,serif;font-size:1.34rem;line-height:1.05;letter-spacing:-0.03em;color:' + COLORS.text + ';margin:0 0 .72rem}',
    '.m-ibq__introPreview{display:grid;gap:.46rem;margin:0 0 .78rem}',
    '.m-ibq__previewTile{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.58rem .7rem;background:rgba(255,255,255,.88);border:1px solid #c7e5d7;color:' + COLORS.text + ';font-size:.9rem;line-height:1.25;font-weight:600}',
    '.m-ibq__previewHint{font-size:.78rem;line-height:1.35;color:' + COLORS.textDim + ';margin:0}',
    '.m-ibq__previewGhost{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:' + COLORS.accent + ';font-weight:800;white-space:nowrap}',
    '.m-ibq__time{font-size:.95rem;line-height:1.35;color:' + COLORS.text + ';margin:0 0 1.05rem;font-weight:600}',
    '.m-ibq__ctaRow{display:flex;justify-content:flex-start;align-items:center;padding-top:.2rem}',
    '.m-ibq__ctaRow--intro{padding-top:0}',
    '.m-ibq__btn,.m-ibq__linkBtn,.m-ibq__ghost{font-family:inherit;font-size:1rem;line-height:1.2;border:0;cursor:pointer;transition:all .16s ease}',
    '.m-ibq__btn{display:inline-flex;align-items:center;justify-content:center;background:' + COLORS.accent + ';color:#fff;padding:.86rem 1.35rem;font-weight:700;min-width:8.2rem;box-shadow:0 12px 24px rgba(15,138,98,0.22)}',
    '.m-ibq__btn:hover{background:' + COLORS.accentDim + ';transform:translateY(-1px)}',
    '.m-ibq__btn:disabled{opacity:.55;cursor:default}',
    '.m-ibq__btnChevron{display:inline-block;margin-left:.45rem;font-size:1rem;line-height:1;transform:translateY(1px)}',
    '.m-ibq__ghost{background:transparent;color:' + COLORS.primary + ';padding:.55rem 0;font-weight:600}',
    '.m-ibq__progressRow{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.55rem}',
    '.m-ibq__progressText{font-size:.77rem;letter-spacing:.14em;text-transform:uppercase;color:' + COLORS.textDim + ';font-weight:700}',
    '.m-ibq__statusPill{display:inline-flex;align-items:center;padding:.38rem .62rem;font-size:.71rem;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;background:' + COLORS.accentSoft + ';border:1px solid #c7e5d7;color:' + COLORS.accent + ';font-weight:700;margin-bottom:.8rem}',
    '.m-ibq__bar{height:8px;background:' + COLORS.surfaceLow + ';overflow:hidden;margin-bottom:1rem}',
    '.m-ibq__barFill{height:100%;background:' + COLORS.accent + ';transition:width .22s ease}',
    '.m-ibq__qTitle{font-family:"Newsreader",Georgia,serif;font-size:1.92rem;line-height:1.06;letter-spacing:-0.03em;margin:0 0 .55rem}',
    '@media(min-width:768px){.m-ibq__qTitle{font-size:2.35rem}}',
    '.m-ibq__qSupport{font-size:.97rem;line-height:1.5;color:' + COLORS.textDim + ';margin:0 0 1rem;max-width:45rem}',
    '.m-ibq__options{display:grid;grid-template-columns:1fr;gap:.7rem;flex:1;align-content:start;grid-auto-rows:1fr;min-height:248px}',
    '@media(min-width:760px){.m-ibq__options{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.m-ibq__option{width:100%;text-align:left;background:linear-gradient(180deg,' + COLORS.white + ', ' + COLORS.surface + ');border:1px solid ' + COLORS.borderLight + ';padding:.8rem .9rem .85rem;color:' + COLORS.text + ';font-size:1rem;line-height:1.35;position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:.7rem;min-height:90px;box-shadow:0 6px 18px rgba(81,95,116,0.05)}',
    '.m-ibq__option:hover{border-color:' + COLORS.accent + ';background:linear-gradient(180deg,' + COLORS.white + ', ' + COLORS.surfaceLow + ');transform:translateY(-1px)}',
    '.m-ibq__option.is-picked{border-color:' + COLORS.accent + ';background:linear-gradient(180deg,#f4fbf8,' + COLORS.accentSoft + ');color:' + COLORS.text + ';box-shadow:0 10px 24px rgba(15,138,98,0.12)}',
    '.m-ibq__optionLabel{display:block;font-size:.98rem;line-height:1.34;font-weight:600;color:' + COLORS.text + ';max-width:92%}',
    '.m-ibq__optionMeta{display:flex;align-items:center;justify-content:space-between;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:' + COLORS.textDim + ';font-weight:700}',
    '.m-ibq__optionArrow{font-size:1rem;color:' + COLORS.accent + '}',
    '.m-ibq__questionFoot{margin-top:.75rem;font-size:.84rem;line-height:1.45;color:' + COLORS.textDim + '}',
    '.m-ibq__spinner{width:32px;height:32px;border:3px solid ' + COLORS.borderLight + ';border-top-color:' + COLORS.accent + ';border-radius:50%;animation:mibqSpin .8s linear infinite;margin:0 auto 1rem}',
    '@keyframes mibqSpin{to{transform:rotate(360deg)}}',
    '.m-ibq__loading{text-align:center;padding:2rem 0}',
    '.m-ibq__analysis{max-width:30rem;margin:auto;text-align:center;padding:1rem 0}',
    '.m-ibq__analysisTitle{font-family:"Newsreader",Georgia,serif;font-size:2rem;line-height:1.04;letter-spacing:-0.03em;margin:0 0 .45rem;color:' + COLORS.text + '}',
    '.m-ibq__analysisText{font-size:1rem;line-height:1.5;color:' + COLORS.textDim + ';margin:0}',
    '.m-ibq__error{background:#fff7f7;border-left:4px solid #b42318;padding:1rem;color:#7a271a}',
    '.m-ibq__resultLead{font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:' + COLORS.textDim + ';font-weight:700;margin:0 0 .55rem}',
    '.m-ibq__resultTitle{font-family:"Newsreader",Georgia,serif;font-size:2.05rem;line-height:1.03;letter-spacing:-0.04em;margin:0 0 .8rem}',
    '.m-ibq__stats{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:.65rem;margin:0 0 .8rem}',
    '@media(min-width:760px){.m-ibq__stats{grid-template-columns:1.15fr 1fr 1fr}}',
    '.m-ibq__statCard{background:linear-gradient(180deg,' + COLORS.white + ',' + COLORS.surface + ');border:1px solid ' + COLORS.borderLight + ';padding:.82rem .88rem .9rem;box-shadow:0 6px 18px rgba(81,95,116,0.05)}',
    '.m-ibq__statCard--score{background:linear-gradient(180deg,' + COLORS.surfaceHigh + ',' + COLORS.surface + ')}',
    '.m-ibq__statLabel{font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:' + COLORS.textDim + ';font-weight:700;margin-bottom:.45rem}',
    '.m-ibq__scoreValue{font-family:"Newsreader",Georgia,serif;font-size:3.55rem;line-height:.88;color:' + COLORS.text + ';letter-spacing:-0.06em}',
    '.m-ibq__scoreScale{font-size:.9rem;color:' + COLORS.textDim + ';margin-top:.18rem}',
    '.m-ibq__statBig{font-family:"Newsreader",Georgia,serif;font-size:2rem;line-height:1;color:' + COLORS.text + ';letter-spacing:-0.04em}',
    '.m-ibq__statDesc{font-size:.92rem;line-height:1.45;color:' + COLORS.text + ';margin-top:.32rem}',
    '.m-ibq__emph{font-weight:800;color:' + COLORS.text + '}',
    '.m-ibq__tier{display:inline-flex;align-items:center;background:' + COLORS.accentSoft + ';border:1px solid #c7e5d7;padding:.42rem .68rem;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;color:' + COLORS.accent + ';font-weight:800;margin:.15rem 0 .8rem}',
    '.m-ibq__callouts{display:grid;gap:.65rem;margin-bottom:.8rem}',
    '@media(min-width:820px){.m-ibq__callouts{grid-template-columns:1fr 1fr}}',
    '.m-ibq__callout{background:' + COLORS.surface + ';border:1px solid ' + COLORS.borderLight + ';padding:.82rem .9rem}',
    '.m-ibq__calloutLabel{font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:' + COLORS.textDim + ';font-weight:700;margin-bottom:.42rem}',
    '.m-ibq__diag,.m-ibq__meaning{font-size:.98rem;line-height:1.52;color:' + COLORS.text + ';margin:0}',
    '.m-ibq__meaning{color:' + COLORS.textDim + '}',
    '.m-ibq__bullets{margin:0 0 .8rem;padding-left:1.05rem;color:' + COLORS.textDim + ';font-size:.94rem}',
    '.m-ibq__bullets li{margin:.28rem 0;line-height:1.42}',
    '.m-ibq__flags{display:flex;flex-wrap:wrap;gap:.5rem;margin:.8rem 0 .95rem}',
    '.m-ibq__flag{font-size:.78rem;line-height:1.2;padding:.44rem .62rem;background:' + COLORS.surfaceLow + ';border:1px solid ' + COLORS.borderLight + ';color:' + COLORS.text + ';font-weight:700}',
    '.m-ibq__guard{font-size:.86rem;line-height:1.45;color:' + COLORS.textDim + ';border-top:1px solid ' + COLORS.borderLight + ';padding-top:.8rem;margin-top:.8rem}',
    '.m-ibq__ctaSet{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}',
    '.m-ibq__linkBtn{display:inline-flex;align-items:center;justify-content:center;background:' + COLORS.accent + ';color:#fff;padding:.82rem 1.05rem;font-weight:700;text-decoration:none;min-height:46px}',
    '.m-ibq__linkBtn:hover{background:' + COLORS.accentDim + '}',
    '.m-ibq__linkBtn--secondary{background:' + COLORS.white + ';color:' + COLORS.text + ';border:1px solid ' + COLORS.borderLight + '}',
    '.m-ibq__linkBtn--secondary:hover{background:' + COLORS.surface + '}',
    '.m-ibq__form{margin-top:1.1rem;border-top:1px solid ' + COLORS.borderLight + ';padding-top:1rem}',
    '.m-ibq__formTitle{font-size:.84rem;letter-spacing:.12em;text-transform:uppercase;color:' + COLORS.textDim + ';margin:0 0 .55rem}',
    '.m-ibq__field{display:block;width:100%;font-family:inherit;font-size:.92rem;line-height:1.35;padding:.78rem .82rem;border:1px solid ' + COLORS.borderLight + ';background:#fff;color:' + COLORS.text + ';outline:0;margin:0 0 .65rem}',
    '.m-ibq__field:focus{border-color:' + COLORS.accent + '}',
    '.m-ibq__textarea{min-height:92px;resize:vertical}',
    '.m-ibq__formRow{display:flex;flex-wrap:wrap;gap:.65rem;align-items:center}',
    '.m-ibq__small{font-size:.82rem;line-height:1.42;color:' + COLORS.textDim + ';margin-top:.3rem}',
    '.m-ibq__thanks{font-size:.9rem;line-height:1.4;color:' + COLORS.accent + ';font-weight:600;margin-top:.5rem}',
    '.m-ibq__visuallyHidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}'
  ].join('');

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
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
      if (window.crypto && window.crypto.getRandomValues) {
        var arr = new Uint32Array(2);
        window.crypto.getRandomValues(arr);
        raw = Array.prototype.map.call(arr, function(num) {
          return ('00000000' + num.toString(16)).slice(-8);
        }).join('');
      }
    } catch (err) {}
    if (!raw) {
      raw = String(Date.now()) + String(Math.random()).slice(2);
    }
    return prefix + '_' + hashString(raw);
  }

  function getAnonymousId() {
    var seed = '';
    try {
      seed = window.localStorage ? window.localStorage.getItem(ANON_STORAGE_KEY) || '' : '';
    } catch (err) {}
    if (!seed) {
      seed = randomId('seed') + '_' + String(Date.now());
      try {
        if (window.localStorage) window.localStorage.setItem(ANON_STORAGE_KEY, seed);
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
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (err) {}
  }

  function optionLabel(questionId, optionId) {
    var question = QUESTIONS[questionId];
    if (!question) return optionId;
    for (var i = 0; i < question.options.length; i++) {
      if (question.options[i].id === optionId) return question.options[i].label;
    }
    return optionId;
  }

  function orgPlural(orgType) {
    var map = {
      carrier: 'carriers',
      mga: 'MGAs / wholesalers',
      agency: 'independent agencies / brokers',
      insurtech: 'insurtech / digital-first brands',
      other: 'insurance businesses'
    };
    return map[orgType] || 'insurance businesses';
  }

  function footprintShort(footprint) {
    var map = {
      local: 'local',
      regional: 'regional',
      national: 'national',
      unknown: 'regional'
    };
    return map[footprint] || footprint;
  }

  function resolveQuestionIds(answers) {
    var ids = ['org_type', 'insurance_line', 'footprint', 'main_failure'];
    if (answers.main_failure) {
      if (answers.main_failure === 'rarely_mentioned' || answers.main_failure === 'wrong_competitors') {
        ids.push('q5_discoverability');
      } else {
        ids.push('q5_accuracy');
      }
    }
    ids.push('business_impact');
    return ids;
  }

  function normalizeAnswers(answers) {
    return {
      vertical: 'insurance',
      org_type: answers.org_type === 'other' ? RESULT_ENGINE.normalization.other_org_maps_to : answers.org_type,
      insurance_line: answers.insurance_line === 'other' ? RESULT_ENGINE.normalization.other_line_maps_to : answers.insurance_line,
      footprint: answers.footprint === 'unknown' ? RESULT_ENGINE.normalization.unknown_footprint_maps_to : answers.footprint,
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

  function buildResult(dataMap, answers) {
    var normalized = normalizeAnswers(answers);
    var key = ['insurance', normalized.org_type, normalized.insurance_line, normalized.footprint].join('__');
    var cohort = dataMap[key];
    if (!cohort) return null;

    var dimensions = {
      discoverability: cohort.avgDiscoverability,
      accuracy: cohort.avgAccuracy,
      displacement: cohort.avgDisplacement,
      complexity: cohort.avgComplexity
    };

    applyDelta(dimensions, RESULT_ENGINE.mainFailureAdjustments[normalized.main_failure]);
    if (normalized.q5_discoverability) applyDelta(dimensions, RESULT_ENGINE.q5DiscoverabilityAdjustments[normalized.q5_discoverability]);
    if (normalized.q5_accuracy) applyDelta(dimensions, RESULT_ENGINE.q5AccuracyAdjustments[normalized.q5_accuracy]);

    Object.keys(dimensions).forEach(function(dim) {
      dimensions[dim] = round1(clamp(dimensions[dim], 0, 100));
    });

    var score = round1(
      (dimensions.discoverability * RESULT_ENGINE.weights.discoverability) +
      (dimensions.accuracy * RESULT_ENGINE.weights.accuracy) +
      (dimensions.displacement * RESULT_ENGINE.weights.displacement) +
      (dimensions.complexity * RESULT_ENGINE.weights.complexity)
    );
    score = clamp(score, 0, 100);

    var percentile = estimatePercentile(score, cohort);
    var band = RESULT_ENGINE.bandLabel(score);
    var flags = RESULT_ENGINE.flags
      .filter(function(rule) { return dimensions[rule.dimension] <= rule.max; })
      .map(function(rule) { return rule.label; })
      .slice(0, 3);

    var orgLabel = optionLabel('org_type', answers.org_type);
    var lineLabel = optionLabel('insurance_line', answers.insurance_line);
    var patternPhrase = RESULT_ENGINE.patternPhrase[normalized.main_failure];
    var meaningPhrase = RESULT_ENGINE.meaningPhrase[normalized.business_impact];
    var profileOrgLabel = answers.org_type === 'other' ? 'insurance business' : orgLabel.toLowerCase();
    var profileLabel = footprintShort(answers.footprint) + ' ' + lineLabel.toLowerCase() + ' ' + profileOrgLabel;
    var peerGroupLabel = footprintShort(answers.footprint) + ' ' + lineLabel.toLowerCase() + ' ' + orgPlural(answers.org_type);

    var topRiskKey = topKeyFromCounts(cohort.topRisks);
    var topFixKey = topKeyFromCounts(cohort.topFixes);

    return {
      cohortKey: key,
      sampleSize: cohort.sampleSize,
      score: score,
      percentile: percentile,
      band: band,
      avgScore: cohort.avgScore,
      dimensions: dimensions,
      flags: flags,
      profileLabel: profileLabel,
      peerGroupLabel: peerGroupLabel,
      patternPhrase: patternPhrase,
      meaningPhrase: meaningPhrase,
      topRiskLabel: RESULT_ENGINE.riskLabels[topRiskKey] || 'visibility risk',
      topFixLabel: RESULT_ENGINE.fixLabels[topFixKey] || 'source structuring',
      reportUrl: '/get-report/?source=insurance-benchmark&cohort=' + encodeURIComponent(key) +
        '&org_type=' + encodeURIComponent(normalized.org_type) +
        '&insurance_line=' + encodeURIComponent(normalized.insurance_line) +
        '&footprint=' + encodeURIComponent(normalized.footprint) +
        '&main_failure=' + encodeURIComponent(normalized.main_failure) +
        '&score=' + encodeURIComponent(score),
      guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact buyer queries where you disappear, the competitors replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
    };
  }

  function mountOne(root) {
    if (!root || root.dataset[MOUNT_FLAG]) return;
    root.dataset[MOUNT_FLAG] = '1';

    var source = root.getAttribute('data-source') || 'insurance-ai-visibility';
    var state = {
      screen: 'loading',
      stepIndex: 0,
      answers: {},
      loadingError: '',
      dataMap: null,
      result: null,
      emailSent: false,
      anonId: getAnonymousId(),
      quizId: randomId('quiz'),
      analysis: null
    };

    function tracked(kind, payload, contact) {
      var merged = {
        AnonId: state.anonId,
        QuizId: state.quizId
      };
      var extras = payload || {};
      Object.keys(extras).forEach(function(key) {
        merged[key] = extras[key];
      });
      track(kind, source, merged, contact || state.anonId);
    }

    function trackedGtag(name, params) {
      var merged = {
        source: source,
        anon_id: state.anonId,
        quiz_id: state.quizId
      };
      var extras = params || {};
      Object.keys(extras).forEach(function(key) {
        merged[key] = extras[key];
      });
      gtagEvent(name, merged);
    }

    function render() {
      root.className = 'm-ibq';
      var wrapClass = 'm-ibq__wrap' + (state.screen === 'intro' ? ' m-ibq__wrap--intro' : '');
      root.innerHTML = '<div class="m-ibq__shell"><div class="' + wrapClass + '">' + screenHtml() + '</div></div>';
      bind();
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
      if (state.screen === 'loading') {
        return '' +
          '<div class="m-ibq__screen m-ibq__loading">' +
            '<div class="m-ibq__spinner" aria-hidden="true"></div>' +
            '<p class="m-ibq__sub">Loading the insurance benchmark…</p>' +
          '</div>';
      }

      if (state.screen === 'error') {
        return '' +
          '<div class="m-ibq__screen">' +
            topBar() +
            '<div class="m-ibq__error">' +
              '<strong>Benchmark preview could not load.</strong> ' + escapeHtml(state.loadingError || 'Try a normal local or deployed web server preview.') +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'analysis' && state.analysis) {
        return '' +
          '<div class="m-ibq__screen">' +
            topBar() +
            '<div class="m-ibq__analysis">' +
              '<div class="m-ibq__spinner" aria-hidden="true"></div>' +
              '<h3 class="m-ibq__analysisTitle">' + escapeHtml(state.analysis.title) + '</h3>' +
              '<p class="m-ibq__analysisText">' + escapeHtml(state.analysis.text) + '</p>' +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'intro') {
        return '' +
          '<div class="m-ibq__screen m-ibq__screen--intro">' +
            topBar() +
            '<div class="m-ibq__introBody">' +
              '<div class="m-ibq__introMain">' +
                '<div class="m-ibq__introKickers">' +
                  '<span class="m-ibq__kicker">6 quick taps</span>' +
                  '<span class="m-ibq__kicker">Instant result</span>' +
                '</div>' +
                '<h3 class="m-ibq__title">Insurance AI Visibility Benchmark</h3>' +
                '<p class="m-ibq__lead">When buyers ask AI about insurance, does your brand get surfaced, skipped, or misrepresented?</p>' +
                '<p class="m-ibq__sub">Compare your likely AI visibility against similar carriers, agencies, MGAs, and insurance brands.</p>' +
                '<p class="m-ibq__time">Takes 60 seconds.</p>' +
              '</div>' +
              '<div class="m-ibq__introPanel">' +
                '<div>' +
                  '<div class="m-ibq__introFlow">' +
                    '<div class="m-ibq__introFlowLabel">Question 1 of 6</div>' +
                    '<div class="m-ibq__introDots" aria-hidden="true">' +
                      '<span class="m-ibq__introDot is-active"></span>' +
                      '<span class="m-ibq__introDot"></span>' +
                      '<span class="m-ibq__introDot"></span>' +
                      '<span class="m-ibq__introDot"></span>' +
                      '<span class="m-ibq__introDot"></span>' +
                      '<span class="m-ibq__introDot"></span>' +
                    '</div>' +
                  '</div>' +
                  '<h4 class="m-ibq__introQuestion">What best describes your business?</h4>' +
                  '<div class="m-ibq__introPreview" aria-hidden="true">' +
                    '<div class="m-ibq__previewTile"><span>Carrier</span><span class="m-ibq__previewGhost">Preview</span></div>' +
                    '<div class="m-ibq__previewTile"><span>MGA / wholesaler</span><span class="m-ibq__previewGhost">Preview</span></div>' +
                    '<div class="m-ibq__previewTile"><span>Independent agency / broker</span><span class="m-ibq__previewGhost">Preview</span></div>' +
                  '</div>' +
                  '<p class="m-ibq__previewHint">Starts in this module and reveals your benchmark here after 6 answers.</p>' +
                '</div>' +
                '<div class="m-ibq__ctaRow m-ibq__ctaRow--intro"><button type="button" class="m-ibq__btn" data-ibq-action="start">Start here <span class="m-ibq__btnChevron" aria-hidden="true">↓</span></button></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      if (state.screen === 'question') {
        var questionIds = resolveQuestionIds(state.answers);
        var questionId = questionIds[state.stepIndex];
        var question = QUESTIONS[questionId];
        var progress = Math.round(((state.stepIndex + 1) / 6) * 100);
        var status = '';
        if (state.answers.insurance_line) {
          var footprintHint = state.answers.footprint ? optionLabel('footprint', state.answers.footprint).toLowerCase().replace('single-state / ', '') : 'regional';
          status = 'Building benchmark for ' + footprintHint + ' ' + optionLabel('insurance_line', state.answers.insurance_line).toLowerCase() + ' ' + orgPlural(state.answers.org_type || 'carrier') + '…';
        }
        var optionsHtml = question.options.map(function(option) {
          return '' +
            '<button type="button" class="m-ibq__option" data-ibq-answer="' + escapeHtml(option.id) + '" data-ibq-question="' + escapeHtml(questionId) + '">' +
              '<span class="m-ibq__optionLabel">' + escapeHtml(option.label) + '</span>' +
              '<span class="m-ibq__optionMeta"><span>Select answer</span><span class="m-ibq__optionArrow">→</span></span>' +
            '</button>';
        }).join('');

        return '' +
          '<div class="m-ibq__screen">' +
            topBar() +
            '<div class="m-ibq__progressRow">' +
              '<div class="m-ibq__progressText">Question ' + (state.stepIndex + 1) + ' of 6</div>' +
              '<div></div>' +
            '</div>' +
            '<div class="m-ibq__bar" aria-hidden="true"><div class="m-ibq__barFill" style="width:' + progress + '%"></div></div>' +
            (status ? '<div class="m-ibq__statusPill">' + escapeHtml(status) + '</div>' : '<div class="m-ibq__statusPill">Live benchmark path</div>') +
            '<h3 class="m-ibq__qTitle">' + escapeHtml(question.headline) + '</h3>' +
            '<p class="m-ibq__qSupport">' + escapeHtml(question.support) + '</p>' +
            '<div class="m-ibq__options">' + optionsHtml + '</div>' +
            '<div class="m-ibq__questionFoot">One tap advances immediately. Your result appears after the sixth answer.</div>' +
          '</div>';
      }

      if (state.screen === 'result' && state.result) {
        var flagsHtml = state.result.flags.map(function(flag) {
          return '<span class="m-ibq__flag">' + escapeHtml(flag) + '</span>';
        }).join('');

        var cohortBullets = '' +
          '<li>In this cohort, <strong class="m-ibq__emph">' + escapeHtml(state.result.topRiskLabel) + '</strong> is the most common pressure pattern.</li>' +
          '<li>The most common fix category in similar audits is <strong class="m-ibq__emph">' + escapeHtml(state.result.topFixLabel) + '</strong>.</li>';

        return '' +
          '<div class="m-ibq__screen">' +
            topBar() +
            '<div class="m-ibq__resultLead">Your benchmark result</div>' +
            '<h3 class="m-ibq__resultTitle">You landed in the <strong class="m-ibq__emph">' + escapeHtml(state.result.band) + '</strong>.</h3>' +
            '<div class="m-ibq__stats">' +
              '<div class="m-ibq__statCard m-ibq__statCard--score">' +
                '<div class="m-ibq__statLabel">Your score</div>' +
                '<div class="m-ibq__scoreValue">' + escapeHtml(state.result.score) + '</div>' +
                '<div class="m-ibq__scoreScale">out of 100</div>' +
              '</div>' +
              '<div class="m-ibq__statCard">' +
                '<div class="m-ibq__statLabel">You scored higher than</div>' +
                '<div class="m-ibq__statBig">' + escapeHtml(state.result.percentile) + '%</div>' +
                '<div class="m-ibq__statDesc">of <strong class="m-ibq__emph">similar insurance brands</strong> in this benchmark.</div>' +
              '</div>' +
              '<div class="m-ibq__statCard">' +
                '<div class="m-ibq__statLabel">Cohort average</div>' +
                '<div class="m-ibq__statBig">' + escapeHtml(state.result.avgScore) + '</div>' +
                '<div class="m-ibq__statDesc">for <strong class="m-ibq__emph">' + escapeHtml(state.result.peerGroupLabel) + '</strong>.</div>' +
              '</div>' +
            '</div>' +
            '<div class="m-ibq__tier">' + escapeHtml(state.result.band) + '</div>' +
            '<div class="m-ibq__callouts">' +
              '<div class="m-ibq__callout">' +
                '<div class="m-ibq__calloutLabel">What your answers most strongly suggest</div>' +
                '<p class="m-ibq__diag">For a <strong class="m-ibq__emph">' + escapeHtml(state.result.profileLabel) + '</strong>, your answers most strongly match a pattern where <strong class="m-ibq__emph">' + escapeHtml(state.result.patternPhrase) + '</strong>.</p>' +
              '</div>' +
              '<div class="m-ibq__callout">' +
                '<div class="m-ibq__calloutLabel">What this usually means</div>' +
                '<p class="m-ibq__meaning"><strong class="m-ibq__emph">' + escapeHtml(state.result.meaningPhrase) + '</strong>.</p>' +
              '</div>' +
            '</div>' +
            '<ul class="m-ibq__bullets">' + cohortBullets + '</ul>' +
            (flagsHtml ? '<div class="m-ibq__flags">' + flagsHtml + '</div>' : '') +
            '<p class="m-ibq__guard">' + escapeHtml(state.result.guardLine) + '</p>' +
            '<div class="m-ibq__ctaSet">' +
              '<a class="m-ibq__linkBtn" data-ibq-action="report" href="' + escapeHtml(state.result.reportUrl + '&quiz_id=' + encodeURIComponent(state.quizId)) + '">See what AI actually says about my brand</a>' +
              '<a class="m-ibq__linkBtn m-ibq__linkBtn--secondary" data-ibq-action="sample" href="/sample-ai-visibility-report/">See a sample report</a>' +
            '</div>' +
            '<div class="m-ibq__form">' +
              '<p class="m-ibq__formTitle">Send me this benchmark result</p>' +
              '<input class="m-ibq__field" data-ibq-field="email" type="email" placeholder="you@company.com" autocomplete="email">' +
              '<textarea class="m-ibq__field m-ibq__textarea" data-ibq-field="note" placeholder="What&rsquo;s one wrong thing AI gets wrong most often about your brand or category? (optional)"></textarea>' +
              '<div class="m-ibq__formRow">' +
                '<button type="button" class="m-ibq__btn" data-ibq-action="email-result">Send me this result</button>' +
              '</div>' +
              '<p class="m-ibq__small">This sends your benchmark summary only. The full Metricus report is a separate audit.</p>' +
              (state.emailSent ? '<p class="m-ibq__thanks">Benchmark summary request received.</p>' : '') +
            '</div>' +
          '</div>';
      }

      return '';
    }

    function topBar() {
      return '' +
        '<div class="m-ibq__top">' +
          '<div class="m-ibq__brand">Metricus</div>' +
          '<div class="m-ibq__meta">Insurance research</div>' +
        '</div>';
    }

    function bind() {
      var startBtn = root.querySelector('[data-ibq-action="start"]');
      if (startBtn) {
        startBtn.addEventListener('click', function() {
          state.screen = 'question';
          state.stepIndex = 0;
          state.answers = {};
          state.result = null;
          state.emailSent = false;
          state.quizId = randomId('quiz');
          tracked('INSURANCE_QUIZ_START', {});
          trackedGtag('insurance_quiz_start');
          render();
        });
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-ibq-answer]'), function(btn) {
        btn.addEventListener('click', function() {
          var questionId = btn.getAttribute('data-ibq-question');
          var answerId = btn.getAttribute('data-ibq-answer');
          btn.classList.add('is-picked');
          state.answers[questionId] = answerId;

          if (questionId === 'main_failure') {
            delete state.answers.q5_discoverability;
            delete state.answers.q5_accuracy;
          }

          tracked('INSURANCE_QUIZ_' + questionId.toUpperCase(), {
            Answer: answerId
          });

          setTimeout(function() {
            var questionIds = resolveQuestionIds(state.answers);
            if (questionId === 'insurance_line') {
              tracked('INSURANCE_QUIZ_ANALYSIS_STAGE', { Stage: 'segment_assembly' });
              runAnalysis({
                title: 'Assembling your benchmark…',
                text: 'Matching your insurance category and peer group before the next questions.',
                duration: 1300
              }, function() {
                state.screen = 'question';
                state.stepIndex += 1;
                render();
              });
              return;
            }

            if (state.stepIndex >= questionIds.length - 1) {
              tracked('INSURANCE_QUIZ_ANALYSIS_STAGE', { Stage: 'result_calculation' });
              runAnalysis({
                title: 'Preparing your insurance benchmark result…',
                text: 'Matching your answers to similar insurance brands and calculating your score, tier, and peer comparison.',
                duration: 2200
              }, function() {
                state.result = buildResult(state.dataMap, state.answers);
                state.screen = 'result';
                tracked('INSURANCE_QUIZ_COMPLETE', {
                  Score: state.result ? state.result.score : '',
                  Percentile: state.result ? state.result.percentile : '',
                  Cohort: state.result ? state.result.cohortKey : ''
                });
                trackedGtag('insurance_quiz_complete', {
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

      var reportLink = root.querySelector('[data-ibq-action="report"]');
      if (reportLink) {
        reportLink.addEventListener('click', function() {
          tracked('INSURANCE_QUIZ_CTA_REPORT', {
            Score: state.result ? state.result.score : '',
            Cohort: state.result ? state.result.cohortKey : ''
          });
          trackedGtag('insurance_quiz_report_click', {
            score: state.result ? state.result.score : ''
          });
        });
      }

      var sampleLink = root.querySelector('[data-ibq-action="sample"]');
      if (sampleLink) {
        sampleLink.addEventListener('click', function() {
          tracked('INSURANCE_QUIZ_CTA_SAMPLE', {
            Score: state.result ? state.result.score : '',
            Cohort: state.result ? state.result.cohortKey : ''
          });
        });
      }

      var emailBtn = root.querySelector('[data-ibq-action="email-result"]');
      if (emailBtn) {
        emailBtn.addEventListener('click', function() {
          var emailField = root.querySelector('[data-ibq-field="email"]');
          var noteField = root.querySelector('[data-ibq-field="note"]');
          var email = emailField ? String(emailField.value || '').trim() : '';
          var note = noteField ? String(noteField.value || '').trim() : '';
          if (!email || !/.+@.+\..+/.test(email)) {
            if (emailField) emailField.focus();
            return;
          }
          tracked('INSURANCE_QUIZ_EMAIL_RESULT', {
            Score: state.result ? state.result.score : '',
            Cohort: state.result ? state.result.cohortKey : '',
            Note: note
          }, email);
          trackedGtag('insurance_quiz_email_result', {
            score: state.result ? state.result.score : ''
          });
          state.emailSent = true;
          render();
        });
      }
    }

    function loadData() {
      fetch(DATA_URL, { credentials: 'same-origin' })
        .then(function(response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function(json) {
          var map = {};
          (json.cohorts || []).forEach(function(cohort) {
            map[cohort.cohort_key] = {
              orgType: cohort.org_type,
              insuranceLine: cohort.insurance_line,
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
          tracked('INSURANCE_QUIZ_VIEW', { DataMode: 'benchmark' });
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
    injectStyle();
    var nodes = document.querySelectorAll('[data-insurance-benchmark-quiz]');
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
            if (node.matches && node.matches('[data-insurance-benchmark-quiz]')) mountOne(node);
            if (node.querySelectorAll) {
              var nested = node.querySelectorAll('[data-insurance-benchmark-quiz]');
              for (var k = 0; k < nested.length; k++) mountOne(nested[k]);
            }
          }
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch (err) {}
  }
})();
