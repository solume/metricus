(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'insurance',
    selector: '[data-benchmark-quiz="insurance"]',
    sourceDefault: 'insurance-ai-visibility',
    storageKey: 'metricusInsuranceBenchmarkAnonSeed',
    dataUrl: '/js/insurance-benchmark-cohorts.json',
    config: {
      metaLabel: 'Insurance research',
      analyticsPrefix: 'INSURANCE_QUIZ',
      intro: {
        title: 'Insurance AI Visibility Benchmark',
        lead: 'When buyers ask AI about insurance, does your brand get surfaced, skipped, or misrepresented?',
        sub: 'Compare your likely AI visibility against similar carriers, agencies, MGAs, and insurance brands.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['carrier', 'mga', 'agency'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'insurance-benchmark'
      },
      result: {
        leadLabel: 'Your benchmark result',
        titlePrefix: 'You landed in the ',
        titleSuffix: '.',
        primaryCta: 'See what AI actually says about my brand',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What\'s one wrong thing AI gets wrong most often about your brand or category? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact buyer queries where you disappear, the competitors replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your insurance category and peer group before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your insurance benchmark result…',
          text: 'Matching your answers to similar insurance brands and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'wrong_competitors']
      },
      normalization: {
        org_type: { other: 'carrier' },
        segment: { other: 'multiline' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
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
        segment: {
          id: 'segment',
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
      },
      resultEngine: {
        industryPlural: 'insurance brands',
        otherOrgProfileLabel: 'insurance business',
        orgPluralMap: {
          carrier: 'carriers',
          mga: 'MGAs / wholesalers',
          agency: 'independent agencies / brokers',
          insurtech: 'insurtech / digital-first brands',
          other: 'insurance businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.36,
          accuracy: 0.28,
          displacement: 0.22,
          complexity: 0.14
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -16, displacement: -8, accuracy: -2, complexity: 0 },
            wrong_competitors: { discoverability: -10, displacement: -16, accuracy: -2, complexity: 0 },
            pricing_wrong: { discoverability: -2, displacement: -2, accuracy: -15, complexity: -4 },
            coverage_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -6 },
            state_wrong: { discoverability: -2, displacement: -2, accuracy: -12, complexity: -8 },
            claims_wrong: { discoverability: -2, displacement: -1, accuracy: -10, complexity: -7 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -6 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            narrow_cases: { discoverability: -5, displacement: -2 },
            nationals_take_slots: { discoverability: -4, displacement: -10 }
          },
          q5_accuracy: {
            fake_quote_expectations: { accuracy: -10, complexity: -3 },
            wrong_exclusions: { accuracy: -8, complexity: -5 },
            wrong_state_rules: { accuracy: -8, complexity: -8 },
            wrong_claims_service: { accuracy: -7, complexity: -6 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 45 },
          { label: 'High factual accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High competitor displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High insurance complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
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
        patternPhrases: {
          rarely_mentioned: 'AI has too little trustworthy surface area to include you consistently',
          wrong_competitors: 'larger brands and better-cited competitors take the recommendation layer before buyers reach you',
          pricing_wrong: 'buyers may be receiving false quote expectations before they ever request pricing from you',
          coverage_wrong: 'AI is likely compressing or distorting product detail that matters to buyer trust',
          state_wrong: 'state-specific complexity is creating a high risk of wrong availability or compliance expectations',
          claims_wrong: 'generic AI claims language is likely flattening real service differences into misleading expectations'
        },
        meaningPhrases: {
          fewer_quotes: 'buyers may leave the consideration set before your team ever gets a chance to quote or explain fit',
          lose_to_larger_brands: 'brand size and citation footprint may be substituting for actual suitability in the buyer shortlist',
          sales_correction: 'your team may be starting conversations by undoing AI-created confusion instead of moving toward the sale',
          trust_erosion: 'wrong facts can damage confidence before a buyer reaches your owned channels',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
