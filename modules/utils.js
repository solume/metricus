/**
 * utils.js — DOM helper functions
 *
 * Exports: $, h, t
 *
 * $ — getElementById shorthand
 * h — set innerHTML safely
 * t — set textContent safely
 */

export function $(id) {
  return document.getElementById(id);
}

export function h(el, html) {
  if (el) el.innerHTML = html;
}

export function t(el, text) {
  if (el) el.textContent = text;
}
