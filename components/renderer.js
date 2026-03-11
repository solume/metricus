/**
 * renderer.js — Page content renderer
 *
 * Exports: renderPage
 *
 * Reads the resolved content from state and patches every
 * DOM node on the landing page. Each section is a separate
 * function for readability and independent modification.
 */

import { $, h } from '../modules/utils.js';
import { state, ucParam } from '../modules/state.js';
import { FEATURES } from '../modules/config.js';

// ── Section renderers ──

function renderMeta(C) {
  document.title = C.meta.title;
  $('uc-meta-desc').setAttribute('content', C.meta.desc);
  $('uc-og-title').setAttribute('content', C.meta.ogTitle);
  $('uc-og-desc').setAttribute('content', C.meta.ogDesc);
  $('uc-tw-title').setAttribute('content', C.meta.ogTitle);
  $('uc-tw-desc').setAttribute('content', C.meta.ogDesc);
}

function renderHero(C) {
  h($('uc-eyebrow'), C.hero.eyebrow);
  h($('uc-hero-h1'), C.hero.h1);
  h($('uc-hero-subtitle'), C.hero.subtitle);
  h($('uc-hero-cta'), C.hero.cta);
  h($('uc-hero-note'), C.hero.note);
}

function renderTrust(C) {
  if (C.trust && $('uc-trust-bar')) {
    h($('uc-trust-bar'), C.trust.map(function (s) {
      return '<div class="trust-stat"><div class="num">' + s.num + '</div><div class="label">' + s.label + '</div></div>';
    }).join(''));
  }
}

