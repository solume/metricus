/**
 * ab-test.js — Variant resolution
 *
 * Exports: resolveVariant
 *
 * Reads ?uc= from URL and returns the matching content object.
 * Falls back to 'brand' if the key is unknown.
 */

import { state } from './state.js';

/**
 * Given the full UC_CONTENT map, resolve the active variant
 * and store it in shared state.
 * @param {Object} allContent — { brand, coding, data }
 * @returns {Object} — the resolved content object
 */
export function resolveVariant(allContent) {
  var content = allContent[state.uc] || allContent.brand;
  state.content = content;
  return content;
}
