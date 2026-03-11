/**
 * faq.js — FAQ accordion
 *
 * Exports: initFaq
 *
 * Renders FAQ items from content and handles toggle
 * via event delegation (no inline onclick).
 */

import { $, h } from '../modules/utils.js';
import { state } from '../modules/state.js';
import { FEATURES } from '../modules/config.js';

export function initFaq() {
  var C = state.content;
  if (!FEATURES.faq || !C || !C.faq || !$('uc-faq')) return;

  // Render FAQ items (first item auto-open)
  h($('uc-faq'), C.faq.map(function (f, i) {
    var openClass = i === 0 ? ' open' : '';
    return '<div class="faq-item' + openClass + '">' +
      '<button class="faq-q">' + f.q + '</button>' +
      '<div class="faq-a"><div class="faq-a-inner">' + f.a + '</div></div>' +
      '</div>';
  }).join(''));

  // Delegated click handler for FAQ toggles
  $('uc-faq').addEventListener('click', function (e) {
    var btn = e.target.closest('.faq-q');
    if (btn) {
      btn.parentElement.classList.toggle('open');
    }
  });
}