function renderProof(C) {
  h($('uc-proof-label'), C.proof.label);
  h($('uc-proof-list'), C.proof.items.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
  h($('uc-proof-method'), C.proof.method);
  var s = C.proof.sample;
  h($('uc-proof-badge'), s.badge);
  h($('uc-proof-title'), s.title);
  h($('uc-proof-score'), s.score + '<span>' + s.scoreLabel + '</span>');
  h($('uc-proof-detail'), s.rows.map(function (r) {
    return '<div class="proof-row"><span>' + r.label + '</span><span style="color:' + r.color + ';font-weight:600;">' + r.value + '</span></div>';
  }).join(''));
  h($('uc-proof-link-text'), s.link);
  if ($('uc-proof-link-wrap')) $('uc-proof-link-wrap').href = s.href;
}

function renderAudience(C) {
  if (!FEATURES.audience || !C.audience || !$('audience-section')) return;
  $('audience-section').style.display = 'block';
  h($('uc-audience-h2'), C.audience.h2);
  h($('uc-audience-for-label'), C.audience.forLabel);
  h($('uc-audience-for-list'), C.audience.forItems.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
  h($('uc-audience-not-label'), C.audience.notLabel);
  h($('uc-audience-not-list'), C.audience.notItems.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
}

function renderFreeLook(C) {
  if (!FEATURES.freeLook || !C.freeLook || !$('freelook-section')) return;
  $('freelook-section').style.display = 'block';
  h($('uc-fl-h3'), C.freeLook.h3);
  h($('uc-fl-sub'), C.freeLook.sub);
  h($('uc-fl-btn'), C.freeLook.btn);
  h($('uc-fl-note'), C.freeLook.note);
}

function renderNewsletter(C) {
  if (!FEATURES.newsletter || !C.newsletter || !$('newsletter-section')) return;
  $('newsletter-section').style.display = 'block';
  h($('uc-newsletter'),
    '<h3>' + C.newsletter.h3 + '</h3>' +
    '<p class="nl-sub">' + C.newsletter.sub + '</p>' +
    '<form class="newsletter-form" data-action="newsletter">' +
    '<input type="email" placeholder="you@company.com" required>' +
    '<button type="submit" class="btn btn-primary">' + C.newsletter.btn + '</button>' +
    '</form>' +
    '<p class="nl-note">' + C.newsletter.note + '</p>'
  );
}

function renderPain(C) {
  h($('uc-pain-h2'), C.pain.h2);
  h($('uc-pain-sub'), C.pain.sub);
  h($('uc-pain-grid'), C.pain.cards.map(function (c) {
    return '<div class="pain-card"><h3>' + c.h3 + '</h3><p>' + c.p + '</p></div>';
  }).join(''));
}

function renderContrast(C) {
  h($('uc-contrast-pain-label'), C.contrast.pain.label);
  h($('uc-contrast-pain-list'), C.contrast.pain.items.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
  h($('uc-contrast-dream-label'), C.contrast.dream.label);
  h($('uc-contrast-dream-list'), C.contrast.dream.items.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
}

function renderMidCta(C) {
  h($('uc-mid-cta-text'), C.midCta.text);
  h($('uc-mid-cta-btn'), C.midCta.btn);
  h($('uc-mid-cta-sample'), C.midCta.sampleText);
  if ($('uc-mid-cta-sample')) $('uc-mid-cta-sample').href = C.midCta.sampleHref;
}

function renderHow(C) {
  h($('uc-how-h2'), C.how.h2);
  h($('uc-how-sub'), C.how.sub);
  h($('uc-steps'), C.how.steps.map(function (s) {
    return '<div class="step"><div class="step-n">' + s.n + '</div><div><h3>' + s.h3 + '</h3><p>' + s.p + '</p></div></div>';
  }).join(''));
}

function renderEngines(C) {
  h($('uc-engines-text'), C.engines.text);
  h($('uc-engines-row'), C.engines.items.map(function (e) { return '<span class="eng">' + e + '</span>'; }).join(''));
}

function renderFeaturedTestimonial(C) {
  if (!FEATURES.featuredTestimonial || !C.featuredTestimonial || !$('uc-featured-testimonial')) return;
  var ft = C.featuredTestimonial;
  h($('uc-featured-testimonial'),
    '<div class="ft-result">' + ft.result + '</div>' +
    '<div class="ft-result-label">' + ft.resultLabel + '</div>' +
    '<div class="ft-quote">' + ft.quote + '</div>' +
    '<div class="ft-author">' + ft.role + ' <span>— ' + ft.co + '</span></div>'
  );
}

function renderTestimonials(C) {
  var cards = C.testimonials.map(function (t) {
    return '<div class="testimonial-card"><p>' + t.quote + '</p><div class="testimonial-author">' + t.role + ' <span>' + t.co + '</span></div></div>';
  }).join('');
  h($('uc-testimonials'), cards + cards); // duplicate for infinite scroll
}

function renderScarcity(C) {
  if (!FEATURES.scarcity || !C.scarcity) {
    if ($('uc-scarcity')) $('uc-scarcity').style.display = 'none';
    return;
  }
  h($('uc-scarcity-text'), C.scarcity);
  if ($('uc-scarcity')) $('uc-scarcity').style.display = '';
}

function renderPricing(C) {
  h($('uc-pricing-h2'), C.pricing.h2);
  h($('uc-pricing-sub'), C.pricing.sub);
  h($('uc-pricing-intro-note'), C.pricing.introNote);
  h($('uc-pricing-after'), C.pricing.after);
  h($('uc-pricing-guarantee'), C.pricing.guarantee);

  if (!C.pricing.introNote && $('uc-pricing-intro-note')) {
    $('uc-pricing-intro-note').style.display = 'none';
  }

  var tierKeys = ['snapshot', 'deepdive', 'arsenal'];
  h($('uc-pricing-grid'), C.pricing.tiers.map(function (tier, i) {
    var cls = 'tier' + (tier.featured ? ' featured' : '');
    var badge = tier.badge ? '<div class="tier-badge">' + tier.badge + '</div>' : '';
    var features = tier.features.map(function (f) {
      return '<li' + (f.ok ? '' : ' class="no"') + '>' + f.text + '</li>';
    }).join('');
    return '<div class="' + cls + '">' + badge +
      '<div class="tier-name">' + tier.name + '</div>' +
      '<div class="tier-price">' + tier.price + '</div>' +
      '<div class="tier-desc">' + tier.desc + '</div>' +
      '<ul class="tier-features">' + features + '</ul>' +
      '<button class="btn ' + tier.btnClass + '" data-action="buy-tier" data-tier="' + tierKeys[i] + '">' +
      'Get ' + tier.name + ' — ' + tier.price + '</button></div>';
  }).join(''));
}

function renderBlog(C) {
  if (!FEATURES.blogTease || !C.blog || !C.blog.posts || !$('uc-blog-tease')) return;
  h($('uc-blog-tease'), C.blog.posts.map(function (p) {
    return '<a href="' + p.href + '" class="blog-tease-card"><div class="bt-tag">' + p.tag + '</div><h4>' + p.h2 + '</h4><span class="bt-link">Read &rarr;</span></a>';
  }).join(''));
}

function renderFinal(C) {
  h($('uc-final-h2'), C.final.h2);
  h($('uc-final-p'), C.final.p);
  h($('uc-final-cta'), C.final.cta);
  h($('uc-final-note'), C.final.note);
}

function renderSticky(C) {
  if (!FEATURES.stickyCta || !C.sticky) return;
  h($('uc-sticky-text'), C.sticky.text);
  h($('uc-sticky-btn'), C.sticky.btn);
}

function renderLinks(C) {
  // Blog link carries uc param
  if ($('uc-footer-blog') && state.uc !== 'brand') {
    $('uc-footer-blog').href = 'blog/?uc=' + state.uc;
  }
  // Header CTA
  if ($('uc-header-cta')) {
    $('uc-header-cta').href = C.proof.sample.href;
  }
}

// ── Main export ──

export function renderPage() {
  var C = state.content;
  if (!C) return;

  renderMeta(C);
  renderHero(C);
  renderTrust(C);
  renderProof(C);
  renderAudience(C);
  renderFreeLook(C);
  renderNewsletter(C);
  renderPain(C);
  renderContrast(C);
  renderMidCta(C);
  renderHow(C);
  renderEngines(C);
  renderFeaturedTestimonial(C);
  renderTestimonials(C);
  renderScarcity(C);
  renderPricing(C);
  renderBlog(C);
  renderFinal(C);
  renderSticky(C);
  renderLinks(C);
}
