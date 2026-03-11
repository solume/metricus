/**
 * blog.js — Blog page entry point
 *
 * Renders blog post grid and CTA module from the active
 * use-case variant content.
 */

import { UC_CONTENT } from '../content/index.js';
import { state } from './state.js';

var C = UC_CONTENT[state.uc] || UC_CONTENT.brand;

// ── CTA module ──
var ctaTexts = {
  brand:  { title: 'Want your AI visibility score?', desc: 'Find out what ChatGPT, Claude, and 6 other AI platforms say about your brand.', btn: 'Get your report in 24h', sample: 'See sample report &rarr;' },
  coding: { title: 'Want your coding agent visibility score?', desc: 'Find out what Claude Code, Codex, and 4 other AI coding agents recommend about your tools.', btn: 'Get your report in 24h', sample: 'See sample report &rarr;' },
  data:   { title: 'Want your data readiness score?', desc: 'Find out how well your AI agents can access and use your company data.', btn: 'Get your audit in 24h', sample: 'See sample audit &rarr;' },
};

var ct = ctaTexts[state.uc] || ctaTexts.brand;
document.getElementById('blog-cta-title').innerHTML = ct.title;
document.getElementById('blog-cta-desc').innerHTML = ct.desc;
document.getElementById('blog-cta-btn').innerHTML = ct.btn;
document.getElementById('blog-cta-sample').innerHTML = ct.sample;

if (state.uc !== 'brand') {
  document.getElementById('blog-header-cta').href = '../?uc=' + state.uc + '#pricing';
  document.getElementById('blog-cta-btn').href = '../?uc=' + state.uc + '#pricing';
}

// ── Blog posts ──
var posts = C.blog.posts;
document.getElementById('blog-grid').innerHTML = posts.map(function (p) {
  return '<a href="' + (p.href.startsWith('blog/') ? '../' + p.href : p.href) + '" class="blog-card">' +
    '<div class="blog-tag">' + p.tag + '</div>' +
    '<h2>' + p.h2 + '</h2>' +
    '<p>' + p.p + '</p>' +
    '<div style="font-size:0.68rem;color:var(--text-dim);margin-bottom:6px;">Metricus Research</div>' +
    '<span class="read-more">Read article &rarr;</span></a>';
}).join('');
