(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'fintech',
    selector: '[data-benchmark-quiz="fintech"]',
    sourceDefault: 'fintech-ai-visibility',
    storageKey: 'metricusFintechBenchmarkAnonSeed',
    dataUrl: '/js/fintech-benchmark-cohorts.json',
    config: {
      metaLabel: 'Fintech research',
      analyticsPrefix: 'FINTECH_QUIZ',
      intro: {
        title: 'Fintech AI Visibility Benchmark',
        lead: 'When buyers ask AI about money, does your brand get surfaced, skipped, or distorted?',
        sub: 'Compare your likely AI visibility against similar neobanks, lending platforms, payments brands, and fintech companies.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['neobank', 'lending', 'payments'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live fintech benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'fintech-benchmark'
      },
      result: {
        leadLabel: 'Your benchmark result',
        titlePrefix: 'You landed in the ',
        titleSuffix: '.',
        primaryCta: 'See what AI actually says about my fintech',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What\'s one wrong thing AI gets wrong most often about your fintech or category? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact buyer prompts, the competitors replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your category and peer group before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your fintech benchmark result…',
          text: 'Matching your answers to similar fintech brands and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'big_incumbents']
      },
      normalization: {
        org_type: { other: 'other' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your business?',
          support: 'This changes which fintech brands you should actually be compared against.',
          options: [
            { id: 'neobank', label: 'Neobank / consumer app' },
            { id: 'lending', label: 'Lending platform' },
            { id: 'payments', label: 'Payments / card brand' },
            { id: 'wealth', label: 'Wealth / investing platform' },
            { id: 'business_banking', label: 'Business banking / treasury' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which fintech product category matters most?',
          support: 'AI visibility patterns differ across deposits, lending, payments, investing, and business finance.',
          options: [
            { id: 'checking', label: 'Checking / card account' },
            { id: 'savings', label: 'Savings / deposits' },
            { id: 'lending', label: 'Lending / credit' },
            { id: 'payments', label: 'Payments' },
            { id: 'investing', label: 'Investing / wealth' },
            { id: 'business_banking', label: 'Business banking / treasury' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI behavior is very different for local, regional, and national fintech brands.',
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
          support: 'For most fintech brands, the problem is either invisibility or wrong financial facts.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'big_incumbents', label: 'AI recommends bigger incumbents instead' },
            { id: 'stale_rates', label: 'AI gets APY, APR, or fee data wrong' },
            { id: 'eligibility_wrong', label: 'AI gets eligibility or approval rules wrong' },
            { id: 'features_wrong', label: 'AI gets product features or tier differences wrong' },
            { id: 'compliance_wrong', label: 'AI gets compliance or security claims wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When buyers ask AI for this category, what happens?',
          support: 'This helps distinguish total invisibility from incumbent displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We show up only in weak or secondary mentions' },
            { id: 'publishers_take_slots', label: 'Comparison sites or publishers take the slots' },
            { id: 'incumbents_take_slots', label: 'Bigger incumbents take the slots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Fintech trust breaks quickly when AI sounds confident but is financially wrong.',
          options: [
            { id: 'stale_rates', label: 'Stale APY, APR, or fee data' },
            { id: 'eligibility_wrong', label: 'Wrong eligibility or approval rules' },
            { id: 'features_wrong', label: 'Wrong product features or tier differences' },
            { id: 'compliance_wrong', label: 'Wrong compliance or security claims' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_signups', label: 'Fewer applications or signups' },
            { id: 'lower_deposits', label: 'Lower deposits or funded accounts' },
            { id: 'lose_to_incumbents', label: 'Losing buyers to bigger incumbents' },
            { id: 'support_burden', label: 'More support or sales correction work' },
            { id: 'trust_erosion', label: 'Trust erosion' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'fintech brands',
        otherOrgProfileLabel: 'fintech business',
        orgPluralMap: {
          neobank: 'neobanks / consumer apps',
          lending: 'lending platforms',
          payments: 'payments brands',
          wealth: 'wealth / investing brands',
          business_banking: 'business banking / treasury brands',
          other: 'fintech businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.34,
          accuracy: 0.3,
          displacement: 0.2,
          complexity: 0.16
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -15, displacement: -8, accuracy: -2, complexity: 0 },
            big_incumbents: { discoverability: -9, displacement: -15, accuracy: -2, complexity: 0 },
            stale_rates: { discoverability: -2, displacement: -2, accuracy: -14, complexity: -4 },
            eligibility_wrong: { discoverability: -2, displacement: -2, accuracy: -11, complexity: -7 },
            features_wrong: { discoverability: -2, displacement: -3, accuracy: -10, complexity: -4 },
            compliance_wrong: { discoverability: -2, displacement: -2, accuracy: -8, complexity: -10 }
          },
          q5_discoverability: {
            not_present: { discoverability: -13, displacement: -5 },
            weak_mentions: { discoverability: -8, displacement: -3 },
            publishers_take_slots: { discoverability: -5, displacement: -11 },
            incumbents_take_slots: { discoverability: -4, displacement: -9 }
          },
          q5_accuracy: {
            stale_rates: { accuracy: -10, complexity: -4 },
            eligibility_wrong: { accuracy: -8, complexity: -8 },
            features_wrong: { accuracy: -7, complexity: -5 },
            compliance_wrong: { accuracy: -6, complexity: -9 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 48 },
          { label: 'High factual accuracy risk', dimension: 'accuracy', max: 49 },
          { label: 'High incumbent displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High compliance / eligibility risk', dimension: 'complexity', max: 45 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'discoverability pressure',
          accuracy_gap: 'factual accuracy pressure',
          competitor_displacement: 'incumbent displacement',
          complexity_gap: 'compliance / eligibility pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'comparison-positioning gaps',
          rate_and_fee_hygiene: 'rate and fee hygiene',
          eligibility_and_compliance_hygiene: 'eligibility and compliance hygiene',
          coverage_and_exclusion_clarity: 'product feature clarity',
          claims_process_clarity: 'trust and security clarity',
          source_structuring_and_fact_hygiene: 'source structuring'
        },
        patternPhrases: {
          rarely_mentioned: 'AI has too little citable fintech surface area to include you consistently',
          big_incumbents: 'comparison sites and incumbent financial brands are taking the recommendation layer before buyers reach you',
          stale_rates: 'buyers may be seeing stale APY or APR data before they ever land on your product',
          eligibility_wrong: 'AI is probably flattening underwriting, approval, or account-eligibility rules into generic advice',
          features_wrong: 'AI is likely compressing product tiers and features into one generic fintech story',
          compliance_wrong: 'AI is likely oversimplifying regulatory or security claims that matter to trust'
        },
        meaningPhrases: {
          fewer_signups: 'buyers may never reach your application or onboarding flow',
          lower_deposits: 'you lose deposit intent before it reaches your product',
          lose_to_incumbents: 'brand size and citation footprint may be substituting for actual product fit in the shortlist',
          support_burden: 'your team may spend time correcting AI-created confusion instead of converting interest',
          trust_erosion: 'wrong financial facts can damage confidence before buyers visit your site',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
