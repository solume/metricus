/**
 * onboarding.js — Adaptive onboarding flow
 *
 * 3-step flow with profile signals (role, size, urgency trigger)
 * that adapt step 3: tier pre-selection, copy, and free-look
 * redirect for "just exploring" users.
 */

import { SCRIPT_URL, STRIPE, TIER_INFO } from './config.js';
import { UC_CONTENT } from '../content/index.js';
import { state } from './state.js';
import { track } from './analytics.js';
import { $, h } from './utils.js';

// ── Resolve onboarding content ──
var C = UC_CONTENT[state.uc] || UC_CONTENT.brand;
var OB = C.onboarding;
var selectedTier = state.tier;
var prefillEmail = state.email;

// ── Profile state ──
var profile = {
  role: '',
  size: '',
  trigger: '',
};

// ── Apply use-case labels ──
h($('ob-h1'), OB.h1);
h($('ob-sub'), OB.sub);
h($('ob-step1-h2'), OB.step1h2);
h($('ob-step1-desc'), OB.step1desc);
h($('ob-brand-label'), OB.brandLabel);
$('brandName').placeholder = OB.brandPlaceholder;
$('brandUrl').placeholder = OB.urlPlaceholder;
h($('ob-desc-label'), OB.descLabel);
$('brandDesc').placeholder = OB.descPlaceholder;
h($('ob-step2-h2'), OB.step2h2);
h($('ob-step2-desc'), OB.step2desc);
h($('ob-comp-label'), OB.compLabel);
$('compAll').placeholder = OB.compPlaceholder;
h($('ob-step3-h2'), OB.step3h2);
h($('ob-step3-desc'), OB.step3desc);
h($('ob-queries-label'), OB.queriesLabel);
h($('ob-email-label'), OB.emailLabel);

// ── Set tier info ──
function applyTier(tier) {
  selectedTier = tier;
  var info = TIER_INFO[tier] || TIER_INFO.deepdive;
  $('tierName').textContent = info.name;
  $('tierPrice').textContent = info.price;
  $('btnPrice').textContent = info.price;
  $('summaryTier').textContent = info.name;
  $('summaryPrice').textContent = info.price;
}
applyTier(selectedTier);

if (prefillEmail) $('obEmail').value = prefillEmail;

// ── Funnel log ──
track(prefillEmail, 'funnel:onboard-start:' + selectedTier);

// ── Profile-based adaptation ──
function adaptStep3() {
  profile.role = ($('obRole') && $('obRole').value) || '';
  profile.size = ($('obSize') && $('obSize').value) || '';

  var isExploring = profile.trigger === 'exploring';
  var isConsultant = profile.role === 'consultant';
  var isSmall = profile.size === 'solo' || profile.size === '2-10';
  var isMid = profile.size === '11-50' || profile.size === '51-200';
  var isLarge = profile.size === '200+';
  var isBoard = profile.trigger === 'board';
  var isCompetitor = profile.trigger === 'competitor';
  var isProject = profile.trigger === 'project';

  // Adaptive note above the order summary
  var note = '';
  if (isConsultant) {
    note = 'Running this for clients? Reply to your delivery email for volume pricing.';
  } else if (isBoard) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dateStr = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    note = 'Includes executive summary for your board. Report delivered by ' + dateStr + '.';
  } else if (isCompetitor) {
    var tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    var ds = tmrw.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    note = 'Includes competitive positioning analysis. Report delivered by ' + ds + '.';
  } else if (isProject) {
    note = 'Includes prioritized roadmap for your implementation.';
  } else if (isSmall) {
    note = 'Focused on quick wins and tools that work at your scale.';
  }

  var noteEl = $('adaptiveNote');
  if (noteEl) {
    if (note) {
      noteEl.textContent = note;
      noteEl.style.display = '';
    } else {
      noteEl.style.display = 'none';
    }
  }

  // Adapt order summary text
  var summaryExtra = '';
  if (isConsultant) {
    summaryExtra = ' · Use in client deliverables';
  } else if (isBoard) {
    summaryExtra = ' · Board-ready executive summary';
  }

  var summaryEl = $('orderSummary');
  if (summaryEl) {
    summaryEl.innerHTML = '<span id="summaryTier">' + (TIER_INFO[selectedTier] || TIER_INFO.deepdive).name + '</span> &mdash; <span id="summaryPrice">' + (TIER_INFO[selectedTier] || TIER_INFO.deepdive).price + '</span> &middot; PDF in 24h &middot; Full refund if fewer than 3 actionable insights' + summaryExtra;
  }

}

