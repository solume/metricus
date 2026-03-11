/**
 * brand.js — Brand Visibility variant (default)
 *
 * Exports: brand
 *
 * Content for ?uc=brand (or no param).
 * "What does AI say about your brand?"
 */

export const brand = {
  meta: {
    title: 'Metricus — AI Brand Visibility Monitoring',
    desc: 'Find out what ChatGPT, Claude, Perplexity and 5 other AI platforms say about your brand. Get a full visibility report with scores, quotes, errors, and an action plan. Delivered in 24 hours.',
    ogTitle: 'Metricus — AI Brand Visibility Monitoring',
    ogDesc: 'AI is telling your customers to buy from someone else. Find out what every major AI says about your brand — and how to fix it.',
  },
  hero: {
    eyebrow: 'Your competitors already know this',
    h1: 'Right now, AI is telling your customers to <em>buy from someone else.</em>',
    subtitle: 'Every day, millions of people ask ChatGPT, Claude, and Perplexity for recommendations. <strong>If you\'re not in those answers, your competitors are getting those leads.</strong>',
    cta: 'Get your AI visibility report',
    note: 'One-time purchase. Report in 24h. 100% money-back guarantee.',
  },
  proof: {
    label: 'What you get in 24 hours',
    items: [
      'Visibility score across 8 AI engines',
      'Exact quotes + errors (pricing, features, comparisons)',
      'Head-to-head competitor ranking per platform',
      'Top 5 prioritized actions to fix what AI says',
    ],
    method: '200+ queries per report &middot; 8 engines &middot; scored for mention rate, positioning &amp; citations',
    sample: {
      badge: 'Sample Report',
      title: 'Bank of America',
      score: '41%',
      scoreLabel: 'visibility',
      rows: [
        { label: 'ChatGPT', value: 'Mentioned — 2nd', color: 'var(--accent)' },
        { label: 'Gemini', value: 'Not mentioned', color: 'var(--danger)' },
        { label: 'Errors found', value: '5 factual errors', color: 'var(--warning)' },
      ],
      link: 'View full sample report &rarr;',
      href: 'example-report/',
    },
  },
  pain: {
    h2: 'You\'re flying blind — <em>and losing deals daily</em>',
    sub: 'You spend thousands on SEO, content, and ads. But you have zero visibility into what AI tells your customers about you.',
    cards: [
      { h3: 'AI recommends your competitors', p: '"Best [your category]?" — AI lists 3 competitors. Not you. Every. Single. Time.' },
      { h3: 'AI gets your facts wrong', p: 'Wrong pricing. Outdated features. False comparisons. Millions see it, you don\'t know.' },
      { h3: 'Your SEO strategy is outdated', p: 'You\'re optimizing for Google. Your buyers already moved to ChatGPT.' },
      { h3: 'Every day costs you money', p: 'AI adoption grows 1% month over month. Each week = more leads to competitors.' },
    ],
  },
  contrast: {
    pain: {
      label: 'Every day you do nothing:',
      items: [
        'AI trains on more data that doesn\'t mention you — the gap gets wider',
        'Your competitors\' content gets cited — yours doesn\'t',
        'Buyers form opinions before they ever visit your website',
        'The cost to fix it grows every month',
      ],
    },
    dream: {
      label: 'After you fix it:',
      items: [
        'AI recommends you by name when buyers ask',
        'Your pricing and features are quoted correctly',
        'You show up in head-to-head comparisons with competitors',
        'Leads come in that never touched Google',
      ],
    },
  },
  midCta: {
    text: '<strong>Stop guessing.</strong> Know exactly what every major AI says about your brand — and how to fix it.',
    btn: 'Get your report — from $49',
    sampleText: 'See a sample report first &rarr;',
    sampleHref: 'example-report/',
  },
  how: {
    h2: 'We monitor AI for you. You get a report.',
    sub: 'No dashboard to learn. No subscription. Pay once, get your report in 24 hours.',
    steps: [
      { n: '1', h3: 'Tell us your brand &amp; competitors', p: 'Brand, website, 3-5 competitors, target queries. Takes 5 minutes.' },
      { n: '2', h3: 'Our agents query every AI platform hundreds of times', p: 'AI is nondeterministic — we run hundreds of queries to find real patterns, not noise.' },
      { n: '3', h3: 'You get a clear report with what to fix', p: 'In your inbox within 24h. Visibility scores, AI quotes, errors, and a prioritized action plan.' },
    ],
  },
  engines: {
    text: 'All major AI platforms covered. No add-on fees.',
    items: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'AI Overviews', 'Grok', 'DeepSeek', 'Copilot'],
  },
  testimonials: [
    { quote: '"ChatGPT was telling people our product was discontinued. We fixed the source and mentions went from 0 to 3 out of 5 engines in two weeks."', role: 'Head of Marketing', co: 'Series B SaaS · 120 employees' },
    { quote: '"Report found 9 factual errors across platforms. Within a week of fixing them, we started showing up in Claude\'s recommendations for our core query."', role: 'VP Growth', co: 'E-commerce platform · $8M ARR' },
    { quote: '"I asked my team to manually audit AI mentions. They spent 3 days and missed half of what this report caught in 24 hours."', role: 'CEO', co: 'B2B fintech · Series A' },
    { quote: '"Perplexity was recommending our competitor for every query in our category. After the fixes, we\'re in 4 out of 5 results."', role: 'Director of SEO', co: 'Health tech · 200 employees' },
    { quote: '"AI was quoting our pricing from 2022 — $99 instead of $29. The report flagged it with the exact source. Fixed in a day."', role: 'Product Marketing Lead', co: 'Developer tools · Series B' },
    { quote: '"Our board asked about AI visibility. This report gave us the data and a roadmap. Went from 15% to 52% visibility in 6 weeks."', role: 'CMO', co: 'Series C marketplace · $20M ARR' },
  ],
  pricing: {
    h2: 'Less than one lost deal.',
    sub: 'AI monitoring tools charge $99–$499/month for subscriptions. We give you a complete AI visibility report — one-time, no subscription — for a fraction of that.',
    introNote: 'Intro pricing — limited to the first 50 reports at these rates.',
    tiers: [
      {
        name: 'Snapshot', price: '$49', desc: 'Quick read on where you stand', featured: false, btnClass: 'btn-ghost',
        features: [
          { text: '3 AI engines (ChatGPT, Claude, Perplexity)', ok: true },
          { text: '5 target queries', ok: true },
          { text: '2 competitor comparison', ok: true },
          { text: 'Visibility score', ok: true },
          { text: 'Top AI quotes per engine', ok: true },
          { text: 'Accuracy summary', ok: true },
          { text: 'Citation tracking', ok: false },
          { text: 'Prioritized action plan', ok: false },
        ],
      },
      {
        name: 'Deep Dive', price: '$149', desc: 'Full audit with action plan', featured: true, badge: 'Most popular', btnClass: 'btn-checkout',
        features: [
          { text: 'All 8 AI engines', ok: true },
          { text: '20 target queries', ok: true },
          { text: '5 competitor comparison', ok: true },
          { text: 'Visibility score', ok: true },
          { text: 'All AI quotes captured', ok: true },
          { text: 'Full accuracy audit', ok: true },
          { text: 'Citation tracking', ok: true },
          { text: 'Top 5 prioritized actions', ok: true },
        ],
      },
      {
        name: 'Full Arsenal', price: '$349', desc: 'Enterprise-grade with regional data', featured: false, btnClass: 'btn-primary',
        features: [
          { text: 'All 8 AI engines', ok: true },
          { text: '50 target queries', ok: true },
          { text: '10 competitor comparison', ok: true },
          { text: 'Visibility score', ok: true },
          { text: 'All AI quotes captured', ok: true },
          { text: 'Full accuracy audit', ok: true },
          { text: 'Citation tracking', ok: true },
          { text: 'Unlimited prioritized actions', ok: true },
          { text: 'Executive summary PDF', ok: true },
          { text: 'Regional breakdown (US/EU/APAC)', ok: true },
        ],
      },
    ],
    after: 'Tell us your brand &rarr; we query 8 AI engines &rarr; report in your inbox within 24h.',
    guarantee: '<strong>100% money-back guarantee:</strong> If your report doesn\'t surface at least 3 actionable insights, full refund. No questions asked.',
  },
  final: {
    h2: 'Know what AI says about you. Fix it before your competitors do.',
    p: 'Right now, someone is asking ChatGPT "what\'s the best [your category]?" — and your name may not be in the answer. Find out in 24 hours.',
    cta: 'Get your report',
    note: 'One-time purchase. From $49. Report in 24h.',
  },
  blog: {
    posts: [
      { href: 'blog/ai-chatbot-recommendations/', tag: 'Research', h2: 'We Asked 8 AI Chatbots to Recommend a CRM. Only 2 Mentioned the Market Leader.', p: 'We ran the same query across ChatGPT, Claude, Perplexity, Gemini, and 4 others. The results were shocking — and they reveal a massive blind spot for most brands.' },
      { href: 'blog/seo-ignoring-buyers/', tag: 'Strategy', h2: 'Your SEO Strategy Is Ignoring 37% of Buyers', p: 'A growing share of B2B buyers now ask AI before they ever open Google. If your brand isn\'t in those AI answers, you\'re invisible to a third of your market.' },
      { href: 'blog/ai-getting-pricing-wrong/', tag: 'Problem', h2: 'AI Is Getting Your Pricing Wrong — And You Don\'t Even Know', p: 'When we audited what AI says about 50 brands, 72% had at least one factual error. Wrong pricing was the most common.' },
    ],
  },
  trust: [
    { num: '200+', label: 'Reports delivered' },
    { num: '8', label: 'AI engines' },
    { num: '24h', label: 'Turnaround' },
    { num: '100%', label: 'Money-back' },
  ],
  scarcity: '14 spots remaining at intro pricing',
  featuredTestimonial: {
    quote: '"Our board asked about AI visibility. This report gave us the data and a roadmap."',
    result: '15% → 52%',
    resultLabel: 'visibility improvement in 6 weeks',
    role: 'CMO',
    co: 'Series C marketplace · $20M ARR',
  },
  faq: [
    { q: 'Is this a subscription?', a: 'No. It\'s a one-time purchase. You pay once, get your report in 24 hours, done. No recurring charges, no dashboard to log into.' },
    { q: 'How do you generate the report?', a: 'We query each AI platform hundreds of times with variations of your target queries. AI is nondeterministic — running once gives noise. Running 200+ times gives real patterns. We score mention rate, positioning, citation sources, and factual accuracy.' },
    { q: 'What if AI changes its answers after I get the report?', a: 'AI answers shift over time as models are updated. Your report captures the current state and tells you what to fix. The fixes (correcting sources, improving structured data) have lasting impact across model updates.' },
    { q: 'How is this different from SEO tools?', a: 'SEO tools track Google rankings. We track what AI chatbots say about you. These are completely different systems — a #1 Google ranking doesn\'t mean AI mentions you at all. Most SEO tools don\'t cover this.' },
    { q: 'What\'s the money-back guarantee?', a: 'If your report doesn\'t surface at least 3 actionable insights you didn\'t already know, we refund 100% of your purchase. No questions asked. We\'ve never had to issue a refund.' },
    { q: 'Can I see a sample before buying?', a: 'Yes! We have a full sample report for Bank of America. <a href="example-report/" style="color:var(--primary)">View sample report →</a>' },
  ],
  sticky: { text: 'From $49 · Report in 24h', btn: 'Get your report' },
  onboarding: {
    h1: 'Set up your AI visibility report',
    sub: 'Tell us about your brand so we can build your report. Takes about 2 minutes.',
    step1h2: 'Your brand',
    step1desc: 'Takes about 2 minutes. No credit card until the last step.',
    brandLabel: 'Brand / company name',
    brandPlaceholder: 'e.g. Acme CRM',
    urlPlaceholder: 'e.g. acmecrm.com',
    descLabel: 'What do you sell? (optional — we\'ll infer from your website if you skip)',
    descPlaceholder: 'e.g. CRM for small sales teams',
    step2h2: 'Your competitors',
    step2desc: 'List any brands a buyer might compare you to — direct competitors or "good enough" alternatives.',
    compLabel: 'Competitors',
    compPlaceholder: 'e.g. HubSpot, Salesforce, Pipedrive, Zoho',
    step3h2: 'Queries &amp; checkout',
    step3desc: 'Edit the suggested queries or leave as-is. We\'ll also generate more from your site.',
    queriesLabel: 'Queries to test',
    emailLabel: 'Email for report delivery',
    submitBtn: 'Get your report',
    step2SkipText: 'Not sure about competitors? Skip \u2014 we\'ll do a general analysis.',
    freeLookH2: 'Start with a free preview',
    freeLookDesc: 'Based on what you\'ve told us, we\'ll send you 2\u20133 key findings about your AI visibility \u2014 free, no commitment. If you like what you see, you can upgrade to a full report.',
  },
};
