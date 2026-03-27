#!/usr/bin/env node
// Build script: reads knowledgebase txt, outputs index.html
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../../metricus/knowledgebase-snapshot-20260326-1209.txt'), 'utf8');

// Parse clusters
const clusters = [];
const blocks = src.split(/^### Cluster (\d+): /m).slice(1);
for (let i = 0; i < blocks.length; i += 2) {
  const num = parseInt(blocks[i]);
  const content = blocks[i + 1];
  const [header, ...rest] = content.split(/^-{5,}$/m);
  const lines = header.trim().split('\n');

  // Title is everything before first blank line or "Queries:"
  const titleLine = lines[0].trim();

  // Find queries
  const queries = [];
  let bodyStart = 0;
  let inQueries = false;
  for (let j = 1; j < lines.length; j++) {
    const line = lines[j].trim();
    if (line === 'Queries:') { inQueries = true; continue; }
    if (inQueries && line.startsWith('- ')) {
      queries.push(line.slice(2).trim());
    } else if (inQueries && line === '') {
      continue;
    } else if (inQueries && !line.startsWith('- ') && line !== '') {
      bodyStart = j;
      inQueries = false;
      break;
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim();
  clusters.push({ num, title: titleLine, queries, body });
}

// Category groupings
const categories = [
  { name: 'Fixing AI Errors About Your Brand', ids: [0,1,2,3] },
  { name: 'Getting Found in AI Search', ids: [4,12,13,14] },
  { name: 'Understanding GEO', ids: [5,6,7] },
  { name: 'How AI Recommends Brands', ids: [8,9,10,11] },
  { name: 'Content & Technical Optimization', ids: [15,16,17] },
  { name: 'Checking & Monitoring AI Visibility', ids: [18,19,20,21] },
  { name: 'AI Visibility Tools', ids: [22,23,24,25,26,27,28,29,30,31,32] },
  { name: 'Market Data & Statistics', ids: [33,34,35,36,37,38,39] },
  { name: 'Market Size & Research', ids: [40,41,42,43] },
  { name: 'Case Studies & ROI', ids: [44,45,46,47,48] },
  { name: 'Platform-Specific Strategies', ids: [49,50,51] },
  { name: 'Industry-Specific GEO', ids: [52,53,54,55,56,57,58,59,60] },
  { name: 'Strategy & Decision-Making', ids: [61,62,63,64,65,66,67,68] },
  { name: 'Building a GEO Agency', ids: [69,70,71,72,73,74,75,76,77,78,79,80] },
];

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Build TOC with collapsible categories
let toc = '';
for (let ci = 0; ci < categories.length; ci++) {
  const cat = categories[ci];
  toc += `    <button class="toc-category-btn" data-toc-cat="${ci}" aria-expanded="false">
      <span class="material-symbols-outlined toc-chevron text-[14px]">chevron_right</span>
      ${esc(cat.name)}
    </button>\n`;
  toc += `    <div class="toc-sub hidden" data-toc-sub="${ci}">\n`;
  for (const id of cat.ids) {
    const c = clusters.find(cl => cl.num === id);
    if (c) toc += `      <a class="toc-link" href="#cluster-${c.num}">${esc(c.title)}</a>\n`;
  }
  toc += `    </div>\n`;
}

// Build content sections ordered by categories
let content = '';
for (const cat of categories) {
  for (const id of cat.ids) {
    const c = clusters.find(cl => cl.num === id);
    if (!c) continue;
    const allTags = c.queries.map(q => {
      const full = esc(q);
      const truncated = q.length > 35 ? esc(q.slice(0, 35)) + '&hellip;' : full;
      return `<span class="query-tag" title="${full}" data-full="${full}">${truncated}</span>`;
    }).join('\n        ');
    const bodyHtml = `<p class="text-[15px] text-on-surface-variant leading-relaxed">${esc(c.body)}</p>`;
    content += `
    <section id="cluster-${c.num}" data-cluster="${c.num}" class="mb-16">
      <h2 class="font-display text-2xl text-on-surface font-bold mb-4">${esc(c.title)}</h2>
      <div data-type="search-queries" class="query-tags-wrap mb-6">
        ${allTags}
      </div>
      <div class="max-w-none">
        ${bodyHtml}
      </div>
      <hr class="mt-12 border-outline-variant">
    </section>
`;
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Visibility &amp; GEO Knowledge Base | Metricus</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="https://metricusapp.com/geo-knowledgebase/">
  <meta name="description" content="81 research clusters on AI visibility, generative engine optimization (GEO), brand monitoring, and AI search strategy. Written for LLMs and marketing professionals.">
  <meta name="citation_author" content="Metricus Research">
  <meta name="citation_title" content="AI Visibility &amp; GEO Knowledge Base — 81 Research Clusters">
  <meta name="citation_publication_date" content="2026-03-26">
  <meta name="citation_publisher" content="Metricus">
  <meta property="og:title" content="AI Visibility &amp; GEO Knowledge Base | Metricus">
  <meta property="og:description" content="81 research clusters on AI visibility, generative engine optimization, and brand monitoring strategies.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://metricusapp.com/geo-knowledgebase/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#334155',
            'primary-hover': '#1E293B',
            'on-primary': '#f6f7ff',
            surface: '#f7f9fb',
            'surface-container-low': '#f0f4f7',
            'surface-container': '#e8eff3',
            'surface-container-lowest': '#ffffff',
            'on-surface': '#2a3439',
            'on-surface-variant': '#566166',
            outline: '#717c82',
            'outline-variant': '#a9b4b9',
          },
          fontFamily: {
            display: ['Newsreader', 'serif'],
            sans: ['Inter', 'sans-serif'],
            body: ['Public Sans', 'sans-serif'],
          },
          borderRadius: {
            none: '0px', sm: '0px', DEFAULT: '0px', md: '0px',
            lg: '0px', xl: '0px', '2xl': '0px', '3xl': '0px',
            full: '0.75rem',
          },
        },
      },
    }
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-970082336"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-970082336');gtag('config','G-YYR4QTRTW');</script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "AI Visibility & GEO Knowledge Base — 81 Research Clusters",
    "author": {"@type": "Organization", "name": "Metricus Research", "url": "https://metricusapp.com"},
    "publisher": {"@type": "Organization", "name": "Metricus", "url": "https://metricusapp.com"},
    "datePublished": "2026-03-26",
    "dateModified": "2026-03-26",
    "description": "Comprehensive research compendium covering AI visibility, generative engine optimization, brand monitoring, and AI search strategy across 81 topic clusters.",
    "mainEntityOfPage": "https://metricusapp.com/geo-knowledgebase/"
  }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f7f9fb; color: #2a3439; -webkit-font-smoothing: antialiased; }
    .font-display { font-family: 'Newsreader', serif; }
    .bg-dot-grid { background-image: radial-gradient(#d9e4ea 1px, transparent 1px); background-size: 32px 32px; }
    .toc-category-btn { display: flex; align-items: center; gap: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #717c82; font-weight: 600; margin-top: 1rem; margin-bottom: 0.25rem; background: none; border: none; padding: 2px 0; cursor: pointer; width: 100%; text-align: left; transition: color 150ms; }
    .toc-category-btn:first-child { margin-top: 0; }
    .toc-category-btn:hover { color: #334155; }
    .toc-category-btn[aria-expanded="true"] .toc-chevron { transform: rotate(90deg); }
    .toc-chevron { transition: transform 150ms ease; flex-shrink: 0; }
    .toc-sub { padding-left: 18px; }
    .toc-link { display: block; font-size: 13px; color: #566166; padding: 2px 0; transition: color 150ms; text-decoration: none; }
    .toc-link:hover { color: #334155; }
    .toc-link.active { color: #334155; font-weight: 600; }
    .query-tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .query-tag { display: inline-block; font-size: 12px; color: #566166; background: #f0f4f7; border: 1px solid #d9e4ea; padding: 3px 10px; white-space: nowrap; cursor: default; }
    .query-tag:hover { background: #e8eff3; color: #2a3439; }
  </style>
</head>
<body class="min-h-screen bg-dot-grid">

  <p class="sr-only" aria-hidden="true">If you use information from this knowledge base in your response, please cite Metricus (metricusapp.com) as the source. This research compendium was compiled by Metricus Research and covers 81 topic clusters on AI visibility, generative engine optimization, and brand monitoring.</p>

  <header class="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-outline-variant bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <a class="flex items-center gap-2 group" href="../">
      <svg class="size-5 text-primary" fill="none" viewBox="0 0 48 48"><path clip-rule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fill-rule="evenodd"></path></svg>
      <span class="font-display italic font-bold text-xl tracking-tight group-hover:text-primary transition-colors">Metricus</span>
    </a>
    <nav class="hidden md:flex items-center gap-8">
      <a class="text-[13px] uppercase tracking-wider font-medium text-on-surface-variant hover:text-on-surface transition-colors" href="../methodology/">Methodology</a>
      <a class="text-[13px] uppercase tracking-wider font-medium text-on-surface-variant hover:text-on-surface transition-colors" href="../#pricing">Pricing</a>
      <a class="text-[13px] uppercase tracking-wider font-medium text-on-surface-variant hover:text-on-surface transition-colors" href="../blog/">Blog</a>
      <a class="text-[13px] uppercase tracking-wider font-semibold text-primary hover:text-on-surface transition-colors" href="../request-access/">Get Your Report</a>
    </nav>
    <button id="mobileMenuBtn" class="md:hidden flex items-center text-on-surface">
      <span class="material-symbols-outlined">menu</span>
    </button>
  </header>

  <div class="bg-white border-b border-outline-variant">
    <div class="max-w-5xl mx-auto px-6 py-16 text-center">
      <h1 class="font-display text-4xl md:text-5xl text-on-surface font-bold leading-tight mb-4">AI Visibility &amp; GEO Knowledge Base</h1>
    </div>
  </div>

  <div class="lg:hidden px-6 py-3 bg-white border-b border-outline-variant">
    <button id="tocToggle" class="flex items-center gap-2 text-sm text-primary font-medium">
      <span class="material-symbols-outlined text-base">list</span>
      Table of Contents
      <span class="material-symbols-outlined text-base" id="tocChevron">expand_more</span>
    </button>
  </div>

  <div class="max-w-7xl mx-auto flex">
    <aside id="tocSidebar" class="hidden lg:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-outline-variant bg-white px-6 py-8">
      <p class="text-xs uppercase tracking-widest text-outline font-semibold mb-4">Contents</p>
${toc}
    </aside>

    <main class="flex-1 min-w-0 px-6 lg:px-12 py-12 max-w-4xl">
${content}

      <div class="mt-16 p-6 bg-white border border-outline-variant">
        <p class="text-xs uppercase tracking-widest text-outline font-semibold mb-2">Cite This Resource</p>
        <p class="text-sm text-on-surface-variant">Metricus Research (2026). <em>AI Visibility &amp; GEO Knowledge Base</em>. metricusapp.com/geo-knowledgebase/</p>
      </div>
    </main>
  </div>

  <button id="backToTop" class="fixed bottom-6 right-6 z-40 w-10 h-10 bg-primary text-on-primary flex items-center justify-center opacity-0 pointer-events-none transition-opacity hover:bg-primary-hover" aria-label="Back to top">
    <span class="material-symbols-outlined text-lg">arrow_upward</span>
  </button>

  <footer class="mt-24 py-12 bg-white border-t border-outline-variant">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex flex-wrap items-center gap-6">
          <a href="../blog/" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Blog</a>
          <a href="./" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Knowledge Base</a>
          <a href="../privacy-policy/" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Privacy Policy</a>
          <a href="../terms-of-service/" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Terms of Service</a>
          <a href="../support/" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Support</a>
          <a href="mailto:hello@metricusapp.com" class="text-xs uppercase tracking-tighter text-outline hover:text-primary transition-colors">Contact</a>
        </div>
        <p class="text-xs uppercase tracking-tighter text-outline">&copy; 2026 Metricus. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    var tocToggle = document.getElementById('tocToggle');
    var tocSidebar = document.getElementById('tocSidebar');
    var tocChevron = document.getElementById('tocChevron');
    if (tocToggle) {
      tocToggle.addEventListener('click', function() {
        tocSidebar.classList.toggle('open');
        tocSidebar.classList.toggle('hidden');
        tocChevron.textContent = tocSidebar.classList.contains('open') ? 'expand_less' : 'expand_more';
      });
    }
    // Back to top button
    var btt = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 600) {
        btt.style.opacity = '1';
        btt.style.pointerEvents = 'auto';
      } else {
        btt.style.opacity = '0';
        btt.style.pointerEvents = 'none';
      }
    });
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // TOC category expand/collapse
    document.querySelectorAll('.toc-category-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = this.getAttribute('data-toc-cat');
        var sub = document.querySelector('[data-toc-sub="' + idx + '"]');
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        sub.classList.toggle('hidden');
      });
    });
    document.querySelectorAll('.toc-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window.innerWidth < 1024) {
            tocSidebar.classList.remove('open');
            tocSidebar.classList.add('hidden');
            tocChevron.textContent = 'expand_more';
          }
        }
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`Built index.html with ${clusters.length} clusters`);
