import { SCRIPT_URL, STRIPE, TIER_INFO } from './config.js';
import { state } from './state.js';
import { track, trackConversion } from './analytics.js';
import { $ } from './utils.js';

// Pre-fill from URL params
const selectedTier = state.tier;
const prefillEmail = state.email;
const prefillWebsite = state.website;

// Pre-fill website field
document.addEventListener('DOMContentLoaded', function() {
  const websiteInput = $('website');
  const emailInput = $('email');

  if (websiteInput && prefillWebsite) websiteInput.value = prefillWebsite;
  if (emailInput && prefillEmail) emailInput.value = prefillEmail;

  // Pre-select tier radio
  const tierRadio = document.querySelector(`input[name="tier"][value="${selectedTier}"]`);
  if (tierRadio) tierRadio.checked = true;

  // Track funnel start
  track(prefillEmail, 'funnel:request-start:' + selectedTier);
});

// Form submission
document.addEventListener('submit', function(e) {
  const form = e.target;
  if (!form.closest('.request-form')) return;
  e.preventDefault();

  const email = ($('email') && $('email').value.trim()) || '';
  const website = ($('website') && $('website').value.trim()) || '';
  if (!email) { $('email').focus(); return; }

  // Get selected tier from radio buttons
  const tierInput = document.querySelector('input[name="tier"]:checked');
  const tier = tierInput ? tierInput.value : 'deepdive';

  // Get role
  const roleInput = document.querySelector('input[name="role"]:checked');
  const role = roleInput ? roleInput.value : '';

  // Get trigger
  const triggerInput = document.querySelector('input[name="trigger"]:checked');
  const trigger = triggerInput ? triggerInput.value : '';

  // Build tracking details
  const details = [
    tier.toUpperCase(),
    'Profile: ' + [role, trigger].filter(Boolean).join('/'),
    'Website: ' + website,
  ].filter(Boolean).join(' // ');

  // Update button state
  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.textContent = 'Redirecting to checkout...';
    btn.disabled = true;
  }

  // Track
  const p = new URLSearchParams({ contact: email, pricing: details });
  fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(() => {});
  trackConversion();

  // Redirect to Stripe
  const stripeUrl = STRIPE[tier] || STRIPE.deepdive;
  setTimeout(function() {
    window.location.href = stripeUrl + '?prefilled_email=' + encodeURIComponent(email);
  }, 400);
});
