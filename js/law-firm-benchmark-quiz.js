(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'law-firm',
    selector: '[data-benchmark-quiz="law-firm"]',
    sourceDefault: 'law-firm-ai-visibility',
    storageKey: 'metricusLawFirmBenchmarkAnonSeed',
    dataUrl: '/js/law-firm-benchmark-cohorts.json',
    config: {
      metaLabel: 'Legal research',
      analyticsPrefix: 'LAW_FIRM_QUIZ',
      intro: {
        title: 'Law Firm AI Visibility Benchmark',
        lead: 'When buyers ask AI about lawyers, does your firm get surfaced, skipped, or pushed aside by directories?',
        sub: 'Compare your likely AI visibility against similar firms, practice areas, and market footprints.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['solo', 'small_firm', 'mid_size'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.',
        ctaLabel: 'Try it'
      },
      questionStatus: {
        empty: 'Live benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'law-firm-benchmark'
      },
      result: {
        leadLabel: 'Your benchmark result',
        titlePrefix: 'You landed in the ',
        titleSuffix: '.',
        percentileLabel: 'You scored higher than',
        averageLabel: 'Average for your peer group',
        primaryCta: 'See what AI actually says about my firm',
        secondaryCta: 'See a sample report',
        sampleReportUrl: '/sample-ai-visibility-report/',
        emailTitle: 'Send me this benchmark result',
        emailCta: 'Send me this result',
        emailNote: 'This sends your benchmark summary only. The full Metricus report is a separate audit.',
        emailThanks: 'Benchmark summary request received.',
        notePlaceholder: 'What is one legal question AI gets wrong most often about your firm or practice area? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact prompts where you disappear, the directories or national brands replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your firm type and peer group before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your law-firm benchmark result…',
          text: 'Matching your answers to similar firms and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'directories_take_slots']
      },
      normalization: {
        org_type: { other: 'small_firm' },
        segment: { other: 'corporate_commercial' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your firm?',
          support: 'This changes which law firms you should actually be compared against.',
          options: [
            { id: 'solo', label: 'Solo practitioner' },
            { id: 'small_firm', label: 'Small firm (2-10 attorneys)' },
            { id: 'mid_size', label: 'Mid-size firm (11-50 attorneys)' },
            { id: 'national', label: 'National firm' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which practice area matters most for this benchmark?',
          support: 'AI visibility patterns differ sharply by practice area and buyer intent.',
          options: [
            { id: 'personal_injury', label: 'Personal injury' },
            { id: 'family', label: 'Family law' },
            { id: 'criminal_defense', label: 'Criminal defense' },
            { id: 'immigration', label: 'Immigration' },
            { id: 'employment', label: 'Employment / labor' },
            { id: 'corporate_commercial', label: 'Corporate / commercial' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI behaves very differently for local, regional, and national legal brands.',
          options: [
            { id: 'local', label: 'Single-city / local' },
            { id: 'regional', label: 'Multi-city / regional' },
            { id: 'national', label: 'National' },
            { id: 'unknown', label: 'Not sure' }
          ]
        },
        main_failure: {
          id: 'main_failure',
          headline: 'What feels most broken right now?',
          support: 'For most law firms, the problem is either invisibility or bad legal details.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'directories_take_slots', label: 'AI sends people to directories instead' },
            { id: 'practice_area_wrong', label: 'AI gets our practice area wrong' },
            { id: 'jurisdiction_wrong', label: 'AI gets jurisdiction or state law wrong' },
            { id: 'credentials_wrong', label: 'AI gets attorney credentials or firm name wrong' },
            { id: 'fees_timeline_wrong', label: 'AI gets fees or timelines wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps separate total invisibility from directory displacement.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'directory_results', label: 'We appear only in directory results' },
            { id: 'weak_mentions', label: 'We appear only in weak or secondary mentions' },
            { id: 'nationals_take_slots', label: 'Big directories and national firms take the slots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Legal trust breaks fast when AI sounds certain but misses the facts.',
          options: [
            { id: 'practice_area_merge', label: 'AI merges our practice area with the wrong one' },
            { id: 'wrong_jurisdiction', label: 'AI gets the wrong state or jurisdiction' },
            { id: 'fee_assumptions', label: 'AI invents fee ranges or contingency assumptions' },
            { id: 'wrong_credentials', label: 'AI gets attorney credentials or years of experience wrong' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_consults', label: 'Fewer consultations or retained matters' },
            { id: 'more_directory_dependence', label: 'More directory dependence' },
            { id: 'intake_corrections', label: 'Intake team correcting AI-created confusion' },
            { id: 'wrong_expectations', label: 'Wrong expectations before the consult' },
            { id: 'trust_erosion', label: 'Brand trust erosion' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'law firms',
        otherOrgProfileLabel: 'law firm',
        orgPluralMap: {
          solo: 'solo practitioners',
          small_firm: 'small firms',
          mid_size: 'mid-size firms',
          national: 'national firms',
          other: 'law firms'
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
          displacement: 0.22,
          complexity: 0.14
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -16, displacement: -8, accuracy: -2, complexity: 0 },
            directories_take_slots: { discoverability: -10, displacement: -16, accuracy: -2, complexity: 0 },
            practice_area_wrong: { discoverability: -3, displacement: -4, accuracy: -14, complexity: -4 },
            jurisdiction_wrong: { discoverability: -2, displacement: -2, accuracy: -13, complexity: -8 },
            credentials_wrong: { discoverability: -2, displacement: -2, accuracy: -11, complexity: -4 },
            fees_timeline_wrong: { discoverability: -2, displacement: -1, accuracy: -10, complexity: -5 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -6 },
            directory_results: { discoverability: -8, displacement: -10 },
            weak_mentions: { discoverability: -6, displacement: -3 },
            nationals_take_slots: { discoverability: -4, displacement: -10 }
          },
          q5_accuracy: {
            practice_area_merge: { accuracy: -10, complexity: -4 },
            wrong_jurisdiction: { accuracy: -9, complexity: -8 },
            fee_assumptions: { accuracy: -8, complexity: -3 },
            wrong_credentials: { accuracy: -7, complexity: -2 }
          }
        },
        flags: [
          { label: 'High discoverability risk', dimension: 'discoverability', max: 45 },
          { label: 'High legal accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High directory displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High jurisdictional complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'directory displacement pressure',
          accuracy_gap: 'legal accuracy pressure',
          competitor_displacement: 'directory displacement',
          complexity_gap: 'jurisdictional complexity pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'directory and comparison gaps',
          state_specific_fact_hygiene: 'jurisdiction-specific fact hygiene',
          pricing_fact_hygiene: 'fees and intake clarity',
          coverage_and_exclusion_clarity: 'practice-area clarity',
          claims_process_clarity: 'attorney credential clarity',
          source_structuring_and_fact_hygiene: 'structured legal source hygiene'
        },
        patternPhrases: {
          rarely_mentioned: 'AI has too little source surface area to name your firm consistently',
          directories_take_slots: 'directories and national firms take the recommendation layer before buyers reach you',
          practice_area_wrong: 'AI is probably merging your practice with adjacent legal categories',
          jurisdiction_wrong: 'AI is likely mixing state law and venue-specific guidance',
          credentials_wrong: 'AI may be flattening attorney credentials and years of experience',
          fees_timeline_wrong: 'AI may be distorting fee and timeline expectations before intake'
        },
        meaningPhrases: {
          fewer_consults: 'potential clients may never reach your intake team',
          more_directory_dependence: 'directories and lead aggregators may be substituting for your own brand',
          intake_corrections: 'your team may be starting conversations by correcting AI instead of moving the case forward',
          wrong_expectations: 'buyers may arrive with false assumptions about your services or timeline',
          trust_erosion: 'wrong facts can undermine credibility before the first contact'
        }
      }
    }
  });
})();
