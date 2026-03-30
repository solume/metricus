import { $ } from './utils.js';
import { track } from './analytics.js';

function handleHeroSubmit(form) {
  const input = form.querySelector('input[type="text"]');
  const website = input.value.trim();
  if (!website) return;
  track(website, 'hero-url');
  try { sessionStorage.setItem('metricus_website', website); } catch (e) {}
  const pricing = document.getElementById('pricing');
  if (pricing) pricing.scrollIntoView({ behavior: 'smooth' });
}

function handleBuyTier(tier) {
  let website = '';
  try { website = sessionStorage.getItem('metricus_website') || ''; } catch (e) {}
  track(website, 'funnel:tier-click:' + tier);
  let url = 'get-report/?tier=' + tier;
  if (website) url += '&website=' + encodeURIComponent(website);
  window.location.href = url;
}

export function initForms() {
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('hero-form') || form.querySelector('.editorial-input')) {
      e.preventDefault();
      handleHeroSubmit(form);
    }
  });

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-action="buy-tier"]');
    if (btn) handleBuyTier(btn.getAttribute('data-tier'));
  });
}
