(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'hvac',
    selector: '[data-benchmark-quiz="hvac"]',
    sourceDefault: 'hvac-calls-declining-2026',
    storageKey: 'metricusHvacBenchmarkAnonSeed',
    dataUrl: '/js/hvac-benchmark-cohorts.json',
    config: {
      colors: {
        primary: '#5a6570',
        primaryDim: '#34414a',
        accent: '#158355',
        accentDim: '#0f6843',
        accentSoft: '#e8f8ef',
        surface: '#f7fbf8',
        surfaceLow: '#eef6f1',
        surfaceHigh: '#e2efe7',
        border: '#b8d8c6',
        borderLight: '#d4e7d8',
        text: '#243036',
        textDim: '#5d6b70',
        white: '#ffffff'
      },
      metaLabel: 'Home services research',
      analyticsPrefix: 'HVAC_QUIZ',
      intro: {
        title: 'HVAC AI Visibility Benchmark',
        lead: 'When homeowners ask AI about HVAC, does your business get surfaced, skipped, or replaced by a bigger brand?',
        sub: 'Compare your likely visibility against solo contractors, local HVAC companies, franchises, and multi-location brands.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['solo', 'local_company', 'franchise'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live HVAC benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'hvac-benchmark'
      },
      result: {
        leadLabel: 'Your HVAC benchmark result',
        titlePrefix: 'Your HVAC brand landed in the ',
        titleSuffix: '.',
        primaryCta: 'See what AI actually says about my business',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What\'s one wrong thing AI gets wrong most often about your HVAC business or category? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact homeowner prompts where you disappear, the competitors replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your HVAC benchmark…',
          text: 'Matching your service category and peer group before the next questions.',
          duration: 1200
        },
        resultCalculation: {
          title: 'Preparing your HVAC benchmark result…',
          text: 'Matching your answers to similar HVAC businesses and calculating your score, tier, and peer comparison.',
          duration: 1900
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'wrong_competitors']
      },
      normalization: {
        org_type: { other: 'local_company' },
        segment: { other: 'replacement_install' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your HVAC business?',
          support: 'This changes which HVAC businesses you should be compared against.',
          options: [
            { id: 'solo', label: 'Solo contractor / one truck' },
            { id: 'local_company', label: 'Local HVAC company' },
            { id: 'franchise', label: 'Franchise / dealer' },
            { id: 'multi_location', label: 'Multi-location contractor' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which work matters most for this benchmark?',
          support: 'Visibility changes based on whether buyers want emergency repair, replacement, or a bigger project.',
          options: [
            { id: 'ac_repair', label: 'AC repair / emergency service' },
            { id: 'furnace_repair', label: 'Furnace / heating repair' },
            { id: 'replacement_install', label: 'Replacement / install' },
            { id: 'maintenance_plans', label: 'Maintenance plans' },
            { id: 'heat_pumps', label: 'Heat pumps' },
            { id: 'commercial_light', label: 'Commercial HVAC' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is your service area?',
          support: 'AI behaves differently for local operators, regional contractors, and national footprints.',
          options: [
            { id: 'local', label: 'Local service area' },
            { id: 'regional', label: 'Regional multi-city' },
            { id: 'national', label: 'National' },
            { id: 'unknown', label: 'Not sure' }
          ]
        },
        main_failure: {
          id: 'main_failure',
          headline: 'What feels most broken right now?',
          support: 'For most HVAC businesses, the problem is either invisibility or wrong expectations.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'wrong_competitors', label: 'AI pushes bigger brands instead' },
            { id: 'pricing_wrong', label: 'AI gets pricing wrong' },
            { id: 'service_area_wrong', label: 'AI gets service area wrong' },
            { id: 'equipment_wrong', label: 'AI gets equipment or install details wrong' },
            { id: 'credentials_wrong', label: 'AI gets credentials or rebate details wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps distinguish total invisibility from brand displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We appear only in weak mentions' },
            { id: 'directory_only', label: 'We show up in directories, not recommendations' },
            { id: 'bigger_brands_take_slots', label: 'Bigger brands take the recommendation spots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'HVAC trust breaks fast when AI sounds confident but is factually wrong.',
          options: [
            { id: 'flat_rate_pricing', label: 'AI invents flat-rate pricing' },
            { id: 'service_area_wrong', label: 'AI gets service area wrong' },
            { id: 'equipment_wrong', label: 'AI gets equipment or system type wrong' },
            { id: 'financing_warranty_wrong', label: 'AI gets rebates, financing, or warranty details wrong' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_calls', label: 'Fewer calls or booked jobs' },
            { id: 'more_price_shoppers', label: 'More price shoppers' },
            { id: 'leads_go_to_franchise', label: 'Leads go to franchise or bigger brands' },
            { id: 'office_corrects_ai', label: 'Office team keeps correcting AI' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'HVAC businesses',
        otherOrgProfileLabel: 'HVAC business',
        profileLabelMap: {
          solo: 'solo contractor',
          local_company: 'local HVAC company',
          franchise: 'franchise brand',
          multi_location: 'multi-location contractor',
          other: 'HVAC business'
        },
        orgPluralMap: {
          solo: 'solo operators',
          local_company: 'local HVAC companies',
          franchise: 'franchise brands',
          multi_location: 'multi-location contractors',
          other: 'HVAC businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.38,
          accuracy: 0.24,
          displacement: 0.23,
          complexity: 0.15
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -17, displacement: -7, accuracy: -2, complexity: 0 },
            wrong_competitors: { discoverability: -9, displacement: -16, accuracy: -2, complexity: 0 },
            pricing_wrong: { discoverability: -2, displacement: -1, accuracy: -14, complexity: -4 },
            service_area_wrong: { discoverability: -2, displacement: -1, accuracy: -12, complexity: -7 },
            equipment_wrong: { discoverability: -2, displacement: -1, accuracy: -11, complexity: -8 },
            credentials_wrong: { discoverability: -5, displacement: -4, accuracy: -7, complexity: -2 }
          },
          q5_discoverability: {
            not_present: { discoverability: -13, displacement: -6 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            directory_only: { discoverability: -5, displacement: -3 },
            bigger_brands_take_slots: { discoverability: -4, displacement: -11 }
          },
          q5_accuracy: {
            flat_rate_pricing: { accuracy: -10, complexity: -3 },
            service_area_wrong: { accuracy: -8, complexity: -7 },
            equipment_wrong: { accuracy: -9, complexity: -8 },
            financing_warranty_wrong: { accuracy: -7, complexity: -6 }
          }
        },
        flags: [
          { label: 'High call-discovery risk', dimension: 'discoverability', max: 48 },
          { label: 'High pricing and service accuracy risk', dimension: 'accuracy', max: 50 },
          { label: 'High competitor displacement risk', dimension: 'displacement', max: 47 },
          { label: 'High HVAC complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'call-discovery pressure',
          accuracy_gap: 'pricing and service accuracy pressure',
          competitor_displacement: 'franchise displacement',
          complexity_gap: 'HVAC complexity pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'comparison-positioning gaps',
          state_specific_fact_hygiene: 'service-area fact hygiene',
          pricing_fact_hygiene: 'pricing fact hygiene',
          coverage_and_exclusion_clarity: 'equipment and installation clarity',
          claims_process_clarity: 'service-flow clarity',
          source_structuring_and_fact_hygiene: 'source structuring'
        },
        patternPhrases: {
          rarely_mentioned: 'AI has too little local proof to include you consistently',
          wrong_competitors: 'bigger brands and better-cited competitors are taking the recommendation slots before buyers reach you',
          pricing_wrong: 'AI is likely inventing or flattening pricing expectations before the homeowner ever calls',
          service_area_wrong: 'outdated service-area data is likely creating wrong expectations about where you work',
          equipment_wrong: 'AI is likely oversimplifying equipment and installation details that matter to buyer trust',
          credentials_wrong: 'AI is missing or misreading the trust signals that differentiate your business'
        },
        meaningPhrases: {
          fewer_calls: 'buyers may leave the consideration set before your team ever gets a chance to diagnose the job',
          more_price_shoppers: 'homeowners may arrive expecting a number that does not match the actual job, which creates friction at the first call',
          leads_go_to_franchise: 'brand size and citation footprint may be substituting for actual fit in the homeowner shortlist',
          office_corrects_ai: 'your office may be spending time undoing AI-created confusion instead of moving toward the booking',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