// ── Step navigation ──
function goStep(n) {
  if (n === 2) {
    var name = $('brandName').value.trim();
    if (!name) { $('brandName').focus(); return; }
  }

  // When entering step 3, check if "exploring" → redirect to free look
  if (n === 3) {
    if (profile.trigger === 'exploring') {
      // Show free look step instead
      showStep('3b');
      return;
    }

    // Adapt step 3 based on profile
    adaptStep3();

    // Auto-generate queries if empty
    var q = $('queries');
    if (!q.value.trim()) {
      var brand = $('brandName').value.trim() || '[Your brand]';
      var comps = $('compAll').value.trim();
      var comp1 = comps ? comps.split(/[,\n]/)[0].trim() : '[Competitor]';
      var desc = $('brandDesc').value.trim();
      var category = desc || 'your category';
      q.value = [
        'best ' + category,
        brand + ' vs ' + comp1,
        brand + ' pricing',
        brand + ' alternatives',
        'is ' + brand + ' good for ' + category,
        brand + ' review',
        comp1 + ' vs alternatives',
        'best ' + category + ' for small teams'
      ].join('\n');
    }
  }

  var email = ($('obEmail') && $('obEmail').value.trim()) || prefillEmail || '';
  track(email, 'funnel:onboard-step' + n + ':' + selectedTier + ':' + profileTag());

  showStep(n);
}

function showStep(n) {
  var stepId = 'obStep' + n;
  document.querySelectorAll('.ob-step').forEach(function (s) { s.classList.remove('active'); });
  var target = $(stepId);
  if (target) target.classList.add('active');

  // Progress bars: step 3b counts as step 3
  var barN = (n === '3b') ? 3 : n;
  for (var i = 1; i <= 3; i++) $('bar' + i).classList.toggle('done', i <= barN);
  window.scrollTo(0, 0);
}

// ── Profile tag for analytics ──
function profileTag() {
  return [profile.role, profile.size, profile.trigger].filter(Boolean).join('/');
}

// ── Checkout ──
function submitAndCheckout() {
  var email = $('obEmail').value.trim();
  if (!email) { $('obEmail').focus(); return; }
  var brand = $('brandName').value.trim();
  var url = $('brandUrl').value.trim();
  var desc = $('brandDesc').value.trim();
  var comps = $('compAll').value.trim().replace(/\n/g, ', ');
  var queries = $('queries').value.trim();
  var details = [
    selectedTier.toUpperCase(), 'UC:' + state.uc,
    'Profile: ' + profileTag(),
    'Brand: ' + brand, url ? 'URL: ' + url : '', desc ? 'Desc: ' + desc : '',
    comps ? 'Competitors: ' + comps : '',
    queries ? 'Queries: ' + queries.replace(/\n/g, ' | ') : ''
  ].filter(Boolean).join(' // ');

  var btn = $('submitBtn');
  btn.textContent = 'Redirecting to checkout...';
  btn.disabled = true;

  var p = new URLSearchParams({ contact: email, pricing: details });
  fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(function () {});
  if (typeof gtag_report_conversion === 'function') gtag_report_conversion();

  var stripeUrl = STRIPE[selectedTier] || STRIPE.deepdive;
  setTimeout(function () {
    window.location.href = stripeUrl + '?prefilled_email=' + encodeURIComponent(email);
  }, 400);
}

// ── Free look submit ──
function submitFreeLook() {
  var email = ($('obEmailFree') && $('obEmailFree').value.trim()) || '';
  if (!email) { $('obEmailFree').focus(); return; }

  var brand = $('brandName').value.trim();
  var url = $('brandUrl').value.trim();
  var comps = $('compAll').value.trim();
  var details = [
    'FREE_LOOK', 'UC:' + state.uc,
    'Profile: ' + profileTag(),
    'Company: ' + brand, url ? 'URL: ' + url : '',
    comps ? 'PainPoints: ' + comps.replace(/\n/g, ', ') : ''
  ].filter(Boolean).join(' // ');

  track(email, details);

  // Show success state
  var step = $('obStep3b');
  if (step) {
    step.innerHTML = '<div class="free-look-success">' +
      '<div class="check">&#10003;</div>' +
      '<h2 style="font-size:1rem;font-weight:700;color:var(--text-bright);margin-bottom:6px;">We\'re on it.</h2>' +
      '<p style="font-size:0.82rem;color:var(--text-dim);max-width:380px;margin:0 auto 20px;">We\'ll analyze <strong style="color:var(--text-bright);">' + brand + '</strong> and send 2–3 key findings to <strong style="color:var(--text-bright);">' + email + '</strong> within 48 hours.</p>' +
      '<p style="font-size:0.75rem;color:var(--text-dim);">Want the full report right now? <a href="#" data-action="switch-to-paid" style="color:var(--primary);">Get your full report →</a></p>' +
      '</div>';
  }
}

// ── Event delegation ──
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;

  var action = btn.getAttribute('data-action');

  if (action === 'go-step') {
    goStep(parseInt(btn.getAttribute('data-step'), 10));
  } else if (action === 'skip-comps') {
    e.preventDefault();
    goStep(3);
  } else if (action === 'submit-checkout') {
    submitAndCheckout();
  } else if (action === 'select-trigger') {
    // Toggle trigger button selection
    document.querySelectorAll('.trigger-btn').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    profile.trigger = btn.getAttribute('data-trigger');
  } else if (action === 'submit-free-look') {
    submitFreeLook();
  } else if (action === 'switch-to-paid') {
    e.preventDefault();
    profile.trigger = 'project'; // override from exploring
    adaptStep3();
    showStep(3);
  }
});
