/**
 * forms.js — Form handlers via event delegation
 *
 * Exports: initForms
 *
 * Replaces all inline onsubmit/onclick handlers with a single
 * delegated listener on document. Each form is identified by
 * a data-action attribute or CSS class.
 */

import { $ } from '../modules/utils.js';
import { track } from '../modules/analytics.js';
import { STRIPE } from '../modules/config.js';

// ── Hero URL form ──
function handleHeroSubmit(form) {
  var input = form.querySelector('#heroUrl');
  var website = input.value.trim();
  track(website, 'hero-url');
  // Store website for pricing buttons to pick up
  try { sessionStorage.setItem('metricus_website', website); } catch (e) {}
  // Scroll to pricing so user picks a tier
  var pricing = document.getElementById('pricing');
  if (pricing) {
    pricing.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Free look form ──
function handleFreeLookSubmit(form) {
  var company = $('flCompany').value.trim();
  var website = $('flWebsite').value.trim();
  var email = $('flEmail').value.trim();
  if (!company || !email) return;

  var details = 'FREE_LOOK // Company: ' + company + ' // Website: ' + website;
  track(email, details);

  var inner = form.closest('.free-look-inner');
  if (inner) {
    inner.innerHTML = '<div style="padding:20px 0;text-align:center;">' +
      '<div style="font-size:1.5rem;margin-bottom:8px;">&#10003;</div>' +
      '<h3 style="font-size:1rem;font-weight:700;color:var(--text-bright);margin-bottom:6px;">We\'re on it.</h3>' +
      '<p style="font-size:0.82rem;color:var(--text-dim);">We\'ll send a quick summary of what we found for <strong style="color:var(--text-bright);">' + company + '</strong> to <strong style="color:var(--text-bright);">' + email + '</strong> within 48 hours.</p>' +
      '</div>';
  }
}

// ── Newsletter form ──
function handleNewsletterSubmit(form) {
  var input = form.querySelector('input[type="email"]');
  var email = input.value.trim();
  if (!email) return;

  track(email, 'newsletter-signup');
  form.innerHTML = '<div style="font-size:0.85rem;color:var(--accent);font-weight:600;padding:10px 0;">&#10003; You\'re in. First issue arrives within two weeks.</div>';
}

// ── Buy tier (pricing button click) ──
function handleBuyTier(tier) {
  var website = '';
  try { website = sessionStorage.getItem('metricus_website') || ''; } catch (e) {}
  track(website, 'funnel:tier-click:' + tier);
  var url = 'onboarding/?tier=' + tier;
  if (website) url += '&website=' + encodeURIComponent(website);
  window.location.href = url;
}

// ── Init: attach delegated listeners ──
export function initForms() {
  // Form submissions — delegated on document
  document.addEventListener('submit', function (e) {
    var form = e.target;

    // Hero forms (top and final CTA)
    if (form.classList.contains('hero-form')) {
      e.preventDefault();
      handleHeroSubmit(form);
      return;
    }

    // Free look form (inside .free-look-inner)
    if (form.closest('.free-look-inner')) {
      e.preventDefault();
      handleFreeLookSubmit(form);
      return;
    }

    // Newsletter form
    if (form.getAttribute('data-action') === 'newsletter') {
      e.preventDefault();
      handleNewsletterSubmit(form);
      return;
    }
  });

  // Click delegation for pricing buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="buy-tier"]');
    if (btn) {
      handleBuyTier(btn.getAttribute('data-tier'));
    }
  });
}
