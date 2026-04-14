(function() {
  'use strict';

  if (!window.MetricusBenchmarkQuizEngine) return;

  window.MetricusBenchmarkQuizEngine.boot({
    key: 'retail',
    selector: '[data-benchmark-quiz="retail"]',
    sourceDefault: 'retail-ai-visibility',
    storageKey: 'metricusRetailBenchmarkAnonSeed',
    dataUrl: '/js/retail-benchmark-cohorts.json',
    config: {
      metaLabel: 'Retail research',
      analyticsPrefix: 'RETAIL_QUIZ',
      intro: {
        title: 'Retail AI Visibility Benchmark',
        lead: 'When shoppers ask AI what to buy, does your brand get surfaced, skipped, or replaced by bigger retailers?',
        sub: 'Compare your likely AI visibility against similar DTC brands, marketplace sellers, and physical retailers.',
        timeText: 'Takes 60 seconds.',
        previewQuestionId: 'org_type',
        previewOptionIds: ['dtc', 'marketplace_seller', 'physical_retailer'],
        previewHint: 'Starts in this module and reveals your benchmark here after 6 answers.'
      },
      questionStatus: {
        empty: 'Live benchmark path',
        active: 'Building benchmark for {footprint} {segment} {orgPlural}…'
      },
      report: {
        path: '/get-report/',
        source: 'retail-benchmark'
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
        notePlaceholder: 'What is one wrong thing AI gets wrong most often about your brand, products, or stores? (optional)',
        guardLine: 'This benchmark estimates your likely risk pattern. It does not show the exact shopper queries where you disappear, the retailers replacing you, or the source pages driving wrong answers. That is what the Metricus report measures.'
      },
      analysis: {
        segmentAssembly: {
          title: 'Assembling your benchmark…',
          text: 'Matching your retail category and peer group before the next questions.',
          duration: 1300
        },
        resultCalculation: {
          title: 'Preparing your retail benchmark result…',
          text: 'Matching your answers to similar retail brands and calculating your score, tier, and peer comparison.',
          duration: 2200
        }
      },
      branching: {
        discoverabilityAnswers: ['rarely_mentioned', 'bigger_chains', 'marketplaces_first']
      },
      normalization: {
        org_type: { other: 'physical_retailer' },
        segment: { other: 'home_goods' },
        footprint: { unknown: 'regional' }
      },
      questions: {
        org_type: {
          id: 'org_type',
          headline: 'What best describes your business?',
          support: 'This changes which retail brands you should be compared against.',
          options: [
            { id: 'dtc', label: 'DTC brand' },
            { id: 'marketplace_seller', label: 'Marketplace seller' },
            { id: 'physical_retailer', label: 'Physical retailer / chain' },
            { id: 'other', label: 'Other' }
          ]
        },
        segment: {
          id: 'segment',
          headline: 'Which retail category matters most for this benchmark?',
          support: 'AI shopping patterns differ across categories with different review depth, price sensitivity, and product complexity.',
          options: [
            { id: 'apparel', label: 'Apparel' },
            { id: 'electronics', label: 'Electronics' },
            { id: 'beauty', label: 'Beauty' },
            { id: 'home_goods', label: 'Home goods' },
            { id: 'other', label: 'Other' }
          ]
        },
        footprint: {
          id: 'footprint',
          headline: 'How broad is the market you compete in?',
          support: 'AI visibility behaves very differently for local stores, regional chains, and national retail brands.',
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
          support: 'For most retail brands, the problem is either being absent from the answer or being replaced by a bigger seller.',
          options: [
            { id: 'rarely_mentioned', label: 'AI rarely mentions us' },
            { id: 'bigger_chains', label: 'AI points shoppers to bigger chains instead' },
            { id: 'marketplaces_first', label: 'AI points shoppers to marketplaces instead' },
            { id: 'pricing_wrong', label: 'AI gets pricing or promo details wrong' },
            { id: 'product_details_wrong', label: 'AI gets product specs wrong' },
            { id: 'stock_wrong', label: 'AI gets stock or availability wrong' },
            { id: 'store_info_wrong', label: 'AI gets store location or hours wrong' }
          ]
        },
        q5_discoverability: {
          id: 'q5_discoverability',
          headline: 'When you check AI, what usually happens?',
          support: 'This helps distinguish invisibility from being pushed behind larger retail brands.',
          options: [
            { id: 'not_present', label: 'We do not appear at all' },
            { id: 'weak_mentions', label: 'We appear only in weak or secondary mentions' },
            { id: 'bigger_chains_take_slots', label: 'Big chains take the recommendation slots' },
            { id: 'marketplaces_take_slots', label: 'Marketplaces take the recommendation slots' }
          ]
        },
        q5_accuracy: {
          id: 'q5_accuracy',
          headline: 'Which wrong answer is most damaging?',
          support: 'Retail trust breaks quickly when AI sounds confident but is factually wrong.',
          options: [
            { id: 'wrong_price_promo', label: 'Wrong price or promo' },
            { id: 'wrong_specs', label: 'Wrong specs or materials' },
            { id: 'wrong_stock', label: 'Wrong stock or availability' },
            { id: 'wrong_store_info', label: 'Wrong store location or hours' }
          ]
        },
        business_impact: {
          id: 'business_impact',
          headline: 'If this keeps happening, what hurts most?',
          support: 'This helps interpret the risk pattern, not just the score.',
          options: [
            { id: 'fewer_orders', label: 'Fewer orders or foot traffic' },
            { id: 'lose_to_larger_chains', label: 'Losing buyers to larger chains' },
            { id: 'lose_to_marketplaces', label: 'Losing buyers to marketplaces' },
            { id: 'more_returns', label: 'More returns or abandoned carts' },
            { id: 'trust_erosion', label: 'Brand trust erosion' },
            { id: 'dont_know_where_to_start', label: 'We do not know where to start' }
          ]
        }
      },
      resultEngine: {
        industryPlural: 'retail brands',
        otherOrgProfileLabel: 'retail business',
        profileLabelMap: {
          dtc: 'DTC brand',
          marketplace_seller: 'marketplace seller',
          physical_retailer: 'physical retailer',
          other: 'retail business'
        },
        orgPluralMap: {
          dtc: 'DTC brands',
          marketplace_seller: 'marketplace sellers',
          physical_retailer: 'physical retailers',
          other: 'retail businesses'
        },
        footprintShortMap: {
          local: 'local',
          regional: 'regional',
          national: 'national',
          unknown: 'regional'
        },
        weights: {
          discoverability: 0.38,
          accuracy: 0.28,
          displacement: 0.20,
          complexity: 0.14
        },
        adjustments: {
          main_failure: {
            rarely_mentioned: { discoverability: -15, displacement: -8, accuracy: -1, complexity: 0 },
            bigger_chains: { discoverability: -10, displacement: -14, accuracy: -1, complexity: 0 },
            marketplaces_first: { discoverability: -8, displacement: -15, accuracy: -1, complexity: 0 },
            pricing_wrong: { discoverability: -2, displacement: -2, accuracy: -14, complexity: -3 },
            product_details_wrong: { discoverability: -2, displacement: -2, accuracy: -12, complexity: -5 },
            stock_wrong: { discoverability: -2, displacement: -2, accuracy: -11, complexity: -7 },
            store_info_wrong: { discoverability: -4, displacement: -5, accuracy: -8, complexity: -8 }
          },
          q5_discoverability: {
            not_present: { discoverability: -12, displacement: -5 },
            weak_mentions: { discoverability: -8, displacement: -4 },
            bigger_chains_take_slots: { discoverability: -5, displacement: -10 },
            marketplaces_take_slots: { discoverability: -4, displacement: -9 }
          },
          q5_accuracy: {
            wrong_price_promo: { accuracy: -10, complexity: -3 },
            wrong_specs: { accuracy: -8, complexity: -5 },
            wrong_stock: { accuracy: -9, complexity: -7 },
            wrong_store_info: { accuracy: -7, complexity: -8 }
          }
        },
        flags: [
          { label: 'High product discoverability risk', dimension: 'discoverability', max: 45 },
          { label: 'High factual accuracy risk', dimension: 'accuracy', max: 48 },
          { label: 'High marketplace displacement risk', dimension: 'displacement', max: 46 },
          { label: 'High retail complexity risk', dimension: 'complexity', max: 44 }
        ],
        bands: [
          { max: 39.9, label: 'Lower visibility tier' },
          { max: 64.9, label: 'Mixed visibility tier' },
          { max: 100, label: 'Stronger visibility tier' }
        ],
        riskLabels: {
          discoverability_gap: 'product discovery pressure',
          accuracy_gap: 'factual accuracy pressure',
          competitor_displacement: 'marketplace displacement',
          local_visibility_gap: 'local store visibility pressure',
          product_accuracy_gap: 'product accuracy pressure',
          price_accuracy_gap: 'pricing pressure',
          stock_accuracy_gap: 'availability pressure',
          review_gap: 'review surface pressure'
        },
        fixLabels: {
          citation_surface_gap: 'citation surface gaps',
          comparison_and_competitor_positioning: 'comparison-positioning gaps',
          product_schema_and_feed_hygiene: 'product schema and feed hygiene',
          pricing_and_availability_hygiene: 'pricing and availability hygiene',
          local_store_schema: 'local store schema',
          product_detail_clarity: 'product detail clarity',
          review_surface_gap: 'review surface gaps'
        },
        patternPhrases: {
          rarely_mentioned: 'the AI answer layer does not have enough trustworthy product detail to surface you consistently',
          bigger_chains: 'larger chains are taking the recommendation layer before shoppers reach your store',
          marketplaces_first: 'marketplace platforms are substituting for your own brand in the shopper\'s shortlist',
          pricing_wrong: 'buyers may be seeing stale or invented price signals before they reach checkout',
          product_details_wrong: 'AI is likely compressing or distorting product attributes that matter to purchase intent',
          stock_wrong: 'buyers may be getting inventory signals that no longer match reality',
          store_info_wrong: 'location and hours data are too thin or outdated for AI to route shoppers correctly'
        },
        meaningPhrases: {
          fewer_orders: 'buyers may choose the retailer AI knows best instead of the one that best fits their needs',
          lose_to_larger_chains: 'brand scale and citation footprint may be substituting for actual product fit in the shortlist',
          lose_to_marketplaces: 'the marketplace may be capturing intent that should have reached your store or site',
          more_returns: 'wrong facts can turn interest into returns or abandoned carts before the sale is complete',
          trust_erosion: 'AI-created confusion can quietly damage confidence before a buyer reaches your owned channels',
          dont_know_where_to_start: 'the first useful next step is a real audit that shows what AI says, where it learned it, and what to fix first'
        }
      }
    }
  });
})();
