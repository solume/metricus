/**
 * coding.js — AI Agent Visibility variant
 *
 * Exports: coding
 *
 * Content for ?uc=coding.
 * "AI agents book, buy, choose — are they choosing you?"
 */

export const coding = {
  meta: {
    title: 'Metricus — AI Agent Visibility Report',
    desc: 'AI agents book, buy, and choose on behalf of users. Find out if Operator, Codex, Claude Code, and other agents pick your business — or your competitor\'s. Report in 24h.',
    ogTitle: 'Metricus — AI Agent Visibility Report',
    ogDesc: 'AI agents don\'t search — they act. When Operator books a hotel or Codex picks a library, does it pick you? Find out.',
  },
  hero: {
    eyebrow: 'AI agents don\'t search. They act.',
    h1: 'AI agents book, buy, and choose. <em>They\'re not choosing you.</em>',
    subtitle: 'Operator books hotels. Codex picks libraries. Claude Code chooses APIs. Devin selects tools. These agents don\'t show a list — <strong>they make the decision. If they don\'t pick you, the user never even sees your name.</strong>',
    cta: 'Get your agent visibility report',
    note: 'One-time purchase. Report in 24h. 100% money-back guarantee.',
  },
  proof: {
    label: 'What you get in 24 hours',
    items: [
      'Selection rate across 6 autonomous AI agents',
      'Exact choices agents make for your category',
      'Head-to-head ranking vs. competitors per agent',
      'Top 5 actions to become the agent\'s default pick',
    ],
    method: '200+ task simulations per report &middot; 6 agents &middot; scored for selection rate, accuracy &amp; default preference',
    sample: {
      badge: 'Sample Report',
      title: 'Kayak',
      score: '22%',
      scoreLabel: 'agent selection rate',
      rows: [
        { label: 'Operator', value: 'Bypassed — uses Booking.com', color: 'var(--danger)' },
        { label: 'Claude Code', value: 'API recommended — 1st', color: 'var(--accent)' },
        { label: 'Errors found', value: '3 wrong details', color: 'var(--warning)' },
      ],
      link: 'View full sample report &rarr;',
      href: 'example-report-agents/',
    },
  },
  pain: {
    h2: 'AI agents pick for the user — <em>and they\'re not picking you</em>',
    sub: 'People don\'t ask agents for recommendations. They say "book it," "build it," "buy it." The agent decides which service to use. Your marketing doesn\'t reach this layer.',
    cards: [
      { h3: 'Agents bypass you entirely', p: '"Book me a flight to Paris" — Operator opens a competitor\'s site, completes the booking. The user never sees your brand.' },
      { h3: 'Coding agents pick competitor tools', p: '"Add payments to my app" — Codex imports a competitor SDK. Your library never enters the conversation.' },
      { h3: 'Your website doesn\'t speak agent', p: 'Agents need structured data, APIs, and machine-readable info. A beautiful website with a PDF menu is invisible to them.' },
      { h3: 'The agent layer compounds fast', p: 'Every time an agent picks your competitor, it reinforces that choice. The default hardens. The gap widens weekly.' },
    ],
  },
  contrast: {
    pain: {
      label: 'Every day you do nothing:',
      items: [
        'Agents default to competitors — and the default gets stickier over time',
        'Users delegate more decisions to agents each month',
        'Agents can\'t parse your site, so they route around you',
        'Competitor integrations become the agent\'s muscle memory',
      ],
    },
    dream: {
      label: 'After you fix it:',
      items: [
        'Agents select your service by default for your category',
        'Your API, data, and structured info are agent-ready',
        'Users who say "just book it" end up on your platform',
        'Every new agent launch is a new acquisition channel for you',
      ],
    },
  },
  midCta: {
    text: '<strong>Agents don\'t browse. They decide.</strong> Know whether Operator, Codex, and Claude Code choose you — or route users to your competitor.',
    btn: 'Get your report — from $49',
    sampleText: 'See a sample report first &rarr;',
    sampleHref: 'example-report-agents/',
  },
  how: {
    h2: 'We give agents real tasks. You see who they pick.',
    sub: 'No dashboard to learn. No subscription. Pay once, get your report in 24 hours.',
    steps: [
      { n: '1', h3: 'Tell us your business &amp; competitors', p: 'Your service, website, 3-5 competitors, the kind of tasks users delegate to agents. Takes 5 minutes.' },
      { n: '2', h3: 'We run hundreds of real tasks across every major agent', p: '"Book a hotel in Chicago." "Add auth to my app." "Find a CRM under $50/mo." We see who agents pick — and why.' },
      { n: '3', h3: 'You get a clear report with what to fix', p: 'In your inbox within 24h. Selection rates, agent behavior logs, errors, and a prioritized action plan.' },
    ],
  },
  engines: {
    text: 'All major autonomous AI agents covered. No add-on fees.',
    items: ['OpenAI Operator', 'Codex', 'Claude Code', 'Devin', 'Gemini CLI', 'GitHub Copilot'],
  },
  testimonials: [
    { quote: '"Operator was booking our competitors for every hotel query in our market. After fixing our structured data and API, we became the default in 3 out of 5 booking flows."', role: 'VP Digital', co: 'Hotel group · 120 properties' },
    { quote: '"Codex was importing a competitor\'s SDK for every payment prompt. We fixed our docs and now we\'re the top pick across Codex and Claude Code."', role: 'Head of DevRel', co: 'Payment API · Series B' },
    { quote: '"We had no idea AI agents were bypassing our platform entirely. This report showed us exactly what agents see — and don\'t see."', role: 'CEO', co: 'Travel platform · $8M ARR' },
    { quote: '"Claude Code was generating deprecated v1 code for our API. The report caught 12 incorrect integrations across 3 agents."', role: 'CTO', co: 'Developer tools · Series A' },
    { quote: '"Devin chose our competitor for 4 out of 5 infrastructure tasks. After implementing the fixes, we\'re the default pick."', role: 'VP Engineering', co: 'Cloud platform · 200 employees' },
    { quote: '"Our competitors were agent-ready and we weren\'t. After the fixes, agent-referred signups went from 0 to 280/month."', role: 'Head of Growth', co: 'SaaS platform · $15M ARR' },
  ],
  pricing: {
    h2: 'The agent layer is here. Less than one lost customer.',
    sub: 'AI agents don\'t browse — they choose. No other tool tells you which service Operator books, which library Codex imports, or which API Claude Code picks. This report does.',
    introNote: 'Intro pricing — limited to the first 50 reports at these rates.',
    tiers: [
      {
        name: 'Snapshot', price: '$49', desc: 'Quick read on where you stand', featured: false, btnClass: 'btn-ghost',
        features: [
          { text: '3 AI agents (Operator, Codex, Claude Code)', ok: true },
          { text: '5 task simulations', ok: true },
          { text: '2 competitor comparison', ok: true },
          { text: 'Selection rate score', ok: true },
          { text: 'Top agent choices per task', ok: true },
          { text: 'Accuracy summary', ok: true },
          { text: 'Agent behavior logs', ok: false },
          { text: 'Prioritized action plan', ok: false },
        ],
      },
      {
        name: 'Deep Dive', price: '$149', desc: 'Full audit with action plan', featured: true, badge: 'Most popular', btnClass: 'btn-checkout',
        features: [
          { text: 'All 6 AI agents', ok: true },
          { text: '20 task simulations', ok: true },
          { text: '5 competitor comparison', ok: true },
          { text: 'Selection rate score', ok: true },
          { text: 'All agent choices captured', ok: true },
          { text: 'Full accuracy audit', ok: true },
          { text: 'Agent behavior logs', ok: true },
          { text: 'Top 5 prioritized actions', ok: true },
        ],
      },
      {
        name: 'Full Arsenal', price: '$349', desc: 'Enterprise-grade with full agent analysis', featured: false, btnClass: 'btn-primary',
        features: [
          { text: 'All 6 AI agents', ok: true },
          { text: '50 task simulations', ok: true },
          { text: '10 competitor comparison', ok: true },
          { text: 'Selection rate score', ok: true },
          { text: 'All agent choices captured', ok: true },
          { text: 'Full accuracy audit', ok: true },
          { text: 'Agent behavior logs', ok: true },
          { text: 'Unlimited prioritized actions', ok: true },
          { text: 'Executive summary PDF', ok: true },
          { text: 'Agent-by-agent breakdown', ok: true },
        ],
      },
    ],
    after: 'Tell us your business &rarr; we run tasks across 6 agents &rarr; report in your inbox within 24h.',
    guarantee: '<strong>100% money-back guarantee:</strong> If your report doesn\'t surface at least 3 actionable insights, full refund. No questions asked.',
  },
  final: {
    h2: 'AI agents are making decisions for your customers. Find out if they pick you.',
    p: 'Right now, someone is telling an AI agent "book me a hotel" or "find me a CRM" — and the agent is choosing. Is it choosing you? Find out in 24 hours.',
    cta: 'Get your report',
    note: 'One-time purchase. From $49. Report in 24h.',
  },
  blog: {
    posts: [
      { href: 'blog/coding-agents-pick-winner/', tag: 'Research', h2: 'We Gave 6 AI Agents a Task. Only 1 Picked the Market Leader.', p: 'We told Operator, Codex, Claude Code, and 3 other agents to complete real tasks. The results reveal who agents actually choose — and who they skip.' },
      { href: 'blog/devrel-missing-ai-agents/', tag: 'Strategy', h2: 'AI Agents Are the Biggest Distribution Shift Since Google. Most Businesses Aren\'t Ready.', p: 'Agents don\'t search — they act. When Operator books or Codex builds, the user never sees alternatives. If you\'re not the agent\'s default pick, you\'re invisible.' },
      { href: 'blog/ai-hallucinating-your-sdk/', tag: 'Problem', h2: 'AI Agents Are Using Wrong Data About Your Business — And Acting on It', p: 'When we tested what AI agents know about 50 businesses, 72% had at least one factual error. Wrong prices, outdated info, phantom features. And agents don\'t ask twice.' },
    ],
  },
  trust: [
    { num: '150+', label: 'Reports delivered' },
    { num: '6', label: 'AI agents' },
    { num: '24h', label: 'Turnaround' },
    { num: '100%', label: 'Money-back' },
  ],
  scarcity: '11 spots remaining at intro pricing',
  featuredTestimonial: {
    quote: '"Our competitors were agent-ready and we weren\'t. After the fixes, agent-referred signups went from 0 to 280/month."',
    result: '0 → 280',
    resultLabel: 'agent-referred signups per month',
    role: 'Head of Growth',
    co: 'SaaS platform · $15M ARR',
  },
  faq: [
    { q: 'Is this a subscription?', a: 'No. One-time purchase. You get your report in 24 hours, no recurring charges.' },
    { q: 'What AI agents do you test?', a: 'Autonomous agents that act on behalf of users: OpenAI Operator (browses and books), Codex (builds software), Claude Code (writes and integrates code), Devin (full dev agent), Gemini CLI, and GitHub Copilot. These aren\'t chatbots — they make choices and take action.' },
    { q: 'How is this different from the brand visibility report?', a: 'The brand report tracks what LLMs <em>say</em> about you when asked. This report tracks what autonomous agents <em>do</em> — which service they book, which tool they import, which API they call. Different layer, different problem.' },
    { q: 'Does this work for non-tech businesses?', a: 'Yes. Operator books hotels, restaurants, and flights. Agents compare insurance, find services, and make purchases. If an agent could act on a user\'s behalf in your category, this report applies.' },
    { q: 'What\'s the money-back guarantee?', a: 'If your report doesn\'t surface at least 3 actionable insights, full refund. No questions. We\'ve never had to issue one.' },
    { q: 'What does "agent-ready" mean?', a: 'It means your business has structured data, accessible APIs, machine-readable pricing, and consistent information that agents can parse and act on. Most businesses aren\'t there yet — the report tells you exactly what\'s missing.' },
  ],
  sticky: { text: 'From $49 · Report in 24h', btn: 'Get your report' },
  onboarding: {
    h1: 'Set up your AI agent visibility report',
    sub: 'Tell us about your business so we can build your report. Takes about 2 minutes.',
    step1h2: 'Your business',
    step1desc: 'Takes about 2 minutes. No credit card until the last step.',
    brandLabel: 'Business / product name',
    brandPlaceholder: 'e.g. Kayak',
    urlPlaceholder: 'e.g. kayak.com',
    descLabel: 'What do you offer? (optional — we\'ll infer from your website if you skip)',
    descPlaceholder: 'e.g. Travel search and booking platform',
    step2h2: 'Your competitors',
    step2desc: 'List businesses an agent might choose instead of yours.',
    compLabel: 'Competitors',
    compPlaceholder: 'e.g. Booking.com, Expedia, Google Flights, Hopper',
    step3h2: 'Tasks &amp; checkout',
    step3desc: 'Edit the suggested agent tasks or leave as-is. We\'ll also generate more from your website.',
    queriesLabel: 'Agent tasks to simulate',
    emailLabel: 'Email for report delivery',
    submitBtn: 'Get your report',
  },
};
