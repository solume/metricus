/**
 * data.js — AI Agent Readiness variant
 *
 * Exports: data
 *
 * Content for ?uc=data.
 * "Where should your company use AI agents?"
 * Includes extra sections: audience, freeLook, newsletter.
 */

export const data = {
  meta: {
    title: 'Metricus — AI Agent Readiness Report',
    desc: 'Tomorrow: the 5 AI automations your business should build first. We analyze your business from the outside and deliver a prioritized roadmap. No access needed. Report in 24h.',
    ogTitle: 'Metricus — AI Agent Readiness Report',
    ogDesc: 'Where should your company use AI agents? We analyze your business from the outside and deliver a prioritized roadmap in 24 hours.',
  },
  hero: {
    eyebrow: 'Every competitor you have is running AI right now',
    h1: 'The 5 AI automations <em>your business should build first.</em>',
    subtitle: 'Support backlogs. Sales follow-up falling through the cracks. Manual ops eating your week. <strong>You know AI could fix it — you just don\'t know where to start.</strong>',
    cta: 'Get your readiness report',
    note: '3-min setup. No credit card until checkout. Report in 24h.',
  },
  proof: {
    label: 'What you get in 24 hours',
    items: [
      'Readiness score across your key business areas',
      'Top 5 workflows ranked by impact + feasibility',
      'Tool &amp; data inventory — what you already have that agents can use',
      'Quick wins you can ship this week',
    ],
    method: 'External analysis of your website, tools, public data &amp; industry patterns &middot; scored for impact, feasibility &amp; ROI',
    sample: {
      badge: 'Sample Report',
      title: 'Zendesk',
      score: '67%',
      scoreLabel: 'agent readiness',
      rows: [
        { label: 'Support automation', value: 'High opportunity', color: 'var(--accent)' },
        { label: 'Sales workflows', value: 'Medium — gaps found', color: 'var(--warning)' },
        { label: 'Quick wins', value: '4 immediate actions', color: 'var(--primary)' },
      ],
      link: 'View full sample report &rarr;',
      href: 'example-report-readiness/',
    },
  },

  // ── WHO THIS IS FOR ──
  audience: {
    h2: 'Is this for you?',
    forLabel: 'Built for operators',
    forItems: [
      'Ops, Support, and Sales leaders at 20–500 person companies',
      'Teams already using Zendesk, HubSpot, Salesforce, Intercom, or similar',
      'Businesses that have data but no clue what to automate first',
      'Leaders who need a plan, not a 200-page strategy deck',
    ],
    notLabel: 'Not the right fit if',
    notItems: [
      'You want a done-for-you agent build (we point you where — you build)',
      'You need internal-system-access analysis (we work from the outside)',
      'You\'re an engineer building custom agent frameworks',
    ],
  },

  // ── FREE INITIAL LOOK ──
  freeLook: {
    h3: 'Not sure yet? Get a free initial look.',
    sub: 'Tell us your company and we\'ll send you a quick summary of what we found — no charge, no commitment.',
    btn: 'Send me a free preview',
    note: 'We\'ll email you 2–3 key findings within 48 hours. No spam.',
  },

  // ── NEWSLETTER ──
  newsletter: {
    h3: 'AI agents for business — biweekly briefing',
    sub: 'Which workflows are actually worth automating? What tools are working? Real data, no hype.',
    btn: 'Subscribe',
    note: 'Free, every two weeks. Unsubscribe anytime.',
  },

  pain: {
    h2: 'Everyone says "use AI agents." <em>Nobody tells you how.</em>',
    sub: 'Zendesk tickets piling up? HubSpot follow-ups falling through? Manual ops eating your week? You don\'t need another tool — you need a priority list.',
    cards: [
      { h3: 'You don\'t know where to start', p: 'Support? Sales? Ops? Internal? Customer-facing? The possibilities are overwhelming and the stakes are high.' },
      { h3: 'Generic advice wastes your time', p: '"Just add AI to your workflows" — thanks. You need specifics: which workflows, which tools, which data, what order.' },
      { h3: 'Consultants cost $50K and take months', p: 'Enterprise AI strategy engagements start at six figures. You need answers in days, not quarters.' },
      { h3: 'Your competitors are already doing this', p: 'While you evaluate, they ship. Every month you wait is a month they pull ahead with agent-powered efficiency.' },
    ],
  },
  contrast: {
    pain: {
      label: 'Without a roadmap:',
      items: [
        'You pilot random AI tools that don\'t connect to your real workflows',
        'Teams waste weeks on agent setups that don\'t stick',
        'You miss the high-impact opportunities hiding in your existing data',
        'Competitors ship agent-powered features while you evaluate',
      ],
    },
    dream: {
      label: 'With a readiness report:',
      items: [
        'You know exactly which workflows to automate first',
        'You see what data and tools you already have that agents can use',
        'You start with quick wins that show ROI in weeks, not months',
        'You have a prioritized roadmap — not a 200-page strategy deck',
      ],
    },
  },
  midCta: {
    text: '<strong>Stop guessing where to use agents.</strong> Get a concrete, prioritized roadmap based on your actual business — delivered in 24 hours.',
    btn: 'Get your report — from $49',
    sampleText: 'See a sample report first &rarr;',
    sampleHref: 'example-report-readiness/',
  },
  how: {
    h2: 'We analyze your business. You get a roadmap.',
    sub: 'No internal access needed. No dashboard. No subscription. Three minutes of answers and we do the rest.',
    steps: [
      { n: '1', h3: 'Tell us your company &amp; biggest pain points', p: 'Company name, website, what\'s eating your time. Takes about 3 minutes.' },
      { n: '2', h3: 'We analyze everything from the outside', p: 'Your website, public tools, tech stack signals, support channels, industry patterns. We map where agents fit and what data you already have.' },
      { n: '3', h3: 'You get a prioritized agent roadmap', p: 'In your inbox within 24h. Readiness scores, top opportunities ranked by ROI, quick wins, and a step-by-step plan.' },
    ],
  },
  engines: {
    text: 'We assess agent opportunities across every part of your business.',
    items: ['Customer Support', 'Sales & CRM', 'Internal Ops', 'Knowledge Management', 'Data & Analytics', 'Content & Marketing'],
  },
  testimonials: [
    { quote: '"We were paralyzed by choices — which agent, which workflow, which tool. The report gave us a clear top-3 list. We shipped the first one in 2 weeks."', role: 'CEO', co: 'B2B SaaS · Series A' },
    { quote: '"The report found we were sitting on a goldmine of support data. We automated 40% of tier-1 tickets in a month."', role: 'Head of Support', co: 'E-commerce · 200 employees' },
    { quote: '"The quick wins section alone was worth it. Three changes we could make in a week that saved 15 hours/week of manual work."', role: 'COO', co: 'Logistics · Series B' },
    { quote: '"We didn\'t realize our Zendesk data + Notion docs were enough to power a support agent. The report showed us exactly how."', role: 'CTO', co: 'Developer tools · 50 employees' },
  ],
  pricing: {
    h2: 'Less than one hour of a consultant\'s time.',
    sub: 'AI consultants charge $50,000+ and take months. We deliver a prioritized agent roadmap for your business — in 24 hours.',
    introNote: '',
    tiers: [
      {
        name: 'Snapshot', price: '$49', desc: 'Quick read on your agent opportunities', featured: false, btnClass: 'btn-ghost',
        features: [
          { text: '3 business areas analyzed', ok: true },
          { text: 'Agent readiness score', ok: true },
          { text: 'Top 3 agent opportunities', ok: true },
          { text: 'Quick wins identified', ok: true },
          { text: 'Data inventory summary', ok: true },
          { text: 'Tool stack assessment', ok: true },
          { text: 'Full implementation roadmap', ok: false },
          { text: 'ROI estimates per opportunity', ok: false },
        ],
      },
      {
        name: 'Deep Dive', price: '$149', desc: 'Full analysis with roadmap', featured: true, badge: 'Most popular', btnClass: 'btn-checkout',
        features: [
          { text: 'All business areas analyzed', ok: true },
          { text: 'Agent readiness score', ok: true },
          { text: 'Top 10 agent opportunities', ok: true },
          { text: 'Quick wins identified', ok: true },
          { text: 'Full data inventory', ok: true },
          { text: 'Tool stack assessment', ok: true },
          { text: 'Prioritized roadmap', ok: true },
          { text: 'ROI estimates per opportunity', ok: true },
        ],
      },
      {
        name: 'Full Arsenal', price: '$349', desc: 'Enterprise-grade with dept breakdown', featured: false, btnClass: 'btn-primary',
        features: [
          { text: 'All business areas analyzed', ok: true },
          { text: 'Agent readiness score', ok: true },
          { text: 'Unlimited opportunities mapped', ok: true },
          { text: 'Quick wins identified', ok: true },
          { text: 'Full data inventory', ok: true },
          { text: 'Tool stack assessment', ok: true },
          { text: 'Prioritized roadmap', ok: true },
          { text: 'ROI estimates per opportunity', ok: true },
          { text: 'Executive summary PDF', ok: true },
          { text: 'Department-by-department breakdown', ok: true },
        ],
      },
    ],
    after: 'Tell us about your business &rarr; we analyze from the outside &rarr; roadmap in your inbox within 24h.',
    guarantee: '<strong>100% money-back guarantee:</strong> If your report doesn\'t surface at least 3 actionable insights, full refund. No questions asked.',
  },
  final: {
    h2: 'Stop wondering where to use AI agents. Get the answer tomorrow.',
    p: 'Right now, your competitors are deploying agents for the exact workflows you\'re still doing manually. Three minutes of your time, and you\'ll know exactly where to start.',
    cta: 'Get your report',
    note: 'From $49. Full refund if fewer than 3 actionable insights.',
  },
  blog: {
    posts: [
      { href: 'blog/agents-cant-find-your-data/', tag: 'Research', h2: 'We Analyzed 20 Mid-Size Companies for Agent Readiness. Most Were Sitting on Untapped Gold.', p: 'We looked at 20 companies from the outside — their tools, data, workflows. 73% had high-impact agent opportunities they hadn\'t even considered.' },
      { href: 'blog/data-silos-kill-agents/', tag: 'Strategy', h2: 'The Data You Already Have Is Enough to Power AI Agents. Here\'s How.', p: 'Companies think they need new infrastructure for AI agents. In reality, your CRM, docs, and support tickets are often enough. The missing piece is knowing what to connect.' },
      { href: 'blog/agent-hallucinations-cost/', tag: 'Problem', h2: 'Why Most AI Agent Pilots Fail — And How to Pick the Right One', p: 'Companies start with the wrong workflow, the wrong tool, or the wrong data. We analyzed 15 failed agent pilots and found the pattern. Here\'s how to avoid it.' },
    ],
  },
  trust: [
    { num: '24h', label: 'Turnaround' },
    { num: '6', label: 'Business areas' },
    { num: '3 min', label: 'Setup time' },
    { num: '100%', label: 'Money-back' },
  ],
  scarcity: '',
  featuredTestimonial: {
    quote: '"We were paralyzed by choices. The report gave us a clear top-3 list. We shipped the first one in 2 weeks."',
    result: '40%',
    resultLabel: 'of tier-1 tickets automated in one month',
    role: 'Head of Support',
    co: 'E-commerce · 200 employees',
  },
  faq: [
    { q: 'Is this a subscription?', a: 'No. One-time purchase. You get your report in 24 hours, no recurring charges.' },
    { q: 'Do you need access to our internal systems?', a: 'No. We analyze everything from the outside — your website, public tool stack, support channels, industry patterns, and the information you share during onboarding. Zero internal access required.' },
    { q: 'How do you know what agents we should use?', a: 'We combine what we learn about your business (size, industry, tools, pain points) with our data on which agent implementations deliver the highest ROI across similar companies. The result is a roadmap specific to you.' },
    { q: 'We haven\'t started with AI agents yet. Is this for us?', a: 'Especially. This report is designed for companies that want to start right — not waste months on the wrong pilot. We tell you exactly where to begin.' },
    { q: 'What\'s the money-back guarantee?', a: 'If your report doesn\'t surface at least 3 actionable insights, full refund. No questions asked.' },
    { q: 'How is this different from an AI consultant?', a: 'Consultants take months and charge $50K+. We focus on practical, actionable recommendations — which workflows to automate, which data to connect, which tools to use — and deliver in 24 hours for a fraction of the cost.' },
  ],
  sticky: { text: 'From $49 · Report in 24h · Full refund guarantee', btn: 'Get your report' },
  onboarding: {
    h1: 'Set up your AI agent readiness report',
    sub: 'Tell us about your business so we can analyze your agent opportunities. Takes about 3 minutes.',
    step1h2: 'Your company',
    step1desc: 'Takes about 3 minutes. No credit card until the last step.',
    brandLabel: 'Company name',
    brandPlaceholder: 'e.g. Freshworks',
    urlPlaceholder: 'e.g. freshworks.com',
    descLabel: 'What does your company do?',
    descPlaceholder: 'e.g. Customer support software for mid-size companies',
    step2h2: 'Your biggest pain points',
    step2desc: 'What takes the most time, costs the most, or frustrates your team? We\'ll focus the analysis here.',
    compLabel: 'Pain points & goals',
    compPlaceholder: 'e.g. Support ticket volume too high, manual invoice processing, slow sales follow-up',
    step3h2: 'Details &amp; checkout',
    step3desc: 'Any other context that helps us tailor the report. Tools you use, team size, industry.',
    queriesLabel: 'Additional context (optional)',
    emailLabel: 'Email for report delivery',
    submitBtn: 'Get your report',
  },
};
