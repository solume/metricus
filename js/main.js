// ── Config ──
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlMZxJmAmm90HGKg6AJxEeB8xOP83Dyq4rUHnCD8aubV1NzPqb1ZlSbjzmBAnO63r2/exec';

const STRIPE = {
    snapshot:  'https://buy.stripe.com/4gMeVe6IOfSjauBgma7g400',
    deepdive:  'https://buy.stripe.com/9B614ogjobC346dd9Y7g401',
    arsenal:   'https://buy.stripe.com/8x2cN63wC5dF7ipd9Y7g402'
};

// ── Detect use case from URL ──
const params = new URLSearchParams(window.location.search);
const UC = params.get('uc') || 'brand';
const C = (typeof UC_CONTENT !== 'undefined' && UC_CONTENT[UC]) ? UC_CONTENT[UC] : (typeof UC_CONTENT !== 'undefined' ? UC_CONTENT.brand : null);

// ── Helpers ──
function $(id) { return document.getElementById(id); }
function h(el, html) { if (el) el.innerHTML = html; }
function t(el, text) { if (el) el.textContent = text; }

function ucParam() {
    return UC !== 'brand' ? 'uc=' + UC + '&' : '';
}

function send(email, data) {
    const p = new URLSearchParams({ contact: email, pricing: data || 'unknown', uc: UC });
    fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(() => {});
}

function buyTier(tier) {
    send('', 'funnel:tier-click:' + tier);
    window.location.href = 'onboarding/?' + ucParam() + 'tier=' + tier;
}

function heroSubmit(e) {
    e.preventDefault();
    var input = e.target.querySelector('input[type="email"]');
    var email = input.value;
    send(email, 'hero-email');
    window.location.href = 'onboarding/?' + ucParam() + 'tier=deepdive&email=' + encodeURIComponent(email);
}

// ── FAQ toggle ──
function toggleFaq(el) {
    el.parentElement.classList.toggle('open');
}

