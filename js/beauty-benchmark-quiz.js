(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'beauty',
    selector: '[data-benchmark-quiz="beauty"]',
    sourceDefault: 'beauty-ai-visibility',
    storageKey: 'metricusBeautyBenchmarkAnonSeed',
    dataUrl: '/js/beauty-benchmark-cohorts.json',
    config: {
      colors: {
        primary: '#66535b',
        primaryDim: '#4e3f45',
        accent: '#b15c79',
        accentDim: '#90495f',
        accentSoft: '#f7eaf0',
        surface: '#fcf8f9',
        surfaceLow: '#f5eef1',
        surfaceHigh: '#efe5e9',
        border: '#cfaeb9',
        borderLight: '#ead7df',
        text: '#312b2e',
        textDim: '#6f6368',
        white: '#ffffff'
      },
      metaLabel: 'Beauty research',
      analyticsPrefix: 'BEAUTY_QUIZ',
      intro: {
        title: 'Beauty AI Visibility Benchmark',
        lead: 'When shoppers ask AI about skincare, makeup, or haircare, does your brand get surfaced, skipped, or mislabeled?',
        sub: 'Compare your likely AI visibility against similar beauty brands.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['brand', 'indie', 'retailer'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.',
        ctaLabel: 'Try it'
      },
      questionStatus: {
        empty: 'Live benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'beauty-benchmark'
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
        notePlaceholder: 'What is one wrong thing AI gets wrong most often about your brand or category? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact shopper prompts where you disappear, the competitors replacing you, or the source pages driving wrong beauty answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your beauty category and peer group before the next questions.',
          duration: 1200
        },
        resultCalculation: {
          title: 'Preparing your beauty benchmark result…',
          text: 'Matching your answers to similar beauty brands and calculating your score, tier, and peer comparison.',
          duration: 2100
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'wrong_competitors']
      },
      normalization: {
        org_type: { other: 'brand' },
        segment: { other: 'skincare' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your beauty business?',
          support: 'This changes which beauty brands you should be compared against.',
          options: [
            { id: 'brand', label: 'Established beauty brand' },
            { id: 'indie', label: 'Indie / DTC brand' },
            { id: 'retailer', label: 'Retailer / marketplace' },
            { id: 'salon', label: 'Salon / pro brand' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which beauty category matters most for this benchmark?',
          support: 'Visibility patterns differ sharply across skincare, makeup, haircare, fragrance, body care, and wellness searches.',
          options: [
            { id: 'skincare', label: 'Skincare' },
            { id: 'makeup', label: 'Makeup' },
            { id: 'haircare', label: 'Haircare' },
            { id: 'fragrance', label: 'Fragrance' },
            { id: 'bodycare', label: 'Body care' },
            { id: 'wellness', label: 'Wellness' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI behavior is very different for local, regional, and national beauty brands.',
          options: [
            { id: 'local', label: 'Local / regionally sold' },
            { id: 'regional', label: 'Multi-state regional' },
            { id: 'national', label: 'National / online-first' },
            { id: 'unknown', label: 'Not sure' }
          ]
        },
        main_failure: {
          id: 'main_failure',
          headline: 'What feels most broken right now?',
          support: 'For most beauty brands, the problem is either invisibility or wrong product facts.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'wrong_competitors', label: 'AI recommends the same big brands instead' },
            { id: 'ingredient_wrong', label: 'AI gets ingredient strength or concentration wrong' },
            { id: 'shade_wrong', label: 'AI gets shade range or skin tone inclusivity wrong' },
            { id: 'formulation_wrong', label: 'AI gets formulation status or claims wrong' },
            { id: 'pricing_wrong', label: 'AI gets price or availability wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps distinguish total invisibility from competitor displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We only show up in weak or secondary mentions' },
            { id: 'narrow_cases', label: 'We show up for our brand but not “best of” prompts' },
            { id: 'big_brands', label: 'Bigger prestige brands take the recommendation spots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Beauty trust breaks quickly when AI sounds confident but gets the product facts wrong.',
          options: [
            { id: 'ingredient_pct_wrong', label: 'Wrong ingredient percentages or strength' },
            { id: 'routine_fit_wrong', label: 'Wrong skin-type or routine fit' },
            { id: 'shade_wrong_detail', label: 'Wrong shade range or tone coverage' },
            { id: 'price_availability_wrong', label: 'Wrong price or availability' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_site_visits', label: 'Fewer site visits or samples' },
            { id: 'fewer_retail_conversions', label: 'Fewer retail conversions' },
            { id: 'lose_to_bigger_brands', label: 'Losing shoppers to bigger brands' },
            { id: 'support_correction', label: 'Customer service correcting AI misinformation' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'beauty brands',
        otherOrgProfileLabel: 'beauty brand',
        profileLabelMap: {
          brand: 'beauty brand',
          indie: 'indie beauty brand',
          retailer: 'retailer',
          salon: 'salon/pro brand',
          other: 'beauty business'
        },
        orgPluralMap: {
          brand: 'beauty brands',
          indie: 'indie beauty brands',
          retailer: 'retailers',
          salon: 'salon/pro brands',
          other: 'beauty businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.33,
          accuracy: 0.31,
          displacement: 0.21,
          complexity: 0.15
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -16, displacement: -7, accuracy: -2, complexity: 0 },
            wrong_competitors: { discoverability: -10, displacement: -15, accuracy: -2, complexity: 0 },
            ingredient_wrong: { discoverability: -2, displacement: -2, accuracy: -14, complexity: -5 },
            shade_wrong: { discoverability: -2, displacement: -1, accuracy: -13, complexity: -4 },
            formulation_wrong: { discoverability: -1, displacement: -1, accuracy: -11, complexity: -6 },
            pricing_wrong: { discoverability: -2, displacement: -2, accuracy: -9, complexity: -4 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -6 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            narrow_cases: { discoverability: -5, displacement: -2 },
            big_brands: { discoverability: -4, displacement: -10 }
          },
          q5_accuracy: {
            ingredient_pct_wrong: { accuracy: -10, complexity: -4 },
            routine_fit_wrong: { accuracy: -8, complexity: -3 },
            shade_wrong_detail: { accuracy: -9, complexity: -5 },
            price_availability_wrong: { accuracy: -7, complexity: -3 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 46 },
          { label: 'High ingredient accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High competitor displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High beauty complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'discoverability pressure',
          accuracy_gap: 'ingredient and shade accuracy pressure',
          competitor_displacement: 'competitor displacement',
          complexity_gap: 'beauty claim complexity pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'comparison-positioning gaps',
          ingredient_fact_hygiene: 'ingredient fact hygiene',
          shade_range_clarity: 'shade range clarity',
          formulation_and_source_hygiene: 'formulation/source hygiene',
          pricing_and_availability_clarity: 'pricing and availability clarity',
          source_structuring_and_fact_hygiene: 'source structuring'
        },
        patternPhrases: {
          rarely_mentioned: 'AI does not have enough trustworthy beauty-specific surface area to include you consistently',
          wrong_competitors: 'bigger prestige and mass-market brands are taking the recommendation layer before shoppers reach you',
          ingredient_wrong: 'AI is likely smoothing over ingredient strength and formulation detail in ways that can change purchase intent',
          shade_wrong: 'AI is likely flattening shade-range or tone-inclusivity detail into oversimplified recommendations',
          formulation_wrong: 'AI may be mixing discontinued, reformulated, or packaging-claim details into current advice',
          pricing_wrong: 'buyers may be getting false price or availability expectations before they ever reach your product pages'
        },
        meaningPhrases: {
          fewer_site_visits: 'shoppers may leave the consideration set before they ever see your PDPs or store locator',
          fewer_retail_conversions: 'retail partners and shoppers may default to bigger brands when AI frames the shortlist',
          lose_to_bigger_brands: 'brand size and citation footprint may be substituting for actual product fit in the buyer shortlist',
          support_correction: 'your team may be correcting AI-created misinformation instead of moving toward purchase',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
