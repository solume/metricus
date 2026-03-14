/**
 * sticky.js — Sticky CTA bar visibility
 *
 * Exports: initSticky
 *
 * Uses IntersectionObserver on .hero-wrap to show/hide
 * the sticky CTA bar when the hero scrolls out of view.
 */

import { $ } from '../modules/utils.js';

export function initSticky() {
  var sticky = $('sticky-cta');
  if (!sticky) return;

  var heroWrap = document.querySelector('.hero-wrap');
  if (!heroWrap) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        sticky.classList.remove('visible');
      } else {
        sticky.classList.add('visible');
      }
    });
  }, { threshold: 0 });

  observer.observe(heroWrap);
}
