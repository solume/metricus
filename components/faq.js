/**
 * faq.js — FAQ accordion
 *
 * Exports: initFaq
 *
 * FAQ items are pre-rendered in HTML. This module only
 * attaches the toggle click handler via event delegation.
 */

import { $ } from '../modules/utils.js';

export function initFaq() {
  var faqEl = $('uc-faq');
  if (!faqEl) return;

  // Delegated click handler for FAQ toggles
  faqEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.faq-q');
    if (btn) {
      btn.parentElement.classList.toggle('open');
    }
  });
}
