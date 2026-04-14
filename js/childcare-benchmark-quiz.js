(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'childcare',
    selector: '[data-benchmark-quiz="childcare"]',
    sourceDefault: 'childcare-ai-visibility',
    storageKey: 'metricusChildcareBenchmarkAnonSeed',
    dataUrl: '/js/childcare-benchmark-cohorts.json',
    config: {
      metaLabel: 'Childcare research',
      analyticsPrefix: 'CHILDCARE_QUIZ',
      intro: {
        title: 'Childcare AI Visibility Benchmark',
        lead: 'When parents ask AI about childcare, does your center get surfaced, skipped, or misdescribed?',
        sub: 'Compare your visibility against similar centers, multi-site childcare groups, and franchise locations.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['center', 'group', 'franchise'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live childcare benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'childcare-benchmark'
      },
      result: {
        leadLabel: 'Your benchmark result',
        titlePrefix: 'You landed in the ',
        titleSuffix: '.',
        primaryCta: 'See what AI actually says about my center',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What\'s one wrong thing AI gets wrong most often about your center or category? (optional)',
        guardLine: 'This benchmark estimates your likely visibility pattern. It does not show the exact parent prompts where you disappear, the chains replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your childcare category and peer group before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your childcare benchmark result…',
          text: 'Matching your answers to similar childcare brands and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'wrong_competitors']
      },
      normalization: {
        org_type: { other: 'center' },
        segment: { other: 'mixed_age' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your childcare business?',
          support: 'This changes which childcare brands you should be compared against.',
          options: [
            { id: 'center', label: 'Independent center' },
            { id: 'group', label: 'Multi-site childcare group' },
            { id: 'franchise', label: 'Franchise location' },
            { id: 'montessori', label: 'Montessori / specialty program' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which age group matters most for this benchmark?',
          support: 'AI visibility changes depending on whether parents are searching for infants, preschoolers, or school-age care.',
          options: [
            { id: 'infant_toddler', label: 'Infant / toddler' },
            { id: 'preschool', label: 'Preschool' },
            { id: 'school_age', label: 'School-age' },
            { id: 'mixed_age', label: 'Mixed age' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI behavior is very different for local centers, regional operators, and national brands.',
          options: [
            { id: 'local', label: 'Single-location / local' },
            { id: 'regional', label: 'Multi-site regional' },
            { id: 'national', label: 'National' },
            { id: 'unknown', label: 'Not sure' }
          ]
        },
        main_failure: {
          id: 'main_failure',
          headline: 'What feels most broken right now?',
          support: 'For most childcare brands, the problem is either invisibility or incorrect trust and safety details.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'wrong_competitors', label: 'AI recommends bigger chains instead' },
            { id: 'age_wrong', label: 'AI gets age ranges wrong' },
            { id: 'hours_wrong', label: 'AI gets hours or availability wrong' },
            { id: 'tuition_wrong', label: 'AI gets tuition or waitlist details wrong' },
            { id: 'trust_wrong', label: 'AI gets licensing or safety details wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps distinguish total invisibility from chain displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We appear only in weak or secondary mentions' },
            { id: 'narrow_cases', label: 'We show up only in narrow or named cases' },
            { id: 'chains_take_slots', label: 'National chains take the recommendation spots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Childcare trust breaks quickly when AI sounds confident but is factually wrong.',
          options: [
            { id: 'wrong_age', label: 'Wrong age range or program fit' },
            { id: 'wrong_hours', label: 'Wrong hours or schedule details' },
            { id: 'wrong_tuition_availability', label: 'Wrong tuition or availability details' },
            { id: 'wrong_safety_license', label: 'Wrong licensing or safety detail' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_tours', label: 'Fewer tours or inquiries' },
            { id: 'lose_to_chains', label: 'Losing families to bigger chains' },
            { id: 'sales_correction', label: 'Staff correcting bad AI expectations' },
            { id: 'trust_erosion', label: 'Brand trust erosion' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'childcare brands',
        otherOrgProfileLabel: 'childcare provider',
        orgPluralMap: {
          center: 'centers',
          group: 'childcare groups',
          franchise: 'franchise locations',
          montessori: 'Montessori programs',
          other: 'childcare providers'
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
            rarely_mentioned: { discoverability: -15, displacement: -7, accuracy: -1, complexity: 0 },
            wrong_competitors: { discoverability: -10, displacement: -15, accuracy: -1, complexity: 0 },
            age_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -4 },
            hours_wrong: { discoverability: -2, displacement: -2, accuracy: -10, complexity: -3 },
            tuition_wrong: { discoverability: -2, displacement: -2, accuracy: -11, complexity: -2 },
            trust_wrong: { discoverability: -2, displacement: -2, accuracy: -14, complexity: -7 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -6 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            narrow_cases: { discoverability: -5, displacement: -2 },
            chains_take_slots: { discoverability: -4, displacement: -10 }
          },
          q5_accuracy: {
            wrong_age: { accuracy: -10, complexity: -3 },
            wrong_hours: { accuracy: -8, complexity: -2 },
            wrong_tuition_availability: { accuracy: -9, complexity: -2 },
            wrong_safety_license: { accuracy: -12, complexity: -8 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 45 },
          { label: 'High factual accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High chain displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High trust and safety risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'discoverability pressure',
          accuracy_gap: 'factual accuracy pressure',
          competitor_displacement: 'brand displacement',
          complexity_gap: 'trust and safety pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'comparison-positioning gaps',
          age_range_clarity: 'age-range clarity',
          hours_and_availability_clarity: 'hours and availability clarity',
          tuition_and_waitlist_clarity: 'tuition and waitlist clarity',
          licensing_and_safety_clarity: 'licensing and safety clarity',
          source_structuring_and_fact_hygiene: 'source structuring'
        },
        patternPhrases: {
          rarely_mentioned: 'AI has too little trustworthy surface area to mention you consistently',
          wrong_competitors: 'larger chains and more-cited competitors take the recommendation layer before parents reach you',
          age_wrong: 'parents may be getting a false picture of who the center actually serves',
          hours_wrong: 'parents may be planning visits from outdated or fabricated hours',
          tuition_wrong: 'AI is likely flattening or inventing pricing and availability details',
          trust_wrong: 'AI is likely compressing or distorting trust and safety details that matter most to parents'
        },
        meaningPhrases: {
          fewer_tours: 'parents may never reach the tour stage because your center was not in the AI shortlist',
          lose_to_chains: 'chain size and web footprint may be substituting for fit in the parent shortlist',
          sales_correction: 'your staff may be spending time undoing AI-created confusion instead of building trust',
          trust_erosion: 'wrong facts can undermine confidence before families ever visit',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