// ── Render content ──
function renderPage() {
    if (!C) return;

    // Meta
    document.title = C.meta.title;
    $('uc-meta-desc').setAttribute('content', C.meta.desc);
    $('uc-og-title').setAttribute('content', C.meta.ogTitle);
    $('uc-og-desc').setAttribute('content', C.meta.ogDesc);
    $('uc-tw-title').setAttribute('content', C.meta.ogTitle);
    $('uc-tw-desc').setAttribute('content', C.meta.ogDesc);

    // Hero
    h($('uc-eyebrow'), C.hero.eyebrow);
    h($('uc-hero-h1'), C.hero.h1);
    h($('uc-hero-subtitle'), C.hero.subtitle);
    h($('uc-hero-cta'), C.hero.cta);
    h($('uc-hero-note'), C.hero.note);

    // Trust bar
    if (C.trust && $('uc-trust-bar')) {
        h($('uc-trust-bar'), C.trust.map(function(s) {
            return '<div class="trust-stat"><div class="num">' + s.num + '</div><div class="label">' + s.label + '</div></div>';
        }).join(''));
    }

    // Proof
    h($('uc-proof-label'), C.proof.label);
    h($('uc-proof-list'), C.proof.items.map(function(i) { return '<li>' + i + '</li>'; }).join(''));
    h($('uc-proof-method'), C.proof.method);
    var s = C.proof.sample;
    h($('uc-proof-badge'), s.badge);
    h($('uc-proof-title'), s.title);
    h($('uc-proof-score'), s.score + '<span>' + s.scoreLabel + '</span>');
    h($('uc-proof-detail'), s.rows.map(function(r) {
        return '<div class="proof-row"><span>' + r.label + '</span><span style="color:' + r.color + '">' + r.value + '</span></div>';
    }).join(''));
    h($('uc-proof-link-text'), s.link);
    if ($('uc-proof-link-wrap')) $('uc-proof-link-wrap').href = s.href;

    // Pain
    h($('uc-pain-h2'), C.pain.h2);
    h($('uc-pain-sub'), C.pain.sub);
    h($('uc-pain-grid'), C.pain.cards.map(function(c) {
        return '<div class="pain-card"><h3>' + c.h3 + '</h3><p>' + c.p + '</p></div>';
    }).join(''));

    // Contrast
    h($('uc-contrast-pain-label'), C.contrast.pain.label);
    h($('uc-contrast-pain-list'), C.contrast.pain.items.map(function(i) { return '<li>' + i + '</li>'; }).join(''));
    h($('uc-contrast-dream-label'), C.contrast.dream.label);
    h($('uc-contrast-dream-list'), C.contrast.dream.items.map(function(i) { return '<li>' + i + '</li>'; }).join(''));

    // Mid CTA
    h($('uc-mid-cta-text'), C.midCta.text);
    h($('uc-mid-cta-btn'), C.midCta.btn);
    h($('uc-mid-cta-sample'), C.midCta.sampleText);
    if ($('uc-mid-cta-sample')) $('uc-mid-cta-sample').href = C.midCta.sampleHref;

    // How it works
    h($('uc-how-h2'), C.how.h2);
    h($('uc-how-sub'), C.how.sub);
    h($('uc-steps'), C.how.steps.map(function(s) {
        return '<div class="step"><div class="step-n">' + s.n + '</div><div><h3>' + s.h3 + '</h3><p>' + s.p + '</p></div></div>';
    }).join(''));

    // Engines
    h($('uc-engines-text'), C.engines.text);
    h($('uc-engines-row'), C.engines.items.map(function(e) { return '<span class="eng">' + e + '</span>'; }).join(''));

    // Featured testimonial
    if (C.featuredTestimonial && $('uc-featured-testimonial')) {
        var ft = C.featuredTestimonial;
        h($('uc-featured-testimonial'),
            '<div class="ft-result">' + ft.result + '</div>' +
            '<div class="ft-result-label">' + ft.resultLabel + '</div>' +
            '<div class="ft-quote">' + ft.quote + '</div>' +
            '<div class="ft-author">' + ft.role + ' <span>— ' + ft.co + '</span></div>'
        );
    }

    // Testimonials (duplicate for infinite scroll)
    var cards = C.testimonials.map(function(t) {
        return '<div class="testimonial-card"><p>' + t.quote + '</p><div class="testimonial-author">' + t.role + ' <span>' + t.co + '</span></div></div>';
    }).join('');
    h($('uc-testimonials'), cards + cards);

    // Scarcity
    if (C.scarcity && $('uc-scarcity-text')) {
        h($('uc-scarcity-text'), C.scarcity);
    }

    // Pricing
    h($('uc-pricing-h2'), C.pricing.h2);
    h($('uc-pricing-sub'), C.pricing.sub);
    h($('uc-pricing-intro-note'), C.pricing.introNote);
    h($('uc-pricing-after'), C.pricing.after);
    h($('uc-pricing-guarantee'), C.pricing.guarantee);

    var tierKeys = ['snapshot', 'deepdive', 'arsenal'];
    h($('uc-pricing-grid'), C.pricing.tiers.map(function(tier, i) {
        var cls = 'tier' + (tier.featured ? ' featured' : '');
        var badge = tier.badge ? '<div class="tier-badge">' + tier.badge + '</div>' : '';
        var features = tier.features.map(function(f) {
            return '<li' + (f.ok ? '' : ' class="no"') + '>' + f.text + '</li>';
        }).join('');
        return '<div class="' + cls + '">' + badge +
            '<div class="tier-name">' + tier.name + '</div>' +
            '<div class="tier-price">' + tier.price + '</div>' +
            '<div class="tier-desc">' + tier.desc + '</div>' +
            '<ul class="tier-features">' + features + '</ul>' +
            '<button class="btn ' + tier.btnClass + '" onclick="buyTier(\'' + tierKeys[i] + '\')">' +
            'Get ' + tier.name + ' — ' + tier.price + '</button></div>';
    }).join(''));

    // FAQ (first item auto-open)
    if (C.faq && $('uc-faq')) {
        h($('uc-faq'), C.faq.map(function(f, i) {
            var openClass = i === 0 ? ' open' : '';
            return '<div class="faq-item' + openClass + '"><button class="faq-q" onclick="toggleFaq(this)">' + f.q + '</button><div class="faq-a"><div class="faq-a-inner">' + f.a + '</div></div></div>';
        }).join(''));
    }

    // Blog tease
    if (C.blog && C.blog.posts && $('uc-blog-tease')) {
        h($('uc-blog-tease'), C.blog.posts.map(function(p) {
            return '<a href="' + p.href + '" class="blog-tease-card"><div class="bt-tag">' + p.tag + '</div><h4>' + p.h2 + '</h4><span class="bt-link">Read &rarr;</span></a>';
        }).join(''));
    }

    // Final CTA
    h($('uc-final-h2'), C.final.h2);
    h($('uc-final-p'), C.final.p);
    h($('uc-final-cta'), C.final.cta);
    h($('uc-final-note'), C.final.note);

    // Sticky CTA
    if (C.sticky) {
        h($('uc-sticky-text'), C.sticky.text);
        h($('uc-sticky-btn'), C.sticky.btn);
    }

    // Blog link carries uc param
    if ($('uc-footer-blog') && UC !== 'brand') {
        $('uc-footer-blog').href = 'blog/?uc=' + UC;
    }

    // Header CTA
    if ($('uc-header-cta')) {
        $('uc-header-cta').href = C.proof.sample.href;
    }
}

// ── Sticky CTA visibility ──
function initSticky() {
    var sticky = $('sticky-cta');
    if (!sticky) return;
    var heroWrap = document.querySelector('.hero-wrap');
    if (!heroWrap) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                sticky.classList.remove('visible');
            } else {
                sticky.classList.add('visible');
            }
        });
    }, { threshold: 0 });

    observer.observe(heroWrap);
}

// ── Variant switcher ──
function initVariantTabs() {
    var tabs = document.querySelectorAll('.variant-tab');
    tabs.forEach(function(tab) {
        if (tab.getAttribute('data-uc') === UC) {
            tab.classList.add('active');
        }
    });
}

// ── Init ──
renderPage();
initSticky();
initVariantTabs();
