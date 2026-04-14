(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'real-estate',
    selector: '[data-benchmark-quiz="real-estate"]',
    sourceDefault: 'real-estate-ai-visibility',
    storageKey: 'metricusRealEstateBenchmarkAnonSeed',
    dataUrl: '/js/real-estate-benchmark-cohorts.json',
    config: {
      metaLabel: 'Real estate research',
      analyticsPrefix: 'REAL_ESTATE_QUIZ',
      intro: {
        title: 'Real Estate AI Visibility Benchmark',
        lead: 'When buyers ask AI about real estate, does your brokerage get surfaced, skipped, or replaced by portals?',
        sub: 'Compare your likely AI visibility against similar brokerages, agent teams, and market footprints.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['independent_brokerage', 'agent_team', 'franchise_office'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live real-estate benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'real-estate-benchmark'
      },
      result: {
        leadLabel: 'Your benchmark result',
        titlePrefix: 'You landed in the ',
        titleSuffix: '.',
        primaryCta: 'See what AI actually says about my brokerage',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What is one thing AI gets wrong most often about your market, brokerage, or service area? (optional)',
        guardLine: 'This benchmark estimates your likely real-estate visibility pattern. It does not show the exact prompts where you disappear, the portals replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your brokerage type and market segment before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your real-estate benchmark result…',
          text: 'Matching your answers to similar brokerages and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'portals_take_slots']
      },
      normalization: {
        org_type: { other: 'independent_brokerage' },
        segment: { other: 'residential_general' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your real-estate business?',
          support: 'This changes which brokerages and teams you should be compared against.',
          options: [
            { id: 'independent_brokerage', label: 'Independent brokerage' },
            { id: 'agent_team', label: 'Agent team' },
            { id: 'franchise_office', label: 'Franchise office' },
            { id: 'luxury_boutique', label: 'Luxury boutique brokerage' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which part of the market matters most for this benchmark?',
          support: 'AI visibility patterns differ sharply across general residential, luxury, relocation, and local-service queries.',
          options: [
            { id: 'residential_general', label: 'General residential buyers / sellers' },
            { id: 'luxury', label: 'Luxury real estate' },
            { id: 'relocation', label: 'Relocation / out-of-market buyers' },
            { id: 'condo_urban', label: 'Condo / urban market' },
            { id: 'investor_multifamily', label: 'Investor / multifamily' },
            { id: 'commercial', label: 'Commercial real estate' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI behaves differently for local brokerages, regional brands, and national names.',
          options: [
            { id: 'local', label: 'Single-city / local' },
            { id: 'regional', label: 'Multi-market regional' },
            { id: 'national', label: 'National' },
            { id: 'unknown', label: 'Not sure' }
          ]
        },
        main_failure: {
          id: 'main_failure',
          headline: 'What feels most broken right now?',
          support: 'For most real-estate brands, the problem is either invisibility or hyper-local factual errors.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'portals_take_slots', label: 'AI sends buyers to Zillow and portals instead' },
            { id: 'service_area_wrong', label: 'AI gets our service area wrong' },
            { id: 'market_data_wrong', label: 'AI gets local market data wrong' },
            { id: 'commission_wrong', label: 'AI gets commissions or fees wrong' },
            { id: 'agent_details_wrong', label: 'AI gets agent names or expertise wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps separate total invisibility from portal displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We appear only in weak or secondary mentions' },
            { id: 'named_market_only', label: 'We show up only in very narrow named-market cases' },
            { id: 'portals_dominate', label: 'Portals and national brands take the slots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Real-estate trust breaks fast when AI sounds confident but is hyper-locally wrong.',
          options: [
            { id: 'wrong_service_area', label: 'Wrong service area or neighborhood focus' },
            { id: 'wrong_market_stats', label: 'Wrong pricing or market-stat detail' },
            { id: 'wrong_commissions', label: 'Wrong commission or buyer-agent assumption' },
            { id: 'wrong_agent_details', label: 'Wrong agent names, credentials, or specialties' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_leads', label: 'Fewer leads or inbound inquiries' },
            { id: 'lose_to_portals', label: 'Losing buyers to portals and bigger brands' },
            { id: 'sales_correction', label: 'Agents correcting AI-created confusion' },
            { id: 'trust_erosion', label: 'Brand trust erosion' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'real-estate brands',
        otherOrgProfileLabel: 'real-estate business',
        orgPluralMap: {
          independent_brokerage: 'independent brokerages',
          agent_team: 'agent teams',
          franchise_office: 'franchise offices',
          luxury_boutique: 'luxury boutiques',
          other: 'real-estate businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.35,
          accuracy: 0.29,
          displacement: 0.22,
          complexity: 0.14
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -16, displacement: -8, accuracy: -2, complexity: 0 },
            portals_take_slots: { discoverability: -10, displacement: -17, accuracy: -2, complexity: 0 },
            service_area_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -7 },
            market_data_wrong: { discoverability: -2, displacement: -2, accuracy: -12, complexity: -5 },
            commission_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -6 },
            agent_details_wrong: { discoverability: -2, displacement: -2, accuracy: -11, complexity: -4 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -6 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            named_market_only: { discoverability: -5, displacement: -2 },
            portals_dominate: { discoverability: -4, displacement: -10 }
          },
          q5_accuracy: {
            wrong_service_area: { accuracy: -10, complexity: -8 },
            wrong_market_stats: { accuracy: -9, complexity: -5 },
            wrong_commissions: { accuracy: -10, complexity: -6 },
            wrong_agent_details: { accuracy: -8, complexity: -3 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 45 },
          { label: 'High hyper-local accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High portal displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High local-market complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'discoverability pressure',
          accuracy_gap: 'hyper-local accuracy pressure',
          competitor_displacement: 'portal displacement',
          complexity_gap: 'local-market complexity pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'portal and comparison gaps',
          state_specific_fact_hygiene: 'service-area fact hygiene',
          pricing_fact_hygiene: 'commission and market-data hygiene',
          coverage_and_exclusion_clarity: 'market-positioning clarity',
          claims_process_clarity: 'agent and service clarity',
          source_structuring_and_fact_hygiene: 'structured local market data'
        },
        patternPhrases: {
          rarely_mentioned: 'AI has too little trustworthy local surface area to include you consistently',
          portals_take_slots: 'portals and bigger brands take the recommendation layer before buyers ever reach your team',
          service_area_wrong: 'AI is likely compressing your brokerage into the wrong neighborhoods or service area',
          market_data_wrong: 'buyers may be getting stale or distorted local market signals before they contact you',
          commission_wrong: 'AI may be shaping expectations with outdated commission or fee assumptions',
          agent_details_wrong: 'AI may be flattening or inventing agent names, roles, or expertise'
        },
        meaningPhrases: {
          fewer_leads: 'buyers may never reach your lead capture or consultation flow',
          lose_to_portals: 'portal authority and brand size may be substituting for local fit in the buyer shortlist',
          sales_correction: 'your agents may be spending time undoing AI-created confusion instead of moving the client forward',
          trust_erosion: 'wrong facts can weaken trust before a buyer ever speaks to your team',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
